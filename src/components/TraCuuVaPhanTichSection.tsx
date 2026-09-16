import React, { useState } from 'react';
import PanelSection from "./PanelSection";
import { DrawerState } from "../types";
import { SparkleIcon } from "./icons";
function TraCuuVaPhanTichSection({
  onOpen,
  checked,
  onToggle,
  onApplyHuong,
}: {
  onOpen: (d: DrawerState) => void;
  checked: boolean;
  onToggle: (v: boolean) => void;
  onApplyHuong: (huong: string) => void;
}) {
  const [hasRelated, setHasRelated] = useState(true);

  const searchResults = hasRelated ? [
    {
      id: "D-2026-00341",
      type: "don" as const,
      drawerType: "don",
      status: "Đang thụ lý giải quyết",
      date: "15/06/2026",
      similarity: 89,
      matchPoints: ["Cùng người gửi", "Cùng CCCD 079075012345", "Cùng dự án Khu dân cư X", "Cùng đối tượng bị KN"],
    },
    {
      id: "VV-2025-0187",
      type: "vu-viec" as const,
      drawerType: "vu-viec",
      status: "Đã giải quyết",
      date: "03/11/2025",
      similarity: 61,
      matchPoints: ["Cùng dự án Khu dân cư X", "Cùng đối tượng TNHH ABC", "Nội dung bồi thường GPMB"],
    },
  ] : [];

  const ruleBases = [
    "Cùng người gửi: Ông A (Nguyễn Văn A)",
    "Cùng đối tượng liên quan: Công ty TNHH Xây dựng ABC",
    "Cùng địa bàn / dự án: Dự án Khu dân cư X",
    "Mức tương đồng nội dung văn bản: 89%",
  ];

  return (
    <PanelSection
      index={2}
      title="Tra cứu hệ thống, Phân tích đơn liên quan & Đề xuất xử lý"
      right={
        <div className="flex items-center gap-1 text-xs bg-slate-100 p-0.5 rounded-lg">
          <span className="text-slate-500 text-[11px] px-1.5 font-medium">Giả lập AI:</span>
          <button
            onClick={() => setHasRelated(true)}
            className={`px-2 py-0.5 rounded font-medium transition-all ${hasRelated ? "bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}>
            Có đơn liên quan (89%)
          </button>
          <button
            onClick={() => setHasRelated(false)}
            className={`px-2 py-0.5 rounded font-medium transition-all ${!hasRelated ? "bg-green-100 text-green-900 font-bold border border-green-300 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}>
            Không có đơn liên quan
          </button>
        </div>
      }>

      {/* 2. KẾT QUẢ TRA CỨU AI */}
      <div className="rounded-xl border overflow-hidden bg-white mb-0" style={{ borderColor: "#E5E7EB" }}>
        {hasRelated && (
          <div className="mx-4 mt-3 mb-2 px-3 py-2.5 rounded-lg border flex items-start gap-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
            <div className="mt-0.5 text-red-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">Cảnh báo: Đơn có dấu hiệu trùng lắp / liên quan vụ việc cũ</p>
              <p className="text-xs text-red-700 mt-0.5">Vui lòng kiểm tra kỹ các thông tin đối chiếu bên dưới để đưa ra quyết định xử lý phù hợp.</p>
            </div>
          </div>
        )}

        <div className="px-4 py-2.5 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2">
            <SparkleIcon color="#1D4ED8" size={13} />
            <span className="text-xs font-semibold text-slate-700">Kết quả tra cứu AI</span>
          </div>
          {hasRelated ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Phát hiện {searchResults.length} kết quả tương đồng
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              Không có kết quả trùng
            </span>
          )}
        </div>

        {hasRelated ? (
          <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
            {searchResults.map((r) => (
              <div key={r.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Type badge */}
                    <span
                      className="mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wide"
                      style={{
                        background: r.type === "don" ? "#EFF6FF" : "#F5F3FF",
                        color: r.type === "don" ? "#1D4ED8" : "#7C3AED",
                        border: `1px solid ${r.type === "don" ? "#BFDBFE" : "#DDD6FE"}`,
                      }}
                    >
                      {r.type === "don" ? "Đơn" : "Vụ việc"}
                    </span>

                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="mono text-sm font-bold text-slate-800">{r.id}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "#FEF3C7", color: "#92400E" }}>
                          {r.status}
                        </span>
                        <span className="text-xs text-slate-400">{r.date}</span>
                      </div>

                      {/* Similarity bar */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500 flex-shrink-0">Tương đồng:</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${r.similarity}%`,
                              background: r.similarity >= 80 ? "#DC2626" : r.similarity >= 60 ? "#D97706" : "#2563EB",
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold flex-shrink-0 mono"
                          style={{ color: r.similarity >= 80 ? "#DC2626" : r.similarity >= 60 ? "#D97706" : "#2563EB" }}
                        >
                          {r.similarity}%
                        </span>
                      </div>

                      {/* Match points */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {r.matchPoints.map((pt) => (
                          <span key={pt} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                            <span className="text-green-600">✓</span> {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Xem nguồn button */}
                  <button
                    onClick={() => onOpen(r.drawerType === "don" ? { type: "don-lien-quan" } : { type: "vu-viec" })}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-blue-50"
                    style={{ borderColor: "#BFDBFE", color: "#1D4ED8" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                    </svg>
                    Xem nguồn
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-7 text-center text-slate-400 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            <div className="font-medium text-slate-500">Không tìm thấy đơn hoặc vụ việc liên quan</div>
            <div className="text-xs mt-1">AI đã tra cứu toàn bộ hệ thống theo người gửi, CCCD, nội dung và dự án</div>
          </div>
        )}
      </div>


    </PanelSection>
  );
}
export default TraCuuVaPhanTichSection;