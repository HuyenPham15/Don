// src/screens/workflowAdmin/components/StepPropertiesPanel.tsx
import React, { useState } from 'react';
import {
  ProcessStep,
  ProcessLane,
  ProcessStage,
  WorkflowAction,
  WorkflowActionType,
  AICapability,
  RealDocumentEntity,
} from '../../../types/workflowConfig';
import {
  getStandardStepTemplate,
  resetStepToStandard,
  resetStepSectionToStandard,
} from '../registry/workflowComponentRegistry';
import { INITIAL_RECORD_DOCUMENTS } from '../../../constants/processWorkflows';

interface StepPropertiesPanelProps {
  step: ProcessStep;
  lanes: ProcessLane[];
  stages: ProcessStage[];
  allSteps?: ProcessStep[];
  onUpdateStep: (updated: ProcessStep) => void;
  onDeleteStep: (stepId: string) => void;
  onClose: () => void;
}

const ACTION_TYPE_LABELS: Record<WorkflowActionType, { label: string; color: string }> = {
  COMPLETE: { label: 'Hoàn tất bước', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  TRANSFER: { label: 'Chuyển xử lý', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  RETURN: { label: 'Trả lại hồ sơ', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  REQUEST_INFO: { label: 'Yêu cầu bổ sung', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  APPROVE: { label: 'Phê duyệt', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  REJECT: { label: 'Từ chối', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  REVISE: { label: 'Yêu cầu chỉnh sửa', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  ESCALATE: { label: 'Chuyển cấp thẩm quyền', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
};

function InheritBadge({ isOverridden }: { isOverridden?: boolean }) {
  if (isOverridden) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Tùy chỉnh riêng
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
      Mặc định
    </span>
  );
}

interface RevertModalState {
  isOpen: boolean;
  targetSection: 'ALL' | 'conditions' | 'forms' | 'inputDocs' | 'outputDocs' | 'sla' | 'actions';
  targetTitle: string;
}

export default function StepPropertiesPanel({
  step,
  lanes,
  stages,
  allSteps = [],
  onUpdateStep,
  onDeleteStep,
  onClose,
}: StepPropertiesPanelProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  // Revert confirmation modal
  const [revertModal, setRevertModal] = useState<RevertModalState>({
    isOpen: false,
    targetSection: 'ALL',
    targetTitle: '',
  });

  // Conditions input states
  const [newConditionText, setNewConditionText] = useState('');
  const [editingConditionIdx, setEditingConditionIdx] = useState<number | null>(null);
  const [editConditionText, setEditConditionText] = useState('');

  // Document & Form inputs
  const [newDocText, setNewDocText] = useState('');
  const [newInDocText, setNewInDocText] = useState('');
  const [newFormText, setNewFormText] = useState('');
  const [isSelectRecordDocModalOpen, setIsSelectRecordDocModalOpen] = useState(false);
  const [recordDocSearch, setRecordDocSearch] = useState('');

  // Action creation inline form
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newActionLabel, setNewActionLabel] = useState('');
  const [newActionCode, setNewActionCode] = useState('');
  const [newActionType, setNewActionType] = useState<WorkflowActionType>('COMPLETE');
  const [newActionTargetNode, setNewActionTargetNode] = useState('');

  const nodeType = step.nodeType || (step.isStart ? 'START' : step.isEnd ? 'END' : 'TASK');

  // Standard library template match
  const standardTpl = getStandardStepTemplate(
    nodeType,
    undefined,
    step.inheritedFromId
  );
  const inheritedName = step.inheritedFromName || standardTpl.name;

  // Determine if overall step is overridden
  const isStepOverridden = Boolean(
    step.isCustomized ||
    step.conditionsOverride ||
    step.formsOverride ||
    step.usedDocsOverride ||
    step.inputDocsOverride ||
    step.outputDocsOverride ||
    step.slaOverride ||
    step.actionsOverride
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(step.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Revert handler
  const handleConfirmRevert = () => {
    if (revertModal.targetSection === 'ALL') {
      const reset = resetStepToStandard(step);
      onUpdateStep(reset);
    } else {
      const reset = resetStepSectionToStandard(step, revertModal.targetSection as any);
      onUpdateStep(reset);
    }
    setRevertModal({ isOpen: false, targetSection: 'ALL', targetTitle: '' });
  };

  // Condition handlers
  const currentConditions = step.conditions !== undefined ? step.conditions : standardTpl.defaultConditions;

  const handleAddCondition = () => {
    if (!newConditionText.trim()) return;
    onUpdateStep({
      ...step,
      conditions: [...currentConditions, newConditionText.trim()],
      conditionsOverride: true,
      isCustomized: true,
    });
    setNewConditionText('');
  };

  const handleRemoveCondition = (idx: number) => {
    onUpdateStep({
      ...step,
      conditions: currentConditions.filter((_, i) => i !== idx),
      conditionsOverride: true,
      isCustomized: true,
    });
  };

  const handleStartEditCondition = (idx: number, val: string) => {
    setEditingConditionIdx(idx);
    setEditConditionText(val);
  };

  const handleSaveEditCondition = (idx: number) => {
    if (!editConditionText.trim()) return;
    const next = [...currentConditions];
    next[idx] = editConditionText.trim();
    onUpdateStep({
      ...step,
      conditions: next,
      conditionsOverride: true,
      isCustomized: true,
    });
    setEditingConditionIdx(null);
  };

  // Document handlers
  const handleAddStoredDoc = () => {
    if (!newDocText.trim()) return;
    onUpdateStep({
      ...step,
      storedDocuments: [...step.storedDocuments, newDocText.trim()],
      outputDocsOverride: true,
      isCustomized: true,
    });
    setNewDocText('');
  };

  const handleRemoveStoredDoc = (idx: number) => {
    onUpdateStep({
      ...step,
      storedDocuments: step.storedDocuments.filter((_, i) => i !== idx),
      outputDocsOverride: true,
      isCustomized: true,
    });
  };

  // Tài liệu sử dụng tại bước (tham chiếu xem/nghiên cứu nghiệp vụ, KHÔNG là điều kiện chuyển bước)
  const currentUsedDocs = step.usedDocuments || step.inputDocuments || [];

  const handleAddUsedDocFromRecord = (docEntity: RealDocumentEntity) => {
    if (currentUsedDocs.includes(docEntity.name)) return;
    const updated = [...currentUsedDocs, docEntity.name];
    onUpdateStep({
      ...step,
      usedDocuments: updated,
      inputDocuments: updated,
      usedDocsOverride: true,
      inputDocsOverride: true,
      isCustomized: true,
    });
    setIsSelectRecordDocModalOpen(false);
  };

  const handleAddUsedDocCustom = () => {
    if (!newInDocText.trim()) return;
    const docName = newInDocText.trim();
    if (!currentUsedDocs.includes(docName)) {
      const updated = [...currentUsedDocs, docName];
      onUpdateStep({
        ...step,
        usedDocuments: updated,
        inputDocuments: updated,
        usedDocsOverride: true,
        inputDocsOverride: true,
        isCustomized: true,
      });
    }
    setNewInDocText('');
  };

  const handleRemoveUsedDoc = (idx: number) => {
    const updated = currentUsedDocs.filter((_, i) => i !== idx);
    onUpdateStep({
      ...step,
      usedDocuments: updated,
      inputDocuments: updated,
      usedDocsOverride: true,
      inputDocsOverride: true,
      isCustomized: true,
    });
  };

  const handleAddForm = () => {
    if (!newFormText.trim()) return;
    onUpdateStep({
      ...step,
      stepForms: [...step.stepForms, newFormText.trim()],
      formsOverride: true,
      isCustomized: true,
    });
    setNewFormText('');
  };

  const handleRemoveForm = (idx: number) => {
    onUpdateStep({
      ...step,
      stepForms: step.stepForms.filter((_, i) => i !== idx),
      formsOverride: true,
      isCustomized: true,
    });
  };

  // Action management
  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionLabel.trim()) return;

    const actionCode = (newActionCode.trim() || newActionType).toUpperCase();
    const newAction: WorkflowAction = {
      id: `act-${Date.now()}`,
      code: actionCode,
      label: newActionLabel.trim(),
      type: newActionType,
      targetNodeId: newActionTargetNode || undefined,
    };

    onUpdateStep({
      ...step,
      actions: [...(step.actions || []), newAction],
      actionsOverride: true,
      isCustomized: true,
    });

    setNewActionLabel('');
    setNewActionCode('');
    setNewActionType('COMPLETE');
    setNewActionTargetNode('');
    setIsAddingAction(false);
  };

  const handleDeleteAction = (actionId: string) => {
    onUpdateStep({
      ...step,
      actions: (step.actions || []).filter((a) => a.id !== actionId),
      actionsOverride: true,
      isCustomized: true,
    });
  };

  // AI capabilities toggle
  const handleToggleAICapability = (cap: AICapability) => {
    const currentCaps = step.aiConfig?.capabilities || [];
    const hasCap = currentCaps.includes(cap);
    const updatedCaps = hasCap
      ? currentCaps.filter((c) => c !== cap)
      : [...currentCaps, cap];

    onUpdateStep({
      ...step,
      aiConfig: {
        enabled: step.aiConfig?.enabled ?? true,
        requireUserConfirmation: step.aiConfig?.requireUserConfirmation ?? true,
        promptDescription: step.aiConfig?.promptDescription || '',
        capabilities: updatedCaps,
      },
    });
  };

  const handleToggleAIEnabled = (enabled: boolean) => {
    onUpdateStep({
      ...step,
      aiConfig: {
        enabled,
        capabilities: step.aiConfig?.capabilities || ['OCR', 'EXTRACT'],
        requireUserConfirmation: step.aiConfig?.requireUserConfirmation ?? true,
        promptDescription: step.aiConfig?.promptDescription || '',
      },
    });
  };

  return (
    <aside className="w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 shadow-lg select-none z-20 animate-in slide-in-from-right duration-150">
      {/* 1. Header with Node Type Badge */}
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
              Thuộc tính bước
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">
                Loại: <strong className="text-blue-700">{nodeType}</strong>
              </span>
              <InheritBadge isOverridden={isStepOverridden} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDeleteStep(step.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa bước này"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Đóng panel"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* ============================================================== */}
        {/* SECTION A: THÔNG TIN CHUNG                                     */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
              A. Thông tin chung
            </span>
          </div>

          {/* Tên bước */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tên bước <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={step.name}
              onChange={(e) => onUpdateStep({ ...step, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Mã bước do hệ thống sinh */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-800">
                Mã bước <span className="text-slate-400 font-normal">(Tự sinh)</span>
              </label>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {copiedCode ? 'check' : 'content_copy'}
                </span>
                {copiedCode ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={step.code}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-800 focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Nhóm chịu trách nhiệm (Lane) & Giai đoạn (Stage) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nhóm trách nhiệm
              </label>
              <select
                value={step.laneId}
                onChange={(e) => onUpdateStep({ ...step, laneId: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {lanes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Giai đoạn
              </label>
              <select
                value={step.stageId}
                onChange={(e) => onUpdateStep({ ...step, stageId: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION B: CẤU HÌNH & KẾ THỪA                                  */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                B. Cấu hình
              </span>
            </div>
            <InheritBadge isOverridden={isStepOverridden} />
          </div>

          <div className="p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Đang kế thừa từ:
              </span>
              <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-indigo-600">
                  library_books
                </span>
                <span className="truncate">{inheritedName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
              {!isStepOverridden ? (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStep({
                      ...step,
                      isCustomized: true,
                    });
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  Chỉnh sửa riêng
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setRevertModal({
                      isOpen: true,
                      targetSection: 'ALL',
                      targetTitle: 'toàn bộ cấu hình bước về mặc định chuẩn',
                    })
                  }
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  Khôi phục mặc định
                </button>
              )}

              <span className="text-[10px] text-slate-400 font-mono">
                {step.inheritedFromId || standardTpl.id}
              </span>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION C: ĐIỀU KIỆN (REQUIREMENT 2)                            */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                Điều kiện ({currentConditions.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <InheritBadge isOverridden={step.conditionsOverride} />
              {step.conditionsOverride ? (
                <button
                  type="button"
                  onClick={() =>
                    setRevertModal({
                      isOpen: true,
                      targetSection: 'conditions',
                      targetTitle: 'danh sách Điều kiện nghiệp vụ',
                    })
                  }
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
                  title="Khôi phục danh sách điều kiện chuẩn"
                >
                  <span className="material-symbols-outlined text-[13px]">restart_alt</span>
                  Khôi phục
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateStep({
                      ...step,
                      conditionsOverride: true,
                      isCustomized: true,
                    })
                  }
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                  Chỉnh sửa riêng
                </button>
              )}
            </div>
          </div>

          {/* Sub-indicator */}
          {!step.conditionsOverride && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] font-semibold text-emerald-800">
              <span className="material-symbols-outlined text-emerald-600 text-[15px]">
                verified
              </span>
              <span>Kế thừa cấu hình chuẩn ({currentConditions.length} điều kiện)</span>
            </div>
          )}

          {/* Danh sách điều kiện dạng compact */}
          <div className="space-y-1.5">
            {currentConditions.map((cond, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex items-start justify-between gap-2 text-xs transition-all ${step.conditionsOverride
                  ? 'bg-amber-50/30 border-amber-200'
                  : 'bg-slate-50/80 border-slate-200'
                  }`}
              >
                {editingConditionIdx === idx ? (
                  <div className="flex-1 flex gap-1">
                    <input
                      type="text"
                      autoFocus
                      value={editConditionText}
                      onChange={(e) => setEditConditionText(e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-blue-400 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEditCondition(idx)}
                      className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingConditionIdx(null)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                      <span className="text-slate-800 leading-snug break-words">
                        {cond}
                      </span>
                    </div>

                    {step.conditionsOverride && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditCondition(idx, cond)}
                          className="text-slate-400 hover:text-blue-600 p-0.5"
                          title="Sửa điều kiện"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(idx)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Xóa điều kiện"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {currentConditions.length === 0 && (
              <p className="text-[11px] text-slate-400 italic">
                Chưa có điều kiện nào được thiết lập cho bước này.
              </p>
            )}
          </div>

          {/* Form thêm điều kiện mới khi ở chế độ tùy chỉnh */}
          {step.conditionsOverride && (
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newConditionText}
                onChange={(e) => setNewConditionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCondition();
                  }
                }}
                placeholder="Thêm điều kiện mới..."
                className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                disabled={!newConditionText.trim()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION: BIỂU MẪU ĐIỆN TỬ & KẾT QUẢ ĐẦU RA                      */}
        {/* ============================================================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
              Biểu mẫu điện tử &amp; Kết quả đầu ra
            </span>
          </div>

          {/* Sub-section B: Biểu mẫu điện tử */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">dynamic_form</span>
                  <span>B. Biểu mẫu điện tử ({step.stepForms.length})</span>
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Form để người dùng nhập dữ liệu có cấu trúc tại bước (không coi là văn bản)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <InheritBadge isOverridden={step.formsOverride} />
                {step.formsOverride && (
                  <button
                    type="button"
                    onClick={() =>
                      setRevertModal({
                        isOpen: true,
                        targetSection: 'forms',
                        targetTitle: 'Biểu mẫu điện tử về mặc định',
                      })
                    }
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
                    title="Khôi phục biểu mẫu chuẩn"
                  >
                    <span className="material-symbols-outlined text-[13px]">restart_alt</span>
                    Khôi phục
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              {step.stepForms.map((form, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-blue-600 text-[17px]">
                      description
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">{form}</span>
                      <span className="text-[9.5px] text-slate-400 font-mono">Form dữ liệu có cấu trúc</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveForm(i)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Xóa biểu mẫu"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              ))}

              {step.stepForms.length === 0 && (
                <p className="text-[11px] text-slate-400 italic py-1">
                  Không áp dụng biểu mẫu điện tử nào cho bước này.
                </p>
              )}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newFormText}
                onChange={(e) => setNewFormText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddForm();
                  }
                }}
                placeholder="Tên / mã biểu mẫu điện tử (VD: BM-01/TT)..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddForm}
                disabled={!newFormText.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + Thêm form
              </button>
            </div>
          </div>

          {/* Sub-section C: Tài liệu sử dụng tại bước */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">menu_book</span>
                  <span>C. Tài liệu sử dụng tại bước ({currentUsedDocs.length})</span>
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Tài liệu cán bộ cần xem/đọc/xử lý tại bước (tham chiếu nghiệp vụ, <strong>không là điều kiện chuyển bước</strong>)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <InheritBadge isOverridden={step.usedDocsOverride || step.inputDocsOverride} />
                {(step.usedDocsOverride || step.inputDocsOverride) && (
                  <button
                    type="button"
                    onClick={() =>
                      setRevertModal({
                        isOpen: true,
                        targetSection: 'usedDocs',
                        targetTitle: 'Tài liệu sử dụng tại bước về mặc định',
                      })
                    }
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
                    title="Khôi phục tài liệu sử dụng chuẩn"
                  >
                    <span className="material-symbols-outlined text-[13px]">restart_alt</span>
                    Khôi phục
                  </button>
                )}
              </div>
            </div>

            {/* Thông báo nguyên tắc One Document = One Entity */}
            <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/70 text-[10.5px] text-slate-600 leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0 mt-0.5">info</span>
              <div>
                <span className="font-bold text-blue-900">Nguyên tắc: One Business Document = One Entity.</span> Các tài liệu tại đây tham chiếu trực tiếp đến tài liệu có trong hồ sơ (ví dụ: <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono text-[10px]">DOC-001</code>). Việc tham chiếu này không tạo thêm bản ghi tài liệu trùng lặp và không dùng để chặn chuyển bước.
              </div>
            </div>

            {/* Danh sách tài liệu đang sử dụng */}
            <div className="space-y-1.5">
              {currentUsedDocs.map((docName, i) => {
                const matchedEntity = INITIAL_RECORD_DOCUMENTS.find(
                  (d) => d.name.toLowerCase() === docName.toLowerCase() || d.documentType.toLowerCase() === docName.toLowerCase()
                );

                return (
                  <div
                    key={i}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-blue-600 text-[17px] shrink-0">
                        description
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {matchedEntity ? (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[9.5px] font-bold">
                              {matchedEntity.id}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[9.5px]">
                              Tham chiếu
                            </span>
                          )}
                          <span className="font-semibold text-slate-800 truncate">{docName}</span>
                        </div>
                        <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">
                          {matchedEntity
                            ? `Loại: ${matchedEntity.documentType} • Tệp: ${matchedEntity.fileName || 'Chưa đính kèm'} • Trạng thái: ${matchedEntity.status === 'signed' ? 'Đã ký số' : 'Đã đính kèm'}`
                            : 'Tài liệu tra cứu nghiệp vụ chung'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9.5px] font-medium border border-slate-200">
                        Chỉ tham chiếu
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUsedDoc(i)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Xóa tài liệu tham chiếu"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentUsedDocs.length === 0 && (
                <p className="text-[11px] text-slate-400 italic py-1">
                  Chưa cấu hình tài liệu tham chiếu. Cán bộ không yêu cầu xem trước tài liệu cố định.
                </p>
              )}
            </div>

            {/* Thao tác thêm tài liệu tham chiếu */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSelectRecordDocModalOpen(true)}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px]">folder_open</span>
                  Chọn từ hồ sơ
                </button>
                <span className="text-[10px] text-slate-400">hoặc nhập tên tài liệu tham chiếu:</span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newInDocText}
                  onChange={(e) => setNewInDocText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUsedDocCustom();
                    }
                  }}
                  placeholder="Nhập tên tài liệu cán bộ cần xem/xử lý tại bước..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUsedDocCustom}
                  disabled={!newInDocText.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  + Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Sub-section D: Kết quả đầu ra */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-teal-600 text-[16px]">task_alt</span>
                  <span>D. Kết quả đầu ra ({step.storedDocuments.length})</span>
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Kết quả tạo ra sau khi hoàn thành bước (Dữ liệu, Biểu mẫu hoặc Văn bản phát hành/lưu trữ)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <InheritBadge isOverridden={step.outputDocsOverride} />
                {step.outputDocsOverride && (
                  <button
                    type="button"
                    onClick={() =>
                      setRevertModal({
                        isOpen: true,
                        targetSection: 'outputDocs',
                        targetTitle: 'Kết quả đầu ra về mặc định',
                      })
                    }
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
                    title="Khôi phục kết quả đầu ra chuẩn"
                  >
                    <span className="material-symbols-outlined text-[13px]">restart_alt</span>
                    Khôi phục
                  </button>
                )}
              </div>
            </div>

            {/* Văn bản đổi trạng thái hồ sơ */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Văn bản / Kết quả đổi trạng thái hồ sơ
              </label>
              <input
                type="text"
                value={step.statusChangeDoc || ''}
                onChange={(e) =>
                  onUpdateStep({
                    ...step,
                    statusChangeDoc: e.target.value,
                    outputDocsOverride: true,
                    isCustomized: true,
                  })
                }
                placeholder="VD: Thông báo thụ lý, Báo cáo xác minh, Kết luận nội dung..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Danh sách văn bản/tài liệu lưu trữ tạo ra */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Văn bản / tài liệu phát hành hoặc lưu trữ ({step.storedDocuments.length}):
              </label>
              {step.storedDocuments.map((doc, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-teal-600 text-[17px]">
                      article
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{doc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStoredDoc(i)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Xóa tài liệu đầu ra"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              ))}

              {step.storedDocuments.length === 0 && (
                <p className="text-[11px] text-slate-400 italic py-1">
                  Chưa chỉ định văn bản / kết quả đầu ra cụ thể.
                </p>
              )}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newDocText}
                onChange={(e) => setNewDocText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStoredDoc();
                  }
                }}
                placeholder="Tên văn bản / kết quả tạo ra..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddStoredDoc}
                disabled={!newDocText.trim()}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* BẢNG SO SÁNH & PHÂN ĐỊNH TRÁCH NHIỆM TRỰC QUAN */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 border border-blue-200/90 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="material-symbols-outlined text-[18px] text-blue-600">compare_arrows</span>
              <span>Phân định rõ ràng giữa Tài liệu tại bước & Điều kiện chuyển bước</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-white/95 rounded-xl border border-blue-200/70 shadow-2xs space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">visibility</span>
                  <span>Tài liệu sử dụng tại bước</span>
                </div>
                <ul className="text-slate-600 leading-relaxed text-[10.5px] space-y-0.5 list-disc list-inside">
                  <li>Xác định tài liệu cán bộ cần xem/đọc/xử lý tại bước.</li>
                  <li><strong>Chỉ mang tính tham chiếu nghiệp vụ</strong>, không tự động làm điều kiện chuyển bước.</li>
                  <li>Tham chiếu cùng Document Entity (<code className="text-blue-700 font-mono">DOC-001</code>), <strong>không tạo document mới</strong>.</li>
                </ul>
              </div>
              <div className="p-2.5 bg-white/95 rounded-xl border border-indigo-200/70 shadow-2xs space-y-1">
                <div className="font-bold text-indigo-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-indigo-600">checklist_rtl</span>
                  <span>Điều kiện chuyển bước (Connector)</span>
                </div>
                <ul className="text-slate-600 leading-relaxed text-[10.5px] space-y-0.5 list-disc list-inside">
                  <li>Nơi <strong>DUY NHẤT</strong> cấu hình yêu cầu văn bản để được chuyển tiếp.</li>
                  <li>3 lựa chọn: (1) Không yêu cầu; (2) Kiểm tra văn bản đã có; (3) Yêu cầu văn bản khi chuyển bước.</li>
                  <li>Hệ thống chặn đẩy bước nếu văn bản bắt buộc chưa đủ.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* NODE TYPE SPECIFIC RENDERERS                                  */}
        {/* ============================================================== */}
        {nodeType === 'APPROVAL' && (
          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-purple-200/80">
              <span className="material-symbols-outlined text-purple-700 text-[16px]">verified</span>
              <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wide">
                Cấu hình phê duyệt
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Kiểu phê duyệt
              </label>
              <select
                value={step.approvalConfig?.approvalStyle || 'SINGLE'}
                onChange={(e) =>
                  onUpdateStep({
                    ...step,
                    approvalConfig: {
                      approvalStyle: e.target.value as any,
                      authorityRole: step.approvalConfig?.authorityRole || 'Lãnh đạo đơn vị',
                      approveTargetNodeId: step.approvalConfig?.approveTargetNodeId,
                      rejectTargetNodeId: step.approvalConfig?.rejectTargetNodeId,
                      reviseTargetNodeId: step.approvalConfig?.reviseTargetNodeId,
                    },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              >
                <option value="SINGLE">Một người phê duyệt duy nhất</option>
                <option value="ONE_OF_MANY">Một trong nhiều người có thẩm quyền</option>
                <option value="CONSENSUS">Tất cả thành viên đồng thuận (Hội đồng)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Người / Vai trò có thẩm quyền
              </label>
              <input
                type="text"
                value={step.approvalConfig?.authorityRole || ''}
                onChange={(e) =>
                  onUpdateStep({
                    ...step,
                    approvalConfig: {
                      approvalStyle: step.approvalConfig?.approvalStyle || 'SINGLE',
                      authorityRole: e.target.value,
                    },
                  })
                }
                placeholder="vd: Thủ trưởng cơ quan, Chủ tịch UBND..."
                className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        )}

        {nodeType === 'NOTIFICATION' && (
          <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-sky-200/80">
              <span className="material-symbols-outlined text-sky-700 text-[16px]">notifications</span>
              <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wide">
                Cấu hình thông báo
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Đối tượng nhận thông báo
              </label>
              <select
                value={step.notificationConfig?.recipientType || 'CITIZEN'}
                onChange={(e) =>
                  onUpdateStep({
                    ...step,
                    notificationConfig: {
                      recipientType: e.target.value as any,
                      channels: step.notificationConfig?.channels || ['SMS', 'PORTAL'],
                      triggerEvent: step.notificationConfig?.triggerEvent || 'ON_ENTER',
                    },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              >
                <option value="CITIZEN">Công dân / Người nộp đơn</option>
                <option value="OFFICER">Cán bộ xử lý kế tiếp</option>
                <option value="ALL_PARTIES">Tất cả các bên liên quan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Kênh gửi thông báo
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {['SMS', 'EMAIL', 'PORTAL', 'INTERNAL'].map((ch) => {
                  const isChecked = step.notificationConfig?.channels?.includes(ch as any);
                  return (
                    <label key={ch} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const curr = step.notificationConfig?.channels || [];
                          const updated = isChecked
                            ? curr.filter((c) => c !== ch)
                            : [...curr, ch as any];
                          onUpdateStep({
                            ...step,
                            notificationConfig: {
                              recipientType: step.notificationConfig?.recipientType || 'CITIZEN',
                              triggerEvent: step.notificationConfig?.triggerEvent || 'ON_ENTER',
                              channels: updated,
                            },
                          });
                        }}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>{ch === 'SMS' ? 'Tin nhắn SMS' : ch === 'EMAIL' ? 'Thư điện tử (Email)' : ch === 'PORTAL' ? 'Cổng DVC' : 'Hệ thống nội bộ'}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {nodeType === 'INTEGRATION' && (
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-200/80">
              <span className="material-symbols-outlined text-emerald-700 text-[16px]">cloud_sync</span>
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide">
                Cấu hình tích hợp hệ thống
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Hệ thống liên thông
              </label>
              <select
                value={step.integrationConfig?.systemCode || 'VNEID_DAN_CU'}
                onChange={(e) =>
                  onUpdateStep({
                    ...step,
                    integrationConfig: {
                      systemCode: e.target.value as any,
                      systemName: e.target.value === 'VNEID_DAN_CU' ? 'CSDL Dân cư Quốc gia VNeID' : e.target.value === 'DVC_QUOC_GIA' ? 'Cổng DVC Quốc gia' : 'Trục liên thông văn bản',
                      actionEndpoint: step.integrationConfig?.actionEndpoint || '/api/v1/verify',
                      method: 'POST',
                      timeoutSeconds: 30,
                      retryCount: 3,
                    },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              >
                <option value="VNEID_DAN_CU">CSDL Dân cư Quốc gia VNeID</option>
                <option value="DVC_QUOC_GIA">Cổng Dịch vụ công Quốc gia</option>
                <option value="VAN_BAN_DIEU_HANH">Trục liên thông văn bản điều hành</option>
              </select>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION E: THỜI HẠN & ĐỊNH MỨC (SLA)                           */}
        {/* ============================================================== */}
        {nodeType !== 'START' && nodeType !== 'END' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                  Thời hạn & Định mức (SLA)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <InheritBadge isOverridden={step.slaOverride} />
                {step.slaOverride && (
                  <button
                    type="button"
                    onClick={() =>
                      setRevertModal({
                        isOpen: true,
                        targetSection: 'sla',
                        targetTitle: 'Định mức thời hạn SLA về mặc định',
                      })
                    }
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
                    title="Khôi phục SLA chuẩn"
                  >
                    <span className="material-symbols-outlined text-[13px]">restart_alt</span>
                    Khôi phục
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 mb-1 text-[11px] font-semibold">
                  Hạn xử lý (ngày)
                </label>
                <input
                  type="number"
                  min="0"
                  value={step.timeLimitDays}
                  onChange={(e) =>
                    onUpdateStep({
                      ...step,
                      timeLimitDays: parseInt(e.target.value) || 0,
                      slaOverride: true,
                      isCustomized: true,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px] font-semibold">
                  Số giờ làm việc
                </label>
                <input
                  type="number"
                  min="0"
                  value={step.workHours}
                  onChange={(e) =>
                    onUpdateStep({
                      ...step,
                      workHours: parseInt(e.target.value) || 0,
                      slaOverride: true,
                      isCustomized: true,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px] font-semibold">
                  Cảnh báo trước
                </label>
                <input
                  type="number"
                  min="0"
                  value={step.warningBeforeHours}
                  onChange={(e) =>
                    onUpdateStep({
                      ...step,
                      warningBeforeHours: parseInt(e.target.value) || 0,
                      slaOverride: true,
                      isCustomized: true,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-center text-amber-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 text-[11px] font-semibold">
                Lịch làm việc áp dụng
              </label>
              <select
                value={step.workSchedule}
                onChange={(e) =>
                  onUpdateStep({
                    ...step,
                    workSchedule: e.target.value,
                    slaOverride: true,
                    isCustomized: true,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)">Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)</option>
                <option value="Toàn thời gian (24/7 kể cả ngày nghỉ lễ)">Toàn thời gian (24/7 kể cả ngày nghỉ lễ)</option>
                <option value="Chế độ trực chiến đặc biệt">Chế độ trực chiến đặc biệt</option>
              </select>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION F: HÀNH ĐỘNG TẠI BƯỚC                                 */}
        {/* ============================================================== */}
        {nodeType !== 'START' && nodeType !== 'END' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                  Hành động tại bước ({step.actions?.length || 0})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <InheritBadge isOverridden={step.actionsOverride} />
                {step.actionsOverride ? (
                  <button
                    type="button"
                    onClick={() =>
                      setRevertModal({
                        isOpen: true,
                        targetSection: 'actions',
                        targetTitle: 'danh sách Hành động về mặc định',
                      })
                    }
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
                    title="Khôi phục danh sách hành động chuẩn"
                  >
                    <span className="material-symbols-outlined text-[13px]">restart_alt</span>
                    Khôi phục
                  </button>
                ) : (
                  !isAddingAction && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAction(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Thêm
                    </button>
                  )
                )}
              </div>
            </div>

            {/* List existing actions */}
            <div className="space-y-1.5">
              {(step.actions || []).map((action) => {
                const meta = ACTION_TYPE_LABELS[action.type] || {
                  label: action.type,
                  color: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                return (
                  <div
                    key={action.id}
                    className="p-2 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-800 truncate text-xs">
                        {action.label}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded border text-[9px] font-mono font-bold ${meta.color}`}>
                        {action.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAction(action.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Xóa hành động"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  </div>
                );
              })}

              {(!step.actions || step.actions.length === 0) && !isAddingAction && (
                <p className="text-[11px] text-slate-400 italic">
                  Chưa có hành động cụ thể nào được cấu hình cho bước này.
                </p>
              )}
            </div>

            {/* Inline Form Thêm Hành Động Mới */}
            {isAddingAction && (
              <form onSubmit={handleCreateAction} className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2.5">
                <span className="font-bold text-blue-900 text-xs block">
                  + Thêm hành động xử lý mới
                </span>

                <div>
                  <label className="text-[10.5px] font-semibold text-slate-700 block mb-0.5">
                    Tên hiển thị hành động *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newActionLabel}
                    onChange={(e) => setNewActionLabel(e.target.value)}
                    placeholder="vd: Hoàn tất, Yêu cầu bổ sung, Chuyển duyệt..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-700 block mb-0.5">
                      Kiểu hành động
                    </label>
                    <select
                      value={newActionType}
                      onChange={(e) => setNewActionType(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="COMPLETE">Hoàn tất (Complete)</option>
                      <option value="TRANSFER">Chuyển tiếp (Transfer)</option>
                      <option value="RETURN">Trả lại (Return)</option>
                      <option value="REQUEST_INFO">Yêu cầu bổ sung</option>
                      <option value="APPROVE">Phê duyệt (Approve)</option>
                      <option value="REJECT">Từ chối (Reject)</option>
                      <option value="REVISE">Yêu cầu sửa lại</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-700 block mb-0.5">
                      Mã ngắn (Code)
                    </label>
                    <input
                      type="text"
                      value={newActionCode}
                      onChange={(e) => setNewActionCode(e.target.value.toUpperCase())}
                      placeholder="vd: SUBMIT, REJECT"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAction(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!newActionLabel.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                  >
                    Lưu hành động
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION G: AI TRỢ LÝ NGHIỆP VỤ                                 */}
        {/* ============================================================== */}
        {nodeType !== 'START' && nodeType !== 'END' && (
          <div className="p-3.5 bg-gradient-to-br from-indigo-50/60 to-blue-50/60 border border-indigo-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-indigo-200/80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-700 text-[17px]">smart_toy</span>
                <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wide">
                  AI Trợ lý nghiệp vụ
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={step.aiConfig?.enabled ?? false}
                  onChange={(e) => handleToggleAIEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {step.aiConfig?.enabled && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <span className="text-[10.5px] text-slate-600 block leading-tight font-medium">
                  Chọn các năng lực AI hỗ trợ thực hiện tại bước này:
                </span>

                <div className="space-y-1.5 text-xs">
                  {[
                    { key: 'OCR', label: 'OCR số hóa tài liệu', desc: 'Nhận dạng chữ và trích xuất tài liệu quét' },
                    { key: 'EXTRACT', label: 'Trích xuất thông tin tự động', desc: 'Lấy dữ liệu người nộp, nội dung chính' },
                    { key: 'SEARCH_RELATED', label: 'Tìm kiếm hồ sơ liên quan', desc: 'Phát hiện hồ sơ trùng lặp hoặc cùng đương sự' },
                    { key: 'CHECK_CONDITION', label: 'Kiểm tra điều kiện & Thể thức', desc: 'Đối chiếu tính đầy đủ và căn cứ pháp lý' },
                    { key: 'SUGGEST', label: 'Đề xuất phương án xử lý', desc: 'Gợi ý hướng xử lý dựa trên án lệ và tiền lệ' },
                  ].map((cap) => {
                    const isChecked = step.aiConfig?.capabilities?.includes(cap.key as AICapability);
                    return (
                      <label key={cap.key} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white/80 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAICapability(cap.key as AICapability)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block text-[11px] leading-tight">
                            {cap.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block leading-tight">
                            {cap.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-indigo-200/60">
                  <label className="flex items-start gap-2 cursor-pointer bg-white/70 p-2 rounded-xl border border-indigo-200/80">
                    <input
                      type="checkbox"
                      checked={step.aiConfig?.requireUserConfirmation ?? true}
                      onChange={(e) =>
                        onUpdateStep({
                          ...step,
                          aiConfig: {
                            ...(step.aiConfig || { capabilities: ['OCR', 'EXTRACT'], enabled: true }),
                            requireUserConfirmation: e.target.checked,
                          },
                        })
                      }
                      className="mt-0.5 rounded text-indigo-600 focus:ring-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-indigo-950 block text-[11px]">
                        Bắt buộc cán bộ xác nhận (Human-in-the-loop)
                      </span>
                      <span className="text-[10px] text-indigo-900/80 block leading-tight mt-0.5">
                        AI chỉ đưa ra đề xuất hỗ trợ. Mọi quyết định chuyển bước và ban hành kết quả bắt buộc phải do người dùng xác nhận.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* CONFIRMATION MODAL CHO "KHÔI PHỤC MẶC ĐỊNH"                    */}
      {/* ============================================================== */}
      {revertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">restart_alt</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Khôi phục cấu hình mặc định?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Nội dung tùy chỉnh hiện tại của bước sẽ được thay thế bằng cấu hình chuẩn.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500 text-[10.5px]">Nội dung khôi phục:</div>
              <div className="font-bold text-slate-900">{revertModal.targetTitle}</div>
              <div className="text-[11px] text-indigo-700 font-medium">
                Kế thừa từ: {inheritedName}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRevertModal({ isOpen: false, targetSection: 'ALL', targetTitle: '' })}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRevert}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Chọn tài liệu từ hồ sơ (Single Source of Truth) */}
      {isSelectRecordDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">folder_open</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Chọn tài liệu hồ sơ để sử dụng tại bước
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tham chiếu trực tiếp Document Entity có sẵn, không sinh bản ghi trùng lặp.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectRecordDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Tìm kiếm */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={recordDocSearch}
                onChange={(e) => setRecordDocSearch(e.target.value)}
                placeholder="Tìm theo mã, tên tài liệu hoặc loại văn bản..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Danh sách tài liệu */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {INITIAL_RECORD_DOCUMENTS.filter(
                (d) =>
                  !recordDocSearch.trim() ||
                  d.name.toLowerCase().includes(recordDocSearch.toLowerCase()) ||
                  d.documentType.toLowerCase().includes(recordDocSearch.toLowerCase()) ||
                  d.id.toLowerCase().includes(recordDocSearch.toLowerCase())
              ).map((docEntity) => {
                const isAlreadySelected = currentUsedDocs.includes(docEntity.name);

                return (
                  <div
                    key={docEntity.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isAlreadySelected
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5">
                        article
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-bold">
                            {docEntity.id}
                          </span>
                          <span className="font-bold text-slate-800 truncate">{docEntity.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>Loại: <strong>{docEntity.documentType}</strong></span>
                          <span>•</span>
                          <span>{docEntity.fileName || 'Chưa đính kèm'}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">
                            {docEntity.status === 'signed' ? 'Đã ký số' : 'Đã đính kèm'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadySelected}
                      onClick={() => handleAddUsedDocFromRecord(docEntity)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                        isAlreadySelected
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                      }`}
                    >
                      {isAlreadySelected ? 'Đã tham chiếu' : 'Chọn tham chiếu'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] text-slate-500 leading-tight">
              💡 <strong>Lưu ý:</strong> Tài liệu được chọn ở đây chỉ nhằm phục vụ việc cán bộ xem, tra cứu khi xử lý bước. Điều kiện bắt buộc để chuyển bước được quản lý duy nhất tại đường chuyển (Connector).
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSelectRecordDocModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
