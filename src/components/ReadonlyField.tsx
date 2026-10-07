import React from 'react';
function ReadonlyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[12.5px] font-medium text-slate-600 mb-1.5">{label}</div>
      <div className={`px-3 py-2 rounded-lg text-[13.5px] font-normal bg-slate-50 text-slate-700 border border-slate-200 ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  );
}
export default ReadonlyField;