import React, { useState, useMemo } from 'react';
import { Screen, LuotNhan, DonDetail } from '../../types';

interface VanThuWorkItem {
  id: string;
  code: string;
  badge: string;
  nguoiNop: string;
  canBoNhan?: string;
  donViNhan?: string;
  hinhThuc: string;
  ngayNhan: string;
  status: 'chua_chuyen' | 'da_chuyen_can_bo' | 'da_chuyen_don_vi';
  noiDung?: string;
}

const INITIAL_VAN_THU_ITEMS: VanThuWorkItem[] = [
  // Cột 1: Chưa chuyển xử lý
  {
    id: 'LN-305',
    code: 'LN-305/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'chua_chuyen',
    noiDung: 'Tiếp nhận hồ sơ đơn phản ánh kiến nghị trực tiếp tại bộ phận một cửa',
  },
  {
    id: 'LN-291',
    code: 'LN-291/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'chua_chuyen',
    noiDung: 'Đơn kiến nghị về trật tự giao thông và quy hoạch hè phố',
  },
  {
    id: 'LN-280',
    code: 'LN-280/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'chua_chuyen',
    noiDung: 'Phản ánh tiếng ồn và vi phạm xả thải ban đêm',
  },
  {
    id: 'LN-242',
    code: 'LN-242/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'chua_chuyen',
    noiDung: 'Đơn đề nghị hướng dẫn thủ tục hành chính',
  },

  // Cột 2: Đã chuyển cán bộ
  {
    id: 'LN-315',
    code: 'LN-315/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    canBoNhan: 'Nguyễn Hoàng Nam',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'da_chuyen_can_bo',
    noiDung: 'Đã phân công cán bộ thụ lý kiểm tra tính hợp lệ',
  },
  {
    id: 'LN-313',
    code: 'LN-313/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    canBoNhan: 'Nguyễn Hoàng Nam',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'da_chuyen_can_bo',
    noiDung: 'Đã chuyển cán bộ xác minh nội dung phản ánh đất đai',
  },
  {
    id: 'LN-314',
    code: 'LN-314/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    canBoNhan: 'Nguyễn Hoàng Nam',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'da_chuyen_can_bo',
    noiDung: 'Chờ cán bộ thụ lý lập đề xuất xử lý đơn',
  },
  {
    id: 'LN-311',
    code: 'LN-311/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    canBoNhan: 'Nguyễn Minh Anh',
    hinhThuc: 'Bưu chính',
    ngayNhan: '12/10/2026',
    status: 'da_chuyen_can_bo',
    noiDung: 'Đơn gửi bưu điện đã chuyển cán bộ tiếp nhận kiểm tra',
  },

  // Cột 3: Đã chuyển về đơn vị
  {
    id: 'LN-310',
    code: 'LN-310/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    donViNhan: 'Công an thành phố Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'da_chuyen_don_vi',
    noiDung: 'Đã chuyển đơn vị chuyên trách thụ lý theo thẩm quyền',
  },
  {
    id: 'LN-306',
    code: 'LN-306/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    donViNhan: 'Công an thành phố Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'da_chuyen_don_vi',
    noiDung: 'Chuyển Phòng Cảnh sát kinh tế (PC03) xem xét',
  },
  {
    id: 'LN-308',
    code: 'LN-308/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    donViNhan: 'Công an tỉnh Tuyên Quang',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    status: 'da_chuyen_don_vi',
    noiDung: 'Phiếu chuyển đơn liên tỉnh theo thẩm quyền địa bàn',
  },
  {
    id: 'LN-302',
    code: 'LN-302/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Chưa rõ',
    donViNhan: 'Sở Xây dựng Hà Nội',
    hinhThuc: 'Trực tuyến',
    ngayNhan: '12/10/2026',
    status: 'da_chuyen_don_vi',
    noiDung: 'Chuyển đơn vị quản lý trật tự xây dựng',
  },
];

interface VanThuWorkKanbanProps {
  onNav: (s: Screen) => void;
  onSelect?: (ln: LuotNhan) => void;
  onSelectDon?: (don: DonDetail) => void;
  onSwitchAccount?: () => void;
}

