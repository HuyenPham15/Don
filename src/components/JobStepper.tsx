import React from 'react';
import { JOB_LABELS } from "../constants";
import { AIJob } from "../types";
function JobStepper({ currentJob }: { currentJob: AIJob }) {
  return (
    <div className="flex items-center gap-0">
      {[1, 2, 3, 4, 5].map((j, i) => {
        const done = currentJob > j;
        const active = currentJob === j;
        const pending = currentJob < j;
        return (
          <div key={j} className="flex items-center">
            <div className="flex flex-col items-center" style={{ minWidth: 100 }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: done ? "#15803D" : active ? "#1E40AF" : "#E2E8F0",
                    color: done || active ? "#fff" : "#94A3B8",
                  }}>
                  {done ? "✓" : j}
                </div>
              </div>
              <div className="text-center" style={{ maxWidth: 90 }}>
                <div className="text-xs font-semibold leading-tight"
                  style={{ color: done ? "#15803D" : active ? "#1E40AF" : "#94A3B8", fontSize: 10 }}>
                  {JOB_LABELS[j].toUpperCase()}
                </div>
                {active && <div className="text-xs ai-pulse mt-0.5" style={{ color: "#B45309", fontSize: 9 }}>Đang xử lý…</div>}
              </div>
            </div>
            {i < 4 && <div className="flex-1 h-px mx-1" style={{ background: currentJob > j ? "#15803D" : "#E2E8F0", minWidth: 12 }} />}
          </div>
        );
      })}
    </div>
  );
}
export default JobStepper;