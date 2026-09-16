import React from 'react';
import { IcoBriefcase, IcoInbox, IcoBook, IcoChart } from "./icons";
import { Screen } from "../types";
function Sidebar({ screen, onNav }: { screen: Screen; onNav: (s: Screen) => void }) {
  const navs: { id: Screen; icon: React.ReactNode; label: string }[] = [
    { id: "cong-viec", icon: <IcoBriefcase />, label: "Công việc của tôi" },
    { id: "nhan-don-list", icon: <IcoInbox />, label: "Nhận đơn" },
    { id: "thu-vien", icon: <IcoBook />, label: "Thư viện pháp luật" },
    { id: "bao-cao", icon: <IcoChart />, label: "Báo cáo thông minh" },
  ];
  const chatHistory = ["Phân tích LN-18 – Trần Thị B", "Tra cứu Luật đất đai 2024", "So sánh LN-12 và LN-08"];
  const isNhanDon = ["nhan-don-list", "nhan-don-them", "ban-phan-tich", "don-tiep-nhan"].includes(screen);

  return (
    <aside className="flex flex-col h-full flex-shrink-0" style={{ width: 228, background: "#1B2A3B" }}>
      <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #243447" }}>
        <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-sm" style={{ background: "#C62828" }}>G</div>
        <div>
          <div className="text-white font-semibold text-sm tracking-wide">GOVEX</div>
          <div className="text-xs" style={{ color: "#64748B", fontSize: 10, letterSpacing: "0.05em" }}>AI Workflow Platform</div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-2">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors" style={{ color: "#64748B", border: "1px solid #2D4159" }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Đoạn chat mới
        </button>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto">
        <div className="space-y-0.5 mb-5">
          {navs.map((n) => {
            const active = n.id === screen || (n.id === "nhan-don-list" && isNhanDon);
            return (
              <button key={n.id} onClick={() => onNav(n.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors text-left"
                style={{ background: active ? "#2D4159" : "transparent", color: active ? "#fff" : "#94A3B8" }}>
                <span className="w-4 h-4 flex-shrink-0">{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </div>
        <div className="text-xs px-3 mb-1.5 uppercase tracking-widest" style={{ color: "#334155", fontSize: 9 }}>Lịch sử chat</div>
        {chatHistory.map((h) => (
          <button key={h} className="w-full text-left px-3 py-1.5 rounded text-xs truncate transition-colors" style={{ color: "#64748B" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#243447"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>{h}</button>
        ))}
      </nav>

      <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: "1px solid #243447" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: "#2D4159" }}>NMA</div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-medium truncate">Nguyễn Minh Anh</div>
          <div className="text-xs truncate" style={{ color: "#64748B", fontSize: 10 }}>Cán bộ tiếp nhận</div>
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;