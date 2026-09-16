import React from 'react';
import JobCard from "./JobCard";
function JobCard04({ visible, active }: { visible: boolean; active: boolean }) {
  if (!visible) return null;
  return (
    <JobCard title="04 · AI TÓM TẮT NGHIỆP VỤ" badge={active ? undefined : "✓ Hoàn thành"} active={active}>
      {active ? (
        <div className="text-sm ai-pulse" style={{ color: "#B45309" }}>● Đang tổng hợp dữ liệu...</div>
      ) : (
        <div className="space-y-3">
          {[
            { label: "NGƯỜI GỬI", value: "Nguyễn Văn A" },
            { label: "NỘI DUNG CHÍNH", value: "Khiếu nại về mức bồi thường GPMB không đúng với giá đất thực tế (850.000đ/m² so với 2.200.000đ/m² thị trường)" },
            { label: "ĐỐI TƯỢNG LIÊN QUAN", value: "Công ty TNHH Xây dựng ABC · Dự án Khu dân cư X" },
            { label: "SỰ VIỆC", value: "Tranh chấp bồi thường GPMB, phát sinh từ Dự án KDC X, quyết định bồi thường của Công ty ABC" },
            { label: "YÊU CẦU CỦA NGƯỜI GỬI", value: "Xem xét lại mức bồi thường đảm bảo đúng giá thị trường theo QĐ 45/2024" },
            { label: "KẾT QUẢ TRA CỨU", value: "02 lượt gửi trước · 03 đơn liên quan · 01 vụ việc liên quan · 01 đơn tương đồng 86%" },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-xs uppercase tracking-wide mb-0.5 font-semibold" style={{ color: "#94A3B8", fontSize: 9 }}>{f.label}</div>
              <div className="text-sm" style={{ color: "#1A202C" }}>{f.value}</div>
            </div>
          ))}
        </div>
      )}
    </JobCard>
  );
}
export default JobCard04;