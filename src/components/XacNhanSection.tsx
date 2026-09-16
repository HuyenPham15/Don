import React from 'react';
import SectionTitle from "./SectionTitle";
function XacNhanSection({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div>
      <SectionTitle num={5}>Xác nhận của cán bộ</SectionTitle>
      <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "#E2E8F0" }}>
        {[
          { label: "Hướng xử lý", value: "Khiếu nại" },
          { label: "Quy trình", value: "QT-03 · Quy trình xử lý đơn Khiếu nại" },
          { label: "Bước tiếp theo", value: "Kiểm tra điều kiện tiếp nhận" },
        ].map((r, i, arr) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: i < arr.length - 1 ? "1px solid #F8FAFC" : "none" }}>
            <span className="text-xs" style={{ color: "#94A3B8" }}>{r.label}</span>
            <span className="text-sm font-semibold text-right" style={{ maxWidth: 220 }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="text-sm px-3 py-2 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Chỉnh sửa</button>
        <button className="text-sm px-3 py-2 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Không đồng ý</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded font-bold text-sm text-white text-center" style={{ background: "#C62828" }}>
          XÁC NHẬN & CHUYỂN QUY TRÌNH →
        </button>
      </div>
    </div>
  );
}
export default XacNhanSection;