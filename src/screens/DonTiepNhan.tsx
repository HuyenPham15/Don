import React, { useState } from 'react';
import { Screen } from "../types";
import TabThongTinChung from '../components/tabs/TabThongTinChung';
import TabMoiLienHe from '../components/tabs/TabMoiLienHe';

// -- ICONS --
const IconBack = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconLink = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconDoc = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconHash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>;
const IconInbox = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>;
const IconFolder = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;

const TABS = [
  { id: "thong-tin", label: "Thông tin chung", icon: <IconDoc /> },
  { id: "lien-he", label: "Mối liên hệ", icon: <IconHash />, extra: <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold border" style={{ borderColor: "#E2E8F0" }}>Sơ đồ</span> },
  { id: "don-khac", label: "Đơn khác", icon: <IconInbox />, badge: "2 đơn ghép", badgeColor: "bg-red-50 text-red-600 border-red-100" },
  { id: "tai-lieu", label: "Hồ sơ & Tài liệu", icon: <IconFolder />, badge: "5 file", badgeColor: "bg-green-50 text-green-700 border-green-200" },
];

export default function DonTiepNhan({ onNav }: { onNav: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState("thong-tin");

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Header Area */}
      <div className="bg-white border-b px-6 pt-4 flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-3 font-medium text-slate-500">
          <button onClick={() => onNav("cong-viec")} className="flex items-center gap-1.5 hover:text-red-600 transition-colors" style={{ color: "#E11D48" }}>
            <IconBack />
            <span>Quay lại Bàn làm việc của tôi</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="hover:underline cursor-pointer">Trang chủ</span>
          <span className="text-slate-300">/</span>
          <span className="hover:underline cursor-pointer">Bàn làm việc</span>
          <span className="text-slate-300">/</span>
          <span className="hover:underline cursor-pointer">Tiếp nhận & Xử lý đơn</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-700">DS-39/2026-GOVEX</span>
        </div>

        {/* Title Row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight mb-1">
              DS-39/2026-GOVEX: Xác lập lý do hồ sơ khiếu nại bồi thường thu hồi đất QL1A
            </h1>
            <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
              <span>Lượt tiếp nhận số <span className="font-semibold">LN-45/2026-GOVEX</span></span>
              <span>•</span>
              <span>Người đứng đơn: <span className="font-semibold text-slate-800">Lê Văn Hùng</span></span>
              <span>•</span>
              <span>Nộp ngày: 15/09/2026 09:15</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Top Badges */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-red-50 text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                Quá hạn luật định 1 ngày
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border text-slate-600 bg-slate-50" style={{ borderColor: "#E2E8F0" }}>
                Mã lượt nhận gốc: LN-45/2026-GOVEX
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700" style={{ borderColor: "#FDE68A" }}>
                Đơn khiếu nại đất đai
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[13px] font-bold bg-white hover:bg-slate-50 text-slate-700 transition-colors" style={{ borderColor: "#CBD5E1" }}>
                <IconLink />
                Gắn vào hồ sơ
              </button>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#BE123C" }}>
                <IconCheck />
                Hoàn thành xử lý / Xác lập thụ lý
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 border-b-2 text-sm font-bold transition-colors ${isActive
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
              >
                <span className={isActive ? "text-red-600" : "text-slate-400"}>{tab.icon}</span>
                {tab.label}
                {tab.extra && tab.extra}
                {tab.badge && (
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded border ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: "radial-gradient(#E2E8F0 1px, transparent 1px)", backgroundSize: "16px 16px", backgroundColor: "#F8FAFC" }}>
        <div className="max-w-6xl mx-auto h-full space-y-6">
          {activeTab === "thong-tin" && <TabThongTinChung />}
          {activeTab === "lien-he" && <TabMoiLienHe />}
          {activeTab !== "thong-tin" && activeTab !== "lien-he" && (
            <div className="bg-white rounded-xl border p-8 text-center text-slate-500 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
              Tính năng đang phát triển...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}