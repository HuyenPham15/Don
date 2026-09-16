import React from 'react';
import { DrawerState } from "../types";
function JobCard05({ visible, onOpen }: { visible: boolean; onOpen: (d: DrawerState) => void }) {
  if (!visible) return null;

  const processSteps = [
    { n: 1, label: "Tiếp nhận" },
    { n: 2, label: "Kiểm tra điều kiện" },
    { n: 3, label: "Phân loại" },
    { n: 4, label: "Xử lý" },
    { n: 5, label: "Xin ý kiến" },
    { n: 6, label: "Phê duyệt" },
    { n: 7, label: "Trả kết quả" },
  ];
  const currentStep = 2;

  const conditions = [
    { label: "Có thông tin người gửi", ok: true },
    { label: "Có đối tượng khiếu nại", ok: true },
    { label: "Có nội dung khiếu nại", ok: true },
    { label: "Có yêu cầu của người gửi", ok: true },
    { label: "Xác định được quyết định/hành vi bị khiếu nại", ok: false },
  ];
  const metCount = conditions.filter((c) => c.ok).length;
  const allMet = metCount === conditions.length;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
      <div className="px-4 pt-4 pb-3 border-b flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748B" }}>05 · AI GỢI Ý HƯỚNG XỬ LÝ</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#F0FDF4", color: "#15803D" }}>✓ Hoàn thành</span>
      </div>

      <div className="p-4 space-y-4">

        {/* LỚP 1 – AI PHÂN TÍCH: Xác định loại đơn */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#BFDBFE" }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ background: "#EFF6FF" }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1E40AF" }}>① AI PHÂN TÍCH</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "#DBEAFE", color: "#1E40AF" }}>AI PHÂN TÍCH</span>
            <span className="text-xs ml-auto" style={{ color: "#94A3B8" }}>Nguồn: TÀI LIỆU ĐƠN</span>
          </div>
          <div className="p-3">
            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "#94A3B8", fontSize: 9 }}>LOẠI ĐƠN XÁC ĐỊNH</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-lg font-bold">Khiếu nại</div>
              <div className="px-2 py-0.5 rounded text-sm font-bold" style={{ background: "#DBEAFE", color: "#1E40AF" }}>78%</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onOpen({ type: "xem-nguon", field: "su-viec" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#BFDBFE", color: "#1E40AF" }}>Xem nguồn ↗</button>
              <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Chỉnh sửa</button>
            </div>
          </div>
        </div>

        {/* LỚP 2 – QUY TRÌNH HỆ THỐNG */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E9D5FF" }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ background: "#F5F3FF" }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6D28D9" }}>② QUY TRÌNH ÁP DỤNG</span>
            <span className="text-xs ml-auto" style={{ color: "#94A3B8" }}>RULE NGHIỆP VỤ</span>
          </div>
          <div className="p-3">
            <div className="text-xs font-semibold mb-3" style={{ color: "#374151" }}>Quy trình xử lý đơn Khiếu nại · QT-03</div>
            {/* Flow */}
            <div className="flex items-center gap-0.5 flex-wrap mb-3">
              {processSteps.map((s, i) => {
                const done = s.n < currentStep;
                const active = s.n === currentStep;
                return (
                  <div key={s.n} className="flex items-center gap-0.5">
                    <div className="flex flex-col items-center" style={{ minWidth: 52 }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-0.5 flex-shrink-0"
                        style={{
                          background: done ? "#15803D" : active ? "#6D28D9" : "#E2E8F0",
                          color: done || active ? "#fff" : "#94A3B8",
                          border: active ? "2px solid #6D28D9" : "none",
                          boxShadow: active ? "0 0 0 3px #EDE9FE" : "none",
                        }}>
                        {done ? "✓" : s.n}
                      </div>
                      <div className="text-center leading-tight" style={{ fontSize: 8, color: active ? "#6D28D9" : done ? "#15803D" : "#94A3B8", fontWeight: active ? 700 : 400 }}>
                        {s.label}
                      </div>
                    </div>
                    {i < processSteps.length - 1 && (
                      <div className="h-px flex-1 mx-0.5 mb-3" style={{ background: s.n < currentStep ? "#15803D" : "#E2E8F0", minWidth: 6 }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg px-3 py-2.5" style={{ background: "#F5F3FF", border: "1px solid #E9D5FF" }}>
              <div className="text-xs font-bold mb-0.5" style={{ color: "#6D28D9" }}>● BƯỚC HIỆN TẠI – BƯỚC ② · KIỂM TRA ĐIỀU KIỆN</div>
              <div className="text-xs" style={{ color: "#64748B" }}>Hệ thống đang ở giai đoạn kiểm tra điều kiện tiếp nhận theo Quy trình QT-03.</div>
            </div>
          </div>
        </div>

        {/* LỚP 2b – AI ĐỐI CHIẾU QUY TRÌNH */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ background: "#FAFAFA" }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748B" }}>AI ĐỐI CHIẾU QUY TRÌNH</span>
            <span className="text-xs ml-auto font-semibold" style={{ color: allMet ? "#15803D" : "#B45309" }}>
              {metCount}/{conditions.length} điều kiện
            </span>
          </div>
          <div className="p-3 space-y-1.5">
            {conditions.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-xs">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                  style={{ background: c.ok ? "#D1FAE5" : "#FEE2E2", color: c.ok ? "#15803D" : "#C62828" }}>
                  {c.ok ? "✓" : "⚠"}
                </span>
                <span style={{ color: c.ok ? "#374151" : "#C62828", fontWeight: c.ok ? 400 : 600 }}>{c.label}</span>
              </div>
            ))}
            <div className="pt-2 text-xs border-t" style={{ borderColor: "#F1F5F9", color: "#64748B" }}>
              Đã kiểm tra {metCount}/{conditions.length} điều kiện của bước hiện tại theo Quy trình QT-03.
            </div>
          </div>
        </div>

        {/* ⚠ Cảnh báo trùng đơn */}
        <div className="rounded-xl border p-3" style={{ borderColor: "#FECACA", background: "#FFF5F5" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold" style={{ color: "#C62828" }}>⚠ CÓ KHẢ NĂNG TRÙNG ĐƠN</span>
            <span className="mono text-xs font-bold" style={{ color: "#C62828" }}>LN-08/2026</span>
            <span className="text-xs font-bold ml-auto" style={{ color: "#C62828" }}>84%</span>
          </div>
          <div className="rounded p-2 mb-2 text-xs" style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>
            <strong>RULE QT-03:</strong> Cần kiểm tra khả năng trùng trước khi chuyển sang bước tiếp theo.
          </div>
          <div className="flex gap-2">
            <button onClick={() => onOpen({ type: "don-lien-quan" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FECACA", color: "#C62828" }}>Xem đơn LN-08/2026</button>
            <button onClick={() => onOpen({ type: "trung-don" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#FECACA", color: "#C62828" }}>Xem điểm tương đồng</button>
          </div>
        </div>

        {/* LỚP 3 – AI ĐỀ XUẤT */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#FDE68A" }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ background: "#FFFBEB" }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#B45309" }}>③ AI ĐỀ XUẤT</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "#FEF3C7", color: "#B45309" }}>AI ĐỀ XUẤT</span>
          </div>
          <div className="p-3">
            <div className="rounded-lg p-3 mb-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <div className="text-sm font-bold mb-1" style={{ color: "#92400E" }}>
                Bổ sung thông tin quyết định/hành vi bị khiếu nại trước khi chuyển sang bước Phân loại.
              </div>
              <div className="text-xs" style={{ color: "#B45309" }}>
                Đồng thời kiểm tra khả năng trùng với LN-08/2026 theo yêu cầu của Rule QT-03.
              </div>
            </div>

            {/* Lý do */}
            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#64748B" }}>LÝ DO ĐỀ XUẤT</div>
            <div className="space-y-1.5 mb-3">
              {[
                { icon: "📋", label: "Quy trình QT-03 yêu cầu thông tin này tại bước Kiểm tra điều kiện" },
                { icon: "🔍", label: "AI chưa tìm thấy thông tin tương ứng trong đơn" },
                { icon: "⚠", label: "Chưa đủ dữ liệu để hoàn tất bước hiện tại" },
                { icon: "⚖️", label: "Rule: Cần xác minh trùng đơn trước khi chuyển bước" },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0">{r.icon}</span>
                  <span style={{ color: "#475569" }}>{r.label}</span>
                </div>
              ))}
            </div>

            {/* AI dựa vào đâu */}
            <div className="rounded-lg border p-3 mb-3" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#64748B" }}>AI DỰA VÀO ĐÂU?</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-semibold flex-shrink-0" style={{ color: "#1E40AF", minWidth: 80 }}>AI Phân tích:</span>
                  <span style={{ color: "#475569" }}>Nội dung đơn → Loại đơn: Khiếu nại (78%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold flex-shrink-0" style={{ color: "#6D28D9", minWidth: 80 }}>Quy trình:</span>
                  <span style={{ color: "#475569" }}>QT-03 · Bước ② Kiểm tra điều kiện</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold flex-shrink-0" style={{ color: "#6D28D9", minWidth: 80 }}>Rule:</span>
                  <span style={{ color: "#475569" }}>4/5 điều kiện đáp ứng · 1 điều kiện chưa đủ</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold flex-shrink-0" style={{ color: "#64748B", minWidth: 80 }}>Dữ liệu:</span>
                  <span style={{ color: "#475569" }}>01 đơn + 02 tài liệu + dữ liệu hệ thống</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t" style={{ borderColor: "#E2E8F0" }}>
                <button onClick={() => onOpen({ type: "xem-nguon", field: "su-viec" })} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Xem dữ liệu</button>
                <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#E2E8F0", color: "#6D28D9" }}>Xem Rule ↗</button>
                <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#E2E8F0", color: "#6D28D9" }}>Xem quy trình ↗</button>
              </div>
            </div>

            {/* Human in the loop */}
            <div className="text-xs px-3 py-2 rounded mb-3" style={{ background: "#F8FAFC", color: "#64748B", borderLeft: "3px solid #CBD5E1" }}>
              AI đề xuất – cán bộ xác nhận.
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Chỉnh sửa</button>
              <button className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Không đồng ý</button>
              <button className="text-xs px-3 py-1.5 rounded border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Xem căn cứ</button>
              <button className="text-xs px-3 py-1.5 rounded font-bold text-white" style={{ background: "#C62828" }}>Xác nhận chuyển bước →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default JobCard05;