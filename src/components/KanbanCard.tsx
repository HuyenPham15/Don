import React from 'react';
import { JOB_LABELS } from "../constants";
import { LuotNhan } from "../types";
function KanbanCard({ card, onOpen }: { card: LuotNhan; onOpen: () => void }) {
  const done = card.aiJob === 5;
  const running = card.aiJob > 0 && card.aiJob < 5;
  const pct = (card.aiJob / 5) * 100;

  return (
    <div className="bg-white rounded-lg border p-3 cursor-pointer transition-all slide-in"
      style={{ borderColor: "#E2E8F0" }}
      onClick={onOpen}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#94A3B8"; el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)"; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#E2E8F0"; el.style.boxShadow = "none"; }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide" style={{ background: "#EFF6FF", color: "#1E40AF", fontSize: 9 }}>LƯỢT NHẬN</span>
        {done && <span className="text-xs font-medium" style={{ color: "#15803D" }}>✓ Xong</span>}
        {running && <span className="text-xs font-medium ai-pulse" style={{ color: "#B45309" }}>{card.aiJob}/6</span>}
      </div>
      <div className="mono text-xs font-semibold mb-1" style={{ color: "#C62828" }}>{card.id}</div>
      <div className="text-sm font-medium mb-0.5">{card.nguoiNop}</div>
      <div className="text-xs mb-2" style={{ color: "#94A3B8" }}>{card.ngayNhan}</div>

      {running && (
        <div className="mb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full ai-pulse flex-shrink-0" style={{ background: "#F59E0B" }} />
            <span className="text-xs truncate" style={{ color: "#B45309" }}>Đang {JOB_LABELS[card.aiJob].toLowerCase()}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "#FEF3C7" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ background: "#F59E0B", width: `${pct}%` }} />
          </div>
        </div>
      )}
      {done && (
        <div className="text-xs px-2 py-1 rounded mb-2" style={{ background: "#F0FDF4", color: "#15803D" }}>AI đã phân tích xong · 6/6 bước</div>
      )}
      {card.aiJob === 0 && (
        <div className="text-xs px-2 py-1 rounded mb-2" style={{ background: "#F8FAFC", color: "#94A3B8" }}>Chờ phân tích AI</div>
      )}

      <button className="w-full text-xs py-1.5 rounded border font-medium" style={{ borderColor: "#E2E8F0", color: "#64748B" }} onClick={(e) => { e.stopPropagation(); onOpen(); }}>Xem chi tiết</button>
    </div>
  );
}
export default KanbanCard;