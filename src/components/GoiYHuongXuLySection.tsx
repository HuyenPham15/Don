import React from "react";
import PanelSection from "./PanelSection";

function GoiYHuongXuLySection({ huong, setHuong }: { huong: string; setHuong: (v: string) => void }) {
  const options = [
    { id: "tiep-nhan-xu-ly", title: "Tiếp nhận (Tạo Đơn mới)", badge: "STEP-03A", desc: "Đơn phát sinh mới không trùng lặp, khởi tạo mã Đơn chính thức và đưa vào quy trình thụ lý", aiSuggest: true },
    { id: "ghep-don", title: "Ghép đơn (Ghép vào Đơn đã có)", badge: "STEP-03B", desc: "Trùng người nộp hoặc đối tượng vụ việc, ghép vào hồ sơ đang giải quyết, không tạo mã đơn trùng" },
    { id: "ban-giao", title: "Bàn giao đơn", badge: "STEP-03C", desc: "Đơn thuộc thẩm quyền cơ quan khác hoặc chuyển cán bộ khác, lập thông tin và chuyển giao hồ sơ" },
    { id: "tra-lai", title: "Trả lại đơn", badge: "STEP-03D", desc: "Không đủ điều kiện thụ lý hoặc không thuộc thẩm quyền, ghi lý do và lập văn bản trả lại công dân" },
  ];

  return (
    <PanelSection index={4} title="Gợi ý hướng xử lý">
      <div className="space-y-2">
        {options.map((o) => {
          const active = huong === o.id;
          return (
            <button key={o.id} onClick={() => setHuong(o.id)} className="w-full flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors"
              style={{ borderColor: active ? "#1D4ED8" : "#E5E7EB", background: active ? "#EFF6FF" : "#fff" }}>
              <span className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: active ? "#1D4ED8" : "#CBD5E1" }}>
                {active && <span className="w-2 h-2 rounded-full" style={{ background: "#1D4ED8" }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: active ? "#1D4ED8" : "#0F172A" }}>{o.title}</span>
                  {o.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ background: "#F1F5F9", color: "#475569" }}>{o.badge}</span>
                  )}
                  {o.aiSuggest && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>AI đề xuất</span>
                  )}
                </span>
                <span className="block text-xs mt-0.5" style={{ color: "#64748B" }}>{o.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </PanelSection>
  );
}
export default GoiYHuongXuLySection;
