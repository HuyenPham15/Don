import React from 'react';
function MatchFactor({ label, matched = true }: { label: string; matched?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm py-1">
      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
        style={{ background: matched ? "#D1FAE5" : "#FEE2E2", color: matched ? "#15803D" : "#C62828" }}>
        {matched ? "✓" : "✗"}
      </span>
      <span style={{ color: "#374151" }}>{label}</span>
    </div>
  );
}
export default MatchFactor;