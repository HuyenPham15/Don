import React from 'react';
function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-xs font-bold uppercase tracking-widest mb-3 pb-2 border-b" style={{ color: "#94A3B8", borderColor: "#F1F5F9" }}>{title}</div>
      {children}
    </div>
  );
}
export default DrawerSection;