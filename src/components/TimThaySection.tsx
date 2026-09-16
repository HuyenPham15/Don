import React from 'react';
import SectionTitle from "./SectionTitle";
import { AIJob, DrawerState } from "../types";
function TimThaySection({ job, onOpen }: { job: AIJob; onOpen: (d: DrawerState) => void }) {
  type Metric = { label: string; count: string; sub: string; drawer: DrawerState; warn?: boolean; loading: boolean };
  const metrics: Metric[] = [
    { label: "Lượt gửi trước", count: "02", sub: "Người gửi đã biết", drawer: { type: "nguoi-gui" }, loading: job < 2 },
    { label: "Đơn liên quan", count: "03", sub: "Cùng sự việc", drawer: { type: "don-lien-quan" }, loading: job < 3 },
    { label: "Vụ việc liên quan", count: "01", sub: "Đang xử lý", drawer: { type: "vu-viec" }, loading: job < 3 },
    { label: "Nội dung tương đồng", count: "84%", sub: "với LN-08/2026", drawer: { type: "so-sanh" }, warn: true, loading: job < 3 },
    { label: "Khả năng trùng đơn", count: "84%", sub: "LN-08/2026", drawer: { type: "trung-don" }, warn: true, loading: job < 3 },
  ];

  return (
    <div>
      <SectionTitle num={2} badge={
        job >= 3
          ? <span className="text-xs font-semibold" style={{ color: "#15803D" }}>✓ Hoàn thành</span>
          : <span className="text-xs ai-pulse" style={{ color: "#B45309" }}>Đang tra cứu…</span>
      }>Kết quả tra cứu trong hệ thống</SectionTitle>

      <div className="grid grid-cols-3 gap-2 mb-2">
        {metrics.slice(0, 3).map((m) => (
          <button key={m.label} onClick={() => !m.loading && onOpen(m.drawer)}
            disabled={m.loading}
            className="rounded-xl border p-3 text-left transition-all"
            style={{ borderColor: "#E2E8F0", background: "#fff" }}
            onMouseEnter={(e) => { if (!m.loading) { (e.currentTarget as HTMLElement).style.borderColor = "#C62828"; (e.currentTarget as HTMLElement).style.background = "#FFF5F5"; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
            {m.loading
              ? <div className="text-xl font-bold ai-pulse" style={{ color: "#CBD5E1" }}>–</div>
              : <div className="text-xl font-bold" style={{ color: "#1A202C" }}>{m.count}</div>}
            <div className="text-xs font-semibold mt-0.5" style={{ color: "#64748B" }}>{m.label}</div>
            <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{m.sub}</div>
            {!m.loading && <div className="text-xs mt-1.5 font-semibold" style={{ color: "#C62828" }}>Xem chi tiết →</div>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.slice(3).map((m) => (
          <button key={m.label} onClick={() => !m.loading && onOpen(m.drawer)}
            disabled={m.loading}
            className="rounded-xl border p-3 text-left transition-all"
            style={{ borderColor: m.warn && !m.loading ? "#FECACA" : "#E2E8F0", background: m.warn && !m.loading ? "#FFF5F5" : "#fff" }}
            onMouseEnter={(e) => { if (!m.loading) { (e.currentTarget as HTMLElement).style.borderColor = "#C62828"; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = m.warn ? "#FECACA" : "#E2E8F0"; }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              {m.warn && !m.loading && <span style={{ color: "#C62828" }}>⚠</span>}
              {m.loading
                ? <div className="text-xl font-bold ai-pulse" style={{ color: "#CBD5E1" }}>–</div>
                : <div className="text-xl font-bold" style={{ color: m.warn ? "#C62828" : "#1A202C" }}>{m.count}</div>}
            </div>
            <div className="text-xs font-semibold" style={{ color: m.warn && !m.loading ? "#C62828" : "#64748B" }}>{m.label}</div>
            <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{m.sub}</div>
            {!m.loading && <div className="text-xs mt-1.5 font-semibold" style={{ color: "#C62828" }}>Xem chi tiết →</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
export default TimThaySection;