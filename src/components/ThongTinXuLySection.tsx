import React, { useState, useMemo } from "react";
import { DON_VI_OPTIONS, LOAI_DON_OPTIONS, WORKFLOW_CONFIGS } from "../constants";
import { WorkflowConfig } from "../types";
import BanGiaoDonModal from "./modals/BanGiaoDonModal";
import TraLaiDonModal from "./modals/TraLaiDonModal";

function ThongTinXuLySection({
  huong,
  setHuong,
  donVi,
  setDonVi,
  onAccept,
}: {
  huong: string;
  setHuong: (v: string) => void;
  donVi: string;
  setDonVi: (v: string) => void;
  onAccept: (wf: WorkflowConfig, loaiDonName: string) => void;
}) {
  const [showCanCuModal, setShowCanCuModal] = useState(false);
  const [showBanGiaoModal, setShowBanGiaoModal] = useState(false);
  const [showTraLaiModal, setShowTraLaiModal] = useState(false);
  const [expandedCanCu, setExpandedCanCu] = useState<string | null>(null);
  const [officerNote, setOfficerNote] = useState(
    "Qua phân tích, đề xuất tiếp nhận đơn và chuyển Phòng Cảnh sát kinh tế để xem xét, giải quyết theo thẩm quyền."
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Mặc định chọn hướng 1 nếu chưa chọn
  const activeHuong = huong || "tiep-nhan-xu-ly";

  const selectedLoaiDon = "to-giac";
  const loaiDonName = "Tố giác tội phạm";

  const availableWorkflows = useMemo(
    () => WORKFLOW_CONFIGS.filter((wf) => wf.loaiDonId === selectedLoaiDon && wf.status === "active"),
    [selectedLoaiDon]
  );

  const selectedWorkflow = useMemo(() => {
    return availableWorkflows[0] ?? WORKFLOW_CONFIGS[0] ?? null;
  }, [availableWorkflows]);

  const canConfirm = selectedWorkflow !== null;

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-base">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. PHÂN LOẠI GỢI Ý (AI + RULES)                                     */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 font-headline-md">
            <span>4. Phân loại gợi ý</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowCanCuModal(true)}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">menu_book</span>
            <span>Căn cứ gợi ý</span>
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Hàng 1: Đề xuất loại đơn */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[18px]">description</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 font-medium block">Đề xuất loại đơn</span>
                <span className="text-sm font-bold text-slate-900">Tố giác tội phạm</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 shrink-0">
              Độ tin cậy: 92%
            </span>
          </div>

          {/* Hàng 2: Nhóm nội dung */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </div>
            <div>
              <span className="text-[10.5px] text-slate-500 font-medium block">Nhóm nội dung</span>
              <span className="text-xs sm:text-sm font-medium text-slate-800">Lừa đảo chiếm đoạt tài sản</span>
            </div>
          </div>

          {/* Hàng 3: Lĩnh vực */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">category</span>
            </div>
            <div>
              <span className="text-[10.5px] text-slate-500 font-medium block">Lĩnh vực</span>
              <span className="text-xs sm:text-sm font-medium text-slate-800">Kinh tế</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. GỢI Ý HƯỚNG XỬ LÝ                                                */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2 font-headline-md">
          5. Gợi ý hướng xử lý
        </h3>

        <div className="space-y-2.5 text-xs">
          {/* Tùy chọn 1: Tiếp nhận, chuyển đơn vị điều tra theo thẩm quyền (92%) */}
          <div
            onClick={() => setHuong("tiep-nhan-xu-ly")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${activeHuong === "tiep-nhan-xu-ly"
                ? "bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-200"
                : "bg-white border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5 shrink-0">
                {activeHuong === "tiep-nhan-xu-ly" ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300 block" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Tiếp nhận (Tạo Đơn mới)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                    92%
                  </span>
                </div>
                <ul className="text-slate-600 space-y-0.5 mt-1.5 pl-0.5 leading-relaxed">
                  <li>• Đơn phát sinh mới, không trùng lặp đối tượng/vụ việc.</li>
                  <li>• Đủ điều kiện khởi tạo mã Đơn chính thức và thụ lý giải quyết.</li>
                  <li>• Thuộc thẩm quyền của đơn vị Tiếp nhận & Xử lý đơn.</li>
                </ul>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCanCu(expandedCanCu === "op1" ? null : "op1");
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 mt-2 cursor-pointer"
                >
                  <span>Xem căn cứ</span>
                  <span className="material-symbols-outlined text-[13px]">
                    {expandedCanCu === "op1" ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {expandedCanCu === "op1" && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1 animate-fade-in">
                    <p>• <strong>Thông tư số 05/2021/TT-TTCP:</strong> Quy định quy trình tiếp nhận, xử lý đơn khiếu nại, tố cáo, kiến nghị, phản ánh.</p>
                    <p>• <strong>Điều 145 Bộ luật Tố tụng Hình sự 2015:</strong> Thẩm quyền và trách nhiệm tiếp nhận, khởi tạo hồ sơ thụ lý giải quyết ban đầu.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tùy chọn 2: Ghép vào Đơn đã có (88%) */}
          <div
            onClick={() => setHuong("ghep-don")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${activeHuong === "ghep-don"
                ? "bg-indigo-50/40 border-indigo-400 ring-1 ring-indigo-200"
                : "bg-white border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5 shrink-0">
                {activeHuong === "ghep-don" ? (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300 block" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Ghép đơn (Ghép vào Đơn đã có)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold shrink-0">
                    88%
                  </span>
                </div>
                <ul className="text-slate-600 space-y-0.5 mt-1.5 pl-0.5 leading-relaxed">
                  <li>• Phát hiện trùng khớp người nộp hoặc đối tượng bị phản ánh.</li>
                  <li>• Gợi ý ghép vào đơn đang thụ lý: <strong>Đ-2026-00125</strong>.</li>
                  <li>• Không tạo mã đơn mới, lưu thành tài liệu bổ sung/chứng cứ.</li>
                </ul>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCanCu(expandedCanCu === "op2" ? null : "op2");
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 mt-2 cursor-pointer"
                >
                  <span>Xem căn cứ</span>
                  <span className="material-symbols-outlined text-[13px]">
                    {expandedCanCu === "op2" ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {expandedCanCu === "op2" && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1 animate-fade-in">
                    <p>• <strong>Điều 27 Thông tư 05/2021/TT-TTCP:</strong> Xử lý đối với đơn trùng lặp, đơn gửi nhiều lần, đơn bổ sung tài liệu chứng cứ cho vụ việc đang giải quyết.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tùy chọn 3: Bàn giao đơn (STEP-03C) */}
          <div
            onClick={() => setHuong("ban-giao")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${activeHuong === "ban-giao"
                ? "bg-amber-50/40 border-amber-400 ring-1 ring-amber-200"
                : "bg-white border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5 shrink-0">
                {activeHuong === "ban-giao" ? (
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300 block" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Bàn giao đơn (STEP-03C)
                    </h4>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Cơ quan / Cán bộ khác
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold shrink-0">
                    Chuyển tiếp
                  </span>
                </div>
                <ul className="text-slate-600 space-y-0.5 mt-1.5 pl-0.5 leading-relaxed">
                  <li>• Đơn thuộc thẩm quyền giải quyết của cơ quan khác hoặc phân công chuyên môn lại.</li>
                  <li>• Lập thông tin bàn giao, biên bản bàn giao và chuyển giao hồ sơ (STEP-03C).</li>
                </ul>
                <div className="mt-2 flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBanGiaoModal(true);
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                    <span>Mở popup Bàn giao đơn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tùy chọn 4: Trả lại đơn (STEP-03D) */}
          <div
            onClick={() => setHuong("tra-lai")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${activeHuong === "tra-lai"
                ? "bg-rose-50/40 border-rose-400 ring-1 ring-rose-200"
                : "bg-white border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5 shrink-0">
                {activeHuong === "tra-lai" ? (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300 block" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Trả lại đơn (STEP-03D)
                    </h4>
                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 text-[10px] font-bold">
                      Không thụ lý
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold shrink-0">
                    Kết thúc
                  </span>
                </div>
                <ul className="text-slate-600 space-y-0.5 mt-1.5 pl-0.5 leading-relaxed">
                  <li>• Đơn không thuộc thẩm quyền hoặc không đủ điều kiện thụ lý (nặc danh, thiếu thông tin).</li>
                  <li>• Lập văn bản thông báo trả lại đơn và hướng dẫn công dân nộp đúng nơi (STEP-03D).</li>
                </ul>
                <div className="mt-2 flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTraLaiModal(true);
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">assignment_return</span>
                    <span>Mở popup Trả lại đơn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6. Ý KIẾN CỦA CÁN BỘ TIẾP NHẬN                                       */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2 font-headline-md">
          6. Ý kiến của cán bộ tiếp nhận
        </h3>

        <div>
          <textarea
            rows={3}
            value={officerNote}
            onChange={(e) => setOfficerNote(e.target.value)}
            placeholder="Nhập ý kiến đề xuất xử lý của cán bộ..."
            maxLength={500}
            className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all resize-none leading-relaxed"
          />
          <div className="flex justify-end pt-1">
            <span className="text-[11px] text-slate-400 font-label-technical">
              {officerNote.length}/500
            </span>
          </div>
        </div>

        {/* Nhóm các nút hành động */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowBanGiaoModal(true)}
            className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-700">swap_horiz</span>
            <span>Bàn giao [STEP-03C]</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTraLaiModal(true)}
            className="px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-700">assignment_return</span>
            <span>Trả lại [STEP-03D]</span>
          </button>
          <button
            type="button"
            onClick={() => showToast("Đã lưu nháp ý kiến cán bộ tiếp nhận.")}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={() => showToast("Đã gửi hồ sơ trình lãnh đạo phê duyệt.")}
            className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
          >
            Trình lãnh đạo phê duyệt
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedWorkflow) onAccept(selectedWorkflow, loaiDonName);
            }}
            disabled={!canConfirm}
            className="px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0043a8] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all"
          >
            Hoàn tất tiếp nhận
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL BÀN GIAO ĐƠN (STEP-03C)                                       */}
      {/* =================================================================== */}
      <BanGiaoDonModal
        isOpen={showBanGiaoModal}
        onClose={() => setShowBanGiaoModal(false)}
        onSubmit={(data) => {
          setShowBanGiaoModal(false);
          showToast(`✓ [STEP-03C] Đã hoàn tất bàn giao đơn sang "${data.banGiaoType === 'don_vi_khac' ? data.donViNhanName : data.canBoNhan?.name}".`);
        }}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: "Đ-2026-00125",
          luotNhanId: "LN-2026-0819",
          nguoiNop: "Nguyễn Văn A",
          loaiDon: "Tố giác tội phạm",
          noiDung: "Tố giác hành vi lừa đảo chiếm đoạt tài sản",
          ngayNhan: "16/09/2026",
          suggestedDeptId: "pc03",
        }}
      />

      {/* =================================================================== */}
      {/* MODAL TRẢ LẠI ĐƠN (STEP-03D)                                        */}
      {/* =================================================================== */}
      <TraLaiDonModal
        isOpen={showTraLaiModal}
        onClose={() => setShowTraLaiModal(false)}
        onSubmit={(data) => {
          setShowTraLaiModal(false);
          showToast(`✓ [STEP-03D] Đã lập văn bản trả lại đơn cho công dân và kết thúc Task.`);
        }}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: "Đ-2026-00125",
          luotNhanId: "LN-2026-0819",
          nguoiNop: "Nguyễn Văn A",
          loaiDon: "Đơn kiến nghị đất đai",
          noiDung: "Tranh chấp ranh giới quyền sử dụng đất",
          ngayNhan: "16/09/2026",
        }}
      />

      {/* =================================================================== */}
      {/* MODAL CĂN CỨ GỢI Ý                                                  */}
      {/* =================================================================== */}
      {showCanCuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">menu_book</span>
                <h3 className="font-bold text-slate-900 text-base">Căn cứ pháp lý gợi ý xử lý</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCanCuModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
              <p>
                <strong>1. Điều 145 Bộ luật Tố tụng Hình sự 2015:</strong> Thẩm quyền và trách nhiệm tiếp nhận, giải quyết tố giác, tin báo về tội phạm.
              </p>
              <p>
                <strong>2. Thông tư liên tịch 01/2017/TTLT-BCA-BQP-BTC-BNN&amp;PTNT-VKSNDTC:</strong> Phối hợp giữa các cơ quan trong việc tiếp nhận, thụ lý nguồn tin tội phạm.
              </p>
              <p>
                <strong>3. Điều 174 Bộ luật Hình sự 2015 (sửa đổi 2017):</strong> Tội lừa đảo chiếm đoạt tài sản.
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCanCuModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThongTinXuLySection;