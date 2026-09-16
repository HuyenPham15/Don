import React from 'react';
import { WorkflowConfig } from "../../types";

export default function TabTienTrinh({ workflow }: { workflow: WorkflowConfig | null }) {
  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Không có thông tin tiến trình
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-8 max-w-3xl mx-auto" style={{ borderColor: "#E2E8F0" }}>
      <h2 className="text-lg font-bold text-slate-800 mb-6">Tiến trình xử lý</h2>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {workflow.steps.map((step, idx) => {
          const isActive = idx === 0;
          const isDone = false;
          
          return (
            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isActive ? '!bg-red-600 !text-white' : ''}`}>
                {idx + 1}
              </div>
              
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm" style={{ borderColor: isActive ? "#FCA5A5" : "#E2E8F0" }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold ${isActive ? 'text-red-700' : 'text-slate-800'}`}>{step.name}</h3>
                  {isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Hiện tại</span>}
                </div>
                <p className="text-sm text-slate-500">{step.responsible}</p>
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <p><strong>Hạn xử lý:</strong> 18/09/2026</p>
                    <p><strong>Trạng thái:</strong> Đang chờ cán bộ bổ sung thông tin</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
