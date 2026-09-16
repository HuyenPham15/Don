import React from 'react';
import EntityAvatar from "./EntityAvatar";
import SectionTitle from "./SectionTitle";
import { AIJob } from "../types";
function HieuDonSection({ job }: { job: AIJob }) {
  const visible = job >= 1;
  if (!visible) return null;
  const loading = job === 1;

  const infoRows = [
    { label: "Người gửi", value: "Nguyễn Văn A", conf: "92%", confColor: "#15803D" },
    { label: "Đối tượng bị khiếu nại", value: "Công ty TNHH Xây dựng ABC" },
    { label: "Cơ quan liên quan", value: "UBND tỉnh XYZ" },
    { label: "Địa điểm / Dự án", value: "Dự án Khu dân cư X" },
    { label: "Sự việc", value: "Khiếu nại về mức bồi thường GPMB" },
    { label: "Yêu cầu", value: "Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND" },
    { label: "Ngày làm đơn", value: "10/09/2026" },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle num={1} badge={
        loading
          ? <span className="text-xs ai-pulse" style={{ color: "#B45309" }}>Đang đọc tài liệu…</span>
          : <span className="text-xs font-semibold" style={{ color: "#15803D" }}>✓ Hoàn thành</span>
      }>Thông tin trích xuất từ đơn (AI)</SectionTitle>

      {loading ? (
        <div className="space-y-2">
          {["Đang nhận diện nội dung…", "Đang trích xuất thông tin…"].map((t) => (
            <div key={t} className="text-sm ai-pulse" style={{ color: "#B45309" }}>● {t}</div>
          ))}
        </div>
      ) : (
        <>
          {/* 2-column layout: info rows + Loại đơn card */}
          <div className="flex gap-3">
            {/* Left: info rows */}
            <div className="flex-1 min-w-0 rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
              {infoRows.map((f, i) => (
                <div key={f.label} className="flex items-start gap-2 px-3 py-2.5"
                  style={{ borderBottom: i < infoRows.length - 1 ? "1px solid #F1F5F9" : "none", background: "#fff" }}>
                  <span className="text-xs flex-shrink-0 pt-0.5" style={{ color: "#94A3B8", minWidth: 112 }}>{f.label}</span>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                    <span className="text-xs font-medium" style={{ color: "#1A202C" }}>{f.value}</span>
                    {f.conf && (
                      <span className="text-xs font-bold flex-shrink-0 px-1 py-0.5 rounded" style={{ background: "#F0FDF4", color: f.confColor }}>{f.conf}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Loại đơn card */}
            <div className="flex-shrink-0 w-36 rounded-xl border overflow-hidden flex flex-col" style={{ borderColor: "#BFDBFE" }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}>
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#1E40AF", fontSize: 9 }}>LOẠI ĐƠN</div>
              </div>
              <div className="flex-1 p-3 bg-white flex flex-col gap-2">
                <div className="text-base font-bold" style={{ color: "#1E40AF" }}>Khiếu nại</div>
                <div className="text-xs px-1.5 py-0.5 rounded font-bold self-start" style={{ background: "#DBEAFE", color: "#1E40AF" }}>82%</div>
                <div className="text-xs mt-auto" style={{ color: "#64748B", lineHeight: 1.4 }}>Căn cứ Luật Khiếu nại 2011</div>
              </div>
            </div>
          </div>

          {/* Entity cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Người gửi */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
              <div className="px-3 py-2 border-b flex items-center gap-1.5" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748B", fontSize: 9 }}>NGƯỜI GỬI ĐƠN</span>
                <span className="ml-auto text-xs px-1 py-0.5 rounded font-bold" style={{ background: "#F0FDF4", color: "#15803D" }}>92%</span>
              </div>
              <div className="p-3 flex gap-2.5 bg-white">
                <EntityAvatar initials="NA" color="#1E40AF" />
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-bold" style={{ color: "#1A202C" }}>Nguyễn Văn A</div>
                  <div className="text-xs" style={{ color: "#64748B" }}>CCCD: 079075012345</div>
                  <div className="text-xs" style={{ color: "#64748B" }}>45 Lê Lợi, P.3, TP. XYZ</div>
                  <div className="text-xs" style={{ color: "#94A3B8" }}>SĐT: chưa xác định</div>
                </div>
              </div>
            </div>

            {/* Đối tượng bị khiếu nại */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
              <div className="px-3 py-2 border-b flex items-center gap-1.5" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748B", fontSize: 9 }}>ĐỐI TƯỢNG BỊ KHIẾU NẠI</span>
              </div>
              <div className="p-3 flex gap-2.5 bg-white">
                <EntityAvatar initials="CT" color="#6D28D9" />
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-bold" style={{ color: "#1A202C" }}>Cty TNHH Xây dựng ABC</div>
                  <div className="text-xs" style={{ color: "#64748B" }}>MST: 0123456789</div>
                  <div className="text-xs" style={{ color: "#64748B" }}>Dự án Khu dân cư X</div>
                  <div className="text-xs" style={{ color: "#94A3B8" }}>Cơ quan: UBND tỉnh XYZ</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default HieuDonSection;