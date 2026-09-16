import React from "react";
import PanelSection from "./PanelSection";

function GoiYHuongXuLySection({ huong, setHuong }: { huong: string; setHuong: (v: string) => void }) {
  const options = [
    { id: "tiep-nhan-xu-ly", title: "Tiếp nhận xử lý", desc: "Tiếp nhận đơn, khởi tạo hồ sơ và bắt đầu quy trình xử lý", aiSuggest: true },
    { id: "tra-lai-don", title: "Trả lại đơn", desc: "Không đủ điều kiện thụ lý, trả lại cho người gửi" },
    { id: "ghep-don", title: "Ghép vào đơn / vụ việc đang giải quyết", desc: "Trùng với đơn hoặc vụ việc đang xử lý, ghép hồ sơ" },
    { id: "chuyen-tham-quyen", title: "Chuyển đơn vị có thẩm quyền", desc: "Chuyển cho cơ quan/đơn vị khác giải quyết" },
    { id: "yeu-cau-bo-sung", title: "Yêu cầu bổ sung", desc: "Hồ sơ thiếu thông tin quan trọng, yêu cầu người gửi bổ sung" },
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
