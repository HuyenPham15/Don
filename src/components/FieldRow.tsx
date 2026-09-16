import React from 'react';
import SourceBtn from "./SourceBtn";
function FieldRow({ label, value, confidence, onSource }: { label: string; value: string; confidence?: string; onSource?: () => void }) {
  return (
    <div className="py-2.5 border-b last:border-0 flex items-start justify-between gap-4" style={{ borderColor: "#F1F5F9" }}>
      <div>
        <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "#94A3B8", fontSize: 9 }}>{label}</div>
        <div className="text-sm font-medium">{value}</div>
        {confidence && <div className="text-xs mt-0.5 font-medium" style={{ color: "#15803D" }}>{confidence}</div>}
      </div>
      {onSource && <SourceBtn onClick={onSource} />}
    </div>
  );
}
export default FieldRow;