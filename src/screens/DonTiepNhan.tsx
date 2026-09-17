import React, { useState } from 'react';
import { Screen, DonDetail } from "../types";
import TabThongTinChung from '../components/tabs/TabThongTinChung';
import TabMoiLienHe from '../components/tabs/TabMoiLienHe';
import TabDonKhac from '../components/tabs/TabDonKhac';
import TabTaiLieu from '../components/tabs/TabTaiLieu';

interface DonTiepNhanProps {
  onNav: (s: Screen) => void;
  donDetail?: DonDetail | null;
}

export default function DonTiepNhan({ onNav, donDetail }: DonTiepNhanProps) {
  const [activeTab, setActiveTab] = useState<'thong-tin' | 'lien-he' | 'don-khac' | 'tai-lieu'>('thong-tin');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const currentDon = donDetail || {
    id: "DS-39/2026-GOVEX",
    code: "DS-39/2026-GOVEX",
    title: "Xác lập lý do hồ sơ khiếu nại bồi thường thu hồi đất QL1A",
    luotNhanId: "LN-45/2026-GOVEX",
    nguoiNop: "Lê Văn Hùng",
    ngayNhan: "15/09/2026 09:15",
    loaiDon: "Đơn khiếu nại đất đai",
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SUB-HEADER & BREADCRUMB & ACTION CONTROLS                              */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 pt-3.5 shrink-0 shadow-2xs">
        {/* Breadcrumb row */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <button
              type="button"
              onClick={() => onNav("cong-viec")}
              className="flex items-center gap-1 text-[#004ac6] hover:text-[#003ea8] hover:underline font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Quay lại Bàn làm việc của tôi</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="hover:underline cursor-pointer" onClick={() => onNav("cong-viec")}>
              Trang chủ
            </span>
            <span className="text-slate-300">/</span>
            <span className="hover:underline cursor-pointer" onClick={() => onNav("cong-viec")}>
              Bàn làm việc
            </span>
            <span className="text-slate-300">/</span>
            <span className="hover:underline cursor-pointer">
              Tiếp nhận &amp; Xử lý đơn
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">{currentDon.code}</span>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              Quá hạn luật định 1 ngày
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-semibold font-label-technical">
              Mã tiếp nhận gốc: {currentDon.luotNhanId || 'LN-45/2026-GOVEX'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-semibold">
              {currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
            </span>
          </div>
        </div>

        {/* Title Row & Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[19px] font-bold text-slate-900 tracking-tight font-headline-md leading-tight">
              {currentDon.code}: {currentDon.title.startsWith(currentDon.code) ? currentDon.title.replace(`${currentDon.code}: `, '') : currentDon.title}
            </h1>
            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium mt-1">
              <span>
                Lượt tiếp nhận số{' '}
                <span className="font-semibold text-slate-700">
                  {currentDon.luotNhanId || 'LN-45/2026-GOVEX'}
                </span>
              </span>
              <span>•</span>
              <span>
                Người đứng đơn:{' '}
                <strong className="text-slate-800 font-semibold">{currentDon.nguoiNop}</strong>
              </span>
              <span>•</span>
              <span>
                Nộp ngày:{' '}
                <span className="font-semibold text-slate-700">
                  {currentDon.ngayNhan || '15/09/2026 09:15'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => showToast('Đã gắn liên kết hồ sơ vào vụ việc liên quan.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">link</span>
              <span>Gắn vào hồ sơ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('✓ Hoàn thành xử lý và xác lập thụ lý hồ sơ thành công!');
                setTimeout(() => onNav('cong-viec'), 1500);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Hoàn thành xử lý / Xác lập thụ lý</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-8 text-xs font-bold border-b border-slate-200 -mb-px">
          {/* Tab 1: Thông tin chung */}
          <button
            type="button"
            onClick={() => setActiveTab('thong-tin')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'thong-tin'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Thông tin chung</span>
          </button>

          {/* Tab 2: Mối liên hệ */}
          <button
            type="button"
            onClick={() => setActiveTab('lien-he')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lien-he'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Mối liên hệ</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#004ac6] font-semibold text-[10px] border border-blue-200">
              Sơ đồ
            </span>
          </button>

          {/* Tab 3: Đơn khác */}
          <button
            type="button"
            onClick={() => setActiveTab('don-khac')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'don-khac'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">move_to_inbox</span>
            <span>Đơn khác</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
              2 đơn ghép
            </span>
          </button>

          {/* Tab 4: Hồ sơ & Tài liệu */}
          <button
            type="button"
            onClick={() => setActiveTab('tai-lieu')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tai-lieu'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder</span>
            <span>Hồ sơ &amp; Tài liệu</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
              5 file
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE CONTENT                                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
        <div className="w-full max-w-[1720px] mx-auto space-y-6">
          {activeTab === 'thong-tin' && (
            <TabThongTinChung
              currentDon={currentDon}
              onOpenLuotNhan={() => onNav('ban-phan-tich')}
              onOpenSoDo={() => setActiveTab('lien-he')}
            />
          )}
          {activeTab === 'lien-he' && <TabMoiLienHe currentDon={currentDon} />}
          {activeTab === 'don-khac' && <TabDonKhac currentDon={currentDon} />}
          {activeTab === 'tai-lieu' && <TabTaiLieu currentDon={currentDon} />}
        </div>
      </div>
    </div>
  );
}