// src/screens/TrinhKyScreen.tsx
import React, { useState, useMemo } from 'react';
import { Screen } from '../types';
import { SigningDocument, SigningStatus, DocumentType, LanhDaoAuthority } from '../types/signing';
import { INITIAL_LEADERS } from '../constants/signingData';

interface TrinhKyScreenProps {
  onNav: (s: Screen) => void;
  documents: SigningDocument[];
  onUpdateDocuments: (docs: SigningDocument[]) => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  isEmbedded?: boolean;
  onSwitchAccount?: (role: 'can_bo' | 'lanh_dao') => void;
}

export default function TrinhKyScreen({
  onNav,
  documents,
  onUpdateDocuments,
  onSelectHoSo,
  isEmbedded = false,
  onSwitchAccount,
}: TrinhKyScreenProps) {
  // Lọc và Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loaiVanBanFilter, setLoaiVanBanFilter] = useState<string>('all');
  const [lanhDaoFilter, setLanhDaoFilter] = useState<string>('all');
  
  // Modal / Drawer thực hiện Trình ký
  const [selectedDoc, setSelectedDoc] = useState<SigningDocument | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state khi đang trình ký hoặc sửa
  const [editLanhDaoId, setEditLanhDaoId] = useState<string>('');
  const [editYKien, setEditYKien] = useState<string>('');
  const [editNoiDung, setEditNoiDung] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal tạo văn bản trình ký mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHoSoCode, setNewHoSoCode] = useState('Đ-2026-00125');
  const [newTenVanBan, setNewTenVanBan] = useState('');
  const [newLoaiVanBan, setNewLoaiVanBan] = useState<DocumentType>('to_trinh_thu_ly');
  const [newTrichYeu, setNewTrichYeu] = useState('');
  const [newNoiDung, setNewNoiDung] = useState('');
  const [newLanhDaoId, setNewLanhDaoId] = useState('ld-01');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = documents.length;
    const choTrinh = documents.filter((d) => d.status === 'cho_trinh').length;
    const daTrinh = documents.filter((d) => d.status === 'da_trinh').length;
    const yeuCauSua = documents.filter((d) => d.status === 'yeu_cau_chinh_sua').length;
    const daKy = documents.filter((d) => d.status === 'da_ky').length;
    const nhap = documents.filter((d) => d.status === 'nhap').length;
    const tuChoi = documents.filter((d) => d.status === 'tu_choi').length;
    return { total, choTrinh, daTrinh, yeuCauSua, daKy, nhap, tuChoi };
  }, [documents]);

  // Danh sách đã lọc
  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch =
        d.hoSoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tenVanBan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nguoiGuiDon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.trichYeu.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchLoaiVB = loaiVanBanFilter === 'all' || d.loaiVanBan === loaiVanBanFilter;
      const matchLanhDao = lanhDaoFilter === 'all' || d.lanhDaoId === lanhDaoFilter;

      return matchSearch && matchStatus && matchLoaiVB && matchLanhDao;
    });
  }, [documents, searchTerm, statusFilter, loaiVanBanFilter, lanhDaoFilter]);

  // Mở drawer xem hoặc trình ký
  const handleOpenDoc = (doc: SigningDocument) => {
    setSelectedDoc(doc);
    setEditLanhDaoId(doc.lanhDaoId);
    setEditYKien(doc.yKienCanBo || '');
    setEditNoiDung(doc.noiDungChiTiet);
    setValidationErrors([]);
    setIsDrawerOpen(true);
  };

  // Kiểm tra điều kiện trước khi trình ký (Pre-flight Validation)
  const validateBeforeTrinh = (doc: SigningDocument, lanhDaoId: string, noiDung: string): string[] => {
    const errors: string[] = [];
    if (!noiDung || noiDung.trim().length < 30) {
      errors.push('Nội dung văn bản còn quá ngắn hoặc chưa hoàn thiện (tối thiểu 30 ký tự).');
    }
    if (!lanhDaoId) {
      errors.push('Chưa chọn Lãnh đạo có thẩm quyền phê duyệt/ký văn bản.');
    } else {
      const leader = INITIAL_LEADERS.find((l) => l.id === lanhDaoId);
      if (leader && !leader.thamQuyenKy.includes(doc.loaiVanBan)) {
        errors.push(`${leader.name} (${leader.chucVu}) không có thẩm quyền ký loại văn bản này.`);
      }
    }
    if (!doc.tepDinhKem || doc.tepDinhKem.length === 0) {
      errors.push('Văn bản chưa đính kèm tệp dự thảo (PDF/DOCX) hoặc tài liệu kiểm tra.');
    }
    return errors;
  };

  // Thực hiện Trình ký / Trình ký lại
  const handleConfirmTrinhKy = () => {
    if (!selectedDoc) return;

    const errors = validateBeforeTrinh(selectedDoc, editLanhDaoId, editNoiDung);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const selectedLeader = INITIAL_LEADERS.find((l) => l.id === editLanhDaoId);
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const isReSubmit = selectedDoc.status === 'yeu_cau_chinh_sua';
      const actionName = isReSubmit
        ? 'Cán bộ chỉnh sửa và Trình ký lại'
        : 'Cán bộ nhấn nút [TRÌNH LÃNH ĐẠO] phê duyệt';

      const newLog = {
        id: `h-${Date.now()}`,
        time: timeStr,
        actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        action: actionName,
        note: editYKien
          ? `Gửi ${selectedLeader?.name}: ${editYKien}`
          : `Đã chuyển đến ${selectedLeader?.name} (${selectedLeader?.chucVu})`,
      };

      const updatedDocs = documents.map((d) => {
        if (d.id === selectedDoc.id) {
          return {
            ...d,
            status: 'da_trinh' as SigningStatus, // Chuyển sang đã trình
            noiDungChiTiet: editNoiDung,
            lanhDaoId: editLanhDaoId,
            lanhDaoName: selectedLeader?.name || d.lanhDaoName,
            lanhDaoChucVu: selectedLeader?.chucVu || d.lanhDaoChucVu,
            yKienCanBo: editYKien,
            thoiGianTrinh: timeStr,
            stepId: 'STEP-04',
            history: [newLog, ...(d.history || [])],
          };
        }
        return d;
      });

      onUpdateDocuments(updatedDocs);
      setSelectedDoc((prev) =>
        prev
          ? {
              ...prev,
              status: 'da_trinh',
              noiDungChiTiet: editNoiDung,
              lanhDaoId: editLanhDaoId,
              lanhDaoName: selectedLeader?.name || prev.lanhDaoName,
              lanhDaoChucVu: selectedLeader?.chucVu || prev.lanhDaoChucVu,
              yKienCanBo: editYKien,
              thoiGianTrinh: timeStr,
              history: [newLog, ...(prev.history || [])],
            }
          : null
      );

      setIsSubmitting(false);
      setIsDrawerOpen(false);
      showToast(
        `✓ Đã trình ký thành công văn bản ${selectedDoc.id} tới ${selectedLeader?.name}! Hồ sơ đã chuyển sang danh sách chờ ký của Lãnh đạo.`
      );
    }, 400);
  };

  // Tạo văn bản trình ký mới
  const handleCreateNewDoc = () => {
    if (!newTenVanBan.trim() || !newTrichYeu.trim()) {
      showToast('Vui lòng nhập đầy đủ tên văn bản và trích yếu nội dung.');
      return;
    }

    const leader = INITIAL_LEADERS.find((l) => l.id === newLanhDaoId);
    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDoc: SigningDocument = {
      id: `VB-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      hoSoCode: newHoSoCode,
      loaiDon: 'Đơn tố cáo cán bộ vi phạm',
      nguoiGuiDon: 'Nguyễn Văn A',
      noiDungDon: 'Nội dung tố cáo vi phạm pháp luật cần lập văn bản trình phê duyệt.',
      tenVanBan: newTenVanBan,
      loaiVanBan: newLoaiVanBan,
      loaiVanBanLabel:
        newLoaiVanBan === 'to_trinh_thu_ly'
          ? 'Tờ trình đề xuất thụ lý'
          : newLoaiVanBan === 'quyet_dinh_thu_ly'
          ? 'Quyết định thụ lý'
          : newLoaiVanBan === 'thong_bao_khong_thu_ly'
          ? 'Thông báo không thụ lý'
          : 'Văn bản xử lý',
      trichYeu: newTrichYeu,
      noiDungChiTiet: newNoiDung || 'Nội dung văn bản dự thảo...',
      nguoiLap: 'Nguyễn Minh Anh',
      donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
      ngayTao: timeStr,
      nguoiTrinh: 'Nguyễn Minh Anh',
      lanhDaoId: newLanhDaoId,
      lanhDaoName: leader?.name || 'Đ/c Trần Văn Hùng',
      lanhDaoChucVu: leader?.chucVu || 'Phó Chánh Thanh tra thành phố',
      status: 'cho_trinh',
      hanXuLy: '24 giờ',
      mucDoUuTien: 'khan',
      tepDinhKem: [
        {
          id: `att-${Date.now()}`,
          tenTep: `${newTenVanBan.replace(/\s+/g, '_')}.docx`,
          dungLuong: '2.1 MB',
          loai: 'du_thao',
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
      stepId: 'STEP-03A',
    };

    onUpdateDocuments([newDoc, ...documents]);
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
            Nháp
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
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Đã trình / Chờ Lãnh đạo ký
          </span>
        );
      case 'yeu_cau_chinh_sua':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <span className="material-symbols-outlined text-[14px] text-rose-600">warning</span>
            Lãnh đạo yêu cầu sửa
          </span>
        );
      case 'da_ky':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
            Đã ký số
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
      {/* 1. HEADER: QUẢN LÝ TRÌNH KÝ VĂN BẢN (DÀNH CHO CÁN BỘ)                */}
      {/* ===================================================================== */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[24px]">drive_file_move</span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-headline-md">
                Trình ký văn bản
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200 text-xs font-bold">
                Góc nhìn Cán bộ thụ lý
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Quản lý hồ sơ trình phê duyệt và ký số các văn bản xử lý đơn tố cáo, khiếu nại</span>
              <span>•</span>
              <span className="text-slate-700 font-medium">Cán bộ: <strong>Nguyễn Minh Anh</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Nút chuyển đổi nhanh sang màn hình Văn bản chờ ký của Lãnh đạo để test/demo */}
            <button
              type="button"
              onClick={() => {
                if (onSwitchAccount) {
                  onSwitchAccount('lanh_dao');
                } else {
                  onNav('van-ban-cho-ky');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Chuyển sang tài khoản Lãnh đạo để duyệt và ký số"
            >
              <span className="material-symbols-outlined text-[17px] text-indigo-600">rate_review</span>
              <span>Chuyển vai trò: Lãnh đạo ký duyệt ({stats.daTrinh})</span>
            </button>

            {/* Nút Tạo văn bản trình ký mới */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>Soạn văn bản trình ký</span>
            </button>
          </div>
        </div>

        {/* 6 Thẻ KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tất cả văn bản</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
          </div>

          <div
            onClick={() => setStatusFilter('cho_trinh')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'cho_trinh'
                ? 'bg-blue-100/70 border-blue-400 shadow-2xs'
                : 'bg-white border-blue-100 hover:bg-blue-50/50'
            }`}
          >
            <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider flex items-center justify-between">
              <span>Chờ trình ký</span>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">{stats.choTrinh}</div>
          </div>

          <div
            onClick={() => setStatusFilter('da_trinh')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'da_trinh'
                ? 'bg-amber-100/70 border-amber-400 shadow-2xs'
                : 'bg-white border-amber-100 hover:bg-amber-50/50'
            }`}
          >
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Đang chờ ký</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <div className="text-xl font-bold text-amber-800 mt-0.5">{stats.daTrinh}</div>
          </div>

          <div
            onClick={() => setStatusFilter('yeu_cau_chinh_sua')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'yeu_cau_chinh_sua'
                ? 'bg-rose-100/70 border-rose-400 shadow-2xs'
                : 'bg-white border-rose-100 hover:bg-rose-50/50'
            }`}
          >
            <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center justify-between">
              <span>Cần chỉnh sửa</span>
              <span className="material-symbols-outlined text-rose-600 text-[14px]">warning</span>
            </div>
            <div className="text-xl font-bold text-rose-700 mt-0.5">{stats.yeuCauSua}</div>
          </div>

          <div
            onClick={() => setStatusFilter('da_ky')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'da_ky'
                ? 'bg-emerald-100/70 border-emerald-400 shadow-2xs'
                : 'bg-white border-emerald-100 hover:bg-emerald-50/50'
            }`}
          >
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
              <span>Đã ký số</span>
              <span className="material-symbols-outlined text-emerald-600 text-[14px]">verified</span>
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{stats.daKy}</div>
          </div>

          <div
            onClick={() => setStatusFilter('nhap')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'nhap'
                ? 'bg-slate-200 border-slate-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bản nháp</div>
            <div className="text-xl font-bold text-slate-700 mt-0.5">{stats.nhap}</div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. THANH LỌC VÀ TÌM KIẾM                                              */}
      {/* ===================================================================== */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã hồ sơ, mã VB, tên văn bản, người nộp..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#004ac6] focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Lọc loại văn bản */}
          <select
            value={loaiVanBanFilter}
            onChange={(e) => setLoaiVanBanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#004ac6] cursor-pointer"
          >
            <option value="all">Tất cả loại văn bản</option>
            <option value="to_trinh_thu_ly">Tờ trình đề xuất thụ lý</option>
            <option value="quyet_dinh_thu_ly">Quyết định thụ lý / Phân công</option>
            <option value="thong_bao_khong_thu_ly">Thông báo không thụ lý</option>
            <option value="bien_ban_ban_giao">Biên bản bàn giao</option>
            <option value="van_ban_tra_lai">Văn bản trả lại đơn</option>
          </select>

          {/* Lọc Lãnh đạo trình */}
          <select
            value={lanhDaoFilter}
            onChange={(e) => setLanhDaoFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#004ac6] cursor-pointer"
          >
            <option value="all">Tất cả Lãnh đạo</option>
            {INITIAL_LEADERS.map((ld) => (
              <option key={ld.id} value={ld.id}>
                {ld.name} ({ld.chucVu})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredDocs.length}</strong> / {documents.length} văn bản
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. DANH SÁCH BẢNG VĂN BẢN TRÌNH KÝ                                    */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-32">MÃ VĂN BẢN</th>
                <th className="py-3 px-4 w-36">HỒ SƠ / ĐƠN</th>
                <th className="py-3 px-4 min-w-[240px]">TÊN VĂN BẢN & TRÍCH YẾU</th>
                <th className="py-3 px-4 w-44">NGƯỜI ĐƯỢC TRÌNH</th>
                <th className="py-3 px-4 w-36">NGÀY TẠO / HẠN</th>
                <th className="py-3 px-4 w-48 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-4 w-36 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-1">
                      folder_open
                    </span>
                    <span>Không tìm thấy văn bản trình ký nào phù hợp với bộ lọc.</span>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => {
                  const isLocked = doc.status === 'da_trinh';
                  const needsFix = doc.status === 'yeu_cau_chinh_sua';

                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        needsFix ? 'bg-rose-50/30' : isLocked ? 'bg-amber-50/15' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Mã văn bản */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#004ac6]">
                        {doc.id}
                        {doc.mucDoUuTien === 'khan' && (
                          <span className="block mt-0.5 text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                            ● Khẩn
                          </span>
                        )}
                        {doc.mucDoUuTien === 'hoa_toc' && (
                          <span className="block mt-0.5 text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                            ⚡ Hỏa tốc
                          </span>
                        )}
                      </td>

                      {/* Hồ sơ / Đơn */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectHoSo) onSelectHoSo(doc.hoSoCode);
                            onNav('don-tiep-nhan');
                          }}
                          className="font-bold text-[#004ac6] hover:underline cursor-pointer flex items-center gap-1"
                          title="Bấm để mở hồ sơ chi tiết"
                        >
                          <span>{doc.hoSoCode}</span>
                          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium truncate max-w-[140px]" title={doc.loaiDon}>
                          {doc.loaiDon}
                        </div>
                        <div className="text-[10.5px] text-slate-400 truncate max-w-[140px]">
                          Người nộp: {doc.nguoiGuiDon}
                        </div>
                      </td>

                      {/* Tên văn bản & Trích yếu */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 hover:text-[#004ac6] cursor-pointer" onClick={() => handleOpenDoc(doc)}>
                          {doc.tenVanBan}
                        </div>
                        <p className="text-[11.5px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {doc.trichYeu}
                        </p>
                        {/* Cảnh báo lý do trả lại */}
                        {needsFix && doc.lyDoTraLai && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-rose-600 text-[15px] shrink-0 mt-0.5">
                              feedback
                            </span>
                            <div>
                              <strong>Lãnh đạo yêu cầu sửa: </strong>
                              <span>{doc.lyDoTraLai}</span>
                            </div>
                          </div>
                        )}
                        {/* Tệp đính kèm */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {doc.tepDinhKem.map((f) => (
                            <span
                              key={f.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10.5px] border border-slate-200"
                              title={`${f.tenTep} (${f.dungLuong})`}
                            >
                              <span className="material-symbols-outlined text-[12px] text-blue-600">attachment</span>
                              <span className="truncate max-w-[130px]">{f.tenTep}</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Người được trình */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{doc.lanhDaoName}</div>
                        <div className="text-[11px] text-slate-500">{doc.lanhDaoChucVu}</div>
                        {doc.thoiGianTrinh && (
                          <div className="text-[10px] text-amber-700 font-medium mt-1">
                            Trình lúc: {doc.thoiGianTrinh}
                          </div>
                        )}
                      </td>

                      {/* Ngày tạo / Hạn xử lý */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700">{doc.ngayTao}</div>
                        {doc.hanXuLy && (
                          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
                            Hạn: {doc.hanXuLy}
                          </div>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(doc.status)}
                        {isLocked && (
                          <span className="block mt-1 text-[10px] text-slate-400 italic">
                            (Khóa sửa trong lúc chờ ký)
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-center">
                        {doc.status === 'cho_trinh' || doc.status === 'nhap' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDoc(doc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">send</span>
                            <span>Trình ký</span>
                          </button>
                        ) : doc.status === 'yeu_cau_chinh_sua' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDoc(doc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit_note</span>
                            <span>Sửa &amp; Trình lại</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenDoc(doc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px] text-slate-500">visibility</span>
                            <span>Xem chi tiết</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. DRAWER CHI TIẾT VĂN BẢN VÀ THỰC HIỆN TRÌNH KÝ                    */}
      {/* ===================================================================== */}
      {isDrawerOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-slate-200">
            {/* Drawer Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    VĂN BẢN TRÌNH KÝ • {selectedDoc.id}
                  </span>
                  {renderStatusBadge(selectedDoc.status)}
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                  {selectedDoc.tenVanBan}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
              {/* Banner cảnh báo nếu lãnh đạo yêu cầu sửa */}
              {selectedDoc.status === 'yeu_cau_chinh_sua' && selectedDoc.lyDoTraLai && (
                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-rose-700">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>LÃNH ĐẠO TRẢ LẠI YÊU CẦU CHỈNH SỬA:</span>
                  </div>
                  <p className="text-xs leading-relaxed bg-white/70 p-2.5 rounded-lg border border-rose-200 font-medium">
                    {selectedDoc.lyDoTraLai}
                  </p>
                  <p className="text-[11px] text-rose-600 italic">
                    Vui lòng chỉnh sửa nội dung bên dưới theo đúng chỉ đạo, sau đó nhấn <strong>[TRÌNH KÝ LẠI]</strong>.
                  </p>
                </div>
              )}

              {/* Thông tin hồ sơ đơn */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Thông tin hồ sơ liên quan
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectHoSo) onSelectHoSo(selectedDoc.hoSoCode);
                      onNav('don-tiep-nhan');
                    }}
                    className="text-[#004ac6] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mở hồ sơ gốc ({selectedDoc.hoSoCode})</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                  <div>
                    <span className="text-slate-400">Loại đơn:</span>{' '}
                    <strong className="text-slate-800">{selectedDoc.loaiDon}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Người nộp:</span>{' '}
                    <strong className="text-slate-800">{selectedDoc.nguoiGuiDon}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400">Nội dung đơn: </span>
                  {selectedDoc.noiDungDon}
                </div>
              </div>

              {/* Danh sách lỗi validate nếu có */}
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

              {/* Nội dung văn bản dự thảo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    Nội dung dự thảo văn bản trình duyệt:
                  </label>
                  {selectedDoc.status === 'da_trinh' ? (
                    <span className="text-[11px] text-slate-400 italic">
                      🔒 Đang chờ Lãnh đạo ký - Khóa chỉnh sửa
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#004ac6] font-semibold">
                      ✎ Có thể chỉnh sửa
                    </span>
                  )}
                </div>
                <textarea
                  rows={8}
                  disabled={selectedDoc.status === 'da_trinh' || selectedDoc.status === 'da_ky'}
                  value={editNoiDung}
                  onChange={(e) => setEditNoiDung(e.target.value)}
                  className={`w-full p-3 rounded-xl font-mono text-xs leading-relaxed border focus:outline-none transition-colors ${
                    selectedDoc.status === 'da_trinh' || selectedDoc.status === 'da_ky'
                      ? 'bg-slate-100/80 border-slate-200 text-slate-600 cursor-not-allowed'
                      : 'bg-white border-slate-300 focus:border-[#004ac6] text-slate-800 shadow-2xs'
                  }`}
                />
              </div>

              {/* Danh sách tệp đính kèm */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 text-xs block">
                  Tài liệu và tệp đính kèm bắt buộc:
                </label>
                <div className="space-y-1.5">
                  {selectedDoc.tepDinhKem.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">
                          description
                        </span>
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate">{f.tenTep}</div>
                          <div className="text-[10px] text-slate-400">{f.dungLuong} • {f.loai === 'du_thao' ? 'Văn bản dự thảo' : 'Tài liệu minh chứng'}</div>
                        </div>
                      </div>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                        Đã xác thực
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chọn Lãnh đạo có thẩm quyền và Lời nhắn */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-[18px]">badge</span>
                  <span>Chọn Lãnh đạo có thẩm quyền ký duyệt:</span>
                </div>

                <div>
                  <select
                    disabled={selectedDoc.status === 'da_trinh' || selectedDoc.status === 'da_ky'}
                    value={editLanhDaoId}
                    onChange={(e) => setEditLanhDaoId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer"
                  >
                    {INITIAL_LEADERS.map((ld) => {
                      const isEligible = ld.thamQuyenKy.includes(selectedDoc.loaiVanBan);
                      return (
                        <option key={ld.id} value={ld.id} disabled={!isEligible}>
                          {ld.name} — {ld.chucVu} ({ld.coQuan}) {!isEligible ? '(Không có thẩm quyền ký VB này)' : '✓ Đủ thẩm quyền'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Ý kiến / Ghi chú của cán bộ gửi Lãnh đạo:
                  </label>
                  <input
                    type="text"
                    disabled={selectedDoc.status === 'da_trinh' || selectedDoc.status === 'da_ky'}
                    value={editYKien}
                    onChange={(e) => setEditYKien(e.target.value)}
                    placeholder="Nhập nội dung vắn tắt kính trình lãnh đạo..."
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              {/* Lịch sử trình ký */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-xs block">Lịch sử trình ký &amp; phê duyệt:</span>
                <div className="space-y-2">
                  {selectedDoc.history.map((log) => (
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
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                {selectedDoc.status === 'da_trinh' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNav('van-ban-cho-ky');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                    <span>Mở xem bên bàn Lãnh đạo</span>
                  </button>
                ) : selectedDoc.status === 'da_ky' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Văn bản đã được ký duyệt
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmTrinhKy}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>
                      {selectedDoc.status === 'yeu_cau_chinh_sua' ? 'XÁC NHẬN TRÌNH KÝ LẠI' : 'TRÌNH LÃNH ĐẠO KÝ'}
                    </span>
                  </button>
                )}
              </div>
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
                  placeholder="V/v Đề xuất thụ lý giải quyết nội dung đơn tố cáo..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Người được trình ký:</label>
                <select
                  value={newLanhDaoId}
                  onChange={(e) => setNewLanhDaoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#004ac6] cursor-pointer"
                >
                  {INITIAL_LEADERS.map((ld) => (
                    <option key={ld.id} value={ld.id}>
                      {ld.name} — {ld.chucVu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateNewDoc}
                className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Tạo văn bản trình ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
