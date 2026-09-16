import React from 'react';
function SourceBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="text-xs px-2 py-0.5 rounded font-medium transition-colors"
      style={{ background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#E2E8F0"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F1F5F9"; }}>
      Xem nguồn ↗
    </button>
  );
}
export default SourceBtn;