import React from 'react';
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[12.5px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1 leading-snug">{children}</div>;
}
export default FieldLabel;