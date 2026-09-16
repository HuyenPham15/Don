import React from 'react';

const AI_TASKS = [
  { id: 1, title: "Phân tích và trích xuất thông tin ban đầu", status: "done", time: "15/09/2026 08:30" },
  { id: 2, title: "Tra cứu trùng lặp và liên quan", status: "done", time: "15/09/2026 08:30" },
  { id: 3, title: "Xác định loại hình và quy trình xử lý", status: "done", time: "15/09/2026 08:31" },
  { id: 4, title: "Kiểm tra điều kiện thụ lý sơ bộ", status: "active", time: "Đang xử lý..." },
  { id: 5, title: "Đề xuất hướng giải quyết & dự thảo văn bản", status: "pending", time: "" },
];

export default function TabAI({ loaiDon }: { loaiDon: string }) {
  return (
    <div className="flex gap-6 h-full">
      {/* Cột trái: Danh sách các tác vụ AI */}
      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Hoạt động của Trợ lý AI</h2>
        <div className="bg-white rounded-xl border p-5 flex-1" style={{ borderColor: "#E2E8F0" }}>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
            {AI_TASKS.map((task) => (
              <div key={task.id} className="relative flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 relative z-10 border-2 border-white
                  ${task.status === "done" ? "bg-green-100 text-green-700" : 
                    task.status === "active" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
                  {task.status === "done" ? "✓" : task.status === "active" ? "↻" : task.id}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${task.status === "pending" ? "text-slate-400" : "text-slate-800"}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{task.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cột phải: Chi tiết/Đề xuất hiện tại */}
      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Gợi ý từ AI</h2>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">AI ĐỀ XUẤT</span>
            <span className="text-sm font-semibold text-blue-900">Về việc thụ lý đơn</span>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100 text-sm text-slate-700 mb-4 flex-1">
            <p className="mb-2">Dựa trên Quy định tại <strong>Điều 29 Luật Khiếu nại 2011</strong> và nội dung đơn:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600">
              <li>Đơn thuộc thẩm quyền giải quyết của Chủ tịch UBND Huyện.</li>
              <li>Chưa quá thời hiệu khiếu nại (90 ngày).</li>
              <li>Chưa có quyết định giải quyết khiếu nại lần 2.</li>
            </ul>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800">
              <strong>Tuy nhiên:</strong> Còn thiếu tài liệu chứng minh quyền sử dụng đất hợp pháp. Cần yêu cầu công dân bổ sung trước khi ra thông báo thụ lý.
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors">
              Chấp nhận gợi ý
            </button>
            <button className="flex-1 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm transition-colors">
              Bỏ qua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
