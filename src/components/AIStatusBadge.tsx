import React from 'react';
function AIStatusBadge({ job, confirmed }: { job: AIJob; confirmed?: boolean }) {
  if (confirmed) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#D1FAE5", color: "#15803D" }}>
      ✓ ĐÃ XÁC NHẬN & CHUYỂN QUY TRÌNH
    </span>
  );
  if (job === 5) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#F0FDF4", color: "#15803D" }}>
      ✓ AI ĐÃ PHÂN TÍCH XONG · 6/6 bước
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#FFFBEB", color: "#B45309" }}>
      <span className="w-1.5 h-1.5 rounded-full ai-pulse" style={{ background: "#F59E0B" }} />
      AI ĐANG PHÂN TÍCH · {job}/6 bước
    </span>
  );
}
export default AIStatusBadge;