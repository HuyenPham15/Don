import React from 'react';
function DonTiepNhan({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-6 py-4" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "#94A3B8" }}>
          <button onClick={() => onNav("cong-viec")} style={{ color: "#C62828" }} className="hover:underline">Công việc của tôi</button>
          <span>/</span><span>Đơn tiếp nhận</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold">Đơn tiếp nhận</h1>
              <span className="mono text-sm font-bold" style={{ color: "#C62828" }}>DN-19/2026-GOVEX</span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#F0FDF4", color: "#15803D" }}>✓ Đã xác nhận</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border p-4 mb-5 flex items-start gap-3" style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}>
            <span style={{ color: "#1E40AF" }}>ℹ</span>
            <span className="text-sm" style={{ color: "#1E40AF" }}>
              Thông tin được <strong>AI đề xuất và đã được cán bộ xác nhận</strong>. Bạn có thể chỉnh sửa trước khi lưu chính thức.
            </span>
          </div>
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#E2E8F0" }}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {([
                { label: "Mã đơn tiếp nhận", value: "DN-19/2026-GOVEX", mono: true },
                { label: "Loại đơn", value: "Khiếu nại", ai: true },
                { label: "Người gửi", value: "Nguyễn Văn A" },
                { label: "CCCD / Mã định danh", value: "079075012345", mono: true },
                { label: "Đối tượng bị khiếu nại", value: "Công ty TNHH Xây dựng ABC", ai: true },
                { label: "Dự án / Sự việc", value: "Dự án Khu dân cư X" },
                { label: "Ngày làm đơn", value: "10/09/2026" },
                { label: "Ngày tiếp nhận", value: "15/09/2026" },
                { label: "Đơn vị tiếp nhận", value: "Phòng Hành chính - Tổng hợp" },
                { label: "Người tiếp nhận", value: "Nguyễn Minh Anh" },
              ] as { label: string; value: string; mono?: boolean; ai?: boolean }[]).map((f) => (
                <div key={f.label}>
                  <div className="text-xs font-medium mb-1 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                    {f.label}
                    {f.ai && <span className="px-1 py-0.5 rounded text-xs font-semibold" style={{ background: "#EFF6FF", color: "#1E40AF", fontSize: 8 }}>AI</span>}
                  </div>
                  <input className={`w-full px-3 py-1.5 rounded border text-sm ${f.mono ? "mono" : ""}`}
                    style={{ borderColor: "#E2E8F0" }} defaultValue={f.value} />
                </div>
              ))}
              <div className="col-span-2">
                <div className="text-xs font-medium mb-1 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                  Nội dung tóm tắt
                  <span className="px-1 py-0.5 rounded text-xs font-semibold" style={{ background: "#EFF6FF", color: "#1E40AF", fontSize: 8 }}>AI</span>
                </div>
                <textarea className="w-full px-3 py-2 rounded border text-sm resize-none" style={{ borderColor: "#E2E8F0" }} rows={3}
                  defaultValue="Hộ gia đình khiếu nại mức bồi thường GPMB không đúng với giá đất thực tế tại Dự án Khu dân cư X. Yêu cầu xem xét lại theo QĐ 45/2024/QĐ-UBND." />
              </div>
              <div className="col-span-2">
                <div className="text-xs font-medium mb-1 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                  Yêu cầu của người gửi
                  <span className="px-1 py-0.5 rounded text-xs font-semibold" style={{ background: "#EFF6FF", color: "#1E40AF", fontSize: 8 }}>AI</span>
                </div>
                <textarea className="w-full px-3 py-2 rounded border text-sm resize-none" style={{ borderColor: "#E2E8F0" }} rows={2}
                  defaultValue="Xem xét lại mức bồi thường đất, đảm bảo quyền lợi hợp pháp theo Luật Đất đai 2024 và QĐ 45/2024/QĐ-UBND." />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t px-6 py-4 flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
        <button onClick={() => onNav("ban-phan-tich")} className="px-4 py-2 rounded border text-sm" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>← Quay lại</button>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded border text-sm" style={{ borderColor: "#E2E8F0" }}>Lưu nháp</button>
          <button onClick={() => onNav("cong-viec")} className="px-6 py-2 rounded text-sm font-bold text-white" style={{ background: "#C62828" }}>
            Xác nhận → Chuyển thẩm định
          </button>
        </div>
      </div>
    </div>
  );
}
export default DonTiepNhan;