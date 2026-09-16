import React from 'react';
function AckToggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="w-4 h-4 accent-blue-700" />
      <span className="text-sm font-medium" style={{ color: checked ? "#15803D" : "#374151" }}>{label}</span>
    </label>
  );
}
export default AckToggle;