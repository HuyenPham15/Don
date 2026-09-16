import React from 'react';
import SectionTitle from "./SectionTitle";
function DaXacNhanSection({ onNav }: { onNav: (s: Screen) => void }) {
  const steps = [
    { n: "01", label: "Tiếp nhận", state: "done" as const },
    { n: "02", label: "Kiểm tra điều kiện", state: "active" as const },
    { n: "03", label: "Phân loại đơn", state: "pending" as const },
    { n: "04", label: "Xử lý", state: "pending" as const },
    { n: "05", label: "Kết quả", state: "pending" as const },
  ];

  const aiFindings = [
    { ok: true, label: "Đã đọc 02 tài liệu" },
    { ok: true, label: "Đã đối chiếu thông tin người gửi" },
    { ok: true, label: "Đã kiểm tra hồ sơ liên quan" },
    { ok: false, label: "Phát hiện thiếu quyết định/hành vi bị khiếu nại" },
  ];

  return (
    <div className="slide-in">
      {/* Confirmed banner */}
      <div className="rounded-xl border px-4 py-3 mb-6 flex items-center gap-3" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
        <span className="text-base" style={{ color: "#15803D" }}>✓</span>
        <div>
          <div className="text-sm font-bold" style={{ color: "#15803D" }}>Đã xác nhận hướng xử lý</div>
          <div className="text-xs" style={{ color: "#374151" }}>QT-03 · Quy trình xử lý đơn Khiếu nại</div>
        </div>
      </div>

      {/* Quy trình + AI support inline */}
      <SectionTitle badge={<span className="text-xs" style={{ color: "#64748B" }}>QT-03 · Khiếu nại</span>}>
        QUY TRÌNH ĐANG THỰC HIỆN
      </SectionTitle>

      <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: "#E2E8F0" }}>
        {steps.map((s, i) => (
          <div key={s.n}>
            {/* Step row */}
            <div className="flex items-center gap-3 px-4 py-3"
              style={{
                background: s.state === "active" ? "#FAFAFA" : "#fff",
                borderBottom: s.state === "active" ? "none" : i < steps.length - 1 ? "1px solid #F8FAFC" : "none",
              }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: s.state === "done" ? "#D1FAE5" : s.state === "active" ? "#C62828" : "#F1F5F9",
                  color: s.state === "done" ? "#15803D" : s.state === "active" ? "#fff" : "#CBD5E1",
                }}>
                {s.state === "done" ? "✓" : s.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: s.state === "pending" ? "#94A3B8" : "#1A202C" }}>
                    {s.label}
                  </span>
                  {s.state === "active" && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: "#FEF3C7", color: "#B45309" }}>
                      ✦ AI hỗ trợ
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: s.state === "done" ? "#15803D" : s.state === "active" ? "#B45309" : "#CBD5E1" }}>
                  {s.state === "done" ? "Hoàn thành" : s.state === "active" ? "Đang thực hiện" : "Chưa thực hiện"}
                </div>
              </div>
            </div>

            {/* AI support panel — inline under active step */}
            {s.state === "active" && (
              <div className="mx-4 mb-3 rounded-lg border overflow-hidden" style={{ borderColor: "#FDE68A" }}>
                <div className="px-3 py-2 flex items-center gap-2 border-b" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                  <span className="text-xs font-bold" style={{ color: "#B45309" }}>✦ AI ĐANG HỖ TRỢ</span>
                  <span className="text-xs ai-pulse ml-auto" style={{ color: "#B45309" }}>Đang kiểm tra…</span>
                </div>
                <div className="px-3 py-3 bg-white space-y-1.5">
                  {aiFindings.map((f) => (
                    <div key={f.label} className="flex items-start gap-2 text-xs">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: f.ok ? "#15803D" : "#C62828" }}>
                        {f.ok ? "✓" : "⚠"}
                      </span>
                      <span style={{ color: f.ok ? "#374151" : "#C62828", fontWeight: f.ok ? 400 : 600 }}>{f.label}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t" style={{ borderColor: "#F1F5F9" }}>
                    <button className="text-xs px-3 py-1.5 rounded font-medium w-full text-center"
                      style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#B45309" }}>
                      Xem kết quả AI →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Công việc cần thực hiện */}
      <SectionTitle>CÔNG VIỆC CẦN THỰC HIỆN</SectionTitle>
      <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "#E2E8F0" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "#F1F5F9", background: "#FAFAFA" }}>
          <div className="text-sm font-bold">Kiểm tra điều kiện tiếp nhận</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs" style={{ color: "#64748B" }}>Hạn: 18/09/2026</span>
            <span className="text-xs font-semibold" style={{ color: "#B45309" }}>Cần xác nhận</span>
          </div>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#64748B", background: "#fff" }}>
          ⚠ Bổ sung quyết định/hành vi bị khiếu nại trước khi chuyển bước.
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 rounded font-bold text-sm text-white" style={{ background: "#C62828" }}>
          XỬ LÝ CÔNG VIỆC →
        </button>
      </div>
    </div>
  );
}
export default DaXacNhanSection;