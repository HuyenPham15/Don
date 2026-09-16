import React from 'react';
import { Screen } from "../types";
function QuyTrinhProgressCard({ onNav }: { onNav: (s: Screen) => void }) {
  const steps = [
    { n: "01", label: "Tiếp nhận", state: "done" },
    { n: "02", label: "Kiểm tra điều kiện", state: "active" },
    { n: "03", label: "Phân loại đơn", state: "pending" },
    { n: "04", label: "Xử lý", state: "pending" },
    { n: "05", label: "Kết quả", state: "pending" },
  ];
  return (
    <div className="rounded-xl border overflow-hidden slide-in" style={{ borderColor: "#BBF7D0" }}>
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#15803D" }}>QUY TRÌNH ĐANG THỰC HIỆN</span>
        <span className="text-xs ml-auto" style={{ color: "#15803D" }}>QT-03 · Khiếu nại</span>
      </div>
      <div className="p-4 bg-white">
        <div className="space-y-2 mb-4">
          {steps.map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: s.state === "done" ? "#D1FAE5" : s.state === "active" ? "#C62828" : "#F1F5F9",
                  color: s.state === "done" ? "#15803D" : s.state === "active" ? "#fff" : "#94A3B8",
                }}>
                {s.state === "done" ? "✓" : s.n}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: s.state === "pending" ? "#94A3B8" : "#1A202C" }}>{s.label}</div>
                <div className="text-xs" style={{ color: s.state === "done" ? "#15803D" : s.state === "active" ? "#C62828" : "#CBD5E1" }}>
                  {s.state === "done" ? "Hoàn thành" : s.state === "active" ? "● Đang thực hiện" : "Chưa thực hiện"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onNav("don-tiep-nhan")} className="w-full py-2 rounded text-sm font-bold text-white" style={{ background: "#C62828" }}>
          Xem đơn tiếp nhận ↗
        </button>
      </div>
    </div>
  );
}
export default QuyTrinhProgressCard;