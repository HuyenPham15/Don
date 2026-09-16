import React from 'react';
function DrawerField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b last:border-0" style={{ borderColor: "#F8FAFC" }}>
      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#94A3B8", minWidth: 100 }}>{label}</span>
      <span className={`text-sm font-medium text-right ${mono ? "mono" : ""}`}>{value}</span>
    </div>
  );
}
export default DrawerField;