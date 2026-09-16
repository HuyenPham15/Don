import React, { useEffect, useState } from 'react';
import KanbanCard from "../components/KanbanCard";
function CongViecCuaToi({ onSelect, onNav, extraCard }: {
  onSelect: (ln: LuotNhan) => void; onNav: (s: Screen) => void; extraCard: LuotNhan | null;
}) {
  const [liveJob, setLiveJob] = useState<AIJob>(LN19.aiJob);

  useEffect(() => {
    if (liveJob >= 5) return;
    const t = setInterval(() => setLiveJob((p) => Math.min(5, p + 1) as AIJob), 3500);
    return () => clearInterval(t);
  }, [liveJob]);

  const col1 = [{ ...LN19, aiJob: liveJob }, ...(extraCard ? [extraCard] : []), ALL_LUOT_NHAN[3]];
  const col2 = [ALL_LUOT_NHAN[1]];
  const col3: LuotNhan[] = [];
  const col4 = [ALL_LUOT_NHAN[2]];

  const stats = [
    { label: "Tổng công việc", v: 12, c: "#1A202C" },
    { label: "Cần xử lý", v: 5, c: "#C62828" },
    { label: "Đang chờ", v: 4, c: "#B45309" },
    { label: "Quá hạn", v: 1, c: "#DC2626" },
    { label: "AI đang xử lý", v: 3, c: "#1E40AF" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-semibold">Công việc của tôi</h1>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Hôm nay — Thứ Tư, 16/09/2026</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</span>
              <span className="text-xs" style={{ color: "#94A3B8" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-5">
        <div className="flex gap-4 h-full" style={{ minWidth: "max-content" }}>
          {[
            { title: "HÀNG ĐỢI TIẾP NHẬN", color: "#1E40AF", bg: "#EFF6FF", cards: col1 },
            { title: "CẦN THẨM ĐỊNH & XỬ LÝ", color: "#6D28D9", bg: "#F5F3FF", cards: col2 },
            // { title: "CHỜ PHỐI HỢP LIÊN NGÀNH", color: "#B45309", bg: "#FFFBEB", cards: col3 },
            { title: "CHỜ KÝ & TRẢ KẾT QUẢ", color: "#15803D", bg: "#F0FDF4", cards: col4 },
          ].map((col) => (
            <div key={col.title} style={{ width: 272, minWidth: 272 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>{col.title}</span>
                </div>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: col.bg, color: col.color }}>{col.cards.length}</span>
              </div>
              <div className="space-y-3">
                {col.cards.map((c) => <KanbanCard key={c.id} card={c} onOpen={() => { onSelect(c); onNav("ban-phan-tich"); }} />)}
                {col.cards.length === 0 && (
                  <div className="h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-xs" style={{ borderColor: "#E2E8F0", color: "#94A3B8" }}>Không có</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default CongViecCuaToi;