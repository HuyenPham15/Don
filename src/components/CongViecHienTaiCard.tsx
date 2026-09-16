import React from 'react';
function CongViecHienTaiCard() {
  return (
    <div className="rounded-xl border overflow-hidden slide-in" style={{ borderColor: "#E2E8F0" }}>
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748B" }}>CÔNG VIỆC HIỆN TẠI</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "#FEF3C7", color: "#B45309" }}>ĐANG XỬ LÝ</span>
      </div>
      <div className="p-4 bg-white">
        <div className="text-sm font-bold mb-3">Kiểm tra điều kiện tiếp nhận</div>
        <div className="space-y-2 text-xs mb-4">
          {[
            { label: "Đơn", value: "LN-19/2026-GOVEX_HC", mono: true },
            { label: "Người thực hiện", value: "Cán bộ tiếp nhận" },
            { label: "Hạn", value: "18/09/2026" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <span style={{ color: "#94A3B8" }}>{r.label}</span>
              <span className={`font-semibold ${r.mono ? "mono" : ""}`} style={{ color: r.mono ? "#C62828" : "#1A202C" }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-3 mb-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <div className="text-xs font-semibold mb-1" style={{ color: "#92400E" }}>Cần thực hiện:</div>
          <div className="text-xs" style={{ color: "#B45309" }}>Kiểm tra quyết định/hành vi bị khiếu nại.</div>
        </div>
        <button className="w-full py-2 rounded text-sm font-bold text-white" style={{ background: "#1B2A3B" }}>
          XỬ LÝ CÔNG VIỆC →
        </button>
      </div>
    </div>
  );
}
export default CongViecHienTaiCard;