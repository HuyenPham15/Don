import React from 'react';
import FieldRow from "./FieldRow";
import JobCard from "./JobCard";
function JobCard01({ visible, active, onSource }: { visible: boolean; active: boolean; onSource: (s: string) => void }) {
  if (!visible) return null;
  return (
    <JobCard title="01 · AI ĐÃ HIỂU ĐƠN" badge={active ? undefined : "✓ Hoàn thành"} active={active}>
      {active ? (
        <div className="space-y-2">
          {["Đang đọc tài liệu...", "Đang OCR nội dung..."].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm" style={{ color: "#B45309" }}>
              <span className="ai-pulse">●</span> {t}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#F0FDF4", color: "#15803D", fontSize: 9 }}>✓ OCR đã thực hiện</span>
          </div>
          <FieldRow label="NGƯỜI GỬI" value="Nguyễn Văn A" confidence="Nhận diện từ phần ký tên" onSource={() => onSource("nguoi-gui")} />
          <FieldRow label="NGƯỜI / TỔ CHỨC BỊ PHẢN ÁNH" value="Công ty TNHH Xây dựng ABC" onSource={() => onSource("to-chuc")} />
          <FieldRow label="CƠ QUAN LIÊN QUAN" value="UBND tỉnh XYZ" onSource={() => onSource("co-quan")} />
          <FieldRow label="ĐỊA ĐIỂM / DỰ ÁN" value="Dự án Khu dân cư X" onSource={() => onSource("du-an")} />
          <FieldRow label="THỜI GIAN" value="10/09/2026" onSource={() => onSource("thoi-gian")} />
          <FieldRow label="SỰ VIỆC" value="Khiếu nại về mức bồi thường GPMB không đúng quy định" onSource={() => onSource("su-viec")} />
          <FieldRow label="YÊU CẦU" value="Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND" onSource={() => onSource("yeu-cau")} />
          <FieldRow label="TÀI LIỆU KÈM THEO" value="02 tài liệu" onSource={() => onSource("tai-lieu")} />
        </>
      )}
    </JobCard>
  );
}
export default JobCard01;