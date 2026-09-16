import React from 'react';
function JobCard({ title, badge, active, children }: { title: string; badge?: string; active?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border" style={{ borderColor: active ? "#BFDBFE" : "#E2E8F0", background: active ? "#EFF6FF" : "#fff" }}>
      <div className="px-4 pt-4 pb-3 border-b flex items-center justify-between" style={{ borderColor: active ? "#BFDBFE" : "#E2E8F0" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: active ? "#1E40AF" : "#64748B" }}>{title}</span>
        {badge && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: active ? "#DBEAFE" : "#F0FDF4", color: active ? "#1E40AF" : "#15803D" }}>{badge}</span>}
        {active && <span className="text-xs font-medium ai-pulse" style={{ color: "#B45309" }}>Đang xử lý…</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
export default JobCard;