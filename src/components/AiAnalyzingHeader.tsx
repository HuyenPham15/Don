import React from 'react';
function AiAnalyzingHeader({
  job,
  onSelectStep,
  onRerun,
}: {
  job: AIJob;
  onSelectStep?: (s: AIJob) => void;
  onRerun?: () => void;
}) {
  const done = job >= 3;
  const steps = [
    { label: "Trích xuất thông tin", at: 1 },
    { label: "Tra cứu, đối chiếu đơn & Đề xuất", at: 2 },
    { label: "Xác định hướng xử lý", at: 3 },
  ];
  const stateOf = (at: number): "done" | "running" | "todo" => (done || job > at ? "done" : job === at ? "running" : "todo");

  return (
    <div className="px-6 py-5 bg-white border-b" style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {done ? (
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F0FDF4" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#15803D" strokeWidth="2"><path d="M4 10.5l4 4 8-9" /></svg>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
              <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "#BFDBFE", borderTopColor: "#1D4ED8" }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold" style={{ color: "#0F172A" }}>AI hỗ trợ phân tích hồ sơ</h2>
              {done ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#15803D" }}>✓ Phân tích hoàn tất (3/3 bước)</span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full ai-pulse" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                  Đang phân tích Bước {job}/3: {steps[job - 1]?.label}
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
              {done
                ? "AI đã hoàn tất đối chiếu và đề xuất. Cán bộ vui lòng xác nhận hướng xử lý hồ sơ."
                : `Hệ thống phân tích tuần tự và trả kết luận có đơn liên quan hay không (Đã xong ${job}/3 bước).`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRerun}
            className="text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors hover:bg-slate-50"
            style={{ borderColor: "#E2E8F0", color: "#475569", background: "#fff" }}
            title="Chạy lại mô phỏng phân tích từng bước">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8a6 6 0 1 1 1.8 4.2M2 12V8h4" /></svg>
            <span>Chạy lại</span>
          </button>
          {!done && (
            <button
              onClick={() => onSelectStep?.(3 as AIJob)}
              className="text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors hover:bg-blue-50"
              style={{ borderColor: "#BFDBFE", color: "#1D4ED8", background: "#EFF6FF" }}
              title="Bỏ qua chờ đợi và hiển thị tất cả các bước">
              <span>Xem tất cả →</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex">
        {steps.map((s, i) => {
          const st = stateOf(s.at);
          const prevDone = i > 0 && stateOf(steps[i - 1].at) === "done";
          const first = i === 0;
          const last = i === steps.length - 1;
          return (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center min-w-0 cursor-pointer group"
              onClick={() => onSelectStep?.(s.at as AIJob)}
              title={`Bấm để chuyển nhanh đến Bước ${s.at}: ${s.label}`}>
              {/* Node + connectors */}
              <div className="flex items-center w-full">
                <div className="flex-1 h-0.5 rounded-full" style={{ background: first ? "transparent" : prevDone ? "#1D4ED8" : "#E2E8F0" }} />
                {st === "done" ? (
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: "#1D4ED8" }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M4 10.5l4 4 8-9" /></svg>
                  </span>
                ) : st === "running" ? (
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white transition-transform group-hover:scale-110" style={{ background: "#1D4ED8", boxShadow: "0 0 0 4px #DBEAFE" }}>{s.at}</span>
                ) : (
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold border-2 bg-white transition-transform group-hover:scale-110" style={{ borderColor: "#E2E8F0", color: "#94A3B8" }}>{s.at}</span>
                )}
                <div className="flex-1 h-0.5 rounded-full" style={{ background: last ? "transparent" : st === "done" ? "#1D4ED8" : "#E2E8F0" }} />
              </div>
              {/* Label */}
              <span className="mt-2 px-1 text-xs text-center leading-tight transition-colors group-hover:text-blue-600" style={{ color: st === "todo" ? "#94A3B8" : st === "running" ? "#1D4ED8" : "#374151", fontWeight: st === "running" ? 600 : 400 }}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default AiAnalyzingHeader;