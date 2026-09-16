import React from 'react';
import { PIPELINE_STEPS } from "../constants";
import { AIJob } from "../types";
function AIPipeline({ currentJob }: { currentJob: AIJob }) {
  return (
    <div className="flex items-center gap-0">
      {PIPELINE_STEPS.map((label, i) => {
        const stepNum = i + 1;
        const jobThreshold = stepNum <= 2 ? 1 : stepNum - 1;
        const done = currentJob >= jobThreshold && (stepNum < 6 ? currentJob > jobThreshold : currentJob >= 5);
        const allDone = currentJob >= 5;
        const isDone = allDone || (stepNum < 6 && currentJob > stepNum);
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: (allDone || isDone) ? "#15803D" : "#E2E8F0",
                  color: (allDone || isDone) ? "#fff" : "#94A3B8",
                }}>
                {(allDone || isDone) ? "✓" : stepNum}
              </div>
              <span className="text-xs font-medium" style={{ color: (allDone || isDone) ? "#15803D" : "#94A3B8", whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="mx-2 h-px" style={{ width: 16, background: (allDone || isDone) ? "#15803D" : "#E2E8F0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
export default AIPipeline;