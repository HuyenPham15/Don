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
    <div className="rounded-xl border p-4 bg-white shadow-sm" style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
            <svg className="w-3.5 h-3.5 ai-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-800">{current.name}</div>
          <div className="text-xs text-slate-500 mt-1 leading-relaxed">{current.desc}</div>
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