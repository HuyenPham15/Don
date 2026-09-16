import React from 'react';
import { Screen } from "../types";

interface SidebarProps {
  screen: Screen;
  onNav: (s: Screen) => void;
}

export default function Sidebar({ screen, onNav }: SidebarProps) {
  const isNhanDon = ["nhan-don-list", "nhan-don-them", "ban-phan-tich"].includes(screen);
  const isCongViec = screen === "cong-viec" || screen === "don-tiep-nhan" || screen === "quy-trinh-xu-ly";

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

          {/* Thư viện pháp luật */}
          <button
            type="button"
            onClick={() => onNav('thu-vien')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${screen === 'thu-vien'
                ? 'bg-blue-50 text-[#004ac6] font-semibold border border-blue-100/60'
                : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-600">menu_book</span>
              <span className="text-[13.5px] font-medium">Thư viện pháp luật</span>
            </div>
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

      {/* Sidebar Footer: Officer Badge & Status */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-200">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              alt="Đ/c Nguyễn Thị Hải Yến"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1Vm8AmQo9VS0i0OU3LAMhsUuKtUCDjclJf2bj1YUtpprazrhuIJVsTqgqRNCCxQVPXb5Ua6R3isc0PvgdNR0oe3_nAFqcnDGYqLTe1YPyHmU-1B4MJqkPPF24_Go8JUXhDIHmNNiVK7g1JgxEf0euZX8a4syr1kbsv8qD985iCrJmA2se-U3WY8STZNUyABcKMR5Jn6IaQsZsEgpk8bIuIzHu_VoUzxgFNNUsjG5LmSLxZV4EXS3_4Ot2vu"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-slate-800 truncate">Nguyễn Thị Hải Yến</span>
              <span className="text-[10.5px] text-slate-500 font-label-technical truncate">
                Chuyên viên chính (Bậc 4)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Cài đặt ca trực"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất an toàn"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}