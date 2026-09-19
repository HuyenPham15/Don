// src/screens/workflowAdmin/QuanTriNghiepVuScreen.tsx
import React, { useState } from 'react';
import { Screen } from '../../types';
import { BusinessAdminTab } from '../../types/businessAdmin';
import ProcessWorkflowModule from './ProcessWorkflowModule';
import LoaiDonTab from './tabs/LoaiDonTab';
import LichLamViecTab from './tabs/LichLamViecTab';
import BieuMauTab from './tabs/BieuMauTab';

interface QuanTriNghiepVuScreenProps {
  onNav: (s: Screen) => void;
  initialTab?: BusinessAdminTab;
}

export default function QuanTriNghiepVuScreen({
  onNav,
  initialTab = 'quy-trinh',
}: QuanTriNghiepVuScreenProps) {
  const [activeTab, setActiveTab] = useState<BusinessAdminTab>(initialTab);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4f7fb]">
      {/* 1. MASTER NAV BAR - QUẢN TRỊ NGHIỆP VỤ */}
      <div className="bg-white border-b border-slate-200/90 px-6 pt-3 pb-0 shrink-0 shadow-2xs z-20">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  Quản trị nghiệp vụ
                </h1>
                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono text-[10.5px] font-bold border border-blue-200">
                  Hệ thống số hóa GOVEX
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Chuẩn hóa danh mục Quy trình xử lý, Loại đơn, Lịch làm việc và Kho Biểu mẫu điện tử
              </p>
            </div>
          </div>
        </div>

        {/* 4 Tabs Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-1 -mb-px">
          {/* Tab 1: Quy trình xử lý */}
          <button
            type="button"
            onClick={() => setActiveTab('quy-trinh')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'quy-trinh'
                ? 'border-blue-600 text-[#004ac6] bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                activeTab === 'quy-trinh' ? 'text-[#004ac6]' : 'text-slate-400'
              }`}
            >
              account_tree
            </span>
            <span>Quy trình xử lý</span>
          </button>

          {/* Tab 2: Loại đơn */}
          <button
            type="button"
            onClick={() => setActiveTab('loai-don')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'loai-don'
                ? 'border-blue-600 text-[#004ac6] bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                activeTab === 'loai-don' ? 'text-[#004ac6]' : 'text-slate-400'
              }`}
            >
              category
            </span>
            <span>Loại đơn</span>
          </button>

          {/* Tab 3: Lịch làm việc */}
          <button
            type="button"
            onClick={() => setActiveTab('lich-lam-viec')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'lich-lam-viec'
                ? 'border-blue-600 text-[#004ac6] bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                activeTab === 'lich-lam-viec' ? 'text-[#004ac6]' : 'text-slate-400'
              }`}
            >
              calendar_month
            </span>
            <span>Lịch làm việc</span>
          </button>

          {/* Tab 4: Biểu mẫu */}
          <button
            type="button"
            onClick={() => setActiveTab('bieu-mau')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'bieu-mau'
                ? 'border-blue-600 text-[#004ac6] bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                activeTab === 'bieu-mau' ? 'text-[#004ac6]' : 'text-slate-400'
              }`}
            >
              description
            </span>
            <span>Biểu mẫu</span>
          </button>
        </div>
      </div>

      {/* 2. TAB BODY */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'quy-trinh' && <ProcessWorkflowModule onNav={onNav} />}
        {activeTab === 'loai-don' && <LoaiDonTab onNavigateToWorkflow={() => setActiveTab('quy-trinh')} />}
        {activeTab === 'lich-lam-viec' && <LichLamViecTab />}
        {activeTab === 'bieu-mau' && <BieuMauTab />}
      </div>
    </div>
  );
}
