import React from 'react';
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="text-3xl">📄</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm" style={{ color: "#94A3B8" }}>Đang phát triển</div>
    </div>
  );
}
export default Placeholder;