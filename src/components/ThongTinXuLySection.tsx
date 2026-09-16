import React from 'react';
import PanelSection from "./PanelSection";
function ThongTinXuLySection({ huong, setHuong, donVi, setDonVi }: {
  huong: string; setHuong: (v: string) => void; donVi: string; setDonVi: (v: string) => void;
}) {
  const options = [
    { id: "tiep-nhan-moi", title: "Tiếp nhận đơn mới", desc: "Khởi tạo hồ sơ đơn mới từ lượt nhận này" },
    { id: "gan-hien-co", title: "Gắn với đơn / hồ sơ đã có", desc: "Bổ sung vào một hồ sơ đang xử lý" },
    { id: "chuyen-tiep-nhan", title: "Chuyển tiếp nhận xử lý", desc: "Chuyển cho đơn vị tiếp nhận" },
    { id: "chuyen-tham-quyen", title: "Chuyển đơn vị có thẩm quyền", desc: "Chuyển cho đơn vị đúng thẩm quyền giải quyết" },
    { id: "yeu-cau-bo-sung", title: "Yêu cầu bổ sung thông tin", desc: "Đề nghị người gửi bổ sung hồ sơ / thông tin" },
    { id: "ket-thuc", title: "Kết thúc / Không tiếp nhận", desc: "Không đủ điều kiện thụ lý / trả lại" },
  ];
  const donOptions = ["D-2026-00341 · Ông A · Dự án X", "D-2024-00187 · Ông A · Dự án X"];
  const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
  const needDonVi = huong === "chuyen-tiep-nhan" || huong === "chuyen-tham-quyen";

  return (
    <PanelSection index={3} title="Xác định hướng xử lý">
      <p className="text-sm mb-4 -mt-1" style={{ color: "#64748B" }}>Hướng xử lý do cán bộ xác nhận dựa trên nội dung hồ sơ và kết quả kiểm tra.</p>
      <div className="mb-1.5 text-sm font-medium" style={{ color: "#374151" }}>Hướng xử lý <span style={{ color: "#C62828" }}>*</span></div>
      <div className="space-y-2 mb-4">
        {options.map((o) => {
          const active = huong === o.id;
          return (
            <button key={o.id} onClick={() => setHuong(o.id)} className="w-full flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors"
              style={{ borderColor: active ? "#1D4ED8" : "#E5E7EB", background: active ? "#EFF6FF" : "#fff" }}>
              <span className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: active ? "#1D4ED8" : "#CBD5E1" }}>
                {active && <span className="w-2 h-2 rounded-full" style={{ background: "#1D4ED8" }} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold" style={{ color: active ? "#1D4ED8" : "#0F172A" }}>{o.title}</span>
                <span className="block text-xs mt-0.5" style={{ color: "#64748B" }}>{o.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {huong !== "" && (
        <div className="space-y-3.5 slide-in">
          {huong === "gan-hien-co" && (
            <div>
              <div className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Đơn / Hồ sơ liên quan <span style={{ color: "#C62828" }}>*</span></div>
              <select className={inputCls} style={{ borderColor: "#D1D9E3" }} value={donVi} onChange={(e) => setDonVi(e.target.value)}>
                <option value="">— Chọn hồ sơ —</option>
                {donOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          )}

          {needDonVi && (
            <div>
              <div className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Đơn vị nhận <span style={{ color: "#C62828" }}>*</span></div>
              <select className={inputCls} style={{ borderColor: "#D1D9E3" }} value={donVi} onChange={(e) => setDonVi(e.target.value)}>
                <option value="">— Chọn đơn vị —</option>
                {DON_VI_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          )}

          {huong === "chuyen-tiep-nhan" && (
            <div>
              <div className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Người / Nhóm xử lý</div>
              <select className={inputCls} style={{ borderColor: "#D1D9E3" }} defaultValue="">
                <option value="">— Chọn (không bắt buộc) —</option>
                <option>Nguyễn Minh Anh</option>
                <option>Nhóm Thẩm định 1</option>
                <option>Nhóm Thanh tra</option>
              </select>
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Ghi chú xử lý</div>
            <textarea rows={3} className={inputCls + " resize-none"} style={{ borderColor: "#D1D9E3" }} placeholder={huong === "ket-thuc" ? "Nêu rõ lý do không tiếp nhận / trả lại…" : "Ghi chú thêm cho hướng xử lý…"} />
          </div>
        </div>
      )}
    </PanelSection>
  );
}
export default ThongTinXuLySection;