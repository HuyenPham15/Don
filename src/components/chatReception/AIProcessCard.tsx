// src/components/chatReception/AIProcessCard.tsx
import React from 'react';
import { ProcessStepItem } from '../../types/receptionChat';

interface AIProcessCardProps {
  steps: ProcessStepItem[];
  isCompletedAll?: boolean;
}

export default function AIProcessCard({ steps }: AIProcessCardProps) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const totalCount = steps.length;
  const isAllDone = completedCount === totalCount;
  const activeStep = steps.find((s) => s.status === 'processing');

  return (
    <div className="max-w-2xl w-full bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden animate-fade-in my-1">
      {/* Header Process Card */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-[#004ac6] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Tiến trình xử lý nghiệp vụ tự động
            </h4>
            <p className="text-[10.5px] text-slate-500">
              AI bóc tách tài liệu và khởi tạo hồ sơ tiếp nhận theo chuẩn quy trình
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold font-mono text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            {completedCount}/{totalCount} bước
          </span>
          {isAllDone ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="material-symbols-outlined text-[14px]">check</span>
              Hoàn tất
            </span>
          ) : activeStep ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              Đang xử lý
            </span>
          ) : null}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        ></div>
      </div>

      {/* Danh sách 7 bước */}
      <div className="p-4 space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'processing';
          const isPending = step.status === 'pending';
          const isError = step.status === 'error';

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-2 rounded-xl transition-colors ${
                isRunning
                  ? 'bg-blue-50/60 border border-blue-100 shadow-2xs'
                  : isError
                  ? 'bg-rose-50/60 border border-rose-100'
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* Icon chỉ báo trạng thái */}
              <div className="pt-0.5 shrink-0">
                {isDone && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                  </div>
                )}
                {isRunning && (
                  <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-600 border-t-transparent animate-spin flex items-center justify-center"></div>
                )}
                {isPending && (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  </div>
                )}
                {isError && (
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[13px] font-bold">priority_high</span>
                  </div>
                )}
              </div>

              {/* Tên bước & mô tả */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      0{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isDone
                          ? 'text-slate-800'
                          : isRunning
                          ? 'text-blue-900 font-bold'
                          : isError
                          ? 'text-rose-900 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {/* Badge phụ */}
                  {isDone && (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-mono">
                      ✓ Đạt
                    </span>
                  )}
                  {isRunning && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded animate-pulse">
                      Đang chạy...
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-slate-400">Chờ</span>
                  )}
                </div>

                {step.description && (
                  <p
                    className={`text-[11px] mt-0.5 leading-relaxed ${
                      isDone
                        ? 'text-slate-500'
                        : isRunning
                        ? 'text-blue-700 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.description}
                  </p>
                )}

                {/* Nếu có thông báo lỗi */}
                {isError && step.errorMsg && (
                  <div className="mt-1 p-2 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    <span>{step.errorMsg}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
