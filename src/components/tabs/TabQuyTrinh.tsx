import React, { useState } from 'react';
import { DonDetail, Screen } from '../../types';
import { WorkflowDefinition, TaskItem } from '../../types/workflow';
import SwimlaneWorkflowDiagram from '../workflow/SwimlaneWorkflowDiagram';
import QuyTrinhSuggestedActions from '../workflow/QuyTrinhSuggestedActions';
import ChuyenQuyTrinhModal from '../workflow/ChuyenQuyTrinhModal';

export interface TabQuyTrinhProps {
  currentDon: DonDetail;
  workflow: WorkflowDefinition;
  activeStepNumber: number;
  onNav: (s: Screen) => void;
  onOpenXacMinh?: () => void;
  onOpenBoSung?: () => void;
  onOpenBuocTiepTheo?: () => void;
  onStepChange?: (stepNumber: number) => void;
  onWorkflowChange?: (newLoaiDon: string, newWorkflow: WorkflowDefinition, reason: string) => void;
  onViewDocument?: (docInfo: {
    tenVanBan: string;
    soHieu?: string;
    loai?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
  }) => void;
}

export default function TabQuyTrinh({
  currentDon,
  workflow,
  activeStepNumber,
  onNav,
  onOpenXacMinh,
  onOpenBoSung,
  onOpenBuocTiepTheo,
  onStepChange,
  onWorkflowChange,
  onViewDocument,
}: TabQuyTrinhProps) {
  // Sub-view mode: 'swimlane' | 'timeline' | 'actions'
  const [viewMode, setViewMode] = useState<'swimlane' | 'timeline' | 'actions'>('swimlane');
  const [showChuyenQuyTrinhModal, setShowChuyenQuyTrinhModal] = useState<boolean>(false);
  const [selectedStepFilter, setSelectedStepFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Local task checklist state initialized from workflow.defaultTasks
  const [tasks, setTasks] = useState<TaskItem[]>(() => workflow.defaultTasks || []);

  const totalEstDays = workflow.steps.reduce((acc, s) => acc + (s.estimatedDays || 0), 0);
  const currentStepObj =
    workflow.steps.find((s) => s.stepNumber === activeStepNumber) ||
    workflow.steps.find((s) => s.stepNumber === 2) ||
    workflow.steps[0];

  const progressPercent = Math.min(
    100,
    Math.round(((activeStepNumber - 0.5) / workflow.steps.length) * 100)
  );

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'in_progress' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Determine initial workflow type for Swimlane diagram
  const getSwimlaneType = () => {
    const loai = (currentDon.loaiDon || '').toLowerCase();
    if (loai.includes('khiếu nại')) return 'khieu-nai';
    if (loai.includes('tố giác') || loai.includes('tin báo')) return 'to-giac';
    if (loai.includes('khởi kiện') || loai.includes('dân sự')) return 'khoi-kien';
    return 'to-cao-govex';
  };

  return (
    <div className="space-y-6">

      {viewMode === 'swimlane' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden min-h-[680px] h-[720px] flex flex-col">
          <SwimlaneWorkflowDiagram
            initialWorkflowType={getSwimlaneType()}
            donCode={currentDon.code}
            donTitle={currentDon.title}
            nguoiNop={currentDon.nguoiNop}
            onViewDocument={onViewDocument}
          />
        </div>
      )}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          {/* Step Filter Bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedStepFilter('all')}
                className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${selectedStepFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-800 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                Tất cả các bước ({workflow.steps.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStepFilter('active')}
                className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${selectedStepFilter === 'active'
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                Bước hiện tại (Bước {activeStepNumber})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStepFilter('completed')}
                className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${selectedStepFilter === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                Đã hoàn thành ({Math.max(0, activeStepNumber - 1)})
              </button>
            </div>
            <span className="text-slate-400 font-normal">
              Có thể đánh dấu hoàn thành nhiệm vụ để cập nhật tiến độ
            </span>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {workflow.steps
              .filter((step) => {
                if (selectedStepFilter === 'active') return step.stepNumber === activeStepNumber;
                if (selectedStepFilter === 'completed') return step.stepNumber < activeStepNumber;
                return true;
              })
              .map((step) => {
                const isCompleted = step.stepNumber < activeStepNumber;
                const isActive = step.stepNumber === activeStepNumber;
                const stepTasks = tasks.filter((t) => t.stepId === step.id);

                return (
                  <div
                    key={step.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${isActive
                      ? 'border-blue-400 shadow-md ring-2 ring-blue-100'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                  >
                    {/* Step Card Header */}
                    <div className="p-4 md:p-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                          {isCompleted ? '✓' : step.stepNumber}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base font-headline-sm">
                              Bước {step.stepNumber}: {step.name}
                            </h3>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] animate-pulse">
                                Đang thực hiện
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                Đã hoàn thành
                              </span>
                            )}
                            {!isActive && !isCompleted && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                                Chờ thực hiện
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <span className="material-symbols-outlined text-[14px] text-blue-600">badge</span>
                              {step.responsibleRole}
                            </span>
                            {step.responsibleUnit && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-slate-400">domain</span>
                                  {step.responsibleUnit}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1 text-indigo-700 font-medium">
                              <span className="material-symbols-outlined text-[14px]">timer</span>
                              Thời hạn: ~{step.estimatedDays} ngày làm việc
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick action for this step */}
                      {isActive && onOpenBuocTiepTheo && (
                        <button
                          type="button"
                          onClick={onOpenBuocTiepTheo}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">task_alt</span>
                          <span>Xử lý bước này</span>
                        </button>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="p-4 md:p-5 space-y-4">
                      {/* Description & Transfer condition */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-1">Mô tả nghiệp vụ:</span>
                          <p className="text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                        {step.transferCondition && (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                            <span className="font-bold block mb-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-amber-700">rule</span>
                              Điều kiện chuyển giao bước tiếp theo:
                            </span>
                            <p className="text-amber-800 leading-relaxed">{step.transferCondition}</p>
                          </div>
                        )}
                      </div>

                      {/* Tasks Checklist for this Step */}
                      {stepTasks.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-label-technical">
                            Danh mục công việc cần hoàn thành ({stepTasks.filter((t) => t.status === 'completed').length}/{stepTasks.length}):
                          </span>
                          <div className="space-y-2">
                            {stepTasks.map((t) => {
                              const isTaskDone = t.status === 'completed';
                              return (
                                <div
                                  key={t.id}
                                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${isTaskDone
                                    ? 'bg-slate-50/80 border-slate-200 text-slate-500'
                                    : 'bg-white border-blue-100 hover:border-blue-300 text-slate-800'
                                    }`}
                                >
                                  <label className="flex items-start gap-2.5 cursor-pointer select-none flex-1">
                                    <input
                                      type="checkbox"
                                      checked={isTaskDone}
                                      onChange={() => handleToggleTask(t.id)}
                                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                                    />
                                    <div className="space-y-1">
                                      <span className={`font-semibold block ${isTaskDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                        {t.title}
                                      </span>
                                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                        <span>Phụ trách: <strong>{t.assignedTo}</strong></span>
                                        <span>•</span>
                                        <span>Hạn: <span className="font-semibold text-rose-600">{t.deadline}</span></span>
                                      </div>
                                    </div>
                                  </label>

                                  {t.aiAssistance?.summary && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium text-[10px] shrink-0 border border-indigo-200">
                                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                      AI hỗ trợ
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-VIEW 3: SUGGESTED ACTIONS FROM AI                                   */}
      {/* ========================================================================= */}
      {viewMode === 'actions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <QuyTrinhSuggestedActions
            loaiDon={currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
            donCode={currentDon.code}
            currentNguoiGui={currentDon.nguoiNop}
            onActionSuccess={(title) => {
              // Action successfully created
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CHUYỂN ĐỔI QUY TRÌNH (KHI CÁN BỘ ĐỔI LOẠI ĐƠN)                     */}
      {/* ========================================================================= */}
      <ChuyenQuyTrinhModal
        isOpen={showChuyenQuyTrinhModal}
        onClose={() => setShowChuyenQuyTrinhModal(false)}
        currentLoaiDon={currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
        currentWorkflow={workflow}
        onConfirmChange={(newLoaiDon, newWorkflow, reason) => {
          setShowChuyenQuyTrinhModal(false);
          onWorkflowChange?.(newLoaiDon, newWorkflow, reason);
        }}
      />
    </div>
  );
}
