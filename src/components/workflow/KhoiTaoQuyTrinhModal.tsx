import React, { useState, useEffect } from 'react';
import { WorkflowDefinition } from '../../types/workflow';

interface KhoiTaoQuyTrinhModalProps {
  isOpen: boolean;
  onClose: () => void;
  loaiDonConfirmed: string;
  workflow: WorkflowDefinition;
  donCode: string;
  donTitle: string;
  nguoiNop: string;
  onConfirmAndEnterProcess: (workflow: WorkflowDefinition) => void;
}

export default function KhoiTaoQuyTrinhModal({
  isOpen,
  onClose,
  loaiDonConfirmed,
  workflow,
  donCode,
  donTitle,
  nguoiNop,
  onConfirmAndEnterProcess,
}: KhoiTaoQuyTrinhModalProps) {
  // Phase 1: 'initializing' (progress running, locked)
  // Phase 2: 'ready' (showing results, flow, AI suggestions, missing info, confirm button)
  const [phase, setPhase] = useState<'initializing' | 'ready'>('initializing');
  const [progressStep, setProgressStep] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) {
      setPhase('initializing');
      setProgressStep(1);
      return;
    }

    // Nạp nhanh gói dữ liệu AI đã ngầm phân tích trước đó
    setPhase('initializing');
    setProgressStep(1);

    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setProgressStep(2), 200));
    timers.push(setTimeout(() => setProgressStep(3), 400));
    timers.push(setTimeout(() => setProgressStep(4), 650));
    timers.push(setTimeout(() => setProgressStep(5), 900));
    timers.push(setTimeout(() => setProgressStep(6), 1150));
    timers.push(
      setTimeout(() => {
        setProgressStep(7);
        setPhase('ready');
      }, 1400)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isOpen, loaiDonConfirmed, workflow]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* =================================================================== */}
        {/* HEADER MODAL                                                        */}
        {/* =================================================================== */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">
                {phase === 'initializing' ? 'autorenew' : 'account_tree'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight font-headline-md">
                  {phase === 'initializing'
                    ? 'Đang thiết lập quy trình xử lý'
                    : 'Quy trình xử lý được đề xuất'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/80 text-[#004ac6] border border-blue-200">
                  {donCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {phase === 'initializing'
                  ? 'Hệ thống đang xác định quy trình phù hợp với thông tin đã được xác nhận.'
                  : `Xác lập theo Loại đơn đã xác nhận: "${loaiDonConfirmed}"`}
              </p>
            </div>
          </div>

          {phase === 'ready' && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* =================================================================== */}
        {/* BODY MODAL                                                          */}
        {/* =================================================================== */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ───────────────────────────────────────────────────────────────── */}
          {/* GIAI ĐOẠN 1: ĐANG THIẾT LẬP QUY TRÌNH (KHÓA DỮ LIỆU)              */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {phase === 'initializing' && (
            <div className="py-6 space-y-6 max-w-xl mx-auto text-center">
              {/* Spinning / Radar icon */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-60"></div>
                <div className="relative w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-[#004ac6] shadow-md">
                  <span className="material-symbols-outlined text-[36px] animate-spin">
                    autorenew
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Đang phân tích và kích hoạt quy trình xử lý...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Dữ liệu đang được khóa bảo vệ toàn vẹn trong thời gian hệ thống dựng các bước nghiệp vụ và khởi tạo công việc.
                </p>
              </div>

              {/* Progress 6 Checkpoints */}
              <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/80 text-left space-y-3.5 shadow-2xs">
                {/* 1. Đã xác nhận thông tin đơn */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                    check_circle
                  </span>
                  <span className="font-semibold text-slate-800">
                    Đã xác nhận thông tin người nộp &amp; hồ sơ vụ việc
                  </span>
                </div>

                {/* 2. Xác định loại đơn */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                    check_circle
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">Xác định loại đơn:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {loaiDonConfirmed}
                    </span>
                  </div>
                </div>

                {/* 3. Xác định quy trình xử lý */}
                <div className="flex items-center gap-3 text-xs">
                  {progressStep >= 3 ? (
                    progressStep === 3 ? (
                      <span className="material-symbols-outlined text-[20px] text-[#004ac6] animate-spin shrink-0">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                        check_circle
                      </span>
                    )
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0"></span>
                  )}
                  <span
                    className={`${
                      progressStep >= 3
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    Xác định quy trình xử lý: {workflow.name}
                  </span>
                </div>

                {/* 4. Xác định các bước công việc */}
                <div className="flex items-center gap-3 text-xs">
                  {progressStep >= 4 ? (
                    progressStep === 4 ? (
                      <span className="material-symbols-outlined text-[20px] text-[#004ac6] animate-spin shrink-0">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                        check_circle
                      </span>
                    )
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0"></span>
                  )}
                  <span
                    className={`${
                      progressStep >= 4
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    Xác định {workflow.totalSteps} bước công việc theo quy định
                  </span>
                </div>

                {/* 5. Xác định người/đơn vị thực hiện */}
                <div className="flex items-center gap-3 text-xs">
                  {progressStep >= 5 ? (
                    progressStep === 5 ? (
                      <span className="material-symbols-outlined text-[20px] text-[#004ac6] animate-spin shrink-0">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                        check_circle
                      </span>
                    )
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0"></span>
                  )}
                  <span
                    className={`${
                      progressStep >= 5
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    Phân bổ vai trò &amp; Đơn vị thực hiện ({workflow.participatingRoles.length} vai trò)
                  </span>
                </div>

                {/* 6. Khởi tạo công việc */}
                <div className="flex items-center gap-3 text-xs">
                  {progressStep >= 6 ? (
                    progressStep === 6 ? (
                      <span className="material-symbols-outlined text-[20px] text-[#004ac6] animate-spin shrink-0">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                        check_circle
                      </span>
                    )
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0"></span>
                  )}
                  <span
                    className={`${
                      progressStep >= 6
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    Khởi tạo danh mục công việc &amp; Kích hoạt AI hỗ trợ từng bước
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* GIAI ĐOẠN 2: KẾT QUẢ XÁC ĐỊNH QUY TRÌNH (REVIEW & XÁC NHẬN)        */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {phase === 'ready' && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. THẺ TỔNG QUAN QUY TRÌNH ĐƯỢC ĐỀ XUẤT */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-200/90 shadow-2xs">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-label-technical">
                        KẾT QUẢ KHỚP NỐI QUY TRÌNH TỰ ĐỘNG
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">bolt</span>
                        AI ĐÃ NGẦM XỬ LÝ TRƯỚC
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {workflow.name}
                    </h3>
                    <p className="text-xs text-[#004ac6] font-semibold mt-0.5">
                      Mã quy trình: {workflow.code} • {workflow.version}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    Khớp 100% Loại đơn
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Loại đơn xác nhận:</span>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                      {loaiDonConfirmed}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Số bước xử lý:</span>
                    <span className="font-bold text-slate-800 mt-0.5 inline-block">
                      {workflow.totalSteps} bước tuần tự
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Thời gian dự kiến:</span>
                    <span className="font-bold text-slate-800 mt-0.5 inline-block">
                      ~28 ngày làm việc
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Vai trò tham gia:</span>
                    <span className="font-bold text-slate-800 mt-0.5 inline-block">
                      {workflow.participatingRoles.length} vai trò phối hợp
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-white/80 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#004ac6]">Căn cứ xác định: </strong>
                  <span>{workflow.selectionBasis}</span>
                </div>
              </div>

              {/* 2. HIỂN THỊ QUY TRÌNH DẠNG FLOW TRỰC QUAN */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span>
                    SƠ ĐỒ TIẾN TRÌNH CÁC BƯỚC XỬ LÝ (FLOW PIPELINE)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Bước 1 đã hoàn tất • Bước 2 đang kích hoạt
                  </span>
                </div>

                {/* Horizontal Flow Container */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 overflow-x-auto">
                  <div className="flex items-center gap-2 min-w-[780px]">
                    {workflow.steps.map((step, idx) => {
                      const isCompleted = step.status === 'completed';
                      const isActive = step.status === 'active';

                      return (
                        <React.Fragment key={step.id}>
                          {/* Step Card */}
                          <div
                            className={`flex-1 p-3 rounded-xl border transition-all relative ${
                              isActive
                                ? 'bg-blue-50/90 border-[#004ac6] shadow-sm ring-2 ring-blue-500/20'
                                : isCompleted
                                ? 'bg-emerald-50/70 border-emerald-200 text-slate-700'
                                : 'bg-white border-slate-200 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-[#004ac6] text-white'
                                    : isCompleted
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isCompleted ? '✓' : step.stepNumber}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-label-technical ${
                                  isActive
                                    ? 'bg-blue-200/70 text-[#004ac6]'
                                    : isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {isActive
                                  ? 'Đang thực hiện'
                                  : isCompleted
                                  ? 'Đã xong'
                                  : 'Chờ'}
                              </span>
                            </div>

                            <div className="font-bold text-[12px] text-slate-900 line-clamp-1">
                              {step.name}
                            </div>
                            <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-1">
                              {step.responsibleRole}
                            </div>
                          </div>

                          {/* Arrow connector */}
                          {idx < workflow.steps.length - 1 && (
                            <span className="material-symbols-outlined text-slate-300 text-[18px] shrink-0">
                              arrow_forward
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. AI HỖ TRỢ XỬ LÝ & THIẾT LẬP CÔNG VIỆC */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    </div>
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-tight">
                      AI HỖ TRỢ THIẾT LẬP CÔNG VIỆC TẠI BƯỚC 2
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    AI ĐỀ XUẤT (Cần cán bộ kiểm tra)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5">
                    <span className="font-bold text-slate-900 block flex items-center gap-1 text-[11.5px]">
                      <span className="material-symbols-outlined text-[15px] text-blue-600">checklist</span>
                      Tài liệu cần ưu tiên kiểm tra:
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11.5px] pl-4 list-disc">
                      <li>Đối soát Hợp đồng góp vốn số 14/2024 với mẫu dấu Công ty X.</li>
                      <li>Xác thực mã ủy nhiệm chi chuyển tiền 3.5 tỷ VNĐ tại ngân hàng.</li>
                      <li>Kiểm tra tính pháp lý giấy ủy quyền của Luật sư đại diện.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-100/80 space-y-1.5">
                    <span className="font-bold text-slate-900 block flex items-center gap-1 text-[11.5px]">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">person_check</span>
                      Đơn vị &amp; Cán bộ được phân công:
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11.5px] pl-4 list-disc">
                      <li><strong>Nguyễn Minh Anh:</strong> Kiểm tra chứng cứ &amp; lập phiếu thụ lý.</li>
                      <li><strong>Đội ĐT Kinh tế (PC03):</strong> Chuẩn bị tiếp nhận xác minh.</li>
                      <li><strong>Hạn hoàn thành bước 2:</strong> 18/09/2026 (Trong 48 giờ).</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 4. AI PHÁT HIỆN THÔNG TIN CÒN THIẾU */}
              {workflow.potentialMissingInfo.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">
                        warning
                      </span>
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-tight">
                        AI PHÁT HIỆN THÔNG TIN CÒN THIẾU TRONG HỒ SƠ
                      </h4>
                    </div>
                    <span className="text-[10.5px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {workflow.potentialMissingInfo.length} điểm cần lưu ý
                    </span>
                  </div>

                  <div className="space-y-2">
                    {workflow.potentialMissingInfo.map((miss) => (
                      <div
                        key={miss.id}
                        className="p-3 rounded-xl bg-white border border-amber-200/70 text-xs flex items-start gap-2.5"
                      >
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0 uppercase">
                          {miss.impactLevel === 'high' ? 'Quan trọng' : 'Cần bổ sung'}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="font-bold text-slate-900">{miss.title}</div>
                          <p className="text-slate-600 text-[11.5px] leading-relaxed">
                            {miss.description}
                          </p>
                          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                            <span>
                              <strong>Đề xuất: </strong> {miss.suggestedAction}
                            </span>
                            <span className="italic text-amber-900/80">
                              Nguồn: {miss.aiSource}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-amber-800 italic pt-1">
                    * Lưu ý: Các phát hiện của AI chỉ mang tính hỗ trợ chuẩn bị, không tự động kết luận hồ sơ không hợp lệ.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* FOOTER ACTIONS                                                      */}
        {/* =================================================================== */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {phase === 'ready' && (
              <span className="text-xs text-slate-500 font-medium">
                Đơn sẽ được chuyển sang trạng thái <strong>ĐANG XỬ LÝ</strong> sau khi xác nhận.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {phase === 'ready' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                >
                  Xem lại hồ sơ
                </button>

                <button
                  type="button"
                  onClick={() => onConfirmAndEnterProcess(workflow)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#004ac6] hover:bg-[#003da8] shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <span>Xác nhận &amp; Bắt đầu quy trình xử lý đơn</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
