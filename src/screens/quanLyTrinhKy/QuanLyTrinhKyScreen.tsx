// src/screens/quanLyTrinhKy/QuanLyTrinhKyScreen.tsx
import React, { useState, useMemo } from 'react';
import { Screen } from '../../types';
import {
  LuotTrinhKy,
  DoiTuongTrinhType,
  HanhDongYeuCauType,
  TrinhKyStatus,
  HoSoDocumentItem,
} from '../../types/quanLyTrinhKy';
import { CurrentUserAccount, DEMO_ACCOUNTS } from '../../types/signing';
import { INITIAL_QUAN_LY_TRINH_KY } from '../../constants/quanLyTrinhKyData';
import ChiTietLuotTrinhDrawer from './ChiTietLuotTrinhDrawer';
import TaoLuotTrinhModal from './TaoLuotTrinhModal';
import XemTaiLieuModal from './XemTaiLieuModal';

interface QuanLyTrinhKyScreenProps {
  onNav: (s: Screen) => void;
  currentAccount?: CurrentUserAccount;
  onSwitchAccount?: (role: 'can_bo' | 'lanh_dao') => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  initialLuotTrinhId?: string;
}

export default function QuanLyTrinhKyScreen({
  onNav,
  currentAccount,
  onSwitchAccount,
  onSelectHoSo,
  initialLuotTrinhId,
}: QuanLyTrinhKyScreenProps) {
  // Master list of submission items
  const [luotTrinhList, setLuotTrinhList] = useState<LuotTrinhKy[]>(() => {
    try {
      const saved = localStorage.getItem('app_quan_ly_trinh_ky');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_QUAN_LY_TRINH_KY;
  });

  const saveList = (newList: LuotTrinhKy[]) => {
    setLuotTrinhList(newList);
    try {
      localStorage.setItem('app_quan_ly_trinh_ky', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  // ---------------------------------------------------------------------------
  // FILTER STATES (MỤC A: BỘ LỌC VÀ TÌM KIẾM THEO ĐÚNG 8 TIÊU CHÍ)
  // ---------------------------------------------------------------------------
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterDoiTuong, setFilterDoiTuong] = useState<string>('all');
  const [filterLoaiVanBan, setFilterLoaiVanBan] = useState<string>('all');
  const [filterNguoiTrinh, setFilterNguoiTrinh] = useState<string>('all');
  const [filterNguoiNhan, setFilterNguoiNhan] = useState<string>('all');
  const [filterNgayTrinh, setFilterNgayTrinh] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterHanhDong, setFilterHanhDong] = useState<string>('all');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLuotTrinhId, setSelectedLuotTrinhId] = useState<string | null>(initialLuotTrinhId || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(!!initialLuotTrinhId);

  // Quick preview popover for dossier documents
  const [dossierQuickViewItem, setDossierQuickViewItem] = useState<LuotTrinhKy | null>(null);
  const [selectedDocToView, setSelectedDocToView] = useState<HoSoDocumentItem | null>(null);

  // Filter list
  const filteredList = useMemo(() => {
    return luotTrinhList.filter((item) => {
      // 1. Từ khóa
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchId = item.id.toLowerCase().includes(kw);
        const matchTitle = item.tenDoiTuong.toLowerCase().includes(kw);
        const matchHoSo = item.maHoSoLienQuan.toLowerCase().includes(kw);
        const matchDonTitle = item.tieuDeDon.toLowerCase().includes(kw);
        const matchDocName = item.danhSachTaiLieu.some(
          (d) => d.tenTaiLieu.toLowerCase().includes(kw) || (d.soKyHieu && d.soKyHieu.toLowerCase().includes(kw))
        );
        if (!matchId && !matchTitle && !matchHoSo && !matchDonTitle && !matchDocName) {
          return false;
        }
      }

      // 2. Loại đối tượng trình (Văn bản hoặc Tệp hồ sơ)
      if (filterDoiTuong !== 'all' && item.doiTuongTrinh !== filterDoiTuong) {
        return false;
      }

      // 3. Loại văn bản
      if (filterLoaiVanBan !== 'all') {
        const hasLoai = item.danhSachTaiLieu.some((d) => d.loaiTaiLieu.toLowerCase().includes(filterLoaiVanBan.toLowerCase()));
        if (!hasLoai) return false;
      }

      // 4. Người trình
      if (filterNguoiTrinh !== 'all' && !item.nguoiTrinh.toLowerCase().includes(filterNguoiTrinh.toLowerCase())) {
        return false;
      }

      // 5. Người nhận trình / Lãnh đạo
      if (filterNguoiNhan !== 'all') {
        const hasLeader = item.danhSachNguoiNhan.some((n) =>
          n.hoTen.toLowerCase().includes(filterNguoiNhan.toLowerCase())
        );
        if (!hasLeader) return false;
      }

      // 6. Ngày trình
      if (filterNgayTrinh && !item.thoiGianTrinh.includes(filterNgayTrinh)) {
        return false;
      }

      // 7. Trạng thái trình ký
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }

      // 8. Loại hành động yêu cầu: Ký, Phê duyệt, hoặc Ký và phê duyệt
      if (filterHanhDong !== 'all' && item.hanhDongYeuCauChung !== filterHanhDong) {
        return false;
      }

      return true;
    });
  }, [
    luotTrinhList,
    searchKeyword,
    filterDoiTuong,
    filterLoaiVanBan,
    filterNguoiTrinh,
    filterNguoiNhan,
    filterNgayTrinh,
    filterStatus,
    filterHanhDong,
  ]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = luotTrinhList.length;
    const dangCho = luotTrinhList.filter((d) => d.status === 'dang_cho_xu_ly' || d.status === 'da_trinh').length;
    const daKy = luotTrinhList.filter((d) => d.status === 'da_ky').length;
    const daPheDuyet = luotTrinhList.filter((d) => d.status === 'da_phe_duyet' || d.status === 'da_ky_va_phe_duyet').length;
    const traLai = luotTrinhList.filter((d) => d.status === 'da_tra_lai' || d.status === 'yeu_cau_chinh_sua').length;
    return { total, dangCho, daKy, daPheDuyet, traLai };
  }, [luotTrinhList]);

  const activeDrawerItem = useMemo(() => {
    return luotTrinhList.find((i) => i.id === selectedLuotTrinhId) || null;
  }, [luotTrinhList, selectedLuotTrinhId]);

  const handleOpenDetail = (item: LuotTrinhKy) => {
    setSelectedLuotTrinhId(item.id);
    setIsDrawerOpen(true);
  };

  const handleUpdateItem = (updated: LuotTrinhKy) => {
    saveList(luotTrinhList.map((i) => (i.id === updated.id ? updated : i)));
    showToast(`✓ Đã cập nhật trạng thái lượt trình: ${updated.id}`);
  };

  const handleCreateNew = (newLuotTrinh: LuotTrinhKy) => {
    saveList([newLuotTrinh, ...luotTrinhList]);
    setSelectedLuotTrinhId(newLuotTrinh.id);
    setIsDrawerOpen(true);
    showToast(`✓ Đã tạo thành công lượt trình ký mới: ${newLuotTrinh.id}`);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setFilterDoiTuong('all');
    setFilterLoaiVanBan('all');
    setFilterNguoiTrinh('all');
    setFilterNguoiNhan('all');
    setFilterNgayTrinh('');
    setFilterStatus('all');
    setFilterHanhDong('all');
  };

  // Helper for status badge
  const renderStatusBadge = (status: TrinhKyStatus) => {
    switch (status) {
      case 'ban_nhap':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Bản nháp</span>;
      case 'da_trinh':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Đã trình</span>;
      case 'dang_cho_xu_ly':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">Đang chờ xử lý</span>;
      case 'dang_xu_ly_mot_phan':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Đang xử lý một phần</span>;
      case 'da_ky':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-sky-50 text-sky-800 border border-sky-300 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">draw</span>Đã ký</span>;
      case 'da_phe_duyet':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span>Đã phê duyệt</span>;
      case 'da_ky_va_phe_duyet':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-teal-50 text-teal-800 border border-teal-300 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span>Đã ký &amp; phê duyệt</span>;
      case 'yeu_cau_chinh_sua':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-orange-50 text-orange-800 border border-orange-300">Yêu cầu chỉnh sửa</span>;
      case 'da_tra_lai':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-400">Đã trả lại</span>;
      case 'da_tu_choi':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-800 border border-rose-300">Đã từ chối</span>;
      case 'da_thu_hoi':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-200 text-slate-700 border border-slate-400">Đã thu hồi</span>;
      case 'da_huy':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-100 text-rose-700 border border-rose-300">Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold animate-fade-in border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER TOOLBAR                                                     */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-2xs gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-2xl">approval</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight uppercase font-headline-md">
                QUẢN LÝ TRÌNH KÝ &amp; PHÊ DUYỆT
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Menu Quản lý tập trung
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quản lý tất cả các lượt trình ký văn bản đơn lẻ, tệp hồ sơ nhiều tài liệu và hồ sơ nghiệp vụ từ cán bộ đến lãnh đạo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          {onSwitchAccount && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-bold text-slate-500 px-2">Đổi vai trò:</span>
              <button
                type="button"
                onClick={() => onSwitchAccount('can_bo')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${currentAccount?.role !== 'lanh_dao'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Cán bộ thụ lý
              </button>
              <button
                type="button"
                onClick={() => onSwitchAccount('lanh_dao')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${currentAccount?.role === 'lanh_dao'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Lãnh đạo ký duyệt
              </button>
            </div>
          )}

          {/* Nút Tạo lượt trình mới */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Tạo lượt trình ký mới</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS OVERVIEW CARDS                                                   */}
      {/* ========================================================================= */}
      <div className="px-6 py-3 bg-white/60 border-b border-slate-200 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => setFilterStatus('all')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${filterStatus === 'all'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
          >
            <div className="text-[10.5px] font-bold text-slate-500 uppercase">Tổng lượt trình</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{stats.total}</div>
          </div>

          <div
            onClick={() => setFilterStatus('dang_cho_xu_ly')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${filterStatus === 'dang_cho_xu_ly'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
          >
            <div className="text-[10.5px] font-bold text-amber-700 uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Đang chờ xử lý</span>
            </div>
            <div className="text-lg font-black text-amber-900 mt-0.5">{stats.dangCho}</div>
          </div>

          <div
            onClick={() => setFilterStatus('da_ky')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${filterStatus === 'da_ky'
              ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
          >
            <div className="text-[10.5px] font-bold text-sky-700 uppercase">Đã ký (Ký nháy)</div>
            <div className="text-lg font-black text-sky-900 mt-0.5">{stats.daKy}</div>
          </div>

          <div
            onClick={() => setFilterStatus('da_phe_duyet')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${filterStatus === 'da_phe_duyet'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
          >
            <div className="text-[10.5px] font-bold text-emerald-700 uppercase">Đã phê duyệt (CA)</div>
            <div className="text-lg font-black text-emerald-900 mt-0.5">{stats.daPheDuyet}</div>
          </div>

          <div
            onClick={() => setFilterStatus('da_tra_lai')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${filterStatus === 'da_tra_lai'
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
          >
            <div className="text-[10.5px] font-bold text-orange-700 uppercase">Yêu cầu sửa / Trả lại</div>
            <div className="text-lg font-black text-orange-900 mt-0.5">{stats.traLai}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MỤC A: BỘ LỌC VÀ TÌM KIẾM CHI TIẾT                                     */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 shadow-2xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Từ khóa */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm tên VB, số/ký hiệu, mã đơn, mã hồ sơ..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 2. Loại đối tượng trình */}
          <div>
            <select
              value={filterDoiTuong}
              onChange={(e) => setFilterDoiTuong(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <option value="all">Tất cả đối tượng trình</option>
              <option value="van_ban">Văn bản riêng lẻ</option>
              <option value="tep_ho_so">Tệp hồ sơ (nhiều tài liệu)</option>
            </select>
          </div>

          {/* 3. Loại văn bản */}
          <div>
            <select
              value={filterLoaiVanBan}
              onChange={(e) => setFilterLoaiVanBan(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <option value="all">Tất cả loại văn bản</option>
              <option value="Kế hoạch">Kế hoạch xác minh</option>
              <option value="Báo cáo">Báo cáo đề xuất / Báo cáo xác minh</option>
              <option value="Biên bản">Biên bản kiểm tra / Bàn giao</option>
              <option value="Quyết định">Quyết định hành chính</option>
              <option value="Thông báo">Thông báo kết luận</option>
              <option value="Tờ trình">Tờ trình</option>
            </select>
          </div>

          {/* 4. Trạng thái trình ký (Phân biệt chuẩn không gộp) */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="all">Tất cả trạng thái xử lý</option>
              <option value="ban_nhap">Bản nháp</option>
              <option value="da_trinh">Đã trình</option>
              <option value="dang_cho_xu_ly">Đang chờ xử lý</option>
              <option value="dang_xu_ly_mot_phan">Đang xử lý một phần</option>
              <option value="da_ky">Đã ký (Ký nháy chuyên môn)</option>
              <option value="da_phe_duyet">Đã phê duyệt (Ký số CA)</option>
              <option value="da_ky_va_phe_duyet">Đã ký và phê duyệt</option>
              <option value="yeu_cau_chinh_sua">Yêu cầu chỉnh sửa</option>
              <option value="da_tra_lai">Đã trả lại</option>
              <option value="da_tu_choi">Đã từ chối</option>
              <option value="da_thu_hoi">Đã thu hồi</option>
              <option value="da_huy">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Hàng filter phụ: Người trình, Lãnh đạo, Hành động yêu cầu, Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* 5. Người trình */}
          <div>
            <select
              value={filterNguoiTrinh}
              onChange={(e) => setFilterNguoiTrinh(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700"
            >
              <option value="all">Tất cả cán bộ trình</option>
              <option value="Nguyễn Văn An">Đại úy Nguyễn Văn An</option>
              <option value="Nguyễn Minh Anh">Nguyễn Minh Anh</option>
              <option value="Lê Minh Tuấn">Trung tá Lê Minh Tuấn</option>
              <option value="Trần Kim Chi">Đại úy Trần Kim Chi</option>
              <option value="Bùi Tuấn Anh">Thượng úy Bùi Tuấn Anh</option>
            </select>
          </div>

          {/* 6. Người nhận trình / Lãnh đạo */}
          <div>
            <select
              value={filterNguoiNhan}
              onChange={(e) => setFilterNguoiNhan(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700"
            >
              <option value="all">Tất cả lãnh đạo nhận trình</option>
              <option value="Phạm Đình Trọng">Thượng tá Phạm Đình Trọng</option>
              <option value="Trần Tuấn Nghĩa">Thượng tá Trần Tuấn Nghĩa</option>
              <option value="Vũ Hoàng Long">Thiếu tá Vũ Hoàng Long</option>
              <option value="Trần Văn Hùng">Trần Văn Hùng</option>
            </select>
          </div>

          {/* 7. Loại hành động yêu cầu */}
          <div>
            <select
              value={filterHanhDong}
              onChange={(e) => setFilterHanhDong(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700"
            >
              <option value="all">Tất cả loại hành động</option>
              <option value="ky">Chỉ yêu cầu Ký nháy</option>
              <option value="phe_duyet">Chỉ yêu cầu Phê duyệt</option>
              <option value="ky_va_phe_duyet">Yêu cầu cả Ký và Phê duyệt</option>
            </select>
          </div>

          {/* Nút reset */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 font-semibold">
              Tìm thấy: <strong className="text-blue-900">{filteredList.length}</strong> kết quả
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-3 w-28">Mã lượt</th>
              <th className="py-3 px-3 w-28">Đối tượng</th>
              <th className="py-3 px-3 min-w-[220px]">Tên văn bản / Hồ sơ</th>
              <th className="py-3 px-3 w-24 text-center">Số lượng</th>
              <th className="py-3 px-3 w-40">Đơn / Hồ sơ liên quan</th>
              <th className="py-3 px-3 w-32">Người trình</th>
              <th className="py-3 px-3 w-44">Người nhận trình</th>
              <th className="py-3 px-3 w-28">Ngày trình</th>
              <th className="py-3 px-3 min-w-[180px]">Nội dung yêu cầu</th>
              <th className="py-3 px-3 w-36"> Trạng thái</th>
              <th className="py-3 px-3 w-24 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                    folder_off
                  </span>
                  <span>Không tìm thấy lượt trình ký nào phù hợp với bộ lọc.</span>
                </td>
              </tr>
            ) : (
              filteredList.map((item, index) => {
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* 1. STT */}
                    <td className="py-3 px-3 text-center font-bold text-slate-400 text-xs">
                      {index + 1}
                    </td>

                    {/* 2. Mã lượt trình */}
                    <td className="py-3 px-3 font-mono font-bold text-blue-900 group-hover:text-blue-700">
                      {item.id}
                    </td>

                    {/* 3. Đối tượng trình */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.doiTuongTrinh === 'tep_ho_so'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {item.doiTuongTrinh === 'tep_ho_so' ? 'folder_copy' : 'description'}
                        </span>
                        <span>{item.doiTuongTrinh === 'tep_ho_so' ? 'Tệp hồ sơ' : 'Văn bản'}</span>
                      </span>
                    </td>

                    {/* 4. Tên văn bản / Hồ sơ */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors line-clamp-2">
                        {item.tenDoiTuong}
                      </div>
                      {item.doiTuongTrinh === 'tep_ho_so' && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDossierQuickViewItem(item);
                            }}
                            className="inline-flex items-center gap-1 text-[10.5px] font-bold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">list_alt</span>
                            <span>Xem nhanh {item.soLuongTaiLieu} tài liệu thành phần</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 5. Số lượng tài liệu */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {item.soLuongTaiLieu}
                      </span>
                    </td>

                    {/* 6. Đơn hoặc hồ sơ liên quan */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900 text-[11px]">
                        {item.maHoSoLienQuan}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={item.tieuDeDon}>
                        {item.tieuDeDon}
                      </div>
                    </td>

                    {/* 7. Người trình */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-xs">{item.nguoiTrinh}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{item.donViTrinh}</div>
                    </td>

                    {/* 8. Người nhận trình */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {item.danhSachNguoiNhan.map((signer) => (
                          <div key={signer.id} className="flex items-center gap-1.5 text-[11px]">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${signer.trangThai === 'da_phe_duyet'
                                ? 'bg-emerald-600'
                                : signer.trangThai === 'da_ky'
                                  ? 'bg-sky-600'
                                  : signer.trangThai === 'da_tra_lai'
                                    ? 'bg-amber-600'
                                    : 'bg-slate-300'
                                }`}
                            ></span>
                            <span className="font-semibold text-slate-800 truncate" title={signer.hoTen}>
                              {signer.hoTen}
                            </span>
                          </div>
                        ))}
                        <span
                          className={`text-[9.5px] px-1 rounded font-bold ${item.kieuTrinh === 'dong_thoi'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-sky-50 text-sky-700'
                            }`}
                        >
                          {item.kieuTrinh === 'dong_thoi' ? 'Trình đồng thời' : 'Trình tuần tự'}
                        </span>
                      </div>
                    </td>

                    {/* 9. Ngày trình */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {item.thoiGianTrinh}
                    </td>

                    {/* 10. Nội dung yêu cầu trình ký */}
                    <td className="py-3 px-3">
                      <p className="text-[11px] text-slate-700 line-clamp-2" title={item.noiDungYeuCau}>
                        {item.noiDungYeuCau}
                      </p>
                    </td>

                    {/* 11. Trạng thái xử lý */}
                    <td className="py-3 px-3">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* 12. Thao tác xem chi tiết */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                        title="Xem chi tiết lượt trình"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL XEM NHANH TÀI LIỆU THÀNH PHẦN CỦA TỆP HỒ SƠ                      */}
      {/* ========================================================================= */}
      {dossierQuickViewItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setDossierQuickViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-xl">folder_copy</span>
                <div>
                  <h3 className="font-bold text-xs">Danh sách tài liệu thành phần</h3>
                  <p className="text-[10.5px] text-slate-300 font-mono">{dossierQuickViewItem.id} — {dossierQuickViewItem.tenDoiTuong}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDossierQuickViewItem(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto text-xs">
              {dossierQuickViewItem.danhSachTaiLieu.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {idx + 1}. {doc.tenTaiLieu}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Loại: {doc.loaiTaiLieu} • Bản: {doc.phienBan} {doc.dungLuong && `• ${doc.dungLuong}`}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${doc.yeuCauXuLy === 'phe_duyet'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.yeuCauXuLy === 'ky'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                          }`}
                      >
                        {doc.yeuCauXuLy === 'phe_duyet'
                          ? 'Cần phê duyệt'
                          : doc.yeuCauXuLy === 'ky'
                            ? 'Cần ký nháy'
                            : 'Chỉ tham khảo'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDocToView(doc);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] cursor-pointer shrink-0"
                  >
                    Xem văn bản
                  </button>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const item = dossierQuickViewItem;
                  setDossierQuickViewItem(null);
                  handleOpenDetail(item);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                Mở chi tiết lượt trình đầy đủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DRAWER CHI TIẾT LƯỢT TRÌNH (A, B, C, D)                                */}
      {/* ========================================================================= */}
      <ChiTietLuotTrinhDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        luotTrinh={activeDrawerItem}
        currentAccount={currentAccount}
        onUpdateLuotTrinh={handleUpdateItem}
        onOpenQuyTrinh={(maDon) => {
          setIsDrawerOpen(false);
          if (onSelectHoSo) onSelectHoSo(maDon);
          onNav('quy-trinh-xu-ly');
        }}
        onTrinhLaiModal={(item) => {
          setIsDrawerOpen(false);
          setIsCreateModalOpen(true);
        }}
      />

      {/* ========================================================================= */}
      {/* 7. MODAL TẠO LƯỢT TRÌNH MỚI                                               */}
      {/* ========================================================================= */}
      <TaoLuotTrinhModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentAccount={currentAccount}
        onCreated={handleCreateNew}
      />

      {/* Modal Xem Tài liệu trực tiếp từ popover */}
      <XemTaiLieuModal
        document={selectedDocToView}
        isOpen={!!selectedDocToView}
        onClose={() => setSelectedDocToView(null)}
      />
    </div>
  );
}
