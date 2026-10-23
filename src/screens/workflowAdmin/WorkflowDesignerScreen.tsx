// src/screens/workflowAdmin/WorkflowDesignerScreen.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ProcessWorkflow,
  ProcessStep,
  ProcessTransition,
  WorkflowNodeType,
} from '../../types/workflowConfig';
import DrawioLeftPalette from './components/DrawioLeftPalette';
import DrawioCanvas from './components/DrawioCanvas';
import DrawioPropertiesPanel from './components/DrawioPropertiesPanel';
import DrawioPreviewModal from './components/DrawioPreviewModal';
import UnsavedChangesModal from './components/UnsavedChangesModal';

interface WorkflowDesignerScreenProps {
  initialWorkflow: ProcessWorkflow;
  onSaveWorkflow: (updated: ProcessWorkflow) => void;
  onPublishWorkflow?: (workflowId: string, effectiveDate: string, notes: string) => void;
  onCreateNewVersion?: (baseWf: ProcessWorkflow, versionNote?: string) => void;
  onBackToList: () => void;
  initialMode?: 'edit' | 'view';
}

export default function WorkflowDesignerScreen({
  initialWorkflow,
  onSaveWorkflow,
  onBackToList,
  initialMode = 'edit',
}: WorkflowDesignerScreenProps) {
  // Chuẩn hóa vị trí các node ban đầu nếu chưa có tọa độ canvas (x, y)
  const normalizedWorkflow = useMemo<ProcessWorkflow>(() => {
    let currentX = 80;
    let currentY = 180;

    const normalizedSteps = initialWorkflow.steps.map((step, idx) => {
      const nodeType: WorkflowNodeType =
        step.nodeType || (step.isStart ? 'START' : step.isEnd ? 'END' : 'TASK');

      const position =
        step.position && typeof step.position.x === 'number' && typeof step.position.y === 'number'
          ? step.position
          : { x: currentX, y: currentY + (idx % 2 === 0 ? 0 : 50) };

      if (!step.position) {
        currentX += 240;
      }

      return {
        ...step,
        nodeType,
        position,
      };
    });

    return {
      ...initialWorkflow,
      steps: normalizedSteps,
    };
  }, [initialWorkflow]);

  // Trạng thái quy trình hiện tại
  const [workflow, setWorkflow] = useState<ProcessWorkflow>(normalizedWorkflow);
  const [savedWorkflow, setSavedWorkflow] = useState<ProcessWorkflow>(normalizedWorkflow);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Lựa chọn Node / Transition
  const [selectedStepId, setSelectedStepId] = useState<string | null>(() => {
    return normalizedWorkflow.steps[0]?.id || null;
  });
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);

  // Zoom level (0.5 -> 2.0)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Undo / Redo Stacks
  const [pastWorkflows, setPastWorkflows] = useState<ProcessWorkflow[]>([]);
  const [futureWorkflows, setFutureWorkflows] = useState<ProcessWorkflow[]>([]);

  const isReadOnly = initialMode === 'view' || workflow.status === 'published';

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // Ghi nhận lịch sử cho Undo/Redo
  const pushToHistory = useCallback((currentWf: ProcessWorkflow) => {
    setPastWorkflows((prev) => [...prev.slice(-30), currentWf]);
    setFutureWorkflows([]);
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    setPastWorkflows((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setFutureWorkflows((f) => [workflow, ...f]);
      setWorkflow(last);
      setHasUnsavedChanges(true);
      showToast('↺ Đã hoàn tác thao tác vừa thực hiện.');
      return prev.slice(0, prev.length - 1);
    });
  }, [workflow, showToast]);

  // Redo
  const handleRedo = useCallback(() => {
    setFutureWorkflows((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPastWorkflows((prev) => [...prev, workflow]);
      setWorkflow(next);
      setHasUnsavedChanges(true);
      showToast('↻ Đã làm lại thao tác.');
      return f.slice(1);
    });
  }, [workflow, showToast]);

  // Phím tắt bàn phím toàn cục (Ctrl+Z, Ctrl+Y, Ctrl+S, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (pastWorkflows.length > 0 && !isReadOnly) handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (futureWorkflows.length > 0 && !isReadOnly) handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        setSelectedStepId(null);
        setSelectedTransitionId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pastWorkflows, futureWorkflows, isReadOnly, handleUndo, handleRedo]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1.0);
  }, []);

  const handleFitView = useCallback(() => {
    setZoomLevel(1.0);
    showToast('⊙ Đã căn giữa sơ đồ trên màn hình.');
  }, [showToast]);

  // Chọn thành phần
  const handleSelectStep = useCallback((stepId: string | null) => {
    setSelectedStepId(stepId);
    if (stepId) setSelectedTransitionId(null);
  }, []);

  const handleSelectTransition = useCallback((transId: string | null) => {
    setSelectedTransitionId(transId);
    if (transId) setSelectedStepId(null);
  }, []);

  // Cập nhật khối
  const handleUpdateStep = useCallback(
    (updatedStep: ProcessStep) => {
      pushToHistory(workflow);
      setWorkflow((prev) => ({
        ...prev,
        steps: prev.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
      }));
      setHasUnsavedChanges(true);
    },
    [workflow, pushToHistory]
  );

  // Xóa khối
  const handleDeleteStep = useCallback(
    (stepId: string) => {
      pushToHistory(workflow);
      const stepToDelete = workflow.steps.find((s) => s.id === stepId);
      setWorkflow((prev) => ({
        ...prev,
        steps: prev.steps.filter((s) => s.id !== stepId),
        transitions: prev.transitions.filter(
          (t) => t.fromStepId !== stepId && t.toStepId !== stepId
        ),
      }));
      setSelectedStepId(null);
      setHasUnsavedChanges(true);
      showToast(`✓ Đã xóa khối "${stepToDelete?.name || 'thành phần'}".`);
    },
    [workflow, pushToHistory, showToast]
  );

  // Cập nhật đường chuyển tiếp
  const handleUpdateTransition = useCallback(
    (updatedTrans: ProcessTransition) => {
      pushToHistory(workflow);
      setWorkflow((prev) => ({
        ...prev,
        transitions: prev.transitions.map((t) => (t.id === updatedTrans.id ? updatedTrans : t)),
      }));
      setHasUnsavedChanges(true);
    },
    [workflow, pushToHistory]
  );

  // Xóa đường chuyển tiếp
  const handleDeleteTransition = useCallback(
    (transId: string) => {
      pushToHistory(workflow);
      setWorkflow((prev) => ({
        ...prev,
        transitions: prev.transitions.filter((t) => t.id !== transId),
      }));
      setSelectedTransitionId(null);
      setHasUnsavedChanges(true);
      showToast('✓ Đã xóa đường nối luồng.');
    },
    [workflow, pushToHistory, showToast]
  );

  // Nối connector giữa 2 khối
  const handleConnectSteps = useCallback(
    (fromStepId: string, toStepId: string, customLabel?: string) => {
      if (fromStepId === toStepId) {
        showToast('⚠️ Không thể nối đường luồng vào chính khối đó.');
        return;
      }

      const fromStep = workflow.steps.find((s) => s.id === fromStepId);
      const toStep = workflow.steps.find((s) => s.id === toStepId);

      const exists = workflow.transitions.some(
        (t) => t.fromStepId === fromStepId && t.toStepId === toStepId
      );
      if (exists) {
        showToast('⚠️ Đường chuyển giữa 2 khối này đã tồn tại.');
        return;
      }

      const existingFrom = workflow.transitions.filter((t) => t.fromStepId === fromStepId);

      let transLabel = customLabel;
      if (!transLabel) {
        if (fromStep?.nodeType === 'CHECK') {
          // Nhánh điều kiện: Nhánh đầu tiên mặc định "Đúng", nhánh thứ hai mặc định "Sai"
          transLabel = existingFrom.length === 0 ? 'Đúng' : 'Sai';
        } else {
          transLabel = `${fromStep?.name || ''} → ${toStep?.name || ''}`;
        }
      }

      const newTrans: ProcessTransition = {
        id: `trans-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        actionName: transLabel,
        name: transLabel,
        fromStepId,
        toStepId,
        fromStepName: fromStep?.name,
        toStepName: toStep?.name,
        type: 'normal',
        allowedRoles: ['Cán bộ thụ lý'],
        createNextTask: true,
        taskAssigneeRole: 'Chuyên môn',
        conditions: [],
      };

      pushToHistory(workflow);
      setWorkflow((prev) => ({
        ...prev,
        transitions: [...prev.transitions, newTrans],
      }));
      setSelectedTransitionId(newTrans.id);
      setSelectedStepId(null);
      setHasUnsavedChanges(true);
      showToast(`✓ Đã tạo đường nối: ${transLabel}`);
    },
    [workflow, pushToHistory, showToast]
  );

  // Nhân bản khối (Duplicate)
  const handleDuplicateStep = useCallback(
    (stepId: string) => {
      const targetStep = workflow.steps.find((s) => s.id === stepId);
      if (!targetStep) return;

      pushToHistory(workflow);
      const newPos = {
        x: (targetStep.position?.x || 120) + 40,
        y: (targetStep.position?.y || 120) + 40,
      };

      const newStep: ProcessStep = {
        ...targetStep,
        id: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: `STEP-${String(workflow.steps.length + 1).padStart(3, '0')}`,
        name: `${targetStep.name} (Bản sao)`,
        position: newPos,
      };

      setWorkflow((prev) => ({
        ...prev,
        steps: [...prev.steps, newStep],
      }));

      setSelectedStepId(newStep.id);
      setSelectedTransitionId(null);
      setHasUnsavedChanges(true);
      showToast(`✓ Đã nhân bản khối "${targetStep.name}".`);
    },
    [workflow, pushToHistory, showToast]
  );

  // Tạo khối mới bằng click từ thư viện bên trái
  const handleAddNodeFromPalette = useCallback(
    (type: WorkflowNodeType, defaultName: string) => {
      pushToHistory(workflow);

      // Tìm vị trí thoáng trên canvas
      const maxX = workflow.steps.reduce(
        (max, s) => Math.max(max, s.position?.x || 100),
        100
      );
      const lastStep = workflow.steps[workflow.steps.length - 1];
      const newX = maxX > 600 ? maxX + 220 : (lastStep?.position?.x || 120) + 220;
      const newY = lastStep?.position?.y || 200;

      const newStep: ProcessStep = {
        id: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: `STEP-${String(workflow.steps.length + 1).padStart(3, '0')}`,
        name: defaultName,
        laneId: workflow.lanes[0]?.id || 'lane-default',
        stageId: workflow.stages[0]?.id || 'stage-default',
        nodeType: type,
        isStart: type === 'START',
        isEnd: type === 'END',
        timeLimitDays: type === 'TASK' ? 3 : 1,
        workHours: 24,
        warningBeforeHours: 4,
        workSchedule: 'Hành chính',
        storedDocuments: [],
        stepForms: [],
        statusChangeDoc: '',
        position: { x: newX, y: newY },
        assigneeRole: type === 'TASK' ? 'Cán bộ Chuyên môn' : undefined,
        dataFields:
          type === 'INFO_GROUP'
            ? [
              { id: `f-${Date.now()}-1`, name: 'Mã số hồ sơ', type: 'Văn bản ngắn', required: true },
              { id: `f-${Date.now()}-2`, name: 'Trích yếu yêu cầu', type: 'Văn bản dài', required: true },
            ]
            : undefined,
        conditionConfig:
          type === 'CHECK'
            ? {
              fieldName: 'Thẩm quyền thụ lý',
              operator: '=',
              compareValue: 'Đúng thẩm quyền',
            }
            : undefined,
        fieldType: type === 'DATA_FIELD' ? 'Văn bản ngắn' : undefined,
        required: type === 'DATA_FIELD' ? true : undefined,
      };

      setWorkflow((prev) => ({
        ...prev,
        steps: [...prev.steps, newStep],
      }));

      setSelectedStepId(newStep.id);
      setSelectedTransitionId(null);
      setHasUnsavedChanges(true);
      showToast(`✓ Đã thêm "${newStep.name}" vào canvas.`);
    },
    [workflow, pushToHistory, showToast]
  );

  // Thả khối mới từ palette vào tọa độ cụ thể trên canvas
  const handleDropNewNode = useCallback(
    (type: WorkflowNodeType, x: number, y: number, defaultName?: string) => {
      pushToHistory(workflow);

      const resolvedName =
        defaultName ||
        (type === 'START'
          ? 'Bắt đầu'
          : type === 'END'
            ? 'Kết thúc'
            : type === 'CHECK'
              ? 'Điều kiện kiểm tra'
              : type === 'INFO_GROUP'
                ? 'Nhóm thông tin mới'
                : type === 'DATA_FIELD'
                  ? 'Trường dữ liệu mới'
                  : 'Bước xử lý mới');

      const newStep: ProcessStep = {
        id: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: `STEP-${String(workflow.steps.length + 1).padStart(3, '0')}`,
        name: resolvedName,
        laneId: workflow.lanes[0]?.id || 'lane-default',
        stageId: workflow.stages[0]?.id || 'stage-default',
        nodeType: type,
        isStart: type === 'START',
        isEnd: type === 'END',
        timeLimitDays: type === 'TASK' ? 3 : 1,
        workHours: 24,
        warningBeforeHours: 4,
        workSchedule: 'Hành chính',
        storedDocuments: [],
        stepForms: [],
        statusChangeDoc: '',
        position: { x, y },
        assigneeRole: type === 'TASK' ? 'Cán bộ Chuyên môn' : undefined,
        dataFields:
          type === 'INFO_GROUP'
            ? [
              { id: `f-${Date.now()}-1`, name: 'Mã số hồ sơ', type: 'Văn bản ngắn', required: true },
              { id: `f-${Date.now()}-2`, name: 'Trích yếu yêu cầu', type: 'Văn bản dài', required: true },
            ]
            : undefined,
        conditionConfig:
          type === 'CHECK'
            ? {
              fieldName: 'Thẩm quyền thụ lý',
              operator: '=',
              compareValue: 'Đúng thẩm quyền',
            }
            : undefined,
        fieldType: type === 'DATA_FIELD' ? 'Văn bản ngắn' : undefined,
        required: type === 'DATA_FIELD' ? true : undefined,
      };

      setWorkflow((prev) => ({
        ...prev,
        steps: [...prev.steps, newStep],
      }));

      setSelectedStepId(newStep.id);
      setSelectedTransitionId(null);
      setHasUnsavedChanges(true);
      showToast(`✓ Đã thêm "${newStep.name}" vào vị trí đã kéo.`);
    },
    [workflow, pushToHistory, showToast]
  );

  // Lưu sơ đồ quy trình
  const handleSave = () => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated: ProcessWorkflow = {
      ...workflow,
      updatedAt: dateStr,
      updatedBy: 'Cán bộ quản trị quy trình',
    };

    setWorkflow(updated);
    setSavedWorkflow(updated);
    setHasUnsavedChanges(false);
    onSaveWorkflow(updated);
    showToast('✓ Đã lưu sơ đồ quy trình thành công!');
  };

  // Nút Thoát / Quay lại
  const handleRequestBack = () => {
    if (hasUnsavedChanges) {
      setIsUnsavedModalOpen(true);
    } else {
      onBackToList();
    }
  };

  // Đối tượng được chọn hiện tại
  const selectedStep = useMemo(() => {
    return workflow.steps.find((s) => s.id === selectedStepId) || null;
  }, [workflow.steps, selectedStepId]);

  const selectedTransition = useMemo(() => {
    return workflow.transitions.find((t) => t.id === selectedTransitionId) || null;
  }, [workflow.transitions, selectedTransitionId]);

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-slate-100 select-none">
      {/* ==================================================================== */}
      {/* 2. THANH TIÊU ĐỀ (TOP BAR)                                           */}
      {/* Tên quy trình | Trạng thái lưu | Hoàn tác/Làm lại | Nút Lưu | Xem trước*/}
      {/* ==================================================================== */}
      <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shadow-2xs">
        {/* Left: Nút quay lại & Tên quy trình & Trạng thái lưu */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleRequestBack}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Quay lại danh sách quy trình"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* Biểu tượng quy trình & Tên quy trình */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
                {workflow.name}
              </h1>
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {workflow.code}
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Trạng thái lưu */}
          <div className="hidden sm:flex items-center">
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Có thay đổi chưa lưu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Đã lưu
              </span>
            )}
          </div>
        </div>

        {/* Right: Hoàn tác/Làm lại | Nút Lưu | Nút Xem trước */}
        <div className="flex items-center gap-2">
          {/* Hoàn tác / Làm lại */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
            <button
              type="button"
              disabled={pastWorkflows.length === 0 || isReadOnly}
              onClick={handleUndo}
              title={
                pastWorkflows.length > 0
                  ? 'Hoàn tác (Ctrl+Z)'
                  : 'Không có thao tác nào để hoàn tác'
              }
              className={`p-1.5 rounded-lg transition-all ${pastWorkflows.length > 0 && !isReadOnly
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-white cursor-pointer shadow-2xs'
                  : 'text-slate-300 cursor-not-allowed'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">undo</span>
            </button>
            <button
              type="button"
              disabled={futureWorkflows.length === 0 || isReadOnly}
              onClick={handleRedo}
              title={
                futureWorkflows.length > 0
                  ? 'Làm lại (Ctrl+Y)'
                  : 'Không có thao tác nào để làm lại'
              }
              className={`p-1.5 rounded-lg transition-all ${futureWorkflows.length > 0 && !isReadOnly
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-white cursor-pointer shadow-2xs'
                  : 'text-slate-300 cursor-not-allowed'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">redo</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Nút Xem trước */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Xem trước luồng thực thi và kiểm tra hợp lệ"
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600">visibility</span>
            <span>Xem trước</span>
          </button>

          {/* Nút Lưu */}
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${hasUnsavedChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            title="Lưu lại sơ đồ quy trình (Ctrl+S)"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Lưu</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 1. BỐ CỤC CHÍNH 3 KHU VỰC:                                           */}
      {/* A. Bên trái: Thư viện thành phần (220px)                             */}
      {/* B. Ở giữa: Canvas thiết kế quy trình (Draw.io style)                */}
      {/* C. Bên phải: Thuộc tính (280px)                                      */}
      {/* ==================================================================== */}
      <div className="flex-1 min-w-0 flex overflow-hidden relative">
        {/* KHU VỰC A: BÊN TRÁI — THƯ VIỆN THÀNH PHẦN (220px) */}
        <DrawioLeftPalette
          onAddNode={handleAddNodeFromPalette}
          isReadOnly={isReadOnly}
        />

        {/* KHU VỰC B: Ở GIỮA — CANVAS THIẾT KẾ QUY TRÌNH */}
        <DrawioCanvas
          steps={workflow.steps}
          transitions={workflow.transitions}
          selectedStepId={selectedStepId}
          selectedTransitionId={selectedTransitionId}
          zoomLevel={zoomLevel}
          onSelectStep={handleSelectStep}
          onSelectTransition={handleSelectTransition}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
          onUpdateTransition={handleUpdateTransition}
          onDeleteTransition={handleDeleteTransition}
          onConnectSteps={handleConnectSteps}
          onDuplicateStep={handleDuplicateStep}
          onDropNewNode={handleDropNewNode}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onFitView={handleFitView}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          hasUnsavedChanges={hasUnsavedChanges}
          canUndo={pastWorkflows.length > 0 && !isReadOnly}
          canRedo={futureWorkflows.length > 0 && !isReadOnly}
          isReadOnly={isReadOnly}
        />

        {/* KHU VỰC C: BÊN PHẢI — THUỘC TÍNH (280px) */}
        <DrawioPropertiesPanel
          selectedStep={selectedStep}
          selectedTransition={selectedTransition}
          allSteps={workflow.steps}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
          onUpdateTransition={handleUpdateTransition}
          onDeleteTransition={handleDeleteTransition}
          onSave={handleSave}
          hasUnsavedChanges={hasUnsavedChanges}
          onClose={() => {
            setSelectedStepId(null);
            setSelectedTransitionId(null);
          }}
          isReadOnly={isReadOnly}
        />
      </div>

      <DrawioPreviewModal
        workflow={workflow}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSelectStep={(stepId) => {
          setSelectedStepId(stepId);
          setSelectedTransitionId(null);
        }}
      />
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onCancel={() => setIsUnsavedModalOpen(false)}
        onDiscardAndLeave={() => {
          setIsUnsavedModalOpen(false);
          onBackToList();
        }}
        onSaveAndLeave={() => {
          setIsUnsavedModalOpen(false);
          handleSave();
          onBackToList();
        }}
      />

      {/* Toast thông báo nhanh */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-xs animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-[16px] text-blue-400">info</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
