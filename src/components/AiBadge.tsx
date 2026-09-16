import React from 'react';
function AiBadge({ type }: { type: "AI PHÂN TÍCH" | "AI TÌM KIẾM" | "AI ĐỐI CHIẾU" | "AI ĐỀ XUẤT" }) {
  const colors: Record<string, { bg: string; c: string }> = {
    "AI PHÂN TÍCH": { bg: "#EFF6FF", c: "#1E40AF" },
    "AI TÌM KIẾM": { bg: "#F5F3FF", c: "#6D28D9" },
    "AI ĐỐI CHIẾU": { bg: "#F0FDF4", c: "#15803D" },
    "AI ĐỀ XUẤT": { bg: "#FFFBEB", c: "#B45309" },
  };
  const s = colors[type];
  return <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide" style={{ background: s.bg, color: s.c }}>{type}</span>;
}
export default AiBadge;