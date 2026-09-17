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
  const [phase, setPhase] = useState<'initializing' | 'ready'>('ready');
  const [progressStep, setProgressStep] = useState<number>(7);

  useEffect(() => {
    if (!isOpen) return;
    setPhase('ready');
    setProgressStep(7);
  }, [isOpen, loaiDonConfirmed, workflow]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">
                account_tree
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight font-headline-md">
                  Quy trình xử lý được đề xuất
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eff8ff] text-[#004ac6] border border-[#b2ddff]">
                  {donCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Xác lập theo Loại đơn đã xác nhận: "{loaiDonConfirmed}"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* BODY MODAL                                                          */}
        {/* =================================================================== */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ───────────────────────────────────────────────────────────────── */}
          {/* GIAI ĐOẠN 2: KẾT QUẢ XÁC ĐỊNH QUY TRÌNH (REVIEW & XÁC NHẬN)        */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="space-y-5 animate-fade-in">
            {/* 1. THẺ TỔNG QUAN QUY TRÌNH ĐƯỢC ĐỀ XUẤT */}
            <div className="p-5 rounded-2xl bg-white border border-blue-200/90 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-label-technical">
                      KẾT QUẢ KHỚP NỐI QUY TRÌNH TỰ ĐỘNG
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#f4ebff] text-[#6941c6] border border-[#e9d7fe] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">bolt</span>
                      <span>AI ĐÃ NGẦM XỬ LÝ TRƯỚC</span>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 tracking-tight">
                    {workflow.name}
                  </h3>
                  <p className="text-xs text-[#004ac6] font-semibold mt-0.5">
                    Mã quy trình: {workflow.code} • {workflow.version}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ecfdf3] text-[#027a48] border border-[#abefc6] shrink-0">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Khớp 100% Loại đơn</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Loại đơn xác nhận:</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 inline-block mt-1 text-xs">
                    {loaiDonConfirmed}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Số bước xử lý:</span>
                  <span className="font-bold text-slate-800 mt-1 inline-block">
                    {workflow.totalSteps} bước tuần tự
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Thời gian dự kiến:</span>
                  <span className="font-bold text-slate-800 mt-1 inline-block">
                    ~28 ngày làm việc
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Vai trò tham gia:</span>
                  <span className="font-bold text-slate-800 mt-1 inline-block">
                    {workflow.participatingRoles.length} vai trò phối hợp
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-blue-100 text-xs text-slate-700 leading-relaxed">
                <strong className="text-[#004ac6] font-bold">Căn cứ xác định: </strong>
                <span>{workflow.selectionBasis}</span>
              </div>
            </div>

            {/* 2. HIỂN THỊ QUY TRÌNH DẠNG FLOW TRỰC QUAN */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span>
                  <span>SƠ ĐỒ TIẾN TRÌNH CÁC BƯỚC XỬ LÝ (FLOW PIPELINE)</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  Bước 1 đã hoàn tất • Bước 2 đang kích hoạt
                </span>
              </div>

              {/* Horizontal Flow Container */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 overflow-x-auto shadow-2xs">
                <div className="flex items-center justify-between gap-1.5 min-w-[740px]">
                  {workflow.steps.map((step, idx) => {
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';

                    return (
                      <React.Fragment key={step.id}>
                        {/* Step Card */}
                        <div
                          title={`${step.name} (${step.responsibleRole})`}
                          className={`w-[96px] h-[96px] p-2.5 rounded-xl border flex flex-col justify-between transition-all shrink-0 ${isActive
                              ? 'bg-[#eff8ff]/80 border-2 border-[#1570ef] shadow-2xs ring-2 ring-blue-100'
                              : isCompleted
                                ? 'bg-[#ecfdf3]/70 border border-[#a6f4c5]'
                                : 'bg-white border-slate-200'
                            }`}
                        >
                          {/* Badge top */}
                          <div>
                            {isCompleted ? (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#d1fadf] text-[#027a48] text-[9.5px] font-bold w-fit">
                                <span className="material-symbols-outlined text-[12px]">check</span>
                                <span>Đã xong</span>
                              </div>
                            ) : isActive ? (
                              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-blue-100 text-[#1570ef] text-[9px] font-bold w-fit">
                                <span className="w-3.5 h-3.5 rounded-xs bg-[#1570ef] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                  2
                                </span>
                                <div className="flex flex-col leading-tight text-[8px] font-bold text-left">
                                  <span>Đang</span>
                                  <span>thực hiện</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[9.5px] font-bold border border-slate-200">
                                  {step.stepNumber}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium px-1 rounded bg-slate-50 border border-slate-100">
                                  Chờ
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Truncated step labels */}
                          <div>
                            <div className="font-bold text-[11.5px] text-slate-900 truncate">
                              {step.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {step.responsibleRole}
                            </div>
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
            <div className="p-4 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/20 via-white to-purple-50/20 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#53389e] text-white flex items-center justify-center shadow-2xs">
                    <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    AI HỖ TRỢ THIẾT LẬP CÔNG VIỆC TẠI BƯỚC 2
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#eff8ff] text-[#175cd3] border border-[#b2ddff]">
                  AI ĐỀ XUẤT (Cần cán bộ kiểm tra)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Box 1: Tài liệu cần ưu tiên kiểm tra */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">playlist_add_check</span>
                    <span>Tài liệu cần ưu tiên kiểm tra:</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 text-[11.5px] pl-1 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>Đối soát Hợp đồng góp vốn số 14/2024 với mẫu dấu Công ty X.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>Xác thực mã ủy nhiệm chi chuyển tiền 3.5 tỷ VNĐ tại ngân hàng.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>Kiểm tra tính pháp lý giấy ủy quyền của Luật sư đại diện.</span>
                    </li>
                  </ul>
                </div>

                {/* Box 2: Đơn vị & Cán bộ được phân công */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">group</span>
                    <span>Đơn vị &amp; Cán bộ được phân công:</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 text-[11.5px] pl-1 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span><strong>Nguyễn Minh Anh:</strong> Kiểm tra chứng cứ &amp; lập phiếu thụ lý.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span><strong>Đội ĐT Kinh tế (PC03):</strong> Chuẩn bị tiếp nhận xác minh.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span><strong>Hạn hoàn thành bước 2:</strong> 18/09/2026 (Trong 48 giờ).</span>
                    </li>
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
        </div>

        {/* =================================================================== */}
        {/* FOOTER ACTIONS                                                      */}
        {/* =================================================================== */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">
              Đơn sẽ được chuyển sang trạng thái <strong className="text-slate-900">ĐANG XỬ LÝ</strong> sau khi xác nhận.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
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
          </div>
        </div>
      </div>
    </div>
  );
}
