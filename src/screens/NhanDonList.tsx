import React, { useState } from 'react';
import { ALL_LUOT_NHAN } from "../constants";
import { LuotNhan, AIJob, Screen, DonDetail } from "../types";

interface NhanDonListProps {
  onNav: (s: Screen) => void;
  onSelect: (ln: LuotNhan) => void;
  onSelectDon?: (don: DonDetail) => void;
  luotNhanList?: LuotNhan[];
}

export default function NhanDonList({
  onNav,
  onSelect,
  onSelectDon,
  luotNhanList,
}: NhanDonListProps) {
  const [q, setQ] = useState("");
  const [activeNghiepVuTab, setActiveNghiepVuTab] = useState<
    'all' | 'bat_qua_tang_can_bo' | 'tu_thu_dau_thu' | 'tin_bao_to_giac' | 'tiep_nhan_don' | 'tai_lieu_bo_sung'
  >('all');
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const rawList = luotNhanList && luotNhanList.length > 0 ? luotNhanList : ALL_LUOT_NHAN;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const isBatQuaTangItem = (l: LuotNhan) =>
    l.loaiNghiepVu === 'bat_qua_tang' ||
    l.id.startsWith('QT-') ||
    Boolean(l.loaiDon?.toLowerCase().includes('bắt quả tang')) ||
    Boolean(l.noiDung?.toLowerCase().includes('bắt quả tang'));

  const isCanBoPhatHienItem = (l: LuotNhan) =>
    l.loaiNghiepVu === 'can_bo_phat_hien' ||
    l.id.startsWith('PH-') ||
    Boolean(l.loaiDon?.toLowerCase().includes('cán bộ phát hiện')) ||
    Boolean(l.noiDung?.toLowerCase().includes('cán bộ phát hiện') || l.noiDung?.toLowerCase().includes('tuần tra phát hiện'));

  const isBatQuaTangCanBoItem = (l: LuotNhan) =>
    isBatQuaTangItem(l) || isCanBoPhatHienItem(l);

  const isTuThuDauThuItem = (l: LuotNhan) =>
    !isBatQuaTangCanBoItem(l) &&
    (l.loaiNghiepVu === 'nguoi_tu_thu' ||
     l.loaiNghiepVu === 'nguoi_dau_thu' ||
     Boolean(l.truongHopTrinhDien) ||
     l.id.startsWith('TT-') ||
     l.id.startsWith('DT-') ||
     Boolean(l.loaiDon?.includes('tự thú') || l.loaiDon?.includes('đầu thú')));

  const isTinBaoItem = (l: LuotNhan) =>
    !isBatQuaTangCanBoItem(l) &&
    !isTuThuDauThuItem(l) &&
    (l.loaiNghiepVu === 'tin_bao_to_giac' ||
     l.loaiNghiepVu === 'tin_bao_toi_pham' ||
     l.loaiNghiepVu === 'to_giac_toi_pham' ||
     Boolean(l.loaiDon?.includes('tố giác') || l.loaiDon?.includes('tin báo')));

  const isBoSungItem = (l: LuotNhan) =>
    !isBatQuaTangCanBoItem(l) &&
    (l.loaiNghiepVu === 'tai_lieu_bo_sung' || l.id.startsWith('BS-'));

  const isDonItem = (l: LuotNhan) =>
    !isBatQuaTangCanBoItem(l) &&
    !isTuThuDauThuItem(l) &&
    !isTinBaoItem(l) &&
    !isBoSungItem(l);

  const countBatQuaTangCanBo = rawList.filter(isBatQuaTangCanBoItem).length;
  const countTuThuDauThu = rawList.filter(isTuThuDauThuItem).length;
  const countTinBao = rawList.filter(isTinBaoItem).length;
  const countBoSung = rawList.filter(isBoSungItem).length;
  const countDon = rawList.filter(isDonItem).length;

  const filtered = rawList.filter((l) => {
    const matchKeyword =
      !q ||
      l.id.toLowerCase().includes(q.toLowerCase()) ||
      l.nguoiNop.toLowerCase().includes(q.toLowerCase()) ||
      l.noiDung.toLowerCase().includes(q.toLowerCase()) ||
      (l.cccd && l.cccd.toLowerCase().includes(q.toLowerCase())) ||
      (l.loaiDon && l.loaiDon.toLowerCase().includes(q.toLowerCase()));
    if (!matchKeyword) return false;

    if (activeNghiepVuTab === 'bat_qua_tang_can_bo' && !isBatQuaTangCanBoItem(l)) return false;
    if (activeNghiepVuTab === 'tu_thu_dau_thu' && !isTuThuDauThuItem(l)) return false;
    if (activeNghiepVuTab === 'tin_bao_to_giac' && !isTinBaoItem(l)) return false;
    if (activeNghiepVuTab === 'tai_lieu_bo_sung' && !isBoSungItem(l)) return false;
    if (activeNghiepVuTab === 'tiep_nhan_don' && !isDonItem(l)) return false;

    if (statusFilter) {
      if (statusFilter === 'chua_du_du_lieu' && l.aiAnalysisState !== 'chua_du_du_lieu') return false;
      if (statusFilter === 'phan_tich_so_bo' && l.aiAnalysisState !== 'phan_tich_so_bo') return false;
      if (statusFilter === 'can_bo_sung' && l.aiAnalysisState !== 'can_bo_sung') return false;
      if (statusFilter === 'da_cap_nhat' && l.aiAnalysisState !== 'da_cap_nhat') return false;
      if (statusFilter === 'dang_phan_tich' && l.aiAnalysisState !== 'dang_phan_tich') return false;
      if (statusFilter === 'da_chuyen' && l.status !== 'da_chuyen') return false;
      if (statusFilter === 'cho_chuyen' && l.status !== 'cho_chuyen') return false;
    }

    if (methodFilter) {
      const hasFiles = Boolean(l.hasFile && (l.fileCount || (l.files && l.files.length > 0)));
      if (methodFilter === 'khong_tep' && hasFiles) return false;
      if (methodFilter === 'co_tep' && !hasFiles) return false;
      if (methodFilter === 'tructiep' && !l.hinhThuc?.toLowerCase().includes('trực tiếp')) return false;
      if (methodFilter === 'tructuyen' && !l.hinhThuc?.toLowerCase().includes('tuyến')) return false;
      if (methodFilter === 'buudien' && !l.hinhThuc?.toLowerCase().includes('bưu')) return false;
    }

    if (unitFilter) {
      if (unitFilter === 'catphn' && !l.donVi?.toLowerCase().includes('công an')) return false;
      if (unitFilter === 'tt' && !l.donVi?.toLowerCase().includes('thanh tra')) return false;
      if (unitFilter === 'sxd' && !l.donVi?.toLowerCase().includes('xây dựng')) return false;
      if (unitFilter === 'hc' && !l.donVi?.toLowerCase().includes('tiếp công dân')) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-5 bg-[#f4f7fb]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 animate-bounce text-xs font-medium">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-[#004ac6] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">inbox</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[20px] font-bold text-slate-900 font-headline-md tracking-tight">
                  Hàng đợi tiếp nhận
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[#004ac6] font-semibold text-[12px]">
                  {filtered.length} lượt nhận
                </span>
              </div>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                Quản lý Đa Nguồn: Bắt quả tang, Cán bộ phát hiện, Người tự thú/đầu thú, Tin báo tố giác và Đơn tiếp nhận
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-[13px] border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              onClick={() => showToast('Đang xuất file Excel danh sách lượt nhận...')}
            >
              <span className="material-symbols-outlined text-[17px] text-slate-500">file_download</span>
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] border border-slate-300 shadow-2xs cursor-pointer transition-all"
              onClick={() => onNav('nhan-don-them')}
              title="Tiếp nhận đơn thư hành chính thông thường"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-600">post_add</span>
              <span>Tiếp nhận đơn</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] active:scale-95 text-white font-semibold text-[13px] shadow-sm hover:shadow-md cursor-pointer transition-all"
              onClick={() => onNav('nhan-don-them')}
              title="Tiếp nhận tin báo, tố giác về tội phạm"
            >
              <span className="material-symbols-outlined text-[18px]">local_police</span>
              <span>+ Tin tố giác</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-semibold text-[13px] shadow-sm hover:shadow-md cursor-pointer transition-all"
              onClick={() => onNav('nhan-don-them')}
              title="Tiếp nhận người tự thú, đầu thú theo Điều 145, 146 BLTTHS"
            >
              <span className="material-symbols-outlined text-[18px]">front_hand</span>
              <span>+ Tự thú / Đầu thú</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-900 hover:bg-rose-950 active:scale-95 text-white font-semibold text-[13px] shadow-sm hover:shadow-md cursor-pointer transition-all"
              onClick={() => onNav('nhan-don-them')}
              title="Bắt quả tang (Điều 111 BLTTHS) hoặc Cán bộ phát hiện (Điều 143 BLTTHS)"
            >
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
              <span>+ Bắt quả tang / CB phát hiện</span>
            </button>
          </div>
        </div>

        {/* BỘ LỌC TABS LOẠI NGHIỆP VỤ THEO YÊU CẦU GOVEX (MỤC 12.2) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveNghiepVuTab('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              activeNghiepVuTab === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>Tất cả</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] ${activeNghiepVuTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {rawList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNghiepVuTab('bat_qua_tang_can_bo')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              activeNghiepVuTab === 'bat_qua_tang_can_bo'
                ? 'bg-rose-900 text-white font-semibold shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">e911_emergency</span>
            <span>Bắt quả tang & Cán bộ phát hiện</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${activeNghiepVuTab === 'bat_qua_tang_can_bo' ? 'bg-rose-950 text-white' : 'bg-rose-200 text-rose-950'}`}>
              {countBatQuaTangCanBo}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNghiepVuTab('tu_thu_dau_thu')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              activeNghiepVuTab === 'tu_thu_dau_thu'
                ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/90'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">front_hand</span>
            <span>Người tự thú, đầu thú</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${activeNghiepVuTab === 'tu_thu_dau_thu' ? 'bg-indigo-950 text-white' : 'bg-indigo-200 text-indigo-950'}`}>
              {countTuThuDauThu}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNghiepVuTab('tin_bao_to_giac')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              activeNghiepVuTab === 'tin_bao_to_giac'
                ? 'bg-[#b91c1c] text-white font-semibold shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">local_police</span>
            <span>Tin báo, tố giác tội phạm</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${activeNghiepVuTab === 'tin_bao_to_giac' ? 'bg-[#7f1d1d] text-white' : 'bg-rose-200 text-rose-900'}`}>
              {countTinBao}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNghiepVuTab('tiep_nhan_don')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              activeNghiepVuTab === 'tiep_nhan_don'
                ? 'bg-[#004ac6] text-white font-semibold shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">description</span>
            <span>Đơn tiếp nhận</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${activeNghiepVuTab === 'tiep_nhan_don' ? 'bg-[#00348c] text-white' : 'bg-blue-200 text-blue-900'}`}>
              {countDon}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNghiepVuTab('tai_lieu_bo_sung')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              activeNghiepVuTab === 'tai_lieu_bo_sung'
                ? 'bg-purple-700 text-white font-semibold shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">note_add</span>
            <span>Tài liệu bổ sung</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${activeNghiepVuTab === 'tai_lieu_bo_sung' ? 'bg-purple-900 text-white' : 'bg-purple-200 text-purple-900'}`}>
              {countBoSung}
            </span>
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-3.5 border-t border-slate-100 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
              search
            </span>
            <input
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              placeholder="Tìm theo mã lượt nhận, tên người nộp, CCCD, nội dung..."
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {/* Filter: Time */}
          <div className="md:col-span-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Thời gian: Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng 09/2026</option>
            </select>
          </div>
          {/* Filter: Method & Multi-source data type */}
          <div className="md:col-span-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Hình thức: Tất cả</option>
              <option value="khong_tep">Trực tiếp (Không tệp)</option>
              <option value="co_tep">Có tệp số hóa</option>
              <option value="tructiep">Trực tiếp</option>
              <option value="tructuyen">Trực tuyến (DVC)</option>
              <option value="buudien">Bưu điện</option>
            </select>
          </div>
          {/* Filter: 6 AI States & Workflow Status */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Trạng thái AI & Xử lý</option>
              <option value="chua_du_du_lieu">AI: Chưa đủ dữ liệu</option>
              <option value="phan_tich_so_bo">AI: Phân tích sơ bộ (v1.0)</option>
              <option value="can_bo_sung">AI: Cần bổ sung</option>
              <option value="da_cap_nhat">AI: Đã cập nhật (v2.0)</option>
              <option value="dang_phan_tich">AI: Đang phân tích</option>
              <option value="da_chuyen">Hồ sơ: Đã chuyển xử lý</option>
              <option value="cho_chuyen">Hồ sơ: Chờ chuyển</option>
            </select>
          </div>
          {/* Filter: Unit */}
          <div className="md:col-span-2">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Đơn vị: Tất cả</option>
              <option value="catphn">Công an TP. Hà Nội</option>
              <option value="hc">Phòng Tiếp công dân</option>
              <option value="tt">Thanh tra tỉnh</option>
              <option value="sxd">Sở Xây dựng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã lượt nhận</th>
                <th className="py-3 px-4">Loại nghiệp vụ</th>
                <th className="py-3 px-4">Ngày nhận</th>
                <th className="py-3 px-4">Người báo tin / Đơn vị</th>
                <th className="py-3 px-4">Hình thức & Nguồn DL</th>
                <th className="py-3 px-4">Tóm tắt nội dung</th>
                <th className="py-3 px-4">Trạng thái & AI</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {filtered.map((ln) => {
                const isBatQuaTang = isBatQuaTangItem(ln);
                const isCanBoPhatHien = isCanBoPhatHienItem(ln);
                const isTuThu = ln.loaiNghiepVu === 'nguoi_tu_thu' || ln.id.startsWith('TT-') || ln.loaiDon?.includes('tự thú');
                const isDauThu = ln.loaiNghiepVu === 'nguoi_dau_thu' || ln.id.startsWith('DT-') || ln.loaiDon?.includes('đầu thú');
                const isTuThuDauThu = isTuThu || isDauThu || Boolean(ln.truongHopTrinhDien);
                const isTinBao = !isBatQuaTang && !isCanBoPhatHien && !isTuThuDauThu && (
                  ln.loaiNghiepVu === 'tin_bao_to_giac' ||
                  ln.loaiNghiepVu === 'tin_bao_toi_pham' ||
                  ln.loaiNghiepVu === 'to_giac_toi_pham' ||
                  ln.loaiDon?.includes('tố giác') ||
                  ln.loaiDon?.includes('tin báo')
                );
                const isBoSung = ln.loaiNghiepVu === 'tai_lieu_bo_sung' || ln.id.startsWith('BS-');
                const hasFiles = Boolean(ln.hasFile && (ln.fileCount || (ln.files && ln.files.length > 0)));

                const handleItemClick = () => {
                  if (ln.status === 'da_chuyen') {
                    const dynamicCode = ln.id.startsWith('LN-') ? `Đ-${ln.id.replace('LN-', '')}` : ln.id;
                    const donObj: DonDetail = {
                      id: dynamicCode,
                      code: dynamicCode,
                      title: ln.noiDung || `Hồ sơ ${dynamicCode}`,
                      luotNhanId: ln.id,
                      nguoiNop: ln.nguoiNop,
                      ngayNhan: ln.ngayNhan,
                      loaiDon: ln.loaiDon || (
                        isTuThu ? 'Tiếp nhận người tự thú' :
                        isDauThu ? 'Tiếp nhận người đầu thú' :
                        isBatQuaTang ? 'Biên bản bắt người phạm tội quả tang' :
                        isCanBoPhatHien ? 'Báo cáo phát hiện dấu hiệu vi phạm pháp luật' :
                        isTinBao ? 'Đơn tố giác về tội phạm' :
                        'Đơn phản ánh kiến nghị'
                      ),
                      type: isTuThuDauThu ? 'TỰ THÚ / ĐẦU THÚ' :
                            isBatQuaTang ? 'BẮT QUẢ TANG' :
                            isCanBoPhatHien ? 'CÁN BỘ PHÁT HIỆN' :
                            'ĐƠN TIẾP NHẬN',
                      statusBadge: 'Đang xác minh thông tin',
                    };
                    if (onSelectDon) onSelectDon(donObj);
                    onNav('don-tiep-nhan');
                    showToast(`Mở màn chi tiết hồ sơ [${dynamicCode}] (Đã tiếp nhận)`);
                  } else {
                    onSelect(ln);
                    onNav('chi-tiet-luot-nhan');
                  }
                };

                const handleDirectAIAnalysis = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSelect(ln);
                  onNav('ban-phan-tich');
                  showToast(`Mở Bàn phân tích AI cho hồ sơ [${ln.id}]`);
                };

                return (
                  <tr
                    key={ln.id}
                    className="hover:bg-blue-50/60 hover:shadow-xs cursor-pointer transition-all group"
                    onClick={handleItemClick}
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#004ac6] text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[16px] ${
                          isBatQuaTang ? 'text-rose-700' :
                          isCanBoPhatHien ? 'text-teal-700' :
                          isTuThu ? 'text-indigo-700' :
                          isDauThu ? 'text-amber-700' :
                          isTinBao ? 'text-rose-600' :
                          isBoSung ? 'text-purple-600' :
                          'text-blue-600'
                        }`}>
                          {isBatQuaTang ? 'crisis_alert' :
                           isCanBoPhatHien ? 'radar' :
                           isTuThuDauThu ? 'front_hand' :
                           isTinBao ? 'local_police' :
                           isBoSung ? 'note_add' :
                           'description'}
                        </span>
                        <span className="font-mono">{ln.id}</span>
                      </div>
                    </td>

                    {/* Cột Loại nghiệp vụ */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isBatQuaTang ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs" title="Bắt người phạm tội quả tang - Điều 111 BLTTHS">
                          <span className="material-symbols-outlined text-[14px] text-rose-700">crisis_alert</span>
                          <span>Bắt quả tang (Đ.111)</span>
                        </span>
                      ) : isCanBoPhatHien ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-teal-50 text-teal-900 border border-teal-300 shadow-2xs" title="Cơ quan, người có thẩm quyền trực tiếp phát hiện - Khoản 3 Điều 143 BLTTHS">
                          <span className="material-symbols-outlined text-[14px] text-teal-700">radar</span>
                          <span>CB phát hiện (Đ.143)</span>
                        </span>
                      ) : isTuThu ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                          <span className="material-symbols-outlined text-[14px] text-indigo-700">front_hand</span>
                          <span>Người tự thú</span>
                        </span>
                      ) : isDauThu ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          <span className="material-symbols-outlined text-[14px] text-amber-700">security</span>
                          <span>Người đầu thú</span>
                        </span>
                      ) : isTinBao ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <span className="material-symbols-outlined text-[14px] text-rose-700">shield</span>
                          <span>Tin tố giác tội phạm</span>
                        </span>
                      ) : isBoSung ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          <span className="material-symbols-outlined text-[14px] text-purple-700">post_add</span>
                          <span>Tài liệu bổ sung</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="material-symbols-outlined text-[14px] text-blue-600">description</span>
                          <span>Đơn tiếp nhận</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-[12.5px]">
                      <div>{ln.ngayNhan}</div>
                      {ln.gioNhan && <div className="text-[11px] text-slate-400 font-mono">{ln.gioNhan}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 text-[13.5px]">{ln.nguoiNop}</span>
                        {ln.yeuCauBaoMat && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-0.5" title="Yêu cầu giữ bí mật danh tính người báo tin">
                            <span className="material-symbols-outlined text-[12px]">lock</span>
                            Bảo mật
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-slate-400 font-normal mt-0.5">
                        {isBatQuaTang ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-rose-900 font-medium">
                              {ln.doiTuongLienQuan ? `Đ/tượng: ${ln.doiTuongLienQuan.split('(')[0]}` : 'Lập biên bản tại chỗ'}
                            </span>
                            {ln.tangVatThuGiu && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                Thu giữ vật chứng
                              </span>
                            )}
                          </div>
                        ) : isCanBoPhatHien ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-teal-900 font-medium">
                              {ln.bienPhapPhatHien || ln.lucLuongPhatHien || 'Trinh sát quản lý địa bàn'}
                            </span>
                            {ln.tangVatThuGiu && (
                              <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-900 text-[10px] font-semibold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                Tạm giữ hàng hóa
                              </span>
                            )}
                          </div>
                        ) : isTuThuDauThu ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-indigo-900 font-semibold">
                              {ln.truongHopTrinhDien === 'tu_thu' ? 'Trình diện: Tự thú' : ln.truongHopTrinhDien === 'dau_thu' ? 'Trình diện: Đầu thú' : 'Chờ CB xác nhận'}
                            </span>
                            {ln.canhBaoAnToan?.canHoTroYTe && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">medical_services</span>
                                Cần y tế
                              </span>
                            )}
                            {ln.doVatGiaoNop && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                Có nộp vật chứng
                              </span>
                            )}
                          </div>
                        ) : ln.tuCachNguoiBao ? (
                          <span className="text-slate-600 font-medium">{ln.tuCachNguoiBao}</span>
                        ) : ln.cccd ? (
                          `CCCD: ${ln.cccd}`
                        ) : ln.id.includes('17') ? (
                          'MST: 0108923412'
                        ) : (
                          'Chưa định danh CCCD'
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border ${
                            ln.hinhThuc === 'Bưu điện' || ln.hinhThuc?.includes('bưu')
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : ln.hinhThuc === 'Trực tuyến' || ln.hinhThuc?.includes('tuyến')
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : isBatQuaTang
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : isCanBoPhatHien
                                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {ln.hinhThuc === 'Bưu điện' || ln.hinhThuc?.includes('bưu')
                              ? 'local_post_office'
                              : ln.hinhThuc === 'Trực tuyến'
                                ? 'language'
                                : isBatQuaTang
                                  ? 'crisis_alert'
                                  : isCanBoPhatHien
                                    ? 'radar'
                                    : 'person'}
                          </span>
                          <span>{ln.nguonTin || ln.hinhThuc}</span>
                        </span>

                        {/* Nhãn nguồn dữ liệu Multi-source: Không tệp vs Có tệp số hóa */}
                        {hasFiles ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                            <span className="material-symbols-outlined text-[12px]">attach_file</span>
                            <span>{ln.fileCount || (ln.files ? ln.files.length : 1)} tệp số hóa</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300"
                            title="Không có đơn/tài liệu đính kèm - Phân tích dựa trên ghi nhận trực tiếp của cán bộ và CSDL GOVEX"
                          >
                            <span className="material-symbols-outlined text-[12px] text-amber-700">edit_note</span>
                            <span>Trực tiếp (Không tệp)</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cột Tóm tắt nội dung */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <p className="text-[12.5px] text-slate-700 line-clamp-2 leading-snug" title={ln.noiDung}>
                        {ln.noiDung}
                      </p>
                      {ln.diaDiemSuViec && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-0.5 mt-0.5 truncate" title={ln.diaDiemSuViec}>
                          <span className="material-symbols-outlined text-[12px] text-slate-400">location_on</span>
                          {ln.diaDiemSuViec}
                        </p>
                      )}
                    </td>

                    {/* Cột Trạng thái & Phân tích AI */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        {/* 6 AI States */}
                        {ln.aiAnalysisState === 'chua_du_du_lieu' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold" title="Chưa đủ dữ liệu tối thiểu để kết luận">
                            <span className="material-symbols-outlined text-[13px] text-amber-700">hourglass_top</span>
                            <span>AI: Chưa đủ DL</span>
                          </span>
                        ) : ln.aiAnalysisState === 'dang_phan_tich' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <span>AI đang phân tích...</span>
                          </span>
                        ) : ln.aiAnalysisState === 'phan_tich_so_bo' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold" title="Phân tích NLP trên ghi nhận ban đầu (Phiên bản v1.0)">
                            <span className="material-symbols-outlined text-[13px] text-indigo-700">auto_awesome</span>
                            <span>Sơ bộ (v1.0)</span>
                          </span>
                        ) : ln.aiAnalysisState === 'can_bo_sung' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-[11px] font-bold" title="Cần bổ sung thêm tình tiết / tài liệu">
                            <span className="material-symbols-outlined text-[13px] text-orange-700">notification_important</span>
                            <span>Cần bổ sung</span>
                          </span>
                        ) : ln.aiAnalysisState === 'da_cap_nhat' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold" title="Đã nâng cấp phân tích sau khi bổ sung tài liệu & OCR (Phiên bản v2.0)">
                            <span className="material-symbols-outlined text-[13px] text-emerald-700">verified</span>
                            <span>Cập nhật (v2.0)</span>
                          </span>
                        ) : ln.aiAnalysisState === 'loi_phan_tich' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[13px] text-rose-700">error</span>
                            <span>Lỗi phân tích</span>
                          </span>
                        ) : (
                          /* Fallback */
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                            <span className="material-symbols-outlined text-[13px] text-slate-500">auto_awesome</span>
                            <span>{ln.aiJob && ln.aiJob >= 3 ? 'Sơ bộ (v1.0)' : 'Chờ phân tích'}</span>
                          </span>
                        )}

                        {/* Workflow State */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 pl-0.5">
                          {ln.status === 'da_chuyen' ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                              Đã chuyển xử lý
                            </span>
                          ) : ln.status === 'da_ban_giao' ? (
                            <span className="text-amber-700 font-medium flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px] text-amber-600">swap_horiz</span>
                              Đã bàn giao
                            </span>
                          ) : ln.status === 'da_tra_lai' ? (
                            <span className="text-rose-700 font-medium flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px] text-rose-600">assignment_return</span>
                              Đã trả lại
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Chờ chuyển
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={handleDirectAIAnalysis}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004ac6] transition-colors cursor-pointer"
                          title="Mở Bàn phân tích AI Đa Nguồn"
                        >
                          <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick();
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Xem chi tiết lượt nhận"
                        >
                          <span className="material-symbols-outlined text-[17px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Footer */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[13px] text-slate-500">
          <div>
            Hiển thị <span className="font-semibold text-slate-800">1 - {filtered.length}</span> của{' '}
            <span className="font-semibold text-slate-800">{filtered.length}</span> lượt nhận
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[12.5px] font-medium"
              disabled
            >
              Trước
            </button>
            <button
              type="button"
              className="px-3.5 py-1 rounded-lg border border-blue-600 bg-[#004ac6] text-white text-[12.5px] font-semibold"
            >
              1
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[12.5px] font-medium"
              disabled
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}