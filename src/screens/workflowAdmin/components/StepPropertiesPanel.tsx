// src/screens/workflowAdmin/components/StepPropertiesPanel.tsx
import React, { useState } from 'react';
import {
  ProcessStep,
  ProcessLane,
  ProcessStage,
  WorkflowAction,
  WorkflowActionType,
  AICapability,
} from '../../../types/workflowConfig';

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

  // Document & Form inputs
  const [newDocText, setNewDocText] = useState('');
  const [newInDocText, setNewInDocText] = useState('');
  const [newFormText, setNewFormText] = useState('');

  // Action creation inline form
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newActionLabel, setNewActionLabel] = useState('');
  const [newActionCode, setNewActionCode] = useState('');
  const [newActionType, setNewActionType] = useState<WorkflowActionType>('COMPLETE');
  const [newActionTargetNode, setNewActionTargetNode] = useState('');

  const nodeType = step.nodeType || (step.isStart ? 'START' : step.isEnd ? 'END' : 'TASK');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(step.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Add / remove documents
  const handleAddStoredDoc = () => {
    if (!newDocText.trim()) return;
    onUpdateStep({
      ...step,
      storedDocuments: [...step.storedDocuments, newDocText.trim()],
    });
    setNewDocText('');
  };

  const handleRemoveStoredDoc = (idx: number) => {
    onUpdateStep({
      ...step,
      storedDocuments: step.storedDocuments.filter((_, i) => i !== idx),
    });
  };

  const handleAddInputDoc = () => {
    if (!newInDocText.trim()) return;
    onUpdateStep({
      ...step,
      inputDocuments: [...(step.inputDocuments || []), newInDocText.trim()],
    });
    setNewInDocText('');
  };

  const handleRemoveInputDoc = (idx: number) => {
    onUpdateStep({
      ...step,
      inputDocuments: (step.inputDocuments || []).filter((_, i) => i !== idx),
    });
  };

  const handleAddForm = () => {
    if (!newFormText.trim()) return;
    onUpdateStep({
      ...step,
      stepForms: [...step.stepForms, newFormText.trim()],
    });
    setNewFormText('');
  };

  const handleRemoveForm = (idx: number) => {
    onUpdateStep({
      ...step,
      stepForms: step.stepForms.filter((_, i) => i !== idx),
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
            <span className="text-[10px] text-slate-400 font-mono">
              Loại: <strong className="text-blue-700">{nodeType}</strong>
            </span>
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
        {/* SECTION A: THÔNG TIN CHUNG (COMMON FOR ALL NODES)              */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
              Thông tin chung
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

          {/* Diễn giải / Mô tả nghiệp vụ */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Diễn giải nghiệp vụ
            </label>
            <textarea
              rows={2}
              value={step.description || ''}
              onChange={(e) => onUpdateStep({ ...step, description: e.target.value })}
              placeholder="Mô tả mục tiêu và quy định thao tác tại bước này..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION B: NODE TYPE SPECIFIC RENDERERS                        */}
        {/* ============================================================== */}

        {/* ── B.1: APPROVAL NODE TYPE ── */}
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

        {/* ── B.2: NOTIFICATION NODE TYPE ── */}
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

        {/* ── B.3: INTEGRATION NODE TYPE ── */}
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
        {/* SECTION C: SLA & WORKING HOURS (FOR TASK, CHECK, APPROVAL)     */}
        {/* ============================================================== */}
        {nodeType !== 'START' && nodeType !== 'END' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                Thời hạn & Định mức (SLA)
              </span>
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
                  onChange={(e) => onUpdateStep({ ...step, timeLimitDays: parseInt(e.target.value) || 0 })}
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
                  onChange={(e) => onUpdateStep({ ...step, workHours: parseInt(e.target.value) || 0 })}
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
                  onChange={(e) => onUpdateStep({ ...step, warningBeforeHours: parseInt(e.target.value) || 0 })}
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
                onChange={(e) => onUpdateStep({ ...step, workSchedule: e.target.value })}
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
        {/* SECTION D: ACTIONS LIST (TÁCH KHỎI NODE THEO YÊU CẦU 7)       */}
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

              {!isAddingAction && (
                <button
                  type="button"
                  onClick={() => setIsAddingAction(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Thêm hành động
                </button>
              )}
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
                      {/* <span className={`px-1.5 py-0.5 rounded border text-[9.5px] font-bold ${meta.color}`}>
                        {action.code}
                      </span> */}
                      <span className="font-semibold text-slate-800 truncate text-xs">
                        {action.label}
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
        {/* SECTION E: DATA & DOCUMENTS (FORMS, INPUT, OUTPUT DOCS)       */}
        {/* ============================================================== */}
        {nodeType !== 'BRANCH' && nodeType !== 'MERGE' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                Dữ liệu & Biểu mẫu
              </span>
            </div>

            {/* Step Forms */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                Biểu mẫu điện tử ({step.stepForms.length})
              </label>
              <div className="space-y-1.5 mb-2">
                {step.stepForms.map((form, i) => (
                  <div key={i} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="truncate">{form}</span>
                    <button type="button" onClick={() => handleRemoveForm(i)} className="text-slate-400 hover:text-rose-600">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newFormText}
                  onChange={(e) => setNewFormText(e.target.value)}
                  placeholder="Mã & tên biểu mẫu..."
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddForm}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                >
                  + Thêm
                </button>
              </div>
            </div>

            {/* Input Documents */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                Văn bản đầu vào ({step.inputDocuments?.length || 0})
              </label>
              <div className="space-y-1.5 mb-2">
                {(step.inputDocuments || []).map((doc, i) => (
                  <div key={i} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="truncate">{doc}</span>
                    <button type="button" onClick={() => handleRemoveInputDoc(i)} className="text-slate-400 hover:text-rose-600">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newInDocText}
                  onChange={(e) => setNewInDocText(e.target.value)}
                  placeholder="Tên văn bản đầu vào..."
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddInputDoc}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                >
                  + Thêm
                </button>
              </div>
            </div>

            {/* Stored / Output Documents */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                Văn bản lưu / Đầu ra ({step.storedDocuments.length})
              </label>
              <div className="space-y-1.5 mb-2">
                {step.storedDocuments.map((doc, i) => (
                  <div key={i} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="truncate">{doc}</span>
                    <button type="button" onClick={() => handleRemoveStoredDoc(i)} className="text-slate-400 hover:text-rose-600">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  placeholder="Tên văn bản lưu trữ..."
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddStoredDoc}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                >
                  + Thêm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION F: AI CAPABILITY CONFIGURATION (REQUIREMENT 10)         */}
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
    </aside>
  );
}
