import React from 'react';
function XacNhanCard({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#C62828" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "#C62828", background: "#FFF5F5" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#C62828" }}>XÁC NHẬN CỦA CÁN BỘ</span>
      </div>
      <div className="p-4 bg-white">
        <div className="rounded-lg border p-3 mb-4 space-y-2" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
          {[
            { label: "Hướng xử lý", value: "Khiếu nại" },
            { label: "Quy trình", value: "Quy trình xử lý đơn Khiếu nại" },
            { label: "Bước tiếp theo", value: "Kiểm tra điều kiện tiếp nhận" },
          ].map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-2 text-xs">
              <span style={{ color: "#94A3B8" }}>{r.label}</span>
              <span className="font-semibold text-right" style={{ color: "#1A202C" }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Chỉnh sửa</button>
          <button className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Không đồng ý</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded font-bold text-sm text-white text-center" style={{ background: "#C62828" }}>
            XÁC NHẬN & CHUYỂN QUY TRÌNH →
          </button>
        </div>
      </div>
    </div>
  );
}
export default XacNhanCard;