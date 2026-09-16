import React, { useEffect } from "react";
import { Screen, WorkflowConfig } from "../types";

function DaXacNhanSection({ onNav, workflow, loaiDonName }: {
  onNav: (s: Screen) => void;
  workflow: WorkflowConfig;
  loaiDonName: string;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNav("don-tiep-nhan");
    }, 2000);
    return () => clearTimeout(timer);
  }, [onNav]);

  return (
    <div className="slide-in flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "#DCFCE7", color: "#16A34A" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: "#16A34A" }}>Tiếp nhận đơn thành công</h2>
      <p className="text-sm mb-2" style={{ color: "#475569" }}>
        Đơn đã được đưa vào luồng <strong style={{ color: "#0F172A" }}>{workflow.name}</strong>
      </p>
      <div className="bg-slate-50 border rounded-lg px-4 py-3 mb-8 w-full max-w-sm mx-auto" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: "#64748B" }}>Loại đơn:</span>
          <span className="font-semibold" style={{ color: "#0F172A" }}>{loaiDonName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "#64748B" }}>Quy trình:</span>
          <span className="font-semibold" style={{ color: "#0F172A" }}>{workflow.version}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => onNav("nhan-don-list")} className="px-5 py-2.5 rounded-lg border text-sm font-semibold hover:bg-slate-50 transition-colors" style={{ borderColor: "#E2E8F0", color: "#475569" }}>
          Về danh sách
        </button>
        <button onClick={() => onNav("don-tiep-nhan")} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-2" style={{ background: "#C62828" }}>
          Mở đơn
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
      <p className="text-xs mt-6" style={{ color: "#94A3B8" }}>Tự động chuyển đến Chi tiết đơn sau 2 giây...</p>
    </div>
  );
}
export default DaXacNhanSection;