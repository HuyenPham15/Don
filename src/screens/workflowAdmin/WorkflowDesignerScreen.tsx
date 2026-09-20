// src/screens/workflowAdmin/WorkflowDesignerScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  ProcessWorkflow,
  ProcessStep,
  ProcessTransition,
  ValidationIssue,
  WorkflowAuditLogItem,
  WorkflowAuditActionType,
} from '../../types/workflowConfig';
import WorkflowLeftPalette from './components/WorkflowLeftPalette';
import WorkflowCanvas from './components/WorkflowCanvas';
import StepPropertiesPanel from './components/StepPropertiesPanel';
import TransitionPropertiesPanel from './components/TransitionPropertiesPanel';
import ValidationModal from './components/ValidationModal';
import PublishModal from './components/PublishModal';
import WorkflowVersionHistoryModal from './components/WorkflowVersionHistoryModal';
import WorkflowEditHistoryTab from './components/WorkflowEditHistoryTab';
import WorkflowDataConditionsTab from './components/WorkflowDataConditionsTab';
import WorkflowVersionsTab from './components/WorkflowVersionsTab';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import { validateWorkflow } from '../../utils/workflowValidator';

interface WorkflowDesignerScreenProps {
  initialWorkflow: ProcessWorkflow;
  onSaveWorkflow: (updated: ProcessWorkflow) => void;
  onPublishWorkflow: (workflowId: string, effectiveDate: string, notes: string) => void;
  onCreateNewVersion: (baseWf: ProcessWorkflow, versionNote?: string) => void;
  onBackToList: () => void;
  initialMode?: 'edit' | 'view';
}

