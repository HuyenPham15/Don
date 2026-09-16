import React from 'react';
function SectionTitle({ children, badge, num }: { children: React.ReactNode; badge?: React.ReactNode; num?: number }) {
  return (
    <div className="flex items-center gap-2 pb-2 mb-4 border-b" style={{ borderColor: "#F1F5F9" }}>
      {num !== undefined && (
        <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
          style={{ background: "#B45309", color: "#fff" }}>{num}</span>
      )}
      <span className="text-xs font-bold uppercase tracking-widest flex-1" style={{ color: "#64748B" }}>{children}</span>
      {badge}
    </div>
  );
}
export default SectionTitle;