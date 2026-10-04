// src/screens/VanBanChoKyScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Screen } from '../types';
import {
  SigningDocument,
  SigningStatus,
  DocumentType,
  SignerItem,
  SignerStatus,
  DetailedAuditLog,
  CurrentUserAccount,
  DEMO_ACCOUNTS,
} from '../types/signing';

interface VanBanChoKyScreenProps {
  onNav: (s: Screen) => void;
  documents: SigningDocument[];
  onUpdateDocuments: (docs: SigningDocument[]) => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  isEmbedded?: boolean;
  onSwitchAccount?: (role: 'can_bo' | 'lanh_dao') => void;
  initialDocId?: string;
  onBackToKanban?: () => void;
  currentAccount?: CurrentUserAccount;
}

export default function VanBanChoKyScreen({
  onNav,
  documents,
  onUpdateDocuments,
  onSelectHoSo,
  isEmbedded = false,
  onSwitchAccount,
  initialDocId,
  onBackToKanban,
  currentAccount,
}: VanBanChoKyScreenProps) {
  // Lọc và Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [loaiVanBanFilter, setLoaiVanBanFilter] = useState<string>('all');
  const [canBoFilter, setCanBoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'newest'>('priority');

  // Văn bản đang được mở chi tiết để ký
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    if (initialDocId) {
      const matched = documents.find((d) => d.id === initialDocId || d.hoSoCode === initialDocId);
      if (matched) return matched.id;
    }
    const firstPending = documents.find(
      (d) => d.status === 'da_trinh' || d.status === 'cho_ky' || d.status === 'dang_ky'
    );
    return firstPending ? firstPending.id : documents[0]?.id || '';
  });

  useEffect(() => {
    if (initialDocId) {
      const matched = documents.find((d) => d.id === initialDocId || d.hoSoCode === initialDocId);
      if (matched) {
        setActiveDocId(matched.id);
      }
    }
  }, [initialDocId, documents]);

  const [activeTabLeft, setActiveTabLeft] = useState<'preview' | 'attachments'>('preview');
  const [rightPanelTab, setRightPanelTab] = useState<'timeline' | 'action' | 'versions' | 'audit'>('timeline');
  const [leaderOpinion, setLeaderOpinion] = useState<string>('');
  const [signatureMethod, setSignatureMethod] = useState<'vgca' | 'usb_token' | 'smart_ca'>('vgca');

  // Modal xác nhận thao tác
  const [confirmModalType, setConfirmModalType] = useState<'sign' | 'return' | 'reject' | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Thống kê dành cho Lãnh đạo
  const stats = useMemo(() => {
    const choKy = documents.filter(
      (d) => d.status === 'da_trinh' || d.status === 'cho_ky' || d.status === 'dang_ky'
    ).length;
    const khan = documents.filter(
      (d) =>
        (d.status === 'da_trinh' || d.status === 'cho_ky' || d.status === 'dang_ky') &&
        (d.mucDoUuTien === 'khan' || d.mucDoUuTien === 'hoa_toc')
    ).length;
    const daKy = documents.filter((d) => d.status === 'da_ky' || d.status === 'hoan_tat').length;
    const daYeuCauSua = documents.filter((d) => d.status === 'yeu_cau_chinh_sua').length;
    return { choKy, khan, daKy, daYeuCauSua };
  }, [documents]);

  // Danh sách cán bộ trình
  const uniqueCanBoList = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.nguoiTrinh) set.add(d.nguoiTrinh);
    });
    return Array.from(set);
  }, [documents]);

  // Lọc và Sắp xếp danh sách
  const filteredAndSortedDocs = useMemo(() => {
    let result = documents.filter((d) => {
      const matchSearch =
        d.hoSoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.soKyHieu || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tenVanBan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nguoiGuiDon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.nguoiTrinh || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchLoaiVB = loaiVanBanFilter === 'all' || d.loaiVanBan === loaiVanBanFilter;
      const matchCanBo = canBoFilter === 'all' || d.nguoiTrinh === canBoFilter;
      const matchStatus =
        statusFilter === 'all' ||
        d.status === statusFilter ||
        (statusFilter === 'da_trinh' && (d.status === 'cho_ky' || d.status === 'dang_ky'));

      return matchSearch && matchLoaiVB && matchCanBo && matchStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const pWeight = { hoa_toc: 3, khan: 2, thuong: 1 };
        const wA = pWeight[a.mucDoUuTien] || 1;
        const wB = pWeight[b.mucDoUuTien] || 1;
        if (wA !== wB) return wB - wA;
        return a.status === 'da_trinh' || a.status === 'cho_ky' || a.status === 'dang_ky' ? -1 : 1;
      }
      if (sortBy === 'deadline') {
        return (a.hanXuLy || '').localeCompare(b.hanXuLy || '');
      }
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [documents, searchTerm, loaiVanBanFilter, canBoFilter, statusFilter, sortBy]);

  // Văn bản đang chọn
  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || filteredAndSortedDocs[0] || null;
  }, [documents, activeDocId, filteredAndSortedDocs]);

  // Người đang đến lượt ký trong quy trình tuần tự
  const currentSignerIndex = activeDoc ? activeDoc.currentSignerIndex || 0 : 0;
  const currentSigner: SignerItem | undefined = activeDoc?.signers?.[currentSignerIndex];
  const isDocumentCompleted = activeDoc?.status === 'hoan_tat' || activeDoc?.status === 'da_ky';
  const isDocumentRejected = activeDoc?.status === 'yeu_cau_chinh_sua' || activeDoc?.status === 'tu_choi';

  // Người ký trước đó (nếu bước hiện tại > 0)
  const previousSigner: SignerItem | undefined =
    activeDoc && currentSignerIndex > 0 ? activeDoc.signers?.[currentSignerIndex - 1] : undefined;

  // Kiểm tra quyền ký của người dùng hiện tại
  // Nếu có currentAccount: kiểm tra trùng tên hoặc cho phép nếu vai trò là lanh_dao
  const isUserTurnToSign = useMemo(() => {
    if (!activeDoc || isDocumentCompleted || isDocumentRejected) return false;
    if (!currentSigner) return true;
    if (currentAccount) {
      if (currentAccount.role !== 'lanh_dao') return false;
      // Trùng tên hoặc trùng ID hoặc là demo leader
      return (
        currentAccount.name.includes(currentSigner.name.replace('Đ/c ', '')) ||
        currentSigner.name.includes(currentAccount.shortName) ||
        true // Cho phép Lãnh đạo thực hiện ký để thuận tiện demo quy trình tuần tự
      );
    }
    return true;
  }, [activeDoc, currentSigner, currentAccount, isDocumentCompleted, isDocumentRejected]);

  // XỬ LÝ 1: LÃNH ĐẠO KÝ SỐ THÀNH CÔNG (TUẦN TỰ)
  const handleExecuteSign = () => {
    if (!activeDoc || !currentSigner) return;

    setIsProcessing(true);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const certName =
        signatureMethod === 'vgca'
          ? 'Chữ ký số chuyên dùng công vụ - VGCA (Ban Cơ yếu CP)'
          : signatureMethod === 'usb_token'
          ? 'USB Token Viettel-CA cá nhân'
          : 'VNPT SmartCA / VNeID Cấp 2';

      const certSeri =
        signatureMethod === 'vgca'
          ? '54 02 1A BC 89 22 FE 09'
          : signatureMethod === 'usb_token'
          ? '78 99 BB CC 11 44 22'
          : 'SM-8899-CA-2026';

      // Cập nhật người ký hiện tại thành 'da_ky'
      const updatedSigners = [...(activeDoc.signers || [])];
      updatedSigners[currentSignerIndex] = {
        ...updatedSigners[currentSignerIndex],
        status: 'da_ky' as SignerStatus,
        thoiGianKy: timeStr,
        yKien: leaderOpinion.trim() || 'Đồng ý dự thảo văn bản',
        signatureCert: certName,
        soSeri: certSeri,
      };

      const hasNextSigner = currentSignerIndex + 1 < updatedSigners.length;
      let nextSignerIndex = currentSignerIndex;
      let nextOverallStatus: SigningStatus = 'da_ky';
      let nextLeaderId = activeDoc.lanhDaoId;
      let nextLeaderName = activeDoc.lanhDaoName;
      let nextLeaderChucVu = activeDoc.lanhDaoChucVu;

      const newAuditLogs: DetailedAuditLog[] = [
        {
          id: `al-${Date.now()}-1`,
          time: timeStr,
          actor: currentSigner.name,
          actorRole: `${currentSigner.chucVu} (Bước ${currentSignerIndex + 1}/${updatedSigners.length})`,
          action: `Ký số thành công bằng ${certName}`,
          statusBefore: 'cho_ky',
          statusAfter: 'da_ky',
          version: activeDoc.phienBanHienTai || 'V1',
          note: leaderOpinion.trim() || 'Đồng ý phê duyệt văn bản',
          signatureCert: certName,
        },
      ];

      if (hasNextSigner) {
        // Chuyển sang người tiếp theo
        nextSignerIndex = currentSignerIndex + 1;
        updatedSigners[nextSignerIndex] = {
          ...updatedSigners[nextSignerIndex],
          status: 'cho_ky' as SignerStatus,
        };
        nextOverallStatus = 'dang_ky';
        nextLeaderId = updatedSigners[nextSignerIndex].id;
        nextLeaderName = updatedSigners[nextSignerIndex].name;
        nextLeaderChucVu = updatedSigners[nextSignerIndex].chucVu;

        newAuditLogs.push({
          id: `al-${Date.now()}-2`,
          time: timeStr,
          actor: 'Hệ thống tự động',
          actorRole: 'Hệ thống',
          action: `Chuyển nhiệm vụ ký sang ${nextLeaderName} (${nextLeaderChucVu})`,
          statusBefore: 'dang_ky',
          statusAfter: 'cho_ky',
          version: activeDoc.phienBanHienTai || 'V1',
          note: `Bước ${nextSignerIndex + 1}/${updatedSigners.length}`,
        });
      } else {
        // Đã là người ký cuối cùng -> Hoàn tất!
        nextOverallStatus = 'hoan_tat';
        newAuditLogs.push({
          id: `al-${Date.now()}-2`,
          time: timeStr,
          actor: 'Hệ thống tự động',
          actorRole: 'Hệ thống',
          action: 'Hoàn tất toàn bộ quy trình ký tuần tự',
          statusBefore: 'dang_ky',
          statusAfter: 'hoan_tat',
          version: activeDoc.phienBanHienTai || 'V1',
          note: 'Văn bản đủ điều kiện cấp số văn thư và phát hành chính thức.',
        });
      }

      const updatedHistory = [
        {
          id: `h-${Date.now()}`,
          time: timeStr,
          actor: currentSigner.name,
          action: hasNextSigner
            ? `Đã ký số bước ${currentSignerIndex + 1} & chuyển sang ${nextLeaderName}`
            : 'Ký số hoàn tất toàn bộ quy trình',
          note: leaderOpinion.trim() ? `Ý kiến: ${leaderOpinion}` : 'Đồng ý dự thảo',
          signatureCert: `${certName} • Seri: ${certSeri}`,
        },
        ...(activeDoc.history || []),
      ];

      const updatedDocs = documents.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            status: nextOverallStatus,
            signers: updatedSigners,
            currentSignerIndex: nextSignerIndex,
            lanhDaoId: nextLeaderId,
            lanhDaoName: nextLeaderName,
            lanhDaoChucVu: nextLeaderChucVu,
            chuKyInfo: {
              nguoiKy: currentSigner.name.replace('Đ/c ', ''),
              chucVu: currentSigner.chucVu,
              coQuan: currentSigner.coQuan || 'Thanh tra Thành phố',
              thoiGianKy: timeStr,
              loaiChungThu: certName,
              soSeri: certSeri,
              yKienLanhDao: leaderOpinion.trim(),
            },
            auditLogs: [...newAuditLogs, ...(d.auditLogs || [])],
            history: updatedHistory,
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setIsProcessing(false);
      setConfirmModalType(null);
      setLeaderOpinion('');

      if (hasNextSigner) {
        showToast(
          `✓ ${currentSigner.name} đã ký thành công! Hệ thống đã tự động chuyển nhiệm vụ sang ${nextLeaderName}.`
        );
      } else {
        showToast(`✓ Tất cả lãnh đạo đã ký xong! Văn bản ${activeDoc.id} đã hoàn tất toàn bộ quy trình.`);
      }
    }, 450);
  };

  // XỬ LÝ 2: YÊU CẦU CHỈNH SỬA VĂN BẢN
  const handleExecuteReturn = () => {
    if (!actionReason.trim()) {
      setActionError('Vui lòng nhập lý do cụ thể yêu cầu cán bộ chỉnh sửa văn bản.');
      return;
    }
    if (!activeDoc || !currentSigner) return;

    setIsProcessing(true);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Cập nhật người yêu cầu sửa
      const updatedSigners = [...(activeDoc.signers || [])];
      updatedSigners[currentSignerIndex] = {
        ...updatedSigners[currentSignerIndex],
        status: 'tra_lai' as SignerStatus,
        thoiGianKy: timeStr,
        yKien: actionReason.trim(),
      };

      const auditEntry: DetailedAuditLog = {
        id: `al-${Date.now()}`,
        time: timeStr,
        actor: currentSigner.name,
        actorRole: currentSigner.chucVu,
        action: 'Yêu cầu chỉnh sửa văn bản',
        statusBefore: activeDoc.status,
        statusAfter: 'yeu_cau_chinh_sua',
        version: activeDoc.phienBanHienTai || 'V1',
        note: actionReason.trim(),
      };

      const updatedHistory = [
        {
          id: `h-${Date.now()}`,
          time: timeStr,
          actor: currentSigner.name,
          action: 'Yêu cầu cán bộ chỉnh sửa văn bản',
          note: actionReason.trim(),
        },
        ...(activeDoc.history || []),
      ];

      const updatedDocs = documents.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            status: 'yeu_cau_chinh_sua' as SigningStatus,
            lyDoTraLai: actionReason.trim(),
            signers: updatedSigners,
            auditLogs: [auditEntry, ...(d.auditLogs || [])],
            history: updatedHistory,
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setIsProcessing(false);
      setConfirmModalType(null);
      setActionReason('');
      setActionError(null);
      showToast(
        `✓ Đã trả lại văn bản ${activeDoc.id} cho cán bộ ${activeDoc.nguoiTrinh || 'thụ lý'} để chỉnh sửa.`
      );
    }, 400);
  };

  // XỬ LÝ 3: TỪ CHỐI KÝ VĂN BẢN
  const handleExecuteReject = () => {
    if (!actionReason.trim()) {
      setActionError('Vui lòng nhập lý do từ chối ký văn bản.');
      return;
    }
    if (!activeDoc || !currentSigner) return;

    setIsProcessing(true);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updatedSigners = [...(activeDoc.signers || [])];
      updatedSigners[currentSignerIndex] = {
        ...updatedSigners[currentSignerIndex],
        status: 'tu_choi' as SignerStatus,
        thoiGianKy: timeStr,
        yKien: actionReason.trim(),
      };

      const auditEntry: DetailedAuditLog = {
        id: `al-${Date.now()}`,
        time: timeStr,
        actor: currentSigner.name,
        actorRole: currentSigner.chucVu,
        action: 'Từ chối ký văn bản',
        statusBefore: activeDoc.status,
        statusAfter: 'tu_choi',
        version: activeDoc.phienBanHienTai || 'V1',
        note: actionReason.trim(),
      };

      const updatedDocs = documents.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            status: 'tu_choi' as SigningStatus,
            lyDoTuChoi: actionReason.trim(),
            signers: updatedSigners,
            auditLogs: [auditEntry, ...(d.auditLogs || [])],
            history: [
              {
                id: `h-${Date.now()}`,
                time: timeStr,
                actor: currentSigner.name,
                action: 'Từ chối ký văn bản',
                note: actionReason.trim(),
              },
              ...(d.history || []),
            ],
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setIsProcessing(false);
      setConfirmModalType(null);
      setActionReason('');
      setActionError(null);
      showToast(`✕ Lãnh đạo đã từ chối ký văn bản ${activeDoc.id}.`);
    }, 400);
  };

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
      {/* 1. HEADER CHÍNH NẾU ĐỘC LẬP (!isEmbedded)                             */}
      {/* ===================================================================== */}
      {!isEmbedded && (
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNav('cong-viec')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Công việc của tôi</span>
            </button>
            <div className="h-5 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">draw</span>
              <h1 className="text-sm font-bold text-slate-900">Bàn ký duyệt văn bản chi tiết</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Luồng ký tuần tự
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {stats.choKy} chờ ký
            </span>
            {stats.khan > 0 && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                {stats.khan} khẩn / hỏa tốc
              </span>
            )}
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stats.daKy} hoàn tất
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. BODY SPLIT WORKSPACE: DANH SÁCH BÊN TRÁI + CHI TIẾT KÝ BÊN PHẢI   */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* ==================== CỘT TRÁI: DANH SÁCH VĂN BẢN (40%) ==================== */}
        <div className="w-full lg:w-[410px] xl:w-[440px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
          {/* Search & Filters */}
          <div className="p-3.5 border-b border-slate-200 space-y-2 bg-slate-50/60">
            {onBackToKanban && (
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={onBackToKanban}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer hover:underline"
                  title="Quay lại giao diện Kanban"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Quay lại Kanban</span>
                </button>
                <span className="text-[11px] font-medium text-slate-500 font-mono">
                  {filteredAndSortedDocs.length} văn bản
                </span>
              </div>
            )}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[17px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã đơn, số ký hiệu, tên văn bản..."
                className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={loaiVanBanFilter}
                onChange={(e) => setLoaiVanBanFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">Tất cả loại VB</option>
                <option value="to_trinh_thu_ly">Tờ trình đề xuất</option>
                <option value="quyet_dinh_thu_ly">Quyết định thụ lý</option>
                <option value="thong_bao_khong_thu_ly">Thông báo không thụ lý</option>
                <option value="bien_ban_ban_giao">Biên bản bàn giao</option>
              </select>

              <select
                value={canBoFilter}
                onChange={(e) => setCanBoFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">Tất cả cán bộ</option>
                {uniqueCanBoList.map((cb) => (
                  <option key={cb} value={cb}>
                    {cb}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
            {filteredAndSortedDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              const isWaiting =
                doc.status === 'da_trinh' || doc.status === 'cho_ky' || doc.status === 'dang_ky';
              const activeSigner = doc.signers?.[doc.currentSignerIndex || 0];
              const totalSigners = doc.signers?.length || 1;
              const currentStep = (doc.currentSignerIndex || 0) + 1;

              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocId(doc.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono font-bold text-indigo-700">{doc.id}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                        {doc.phienBanHienTai || 'V1'}
                      </span>
                      {doc.mucDoUuTien === 'khan' && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                          Khẩn
                        </span>
                      )}
                      {doc.mucDoUuTien === 'hoa_toc' && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[10px] font-bold">
                          Hỏa tốc
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">{doc.tenVanBan}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Trình bởi: {doc.nguoiTrinh || doc.nguoiLap}</span>
                    <span className="text-[10.5px] font-mono">{doc.thoiGianTrinh || doc.ngayTao}</span>
                  </div>

                  {/* Tiến trình ký tuần tự */}
                  {doc.signers && doc.signers.length > 0 && (
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">
                        Lượt {currentStep}/{totalSigners}: <strong>{activeSigner?.name}</strong>
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          doc.status === 'hoan_tat' || doc.status === 'da_ky'
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWaiting
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {doc.status === 'hoan_tat'
                          ? 'Hoàn tất'
                          : doc.status === 'da_ky'
                          ? 'Đã ký'
                          : doc.status === 'yeu_cau_chinh_sua'
                          ? 'Cần sửa'
                          : 'Đang chờ ký'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== CỘT PHẢI: DOCUMENT VIEWER + TIẾN TRÌNH KÝ TUẦN TỰ (60%) ==================== */}
        <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
          {activeDoc ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar Hành động */}
              <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    VĂN BẢN: {activeDoc.id}
                  </span>
                  {activeDoc.soKyHieu && (
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {activeDoc.soKyHieu}
                    </span>
                  )}
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Hồ sơ: <strong className="text-[#004ac6]">{activeDoc.hoSoCode}</strong>
                  </span>
                  {onSelectHoSo && (
                    <button
                      type="button"
                      onClick={() => onSelectHoSo(activeDoc.hoSoCode)}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer ml-1"
                      title="Xem hồ sơ gốc"
                    >
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      <span>Hồ sơ gốc</span>
                    </button>
                  )}
                </div>

                {/* Các nút hành động chính của Lãnh đạo */}
                <div className="flex items-center gap-2">
                  {isDocumentCompleted ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                        <span className="material-symbols-outlined text-[17px] text-emerald-600">verified</span>
                        <span>Đã hoàn tất quy trình ký số</span>
                      </span>
                    </div>
                  ) : isDocumentRejected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold">
                      <span className="material-symbols-outlined text-[17px] text-rose-600">warning</span>
                      <span>Đang chờ cán bộ chỉnh sửa (Phiên bản tiếp theo)</span>
                    </span>
                  ) : isUserTurnToSign ? (
                    <>
                      {/* Từ chối */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionReason('');
                          setActionError(null);
                          setConfirmModalType('reject');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Từ chối ký văn bản"
                      >
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        <span>Từ chối</span>
                      </button>

                      {/* Trả lại chỉnh sửa */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionReason('');
                          setActionError(null);
                          setConfirmModalType('return');
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                        title="Yêu cầu cán bộ chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-700">replay</span>
                        <span>Yêu cầu chỉnh sửa</span>
                      </button>

                      {/* Ký văn bản */}
                      <button
                        type="button"
                        onClick={() => setConfirmModalType('sign')}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">draw</span>
                        <span>KÝ VĂN BẢN (KÝ SỐ)</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">lock</span>
                      <span>
                        Chưa đến lượt hoặc đang chờ:{' '}
                        <strong>{currentSigner?.name || 'Lãnh đạo khác'}</strong> ký
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace Split: Trái: Document Viewer A4 (7 cột) | Phải: Timeline & Chi tiết (5 cột) */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* ==================== CỘT TRÁI: DOCUMENT VIEWER (7 cột) ==================== */}
                <div className="xl:col-span-7 flex flex-col space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTabLeft('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          activeTabLeft === 'preview'
                            ? 'bg-white text-[#004ac6] shadow-2xs border border-slate-200'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Xem trước văn bản (Preview)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTabLeft('attachments')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          activeTabLeft === 'attachments'
                            ? 'bg-white text-[#004ac6] shadow-2xs border border-slate-200'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">attachment</span>
                        <span>Tài liệu đính kèm ({activeDoc.tepDinhKem.length})</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Phiên bản: <strong>{activeDoc.phienBanHienTai || 'V1'}</strong> • Chuẩn NĐ 30/2020
                    </div>
                  </div>

                  {/* Viewer A4 Preview */}
                  {activeTabLeft === 'preview' && (
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
                            Số: {activeDoc.soKyHieu || '......./TTr-TTTP'}
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
                          {activeDoc.tenVanBan}
                        </h2>
                        <div className="text-[11px] font-sans italic text-slate-600">
                          {activeDoc.trichYeu}
                        </div>
                      </div>

                      {/* Nội dung chi tiết */}
                      <div className="font-sans text-[11.5px] leading-relaxed whitespace-pre-wrap text-slate-800 pt-2">
                        {activeDoc.noiDungChiTiet}
                      </div>

                      {/* Khu vực các Chữ ký số điện tử của toàn bộ chuỗi ký */}
                      <div className="pt-8 flex justify-between items-end border-t border-slate-100 font-sans">
                        <div className="text-[10.5px] text-slate-500 space-y-0.5">
                          <div className="font-bold text-slate-700">Nơi nhận:</div>
                          <div>- Như kính gửi;</div>
                          <div>- Người nộp đơn (để biết);</div>
                          <div>- Lưu: VT, HS.</div>
                        </div>

                        {/* Danh sách chữ ký đã ký */}
                        <div className="flex items-end gap-3 flex-wrap justify-end">
                          {activeDoc.signers && activeDoc.signers.length > 0 ? (
                            activeDoc.signers.map((s) => (
                              <div key={s.id} className="text-center space-y-1 min-w-[150px]">
                                <div className="font-bold text-[11px] uppercase text-slate-800">
                                  {s.chucVu}
                                </div>
                                {s.status === 'da_ky' ? (
                                  <div className="p-2 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-left text-[10px] shadow-2xs space-y-0.5">
                                    <div className="flex items-center gap-1 font-bold text-emerald-800">
                                      <span className="material-symbols-outlined text-[14px]">verified</span>
                                      <span>ĐÃ KÝ SỐ</span>
                                    </div>
                                    <div className="font-semibold text-slate-800 truncate">{s.name}</div>
                                    <div className="text-[9px] text-emerald-700 font-mono">
                                      {s.thoiGianKy}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-16 flex items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-[10px] italic bg-slate-50/50">
                                    ({s.status === 'cho_ky' ? 'Đang chờ ký' : 'Chưa đến lượt'})
                                  </div>
                                )}
                                <div className="font-bold text-[11px] text-slate-800 pt-0.5">{s.name}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center space-y-1 min-w-[160px]">
                              <div className="font-bold text-xs uppercase text-slate-800">
                                {activeDoc.lanhDaoChucVu}
                              </div>
                              <div className="h-16 flex items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-[10px] italic">
                                (Chờ Lãnh đạo ký số)
                              </div>
                              <div className="font-bold text-xs text-slate-800">{activeDoc.lanhDaoName}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Danh sách tài liệu đính kèm */}
                  {activeTabLeft === 'attachments' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
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
                              <span className="material-symbols-outlined text-indigo-600 text-[22px]">
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

                {/* ==================== CỘT PHẢI: TIẾN TRÌNH KÝ & THAO TÁC (5 cột) ==================== */}
                <div className="xl:col-span-5 space-y-4">
                  {/* Tabs của Panel Bên Phải */}
                  <div className="flex items-center border-b border-slate-200 bg-white rounded-t-xl px-3 pt-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRightPanelTab('timeline')}
                      className={`pb-2.5 px-2 border-b-2 flex items-center gap-1 cursor-pointer ${
                        rightPanelTab === 'timeline'
                          ? 'border-indigo-600 text-indigo-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">account_tree</span>
                      <span>Tiến trình ký</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRightPanelTab('action')}
                      className={`pb-2.5 px-2 border-b-2 flex items-center gap-1 cursor-pointer ${
                        rightPanelTab === 'action'
                          ? 'border-indigo-600 text-indigo-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">draw</span>
                      <span>Khu vực ký</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRightPanelTab('versions')}
                      className={`pb-2.5 px-2 border-b-2 flex items-center gap-1 cursor-pointer ${
                        rightPanelTab === 'versions'
                          ? 'border-indigo-600 text-indigo-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      <span>Phiên bản ({activeDoc.phienBanHienTai || 'V1'})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRightPanelTab('audit')}
                      className={`pb-2.5 px-2 border-b-2 flex items-center gap-1 cursor-pointer ${
                        rightPanelTab === 'audit'
                          ? 'border-indigo-600 text-indigo-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">history_edu</span>
                      <span>Audit Log</span>
                    </button>
                  </div>

                  {/* TAB 1: TIẾN TRÌNH KÝ TUẦN TỰ (SIGNING TIMELINE THEO ĐÚNG YÊU CẦU) */}
                  {rightPanelTab === 'timeline' && (
                    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4.5 shadow-2xs space-y-4 text-xs">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-indigo-600 text-[18px]">alt_route</span>
                          Tiến trình ký phê duyệt tuần tự
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tự động chuyển tiếp khi người có thẩm quyền ký thành công.
                        </p>
                      </div>

                      {/* Timeline hiển thị theo đúng format user yêu cầu:
                          Cán bộ trình
                            ↓
                          ✓ Lãnh đạo A - Đã ký
                            ↓
                          ● Lãnh đạo B - Đang chờ ký
                            ↓
                          ○ Lãnh đạo C - Chưa đến lượt
                      */}
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {/* 0. Cán bộ trình */}
                        <div className="relative">
                          <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            <span className="material-symbols-outlined text-[13px]">person</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              Cán bộ trình: {activeDoc.nguoiTrinh || activeDoc.nguoiLap}
                            </div>
                            <div className="text-[11px] text-slate-500">{activeDoc.thoiGianTrinh || activeDoc.ngayTao}</div>
                            {activeDoc.yKienCanBo && (
                              <div className="mt-1 p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900 text-[11px] italic">
                                “{activeDoc.yKienCanBo}”
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Danh sách các lãnh đạo ký */}
                        {(activeDoc.signers || []).map((signer, idx) => {
                          const isDone = signer.status === 'da_ky';
                          const isCurrent =
                            idx === currentSignerIndex &&
                            (activeDoc.status === 'da_trinh' ||
                              activeDoc.status === 'cho_ky' ||
                              activeDoc.status === 'dang_ky');
                          const isRejected = signer.status === 'tra_lai' || signer.status === 'tu_choi';

                          return (
                            <div key={signer.id + idx} className="relative">
                              {/* Dot icon */}
                              <div
                                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : isCurrent
                                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                                    : isRejected
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-white border-2 border-slate-300 text-slate-400'
                                }`}
                              >
                                {isDone ? (
                                  <span className="material-symbols-outlined text-[13px]">check</span>
                                ) : isRejected ? (
                                  <span className="material-symbols-outlined text-[13px]">close</span>
                                ) : isCurrent ? (
                                  <span>●</span>
                                ) : (
                                  <span>○</span>
                                )}
                              </div>

                              <div
                                className={`p-3 rounded-xl border ${
                                  isCurrent
                                    ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                                    : isDone
                                    ? 'bg-emerald-50/40 border-emerald-200'
                                    : isRejected
                                    ? 'bg-rose-50/50 border-rose-200'
                                    : 'bg-slate-50 border-slate-200/80'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 flex-wrap">
                                  <div className="font-bold text-slate-900 text-xs">
                                    {isDone && <span className="text-emerald-700 font-bold mr-1">✓</span>}
                                    {isCurrent && <span className="text-amber-700 font-bold mr-1">●</span>}
                                    {!isDone && !isCurrent && !isRejected && (
                                      <span className="text-slate-400 mr-1">○</span>
                                    )}
                                    {signer.name}
                                  </div>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      isDone
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isCurrent
                                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                                        : isRejected
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {isDone
                                      ? 'Đã ký'
                                      : isCurrent
                                      ? 'Đang chờ ký'
                                      : isRejected
                                      ? 'Yêu cầu sửa'
                                      : 'Chưa đến lượt'}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {signer.chucVu} • Vai trò:{' '}
                                  <span className="font-semibold text-slate-700">
                                    {signer.vaiTro === 'ky'
                                      ? 'Ký chính'
                                      : signer.vaiTro === 'duyet'
                                      ? 'Duyệt'
                                      : 'Cho ý kiến'}
                                  </span>
                                </div>

                                {isDone && signer.thoiGianKy && (
                                  <div className="text-[10px] text-emerald-700 font-mono mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                    <span>Đã ký lúc: {signer.thoiGianKy}</span>
                                  </div>
                                )}

                                {signer.yKien && (
                                  <div className="mt-1 p-2 rounded-lg bg-white/80 border border-slate-200 text-slate-700 text-[11px] italic">
                                    “{signer.yKien}”
                                  </div>
                                )}

                                {isCurrent && (
                                  <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
                                    <span className="text-amber-900 font-semibold">
                                      Nhiệm vụ đang ở bàn Lãnh đạo
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setRightPanelTab('action')}
                                      className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10.5px] cursor-pointer hover:bg-amber-700"
                                    >
                                      Mở form ký
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Người ký trước */}
                      {previousSigner && (
                        <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] space-y-0.5">
                          <span className="text-slate-400 block">Người ký trước:</span>
                          <div className="font-bold text-slate-800">
                            {previousSigner.name} ({previousSigner.chucVu})
                          </div>
                          {previousSigner.thoiGianKy && (
                            <div className="text-slate-500 font-mono">
                              Ký lúc: {previousSigner.thoiGianKy} • {previousSigner.yKien}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: KHU VỰC KÝ (ACTION & CẤU HÌNH KÝ SỐ) */}
                  {rightPanelTab === 'action' && (
                    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4.5 shadow-2xs space-y-4 text-xs">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-indigo-700 text-[18px]">draw</span>
                          Khu vực ký &amp; Phê duyệt của Lãnh đạo
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Bước hiện tại: <strong>{currentSigner?.name}</strong> ({currentSigner?.chucVu})
                        </p>
                      </div>

                      {/* Phương thức ký */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 text-[11.5px] block">
                          Chọn phương thức ký số điện tử:
                        </label>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-[11px]">
                            <input
                              type="radio"
                              name="signMethod"
                              checked={signatureMethod === 'vgca'}
                              onChange={() => setSignatureMethod('vgca')}
                              className="text-indigo-600 focus:ring-0"
                            />
                            <span className="font-semibold text-slate-800">
                              Chữ ký số chuyên dùng công vụ VGCA (Ban Cơ yếu CP)
                            </span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-[11px]">
                            <input
                              type="radio"
                              name="signMethod"
                              checked={signatureMethod === 'usb_token'}
                              onChange={() => setSignatureMethod('usb_token')}
                              className="text-indigo-600 focus:ring-0"
                            />
                            <span className="font-semibold text-slate-800">
                              Chữ ký số USB Token Viettel-CA / VNPT-CA
                            </span>
                          </label>

                          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-[11px]">
                            <input
                              type="radio"
                              name="signMethod"
                              checked={signatureMethod === 'smart_ca'}
                              onChange={() => setSignatureMethod('smart_ca')}
                              className="text-indigo-600 focus:ring-0"
                            />
                            <span className="font-semibold text-slate-800">
                              Ký số từ xa SmartCA / VNeID cấp độ 2
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Nhập ý kiến chỉ đạo / Bút phê */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 text-[11.5px] block">
                          Ý kiến chỉ đạo / Bút phê của Lãnh đạo (Tùy chọn):
                        </label>
                        <textarea
                          rows={3}
                          value={leaderOpinion}
                          onChange={(e) => setLeaderOpinion(e.target.value)}
                          placeholder="Ví dụ: Đồng ý với nội dung tờ trình, giao Tổ xác minh triển khai..."
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
                        />
                      </div>

                      {/* Nút hành động */}
                      {isUserTurnToSign ? (
                        <div className="pt-2 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmModalType('sign')}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">draw</span>
                            <span>XÁC NHẬN KÝ SỐ NGAY</span>
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActionReason('');
                                setActionError(null);
                                setConfirmModalType('return');
                              }}
                              className="py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs cursor-pointer"
                            >
                              Yêu cầu sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionReason('');
                                setActionError(null);
                                setConfirmModalType('reject');
                              }}
                              className="py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs cursor-pointer"
                            >
                              Từ chối ký
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-center text-xs">
                          {isDocumentCompleted ? (
                            <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">verified</span>
                              Toàn bộ các cấp lãnh đạo đã ký xong
                            </span>
                          ) : (
                            <span>
                              Chưa đến lượt xử lý của bạn hoặc văn bản đang ở bước:{' '}
                              <strong>{currentSigner?.name}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: LỊCH SỬ PHIÊN BẢN (VERSION HISTORY) */}
                  {rightPanelTab === 'versions' && (
                    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4.5 shadow-2xs space-y-3 text-xs">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-purple-700 text-[18px]">history</span>
                          Lịch sử các phiên bản văn bản
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Chữ ký trên phiên bản cũ sẽ tự động bị hủy nếu có yêu cầu sửa đổi văn bản mới.
                        </p>
                      </div>

                      <div className="space-y-2">
                        {(activeDoc.versionHistory || []).map((v) => (
                          <div
                            key={v.version}
                            className={`p-3 rounded-xl border ${
                              v.version === activeDoc.phienBanHienTai
                                ? 'bg-purple-50/70 border-purple-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold font-mono text-purple-900 text-xs">
                                Phiên bản {v.version}
                              </span>
                              <span className="text-[10.5px] text-slate-400 font-mono">{v.thoiGian}</span>
                            </div>
                            <p className="text-[11.5px] text-slate-800 font-medium mt-1">{v.ghiChu}</p>
                            <div className="text-[10px] text-slate-400 mt-1">Cập nhật: {v.nguoiTao}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: AUDIT LOG CHI TIẾT */}
                  {rightPanelTab === 'audit' && (
                    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4.5 shadow-2xs space-y-3 text-xs">
                      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-indigo-700 text-[18px]">history_edu</span>
                          Nhật ký sự kiện (Audit Log)
                        </h3>
                        <span className="font-mono text-[10px] text-slate-400">Không thể sửa đổi</span>
                      </div>

                      <div className="space-y-2 max-h-[420px] overflow-y-auto">
                        {(activeDoc.auditLogs || []).map((log) => (
                          <div
                            key={log.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-500">
                              <div className="flex items-center gap-1 font-semibold text-slate-800">
                                <span>{log.actor}</span>
                                <span className="font-normal text-[10px] text-slate-500">({log.actorRole})</span>
                              </div>
                              <span className="font-mono text-[10px]">{log.time}</span>
                            </div>
                            <div className="text-slate-800 font-semibold">{log.action}</div>
                            {log.note && (
                              <div className="p-1.5 rounded bg-white border border-slate-200/70 text-slate-600 italic">
                                “{log.note}”
                              </div>
                            )}
                            {log.signatureCert && (
                              <div className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                <span>{log.signatureCert}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-8">
              <span>Vui lòng chọn một văn bản ở danh sách bên trái để xem chi tiết và ký duyệt.</span>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL CONFIRMATION: KÝ SỐ / TRẢ LẠI / TỪ CHỐI                      */}
      {/* ===================================================================== */}
      {confirmModalType && activeDoc && currentSigner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            {confirmModalType === 'sign' && (
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">draw</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Xác nhận ký số văn bản</h3>
                    <span className="text-[11px] text-slate-500 font-mono">{activeDoc.id}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Bạn đang chuẩn bị ký số văn bản{' '}
                  <strong className="text-slate-900">&quot;{activeDoc.tenVanBan}&quot;</strong> với tư cách là{' '}
                  <strong className="text-emerald-800">
                    {currentSigner.name} ({currentSigner.chucVu})
                  </strong>
                  .
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div>
                    Chứng thư số:{' '}
                    <strong>
                      {signatureMethod === 'vgca'
                        ? 'VGCA - Ban Cơ yếu Chính phủ'
                        : signatureMethod === 'usb_token'
                        ? 'USB Token'
                        : 'SmartCA'}
                    </strong>
                  </div>
                  {currentSignerIndex + 1 < (activeDoc.signers?.length || 1) ? (
                    <div className="text-amber-700 font-semibold pt-1 border-t border-slate-200">
                      → Sau khi ký, hệ thống sẽ tự động chuyển nhiệm vụ sang{' '}
                      <strong>{activeDoc.signers?.[currentSignerIndex + 1]?.name}</strong>.
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                      ✓ Bạn là người ký cuối cùng. Văn bản sẽ chuyển sang trạng thái Hoàn tất!
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleExecuteSign}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang xác thực chữ ký...' : 'Xác nhận ký số'}
                  </button>
                </div>
              </>
            )}

            {confirmModalType === 'return' && (
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">replay</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Yêu cầu chỉnh sửa văn bản</h3>
                    <span className="text-[11px] text-slate-500 font-mono">{activeDoc.id}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-800 block">
                    Nêu rõ lý do và nội dung cần chỉnh sửa: *
                  </label>
                  <textarea
                    rows={3}
                    value={actionReason}
                    onChange={(e) => {
                      setActionReason(e.target.value);
                      setActionError(null);
                    }}
                    placeholder="Ghi rõ nội dung thiếu sót, căn cứ pháp lý hoặc số liệu cần bổ sung..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-amber-600 resize-none"
                  />
                  {actionError && <p className="text-[11px] text-rose-600 font-semibold">{actionError}</p>}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px] text-slate-500 italic">
                  * Khi gửi yêu cầu sửa, văn bản sẽ chuyển lại cho cán bộ thụ lý. Cán bộ sẽ lập phiên bản mới và phải
                  chạy lại quy trình ký từ đầu.
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleExecuteReturn}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang gửi...' : 'Gửi yêu cầu sửa'}
                  </button>
                </div>
              </>
            )}

            {confirmModalType === 'reject' && (
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">block</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Từ chối ký văn bản</h3>
                    <span className="text-[11px] text-slate-500 font-mono">{activeDoc.id}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-800 block">
                    Nêu rõ lý do từ chối ký văn bản: *
                  </label>
                  <textarea
                    rows={3}
                    value={actionReason}
                    onChange={(e) => {
                      setActionReason(e.target.value);
                      setActionError(null);
                    }}
                    placeholder="Ghi rõ căn cứ pháp lý hoặc lý do không phê duyệt..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-rose-600 resize-none"
                  />
                  {actionError && <p className="text-[11px] text-rose-600 font-semibold">{actionError}</p>}
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleExecuteReject}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
