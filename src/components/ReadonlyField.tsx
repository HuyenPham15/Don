import React from 'react';
function ReadonlyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs font-medium mb-1" style={{ color: "#94A3B8" }}>{label}</div>
      <div className={`px-3 py-2 rounded-lg text-sm ${mono ? "mono" : ""}`} style={{ background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" }}>{value}</div>
    </div>
  );
}
export default ReadonlyField;