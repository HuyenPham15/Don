// src/screens/quanLyTrinhKy/ChiTietLuotTrinhDrawer.tsx
import React, { useState } from 'react';
import { LuotTrinhKy, HoSoDocumentItem, NguoiNhanTrinhItem } from '../../types/quanLyTrinhKy';
import { CurrentUserAccount } from '../../types/signing';
import XemTaiLieuModal from './XemTaiLieuModal';
import XuLyLanhDaoModal, { LeaderActionKind } from './XuLyLanhDaoModal';

interface ChiTietLuotTrinhDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  luotTrinh: LuotTrinhKy | null;
  currentAccount?: CurrentUserAccount;
  onUpdateLuotTrinh: (updated: LuotTrinhKy) => void;
  onOpenQuyTrinh?: (maDon: string) => void;
  onTrinhLaiModal?: (luotTrinh: LuotTrinhKy) => void;
}

export default function ChiTietLuotTrinhDrawer({
  isOpen,
  onClose,
  luotTrinh,
  currentAccount,
  onUpdateLuotTrinh,
  onOpenQuyTrinh,
  onTrinhLaiModal,
}: ChiTietLuotTrinhDrawerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'info' | 'docs' | 'flow' | 'history'>('all');
  const [selectedDocToView, setSelectedDocToView] = useState<HoSoDocumentItem | null>(null);
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number>(() => luotTrinh?.luotTrinhNumber || 1);

  // Leader Action Dialog
  const [isLeaderActionModalOpen, setIsLeaderActionModalOpen] = useState(false);
  const [selectedLeaderActionKind, setSelectedLeaderActionKind] = useState<LeaderActionKind>('phe_duyet');
  const [activeLeaderItem, setActiveLeaderItem] = useState<NguoiNhanTrinhItem | null>(null);

  // Edit Document Modal states
  const [isEditDocModalOpen, setIsEditDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<HoSoDocumentItem | null>(null);
  const [editDocForm, setEditDocForm] = useState<{
    tenTaiLieu: string;
    soKyHieu: string;
    loaiTaiLieu: string;
    yeuCauXuLy: 'ky' | 'phe_duyet' | 'ky_va_phe_duyet' | 'tham_khao';
    phienBan: string;
    noiDungTrichYeu: string;
    noiDungChiTiet: string;
  }>({
    tenTaiLieu: '',
    soKyHieu: '',
    loaiTaiLieu: '',
    yeuCauXuLy: 'ky',
    phienBan: 'v1.0',
    noiDungTrichYeu: '',
    noiDungChiTiet: '',
  });

  // Modal Thu hồi xác nhận
  const [isThuHoiModalOpen, setIsThuHoiModalOpen] = useState(false);
  const [lyDoThuHoi, setLyDoThuHoi] = useState('');

  if (!isOpen || !luotTrinh) return null;

  // Trạng thái badge map
  const getStatusBadge = (status: LuotTrinhKy['status']) => {
    switch (status) {
      case 'ban_nhap':
        return { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'da_trinh':
        return { label: 'Đã trình', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'dang_cho_xu_ly':
        return { label: 'Đang chờ xử lý', cls: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'dang_xu_ly_mot_phan':
        return { label: 'Đang xử lý một phần', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'da_ky':
        return { label: 'Đã ký', cls: 'bg-sky-50 text-sky-800 border-sky-300' };
      case 'da_phe_duyet':
        return { label: 'Đã phê duyệt', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'da_ky_va_phe_duyet':
        return { label: 'Đã ký và phê duyệt', cls: 'bg-teal-50 text-teal-800 border-teal-300' };
      case 'yeu_cau_chinh_sua':
        return { label: 'Yêu cầu chỉnh sửa', cls: 'bg-orange-50 text-orange-800 border-orange-300' };
      case 'da_tra_lai':
        return { label: 'Đã trả lại', cls: 'bg-amber-100 text-amber-900 border-amber-400' };
      case 'da_tu_choi':
        return { label: 'Đã từ chối', cls: 'bg-rose-50 text-rose-800 border-rose-300' };
      case 'da_thu_hoi':
        return { label: 'Đã thu hồi', cls: 'bg-slate-200 text-slate-700 border-slate-400' };
      case 'da_huy':
        return { label: 'Đã hủy', cls: 'bg-rose-100 text-rose-700 border-rose-300' };
      default:
        return { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const statusBadge = getStatusBadge(luotTrinh.status);

  // Trigger Action from Leader
  const handleOpenLeaderAction = (kind: LeaderActionKind, leader?: NguoiNhanTrinhItem) => {
    setSelectedLeaderActionKind(kind);
    setActiveLeaderItem(leader || luotTrinh.danhSachNguoiNhan[0]);
    setIsLeaderActionModalOpen(true);
  };

  // Submit Leader Action & Update State
  const handleConfirmLeaderAction = ({
    actionKind,
    yKien,
    certName,
    soSeri,
  }: {
    actionKind: LeaderActionKind;
    yKien: string;
    certName: string;
    soSeri: string;
  }) => {
    const leader = activeLeaderItem || luotTrinh.danhSachNguoiNhan[0];
    const timeNow = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let updatedStatus = luotTrinh.status;
    let newNguoiNhanStatus: NguoiNhanTrinhItem['trangThai'] = 'da_ky';
    let actionLogText: any = 'Đã ký nháy chuyên môn';

    if (actionKind === 'phe_duyet') {
      newNguoiNhanStatus = 'da_phe_duyet';
      actionLogText = 'Đã phê duyệt & Ký số CA';
      updatedStatus = luotTrinh.kieuTrinh === 'tuan_tu' ? 'da_phe_duyet' : 'da_ky_va_phe_duyet';
    } else if (actionKind === 'ky_nhay') {
      newNguoiNhanStatus = 'da_ky';
      actionLogText = 'Đã ký nháy chuyên môn';
      updatedStatus = luotTrinh.kieuTrinh === 'tuan_tu' ? 'dang_xu_ly_mot_phan' : 'da_ky';
    } else if (actionKind === 'tra_lai' || actionKind === 'yeu_cau_chinh_sua') {
      newNguoiNhanStatus = actionKind === 'tra_lai' ? 'da_tra_lai' : 'yeu_cau_chinh_sua';
      actionLogText = actionKind === 'tra_lai' ? 'Đã trả lại lượt trình' : 'Yêu cầu chỉnh sửa';
      updatedStatus = actionKind === 'tra_lai' ? 'da_tra_lai' : 'yeu_cau_chinh_sua';
    } else if (actionKind === 'tu_choi') {
      newNguoiNhanStatus = 'tu_choi';
      actionLogText = 'Từ chối phê duyệt';
      updatedStatus = 'da_tu_choi';
    }

    // Cập nhật người nhận
    const updatedNguoiNhan = luotTrinh.danhSachNguoiNhan.map((n) => {
      if (n.id === leader.id) {
        return {
          ...n,
          trangThai: newNguoiNhanStatus,
          thoiDiemXuLy: timeNow,
          yKien,
          chuKySo:
            actionKind === 'phe_duyet' || actionKind === 'ky_nhay'
              ? {
                  nguoiKy: n.hoTen,
                  chucVu: n.chucVu,
                  coQuan: 'Công an quận Ba Đình',
                  thoiGianKy: timeNow,
                  loaiChungThu: certName,
                  soSeri,
                  tinhTrangHieuLuc: true,
                }
              : undefined,
        };
      }
      return n;
    });

    // Cập nhật tài liệu nếu phê duyệt / ký
    const updatedTaiLieu = luotTrinh.danhSachTaiLieu.map((doc) => {
      if (doc.yeuCauXuLy === 'phe_duyet' && actionKind === 'phe_duyet') {
        return {
          ...doc,
          trangThaiXuLy: 'da_phe_duyet' as const,
          chuKySo: {
            nguoiKy: leader.hoTen,
            chucVu: leader.chucVu,
            coQuan: 'Công an quận Ba Đình',
            thoiGianKy: timeNow,
            loaiChungThu: certName,
            soSeri,
            tinhTrangHieuLuc: true,
          },
        };
      }
      if (doc.yeuCauXuLy === 'ky' && (actionKind === 'ky_nhay' || actionKind === 'phe_duyet')) {
        return { ...doc, trangThaiXuLy: 'da_ky' as const };
      }
      return doc;
    });

    // Thêm lịch sử xử lý
    const newHistoryLog = {
      id: `log-${Date.now()}`,
      thoiGian: timeNow,
      nguoiThucHien: leader.hoTen,
      chucVu: leader.chucVu,
      hanhDong: actionLogText,
      noiDungYKien: yKien,
      phienBanXuLy: luotTrinh.danhSachTaiLieu[0]?.phienBan || 'v1.0',
      luotTrinhIndex: luotTrinh.luotTrinhNumber,
    };

    const newObj: LuotTrinhKy = {
      ...luotTrinh,
      status: updatedStatus,
      lyDoTraLai: actionKind === 'tra_lai' ? yKien : luotTrinh.lyDoTraLai,
      danhSachNguoiNhan: updatedNguoiNhan,
      danhSachTaiLieu: updatedTaiLieu,
      lichSuXuLy: [newHistoryLog, ...luotTrinh.lichSuXuLy],
    };

    onUpdateLuotTrinh(newObj);
  };

  // Cán bộ mở form sửa văn bản
  const handleOpenEditDoc = (doc: HoSoDocumentItem) => {
    setEditingDoc(doc);
    setEditDocForm({
      tenTaiLieu: doc.tenTaiLieu,
      soKyHieu: doc.soKyHieu || '',
      loaiTaiLieu: doc.loaiTaiLieu,
      yeuCauXuLy: doc.yeuCauXuLy,
      phienBan: doc.phienBan || 'v1.0',
      noiDungTrichYeu: doc.noiDungTrichYeu || '',
      noiDungChiTiet: doc.noiDungChiTiet || '',
    });
    setIsEditDocModalOpen(true);
  };

  // Cán bộ lưu chỉnh sửa văn bản
  const handleSaveEditDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    // Tự động tính toán phiên bản tiếp theo
    let nextVersion = editDocForm.phienBan.trim();
    if (nextVersion === editingDoc.phienBan) {
      const match = nextVersion.match(/v(\d+)\.(\d+)/);
      if (match) {
        nextVersion = `v${match[1]}.${Number(match[2]) + 1}`;
      } else {
        nextVersion = `${nextVersion}.1`;
      }
    }

    const updatedDoc: HoSoDocumentItem = {
      ...editingDoc,
      tenTaiLieu: editDocForm.tenTaiLieu,
      soKyHieu: editDocForm.soKyHieu,
      loaiTaiLieu: editDocForm.loaiTaiLieu,
      yeuCauXuLy: editDocForm.yeuCauXuLy,
      phienBan: nextVersion,
      noiDungTrichYeu: editDocForm.noiDungTrichYeu,
      noiDungChiTiet: editDocForm.noiDungChiTiet,
    };

    const timeNow = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `log-${Date.now()}`,
      thoiGian: timeNow,
      nguoiThucHien: currentAccount?.name || luotTrinh.nguoiTrinh,
      chucVu: currentAccount?.chucVu || luotTrinh.chucVuNguoiTrinh,
      hanhDong: 'Chỉnh sửa văn bản' as any,
      noiDungYKien: `Cán bộ đã cập nhật văn bản "${updatedDoc.tenTaiLieu}" lên phiên bản [${nextVersion}].`,
      phienBanXuLy: nextVersion,
      luotTrinhIndex: luotTrinh.luotTrinhNumber,
    };

    const updatedTaiLieuList = luotTrinh.danhSachTaiLieu.map((d) => (d.id === editingDoc.id ? updatedDoc : d));

    onUpdateLuotTrinh({
      ...luotTrinh,
      danhSachTaiLieu: updatedTaiLieuList,
      lichSuXuLy: [newLog, ...luotTrinh.lichSuXuLy],
    });

    setIsEditDocModalOpen(false);
    setEditingDoc(null);
  };

  // Cán bộ thu hồi lượt trình
  const handleConfirmThuHoi = () => {
    const timeNow = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const reason = lyDoThuHoi.trim() || 'Cán bộ thụ lý chủ động thu hồi lượt trình để chỉnh sửa và bổ sung văn bản.';
    const newLog = {
      id: `log-${Date.now()}`,
      thoiGian: timeNow,
      nguoiThucHien: currentAccount?.name || luotTrinh.nguoiTrinh,
      chucVu: currentAccount?.chucVu || luotTrinh.chucVuNguoiTrinh,
      hanhDong: 'Thu hồi lượt trình' as const,
      noiDungYKien: reason,
      phienBanXuLy: luotTrinh.danhSachTaiLieu[0]?.phienBan || 'v1.0',
      luotTrinhIndex: luotTrinh.luotTrinhNumber,
    };
    onUpdateLuotTrinh({
      ...luotTrinh,
      status: 'da_thu_hoi',
      lichSuXuLy: [newLog, ...luotTrinh.lichSuXuLy],
    });
    setIsThuHoiModalOpen(false);
    setLyDoThuHoi('');
  };

  const isCanBo = currentAccount?.role !== 'lanh_dao';
  const canThuHoi = isCanBo && (luotTrinh.status === 'da_trinh' || luotTrinh.status === 'dang_cho_xu_ly' || luotTrinh.status === 'dang_xu_ly_mot_phan');
  const canEditDocs = isCanBo && (luotTrinh.status === 'ban_nhap' || luotTrinh.status === 'yeu_cau_chinh_sua' || luotTrinh.status === 'da_tra_lai' || luotTrinh.status === 'da_thu_hoi');
  const canTrinhLai = isCanBo && (luotTrinh.status === 'da_tra_lai' || luotTrinh.status === 'yeu_cau_chinh_sua' || luotTrinh.status === 'da_thu_hoi' || luotTrinh.status === 'ban_nhap');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl lg:max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 1. HEADER DRAWER                                                          */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                {luotTrinh.doiTuongTrinh === 'tep_ho_so' ? 'folder_open' : 'description'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm tracking-tight text-blue-200">
                  {luotTrinh.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.cls}`}
                >
                  {statusBadge.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    luotTrinh.doiTuongTrinh === 'tep_ho_so'
                      ? 'bg-purple-900/60 text-purple-200 border-purple-500/50'
                      : 'bg-sky-900/60 text-sky-200 border-sky-500/50'
                  }`}
                >
                  {luotTrinh.doiTuongTrinh === 'tep_ho_so'
                    ? `Tệp hồ sơ (${luotTrinh.soLuongTaiLieu} tài liệu)`
                    : 'Văn bản riêng lẻ'}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white truncate mt-0.5" title={luotTrinh.tenDoiTuong}>
                {luotTrinh.tenDoiTuong}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {luotTrinh.maHoSoLienQuan && onOpenQuyTrinh && (
              <button
                type="button"
                onClick={() => onOpenQuyTrinh(luotTrinh.maHoSoLienQuan)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                title="Mở tab Quy trình xử lý đơn tương ứng"
              >
                <span className="material-symbols-outlined text-[15px]">account_tree</span>
                <span>Xem quy trình</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng drawer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BANNER THAO TÁC CÁN BỘ: THU HỒI / CHỈNH SỬA / TẠO TRÌNH KÝ                */}
        {/* ========================================================================= */}
        {luotTrinh.status === 'da_thu_hoi' ? (
          <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between gap-3 text-xs shrink-0 animate-fade-in">
            <div className="flex items-center gap-2 text-slate-700 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-slate-500 shrink-0">undo</span>
              <span className="truncate">
                <strong>Lượt trình ký đã được thu hồi.</strong> Cán bộ có thể chỉnh sửa văn bản thành phần bên dưới hoặc tạo lượt trình mới.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {luotTrinh.danhSachTaiLieu[0] && (
                <button
                  type="button"
                  onClick={() => handleOpenEditDoc(luotTrinh.danhSachTaiLieu[0])}
                  className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit_note</span>
                  <span>Sửa văn bản</span>
                </button>
              )}
              {onTrinhLaiModal && (
                <button
                  type="button"
                  onClick={() => onTrinhLaiModal(luotTrinh)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">send</span>
                  <span>Tạo trình ký lại</span>
                </button>
              )}
            </div>
          </div>
        ) : canThuHoi ? (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-xs shrink-0 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-900 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">hourglass_top</span>
              <span className="truncate">
                Văn bản đang trong luồng ký duyệt Lãnh đạo. Cán bộ có thể <strong>Thu hồi trình ký</strong> để mở khóa chỉnh sửa văn bản.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsThuHoiModalOpen(true)}
              className="px-2.5 py-1 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">undo</span>
              <span>Thu hồi ngay</span>
            </button>
          </div>
        ) : null}

        {/* ========================================================================= */}
        {/* 2. SUB-NAV TABS                                                           */}
        {/* ========================================================================= */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto py-2 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'hover:bg-slate-200/60'
              }`}
            >
              Tất cả thông tin
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'info' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'hover:bg-slate-200/60'
              }`}
            >
              A. Thông tin lượt trình
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'docs' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'hover:bg-slate-200/60'
              }`}
            >
              <span>B. Đối tượng trình</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {luotTrinh.danhSachTaiLieu.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'flow' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'hover:bg-slate-200/60'
              }`}
            >
              C. Người nhận &amp; Luồng xử lý
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'history' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'hover:bg-slate-200/60'
              }`}
            >
              <span>D. Lịch sử</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {luotTrinh.lichSuXuLy.length}
              </span>
            </button>
          </div>

          {/* Badge Lượt trình hiện tại */}
          <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
            Lượt {luotTrinh.luotTrinhNumber}/{luotTrinh.tongSoLuotTrinh}
          </span>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN CONTENT BODY (SCROLLABLE)                                         */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Banner Thông báo nếu bị trả lại / yêu cầu chỉnh sửa */}
          {luotTrinh.lyDoTraLai && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
                <span>LÝ DO TRẢ LẠI / YÊU CẦU CHỈNH SỬA CỦA LÃNH ĐẠO:</span>
              </div>
              <p className="text-[11.5px] text-amber-800 leading-relaxed italic pl-6">
                "{luotTrinh.lyDoTraLai}"
              </p>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* A. THÔNG TIN LƯỢT TRÌNH                                                  */}
          {/* ----------------------------------------------------------------------- */}
          {(activeTab === 'all' || activeTab === 'info') && (
            <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                    A
                  </span>
                  <span>THÔNG TIN LƯỢT TRÌNH KÝ</span>
                </div>
                <span className="font-mono text-slate-500 font-bold text-[11px]">{luotTrinh.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Người tạo / Người trình:</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{luotTrinh.nguoiTrinh}</div>
                  <div className="text-[10.5px] text-slate-500">{luotTrinh.chucVuNguoiTrinh}</div>
                  <div className="text-[10px] text-slate-400">{luotTrinh.donViTrinh}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời gian trình ký:</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{luotTrinh.thoiGianTrinh}</div>
                  <div className="text-[10.5px] text-slate-500">
                    Khởi tạo: {luotTrinh.thoiGianTao} {luotTrinh.hanXuLy && `• Hạn xử lý: ${luotTrinh.hanXuLy}`}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-0.2 rounded text-[9.5px] font-bold ${
                        luotTrinh.mucDoUuTien === 'hoa_toc'
                          ? 'bg-rose-100 text-rose-800'
                          : luotTrinh.mucDoUuTien === 'khan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Ưu tiên: {luotTrinh.mucDoUuTien.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nội dung / Yêu cầu trình ký:</span>
                  <p className="text-[11.5px] text-slate-800 font-medium mt-1 leading-relaxed">
                    {luotTrinh.noiDungYeuCau}
                  </p>
                </div>

                <div className="sm:col-span-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-200/80 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-900 block">Hồ sơ nghiệp vụ &amp; Quy trình liên quan:</span>
                    <div className="font-bold text-slate-900 text-xs mt-0.5">
                      {luotTrinh.maHoSoLienQuan} — {luotTrinh.tieuDeDon}
                    </div>
                    {luotTrinh.tenStepQuyTrinh && (
                      <div className="text-[10.5px] text-blue-800 mt-0.5">
                        {luotTrinh.tenStepQuyTrinh}
                      </div>
                    )}
                  </div>
                  {luotTrinh.maHoSoLienQuan && onOpenQuyTrinh && (
                    <button
                      type="button"
                      onClick={() => onOpenQuyTrinh(luotTrinh.maHoSoLienQuan)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      <span>Mở xem quy trình đơn</span>
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* B. ĐỐI TƯỢNG ĐƯỢC TRÌNH (VĂN BẢN ĐƠN LẺ HOẶC TỆP HỒ SƠ)                */}
          {/* ----------------------------------------------------------------------- */}
          {(activeTab === 'all' || activeTab === 'docs') && (
            <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                    B
                  </span>
                  <span>ĐỐI TƯỢNG ĐƯỢC TRÌNH KÝ</span>
                </div>
                <span className="text-[10.5px] font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {luotTrinh.doiTuongTrinh === 'tep_ho_so'
                    ? `Tệp hồ sơ (${luotTrinh.danhSachTaiLieu.length} tài liệu thành phần)`
                    : 'Văn bản đơn lẻ'}
                </span>
              </div>

              {/* Hướng dẫn nghiệp vụ cấu hình tài liệu */}
              <p className="text-[11px] text-slate-500 italic">
                * Lưu ý nghiệp vụ: Hệ thống phân biệt rõ ràng yêu cầu xử lý theo từng tài liệu (Cần ký, Cần phê duyệt hoặc Chỉ tham khảo). Không mặc định tất cả đều phải ký.
              </p>

              {/* Danh sách các tài liệu thành phần */}
              <div className="space-y-2.5">
                {luotTrinh.danhSachTaiLieu.map((doc, idx) => {
                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-start justify-between gap-3 shadow-2xs group"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs hover:text-blue-700 cursor-pointer" onClick={() => setSelectedDocToView(doc)}>
                              {idx + 1}. {doc.tenTaiLieu}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                              {doc.phienBan}
                            </span>
                            {doc.soKyHieu && (
                              <span className="font-mono text-[10px] text-slate-500">
                                Số: {doc.soKyHieu}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10.5px] text-slate-500 flex-wrap">
                            <span>Loại: <strong className="text-slate-700">{doc.loaiTaiLieu}</strong></span>
                            <span>•</span>
                            <span>Soạn: <strong>{doc.nguoiSoan || luotTrinh.nguoiTrinh}</strong></span>
                            {doc.dungLuong && <span>• {doc.dungLuong}</span>}
                          </div>

                          {/* Badge Yêu cầu xử lý theo từng tài liệu */}
                          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                doc.yeuCauXuLy === 'ky_va_phe_duyet'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : doc.yeuCauXuLy === 'phe_duyet'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : doc.yeuCauXuLy === 'ky'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {doc.yeuCauXuLy === 'ky_va_phe_duyet'
                                ? 'Yêu cầu: Ký & Phê duyệt'
                                : doc.yeuCauXuLy === 'phe_duyet'
                                  ? 'Yêu cầu: Phê duyệt (Ký số CA)'
                                  : doc.yeuCauXuLy === 'ky'
                                    ? 'Yêu cầu: Ký nháy chuyên môn'
                                    : 'Chỉ dùng để tham khảo'}
                            </span>

                            {doc.trangThaiXuLy === 'da_phe_duyet' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                <span>Đã phê duyệt điện tử</span>
                              </span>
                            )}
                            {doc.trangThaiXuLy === 'da_ky' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">draw</span>
                                <span>Đã ký nháy</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCanBo && (
                          <button
                            type="button"
                            onClick={() => {
                              if (canEditDocs) {
                                handleOpenEditDoc(doc);
                              } else if (canThuHoi) {
                                if (window.confirm('Văn bản đang trong luồng ký duyệt của Lãnh đạo. Bạn có muốn THU HỒI LƯỢT TRÌNH để mở khóa chỉnh sửa văn bản này không?')) {
                                  setIsThuHoiModalOpen(true);
                                }
                              } else {
                                handleOpenEditDoc(doc);
                              }
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shadow-2xs ${
                              canEditDocs
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                            title="Chỉnh sửa nội dung, số hiệu và yêu cầu xử lý của văn bản"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit_note</span>
                            <span>Sửa văn bản</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedDocToView(doc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[11px] transition-colors cursor-pointer shrink-0 shadow-2xs"
                          title="Xem chi tiết toàn văn văn bản"
                        >
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                          <span>Xem file</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* C. NGƯỜI NHẬN TRÌNH VÀ LUỒNG XỬ LÝ                                     */}
          {/* ----------------------------------------------------------------------- */}
          {(activeTab === 'all' || activeTab === 'flow') && (
            <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    C
                  </span>
                  <span>NGƯỜI NHẬN TRÌNH &amp; LUỒNG XỬ LÝ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      luotTrinh.kieuTrinh === 'dong_thoi'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}
                  >
                    {luotTrinh.kieuTrinh === 'dong_thoi' ? 'Trình đồng thời (Parallel)' : 'Trình tuần tự (Sequential)'}
                  </span>
                </div>
              </div>

              {/* Diễn giải luồng */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                {luotTrinh.kieuTrinh === 'tuan_tu' ? (
                  <p>
                    Luồng <strong>Trình tuần tự</strong>: Lãnh đạo cấp trước ký duyệt hoàn tất mới tự động chuyển tiếp nhiệm vụ đến lãnh đạo kế tiếp theo thứ tự 1 → 2.
                  </p>
                ) : (
                  <p>
                    Luồng <strong>Trình đồng thời</strong>: Văn bản được gửi song song đến nhiều Lãnh đạo. Hệ thống theo dõi trạng thái độc lập của từng đồng chí và tổng hợp kết quả chung của lượt trình.
                  </p>
                )}
              </div>

              {/* Danh sách người nhận trình */}
              <div className="space-y-3">
                {luotTrinh.danhSachNguoiNhan.map((signer, idx) => {
                  const isDoneKy = signer.trangThai === 'da_ky';
                  const isDonePheDuyet = signer.trangThai === 'da_phe_duyet';
                  const isPending = signer.trangThai === 'dang_cho_xu_ly';
                  const isTraLai = signer.trangThai === 'da_tra_lai' || signer.trangThai === 'yeu_cau_chinh_sua';
                  const isTuChoi = signer.trangThai === 'tu_choi';

                  return (
                    <div
                      key={signer.id}
                      className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                        isDonePheDuyet
                          ? 'bg-emerald-50/40 border-emerald-300'
                          : isDoneKy
                            ? 'bg-sky-50/40 border-sky-300'
                            : isTraLai
                              ? 'bg-amber-50/60 border-amber-300'
                              : isTuChoi
                                ? 'bg-rose-50/50 border-rose-300'
                                : isPending
                                  ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-200'
                                  : 'bg-slate-50/50 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                              signer.avatarBg || 'bg-blue-700'
                            }`}
                          >
                            {luotTrinh.kieuTrinh === 'tuan_tu' ? idx + 1 : signer.hoTen.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">{signer.hoTen}</span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                ({signer.chucVu})
                              </span>
                            </div>
                            <div className="text-[10.5px] text-slate-500">
                              Yêu cầu hành động: <strong className="text-slate-800">
                                {signer.hanhDongYeuCau === 'phe_duyet'
                                  ? 'Phê duyệt'
                                  : signer.hanhDongYeuCau === 'ky'
                                    ? 'Ký nháy'
                                    : 'Ký & Phê duyệt'}
                              </strong>
                              {luotTrinh.kieuTrinh === 'tuan_tu' && ` • Thứ tự: #${signer.thuTu}`}
                            </div>
                          </div>
                        </div>

                        {/* Badge trạng thái */}
                        <div className="text-right shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                              isDonePheDuyet
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isDoneKy
                                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                                  : isTraLai
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : isTuChoi
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : isPending
                                        ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse'
                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {isDonePheDuyet
                                ? 'verified'
                                : isDoneKy
                                  ? 'draw'
                                  : isTraLai
                                    ? 'assignment_return'
                                    : isTuChoi
                                      ? 'cancel'
                                      : isPending
                                        ? 'pending'
                                        : 'hourglass_empty'}
                            </span>
                            <span>
                              {isDonePheDuyet
                                ? 'ĐÃ PHÊ DUYỆT'
                                : isDoneKy
                                  ? 'ĐÃ KÝ'
                                  : isTraLai
                                    ? 'YÊU CẦU SỬA / TRẢ LẠI'
                                    : isTuChoi
                                      ? 'TỪ CHỐI'
                                      : isPending
                                        ? 'ĐANG XỬ LÝ'
                                        : 'CHƯA ĐẾN LƯỢT'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Ý kiến nhận xét / chỉ đạo của Lãnh đạo */}
                      {signer.yKien && (
                        <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-800 leading-relaxed">
                          <span className="font-bold text-slate-600 block text-[10px] uppercase">Ý kiến chỉ đạo:</span>
                          <span className="italic">"{signer.yKien}"</span>
                        </div>
                      )}

                      {/* Chữ ký số nếu đã ký */}
                      {signer.chuKySo && (
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-[10px] text-emerald-900 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-emerald-700 text-[16px]">verified</span>
                            <span>
                              Ký số CA: <strong>{signer.chuKySo.nguoiKy}</strong> • {signer.chuKySo.loaiChungThu}
                            </span>
                          </div>
                          <span className="font-mono text-emerald-700">{signer.chuKySo.thoiGianKy}</span>
                        </div>
                      )}

                      {/* Nút hành động trực tiếp nếu tài khoản là Lãnh đạo này */}
                      {currentAccount?.role === 'lanh_dao' && (signer.trangThai === 'dang_cho_xu_ly' || signer.trangThai === 'chua_den_luot') && (
                        <div className="pt-2 flex items-center gap-2 justify-end border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleOpenLeaderAction('phe_duyet', signer)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] cursor-pointer shadow-2xs"
                          >
                            Phê duyệt &amp; Ký số
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenLeaderAction('ky_nhay', signer)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] cursor-pointer shadow-2xs"
                          >
                            Ký nháy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenLeaderAction('tra_lai', signer)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10.5px] cursor-pointer shadow-2xs"
                          >
                            Trả lại / Yêu cầu sửa
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* D. LỊCH SỬ XỬ LÝ (TIMELINE DÒNG THỜI GIAN)                              */}
          {/* ----------------------------------------------------------------------- */}
          {(activeTab === 'all' || activeTab === 'history') && (
            <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                    D
                  </span>
                  <span>DÒNG THỜI GIAN &amp; LỊCH SỬ CÁC LƯỢT TRÌNH</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Lưu trọn vẹn lịch sử, không ghi đè
                </span>
              </div>

              {/* Tabs chọn lượt trình nếu có nhiều hơn 1 lượt */}
              {luotTrinh.tongSoLuotTrinh > 1 && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 pl-1">Xem lịch sử:</span>
                  {[1, 2].map((roundNum) => (
                    <button
                      key={roundNum}
                      type="button"
                      onClick={() => setSelectedRoundFilter(roundNum)}
                      className={`px-3 py-1 rounded-md font-bold text-[10.5px] transition-colors cursor-pointer ${
                        selectedRoundFilter === roundNum
                          ? 'bg-white text-blue-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Lượt {roundNum} {roundNum === 1 ? '(Bị trả lại)' : '(Trình lại & Phê duyệt)'}
                    </button>
                  ))}
                </div>
              )}

              {/* Danh sách timeline events */}
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {luotTrinh.lichSuXuLy
                  .filter((log) => {
                    if (luotTrinh.tongSoLuotTrinh > 1 && selectedRoundFilter) {
                      return log.luotTrinhIndex === selectedRoundFilter;
                    }
                    return true;
                  })
                  .map((log) => {
                    const isKy = log.hanhDong.includes('Ký');
                    const isPheDuyet = log.hanhDong.includes('Phê duyệt');
                    const isTraLai = log.hanhDong.includes('Trả lại') || log.hanhDong.includes('chỉnh sửa');
                    const isTuChoi = log.hanhDong.includes('Từ chối');

                    return (
                      <div key={log.id} className="relative group">
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[11px] text-white shadow-2xs ${
                            isPheDuyet
                              ? 'bg-emerald-600'
                              : isKy
                                ? 'bg-sky-600'
                                : isTraLai
                                  ? 'bg-amber-600'
                                  : isTuChoi
                                    ? 'bg-rose-600'
                                    : 'bg-blue-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {isPheDuyet
                              ? 'verified'
                              : isKy
                                ? 'draw'
                                : isTraLai
                                  ? 'assignment_return'
                                  : isTuChoi
                                    ? 'cancel'
                                    : 'send'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{log.hanhDong}</span>
                            <span className="font-mono text-[10px] text-slate-500">{log.thoiGian}</span>
                          </div>

                          <div className="text-[11px] text-slate-600">
                            Thực hiện: <strong>{log.nguoiThucHien}</strong> ({log.chucVu}) • Bản xử lý: <strong>{log.phienBanXuLy}</strong>
                          </div>

                          {log.noiDungYKien && (
                            <p className="text-[11px] text-slate-800 italic bg-white p-2 rounded-lg border border-slate-200/80 mt-1">
                              "{log.noiDungYKien}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. FOOTER ACTION BAR (PHÂN QUYỀN VAI TRÒ)                                  */}
        {/* ========================================================================= */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold">Đang thao tác với quyền:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10.5px] ${
                currentAccount?.role === 'lanh_dao'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}
            >
              {currentAccount?.roleLabel || 'Cán bộ thụ lý hồ sơ'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Action Cán bộ 1: Sửa văn bản */}
            {isCanBo && luotTrinh.danhSachTaiLieu.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (canEditDocs) {
                    handleOpenEditDoc(luotTrinh.danhSachTaiLieu[0]);
                  } else if (canThuHoi) {
                    if (window.confirm('Văn bản đang trong luồng ký duyệt của Lãnh đạo. Bạn có muốn THU HỒI LƯỢT TRÌNH để mở khóa chỉnh sửa văn bản này không?')) {
                      setIsThuHoiModalOpen(true);
                    }
                  } else {
                    handleOpenEditDoc(luotTrinh.danhSachTaiLieu[0]);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                  canEditDocs
                    ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
                title="Chỉnh sửa nội dung và thông tin văn bản"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-700">edit_note</span>
                <span>Sửa văn bản</span>
              </button>
            )}

            {/* Action Cán bộ 2: Thu hồi lượt trình */}
            {canThuHoi && (
              <button
                type="button"
                onClick={() => setIsThuHoiModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Thu hồi lượt trình để cập nhật nội dung văn bản"
              >
                <span className="material-symbols-outlined text-[15px]">undo</span>
                <span>Thu hồi trình ký</span>
              </button>
            )}

            {/* Action Cán bộ 3: Tạo trình ký / Trình lại */}
            {isCanBo && onTrinhLaiModal && (
              <button
                type="button"
                onClick={() => onTrinhLaiModal(luotTrinh)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-[#004ac6] hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                title="Khởi tạo lượt trình ký mới hoặc trình lại văn bản này"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                <span>{canTrinhLai ? 'Trình lại (Lượt mới)' : 'Tạo trình ký'}</span>
              </button>
            )}

            {/* Action Lãnh đạo: Phê duyệt / Ký số */}
            {currentAccount?.role === 'lanh_dao' && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenLeaderAction('tra_lai')}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">assignment_return</span>
                  <span>Trả lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenLeaderAction('phe_duyet')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Phê duyệt &amp; Ký số</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Modal Xem Tài liệu A4 / PDF */}
        <XemTaiLieuModal
          document={selectedDocToView}
          isOpen={!!selectedDocToView}
          onClose={() => setSelectedDocToView(null)}
          maHoSoLienQuan={luotTrinh.maHoSoLienQuan}
          tieuDeDon={luotTrinh.tieuDeDon}
        />

        {/* Modal Thao tác Lãnh đạo Ký số / Trả lại */}
        <XuLyLanhDaoModal
          isOpen={isLeaderActionModalOpen}
          onClose={() => setIsLeaderActionModalOpen(false)}
          luotTrinh={luotTrinh}
          leaderInfo={activeLeaderItem}
          actionKind={selectedLeaderActionKind}
          onConfirmAction={handleConfirmLeaderAction}
        />

        {/* ========================================================================= */}
        {/* MODAL CÁN BỘ: CHỈNH SỬA VĂN BẢN TRONG LƯỢT TRÌNH                          */}
        {/* ========================================================================= */}
        {isEditDocModalOpen && editingDoc && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsEditDocModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-[#004ac6] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-2xl">edit_note</span>
                  <div>
                    <h3 className="font-bold text-sm">Chỉnh sửa nội dung văn bản trình ký</h3>
                    <p className="text-[11px] text-blue-100 font-mono">
                      Văn bản ID: {editingDoc.id} • Lượt trình: {luotTrinh.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditDocModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEditDoc} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">
                      Tên văn bản / tài liệu <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editDocForm.tenTaiLieu}
                      onChange={(e) => setEditDocForm({ ...editDocForm, tenTaiLieu: e.target.value })}
                      placeholder="VD: Báo cáo kết quả xác minh về việc giải quyết đơn..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Số / Ký hiệu văn bản
                    </label>
                    <input
                      type="text"
                      value={editDocForm.soKyHieu}
                      onChange={(e) => setEditDocForm({ ...editDocForm, soKyHieu: e.target.value })}
                      placeholder="VD: 45/BC-PC03 hoặc 12/TTr-CQĐT"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Phiên bản cập nhật
                    </label>
                    <input
                      type="text"
                      value={editDocForm.phienBan}
                      onChange={(e) => setEditDocForm({ ...editDocForm, phienBan: e.target.value })}
                      placeholder="VD: v1.1 hoặc v2.0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Loại văn bản
                    </label>
                    <select
                      value={editDocForm.loaiTaiLieu}
                      onChange={(e) => setEditDocForm({ ...editDocForm, loaiTaiLieu: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-[#004ac6] cursor-pointer"
                    >
                      <option value="Báo cáo đề xuất">Báo cáo đề xuất</option>
                      <option value="Tờ trình thụ lý">Tờ trình thụ lý</option>
                      <option value="Quyết định giải quyết">Quyết định giải quyết</option>
                      <option value="Thông báo thụ lý">Thông báo thụ lý</option>
                      <option value="Biên bản xác minh">Biên bản xác minh</option>
                      <option value="Công văn phối hợp">Công văn phối hợp</option>
                      <option value="Tài liệu chứng cứ">Tài liệu chứng cứ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Yêu cầu xử lý từ Lãnh đạo
                    </label>
                    <select
                      value={editDocForm.yeuCauXuLy}
                      onChange={(e) => setEditDocForm({ ...editDocForm, yeuCauXuLy: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-[#004ac6] cursor-pointer"
                    >
                      <option value="ky">Yêu cầu: Ký nháy chuyên môn</option>
                      <option value="phe_duyet">Yêu cầu: Phê duyệt (Ký số CA)</option>
                      <option value="ky_va_phe_duyet">Yêu cầu: Ký nháy &amp; Phê duyệt</option>
                      <option value="tham_khao">Chỉ dùng để tham khảo (Không ký)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">
                      Trích yếu nội dung
                    </label>
                    <input
                      type="text"
                      value={editDocForm.noiDungTrichYeu}
                      onChange={(e) => setEditDocForm({ ...editDocForm, noiDungTrichYeu: e.target.value })}
                      placeholder="VD: V/v thụ lý xác minh đơn tố giác tội phạm số 2026/ĐTG-001..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">
                      Toàn văn / Nội dung chi tiết văn bản
                    </label>
                    <textarea
                      rows={8}
                      value={editDocForm.noiDungChiTiet}
                      onChange={(e) => setEditDocForm({ ...editDocForm, noiDungChiTiet: e.target.value })}
                      placeholder="Nhập nội dung dự thảo văn bản căn cứ, diễn biến, nhận xét và đề xuất xử lý..."
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs leading-relaxed text-slate-900 focus:bg-white focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>
                </div>

                {/* Footer Modal Sửa */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditDocModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[17px]">save</span>
                    <span>Lưu cập nhật văn bản</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL CÁN BỘ: XÁC NHẬN THU HỒI LƯỢT TRÌNH KÝ                              */}
        {/* ========================================================================= */}
        {isThuHoiModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsThuHoiModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-rose-50 border-b border-rose-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">undo</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Thu hồi lượt trình ký</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Mã lượt trình: {luotTrinh.id}</p>
                </div>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <p className="text-slate-700 leading-relaxed">
                  Bạn có chắc chắn muốn thu hồi lượt trình ký này không? Sau khi thu hồi, văn bản sẽ mở khóa để bạn có thể <strong>chỉnh sửa nội dung</strong> và <strong>tạo lượt trình ký lại</strong>.
                </p>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Lý do thu hồi:
                  </label>
                  <textarea
                    rows={3}
                    value={lyDoThuHoi}
                    onChange={(e) => setLyDoThuHoi(e.target.value)}
                    placeholder="VD: Cán bộ phát hiện cần bổ sung chứng cứ / Chỉnh sửa lại dự thảo theo thông tin mới..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Gợi ý nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setLyDoThuHoi('Bổ sung thêm tài liệu chứng cứ mới thu thập')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    + Bổ sung tài liệu
                  </button>
                  <button
                    type="button"
                    onClick={() => setLyDoThuHoi('Cần hiệu chỉnh lại điều khoản căn cứ pháp lý trong dự thảo')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    + Sửa căn cứ pháp lý
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsThuHoiModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmThuHoi}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">undo</span>
                    <span>Xác nhận thu hồi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
