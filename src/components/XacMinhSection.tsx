import React from 'react';
import SectionTitle from "./SectionTitle";
function XacMinhSection({ onOpen }: { onOpen: (d: DrawerState) => void }) {
  const issues = [
    { text: "Chưa có số điện thoại người nộp đơn", action: "Bổ sung", drawer: { type: "mau-thuan" } as DrawerState },
    { text: "Tên tổ chức khác dữ liệu lịch sử · TNHH vs CP Xây dựng ABC", action: "Xem dữ liệu", drawer: { type: "mau-thuan" } as DrawerState },
    { text: "Chưa xác định rõ cơ quan có thẩm quyền", action: "Xem căn cứ", drawer: { type: "mau-thuan" } as DrawerState },
  ];
  return (
    <div>
      <SectionTitle num={3} badge={
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#C62828" }}>3 vấn đề</span>
      }>Thông tin cần xác minh</SectionTitle>
      <div className="space-y-2">
        {issues.map((issue, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-lg px-4 py-3"
            style={{ background: "#FFF5F5", border: "1px solid #FEE2E2" }}>
            <div className="flex items-start gap-2 min-w-0">
              <span className="flex-shrink-0 mt-0.5" style={{ color: "#C62828" }}>⚠</span>
              <span className="text-sm" style={{ color: "#1A202C" }}>{issue.text}</span>
            </div>
            <button onClick={() => onOpen(issue.drawer)} className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded font-medium"
              style={{ background: "#fff", border: "1px solid #FECACA", color: "#C62828" }}>
              {issue.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default XacMinhSection;