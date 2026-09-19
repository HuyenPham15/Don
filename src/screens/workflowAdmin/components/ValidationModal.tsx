// src/screens/workflowAdmin/components/ValidationModal.tsx
import React from 'react';
import { ValidationIssue } from '../../../types/workflowConfig';

interface ValidationModalProps {
  issues: ValidationIssue[];
  isOpen: boolean;
  onClose: () => void;
  onFocusTarget: (targetType: 'step' | 'transition' | 'general', targetId?: string) => void;
}

export default function ValidationModal({
  issues,
  isOpen,
  onClose,
  onFocusTarget,
}: ValidationModalProps) {
  if (!isOpen) return null;

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const isValid = errors.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isValid ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isValid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <span className="material-symbols-outlined text-[22px]">
                {isValid ? 'check_circle' : 'warning'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {isValid ? 'Quy trình hợp lệ & Sẵn sàng phát hành' : 'Kết quả kiểm chứng quy trình'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isValid
                  ? 'Tất cả 8 tiêu chuẩn nghiệp vụ bắt buộc đều đạt yêu cầu.'
                  : `Phát hiện ${errors.length} lỗi bắt buộc và ${warnings.length} cảnh báo cần lưu ý.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Checklist Summary Card */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span>Điểm bắt đầu &amp; kết thúc</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span>Kiểm tra bước cô lập</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span>Connector &amp; luồng chuyển</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span>Điều kiện logic AND/OR</span>
            </div>
          </div>

          {/* List of Issues */}
          {issues.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Chi tiết các vấn đề cần xử lý
                </span>
                <span className="text-[11px] text-blue-600 font-medium italic">
                  * Nhấp vào lỗi để định vị trực tiếp trên canvas
                </span>
              </div>

              {issues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => {
                    onFocusTarget(issue.targetType, issue.targetId);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${
                    issue.severity === 'error'
                      ? 'bg-rose-50/50 hover:bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-amber-50/50 hover:bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                      issue.severity === 'error' ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  >
                    {issue.severity === 'error' ? 'cancel' : 'info'}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          issue.severity === 'error'
                            ? 'bg-rose-200 text-rose-800'
                            : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {issue.severity === 'error' ? 'Lỗi' : 'Cảnh báo'}
                      </span>
                      <span className="text-[10.5px] text-slate-500 font-mono">
                        {issue.targetType === 'step'
                          ? 'Đối tượng: Bước xử lý'
                          : issue.targetType === 'transition'
                          ? 'Đối tượng: Đường chuyển'
                          : 'Cấu hình chung'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold mt-1 leading-snug">{issue.message}</p>
                    {issue.hint && (
                      <p className="text-[11px] text-slate-500 mt-0.5 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lightbulb</span>
                        Gợi ý: {issue.hint}
                      </p>
                    )}
                  </div>

                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600 shrink-0 mt-1">
                    my_location
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-[48px] text-emerald-500 block">
                task_alt
              </span>
              <p className="text-sm font-bold text-slate-900">Quy trình đạt chuẩn 100%</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Không có bước cô lập, các connector và điều kiện logic đều hợp lệ. Bạn có thể tiến hành phát hành phiên bản này.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Hệ thống kiểm chứng tự động GOVEX Rule Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
