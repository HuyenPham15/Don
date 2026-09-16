import React from 'react';
function StepAnalyzingCard({ nextJob }: { nextJob: number }) {
  const stepsInfo: Record<number, { name: string; desc: string }> = {
    2: {
      name: "Bước 2: Tra cứu, Phân tích đơn liên quan & Đề xuất xử lý",
      desc: "Hệ thống đang tự động đối chiếu cơ sở dữ liệu, phân tích mức độ tương đồng đơn, kiểm tra quy tắc nghiệp vụ và tổng hợp phương án đề xuất...",
    },
    3: {
      name: "Bước 3: Xác định hướng xử lý",
      desc: "AI đã hoàn tất đối chiếu và đang chuẩn bị biểu mẫu xác nhận hướng xử lý cho cán bộ tiếp nhận...",
    },
  };

  const current = stepsInfo[nextJob];
  if (!current) return null;

  return (
    <div className="rounded-xl border border-dashed p-4.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 slide-in" style={{ borderColor: "#93C5FD" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white shadow-sm border" style={{ borderColor: "#BFDBFE" }}>
          <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "#BFDBFE", borderTopColor: "#1D4ED8" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1D4ED8" }}>{current.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium ai-pulse" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
              Đang phân tích...
            </span>
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#475569" }}>{current.desc}</p>
        </div>
      </div>
      <div className="mt-3.5 pt-3 border-t flex items-center gap-3" style={{ borderColor: "#DBEAFE" }}>
        <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-blue-100">
          <div className="h-full rounded-full bg-blue-600 ai-pulse" style={{ width: `${(nextJob / 3) * 100}%` }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "#64748B" }}>Đang xử lý bước {nextJob}/3</span>
      </div>
    </div>
  );
}
export default StepAnalyzingCard;