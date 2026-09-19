// src/screens/workflowAdmin/WorkflowDesignerScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  ProcessWorkflow,
  ProcessStep,
  ProcessTransition,
  ValidationIssue,
} from '../../types/workflowConfig';
import WorkflowLeftPalette from './components/WorkflowLeftPalette';
import WorkflowCanvas from './components/WorkflowCanvas';
import StepPropertiesPanel from './components/StepPropertiesPanel';
import TransitionPropertiesPanel from './components/TransitionPropertiesPanel';
import ValidationModal from './components/ValidationModal';
import PublishModal from './components/PublishModal';
import { validateWorkflow } from '../../utils/workflowValidator';

interface WorkflowDesignerScreenProps {
  initialWorkflow: ProcessWorkflow;
  onSaveWorkflow: (updated: ProcessWorkflow) => void;
  onPublishWorkflow: (workflowId: string, effectiveDate: string, notes: string) => void;
  onCreateNewVersion: (baseWf: ProcessWorkflow) => void;
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
  const [workflow, setWorkflow] = useState<ProcessWorkflow>(initialWorkflow);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(() => {
    // Mặc định chọn bước đầu tiên nếu có
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isReadOnly = workflow.status === 'published' || initialMode === 'view';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Tính toán kết quả kiểm chứng
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
    // Sắp xếp lại thứ tự các bước theo giai đoạn và nhóm trách nhiệm chuẩn
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
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
    }));
  }, []);

  // Delete step
  const handleDeleteStep = useCallback((stepId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
      // Xóa luôn các connector liên quan đến bước này
      transitions: prev.transitions.filter((t) => t.fromStepId !== stepId && t.toStepId !== stepId),
    }));
    setSelectedStepId(null);
    showToast('✓ Đã xóa bước xử lý khỏi canvas.');
  }, []);

  // Move step (Drag & drop)
  const handleMoveStep = useCallback((stepId: string, targetLaneId: string, targetStageId: string) => {
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
    showToast('✓ Đã di chuyển bước sang ô mới.');
  }, []);

  // Update transition
  const handleUpdateTransition = useCallback((updatedTrans: ProcessTransition) => {
    setWorkflow((prev) => ({
      ...prev,
      transitions: prev.transitions.map((t) => (t.id === updatedTrans.id ? updatedTrans : t)),
    }));
  }, []);

  // Delete transition
  const handleDeleteTransition = useCallback((transId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      transitions: prev.transitions.filter((t) => t.id !== transId),
    }));
    setSelectedTransitionId(null);
    showToast('✓ Đã xóa đường chuyển bước.');
  }, []);

  // Nối connector giữa 2 bước
  const handleConnectSteps = useCallback((fromStepId: string, toStepId: string) => {
    if (fromStepId === toStepId) {
      showToast('⚠️ Không thể nối đường chuyển vào chính bước đó.');
      return;
    }

    setWorkflow((prev) => {
      // Kiểm tra xem đã có đường nối giữa 2 bước này chưa
      const exists = prev.transitions.some(
        (t) => t.fromStepId === fromStepId && t.toStepId === toStepId
      );
      if (exists) {
        showToast('⚠️ Đường chuyển giữa 2 bước này đã tồn tại.');
        return prev;
      }

      const fromStep = prev.steps.find((s) => s.id === fromStepId);
      const toStep = prev.steps.find((s) => s.id === toStepId);

      // Phán đoán loại đường chuyển: nếu đi lùi cột giai đoạn thì là 'return'
      const fromStageIdx = prev.stages.findIndex((st) => st.id === fromStep?.stageId);
      const toStageIdx = prev.stages.findIndex((st) => st.id === toStep?.stageId);
      const isReturn = toStageIdx < fromStageIdx;

      const newTrans: ProcessTransition = {
        id: `trans-${Date.now()}`,
        actionName: isReturn ? 'Trả lại bước trước' : 'Chuyển xử lý tiếp theo',
        fromStepId,
        toStepId,
        type: isReturn ? 'return' : 'normal',
        allowedRoles: ['Cán bộ thụ lý'],
        createNextTask: true,
        taskAssigneeRole: 'Chuyên môn',
        conditions: [],
      };

      setSelectedTransitionId(newTrans.id);
      setSelectedStepId(null);
      return {
        ...prev,
        transitions: [...prev.transitions, newTrans],
      };
    });

    showToast('✓ Đã tạo đường chuyển mới giữa 2 bước.');
  }, []);

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
    showToast(`✓ Đã thêm "${name}" vào sơ đồ.`);
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
    showToast(`✓ Đã thêm Giai đoạn: "${name}".`);
  };

  // Focus đối tượng từ Validation Modal
  const handleFocusValidationTarget = (
    targetType: 'step' | 'transition' | 'general',
    targetId?: string
  ) => {
    if (!targetId) return;

    setFocusedTarget({ type: targetType, id: targetId });

    if (targetType === 'step') {
      setSelectedStepId(targetId);
      setSelectedTransitionId(null);
    } else if (targetType === 'transition') {
      setSelectedTransitionId(targetId);
      setSelectedStepId(null);
    }

    // Tự động tắt highlight sau 6 giây
    setTimeout(() => {
      setFocusedTarget((curr) => (curr?.id === targetId ? null : curr));
    }, 6000);
  };

  // Lưu bản nháp
  const handleSaveDraft = () => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = {
      ...workflow,
      updatedAt: dateStr,
      updatedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
    };
    setWorkflow(updated);
    onSaveWorkflow(updated);
    showToast('✓ Đã lưu bản nháp quy trình thành công!');
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
    setWorkflow((prev) => ({
      ...prev,
      status: 'published',
      effectiveDate,
    }));
    showToast(`✓ Đã phát hành chính thức quy trình "${workflow.name}"!`);
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
            onClick={onBackToList}
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
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {workflow.version}
              </span>
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
          {/* Zoom controls */}
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

          {/* Auto layout button */}
          <button
            type="button"
            onClick={handleAutoLayout}
            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Tự động căn chỉnh sơ đồ (Auto layout)"
          >
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
          </button>

          {/* Button Kiểm chứng */}
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
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Lưu bản nháp
              </button>

              <button
                type="button"
                onClick={handleRequestPublish}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Phát hành</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Banner thông báo chế độ chỉ đọc nếu đã phát hành */}
      {isReadOnly && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">lock</span>
            <span>
              <strong>Phiên bản đã phát hành ({workflow.version}):</strong> Không thể sửa trực tiếp để bảo vệ tính toàn vẹn của hồ sơ đang thụ lý.
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

      {/* 2. THREE-PANE DESIGNER BODY */}
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

      {/* 3. MODALS */}
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

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-xs animate-in slide-in-from-bottom duration-200">
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
