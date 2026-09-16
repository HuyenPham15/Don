import React, { useState } from 'react';
function PanelSection({ index, title, right, defaultOpen = true, children }: {
  index: number; title: string; right?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: "#E5E7EB" }}>
      <header className="flex items-center gap-3 px-4 py-3" style={{ background: "#FBFCFD", borderBottom: open ? "1px solid #F1F5F9" : "none" }}>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
          <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{index}</span>
          <span className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>{title}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#94A3B8" strokeWidth="1.6" className="flex-shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }}><path d="M4 6l4 4 4-4" /></svg>
        </button>
        {right}
      </header>
      {open && <div className="p-4">{children}</div>}
    </section>
  );
}
export default PanelSection;