export default function WorkflowDesignerScreen({
  initialWorkflow,
  onSaveWorkflow,
  onPublishWorkflow,
  onCreateNewVersion,
  onBackToList,
  initialMode = 'edit',
}: WorkflowDesignerScreenProps) {
  // Quy trình đang chỉnh sửa
  const [workflow, setWorkflow] = useState<ProcessWorkflow>(initialWorkflow);
  // Bản lưu trữ gốc để so sánh dirty state & hoàn tác (Section 7)
  const [savedWorkflow, setSavedWorkflow] = useState<ProcessWorkflow>(initialWorkflow);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false);

  // 4 Tabs chính: Thiết kế, Điều kiện dữ liệu, Lịch sử chỉnh sửa, Phiên bản (Section 3)
  const [activeTab, setActiveTab] = useState<'designer' | 'conditions' | 'history' | 'versions'>('designer');

  // Node & Transition được chọn
  const [selectedStepId, setSelectedStepId] = useState<string | null>(() => {
    return initialWorkflow.steps[0]?.id || null;
  });
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);

  // Zoom level (0.6 -> 1.4)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Target được focus từ cửa sổ kiểm chứng
  const [focusedTarget, setFocusedTarget] = useState<{
    type: 'step' | 'transition' | 'general';
    id?: string;
  } | null>(null);

  // Modals state
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Chế độ Snapshot xem thời điểm cũ (Section 10)
  const [snapshotLog, setSnapshotLog] = useState<WorkflowAuditLogItem | null>(null);

  const isReadOnly = workflow.status === 'published' || initialMode === 'view' || Boolean(snapshotLog);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Hàm ghi nhận Audit Log khi có thay đổi (Section 8, 17)
  const recordAuditChange = useCallback((
    actionType: WorkflowAuditActionType,
    actionLabel: string,
    targetName: string,
    targetId: string,
    targetType: 'step' | 'transition' | 'lane' | 'stage' | 'workflow',
    beforeVal: any,
    afterVal: any,
    notes?: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: WorkflowAuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      authorName: 'Nguyễn Minh Anh',
      authorRole: 'Cán bộ thụ lý hồ sơ',
      actionType,
      actionLabel,
      targetName,
      targetId,
      targetType,
      beforeValue: typeof beforeVal === 'object' ? JSON.stringify(beforeVal) : String(beforeVal || ''),
      afterValue: typeof afterVal === 'object' ? JSON.stringify(afterVal) : String(afterVal || ''),
      notes: notes || '',
    };

    setWorkflow((prev) => ({
      ...prev,
      auditLogs: [newLog, ...(prev.auditLogs || [])],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Tính toán kết quả kiểm chứng (Section 18)
  const validationIssues: ValidationIssue[] = useMemo(() => {
    return validateWorkflow(workflow);
  }, [workflow]);

  const errorCount = validationIssues.filter((i) => i.severity === 'error').length;
  const warningCount = validationIssues.filter((i) => i.severity === 'warning').length;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))));
  const handleZoomReset = () => setZoomLevel(1.0);

  // Auto Layout
  const handleAutoLayout = () => {
    showToast('✓ Đã tự động căn chỉnh sơ đồ theo chuẩn luồng hành chính.');
  };

  // Selection handlers
  const handleSelectStep = useCallback((stepId: string) => {
    setSelectedStepId(stepId);
    setSelectedTransitionId(null);
    setFocusedTarget(null);
  }, []);

  const handleSelectTransition = useCallback((transId: string) => {
    setSelectedTransitionId(transId);
    setSelectedStepId(null);
    setFocusedTarget(null);
  }, []);

  // Update step
  const handleUpdateStep = useCallback((updatedStep: ProcessStep) => {
    const oldStep = workflow.steps.find((s) => s.id === updatedStep.id);
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
    }));
    setHasUnsavedChanges(true);
    recordAuditChange(
      'edit_step',
      'Chỉnh sửa thuộc tính bước',
      `${updatedStep.name} (${updatedStep.code})`,
      updatedStep.id,
      'step',
      oldStep ? `Tên: ${oldStep.name}, SLA: ${oldStep.timeLimitDays} ngày` : 'Chưa có',
      `Tên: ${updatedStep.name}, SLA: ${updatedStep.timeLimitDays} ngày`
    );
  }, [workflow.steps, recordAuditChange]);

  // Delete step
  const handleDeleteStep = useCallback((stepId: string) => {
    const stepToDelete = workflow.steps.find((s) => s.id === stepId);
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
      transitions: prev.transitions.filter((t) => t.fromStepId !== stepId && t.toStepId !== stepId),
    }));
    setSelectedStepId(null);
    setHasUnsavedChanges(true);
    showToast('✓ Đã xóa bước xử lý khỏi canvas.');
    if (stepToDelete) {
      recordAuditChange(
        'delete_step',
        'Xóa bước xử lý',
        `${stepToDelete.name} (${stepToDelete.code})`,
        stepToDelete.id,
        'step',
        `Mã: ${stepToDelete.code}, Tên: ${stepToDelete.name}`,
        'Đã xóa khỏi quy trình'
      );
    }
  }, [workflow.steps, recordAuditChange]);

  // Move step (Drag & drop)
  const handleMoveStep = useCallback((stepId: string, targetLaneId: string, targetStageId: string) => {
    const targetStep = workflow.steps.find((s) => s.id === stepId);
    const oldLane = workflow.lanes.find((l) => l.id === targetStep?.laneId)?.name || targetStep?.laneId;
    const oldStage = workflow.stages.find((s) => s.id === targetStep?.stageId)?.name || targetStep?.stageId;
    const newLane = workflow.lanes.find((l) => l.id === targetLaneId)?.name || targetLaneId;
    const newStage = workflow.stages.find((s) => s.id === targetStageId)?.name || targetStageId;

    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id === stepId) {
          return {
            ...s,
            laneId: targetLaneId,
            stageId: targetStageId,
          };
        }
        return s;
      }),
    }));
    setHasUnsavedChanges(true);
    showToast('✓ Đã di chuyển bước sang ô mới.');

    if (targetStep) {
      recordAuditChange(
        'move_step',
        'Di chuyển bước xử lý',
        `${targetStep.name} (${targetStep.code})`,
        targetStep.id,
        'step',
        `Nhóm: ${oldLane} | Giai đoạn: ${oldStage}`,
        `Nhóm: ${newLane} | Giai đoạn: ${newStage}`
      );
    }
  }, [workflow.steps, workflow.lanes, workflow.stages, recordAuditChange]);

  // Update transition
  const handleUpdateTransition = useCallback((updatedTrans: ProcessTransition) => {
    const oldTrans = workflow.transitions.find((t) => t.id === updatedTrans.id);
    setWorkflow((prev) => ({
      ...prev,
      transitions: prev.transitions.map((t) => (t.id === updatedTrans.id ? updatedTrans : t)),
    }));
    setHasUnsavedChanges(true);
    recordAuditChange(
      'edit_condition',
      'Sửa thuộc tính & điều kiện đường chuyển',
      updatedTrans.name,
      updatedTrans.id,
      'transition',
      oldTrans ? `${oldTrans.name} (${oldTrans.conditions?.length || 0} điều kiện)` : 'Chưa có',
      `${updatedTrans.name} (${updatedTrans.conditions?.length || 0} điều kiện)`
    );
  }, [workflow.transitions, recordAuditChange]);

  // Delete transition
  const handleDeleteTransition = useCallback((transId: string) => {
    const transToDelete = workflow.transitions.find((t) => t.id === transId);
    setWorkflow((prev) => ({
      ...prev,
      transitions: prev.transitions.filter((t) => t.id !== transId),
    }));
    setSelectedTransitionId(null);
    setHasUnsavedChanges(true);
    showToast('✓ Đã xóa đường chuyển bước.');
    if (transToDelete) {
      recordAuditChange(
        'delete_transition',
        'Xóa đường chuyển luồng',
        transToDelete.name,
        transToDelete.id,
        'transition',
        transToDelete.name,
        'Đã xóa'
      );
    }
  }, [workflow.transitions, recordAuditChange]);

  // Nối connector giữa 2 bước
  const handleConnectSteps = useCallback((fromStepId: string, toStepId: string) => {
    if (fromStepId === toStepId) {
      showToast('⚠️ Không thể nối đường chuyển vào chính bước đó.');
      return;
    }

    const fromStep = workflow.steps.find((s) => s.id === fromStepId);
    const toStep = workflow.steps.find((s) => s.id === toStepId);

    const exists = workflow.transitions.some(
      (t) => t.fromStepId === fromStepId && t.toStepId === toStepId
    );
    if (exists) {
      showToast('⚠️ Đường chuyển giữa 2 bước này đã tồn tại.');
      return;
    }

    const fromStageIdx = workflow.stages.findIndex((st) => st.id === fromStep?.stageId);
    const toStageIdx = workflow.stages.findIndex((st) => st.id === toStep?.stageId);
    const isReturn = toStageIdx < fromStageIdx;

    const newTrans: ProcessTransition = {
      id: `trans-${Date.now()}`,
      name: isReturn ? `Trả lại: ${fromStep?.name || ''} → ${toStep?.name || ''}` : `Chuyển: ${fromStep?.name || ''} → ${toStep?.name || ''}`,
      fromStepId,
      toStepId,
      fromStepName: fromStep?.name,
      toStepName: toStep?.name,
      type: isReturn ? 'return' : 'normal',
      allowedRoles: ['Cán bộ thụ lý'],
      createNextTask: true,
      taskAssigneeRole: 'Chuyên môn',
      conditions: [],
    };

    setWorkflow((prev) => ({
      ...prev,
      transitions: [...prev.transitions, newTrans],
    }));
    setSelectedTransitionId(newTrans.id);
    setSelectedStepId(null);
    setHasUnsavedChanges(true);
    showToast('✓ Đã tạo đường chuyển mới giữa 2 bước.');

    recordAuditChange(
      'create_transition',
      'Tạo đường chuyển luồng',
      newTrans.name,
      newTrans.id,
      'transition',
      'Chưa nối',
      `${fromStep?.name} ➔ ${toStep?.name} (${newTrans.type === 'return' ? 'Trả lại' : 'Bình thường'})`
    );
  }, [workflow.steps, workflow.transitions, workflow.stages, recordAuditChange]);

  // Thêm bước mới từ palette
  const handleAddStepFromPalette = (type: 'normal' | 'start' | 'end' | 'review' | 'approval' | 'archive') => {
    const newId = `step-${Date.now()}`;
    const codeNum = String(workflow.steps.length + 1).padStart(2, '0');

    let name = 'Bước xử lý mới';
    let isStart = false;
    let isEnd = false;
    let laneId = workflow.lanes[0]?.id || 'lane-vt';
    let stageId = workflow.stages[0]?.id || 'stg-1';

    if (type === 'start') {
      name = 'Tiếp nhận hồ sơ đầu vào';
      isStart = true;
      laneId = workflow.lanes[0]?.id || 'lane-vt';
      stageId = workflow.stages[0]?.id || 'stg-1';
    } else if (type === 'end') {
      name = 'Lưu trữ & Đóng hồ sơ';
      isEnd = true;
      laneId = workflow.lanes[0]?.id || 'lane-vt';
      stageId = workflow.stages[workflow.stages.length - 1]?.id || 'stg-5';
    } else if (type === 'approval') {
      name = 'Lãnh đạo phê duyệt';
      laneId = workflow.lanes.find((l) => l.code === 'LD')?.id || workflow.lanes[workflow.lanes.length - 1]?.id;
      stageId = workflow.stages[Math.min(3, workflow.stages.length - 1)]?.id;
    } else if (type === 'archive') {
      name = 'Thông báo kết quả đến công dân';
      laneId = workflow.lanes[0]?.id || 'lane-vt';
      stageId = workflow.stages[workflow.stages.length - 1]?.id;
    }

    const newStep: ProcessStep = {
      id: newId,
      code: `STEP-${codeNum}`,
      name,
      laneId,
      stageId,
      isStart,
      isEnd,
      timeLimitDays: 3,
      workHours: 24,
      warningBeforeHours: 4,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: [],
      stepForms: [],
      statusChangeDoc: '',
    };

    setWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));

    setSelectedStepId(newStep.id);
    setSelectedTransitionId(null);
    setHasUnsavedChanges(true);
    showToast(`✓ Đã thêm "${name}" vào sơ đồ.`);

    recordAuditChange(
      'create_step',
      'Thêm bước xử lý mới',
      `${name} (${newStep.code})`,
      newStep.id,
      'step',
      'Chưa có',
      `Tên: ${name} | Mã: ${newStep.code} | Hạn: 3 ngày`
    );
  };

  // Thêm Lane
  const handleAddLane = (name: string, code: string) => {
    const newLane = {
      id: `lane-${Date.now()}`,
      name,
      code,
      order: workflow.lanes.length + 1,
    };
    setWorkflow((prev) => ({
      ...prev,
      lanes: [...prev.lanes, newLane],
    }));
    setHasUnsavedChanges(true);
    showToast(`✓ Đã thêm Nhóm trách nhiệm: "${name}".`);
  };

  // Thêm Giai đoạn
  const handleAddStage = (name: string) => {
    const newStage = {
      id: `stage-${Date.now()}`,
      name,
      order: workflow.stages.length + 1,
    };
    setWorkflow((prev) => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }));
    setHasUnsavedChanges(true);
    showToast(`✓ Đã thêm Giai đoạn: "${name}".`);
  };

  // Focus lỗi từ ValidationModal
  const handleFocusValidationTarget = (
    targetType: 'step' | 'transition' | 'general',
    targetId?: string
  ) => {
    if (!targetId) return;

    setActiveTab('designer');
    setFocusedTarget({ type: targetType, id: targetId });

    if (targetType === 'step') {
      setSelectedStepId(targetId);
      setSelectedTransitionId(null);
    } else if (targetType === 'transition') {
      setSelectedTransitionId(targetId);
      setSelectedStepId(null);
    }

    setTimeout(() => {
      setFocusedTarget((curr) => (curr?.id === targetId ? null : curr));
    }, 6000);
  };

  // Lưu bản nháp (Section 7)
  const handleSaveDraft = () => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = {
      ...workflow,
      updatedAt: dateStr,
      updatedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
    };
    setWorkflow(updated);
    setSavedWorkflow(updated);
    setHasUnsavedChanges(false);
    onSaveWorkflow(updated);
    showToast('✓ Đã lưu bản nháp quy trình thành công!');

    recordAuditChange(
      'save_draft',
      'Lưu bản nháp quy trình',
      `Phiên bản ${workflow.version}`,
      workflow.id,
      'workflow',
      'Đang có thay đổi',
      'Đã lưu an toàn'
    );
  };

  // Hủy thay đổi (Revert chưa lưu - Section 7)
  const handleDiscardChanges = () => {
    setWorkflow(savedWorkflow);
    setHasUnsavedChanges(false);
    showToast('Đã hủy các thay đổi chưa lưu, khôi phục cấu hình trước đó.');
  };

  // Nhấn nút Thoát / Quay lại (Section 7)
  const handleRequestBack = () => {
    if (hasUnsavedChanges) {
      setIsUnsavedModalOpen(true);
    } else {
      onBackToList();
    }
  };

  // Nhấn nút Phát hành
  const handleRequestPublish = () => {
    if (errorCount > 0) {
      setIsValidationModalOpen(true);
      showToast('⚠️ Quy trình có lỗi kiểm chứng bắt buộc. Vui lòng khắc phục trước khi phát hành!');
      return;
    }
    setIsPublishModalOpen(true);
  };

  // Xác nhận phát hành
  const handleConfirmPublish = (effectiveDate: string, notes: string) => {
    onPublishWorkflow(workflow.id, effectiveDate, notes);
    setIsPublishModalOpen(false);
    const updated: ProcessWorkflow = {
      ...workflow,
      status: 'published',
      effectiveDate,
    };
    setWorkflow(updated);
    setSavedWorkflow(updated);
    setHasUnsavedChanges(false);
    showToast(`✓ Đã phát hành chính thức quy trình "${workflow.name}"!`);

    recordAuditChange(
      'publish',
      'Phát hành chính thức',
      `Phiên bản ${workflow.version}`,
      workflow.id,
      'workflow',
      'Bản nháp',
      `Đã phát hành (Hiệu lực từ ${effectiveDate})`,
      notes
    );
  };

  // Kích hoạt xem snapshot từ Lịch sử chỉnh sửa (Section 10)
  const handleViewSnapshot = (logItem: WorkflowAuditLogItem) => {
    setSnapshotLog(logItem);
    setActiveTab('designer');
    setFocusedTarget({ type: logItem.targetType as any, id: logItem.targetId });
    if (logItem.targetType === 'step') {
      setSelectedStepId(logItem.targetId);
      setSelectedTransitionId(null);
    } else if (logItem.targetType === 'transition') {
      setSelectedTransitionId(logItem.targetId);
      setSelectedStepId(null);
    }
  };

  // Thoát chế độ snapshot
  const handleExitSnapshot = () => {
    setSnapshotLog(null);
    setFocusedTarget(null);
    showToast('Đã quay về phiên bản hiện tại.');
  };

  // Đối tượng được chọn hiện tại cho panel phải
  const currentStep = workflow.steps.find((s) => s.id === selectedStepId);
  const currentTransition = workflow.transitions.find((t) => t.id === selectedTransitionId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4f7fb]">
      {/* 1. TOP DESIGNER BAR */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-30 shadow-2xs">
        {/* Left: Breadcrumbs & Workflow Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleRequestBack}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Quay lại danh sách quy trình"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-md">
                {workflow.name}
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {workflow.code}
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
                title="Nhấn để xem toàn bộ lịch sử cập nhật phiên bản của quy trình này"
              >
                <span className="material-symbols-outlined text-[13px] text-purple-600">history</span>
                {workflow.version}
              </button>
              {workflow.status === 'published' ? (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Đã phát hành
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Bản nháp
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Loại đơn: <strong className="text-slate-700">{workflow.loaiDonName}</strong></span>
              <span>•</span>
              <span>{workflow.steps.length} bước</span>
              <span>•</span>
              <span>{workflow.transitions.length} connector</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls (Only on designer tab) */}
          {activeTab === 'designer' && (
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/80 mr-1">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span
                onClick={handleZoomReset}
                className="px-2 font-mono text-[11px] font-semibold text-slate-600 cursor-pointer"
                title="Nhấp để reset về 100%"
              >
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all cursor-pointer"
                title="Phóng to (+)"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          )}

          {/* Auto layout button */}
          {activeTab === 'designer' && (
            <button
              type="button"
              onClick={handleAutoLayout}
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Tự động căn chỉnh sơ đồ (Auto layout)"
            >
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </button>
          )}

          {/* Button Kiểm chứng (Section 18) */}
          <button
            type="button"
            onClick={() => setIsValidationModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              errorCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : warningCount > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {errorCount > 0 ? 'warning' : 'verified'}
            </span>
            <span>Kiểm chứng</span>
            {(errorCount > 0 || warningCount > 0) && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  errorCount > 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {errorCount + warningCount}
              </span>
            )}
          </button>

          {/* Nút thao tác theo trạng thái */}
          {workflow.status === 'published' ? (
            <button
              type="button"
              onClick={() => onCreateNewVersion(workflow)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              title="Quy trình đã phát hành không thể sửa trực tiếp. Bấm để tạo phiên bản mới."
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Tạo phiên bản mới</span>
            </button>
          ) : (
            <>
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="px-3 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Hủy các thay đổi chưa lưu và khôi phục bản gần nhất"
                >
                  Hủy thay đổi
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveDraft}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  hasUnsavedChanges
                    ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs'
                }`}
              >
                Lưu bản nháp
              </button>

              <button
                type="button"
                onClick={handleRequestPublish}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Phát hành</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* 2. FOUR TABS BAR (SECTION 3) */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1 -mb-px text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('designer')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'designer'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">account_tree</span>
            <span>Thiết kế</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'conditions'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">alt_route</span>
            <span>Điều kiện dữ liệu</span>
            {workflow.transitions.filter((t) => t.conditions && t.conditions.length > 0).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
                {workflow.transitions.filter((t) => t.conditions && t.conditions.length > 0).length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">history</span>
            <span>Lịch sử chỉnh sửa</span>
            {workflow.auditLogs && workflow.auditLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800">
                {workflow.auditLogs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'versions'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">layers</span>
            <span>Phiên bản</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {workflow.versionHistory?.length || 1}
            </span>
          </button>
        </div>

        {/* Right Tab Utilities: Unsaved changes flag & Info button */}
        <div className="flex items-center gap-2 text-xs py-2">
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Có thay đổi chưa lưu</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Xem thông tin chi tiết quy trình"
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Thông tin quy trình</span>
          </button>
        </div>
      </div>

      {/* SNAPSHOT MODE BANNER (SECTION 10) */}
      {snapshotLog && (
        <div className="bg-purple-900 text-white px-6 py-2.5 flex items-center justify-between text-xs z-20 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-purple-300 text-[18px]">history</span>
            <span>
              <strong>Đang xem bản chụp (Snapshot) tại thời điểm:</strong> <span className="font-mono">{snapshotLog.timestamp}</span> • Thao tác: <strong>{snapshotLog.actionLabel}</strong> ({snapshotLog.targetName})
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-800 text-purple-200 font-semibold text-[10px]">
              Chế độ chỉ đọc
            </span>
          </div>

          <button
            type="button"
            onClick={handleExitSnapshot}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-purple-900 font-bold hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            <span>Quay về phiên bản hiện tại</span>
          </button>
        </div>
      )}

      {/* Banner thông báo chế độ chỉ đọc nếu đã phát hành */}
      {isReadOnly && !snapshotLog && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">lock</span>
            <span>
              <strong>Phiên bản đã phát hành ({workflow.version}):</strong> Khóa chỉnh sửa trực tiếp để bảo vệ hồ sơ đang thụ lý.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onCreateNewVersion(workflow)}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
          >
            Tạo phiên bản mới (v2.0 / v1.1) ngay &rarr;
          </button>
        </div>
      )}

      {/* 3. TAB WORKSPACES */}
      {activeTab === 'designer' && (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left: Palette */}
          <WorkflowLeftPalette
            lanes={workflow.lanes}
            stages={workflow.stages}
            onAddStep={handleAddStepFromPalette}
            onAddLane={handleAddLane}
            onAddStage={handleAddStage}
            isReadOnly={isReadOnly}
          />

          {/* Center: Interactive Swimlane Canvas */}
          <WorkflowCanvas
            steps={workflow.steps}
            transitions={workflow.transitions}
            lanes={workflow.lanes}
            stages={workflow.stages}
            selectedStepId={selectedStepId}
            selectedTransitionId={selectedTransitionId}
            focusedTarget={focusedTarget}
            zoomLevel={zoomLevel}
            onSelectStep={handleSelectStep}
            onSelectTransition={handleSelectTransition}
            onMoveStep={handleMoveStep}
            onConnectSteps={handleConnectSteps}
            isReadOnly={isReadOnly}
          />

          {/* Right: Dynamic Properties Panel */}
          {currentStep && (
            <StepPropertiesPanel
              step={currentStep}
              lanes={workflow.lanes}
              stages={workflow.stages}
              onUpdateStep={handleUpdateStep}
              onDeleteStep={handleDeleteStep}
              onClose={() => setSelectedStepId(null)}
            />
          )}

          {currentTransition && (
            <TransitionPropertiesPanel
              transition={currentTransition}
              steps={workflow.steps}
              lanes={workflow.lanes}
              onUpdateTransition={handleUpdateTransition}
              onDeleteTransition={handleDeleteTransition}
              onClose={() => setSelectedTransitionId(null)}
            />
          )}
        </div>
      )}

      {activeTab === 'conditions' && (
        <WorkflowDataConditionsTab
          workflow={workflow}
          onSelectTransition={(transId) => {
            setSelectedTransitionId(transId);
            setSelectedStepId(null);
            setActiveTab('designer');
          }}
        />
      )}

      {activeTab === 'history' && (
        <WorkflowEditHistoryTab
          workflow={workflow}
          onViewSnapshot={handleViewSnapshot}
        />
      )}

      {activeTab === 'versions' && (
        <WorkflowVersionsTab
          workflow={workflow}
          onCreateNewVersion={onCreateNewVersion}
        />
      )}

      {/* 4. MODALS */}
      <ValidationModal
        issues={validationIssues}
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        onFocusTarget={handleFocusValidationTarget}
      />

      <PublishModal
        workflow={workflow}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handleConfirmPublish}
      />

      {isHistoryModalOpen && (
        <WorkflowVersionHistoryModal
          workflow={workflow}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {/* Modal Cảnh báo chưa lưu (Section 7) */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onCancel={() => setIsUnsavedModalOpen(false)}
        onDiscardAndLeave={() => {
          setIsUnsavedModalOpen(false);
          onBackToList();
        }}
        onSaveAndLeave={() => {
          setIsUnsavedModalOpen(false);
          handleSaveDraft();
          onBackToList();
        }}
      />

      {/* Modal Thông tin quy trình (Section 3) */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700 text-[22px]">info</span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Thông tin quy trình xử lý
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{workflow.name}</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200">
                    {workflow.code}
                  </span>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  {workflow.description || 'Chưa có mô tả chi tiết cho quy trình này.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10.5px] text-slate-400 block font-medium">Loại đơn áp dụng</span>
                  <strong className="text-slate-800">{workflow.loaiDonName}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10.5px] text-slate-400 block font-medium">Phiên bản hiện tại</span>
                  <strong className="text-blue-700 font-mono">{workflow.version} ({workflow.status === 'published' ? 'Đã phát hành' : 'Bản nháp'})</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10.5px] text-slate-400 block font-medium">Cập nhật gần nhất</span>
                  <strong className="text-slate-800 font-mono">{workflow.updatedAt}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10.5px] text-slate-400 block font-medium">Người cập nhật</span>
                  <strong className="text-slate-800">{workflow.updatedBy}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-xs animate-in slide-in-from-bottom duration-200">
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