export default function VanThuWorkKanban({
  onNav,
  onSelect,
  onSelectDon,
}: VanThuWorkKanbanProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterStatus, setActiveFilterStatus] = useState<'all' | 'chua_chuyen' | 'da_chuyen_can_bo' | 'da_chuyen_don_vi'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const filteredItems = useMemo(() => {
    return INITIAL_VAN_THU_ITEMS.filter((item) => {
      if (activeFilterStatus !== 'all' && item.status !== activeFilterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.code.toLowerCase().includes(q) ||
          item.nguoiNop.toLowerCase().includes(q) ||
          (item.canBoNhan && item.canBoNhan.toLowerCase().includes(q)) ||
          (item.donViNhan && item.donViNhan.toLowerCase().includes(q)) ||
          (item.noiDung && item.noiDung.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [searchQuery, activeFilterStatus]);

  const colChuaChuyen = useMemo(
    () => filteredItems.filter((i) => i.status === 'chua_chuyen'),
    [filteredItems]
  );
  const colDaChuyenCanBo = useMemo(
    () => filteredItems.filter((i) => i.status === 'da_chuyen_can_bo'),
    [filteredItems]
  );
  const colDaChuyenDonVi = useMemo(
    () => filteredItems.filter((i) => i.status === 'da_chuyen_don_vi'),
    [filteredItems]
  );

  const handleChuyenXuLy = (item: VanThuWorkItem) => {
    if (onSelect) {
      const mockLn: LuotNhan = {
        id: item.code,
        nguoiNop: item.nguoiNop,
        hinhThuc: item.hinhThuc,
        ngayNhan: item.ngayNhan,
        noiDung: item.noiDung || `Lượt nhận hồ sơ ${item.code}`,
        donVi: item.donViNhan || 'Công an thành phố Hà Nội',
        aiJob: 0,
        status: 'cho_chuyen',
      };
      onSelect(mockLn);
    }
    onNav('ban-phan-tich');
    showToast(`Mở phân tích & chuyển xử lý hồ sơ [${item.code}]`);
  };

  const handleXemChiTiet = (item: VanThuWorkItem) => {
    if (onSelect) {
      const mockLn: LuotNhan = {
        id: item.code,
        nguoiNop: item.nguoiNop,
        hinhThuc: item.hinhThuc,
        ngayNhan: item.ngayNhan,
        noiDung: item.noiDung || `Lượt nhận hồ sơ ${item.code}`,
        donVi: item.donViNhan || 'Công an thành phố Hà Nội',
        aiJob: 0,
        status: 'da_chuyen',
      };
      onSelect(mockLn);
    }
    if (onSelectDon) {
      const mockDon: DonDetail = {
        id: `Đ-${item.code.replace('LN-', '')}`,
        code: `Đ-${item.code.replace('LN-', '')}`,
        title: item.noiDung || `Hồ sơ ${item.code}`,
        luotNhanId: item.code,
        nguoiNop: item.nguoiNop,
        ngayNhan: item.ngayNhan,
        loaiDon: 'Đơn phản ánh kiến nghị',
        type: 'ĐƠN TIẾP NHẬN',
        statusBadge: 'Đã chuyển cán bộ xử lý',
      };
      onSelectDon(mockDon);
    }
    onNav('chi-tiet-luot-nhan');
    showToast(`Mở chi tiết lượt nhận [${item.code}]`);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 w-full flex flex-col space-y-4 font-sans bg-[#f8fafc] min-h-screen">
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[17px] text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header: Tiêu đề + Nút "+ Tiếp nhận" */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Công việc của tôi
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onNav('nhan-don-them')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8b1414] hover:bg-[#721010] active:scale-95 text-white font-bold text-xs sm:text-[13px] shadow-sm cursor-pointer transition-all"
          title="Tạo mới lượt nhận / Tiếp nhận đơn"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span>Tiếp nhận</span>
        </button>
      </div>

      {/* 2. Thanh tìm kiếm và bộ lọc */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm công việc theo tên công việc, tên người nộp, mã lượt nhận, loại đơn"
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#8b1414] focus:ring-1 focus:ring-[#8b1414]/20 transition-all font-normal shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => showToast('Mở bộ lọc nâng cao cho văn thư')}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-500">tune</span>
          <span>Nâng cao</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setActiveFilterStatus('all');
            showToast('Đã xóa bộ lọc tìm kiếm');
          }}
          className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        >
          Xóa bộ lọc
        </button>

        <button
          type="button"
          onClick={() => showToast('Đã làm mới dữ liệu lượt nhận')}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
          title="Làm mới danh sách"
        >
          <span className="material-symbols-outlined text-[17px]">refresh</span>
        </button>
      </div>

      {/* 3. Hàng 4 thẻ KPI thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tổng công việc */}
        <div
          onClick={() => setActiveFilterStatus('all')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
            activeFilterStatus === 'all'
              ? 'bg-[#e5e7eb]/80 border-slate-700 ring-1 ring-slate-700/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
            <span className="material-symbols-outlined text-[17px] text-slate-500">folder</span>
            <span>Tổng công việc</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight mt-1.5">
            208
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Toàn bộ hồ sơ đang theo dõi
          </p>
        </div>

        {/* Card 2: Chưa chuyển xử lý */}
        <div
          onClick={() => setActiveFilterStatus(activeFilterStatus === 'chua_chuyen' ? 'all' : 'chua_chuyen')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
            activeFilterStatus === 'chua_chuyen'
              ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Chưa chuyển xử lý</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight mt-1.5">
            17
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Chưa chuyển cho cán bộ nào
          </p>
        </div>

        {/* Card 3: Đã chuyển cán bộ */}
        <div
          onClick={() => setActiveFilterStatus(activeFilterStatus === 'da_chuyen_can_bo' ? 'all' : 'da_chuyen_can_bo')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
            activeFilterStatus === 'da_chuyen_can_bo'
              ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Đã chuyển cán bộ</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight mt-1.5">
            151
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Đã chuyển cho cán bộ, chờ kết quả
          </p>
        </div>

        {/* Card 4: Đã chuyển về đơn vị */}
        <div
          onClick={() => setActiveFilterStatus(activeFilterStatus === 'da_chuyen_don_vi' ? 'all' : 'da_chuyen_don_vi')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
            activeFilterStatus === 'da_chuyen_don_vi'
              ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Đã chuyển về đơn vị</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight mt-1.5">
            40
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Đơn vị nhận đang xử lý
          </p>
        </div>
      </div>

      {/* 4. Kanban 3 Cột: Chưa chuyển xử lý | Đã chuyển cán bộ | Đã chuyển về đơn vị */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start">
        {/* CỘT 1: CHƯA CHUYỂN XỬ LÝ (17) */}
        <div className="bg-[#fff8f8] border border-rose-200/80 rounded-xl p-3 flex flex-col gap-3 shadow-2xs min-h-[580px] max-h-[calc(100vh-280px)] overflow-y-auto">
          <div className="flex items-center justify-between px-1 sticky top-0 bg-[#fff8f8] pb-1 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <h2 className="text-[13px] font-bold text-slate-900">
                Chưa chuyển xử lý
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold shadow-2xs">
              17
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {colChuaChuyen.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-dashed border-rose-200 text-center text-xs text-slate-500">
                Không có hồ sơ nào
              </div>
            ) : (
              colChuaChuyen.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 inline-block">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-[13.5px] font-bold text-slate-900 tracking-tight">
                    {item.code}
                  </h3>

                  <div className="space-y-1 text-[11.5px] pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Người nộp:</span>
                      <span className="font-medium text-slate-800 text-right">{item.nguoiNop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hình thức nhận:</span>
                      <span className="font-medium text-slate-800 text-right">{item.hinhThuc}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ngày nhận:</span>
                      <span className="font-medium text-slate-800 text-right">{item.ngayNhan}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChuyenXuLy(item)}
                    className="w-full py-2 bg-[#8b1414] hover:bg-[#721010] active:scale-98 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    Chuyển xử lý
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT 2: ĐÃ CHUYỂN CÁN BỘ (151) */}
        <div className="bg-[#fffdf5] border border-amber-200/80 rounded-xl p-3 flex flex-col gap-3 shadow-2xs min-h-[580px] max-h-[calc(100vh-280px)] overflow-y-auto">
          <div className="flex items-center justify-between px-1 sticky top-0 bg-[#fffdf5] pb-1 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-[13px] font-bold text-slate-900">
                Đã chuyển cán bộ
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold shadow-2xs">
              151
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {colDaChuyenCanBo.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-dashed border-amber-200 text-center text-xs text-slate-500">
                Không có hồ sơ nào
              </div>
            ) : (
              colDaChuyenCanBo.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 inline-block">
                      {item.badge}
                    </span>
                  </div>

                  {/* Mã code màu đỏ đô #8b1414 đặc trưng ở cột 2 như trong ảnh */}
                  <h3 className="text-[13.5px] font-bold text-[#8b1414] tracking-tight">
                    {item.code}
                  </h3>

                  <div className="space-y-1 text-[11.5px] pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Người nộp:</span>
                      <span className="font-medium text-slate-800 text-right">{item.nguoiNop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cán bộ nhận:</span>
                      <span className="font-medium text-slate-900 text-right">{item.canBoNhan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hình thức nhận:</span>
                      <span className="font-medium text-slate-800 text-right">{item.hinhThuc}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ngày nhận:</span>
                      <span className="font-medium text-slate-800 text-right">{item.ngayNhan}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleXemChiTiet(item)}
                    className="w-full py-2 bg-[#8b1414] hover:bg-[#721010] active:scale-98 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT 3: ĐÃ CHUYỂN VỀ ĐƠN VỊ (40) */}
        <div className="bg-[#f8faff] border border-blue-200/80 rounded-xl p-3 flex flex-col gap-3 shadow-2xs min-h-[580px] max-h-[calc(100vh-280px)] overflow-y-auto">
          <div className="flex items-center justify-between px-1 sticky top-0 bg-[#f8faff] pb-1 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-[13px] font-bold text-slate-900">
                Đã chuyển về đơn vị
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold shadow-2xs">
              40
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {colDaChuyenDonVi.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-dashed border-blue-200 text-center text-xs text-slate-500">
                Không có hồ sơ nào
              </div>
            ) : (
              colDaChuyenDonVi.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 inline-block">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-[13.5px] font-bold text-slate-900 tracking-tight">
                    {item.code}
                  </h3>

                  <div className="space-y-1 text-[11.5px] pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Người nộp:</span>
                      <span className="font-medium text-slate-800 text-right">{item.nguoiNop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Đơn vị nhận:</span>
                      <span className="font-medium text-slate-900 text-right">{item.donViNhan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hình thức nhận:</span>
                      <span className="font-medium text-slate-800 text-right">{item.hinhThuc}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ngày nhận:</span>
                      <span className="font-medium text-slate-800 text-right">{item.ngayNhan}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleXemChiTiet(item)}
                    className="w-full py-2 bg-[#8b1414] hover:bg-[#721010] active:scale-98 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
