import React from "react";
import { WorkflowConfig } from "../types";

function WorkflowDrawer({ workflow, loaiDonName, onClose }: {
  workflow: WorkflowConfig;
  loaiDonName: string;
  onClose: () => void;
}) {
  const firstStep = workflow.steps[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
          <div>
            <div className="text-sm font-bold" style={{ color: "#0F172A" }}>Tiến trình quy trình</div>
            <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{workflow.name}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors" style={{ color: "#94A3B8" }}>✕</button>
        </div>

        {/* Workflow info */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "#F1F5F9", background: "#F8FAFC" }}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs mb-0.5" style={{ color: "#94A3B8" }}>Loại đơn</div>
              <div className="font-semibold" style={{ color: "#0F172A" }}>{loaiDonName}</div>
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: "#94A3B8" }}>Phiên bản</div>
              <div className="font-semibold" style={{ color: "#0F172A" }}>{workflow.version}</div>
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: "#94A3B8" }}>Trạng thái</div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#15803D" }}>Đang xử lý</span>
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: "#94A3B8" }}>Nhóm hiện tại</div>
              <div className="font-semibold" style={{ color: "#0F172A" }}>{firstStep.responsible}</div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="relative">
            {workflow.steps.map((step, i) => {
              const status = i === 0 ? "active" : "pending";
              const isLast = i === workflow.steps.length - 1;

              return (
                <div key={step.id} className="flex gap-4 relative">
                  {/* Vertical line */}
                  {!isLast && (
                    <div className="absolute left-[15px] top-[32px] w-0.5 bottom-0" style={{ background: status === "active" ? "#BFDBFE" : "#E5E7EB" }} />
                  )}

                  {/* Step circle */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                      style={{
                        background: status === "active" ? "#1D4ED8" : "#fff",
                        borderColor: status === "active" ? "#1D4ED8" : "#E5E7EB",
                        color: status === "active" ? "#fff" : "#94A3B8",
                      }}>
                      {i + 1}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-6"}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: status === "active" ? "#1D4ED8" : "#64748B" }}>
                        {step.name}
                      </span>
                      {status === "active" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
                          ● Đang thực hiện
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                      {step.responsible}
                    </div>
                    {status === "active" && (
                      <div className="mt-2 text-xs" style={{ color: "#64748B" }}>
                        Bước hiện tại đang được xử lý bởi {step.responsible}
                      </div>
                    )}
                    {status === "pending" && (
                      <div className="text-xs mt-0.5" style={{ color: "#CBD5E1" }}>Chưa thực hiện</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default WorkflowDrawer;
