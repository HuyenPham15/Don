import React, { useState, useMemo } from "react";
import PanelSection from "./PanelSection";
import { SparkleIcon } from "./icons";
import { DON_VI_OPTIONS, LOAI_DON_OPTIONS, WORKFLOW_CONFIGS } from "../constants";
import { WorkflowConfig, AcceptanceState } from "../types";

function ThongTinXuLySection({ huong, setHuong, donVi, setDonVi, onAccept }: {
  huong: string; setHuong: (v: string) => void; donVi: string; setDonVi: (v: string) => void;
  onAccept: (wf: WorkflowConfig, loaiDonName: string) => void;
}) {
  const options = [
    { id: "tiep-nhan-xu-ly", title: "Tiếp nhận và xử lý", desc: "Tiếp nhận đơn, khởi tạo hồ sơ và bắt đầu quy trình xử lý" },
    { id: "chuyen-tham-quyen", title: "Chuyển đơn vị có thẩm quyền", desc: "Chuyển cho đơn vị đúng thẩm quyền giải quyết" },
    { id: "tra-lai-don", title: "Trả lại đơn", desc: "Không đủ điều kiện thụ lý, trả lại cho người gửi" },
    { id: "ghep-don", title: "Ghép vào đơn / vụ việc đã có", desc: "Trùng với đơn hoặc vụ việc đang xử lý, ghép hồ sơ" },
  ];
  const donOptions = ["D-2026-00341 · Ông A · Dự án X", "D-2024-00187 · Ông A · Dự án X"];
  const inputCls = "w-full px-3 py-2 rounded-lg border text-sm";
  const needDonVi = huong === "chuyen-tham-quyen";

  // ─── Acceptance workflow state ────────────────────────────────────────────
  const [selectedLoaiDon, setSelectedLoaiDon] = useState("khieu-nai"); // AI pre-selects
  const [selectedWfId, setSelectedWfId] = useState("");
  const [acceptState, setAcceptState] = useState<AcceptanceState>("idle");

  const availableWorkflows = useMemo(
    () => WORKFLOW_CONFIGS.filter((wf) => wf.loaiDonId === selectedLoaiDon && wf.status === "active"),
    [selectedLoaiDon]
  );

  const selectedWorkflow = useMemo(() => {
    return availableWorkflows[0] ?? null;
  }, [availableWorkflows]);

  const loaiDonName = LOAI_DON_OPTIONS.find((l) => l.id === selectedLoaiDon)?.name ?? "";

  const handleLoaiDonChange = (id: string) => {
    setSelectedLoaiDon(id);
    setSelectedWfId("");
    setAcceptState("idle");
  };

  const canConfirm = selectedWorkflow !== null;

  return (
    <PanelSection index={3} title="Đề xuất giải quyết và Xác nhận">
      {/* ─── THÔNG TIN AI PHÂN TÍCH VÀ ĐỀ XUẤT ─── */}
      <div className="mb-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Tóm tắt */}
        <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center bg-blue-100 text-blue-700">
                <SparkleIcon size={12} />
              </span>
              Tóm tắt và phân tích (AI)
            </span>
            <button className="text-xs font-medium flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors bg-slate-50 px-2 py-1 rounded border">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Sao chép
            </button>
          </div>
          <div className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-lg border flex-1" style={{ borderColor: "#F1F5F9" }}>
            Nguyễn Văn A tố giác ông Trần Văn B - Giám đốc Công ty Cổ phần X có hành vi lừa đảo chiếm đoạt tài sản thông qua việc huy động vốn tại Dự án Khu đô thị Y ở Hà Nội trong giai đoạn 2024 - 2025. Người gửi đề nghị cơ quan điều tra xác minh, điều tra, bảo vệ quyền lợi và thông báo kết quả.
          </div>
        </div>

        {/* Gợi ý */}
        <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center bg-emerald-100 text-emerald-700">
                <SparkleIcon size={12} />
              </span>
              Gợi ý hướng xử lý (AI + Quy định)
            </span>
            <button className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              Căn cứ gợi ý
            </button>
          </div>
          <div className="text-sm text-slate-700 bg-emerald-50/50 p-3.5 rounded-lg border flex-1" style={{ borderColor: "#D1FAE5" }}>
            <div className="space-y-2.5">
              <p><strong className="text-emerald-800">1. Đề xuất phân loại:</strong> Tố giác tội phạm về lừa đảo chiếm đoạt tài sản.</p>
              <p><strong className="text-emerald-800">2. Kiểm tra đơn trùng:</strong> Có 01 đơn tương tự (D-2025-00341), đề nghị xem xét hợp nhất.</p>
              <div>
                <strong className="text-emerald-800">3. Đề xuất hướng xử lý:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-emerald-900/80">
                  <li>Chuyển Phòng Cảnh sát kinh tế để xác minh, giải quyết theo thẩm quyền.</li>
                  <li>Trường hợp có đủ dấu hiệu tội phạm, thụ lý nguồn tin về tội phạm.</li>
                </ul>
              </div>
              <p><strong className="text-emerald-800">4. Lưu ý:</strong> Người gửi đã có 03 đơn, cần kiểm tra kết quả các đơn trước và các vụ việc liên quan.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-sm font-bold text-slate-800 mb-3">Cán bộ xác nhận hướng xử lý:</div>
      <div className="mb-4 space-y-2">
        {options.map((o) => {
          const active = huong === o.id;
          const isAiPick = o.id === "tiep-nhan-xu-ly";
          return (
            <button key={o.id} onClick={() => setHuong(o.id)} className="w-full flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors"
              style={{ borderColor: active ? "#1D4ED8" : "#E5E7EB", background: active ? "#EFF6FF" : "#fff" }}>
              <span className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: active ? "#1D4ED8" : "#CBD5E1" }}>
                {active && <span className="w-2 h-2 rounded-full" style={{ background: "#1D4ED8" }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: active ? "#1D4ED8" : "#0F172A" }}>{o.title}</span>
                  {isAiPick && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
                      <SparkleIcon color="#1D4ED8" size={10} /> AI đề xuất
                    </span>
                  )}
                </span>
                <span className="block text-xs mt-0.5" style={{ color: "#64748B" }}>{o.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      {huong === "tiep-nhan-xu-ly" && (
        <div className="space-y-4 slide-in mt-2">
          <button
            onClick={() => {
              if (selectedWorkflow) onAccept(selectedWorkflow, loaiDonName);
            }}
            disabled={!canConfirm}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-opacity shadow-sm"
            style={{ background: canConfirm ? "#1D4ED8" : "#94A3B8", cursor: canConfirm ? "pointer" : "not-allowed" }}>
            Xác nhận tiếp nhận
          </button>
        </div>
      )}

      {/* ─── Other options ─── */}
      {huong !== "" && huong !== "tiep-nhan-xu-ly" && (
        <div className="space-y-3.5 slide-in">
          {huong === "ghep-don" && (
            <div>
              <div className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Đơn / Vụ việc liên quan <span style={{ color: "#C62828" }}>*</span></div>
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

          <div>
            <div className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Ghi chú xử lý</div>
            <textarea rows={3} className={inputCls + " resize-none"} style={{ borderColor: "#D1D9E3" }} placeholder={huong === "tra-lai-don" ? "Nêu rõ lý do trả lại đơn…" : "Ghi chú thêm cho hướng xử lý…"} />
          </div>
        </div>
      )}
    </PanelSection>
  );
}
export default ThongTinXuLySection;