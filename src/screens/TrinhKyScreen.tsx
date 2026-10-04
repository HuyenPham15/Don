// src/screens/TrinhKyScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Screen } from '../types';
import {
  SigningDocument,
  SigningStatus,
  DocumentType,
  SignerItem,
  SignerStatus,
  DocumentVersion,
  DetailedAuditLog,
} from '../types/signing';
import { INITIAL_LEADERS } from '../constants/signingData';

interface TrinhKyScreenProps {
  onNav: (s: Screen) => void;
  documents: SigningDocument[];
  onUpdateDocuments: (docs: SigningDocument[]) => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  isEmbedded?: boolean;
  onSwitchAccount?: (role: 'can_bo' | 'lanh_dao') => void;
  initialDocId?: string;
  onBackToKanban?: () => void;
}

export default function TrinhKyScreen({
  onNav,
  documents,
  onUpdateDocuments,
  onSelectHoSo,
  isEmbedded = false,
  onSwitchAccount,
  initialDocId,
  onBackToKanban,
}: TrinhKyScreenProps) {
  // Xác định văn bản đang thao tác
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    if (initialDocId) {
      const matched = documents.find((d) => d.id === initialDocId || d.hoSoCode === initialDocId);
      if (matched) return matched.id;
    }
    // Ưu tiên văn bản cần cán bộ xử lý: yêu cầu sửa, chờ trình, nháp
    const priorityDoc = documents.find(
      (d) =>
        d.status === 'yeu_cau_chinh_sua' ||
        d.status === 'cho_trinh' ||
        d.status === 'nhap'
    );
    return priorityDoc ? priorityDoc.id : documents[0]?.id || '';
  });

  useEffect(() => {
    if (initialDocId) {
      const matched = documents.find((d) => d.id === initialDocId || d.hoSoCode === initialDocId);
      if (matched) {
        setActiveDocId(matched.id);
      }
    }
  }, [initialDocId, documents]);

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || documents[0] || null;
  }, [documents, activeDocId]);

  // Form states cho văn bản đang chọn
  const [editSoKyHieu, setEditSoKyHieu] = useState<string>('');
  const [editTenVanBan, setEditTenVanBan] = useState<string>('');
  const [editYKien, setEditYKien] = useState<string>('');
  const [editNoiDung, setEditNoiDung] = useState<string>('');
  const [signersList, setSignersList] = useState<SignerItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Tabs giao diện
  const [activeTabLeft, setActiveTabLeft] = useState<'content' | 'versions' | 'audit'>('content');
  const [activeTabRight, setActiveTabRight] = useState<'preview' | 'attachments'>('preview');

  // Modal Xác nhận Trình ký và Soạn mới
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHoSoCode, setNewHoSoCode] = useState('Đ-2026-00125');
  const [newTenVanBan, setNewTenVanBan] = useState('');
  const [newLoaiVanBan, setNewLoaiVanBan] = useState<DocumentType>('to_trinh_thu_ly');
  const [newTrichYeu, setNewTrichYeu] = useState('');
  const [newLeaderId1, setNewLeaderId1] = useState('ld-01');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Đồng bộ form khi activeDoc thay đổi
  useEffect(() => {
    if (activeDoc) {
      setEditSoKyHieu(activeDoc.soKyHieu || `${activeDoc.id.replace('VB-2026-', '')}/TTr-TTTP`);
      setEditTenVanBan(activeDoc.tenVanBan);
      setEditYKien(activeDoc.yKienCanBo || '');
      setEditNoiDung(activeDoc.noiDungChiTiet);

      if (activeDoc.signers && activeDoc.signers.length > 0) {
        setSignersList([...activeDoc.signers]);
      } else {
        const initialSigner: SignerItem = {
          id: activeDoc.lanhDaoId || 'ld-01',
          name: activeDoc.lanhDaoName || 'Đ/c Trần Văn Hùng',
          chucVu: activeDoc.lanhDaoChucVu || 'Phó Chánh Thanh tra thành phố',
          coQuan: 'Thanh tra Thành phố',
          vaiTro: 'ky',
          thuTu: 1,
          status: activeDoc.status === 'da_ky' ? 'da_ky' : activeDoc.status === 'da_trinh' ? 'cho_ky' : 'chua_den_luot',
        };
        setSignersList([initialSigner]);
      }
      setValidationErrors([]);
    }
  }, [activeDoc?.id]);

  // Điều kiện để cán bộ có thể sửa văn bản và cấu hình người ký
  const canEdit =
    activeDoc &&
    (activeDoc.status === 'nhap' ||
      activeDoc.status === 'cho_trinh' ||
      activeDoc.status === 'yeu_cau_chinh_sua');

  // Kiểm tra điều kiện trước khi trình ký
  const validateBeforeTrinh = (doc: SigningDocument, sList: SignerItem[], noiDung: string): string[] => {
    const errors: string[] = [];
    if (!noiDung || noiDung.trim().length < 30) {
      errors.push('Nội dung văn bản còn quá ngắn hoặc chưa hoàn thiện (tối thiểu 30 ký tự).');
    }
    if (!sList || sList.length === 0) {
      errors.push('Văn bản cần ít nhất một Lãnh đạo có thẩm quyền phê duyệt/ký.');
    } else {
      const firstLeader = INITIAL_LEADERS.find((l) => l.id === sList[0].id);
      if (firstLeader && !firstLeader.thamQuyenKy.includes(doc.loaiVanBan)) {
        errors.push(`${firstLeader.name} (${firstLeader.chucVu}) không có thẩm quyền ký loại văn bản này.`);
      }
    }
    if (!doc.tepDinhKem || doc.tepDinhKem.length === 0) {
      errors.push('Văn bản chưa đính kèm tệp dự thảo (PDF/DOCX) hoặc tài liệu kiểm tra.');
    }
    return errors;
  };

  // Lưu nháp
  const handleSaveDraft = () => {
    if (!activeDoc) return;
    const updatedDocs = documents.map((d) => {
      if (d.id === activeDoc.id) {
        return {
          ...d,
          soKyHieu: editSoKyHieu,
          tenVanBan: editTenVanBan,
          noiDungChiTiet: editNoiDung,
          signers: signersList,
          yKienCanBo: editYKien,
        };
      }
      return d;
    });
    onUpdateDocuments(updatedDocs);
    showToast('✓ Đã lưu nháp văn bản và cấu hình người ký thành công!');
  };

  // Chuẩn bị trình ký
  const handlePreTrinhKy = () => {
    if (!activeDoc) return;
    const errors = validateBeforeTrinh(activeDoc, signersList, editNoiDung);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setActiveTabLeft('content');
      return;
    }
    setValidationErrors([]);
    setShowConfirmModal(true);
  };

  // Xác nhận trình ký tuần tự
  const handleConfirmTrinhKy = () => {
    if (!activeDoc) return;

    setIsSubmitting(true);
    setShowConfirmModal(false);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const isReSubmit = activeDoc.status === 'yeu_cau_chinh_sua';
      const prevVersion = activeDoc.phienBanHienTai || 'V1';
      const currentVersion = isReSubmit
        ? prevVersion === 'V1'
          ? 'V2'
          : prevVersion === 'V2'
          ? 'V3'
          : 'V4'
        : prevVersion;

      // Cập nhật trạng thái tuần tự cho signers:
      // Người thứ 1 -> 'cho_ky', các người sau -> 'chua_den_luot'
      const updatedSigners: SignerItem[] = signersList.map((s, index) => ({
        ...s,
        thuTu: index + 1,
        status: index === 0 ? ('cho_ky' as SignerStatus) : ('chua_den_luot' as SignerStatus),
        thoiGianKy: undefined,
        yKien: undefined,
        signatureCert: undefined,
        soSeri: undefined,
      }));

      const firstLeader = updatedSigners[0];

      const newAuditLogs: DetailedAuditLog[] = [
        {
          id: `al-${Date.now()}-1`,
          time: timeStr,
          actor: 'Nguyễn Minh Anh',
          actorRole: 'Cán bộ thụ lý',
          action: isReSubmit
            ? `Cập nhật phiên bản ${currentVersion} và trình ký lại tuần tự`
            : `Trình văn bản đến ${firstLeader.name} (${firstLeader.chucVu}) để ký`,
          statusBefore: activeDoc.status,
          statusAfter: 'da_trinh',
          version: currentVersion,
          note: editYKien
            ? `Kính trình ${firstLeader.name}: ${editYKien}`
            : `Trình duyệt bước 1 đến ${firstLeader.name}`,
        },
        {
          id: `al-${Date.now()}-2`,
          time: timeStr,
          actor: 'Hệ thống tự động',
          actorRole: 'Hệ thống',
          action: `Tạo nhiệm vụ ký bước 1 cho ${firstLeader.name}`,
          statusBefore: 'da_trinh',
          statusAfter: 'cho_ky',
          version: currentVersion,
          note: `Thời hạn xử lý: ${activeDoc.hanXuLy || '24 giờ'}`,
        },
      ];

      const newVersionEntry: DocumentVersion = {
        version: currentVersion,
        thoiGian: timeStr,
        nguoiTao: 'Nguyễn Minh Anh',
        trangThaiLucDo: 'Đã trình',
        ghiChu: isReSubmit
          ? `Chỉnh sửa nội dung theo chỉ đạo của Lãnh đạo, trình ký lại tuần tự từ bước 1`
          : `Khởi tạo và trình ký phiên bản ${currentVersion}`,
        noiDungSnapshot: editNoiDung.slice(0, 180) + '...',
      };

      const updatedHistory = [
        {
          id: `h-${Date.now()}`,
          time: timeStr,
          actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
          action: isReSubmit
            ? `Cán bộ cập nhật [${currentVersion}] và Trình ký lại`
            : `Cán bộ nhấn nút [TRÌNH LÃNH ĐẠO] phê duyệt`,
          note: `Trình bước 1 đến ${firstLeader.name} (${firstLeader.chucVu})`,
        },
        ...(activeDoc.history || []),
      ];

      const updatedDocs = documents.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            soKyHieu: editSoKyHieu,
            tenVanBan: editTenVanBan,
            status: 'da_trinh' as SigningStatus,
            noiDungChiTiet: editNoiDung,
            signers: updatedSigners,
            currentSignerIndex: 0,
            lanhDaoId: firstLeader.id,
            lanhDaoName: firstLeader.name,
            lanhDaoChucVu: firstLeader.chucVu,
            yKienCanBo: editYKien,
            thoiGianTrinh: timeStr,
            phienBanHienTai: currentVersion,
            versionHistory: [newVersionEntry, ...(d.versionHistory || [])],
            auditLogs: [...newAuditLogs, ...(d.auditLogs || [])],
            history: updatedHistory,
            stepId: 'STEP-04',
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setIsSubmitting(false);
      showToast(
        `✓ Đã trình văn bản ${activeDoc.id} (${currentVersion}) đến ${firstLeader.name} để ký! Nhiệm vụ đã được chuyển vào mục Chờ ký.`
      );
    }, 400);
  };

  // Tạo mới văn bản dự thảo
  const handleCreateNewDoc = () => {
    if (!newTenVanBan.trim()) {
      showToast('Vui lòng nhập tên văn bản trình ký.');
      return;
    }

    const leader1 = INITIAL_LEADERS.find((l) => l.id === newLeaderId1) || INITIAL_LEADERS[0];

    const initialSigners: SignerItem[] = [
      {
        id: leader1.id,
        name: leader1.name,
        chucVu: leader1.chucVu,
        coQuan: leader1.coQuan,
        vaiTro: 'ky',
        thuTu: 1,
        status: 'chua_den_luot',
      },
    ];

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newId = `VB-2026-${String(Math.floor(100 + Math.random() * 900))}`;

    const newDoc: SigningDocument = {
      id: newId,
      soKyHieu: `${newId.replace('VB-2026-', '')}/TTr-TTTP`,
      hoSoCode: newHoSoCode,
      tenVanBan: newTenVanBan,
      loaiVanBan: newLoaiVanBan,
      loaiVanBanLabel:
        newLoaiVanBan === 'to_trinh_thu_ly'
          ? 'Tờ trình đề xuất thụ lý'
          : newLoaiVanBan === 'quyet_dinh_thu_ly'
          ? 'Quyết định thụ lý tố cáo'
          : newLoaiVanBan === 'thong_bao_khong_thu_ly'
          ? 'Thông báo không thụ lý'
          : 'Văn bản thụ lý giải quyết',
      nguoiGuiDon: 'Công dân',
      loaiDon: 'Đơn đề xuất giải quyết',
      noiDungDon: newTrichYeu || newTenVanBan,
      nguoiLap: 'Nguyễn Minh Anh',
      donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
      ngayTao: timeStr,
      hanXuLy: '24 giờ',
      status: 'cho_trinh',
      phienBanHienTai: 'V1',
      trichYeu: newTrichYeu || newTenVanBan,
      noiDungChiTiet: `Kính gửi: Lãnh đạo Thanh tra Thành phố Hà Nội.\n\nCăn cứ quy định Luật Tiếp công dân, Luật Khiếu nại, Luật Tố cáo;\nCăn cứ hồ sơ vụ việc số ${newHoSoCode};\n\nCán bộ thụ lý kính đề xuất lãnh đạo phê duyệt văn bản:\n${newTenVanBan}\n\nKính trình Lãnh đạo xem xét, ký duyệt.`,
      lanhDaoId: leader1.id,
      lanhDaoName: leader1.name,
      lanhDaoChucVu: leader1.chucVu,
      signers: initialSigners,
      currentSignerIndex: 0,
      mucDoUuTien: 'thuong',
      tepDinhKem: [
        {
          id: `file-new-1`,
          tenTep: `Du_thao_${newId}.docx`,
          dungLuong: '2.1 MB',
          loai: 'du_thao',
        },
      ],
      versionHistory: [
        {
          version: 'V1',
          thoiGian: timeStr,
          nguoiTao: 'Nguyễn Minh Anh',
          trangThaiLucDo: 'Chờ trình',
          ghiChu: 'Khởi tạo văn bản dự thảo',
          noiDungSnapshot: newTrichYeu || newTenVanBan,
        },
      ],
      history: [
        {
          id: `h-${Date.now()}`,
          time: timeStr,
          actor: 'Nguyễn Minh Anh',
          action: 'Tạo mới văn bản trình ký',
        },
      ],
      auditLogs: [
        {
          id: `al-${Date.now()}`,
          time: timeStr,
          actor: 'Nguyễn Minh Anh',
          actorRole: 'Cán bộ thụ lý',
          action: 'Khởi tạo văn bản dự thảo',
          statusBefore: 'Khởi tạo',
          statusAfter: 'Chờ trình',
          version: 'V1',
          note: newTenVanBan,
        },
      ],
      stepId: 'STEP-03A',
    };

    onUpdateDocuments([newDoc, ...documents]);
    setActiveDocId(newDoc.id);
    setIsCreateModalOpen(false);
    showToast(`✓ Đã tạo thành công văn bản ${newDoc.id} ở trạng thái "Chờ trình ký"!`);
  };

  // Render badge trạng thái
  const renderStatusBadge = (status: SigningStatus) => {
    switch (status) {
      case 'nhap':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Bản nháp
          </span>
        );
      case 'cho_trinh':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[13px] text-blue-600">upload_file</span>
            Chờ trình ký
          </span>
        );
      case 'da_trinh':
      case 'cho_ky':
      case 'dang_ky':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {status === 'dang_ky' ? 'Đang ký tuần tự' : 'Đã trình / Chờ ký'}
          </span>
        );
      case 'yeu_cau_chinh_sua':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
            Yêu cầu chỉnh sửa
          </span>
        );
      case 'da_ky':
      case 'hoan_tat':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
            {status === 'hoan_tat' ? 'Hoàn tất' : 'Đã ký số'}
          </span>
        );
      case 'da_thu_hoi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="material-symbols-outlined text-[13px] text-zinc-500">undo</span>
            Đã thu hồi
          </span>
        );
      case 'tu_choi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-300">
            <span className="material-symbols-outlined text-[13px] text-zinc-500">cancel</span>
            Từ chối ký
          </span>
        );
      default:
        return null;
    }
  };

  if (!activeDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#f4f7fb]">
        <span className="material-symbols-outlined text-slate-300 text-[48px] mb-2">folder_off</span>
        <h3 className="text-base font-bold text-slate-700">Chưa có văn bản trình ký nào</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Tất cả công việc văn bản được quản lý từ mục Công việc của tôi.
        </p>
        <button
          type="button"
          onClick={() => (onBackToKanban ? onBackToKanban() : onNav('cong-viec'))}
          className="px-4 py-2 bg-[#004ac6] text-white text-xs font-bold rounded-xl"
        >
          Quay lại Công việc của tôi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f4f7fb] text-slate-800 overflow-hidden font-body-md">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. TOP BAR: ĐIỀU HƯỚNG & HÀNH ĐỘNG CÁN BỘ TRÌNH KÝ                     */}
      {/* ===================================================================== */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-3 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Cụm Điều hướng & Chọn văn bản */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => (onBackToKanban ? onBackToKanban() : onNav('cong-viec'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              title="Quay lại bảng Công việc của tôi"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Công việc của tôi</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">drive_file_move</span>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight font-headline-md">
                Trình ký văn bản
              </h1>

              {/* Bộ chọn văn bản nhanh nếu cán bộ có nhiều văn bản */}
              <div className="relative ml-1">
                <select
                  value={activeDoc.id}
                  onChange={(e) => setActiveDocId(e.target.value)}
                  className="pl-2.5 pr-8 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer max-w-[280px] truncate"
                  title="Chuyển đổi văn bản cần trình ký"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.id}] {d.tenVanBan} ({d.status === 'yeu_cau_chinh_sua' ? 'Yêu cầu sửa' : d.status === 'cho_trinh' ? 'Chờ trình' : d.status === 'da_trinh' ? 'Đã trình' : 'Đã ký'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút soạn thảo văn bản mới */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#004ac6] hover:bg-blue-50 cursor-pointer"
                title="Soạn thảo thêm văn bản trình ký"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
              </button>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-bold font-mono">
                {activeDoc.phienBanHienTai || 'V1'}
              </span>
              {renderStatusBadge(activeDoc.status)}
            </div>
          </div>

          {/* Cụm Thao tác Hành động */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Chuyển nhanh sang Lãnh đạo để demo nếu cần */}
            <button
              type="button"
              onClick={() => {
                if (onSwitchAccount) {
                  onSwitchAccount('lanh_dao');
                } else {
                  onNav('van-ban-cho-ky');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Chuyển sang góc nhìn Lãnh đạo để ký số"
            >
              <span className="material-symbols-outlined text-[15px] text-indigo-600">rate_review</span>
              <span className="hidden sm:inline">Bàn ký Lãnh đạo</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
              >
                Lưu nháp
              </button>
            )}

            {activeDoc.status === 'da_trinh' || activeDoc.status === 'cho_ky' || activeDoc.status === 'dang_ky' ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Đang chờ Lãnh đạo ký số</span>
              </div>
            ) : activeDoc.status === 'da_ky' || activeDoc.status === 'hoan_tat' ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>Đã hoàn tất ký số</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePreTrinhKy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
                <span>
                  {activeDoc.status === 'yeu_cau_chinh_sua' ? 'XÁC NHẬN TRÌNH KÝ LẠI (V2)' : 'TRÌNH LÃNH ĐẠO KÝ'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MAIN WORKSPACE: HAI CỘT ĐỐI XỨNG                                   */}
      {/* CỘT TRÁI: THÔNG TIN VĂN BẢN & LUỒNG KÝ TUẦN TỰ (45%)                  */}
      {/* CỘT PHẢI: XEM TRƯỚC VĂN BẢN A4 & TỆP ĐÍNH KÈM (55%)                   */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ==================== CỘT TRÁI: FORM VÀ CẤU HÌNH (5 CỘT) ==================== */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Cảnh báo nếu Lãnh đạo yêu cầu chỉnh sửa */}
          {activeDoc.status === 'yeu_cau_chinh_sua' && activeDoc.lyDoTraLai && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>LÃNH ĐẠO YÊU CẦU CHỈNH SỬA:</span>
              </div>
              <p className="text-xs leading-relaxed bg-white/90 p-2.5 rounded-lg border border-rose-200 font-medium">
                {activeDoc.lyDoTraLai}
              </p>
              <p className="text-[11px] text-rose-700 italic">
                * Quy tắc: Khi cán bộ chỉnh sửa xong và trình lại, hệ thống sẽ tự động khởi tạo phiên bản mới{' '}
                <strong>(V2)</strong> và chạy lại quy trình ký từ bước 1. Chữ ký trên phiên bản cũ không được giữ nguyên.
              </p>
            </div>
          )}

          {/* Tab Navigation bên trái */}
          <div className="flex items-center border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-4 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTabLeft('content')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTabLeft === 'content'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              <span>Thông tin &amp; Dự thảo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabLeft('versions')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTabLeft === 'versions'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Phiên bản ({activeDoc.versionHistory?.length || 1})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabLeft('audit')}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTabLeft === 'audit'
                  ? 'border-[#004ac6] text-[#004ac6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">manage_search</span>
              <span>Nhật ký</span>
            </button>
          </div>

          {/* TAB 1: THÔNG TIN VĂN BẢN & NỘI DUNG DỰ THẢO */}
          {activeTabLeft === 'content' && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
              {/* Lỗi validate nếu có */}
              {validationErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">error</span>
                    <span>Chưa đủ điều kiện trình ký:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11.5px]">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Thông tin văn bản */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#004ac6] text-[16px]">info</span>
                    Thông tin văn bản
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">Hồ sơ: {activeDoc.hoSoCode}</span>
                    {onSelectHoSo && (
                      <button
                        type="button"
                        onClick={() => onSelectHoSo(activeDoc.hoSoCode)}
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        <span>Mở</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-slate-500 block mb-1 font-semibold">Tên văn bản:</label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={editTenVanBan}
                      onChange={(e) => setEditTenVanBan(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-[#004ac6] disabled:bg-slate-100 disabled:text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Loại văn bản:</label>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium truncate">
                      {activeDoc.loaiVanBanLabel}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Số / Ký hiệu:</label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={editSoKyHieu}
                      onChange={(e) => setEditSoKyHieu(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#004ac6] disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Người lập:</label>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                      {activeDoc.nguoiLap}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Ngày lập:</label>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                      {activeDoc.ngayTao}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-slate-500 block mb-1 font-semibold">Lãnh đạo ký duyệt:</label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#004ac6]">person_check</span>
                        <span>{activeDoc.lanhDaoName} ({activeDoc.lanhDaoChucVu})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">Thanh tra Thành phố</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soạn thảo nội dung dự thảo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    Nội dung văn bản dự thảo:
                  </label>
                  {canEdit ? (
                    <span className="text-[11px] text-[#004ac6] font-semibold">✎ Được phép chỉnh sửa</span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      🔒 Đang trong quy trình ký - Khóa sửa nội dung
                    </span>
                  )}
                </div>
                <textarea
                  rows={9}
                  disabled={!canEdit}
                  value={editNoiDung}
                  onChange={(e) => setEditNoiDung(e.target.value)}
                  className={`w-full p-3 rounded-xl font-mono text-xs leading-relaxed border focus:outline-none transition-colors ${
                    canEdit
                      ? 'bg-white border-slate-300 focus:border-[#004ac6] text-slate-800 shadow-2xs'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Lời nhắn / Bút phê của cán bộ */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Ý kiến / Ghi chú của cán bộ trình ký:
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={editYKien}
                  onChange={(e) => setEditYKien(e.target.value)}
                  placeholder="Nhập nội dung vắn tắt kính trình lãnh đạo phê duyệt..."
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#004ac6] disabled:bg-slate-100"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LỊCH SỬ PHIÊN BẢN */}
          {activeTabLeft === 'versions' && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-purple-700 text-[18px]">history_edu</span>
                  <span>Quy tắc quản lý phiên bản:</span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Người ký sau không được sửa trực tiếp nội dung văn bản đã được người trước ký. Khi có yêu cầu
                  chỉnh sửa, Cán bộ hoàn thiện phiên bản mới và phải thực hiện lại quy trình ký từ đầu chuỗi.
                </p>
              </div>

              <div className="space-y-2.5">
                {(activeDoc.versionHistory || []).map((ver) => (
                  <div
                    key={ver.version}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      ver.version === activeDoc.phienBanHienTai
                        ? 'bg-purple-50/70 border-purple-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-200/80 text-purple-900 text-[11px]">
                          {ver.version}
                        </span>
                        {ver.version === activeDoc.phienBanHienTai && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-600 text-white">
                            Phiên bản hiện tại
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{ver.thoiGian}</span>
                    </div>
                    <div className="text-[11.5px] text-slate-800 font-medium">{ver.ghiChu}</div>
                    {ver.noiDungSnapshot && (
                      <p className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded border border-slate-200/70">
                        {ver.noiDungSnapshot}
                      </p>
                    )}
                    <div className="text-[10.5px] text-slate-400">Người tạo: {ver.nguoiTao}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NHẬT KÝ XỬ LÝ (AUDIT LOG) */}
          {activeTabLeft === 'audit' && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs">
                  Nhật ký sự kiện &amp; Toàn vẹn dữ liệu ({activeDoc.auditLogs?.length || activeDoc.history.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Bảo đảm tính pháp lý</span>
              </div>

              {activeDoc.auditLogs && activeDoc.auditLogs.length > 0 ? (
                <div className="space-y-2">
                  {activeDoc.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11.5px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900">{log.actor}</strong>
                          <span className="text-[10px] text-slate-500 font-normal">({log.actorRole})</span>
                          {log.version && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                              {log.version}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10.5px]">{log.time}</span>
                      </div>

                      <div className="text-slate-800 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]"></span>
                        <span>{log.action}</span>
                      </div>

                      {log.note && (
                        <div className="text-slate-600 bg-white p-2 rounded border border-slate-200/80 italic text-[11px]">
                          “{log.note}”
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {activeDoc.history.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-800">{log.actor}</span>
                        <span>{log.time}</span>
                      </div>
                      <div className="text-slate-700 font-medium">{log.action}</div>
                      {log.note && <div className="text-slate-500 italic">“{log.note}”</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== CỘT PHẢI: DOCUMENT VIEWER A4 (7 CỘT) ==================== */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTabRight('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTabRight === 'preview'
                    ? 'bg-white text-[#004ac6] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Xem trước văn bản (Preview A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTabRight('attachments')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTabRight === 'attachments'
                    ? 'bg-white text-[#004ac6] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">attachment</span>
                <span>Tài liệu đính kèm ({activeDoc.tepDinhKem.length})</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Chuẩn thể thức NĐ 30/2020/NĐ-CP • Phiên bản: <strong>{activeDoc.phienBanHienTai || 'V1'}</strong>
            </div>
          </div>

          {/* Xem trước văn bản định dạng A4 chuẩn */}
          {activeTabRight === 'preview' && (
            <div className="bg-white rounded-xl border border-slate-300 p-8 shadow-md text-slate-900 font-serif leading-relaxed text-xs space-y-5 relative min-h-[580px]">
              {/* Tiêu ngữ */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="text-center space-y-0.5">
                  <div className="font-bold text-[11px] uppercase tracking-wide">
                    THANH TRA THÀNH PHỐ
                  </div>
                  <div className="font-semibold text-[10px]">
                    PHÒNG TIẾP DÂN &amp; XỬ LÝ ĐƠN
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 font-sans">
                    Số: {editSoKyHieu || activeDoc.soKyHieu || '......./TTr-TTTP'}
                  </div>
                </div>

                <div className="text-center space-y-0.5">
                  <div className="font-bold text-[11px] uppercase">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="font-bold text-[11px] underline underline-offset-4">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="text-[10px] text-slate-500 italic pt-1 font-sans">
                    Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm{' '}
                    {new Date().getFullYear()}
                  </div>
                </div>
              </div>

              {/* Tiêu đề văn bản */}
              <div className="text-center pt-2 space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  {editTenVanBan || activeDoc.tenVanBan}
                </h2>
                <div className="text-[11px] font-sans italic text-slate-600">
                  {activeDoc.trichYeu}
                </div>
              </div>

              {/* Nội dung chi tiết */}
              <div className="font-sans text-[11.5px] leading-relaxed whitespace-pre-wrap text-slate-800 pt-2 min-h-[160px]">
                {editNoiDung || activeDoc.noiDungChiTiet}
              </div>

              {/* Khu vực chữ ký số tuần tự của các Lãnh đạo */}
              <div className="pt-8 flex justify-between items-end border-t border-slate-100 font-sans">
                <div className="text-[10.5px] text-slate-500 space-y-0.5">
                  <div className="font-bold text-slate-700">Nơi nhận:</div>
                  <div>- Như kính gửi;</div>
                  <div>- Người nộp đơn (để biết);</div>
                  <div>- Lưu: VT, HS ({activeDoc.hoSoCode}).</div>
                </div>

                <div className="flex items-end justify-end">
                  <div className="text-center space-y-1 min-w-[170px]">
                    <div className="font-bold text-[11px] uppercase text-slate-800">
                      {activeDoc.lanhDaoChucVu}
                    </div>
                    {activeDoc.status === 'da_ky' || activeDoc.status === 'hoan_tat' ? (
                      <div className="p-2.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-left text-[10px] shadow-2xs space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-emerald-800">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          <span>ĐÃ KÝ SỐ</span>
                        </div>
                        <div className="font-semibold text-slate-800 truncate">{activeDoc.lanhDaoName}</div>
                        <div className="text-[9px] text-emerald-700 font-mono">
                          {activeDoc.chuKyInfo?.thoiGianKy || activeDoc.signers?.[0]?.thoiGianKy || 'Đã chứng thực VGCA'}
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-[10px] italic bg-slate-50/50">
                        (Chờ Lãnh đạo ký số)
                      </div>
                    )}
                    <div className="font-bold text-[11px] text-slate-800 pt-0.5">{activeDoc.lanhDaoName}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Danh sách tài liệu đính kèm */}
          {activeTabRight === 'attachments' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 text-xs">
                Danh mục hồ sơ và tệp đính kèm theo văn bản trình:
              </h4>
              <div className="space-y-2">
                {activeDoc.tepDinhKem.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#004ac6] text-[22px]">
                        description
                      </span>
                      <div>
                        <strong className="text-slate-800 text-xs">{f.tenTep}</strong>
                        <div className="text-[11px] text-slate-400">
                          Dung lượng: {f.dungLuong} • Định dạng:{' '}
                          {f.loai === 'du_thao' ? 'Văn bản dự thảo' : 'Tài liệu kiểm tra'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(`Đang tải xuống tệp: ${f.tenTep}`)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      Tải xuống
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL XÁC NHẬN TRÌNH KÝ TUẦN TỰ                                    */}
      {/* ===================================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#004ac6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">send</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận trình ký văn bản</h3>
                <span className="text-[11px] text-slate-500 font-mono">{activeDoc.id}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Bạn có chắc chắn muốn trình văn bản này đến{' '}
              <strong className="text-slate-900">
                {activeDoc.lanhDaoName} ({activeDoc.lanhDaoChucVu})
              </strong>{' '}
              để xem xét và ký duyệt?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmTrinhKy}
                className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Xác nhận trình ký
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ===================================================================== */}
      {/* 5. MODAL TẠO VĂN BẢN TRÌNH KÝ MỚI                                     */}
      {/* ===================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[22px]">post_add</span>
                <h3 className="font-bold text-slate-900 text-sm">Soạn văn bản trình ký mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã hồ sơ / Số đơn:</label>
                  <input
                    type="text"
                    value={newHoSoCode}
                    onChange={(e) => setNewHoSoCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại văn bản:</label>
                  <select
                    value={newLoaiVanBan}
                    onChange={(e) => setNewLoaiVanBan(e.target.value as DocumentType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#004ac6] cursor-pointer"
                  >
                    <option value="to_trinh_thu_ly">Tờ trình đề xuất thụ lý</option>
                    <option value="quyet_dinh_thu_ly">Quyết định thụ lý tố cáo</option>
                    <option value="thong_bao_khong_thu_ly">Thông báo không thụ lý</option>
                    <option value="bien_ban_ban_giao">Biên bản bàn giao đơn</option>
                    <option value="van_ban_tra_lai">Văn bản trả lại đơn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên văn bản:</label>
                <input
                  type="text"
                  value={newTenVanBan}
                  onChange={(e) => setNewTenVanBan(e.target.value)}
                  placeholder="Ví dụ: Tờ trình đề xuất thụ lý giải quyết đơn tố cáo..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trích yếu nội dung:</label>
                <textarea
                  rows={2}
                  value={newTrichYeu}
                  onChange={(e) => setNewTrichYeu(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn nội dung văn bản..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lãnh đạo ký phê duyệt:</label>
                <select
                  value={newLeaderId1}
                  onChange={(e) => setNewLeaderId1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  {INITIAL_LEADERS.map((ld) => (
                    <option key={ld.id} value={ld.id}>
                      {ld.name} ({ld.chucVu})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleCreateNewDoc}
                className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Tạo văn bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
