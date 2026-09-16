import React from 'react';
import SectionTitle from "./SectionTitle";
function DeXuatSection({ onOpen }: { onOpen: (d: DrawerState) => void }) {
  const conditions = [
    { label: "Có người gửi", ok: true },
    { label: "Có nội dung khiếu nại", ok: true },
    { label: "Có yêu cầu cụ thể", ok: true },
    { label: "Xác định được đối tượng liên quan", ok: true },
    { label: "Chưa có quyết định/hành vi bị khiếu nại", ok: false },
  ];
  const met = conditions.filter((c) => c.ok).length;

  return (
    <div>
      <SectionTitle num={4}>AI đề xuất hướng xử lý</SectionTitle>

      {/* Loại đơn + Quy trình */}
      <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#F1F5F9" }}>
          <span className="text-xs" style={{ color: "#94A3B8" }}>Loại đơn</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Khiếu nại</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#DBEAFE", color: "#1E40AF" }}>82%</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#F1F5F9" }}>
          <span className="text-xs" style={{ color: "#94A3B8" }}>Quy trình áp dụng</span>
          <span className="font-semibold text-sm text-right" style={{ maxWidth: 200 }}>Quy trình xử lý đơn Khiếu nại · QT-03</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs" style={{ color: "#94A3B8" }}>Bước hiện tại</span>
          <span className="font-semibold text-sm" style={{ color: "#6D28D9" }}>01 · Kiểm tra điều kiện tiếp nhận</span>
        </div>
      </div>

      {/* Đối chiếu điều kiện */}
      <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "#E2E8F0" }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#F1F5F9", background: "#FAFAFA" }}>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748B" }}>Đối chiếu điều kiện</span>
          <span className="text-xs font-bold" style={{ color: met < conditions.length ? "#B45309" : "#15803D" }}>{met}/{conditions.length} đạt</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {conditions.map((c) => (
            <div key={c.label} className="flex items-center gap-2.5 text-sm">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: c.ok ? "#D1FAE5" : "#FEE2E2", color: c.ok ? "#15803D" : "#C62828" }}>
                {c.ok ? "✓" : "⚠"}
              </span>
              <span style={{ color: c.ok ? "#374151" : "#C62828", fontWeight: c.ok ? 400 : 600 }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Đề xuất */}
      <div className="rounded-xl border px-4 py-4 mb-4" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
        <div className="text-xs uppercase tracking-wide mb-2 font-bold" style={{ color: "#B45309" }}>Đề xuất</div>
        <div className="text-sm font-semibold mb-3" style={{ color: "#92400E" }}>
          Bổ sung thông tin về quyết định/hành vi bị khiếu nại trước khi chuyển sang bước tiếp theo.
        </div>
        <div className="border-t pt-3" style={{ borderColor: "#FDE68A" }}>
          <div className="text-xs uppercase tracking-wide mb-2 font-bold" style={{ color: "#94A3B8" }}>Cơ sở đề xuất</div>
          <div className="space-y-1.5 text-xs mb-3">
            {[
              { k: "AI phân tích", v: "Loại đơn xác định là Khiếu nại · 82%" },
              { k: "Quy trình", v: "QT-03 · Quy trình xử lý đơn Khiếu nại" },
              { k: "Rule", v: "Kiểm tra đầy đủ thông tin trước khi chuyển bước" },
              { k: "Dữ liệu", v: "01 đơn + 02 tài liệu + dữ liệu hệ thống" },
            ].map((r) => (
              <div key={r.k} className="flex gap-2">
                <span className="flex-shrink-0" style={{ color: "#94A3B8", minWidth: 70 }}>{r.k}:</span>
                <span style={{ color: "#475569" }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => onOpen({ type: "xem-nguon", field: "su-viec" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FDE68A", color: "#B45309" }}>Xem AI</button>
            <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FDE68A", color: "#6D28D9" }}>Xem quy trình</button>
            <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FDE68A", color: "#6D28D9" }}>Xem Rule</button>
            <button onClick={() => onOpen({ type: "xem-nguon", field: "su-viec" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FDE68A", color: "#64748B" }}>Xem nguồn</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DeXuatSection;