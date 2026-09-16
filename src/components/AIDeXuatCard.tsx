import React from 'react';
import { DrawerState } from "../types";
function AIDeXuatCard({ onOpen, confirmed }: { onOpen: (d: DrawerState) => void; confirmed: boolean }) {
  const conditions = [
    { label: "Có người gửi", ok: true },
    { label: "Có nội dung khiếu nại", ok: true },
    { label: "Có yêu cầu cụ thể", ok: true },
    { label: "Xác định được đối tượng liên quan", ok: true },
    { label: "Chưa có quyết định/hành vi bị khiếu nại", ok: false },
  ];
  const met = conditions.filter((c) => c.ok).length;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: confirmed ? "#BBF7D0" : "#FDE68A", background: confirmed ? "#F0FDF4" : "#FFFBEB" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: confirmed ? "#BBF7D0" : "#FDE68A" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: confirmed ? "#15803D" : "#B45309" }}>
          {confirmed ? "✓ ĐÃ XÁC NHẬN HƯỚNG XỬ LÝ" : "AI ĐỀ XUẤT HƯỚNG XỬ LÝ"}
        </span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: confirmed ? "#D1FAE5" : "#FEF3C7", color: confirmed ? "#15803D" : "#B45309" }}>
          {confirmed ? "ĐÃ XÁC NHẬN" : "AI ĐỀ XUẤT"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Loại đơn */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "#94A3B8", fontSize: 9 }}>LOẠI ĐƠN</div>
            <div className="text-base font-bold">Khiếu nại</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded text-sm font-bold" style={{ background: "#DBEAFE", color: "#1E40AF" }}>82%</div>
            <button onClick={() => onOpen({ type: "xem-nguon", field: "su-viec" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Căn cứ ↗</button>
          </div>
        </div>

        {/* Quy trình */}
        <div className="rounded-lg border p-3" style={{ borderColor: "#E9D5FF", background: "#F5F3FF" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase tracking-wide" style={{ color: "#94A3B8", fontSize: 9 }}>QUY TRÌNH</div>
            <button className="text-xs" style={{ color: "#6D28D9" }}>Xem ↗</button>
          </div>
          <div className="text-sm font-semibold mb-0.5">Quy trình xử lý đơn Khiếu nại</div>
          <div className="text-xs font-medium" style={{ color: "#6D28D9" }}>Bước hiện tại: 01 · Kiểm tra điều kiện tiếp nhận</div>
        </div>

        {/* Đối chiếu điều kiện */}
        <div className="rounded-lg border p-3" style={{ borderColor: "#E2E8F0", background: "#fff" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wide" style={{ color: "#94A3B8", fontSize: 9 }}>ĐIỀU KIỆN</div>
            <span className="text-xs font-semibold" style={{ color: met === conditions.length ? "#15803D" : "#B45309" }}>{met}/{conditions.length}</span>
          </div>
          <div className="space-y-1.5">
            {conditions.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-xs">
                <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                  style={{ background: c.ok ? "#D1FAE5" : "#FEE2E2", color: c.ok ? "#15803D" : "#C62828" }}>
                  {c.ok ? "✓" : "⚠"}
                </span>
                <span style={{ color: c.ok ? "#374151" : "#C62828", fontWeight: c.ok ? 400 : 600 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Đề xuất */}
        <div className="rounded-lg border p-3" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
          <div className="text-sm font-semibold mb-3" style={{ color: "#92400E" }}>
            Bổ sung thông tin về quyết định/hành vi bị khiếu nại trước khi chuyển sang bước tiếp theo.
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => onOpen({ type: "xem-nguon", field: "su-viec" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FDE68A", color: "#B45309" }}>Xem phân tích</button>
            <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FDE68A", color: "#6D28D9" }}>Xem quy trình</button>
            <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FDE68A", color: "#6D28D9" }}>Xem Rule</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AIDeXuatCard;