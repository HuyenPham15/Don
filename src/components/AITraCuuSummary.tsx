import React from 'react';
import { DrawerState } from "../types";
function AITraCuuSummary({ onOpen }: { onOpen: (d: DrawerState) => void }) {
  const items: { icon: string; label: string; drawer: DrawerState }[] = [
    { icon: "👤", label: "02 lượt nhận trước", drawer: { type: "nguoi-gui" } },
    { icon: "🔗", label: "03 đơn liên quan", drawer: { type: "don-lien-quan" } },
    { icon: "⚖️", label: "01 vụ việc liên quan", drawer: { type: "vu-viec" } },
    { icon: "📊", label: "01 nội dung tương đồng 84%", drawer: { type: "so-sanh" } },
  ];
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748B" }}>AI ĐÃ TRA CỨU</span>
        <span className="text-xs px-1.5 py-0.5 rounded font-bold ml-auto" style={{ background: "#F0FDF4", color: "#15803D" }}>✓ Hoàn thành</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {items.map((it) => (
          <button key={it.label} onClick={() => onOpen(it.drawer)}
            className="text-left rounded-lg border p-3 transition-all"
            style={{ borderColor: "#E2E8F0", background: "#fff" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#C62828"; (e.currentTarget as HTMLElement).style.background = "#FFF5F5"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
            <div className="text-lg mb-1">{it.icon}</div>
            <div className="text-xs font-semibold" style={{ color: "#1A202C" }}>{it.label}</div>
            <div className="text-xs mt-1" style={{ color: "#C62828" }}>Xem chi tiết →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
export default AITraCuuSummary;