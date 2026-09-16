import React from 'react';
function SectionCard({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
      <div className="px-5 py-3.5 border-b flex items-center gap-3" style={{ borderColor: "#F1F5F9", background: "#FAFAFA" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#F1F5F9", color: "#64748B" }}>{num}</div>
        <span className="text-sm font-semibold tracking-tight">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
export default SectionCard;