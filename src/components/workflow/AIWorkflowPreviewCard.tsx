import React, { useState } from 'react';
import { matchWorkflowByLoaiDon } from '../../constants/workflows';
import { WorkflowStepItem } from '../../types/workflow';

interface AIWorkflowPreviewCardProps {
  loaiDon: string;
  onOpenFullWorkflow?: () => void;
  onSelectLoaiDon?: (loaiDon: string) => void;
  isCompact?: boolean;
}

export default function AIWorkflowPreviewCard({
  loaiDon,
  onOpenFullWorkflow,
  onSelectLoaiDon,
}: AIWorkflowPreviewCardProps) {
  const workflow = matchWorkflowByLoaiDon(loaiDon);
  const [selectedStep, setSelectedStep] = useState<WorkflowStepItem>(
    workflow.steps.find((s) => s.status === 'active') || workflow.steps[0]
  );

  // Sync selectedStep when workflow changes
  React.useEffect(() => {
    setSelectedStep(workflow.steps.find((s) => s.status === 'active') || workflow.steps[0]);
  }, [workflow.id]);

  // Find task specifically relevant to selected step (or fallback to primary task)
  const currentTask =
    workflow.defaultTasks.find((t) => t.stepId === selectedStep.id) ||
    workflow.defaultTasks[0];

  return (
    <div className="rounded-2xl border border-blue-200/90 bg-white p-4 shadow-2xs space-y-3 transition-all">
      {/* 1. COMPACT UNIFIED HEADER & LOAI DON CHIPS */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-2.5 border-b border-slate-100">
        {/* Left: Workflow Title & Badges */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                Quy trình AI: <span className="text-[#004ac6]">{workflow.name}</span>
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-label-technical">
                {workflow.code}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-[#004ac6] border border-blue-200">
                {workflow.totalSteps} bước
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {workflow.defaultTasks.length} nhiệm vụ AI
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Loai Don Switcher */}
        {onSelectLoaiDon && (
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            {[
              { label: 'Đơn tố giác về tội phạm', short: 'Tố giác (7 bước)', color: 'rose' },
              { label: 'Đơn khiếu nại (Lần 1)', short: 'Khiếu nại (6 bước)', color: 'amber' },
              { label: 'Đơn tố cáo', short: 'Tố cáo (6 bước)', color: 'purple' },
              { label: 'Đơn phản ánh, kiến nghị', short: 'Kiến nghị (4 bước)', color: 'blue' },
            ].map((item) => {
              const isCurrent =
                workflow.matchedLoaiDon.some((m) => m.toLowerCase() === item.label.toLowerCase()) ||
                loaiDon.toLowerCase().includes(item.label.toLowerCase().slice(4, 11));

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onSelectLoaiDon(item.label)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-medium ${isCurrent
                    ? 'bg-white text-[#004ac6] shadow-2xs font-bold border border-blue-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${item.color === 'rose'
                      ? 'bg-rose-500'
                      : item.color === 'amber'
                        ? 'bg-amber-500'
                        : item.color === 'purple'
                          ? 'bg-purple-500'
                          : 'bg-blue-500'
                      }`}
                  ></span>
                  <span>{item.short}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Full view button */}
        {onOpenFullWorkflow && (
          <button
            type="button"
            onClick={onOpenFullWorkflow}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004ac6] text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <span>Chi tiết quy trình</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        )}
      </div>

      {/* 2. HORIZONTAL STEPPER TIMELINE (SLEEK & CLEAN) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#004ac6]">linear_scale</span>
            Tiến trình các bước thực hiện:
          </span>
          <span className="text-[11px] text-slate-400">
            Đang xem: <strong className="text-[#004ac6]">Bước {selectedStep.stepNumber} - {selectedStep.name}</strong>
          </span>
        </div>

        <div className="overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-1.5 min-w-max">
            {workflow.steps.map((step, idx) => {
              const isSelected = selectedStep.id === step.id;
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedStep(step)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${isSelected
                      ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-2xs'
                      : isCompleted
                        ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100/60'
                        : isActive
                          ? 'bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100/50'
                          : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white'
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 ${isSelected
                        ? 'bg-white text-[#004ac6]'
                        : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[13px]">check</span>
                      ) : (
                        step.stepNumber
                      )}
                    </div>
                    <div className="min-w-0 pr-1">
                      <span className="text-xs font-bold truncate max-w-[150px] block leading-tight">
                        {step.name}
                      </span>
                      <span
                        className={`text-[10px] block leading-tight mt-0.5 truncate max-w-[150px] ${isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                      >
                        {step.estimatedDays} ngày • {step.responsibleUnit ? step.responsibleUnit.slice(0, 16) : 'Cán bộ'}
                      </span>
                    </div>
                  </button>

                  {idx < workflow.steps.length - 1 && (
                    <span className="text-slate-300 text-xs px-0.5 select-none">›</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CONSOLIDATED COMPACT VIEW: STEP DETAIL (LEFT) + AI AUTOMATED TASK (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
        {/* LEFT (7 COLS): CHI TIẾT BƯỚC ĐANG CHỌN */}
        <div className="lg:col-span-7 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-xs">
                {selectedStep.stepNumber}
              </span>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                Bước {selectedStep.stepNumber}: {selectedStep.name}
              </h4>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedStep.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : selectedStep.status === 'active'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
              >
                {selectedStep.status === 'completed'
                  ? '✓ Đã hoàn thành'
                  : selectedStep.status === 'active'
                    ? '● Đang thực hiện'
                    : '○ Chờ tiếp nhận'}
              </span>
              <span className="text-[10.5px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-label-technical">
                Hạn: {selectedStep.estimatedDays} ngày
              </span>
            </div>
          </div>

          <div className="text-[11.5px] text-slate-600 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#004ac6] shrink-0">badge</span>
            <span>
              <strong className="text-slate-800">Phụ trách: </strong>
              {selectedStep.responsibleRole} {selectedStep.responsibleUnit && `(${selectedStep.responsibleUnit})`}
            </span>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60">
            <strong className="text-slate-800">Tác nghiệp: </strong>
            {selectedStep.description}
          </div>

          {selectedStep.transferCondition && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="material-symbols-outlined text-[15px] text-amber-600 shrink-0">task_alt</span>
              <span>
                <strong className="text-slate-700">Điều kiện chuyển tiếp: </strong>
                {selectedStep.transferCondition}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT (5 COLS): NHIỆM VỤ AI TỰ ĐỘNG CHO BƯỚC NÀY & CĂN CỨ AI */}
        <div className="lg:col-span-5 p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-200/70 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-tight flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-indigo-600">smart_toy</span>
                Nhiệm vụ AI tự động ({currentTask ? 'Bước này' : 'Toàn quy trình'})
              </span>
              {currentTask && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold ${currentTask.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentTask.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                    }`}
                >
                  {currentTask.status === 'completed'
                    ? 'Đã xong'
                    : currentTask.status === 'in_progress'
                      ? 'Đang làm'
                      : 'Chờ'}
                </span>
              )}
            </div>

            {currentTask ? (
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100/90 shadow-2xs space-y-1.5">
                <div className="text-xs font-bold text-slate-800 leading-snug">
                  {currentTask.title}
                </div>
                {currentTask.aiAssistance?.summary && (
                  <p className="text-[11px] text-indigo-950 bg-indigo-50/60 p-2 rounded border border-indigo-100 leading-relaxed">
                    <strong className="text-indigo-700">AI Hỗ trợ: </strong>
                    {currentTask.aiAssistance.summary}
                  </p>
                )}
                <div className="text-[10px] text-slate-400 flex items-center justify-between font-label-technical">
                  <span>{currentTask.assignedRole}</span>
                  <span>{currentTask.deadline}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-3 text-center">
                Không có nhiệm vụ AI bắt buộc tại bước này.
              </div>
            )}
          </div>

          {/* Căn cứ kích hoạt gọn gàng */}
          <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-indigo-100/70 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-indigo-600 shrink-0 mt-0.5">psychology</span>
            <span className="line-clamp-2 leading-relaxed">
              <strong className="text-indigo-950">Căn cứ AI: </strong>
              {workflow.selectionBasis.replace(/^Dựa trên:\s*/, '')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
