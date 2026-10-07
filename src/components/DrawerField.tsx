import React from 'react';
function DrawerField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b last:border-0 border-slate-100">
      <span className="text-[12.5px] font-medium text-slate-500 flex-shrink-0 mt-0.5" style={{ minWidth: 100 }}>{label}</span>
      <span className={`text-[13.5px] font-normal text-slate-800 text-right ${mono ? "mono" : ""}`}>{value}</span>
    </div>
  );
}
export default DrawerField;