import React, { useState } from 'react';
import { Screen } from "../types";

interface SidebarProps {
  screen: Screen;
  onNav: (s: Screen) => void;
}

export default function Sidebar({ screen, onNav }: SidebarProps) {
  const isNhanDon = ["nhan-don-list", "nhan-don-them", "ban-phan-tich"].includes(screen);
  const isCongViec = screen === "cong-viec" || screen === "don-tiep-nhan" || screen === "quy-trinh-xu-ly";
  const isQuanTri = [
    "quan-tri-quy-trinh",
    "quan-tri-loai-don",
    "quan-tri-lich-lam-viec",
    "quan-tri-bieu-mau",
  ].includes(screen);

  const [isQuanTriOpen, setIsQuanTriOpen] = useState(true);

  return (
    <aside className="w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none h-full shrink-0 shadow-2xs">
      <div className="flex flex-col flex-1 overflow-hidden p-3.5 pb-2">
        {/* Main Nav Items */}
        <nav className="space-y-1">
          {/* Công việc của tôi */}
          <button
            type="button"
            onClick={() => onNav('cong-viec')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${isCongViec
              ? 'bg-blue-50 text-[#004ac6] font-semibold border border-blue-100/60 shadow-2xs'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-[20px] ${isCongViec ? 'text-[#004ac6]' : 'text-slate-600'
                  }`}
              >
                smart_toy
              </span>
              <span className="text-[13.5px] font-medium">Công việc của tôi</span>
            </div>
            {isCongViec && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
          </button>

          {/* Nhận đơn */}
          <button
            type="button"
            onClick={() => onNav('nhan-don-list')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${isNhanDon
              ? 'bg-blue-50 text-[#004ac6] font-semibold border border-blue-100/60 shadow-2xs'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-[20px] ${isNhanDon ? 'text-[#004ac6]' : 'text-slate-600'
                  }`}
              >
                post_add
              </span>
              <span className="text-[13.5px] font-medium">Nhận đơn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white border border-blue-600 text-[11px] font-semibold font-label-technical">
                4
              </span>
              {isNhanDon && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
            </div>
          </button>

          {/* Trò chuyện trợ lý AI */}
          <button
            type="button"
            onClick={() => onNav('thu-vien')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${screen === 'thu-vien'
              ? 'bg-blue-50 text-[#004ac6] font-semibold border border-blue-100/60 shadow-2xs'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[20px] ${screen === 'thu-vien' ? 'text-[#004ac6]' : 'text-slate-600'}`}>chat</span>
              <span className="text-[13.5px] font-medium">Trò chuyện trợ lý AI</span>
            </div>
            {screen === 'thu-vien' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
          </button>

          {/* Báo cáo thông minh */}
          <button
            type="button"
            onClick={() => onNav('bao-cao')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${screen === 'bao-cao'
              ? 'bg-blue-50 text-[#004ac6] font-semibold border border-blue-100/60'
              : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-600">trending_up</span>
              <span className="text-[13.5px] font-medium">Báo cáo thông minh</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
          </button>

          {/* Nhóm: Quản trị nghiệp vụ (Bao gồm Quy trình, Loại đơn, Lịch làm việc, Biểu mẫu) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (!isQuanTri) {
                  onNav('quan-tri-quy-trinh');
                }
                setIsQuanTriOpen(!isQuanTriOpen);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isQuanTri
                  ? 'bg-blue-50/80 text-[#004ac6] font-bold border border-blue-100 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isQuanTri ? 'text-[#004ac6]' : 'text-slate-600'
                  }`}
                >
                  settings_suggest
                </span>
                <span className="text-[13.5px] font-bold tracking-tight">Quản trị nghiệp vụ</span>
              </div>
              <span
                className={`material-symbols-outlined text-[17px] text-slate-400 transition-transform duration-200 ${
                  isQuanTriOpen ? 'rotate-90' : ''
                }`}
              >
                chevron_right
              </span>
            </button>

            {/* Sub-items list */}
            {isQuanTriOpen && (
              <div className="mt-1 pl-3 pr-1 space-y-0.5 border-l-2 border-blue-200/60 ml-4 py-0.5 animate-in fade-in duration-150">
                {/* 1. Quy trình xử lý */}
                <button
                  type="button"
                  onClick={() => onNav('quan-tri-quy-trinh')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    screen === 'quan-tri-quy-trinh'
                      ? 'bg-blue-100/60 text-[#004ac6] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">account_tree</span>
                    <span className="text-[12.5px] truncate">Quy trình xử lý</span>
                  </div>
                  {screen === 'quan-tri-quy-trinh' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </button>

                {/* 2. Loại đơn */}
                <button
                  type="button"
                  onClick={() => onNav('quan-tri-loai-don')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    screen === 'quan-tri-loai-don'
                      ? 'bg-blue-100/60 text-[#004ac6] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">category</span>
                    <span className="text-[12.5px] truncate">Loại đơn</span>
                  </div>
                  {screen === 'quan-tri-loai-don' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </button>

                {/* 3. Lịch làm việc */}
                <button
                  type="button"
                  onClick={() => onNav('quan-tri-lich-lam-viec')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    screen === 'quan-tri-lich-lam-viec'
                      ? 'bg-blue-100/60 text-[#004ac6] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">calendar_month</span>
                    <span className="text-[12.5px] truncate">Lịch làm việc</span>
                  </div>
                  {screen === 'quan-tri-lich-lam-viec' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </button>

                {/* 4. Biểu mẫu */}
                <button
                  type="button"
                  onClick={() => onNav('quan-tri-bieu-mau')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    screen === 'quan-tri-bieu-mau'
                      ? 'bg-blue-100/60 text-[#004ac6] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">description</span>
                    <span className="text-[12.5px] truncate">Biểu mẫu</span>
                  </div>
                  {screen === 'quan-tri-bieu-mau' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="my-3 border-t border-slate-200/70"></div>

        {/* Task lists by day */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
          {/* Section: Hôm nay */}
          <div className="space-y-1.5">
            <div className="px-2 font-label-technical text-[10.5px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>HÔM NAY (24/10)</span>
              <span className="text-slate-400 font-normal">2 TÁC VỤ</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onNav('cong-viec')}
                className="w-full text-left group flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-blue-50/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-blue-600 mt-0.5 shrink-0">
                  assignment
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-slate-800 leading-snug truncate group-hover:text-blue-700">
                    Thẩm định hồ sơ Đất đai ĐĐ-20...
                  </p>
                  <span className="font-label-technical text-[10.5px] text-slate-400 block mt-0.5">
                    09:15 • GCN QSDĐ lần đầu
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNav('cong-viec')}
                className="w-full text-left group flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-blue-50/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-blue-600 mt-0.5 shrink-0">
                  gavel
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-slate-800 leading-snug truncate group-hover:text-blue-700">
                    Tra cứu NĐ 101/2024 về Đất đai
                  </p>
                  <span className="font-label-technical text-[10.5px] text-slate-400 block mt-0.5">
                    08:40 • Trình tự cấp GCN
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Section: Tuần này */}
          <div className="space-y-1.5">
            <div className="px-2 font-label-technical text-[10.5px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>TUẦN NÀY</span>
              <span className="text-slate-400 font-normal">3 TÁC VỤ</span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onNav('cong-viec')}
                className="w-full text-left group flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-blue-50/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-400 group-hover:text-blue-600 mt-0.5 shrink-0">
                  apartment
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-slate-800 leading-snug truncate group-hover:text-blue-700">
                    Rà soát điều kiện cấp phép XD n...
                  </p>
                  <span className="font-label-technical text-[10.5px] text-slate-400 block mt-0.5">
                    Hôm qua • Chỉ giới đường đỏ
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNav('cong-viec')}
                className="w-full text-left group flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-blue-50/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-400 group-hover:text-blue-600 mt-0.5 shrink-0">
                  description
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-slate-800 leading-snug truncate group-hover:text-blue-700">
                    Dự thảo tờ trình phân loại rác ng...
                  </p>
                  <span className="font-label-technical text-[10.5px] text-slate-400 block mt-0.5">
                    Thứ Ba • Phòng TN&amp;MT
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNav('cong-viec')}
                className="w-full text-left group flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-blue-50/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-400 group-hover:text-blue-600 mt-0.5 shrink-0">
                  contact_support
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-slate-800 leading-snug truncate group-hover:text-blue-700">
                    Hỏi đáp nghĩa vụ tài chính đất xe...
                  </p>
                  <span className="font-label-technical text-[10.5px] text-slate-400 block mt-0.5">
                    Thứ Hai • Thuế Ba Đình
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>


    </aside>
  );
}