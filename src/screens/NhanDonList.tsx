import React, { useState } from 'react';
function NhanDonList({ onNav, onSelect }: { onNav: (s: Screen) => void; onSelect: (ln: LuotNhan) => void }) {
  const [q, setQ] = useState("");
  const filtered = ALL_LUOT_NHAN.filter((l) => !q || l.id.toLowerCase().includes(q.toLowerCase()) || l.nguoiNop.toLowerCase().includes(q.toLowerCase()));

  const badge = (job: AIJob) => {
    if (job === 0) return { label: "Mới nhận", bg: "#EFF6FF", c: "#1D4ED8" };
    if (job < 5) return { label: "AI đang phân tích", bg: "#FFFBEB", c: "#B45309" };
    return { label: "AI đã phân tích xong", bg: "#F0FDF4", c: "#15803D" };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
        <div>
          <h1 className="text-base font-semibold">Tiếp nhận lượt nhận</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Quản lý các lượt tiếp nhận đơn thư</p>
        </div>
        <button onClick={() => onNav("nhan-don-them")} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white transition-colors" style={{ background: "#C62828" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#B71C1C"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#C62828"; }}>
          + Thêm lượt nhận
        </button>
      </div>
      <div className="bg-white border-b px-6 py-3 flex items-center gap-3" style={{ borderColor: "#E2E8F0" }}>
        <div className="relative" style={{ flex: "0 0 320px" }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }}><IcoSearch /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded border text-sm" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }} placeholder="Tìm theo mã, người nộp đơn…" />
        </div>
        {["Thời gian", "Hình thức", "Trạng thái", "Đơn vị"].map((f) => (
          <select key={f} className="px-3 py-2 rounded border text-sm" style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#64748B" }}><option>{f}</option></select>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-5">
        <div className="bg-white rounded-lg border" style={{ borderColor: "#E2E8F0" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {["Mã lượt nhận", "Ngày nhận", "Người nộp đơn", "Hình thức", "Nội dung chính", "Đơn vị tiếp nhận", "Trạng thái AI", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ln, i) => {
                const b = badge(ln.aiJob);
                return (
                  <tr key={ln.id} className="transition-colors cursor-pointer" style={{ borderBottom: i < filtered.length - 1 ? "1px solid #E2E8F0" : "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    onClick={() => { onSelect(ln); onNav("ban-phan-tich"); }}>
                    <td className="px-4 py-3"><span className="mono text-xs font-semibold" style={{ color: "#C62828" }}>{ln.id}</span></td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#64748B" }}>{ln.ngayNhan}</td>
                    <td className="px-4 py-3 text-sm font-medium">{ln.nguoiNop}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#64748B" }}>{ln.hinhThuc}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: "#64748B" }}>{ln.noiDung}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#64748B" }}>{ln.donVi}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: b.bg, color: b.c }}>
                        {ln.aiJob > 0 && ln.aiJob < 5 && <span className="w-1.5 h-1.5 rounded-full ai-pulse" style={{ background: "#F59E0B" }} />}
                        {b.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs px-3 py-1.5 rounded border font-medium" style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                        onClick={(e) => { e.stopPropagation(); onSelect(ln); onNav("ban-phan-tich"); }}>Xem chi tiết</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default NhanDonList;