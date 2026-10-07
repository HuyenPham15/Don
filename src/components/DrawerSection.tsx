import React from 'react';
function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[14px] font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">{title}</div>
      {children}
    </div>
  );
}
export default DrawerSection;