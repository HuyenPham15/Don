import React, { useState, useEffect } from 'react';
import { LN19, ALL_LUOT_NHAN, JOB_LABELS } from "../constants";
import { LuotNhan, AIJob, Screen, DonDetail } from "../types";

interface CongViecCuaToiProps {
  onSelect: (ln: LuotNhan) => void;
  onNav: (s: Screen) => void;
  extraCard: LuotNhan | null;
  onSelectDon?: (don: DonDetail) => void;
  acceptedDons?: DonDetail[];
}

export default function CongViecCuaToi({ onSelect, onNav, extraCard, onSelectDon, acceptedDons = [] }: CongViecCuaToiProps) {
  const [liveJob, setLiveJob] = useState<AIJob>(LN19.aiJob);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'collab' | 'qualified'>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Danh sách các lượt nhận đã tiếp nhận -> chuyển sang cột 2
  const [acceptedLuotNhanIds, setAcceptedLuotNhanIds] = useState<string[]>([]);
  const [extraProcessingItems, setExtraProcessingItems] = useState<DonDetail[]>([]);

  // Live simulation of AI analyzing step
  useEffect(() => {
    if (liveJob >= 5) return;
    const timer = setInterval(() => {
      setLiveJob((prev) => Math.min(5, prev + 1) as AIJob);
    }, 4000);
    return () => clearInterval(timer);
  }, [liveJob]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Live progress calculation for Card 1
  const aiProgress = Math.min(100, Math.round((liveJob / 5) * 100));

  // Handler: Tiếp nhận lượt nhận từ cột 1 -> Chuyển qua cột 2 "TIẾP NHẬN & XỬ LÝ"
  const handleTiepNhanLuotNhan = (item: {
    id: string;
    title: string;
    nguoiNop: string;
    deadline?: string;
    loaiDon?: string;
  }) => {
    const code = item.id.replace('LN-', 'Đ-');
    setAcceptedLuotNhanIds((prev) => [...prev, item.id]);
    const newDon: DonDetail = {
      id: code,
      code: code,
      title: item.title.replace('Tiếp nhận lượt nhận: ', ''),
      luotNhanId: item.id,
      nguoiNop: item.nguoiNop,
      ngayNhan: '16/09/2026 09:15',
      loaiDon: item.loaiDon || 'Đơn tiếp nhận DVC',
      type: 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Mới tiếp nhận',
    };
    setExtraProcessingItems((prev) => [newDon, ...prev]);
    showToast(`✓ Đã tiếp nhận ${item.id}! Hồ sơ đã được chuyển sang danh sách "TIẾP NHẬN & XỬ LÝ".`);
  };

  // Handler: Khi nhấn chi tiết hoặc nhấn chữ xử lý -> vào màn chi tiết của đơn
  const handleOpenDonDetail = (don: DonDetail) => {
    if (onSelectDon) {
      onSelectDon(don);
    }
    onNav('don-tiep-nhan');
    showToast(`Đang mở màn chi tiết đơn: ${don.code}`);
  };

  // Filter check helper
  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-5 bg-[#f4f7fb]">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 animate-bounce text-xs font-medium">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-3.5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">assignment</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-bold text-slate-900 font-headline-md tracking-tight uppercase">
                  CÔNG VIỆC CỦA TÔI
                </h1>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                Bàn làm việc điều hành, thẩm tra và xử lý hồ sơ hành chính công vụ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Tùy chọn tiếp nhận</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-72 rounded-xl bg-white border border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.12)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="px-3 py-1 text-[10.5px] font-semibold text-slate-400 font-label-technical uppercase tracking-wider border-b border-slate-100 mb-1">
                    Tùy chọn tiếp nhận
                  </div>
                  <button
                    type="button"
                    className="w-full group flex items-start gap-3 px-3 py-2 text-slate-700 hover:bg-blue-50/60 hover:text-blue-700 transition-colors text-left"
                    onClick={() => {
                      setShowDropdown(false);
                      onNav('nhan-don-list');
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-slate-900 group-hover:text-blue-700 leading-snug">
                        Tạo lượt nhận
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Xem danh sách và thêm lượt nộp hồ sơ
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="w-full group flex items-start gap-3 px-3 py-2 text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-700 transition-colors text-left"
                    onClick={() => {
                      setShowDropdown(false);
                      onNav('nhan-don-them');
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">post_add</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-700 leading-snug">
                        Tạo mới tiếp nhận đơn
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Lập hồ sơ TTHC trực tiếp cho công dân
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search & Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-slate-400">
                search
              </span>
              <input
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                placeholder="Mã hồ sơ, số CCCD, tên công dân..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {filterType !== 'all' && (
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:text-slate-900 text-[11.5px] font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">clear_all</span>
                Tất cả
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilterType(filterType === 'urgent' ? 'all' : 'urgent')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11.5px] font-semibold transition-all ${filterType === 'urgent'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 border-red-200 text-rose-600 hover:bg-rose-100/70'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">warning</span>
              2 việc khẩn cấp
            </button>

            <button
              type="button"
              onClick={() => setFilterType(filterType === 'collab' ? 'all' : 'collab')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11.5px] font-semibold transition-all ${filterType === 'collab'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/70'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
              1 chờ phối hợp
            </button>

            <button
              type="button"
              onClick={() => setFilterType(filterType === 'qualified' ? 'all' : 'qualified')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11.5px] font-semibold transition-all ${filterType === 'qualified'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">verified</span>
              2 đủ điều kiện
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Civil Service Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
        {/* ================= COLUMN 1: HÀNG ĐỢI TIẾP NHẬN ================= */}
        {(filterType === 'all' || filterType === 'qualified') && (
          <div className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight font-headline-md">
                    HÀNG ĐỢI TIẾP NHẬN
                  </h2>
                </div>
                {/* <div className="flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10.5px] font-semibold font-label-technical"
                    title="AI đang phân tích"
                  >
                    <span className="material-symbols-outlined text-[12px] animate-spin text-amber-600">
                      sync
                    </span>
                    1 đang phân tích
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-semibold font-label-technical"
                    title="AI đã phân tích xong"
                  >
                    <span className="material-symbols-outlined text-[12px] text-emerald-600">
                      verified
                    </span>
                    {Math.max(0, 2 - acceptedLuotNhanIds.length)} đã xong
                  </span>
                </div> */}
              </div>
            </div>
            {/* <p className="text-[11px] text-slate-500 px-1 -mt-1">
              Phân loại tiếp nhận theo tiến trình AI phân tích hồ sơ &amp; trích xuất dữ liệu
            </p> */}

            <div className="flex flex-col gap-2.5">
              {/* Dynamic extra card if user just submitted new intake */}
              {extraCard && matchesSearch(extraCard.id + extraCard.nguoiNop + extraCard.noiDung) && (
                <div
                  className="bg-white border-2 border-amber-300 rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 cursor-pointer hover:border-blue-600 transition-all group"
                  onClick={() => {
                    onSelect(extraCard);
                    onNav('ban-phan-tich');
                    showToast('Đang mở Chi tiết Lượt nhận & Phân tích AI đầy đủ...');
                  }}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-indigo-50 text-indigo-700 border border-slate-200">
                        LƯỢT NHẬN
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-slate-700 group-hover:text-blue-700">
                        {extraCard.id}
                      </span>
                    </div>
                    <span className="text-[11px] font-label-technical text-slate-400">Vừa xong</span>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {extraCard.noiDung}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                      Người nộp: <strong className="text-slate-700 font-medium">{extraCard.nguoiNop}</strong>
                    </p>
                  </div>
                  {extraCard.aiJob === 0 ? (
                    <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-800 font-label-technical">
                        <span className="material-symbols-outlined text-[14px] text-blue-600">schedule</span> Chờ tiếp nhận
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">Mới tạo</span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800 font-label-technical">
                          <span className="material-symbols-outlined text-[13px] animate-spin text-amber-600">sync</span> AI đang phân tích
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 font-label-technical">35%</span>
                      </div>
                      <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card 1: Processing AI (LN-19/2026-GOVEX_HC / LN-2025-0819) */}
              {matchesSearch('LN-2025-0819 LN-19/2026 Nguyễn Văn An Đăng ký cấp GCN QSDĐ lần đầu 001092') && (
                <div
                  className="bg-white border-2 border-amber-300/90 hover:border-blue-600 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col gap-2.5 relative overflow-hidden cursor-pointer group/card active:scale-[0.98] duration-200"
                  onClick={() => {
                    onSelect(LN19);
                    onNav('ban-phan-tich');
                    showToast('Đang mở Chi tiết Lượt nhận & Phân tích AI đầy đủ...');
                  }}
                  title="Nhấp để mở chi tiết lượt nhận LN-2025-0819 và kết quả bóc tách AI"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-100">
                    <div
                      className="h-full bg-amber-500 rounded-r transition-all duration-500"
                      style={{ width: `${aiProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-indigo-50 text-indigo-700 border border-slate-200">
                        LƯỢT NHẬN
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-slate-700 group-hover/card:text-blue-700 transition-colors">
                        LN-2025-0819
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[15px] text-blue-600 opacity-0 group-hover/card:opacity-100 transition-opacity"
                        title="Chi tiết lượt nhận"
                      >
                        open_in_new
                      </span>
                      <span className="text-[11px] font-label-technical text-slate-400">08:30</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 leading-snug group-hover/card:text-blue-700 transition-colors">
                      Tiếp nhận lượt nhận: Đăng ký cấp GCN QSDĐ lần đầu
                    </h3>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                      Người nộp: <strong className="text-slate-700 font-medium">Nguyễn Văn An</strong> (CCCD: 001092***)
                    </p>
                  </div>

                  {/* AI Processing Box */}
                  <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1.5 group-hover/card:border-amber-300 transition-colors">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-800 font-label-technical">
                        <span className="material-symbols-outlined text-[13px] animate-spin text-amber-600">
                          sync
                        </span>{' '}
                        AI đang phân tích
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 font-label-technical">
                        {aiProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${aiProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-tight">
                      {liveJob < 4
                        ? 'Đang rà soát lịch sử thửa đất & đối chiếu cơ sở dữ liệu địa chính...'
                        : 'Đang tổng hợp điều kiện pháp lý & sinh văn bản đề xuất giải quyết...'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-blue-700 font-medium font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span> Hạn: 17:00 Hôm nay
                    </span>
                    <span className="text-[10.5px] text-blue-600 font-semibold font-label-technical group-hover/card:underline">
                      Xem chi tiết →
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-[#004ac6] text-[#004ac6] hover:text-white border border-blue-200 hover:border-blue-600 text-[12px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(LN19);
                        onNav('ban-phan-tich');
                        showToast('Đang mở Chi tiết Lượt nhận & Phân tích AI đầy đủ...');
                      }}
                      title="Xem kết quả bóc tách & phân tích chi tiết hồ sơ LN-2025-0819"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-600 group-hover:text-white transition-colors">
                        insights
                      </span>
                      <span>Xem chi tiết phân tích AI</span>
                      <span className="material-symbols-outlined text-[14px] text-blue-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Card 2: AI Finished LN-2025-0422 (chỉ hiện khi chưa chuyển qua cột 2) */}
              {!acceptedLuotNhanIds.includes('LN-2025-0422') && matchesSearch('LN-2025-0422 Trần Thị Mai Trích lục hộ tịch điện tử Khai sinh') && (
                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-indigo-50 text-indigo-700 border border-slate-200">
                        LƯỢT NHẬN
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-slate-700">
                        LN-2025-0422
                      </span>
                    </div>
                    <span className="text-[11px] font-label-technical text-slate-400">09:05</span>
                  </div>
                  <div>
                    <h3
                      className="text-[13px] font-semibold text-slate-900 leading-snug hover:text-blue-700 cursor-pointer"
                      onClick={() => {
                        onSelect(ALL_LUOT_NHAN[1]);
                        onNav('ban-phan-tich');
                      }}
                    >
                      Tiếp nhận lượt nhận: Trích lục hộ tịch điện tử (Khai sinh)
                    </h3>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                      Người nộp: <strong className="text-slate-700 font-medium">Trần Thị Mai</strong> • Trực tuyến DVC
                    </p>
                  </div>

                  {/* AI Finished Result Box */}
                  <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-label-technical">
                        Sẵn sàng thụ lý
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-tight mt-0.5">
                      <strong className="text-emerald-700">Đề xuất:</strong> Đủ điều kiện thụ lý (Đã khớp CCCD VNeID mức 2, phôi điện tử hợp lệ).
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-emerald-700 font-medium font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span> Hạn: 04 giờ làm việc
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11.5px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                      onClick={() => {
                        onSelect(ALL_LUOT_NHAN[1]);
                        onNav('ban-phan-tich');
                        showToast('Xem kết quả phân tích hồ sơ LN-2025-0422');
                      }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px] text-slate-500">description</span> Xem kết quả
                    </button>
                    <button
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      onClick={() =>
                        handleTiepNhanLuotNhan({
                          id: 'LN-2025-0422',
                          title: 'Trích lục hộ tịch điện tử (Khai sinh)',
                          nguoiNop: 'Trần Thị Mai',
                          deadline: '04 giờ làm việc',
                          loaiDon: 'Thủ tục hành chính Hộ tịch',
                        })
                      }
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span> Tiếp nhận
                    </button>
                  </div>
                </div>
              )}

              {/* Card 3: AI Finished LN-2025-0982 (chỉ hiện khi chưa chuyển qua cột 2) */}
              {!acceptedLuotNhanIds.includes('LN-2025-0982') && matchesSearch('LN-2025-0982 Ánh Dương Cấp phép thi công biển hiệu quảng cáo') && (
                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-indigo-50 text-indigo-700 border border-slate-200">
                        LƯỢT NHẬN
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-slate-700">
                        LN-2025-0982
                      </span>
                    </div>
                    <span className="text-[11px] font-label-technical text-slate-400">09:40</span>
                  </div>
                  <div>
                    <h3
                      className="text-[13px] font-semibold text-slate-900 leading-snug hover:text-blue-700 cursor-pointer"
                      onClick={() => {
                        onSelect(ALL_LUOT_NHAN[2]);
                        onNav('ban-phan-tich');
                      }}
                    >
                      Tiếp nhận lượt nhận: Cấp phép thi công biển hiệu quảng cáo
                    </h3>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                      Người nộp: <strong className="text-slate-700 font-medium">Cty Quảng cáo Ánh Dương</strong>
                    </p>
                  </div>

                  {/* AI Finished Result Box */}
                  <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-label-technical">
                        Sẵn sàng thụ lý
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-tight mt-0.5">
                      <strong className="text-emerald-700">Đề xuất:</strong> Đủ điều kiện thụ lý (Bản vẽ &amp; giấy phép kinh doanh hợp lệ).
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 font-medium font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span> Hạn: 15:00 Hôm nay
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11.5px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                      onClick={() => {
                        onSelect(ALL_LUOT_NHAN[2]);
                        onNav('ban-phan-tich');
                        showToast('Xem kết quả phân tích hồ sơ LN-2025-0982');
                      }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px] text-slate-500">description</span> Xem kết quả
                    </button>
                    <button
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      onClick={() =>
                        handleTiepNhanLuotNhan({
                          id: 'LN-2025-0982',
                          title: 'Cấp phép thi công biển hiệu quảng cáo',
                          nguoiNop: 'Cty Quảng cáo Ánh Dương',
                          deadline: '15:00 Hôm nay',
                          loaiDon: 'Thủ tục cấp phép quảng cáo',
                        })
                      }
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span> Tiếp nhận
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= COLUMN 2: CẦN THẨM ĐỊNH & XỬ LÝ ================= */}
        {(filterType === 'all' || filterType === 'urgent') && (
          <div className="bg-blue-50/70 rounded-2xl p-3 border border-blue-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight font-headline-md">
                  TIẾP NHẬN &amp; XỬ LÝ
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[11px] font-label-technical">
                {String(3 + extraProcessingItems.length + (acceptedDons?.length || 0)).padStart(2, '0')}
              </span>
            </div>
            {/* <p className="text-[11px] text-slate-500 px-1 -mt-1">
              Hồ sơ đang trong thời hạn thẩm tra chuyên môn
            </p> */}

            <div className="flex flex-col gap-2.5">
              {/* CÁC ĐƠN MỚI ĐƯỢC TIẾP NHẬN TỪ LƯỢT NHẬN HOẶC TỪ MÀN PHÂN TÍCH */}
              {[...(acceptedDons || []), ...extraProcessingItems].map((item) => (
                <div
                  key={item.code}
                  className="bg-white border-2 border-emerald-400 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-blue-600 transition-all flex flex-col gap-2 relative overflow-hidden group cursor-pointer animate-in fade-in zoom-in-95 duration-200"
                  onClick={() => handleOpenDonDetail(item)}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.type || 'ĐƠN TIẾP NHẬN'}
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-blue-700 group-hover:underline">
                        {item.code}
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Mới tiếp nhận
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">
                      Người nộp: <strong className="text-slate-700 font-medium">{item.nguoiNop}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span> Hạn: Hôm nay
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDonDetail(item);
                      }}
                      className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold font-label-technical hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Xem chi tiết</span>
                      <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                    </span>
                  </div>

                  <button
                    className="w-full py-1.5 px-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDonDetail(item);
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_document</span>
                    <span>Xử lý</span>
                  </button>
                </div>
              ))}

              {/* Card 1: Khẩn cấp VV-2025-0430 */}
              {matchesSearch('VV-2025-0430 cấp phép XD 128 Đội Cấn khẩn cấp') && (
                <div
                  className="bg-white border-2 border-rose-400 rounded-xl p-3.5 shadow-xs relative overflow-hidden flex flex-col gap-2 cursor-pointer hover:border-blue-600 transition-all group"
                  onClick={() =>
                    handleOpenDonDetail({
                      id: 'VV-2025-0430',
                      code: 'VV-2025-0430',
                      title: 'Thẩm định hồ sơ cấp phép XD ngõ 128 Đội Cấn',
                      luotNhanId: 'LN-2025-0430',
                      nguoiNop: 'Nguyễn Hải Phong',
                      ngayNhan: '16/09/2026 08:00',
                      loaiDon: 'Hồ sơ cấp phép xây dựng',
                      type: 'VỤ VIỆC',
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-emerald-50 text-emerald-800 border border-emerald-200">
                        VỤ VIỆC
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-rose-700">
                        VV-2025-0430
                      </span>
                    </div>
                    <span className="bg-rose-600 text-white font-bold text-[9.5px] font-label-technical px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shadow-2xs">
                      <span className="material-symbols-outlined text-[11px]">timer</span> Còn 1h45p
                    </span>
                  </div>

                  <h3 className="text-[13px] font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    Thẩm định hồ sơ cấp phép XD ngõ 128 Đội Cấn
                  </h3>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-rose-600 font-bold font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">alarm</span> Hạn: 11:30 Trưa nay
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDonDetail({
                          id: 'VV-2025-0430',
                          code: 'VV-2025-0430',
                          title: 'Thẩm định hồ sơ cấp phép XD ngõ 128 Đội Cấn',
                          luotNhanId: 'LN-2025-0430',
                          nguoiNop: 'Nguyễn Hải Phong',
                          ngayNhan: '16/09/2026 08:00',
                          loaiDon: 'Hồ sơ cấp phép xây dựng',
                          type: 'VỤ VIỆC',
                        });
                      }}
                      className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold font-label-technical hover:underline cursor-pointer"
                    >
                      Xem chi tiết →
                    </span>
                  </div>

                  <button
                    className="w-full py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDonDetail({
                        id: 'VV-2025-0430',
                        code: 'VV-2025-0430',
                        title: 'Thẩm định hồ sơ cấp phép XD ngõ 128 Đội Cấn',
                        luotNhanId: 'LN-2025-0430',
                        nguoiNop: 'Nguyễn Hải Phong',
                        ngayNhan: '16/09/2026 08:00',
                        loaiDon: 'Hồ sơ cấp phép xây dựng',
                        type: 'VỤ VIỆC',
                      });
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">bolt</span> Xử lý ngay
                  </button>
                </div>
              )}

              {/* Card 2: Đ-2025-0782 */}
              {matchesSearch('Đ-2025-0782 miễn giảm tiền sử dụng đất') && (
                <div
                  className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-blue-600 transition-all flex flex-col gap-2 cursor-pointer group"
                  onClick={() =>
                    handleOpenDonDetail({
                      id: 'Đ-2025-0782',
                      code: 'Đ-2025-0782',
                      title: 'Đối soát miễn giảm tiền sử dụng đất',
                      luotNhanId: 'LN-2025-0782',
                      nguoiNop: 'Lê Văn Hùng',
                      ngayNhan: '15/09/2026 16:30',
                      loaiDon: 'Đơn khiếu nại miễn giảm đất đai',
                      type: 'ĐƠN TIẾP NHẬN',
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-blue-50 text-blue-700 border border-blue-200">
                        ĐƠN TIẾP NHẬN
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-blue-700">
                        Đ-2025-0782
                      </span>
                    </div>
                    <span className="text-[11px] font-label-technical text-slate-500">16:30</span>
                  </div>

                  <h3 className="text-[13px] font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    Đối soát miễn giảm tiền sử dụng đất
                  </h3>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span> Hạn: 16:30 Hôm nay
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDonDetail({
                          id: 'Đ-2025-0782',
                          code: 'Đ-2025-0782',
                          title: 'Đối soát miễn giảm tiền sử dụng đất',
                          luotNhanId: 'LN-2025-0782',
                          nguoiNop: 'Lê Văn Hùng',
                          ngayNhan: '15/09/2026 16:30',
                          loaiDon: 'Đơn khiếu nại miễn giảm đất đai',
                          type: 'ĐƠN TIẾP NHẬN',
                        });
                      }}
                      className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold font-label-technical hover:underline cursor-pointer"
                    >
                      Xem chi tiết →
                    </span>
                  </div>

                  <button
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDonDetail({
                        id: 'Đ-2025-0782',
                        code: 'Đ-2025-0782',
                        title: 'Đối soát miễn giảm tiền sử dụng đất',
                        luotNhanId: 'LN-2025-0782',
                        nguoiNop: 'Lê Văn Hùng',
                        ngayNhan: '15/09/2026 16:30',
                        loaiDon: 'Đơn khiếu nại miễn giảm đất đai',
                        type: 'ĐƠN TIẾP NHẬN',
                      });
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_document</span> Xử lý
                  </button>
                </div>
              )}

              {/* Card 3: Đ-2025-0105 */}
              {matchesSearch('Đ-2025-0105 Thẩm tra thay đổi ngành nghề HKD cá thể') && (
                <div
                  className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-blue-600 transition-all flex flex-col gap-2 cursor-pointer group"
                  onClick={() =>
                    handleOpenDonDetail({
                      id: 'Đ-2025-0105',
                      code: 'Đ-2025-0105',
                      title: 'Thẩm tra thay đổi ngành nghề HKD cá thể',
                      luotNhanId: 'LN-2025-0105',
                      nguoiNop: 'Vũ Thị Thanh',
                      ngayNhan: '16/09/2026 09:30',
                      loaiDon: 'Đăng ký kinh doanh hộ cá thể',
                      type: 'ĐƠN TIẾP NHẬN',
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-blue-50 text-blue-700 border border-blue-200">
                        ĐƠN TIẾP NHẬN
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-slate-700">
                        Đ-2025-0105
                      </span>
                    </div>
                    <span className="text-[11px] font-label-technical text-slate-500">Ngày mai</span>
                  </div>

                  <h3 className="text-[13px] font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    Thẩm tra thay đổi ngành nghề HKD cá thể
                  </h3>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span> Hạn: 10:00 Ngày mai
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDonDetail({
                          id: 'Đ-2025-0105',
                          code: 'Đ-2025-0105',
                          title: 'Thẩm tra thay đổi ngành nghề HKD cá thể',
                          luotNhanId: 'LN-2025-0105',
                          nguoiNop: 'Vũ Thị Thanh',
                          ngayNhan: '16/09/2026 09:30',
                          loaiDon: 'Đăng ký kinh doanh hộ cá thể',
                          type: 'ĐƠN TIẾP NHẬN',
                        });
                      }}
                      className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold font-label-technical hover:underline cursor-pointer"
                    >
                      Xem chi tiết →
                    </span>
                  </div>

                  <button
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDonDetail({
                        id: 'Đ-2025-0105',
                        code: 'Đ-2025-0105',
                        title: 'Thẩm tra thay đổi ngành nghề HKD cá thể',
                        luotNhanId: 'LN-2025-0105',
                        nguoiNop: 'Vũ Thị Thanh',
                        ngayNhan: '16/09/2026 09:30',
                        loaiDon: 'Đăng ký kinh doanh hộ cá thể',
                        type: 'ĐƠN TIẾP NHẬN',
                      });
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_document</span> Xử lý
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= COLUMN 4: CHỜ KÝ & TRẢ KẾT QUẢ ================= */}
        {(filterType === 'all' || filterType === 'qualified') && (
          <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight font-headline-md">
                  CHỜ KÝ &amp; TRẢ KẾT QUẢ
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px] font-label-technical">
                02
              </span>
            </div>
            {/* <p className="text-[11px] text-slate-500 px-1 -mt-1">
              Đã ký nháy, chờ Lãnh đạo ký số &amp; trả Một cửa
            </p> */}

            <div className="flex flex-col gap-2.5">
              {/* Card 1: VV-2025-0612 */}
              {matchesSearch('VV-2025-0612 Tờ trình cấp đổi GCN QSDĐ phôi 2025 ký nháy') && (
                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-emerald-50 text-emerald-800 border border-emerald-200">
                        VỤ VIỆC
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-emerald-800">
                        VV-2025-0612
                      </span>
                    </div>
                    <span className="text-[10.5px] font-label-technical text-emerald-700 font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span> Đã ký nháy
                    </span>
                  </div>

                  <h3 className="text-[13px] font-semibold text-slate-900 leading-snug">
                    Tờ trình cấp đổi GCN QSDĐ phôi 2025
                  </h3>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">calendar_today</span> Hạn: Hôm nay
                    </span>
                  </div>

                  <button
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    onClick={() => showToast('Đã chuyển hồ sơ trình Lãnh đạo ký số qua VGCA Sign!')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">draw</span> Trình Lãnh đạo ký số
                  </button>
                </div>
              )}

              {/* Card 2: Đ-2025-1109 */}
              {matchesSearch('Đ-2025-1109 Trả kết quả bản sao chứng thực HĐ ký số') && (
                <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-label-technical bg-blue-50 text-blue-700 border border-blue-200">
                        ĐƠN TIẾP NHẬN
                      </span>
                      <span className="font-label-technical text-[11px] font-bold text-slate-700">
                        Đ-2025-1109
                      </span>
                    </div>
                    <span className="text-[10.5px] font-label-technical text-blue-700 font-medium flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">verified</span> Đã ký số
                    </span>
                  </div>

                  <h3 className="text-[13px] font-semibold text-slate-900 leading-snug">
                    Trả kết quả bản sao chứng thực HĐ
                  </h3>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-label-technical flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">calendar_today</span> Hạn: Hôm nay
                    </span>
                  </div>

                  <button
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    onClick={() => showToast('Đã hoàn tất trả kết quả sang Bộ phận Một cửa')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">cloud_done</span> Trả kết quả Một cửa
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}