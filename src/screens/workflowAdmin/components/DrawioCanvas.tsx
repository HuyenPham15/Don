// src/screens/workflowAdmin/components/DrawioCanvas.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ProcessStep,
  ProcessTransition,
  WorkflowNodeType,
} from '../../../types/workflowConfig';

export interface DrawioPort {
  id: 'top' | 'right' | 'bottom' | 'left';
  x: number;
  y: number;
}

interface DrawioCanvasProps {
  steps: ProcessStep[];
  transitions: ProcessTransition[];
  selectedStepId: string | null;
  selectedTransitionId: string | null;
  zoomLevel: number;
  onSelectStep: (stepId: string | null) => void;
  onSelectTransition: (transId: string | null) => void;
  onUpdateStep: (updated: ProcessStep) => void;
  onDeleteStep: (stepId: string) => void;
  onUpdateTransition: (updated: ProcessTransition) => void;
  onDeleteTransition: (transId: string) => void;
  onConnectSteps: (fromStepId: string, toStepId: string, label?: string) => void;
  onDuplicateStep: (stepId: string) => void;
  onDropNewNode: (type: WorkflowNodeType, x: number, y: number, defaultName?: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave?: () => void;
  hasUnsavedChanges?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly?: boolean;
}

// Kích thước chuẩn của từng khối
const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  START: { width: 140, height: 48 },
  END: { width: 140, height: 48 },
  CHECK: { width: 150, height: 80 },
  INFO_GROUP: { width: 180, height: 74 },
  DATA_FIELD: { width: 160, height: 50 },
  TASK: { width: 180, height: 74 },
};

function getNodeSize(type?: WorkflowNodeType) {
  return NODE_DIMENSIONS[type || 'TASK'] || NODE_DIMENSIONS.TASK;
}

export default function DrawioCanvas({
  steps,
  transitions,
  selectedStepId,
  selectedTransitionId,
  zoomLevel,
  onSelectStep,
  onSelectTransition,
  onUpdateStep,
  onDeleteStep,
  onUpdateTransition,
  onDeleteTransition,
  onConnectSteps,
  onDuplicateStep,
  onDropNewNode,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitView,
  onUndo,
  onRedo,
  onSave,
  hasUnsavedChanges = false,
  canUndo,
  canRedo,
  isReadOnly = false,
}: DrawioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan (kéo canvas)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging node
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartClientPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Inline rename state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  // Connecting line (kéo từ connection port)
  const [connectingSource, setConnectingSource] = useState<{
    stepId: string;
    port: 'top' | 'right' | 'bottom' | 'left';
  } | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Hovered node state for connection ports
  const [hoveredStepId, setHoveredStepId] = useState<string | null>(null);

  // Delete confirmation modal
  const [confirmDeleteStep, setConfirmDeleteStep] = useState<ProcessStep | null>(null);

  // Tính toán tọa độ hiển thị ban đầu nếu node chưa có position explicit
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    steps.forEach((step, idx) => {
      if (step.position && typeof step.position.x === 'number' && typeof step.position.y === 'number') {
        map.set(step.id, { x: step.position.x, y: step.position.y });
      } else {
        // Tự động sắp xếp sơ đồ ngang theo chuỗi tuần tự
        const defaultX = 100 + (idx % 4) * 240;
        const defaultY = 100 + Math.floor(idx / 4) * 160;
        map.set(step.id, { x: defaultX, y: defaultY });
      }
    });
    return map;
  }, [steps]);

  // Phím tắt bàn phím (Delete, Undo, Redo, Duplicate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua khi đang gõ text trong input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStepId && !isReadOnly) {
          const step = steps.find((s) => s.id === selectedStepId);
          if (step) {
            const relCount = transitions.filter(
              (t) => t.fromStepId === selectedStepId || t.toStepId === selectedStepId
            ).length;
            if (relCount > 0) {
              setConfirmDeleteStep(step);
            } else {
              onDeleteStep(selectedStepId);
            }
          }
        } else if (selectedTransitionId && !isReadOnly) {
          onDeleteTransition(selectedTransitionId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) onRedo();
        } else {
          if (canUndo) onUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) onRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedStepId && !isReadOnly) {
          onDuplicateStep(selectedStepId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedStepId,
    selectedTransitionId,
    steps,
    transitions,
    onDeleteStep,
    onDeleteTransition,
    onDuplicateStep,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    isReadOnly,
  ]);

  // Tọa độ canvas từ chuột
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoomLevel;
      const y = (clientY - rect.top - pan.y) / zoomLevel;
      return { x, y };
    },
    [pan, zoomLevel]
  );

  // Bắt đầu pan canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Chỉ pan khi click trực tiếp vào background canvas
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'drawio-canvas-surface') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      onSelectStep(null);
      onSelectTransition(null);
    }
  };

  // Global window listeners để bắt mouseup/mousemove ngay cả khi chuột di chuyển ra ngoài canvas hoặc qua element khác
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
        return;
      }

      if (draggingNodeId && !isReadOnly) {
        const dist = Math.hypot(
          e.clientX - dragStartClientPosRef.current.x,
          e.clientY - dragStartClientPosRef.current.y
        );
        // Ngưỡng di chuyển 3px để phân biệt click chọn node vs kéo node
        if (dist < 3 && !hasDraggedRef.current) {
          return;
        }
        hasDraggedRef.current = true;

        const coords = getCanvasCoords(e.clientX, e.clientY);
        const rawX = coords.x - dragOffsetRef.current.x;
        const rawY = coords.y - dragOffsetRef.current.y;
        const snappedX = Math.round(rawX / 10) * 10;
        const snappedY = Math.round(rawY / 10) * 10;

        const target = steps.find((s) => s.id === draggingNodeId);
        if (target) {
          onUpdateStep({
            ...target,
            position: { x: Math.max(20, snappedX), y: Math.max(20, snappedY) },
          });
        }
        return;
      }

      if (connectingSource) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setConnectingMousePos(coords);
      }
    };

    const handleWindowMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
      setConnectingSource(null);
      setConnectingMousePos(null);
      hasDraggedRef.current = false;
    };

    if (isPanning || draggingNodeId || connectingSource) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [
    isPanning,
    draggingNodeId,
    connectingSource,
    isReadOnly,
    getCanvasCoords,
    steps,
    onUpdateStep,
  ]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Để tương thích khi di chuột trong container nếu window listener chưa kích hoạt
    if (connectingSource) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setConnectingMousePos(coords);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingSource(null);
    setConnectingMousePos(null);
    hasDraggedRef.current = false;
  };

  // Drag & drop khối từ thư viện vào canvas
  const handleDragOver = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    const type = e.dataTransfer.getData('application/workflow-node-type') as WorkflowNodeType;
    const name = e.dataTransfer.getData('text/plain') || 'Khối mới';
    if (!type) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    const snappedX = Math.round(coords.x / 10) * 10;
    const snappedY = Math.round(coords.y / 10) * 10;
    onDropNewNode(type, Math.max(30, snappedX), Math.max(30, snappedY), name);
  };

  // Bắt đầu kéo node
  const handleNodeMouseDown = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    onSelectStep(stepId);
    onSelectTransition(null);

    if (isReadOnly) return;

    dragStartClientPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;

    const pos = nodePositions.get(stepId) || { x: 100, y: 100 };
    const coords = getCanvasCoords(e.clientX, e.clientY);
    dragOffsetRef.current = {
      x: coords.x - pos.x,
      y: coords.y - pos.y,
    };
    setDraggingNodeId(stepId);
  };

  // Bắt đầu kéo connector từ port
  const handlePortMouseDown = (
    e: React.MouseEvent,
    stepId: string,
    port: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    e.stopPropagation();
    if (isReadOnly) return;

    setConnectingSource({ stepId, port });
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setConnectingMousePos(coords);
  };

  // Kết thúc kéo connector lên target node hoặc nhả chuột
  const handleNodeMouseUp = (e: React.MouseEvent, targetStepId: string) => {
    e.stopPropagation();
    if (connectingSource && connectingSource.stepId !== targetStepId) {
      const sourceStep = steps.find((s) => s.id === connectingSource.stepId);
      // Nếu khối nguồn là điều kiện: gán nhãn Đúng/Sai tự động
      let defaultLabel: string | undefined = undefined;
      if (sourceStep?.nodeType === 'CHECK') {
        const outCount = transitions.filter((t) => t.fromStepId === sourceStep.id).length;
        defaultLabel = outCount === 0 ? 'Đúng' : 'Sai';
      }

      onConnectSteps(connectingSource.stepId, targetStepId, defaultLabel);
    }

    // Luôn dọn dẹp trạng thái kéo / nối khi nhả chuột trên khối
    setConnectingSource(null);
    setConnectingMousePos(null);
    setDraggingNodeId(null);
    hasDraggedRef.current = false;
  };

  // Bắt đầu sửa tên inline
  const handleStartRename = (e: React.MouseEvent, step: ProcessStep) => {
    e.stopPropagation();
    setEditingNodeId(step.id);
    setEditNameText(step.name);
  };

  // Lưu tên inline
  const handleSaveRename = (stepId: string) => {
    if (editNameText.trim()) {
      const step = steps.find((s) => s.id === stepId);
      if (step) {
        onUpdateStep({ ...step, name: editNameText.trim() });
      }
    }
    setEditingNodeId(null);
  };

  // Tính toán tọa độ 4 connection ports của 1 node
  const getNodePorts = useCallback(
    (stepId: string, type?: WorkflowNodeType): Record<'top' | 'right' | 'bottom' | 'left', { x: number; y: number }> => {
      const pos = nodePositions.get(stepId) || { x: 100, y: 100 };
      const size = getNodeSize(type);
      return {
        top: { x: pos.x + size.width / 2, y: pos.y },
        right: { x: pos.x + size.width, y: pos.y + size.height / 2 },
        bottom: { x: pos.x + size.width / 2, y: pos.y + size.height },
        left: { x: pos.x, y: pos.y + size.height / 2 },
      };
    },
    [nodePositions]
  );

  // Tính toán điểm xuất phát & kết thúc tối ưu cho đường nối giữa 2 node
  const getOptimalConnectorPoints = useCallback(
    (fromStepId: string, toStepId: string) => {
      const fromStep = steps.find((s) => s.id === fromStepId);
      const toStep = steps.find((s) => s.id === toStepId);
      const fromPorts = getNodePorts(fromStepId, fromStep?.nodeType);
      const toPorts = getNodePorts(toStepId, toStep?.nodeType);

      const fromPos = nodePositions.get(fromStepId) || { x: 0, y: 0 };
      const toPos = nodePositions.get(toStepId) || { x: 0, y: 0 };

      // Khoảng cách tương đối giữa 2 tâm
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;

      let p1 = fromPorts.right;
      let p2 = toPorts.left;

      if (Math.abs(dx) >= Math.abs(dy)) {
        if (dx >= 0) {
          p1 = fromPorts.right;
          p2 = toPorts.left;
        } else {
          p1 = fromPorts.left;
          p2 = toPorts.right;
        }
      } else {
        if (dy >= 0) {
          p1 = fromPorts.bottom;
          p2 = toPorts.top;
        } else {
          p1 = fromPorts.top;
          p2 = toPorts.bottom;
        }
      }

      return { p1, p2 };
    },
    [steps, getNodePorts, nodePositions]
  );

  // Tạo đường dẫn cong mượt SVG giữa 2 điểm
  const createSmoothPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    const dy = Math.abs(y2 - y1) * 0.5;
    const offset = Math.max(40, Math.min(120, Math.max(dx, dy)));

    let cx1 = x1 + offset;
    let cy1 = y1;
    let cx2 = x2 - offset;
    let cy2 = y2;

    if (x2 < x1) {
      cx1 = x1 + 40;
      cx2 = x2 - 40;
    }

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  // Toggle Đúng / Sai cho nhánh điều kiện khi bấm vào nhãn
  const handleToggleConditionLabel = (e: React.MouseEvent, trans: ProcessTransition) => {
    e.stopPropagation();
    if (isReadOnly) return;
    const current = trans.label || trans.name || '';
    const next = current === 'Đúng' ? 'Sai' : 'Đúng';
    onUpdateTransition({
      ...trans,
      label: next,
      name: next,
      actionName: next,
    });
  };

  return (
    <div
      ref={containerRef}
      id="drawio-canvas-container"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 min-w-0 w-full h-full relative overflow-hidden bg-[#f8fafc] select-none cursor-default"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* 1. Canvas Infinite Surface Wrapper (với pan và zoom) */}
      <div
        id="drawio-canvas-surface"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      >
        {/* SVG Layer cho đường nối & mũi tên (Connectors) */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '10000px', height: '10000px' }}
        >
          <defs>
            {/* Mũi tên chuẩn */}
            <marker
              id="drawio-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>

            {/* Mũi tên khi được chọn */}
            <marker
              id="drawio-arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>

            {/* Mũi tên trả lại / cảnh báo */}
            <marker
              id="drawio-arrow-return"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Render các Transition / Connector đã có */}
          {transitions.map((trans) => {
            const points = getOptimalConnectorPoints(trans.fromStepId, trans.toStepId);
            const pathData = createSmoothPath(points.p1.x, points.p1.y, points.p2.x, points.p2.y);
            const isSelected = selectedTransitionId === trans.id;
            const isReturn = trans.type === 'return';

            return (
              <g key={trans.id} className="cursor-pointer pointer-events-auto">
                {/* Hitbox click dày vô hình */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTransition(trans.id);
                    onSelectStep(null);
                  }}
                />

                {/* Đường vẽ hiển thị */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? '#2563eb' : isReturn ? '#f59e0b' : '#64748b'}
                  strokeWidth={isSelected ? '2.5' : '1.75'}
                  strokeDasharray={isReturn ? '5,4' : undefined}
                  markerEnd={
                    isSelected
                      ? 'url(#drawio-arrow-selected)'
                      : isReturn
                      ? 'url(#drawio-arrow-return)'
                      : 'url(#drawio-arrow)'
                  }
                  className="transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTransition(trans.id);
                    onSelectStep(null);
                  }}
                />
              </g>
            );
          })}

          {/* Đường vẽ động khi đang kéo tạo kết nối từ port */}
          {connectingSource && connectingMousePos && (
            <path
              d={createSmoothPath(
                getNodePorts(connectingSource.stepId)[connectingSource.port].x,
                getNodePorts(connectingSource.stepId)[connectingSource.port].y,
                connectingMousePos.x,
                connectingMousePos.y
              )}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4,4"
              markerEnd="url(#drawio-arrow-selected)"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Render nhãn trên các đường nối (Đúng / Sai hoặc nhãn chuyển) */}
        {transitions.map((trans) => {
          const points = getOptimalConnectorPoints(trans.fromStepId, trans.toStepId);
          const midX = (points.p1.x + points.p2.x) / 2;
          const midY = (points.p1.y + points.p2.y) / 2;
          const label = trans.label || trans.name;
          const isSelected = selectedTransitionId === trans.id;
          const isConditionBranch = label === 'Đúng' || label === 'Sai';

          if (!label && !isSelected) return null;

          return (
            <div
              key={`label-${trans.id}`}
              style={{
                left: `${midX}px`,
                top: `${midY}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTransition(trans.id);
                onSelectStep(null);
              }}
              className="absolute pointer-events-auto z-10"
            >
              {isConditionBranch ? (
                <button
                  type="button"
                  onClick={(e) => handleToggleConditionLabel(e, trans)}
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border shadow-xs transition-all cursor-pointer flex items-center gap-1 ${
                    label === 'Đúng'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                  title="Bấm để chuyển đổi Đúng / Sai"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${label === 'Đúng' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{label}</span>
                </button>
              ) : label ? (
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border bg-white shadow-2xs ${
                    isSelected ? 'border-blue-400 text-blue-800 ring-1 ring-blue-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {label}
                </div>
              ) : null}
            </div>
          );
        })}

        {/* Render danh sách các Khối (Nodes) trên Canvas */}
        {steps.map((step) => {
          const pos = nodePositions.get(step.id) || { x: 100, y: 100 };
          const isSelected = selectedStepId === step.id;
          const isHovered = hoveredStepId === step.id || connectingSource?.stepId === step.id;
          const size = getNodeSize(step.nodeType);
          const isEditing = editingNodeId === step.id;

          // Render theo từng loại khối theo chuẩn Draw.io
          return (
            <div
              key={step.id}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, step.id)}
              onMouseUp={(e) => handleNodeMouseUp(e, step.id)}
              onMouseEnter={() => setHoveredStepId(step.id)}
              onMouseLeave={() => setHoveredStepId(null)}
              className="absolute pointer-events-auto group cursor-move select-none"
            >
              {/* Draw.io Selection Bounding Box & 4 Corner Handles */}
              {isSelected && (
                <div className="absolute -inset-1 border-2 border-blue-500 rounded-lg pointer-events-none z-20">
                  <span className="w-2 h-2 bg-white border border-blue-600 absolute -top-1 -left-1" />
                  <span className="w-2 h-2 bg-white border border-blue-600 absolute -top-1 -right-1" />
                  <span className="w-2 h-2 bg-white border border-blue-600 absolute -bottom-1 -left-1" />
                  <span className="w-2 h-2 bg-white border border-blue-600 absolute -bottom-1 -right-1" />
                </div>
              )}

              {/* 4 Connection Ports (Top, Right, Bottom, Left) */}
              {(isHovered || isSelected) && !isReadOnly && (
                <>
                  {/* Top Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, step.id, 'top')}
                    className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-xs absolute left-1/2 -top-1.5 -translate-x-1/2 z-30 cursor-crosshair hover:scale-125 transition-transform"
                    title="Kéo để tạo đường nối"
                  />
                  {/* Right Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, step.id, 'right')}
                    className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-xs absolute -right-1.5 top-1/2 -translate-y-1/2 z-30 cursor-crosshair hover:scale-125 transition-transform"
                    title="Kéo để tạo đường nối"
                  />
                  {/* Bottom Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, step.id, 'bottom')}
                    className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-xs absolute left-1/2 -bottom-1.5 -translate-x-1/2 z-30 cursor-crosshair hover:scale-125 transition-transform"
                    title="Kéo để tạo đường nối"
                  />
                  {/* Left Port */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, step.id, 'left')}
                    className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-xs absolute -left-1.5 top-1/2 -translate-y-1/2 z-30 cursor-crosshair hover:scale-125 transition-transform"
                    title="Kéo để tạo đường nối"
                  />
                </>
              )}

              {/* KHỐI 1: BẮT ĐẦU (START - Khối bo tròn màu xanh lá) */}
              {step.nodeType === 'START' && (
                <div
                  onDoubleClick={(e) => handleStartRename(e, step)}
                  className="w-full h-full rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-900 px-4 flex items-center justify-between shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                      play_circle
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editNameText}
                        onChange={(e) => setEditNameText(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleSaveRename(step.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(step.id)}
                        className="w-full bg-white px-1.5 py-0.5 rounded text-xs font-bold text-slate-800 border border-blue-400 focus:outline-none"
                      />
                    ) : (
                      <span className="text-xs font-bold truncate">{step.name}</span>
                    )}
                  </div>
                </div>
              )}

              {/* KHỐI 2: KẾT THÚC (END - Khối bo tròn màu đỏ/hồng phân biệt) */}
              {step.nodeType === 'END' && (
                <div
                  onDoubleClick={(e) => handleStartRename(e, step)}
                  className="w-full h-full rounded-full border-2 border-rose-500 bg-rose-50 text-rose-900 px-4 flex items-center justify-between shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0">
                      stop_circle
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editNameText}
                        onChange={(e) => setEditNameText(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleSaveRename(step.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(step.id)}
                        className="w-full bg-white px-1.5 py-0.5 rounded text-xs font-bold text-slate-800 border border-blue-400 focus:outline-none"
                      />
                    ) : (
                      <span className="text-xs font-bold truncate">{step.name}</span>
                    )}
                  </div>
                </div>
              )}

              {/* KHỐI 3: ĐIỀU KIỆN (CHECK - Hình thoi rẽ nhánh) */}
              {step.nodeType === 'CHECK' && (
                <div
                  onDoubleClick={(e) => handleStartRename(e, step)}
                  className="w-full h-full relative flex items-center justify-center p-2 text-center"
                >
                  {/* SVG Diamond Shape Background */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 150 80">
                    <polygon
                      points="75,2 148,40 75,78 2,40"
                      fill="#fffbeb"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="relative z-10 px-4 py-1 min-w-0 max-w-[130px]">
                    <span className="material-symbols-outlined text-amber-600 text-[16px] block mx-auto leading-none mb-0.5">
                      alt_route
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editNameText}
                        onChange={(e) => setEditNameText(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleSaveRename(step.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(step.id)}
                        className="w-full bg-white px-1 py-0.5 rounded text-[11px] font-bold text-slate-800 border border-amber-400 focus:outline-none text-center"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-amber-950 block truncate leading-tight">
                        {step.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* KHỐI 4: NHÓM THÔNG TIN (INFO_GROUP - Hình chữ nhật có icon tài liệu) */}
              {step.nodeType === 'INFO_GROUP' && (
                <div
                  onDoubleClick={(e) => handleStartRename(e, step)}
                  className="w-full h-full rounded-xl border border-purple-300 bg-purple-50/70 p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-purple-600 text-[18px] shrink-0">
                      description
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editNameText}
                        onChange={(e) => setEditNameText(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleSaveRename(step.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(step.id)}
                        className="w-full bg-white px-1.5 py-0.5 rounded text-xs font-bold text-slate-800 border border-purple-400 focus:outline-none"
                      />
                    ) : (
                      <span className="text-xs font-bold text-purple-950 truncate">{step.name}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-purple-700 pt-1 border-t border-purple-200/60">
                    <span>
                      {step.dataFields?.length || 0} trường dữ liệu
                    </span>
                    <span className="text-[9.5px] font-mono bg-purple-200/50 px-1 rounded">
                      Thông tin
                    </span>
                  </div>
                </div>
              )}

              {/* KHỐI 5: TRƯỜNG DỮ LIỆU (DATA_FIELD) */}
              {step.nodeType === 'DATA_FIELD' && (
                <div
                  onDoubleClick={(e) => handleStartRename(e, step)}
                  className="w-full h-full rounded-lg border border-slate-300 bg-white p-2 flex items-center justify-between shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-slate-500 text-[17px] shrink-0">
                      short_text
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editNameText}
                        onChange={(e) => setEditNameText(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleSaveRename(step.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(step.id)}
                        className="w-full bg-white px-1 py-0.5 rounded text-xs font-semibold text-slate-800 border border-blue-400 focus:outline-none"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-800 truncate">{step.name}</span>
                    )}
                  </div>
                  <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {step.fieldType || 'Text'}
                  </span>
                </div>
              )}

              {/* KHỐI 6: BƯỚC XỬ LÝ CHUẨN (TASK - Hình chữ nhật bo góc) */}
              {(!step.nodeType || step.nodeType === 'TASK' || step.nodeType === 'APPROVAL') && (
                <div
                  onDoubleClick={(e) => handleStartRename(e, step)}
                  className="w-full h-full rounded-xl border border-slate-300 bg-white p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0">
                      task_alt
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editNameText}
                        onChange={(e) => setEditNameText(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleSaveRename(step.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(step.id)}
                        className="w-full bg-white px-1.5 py-0.5 rounded text-xs font-bold text-slate-800 border border-blue-400 focus:outline-none"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-800 truncate" title={step.name}>
                        {step.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[110px]" title={step.assigneeRole || 'Cán bộ Chuyên môn'}>
                      {step.assigneeRole || 'Cán bộ thụ lý'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {step.timeLimitDays ? `${step.timeLimitDays}d` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Floating Draw.io Canvas Toolbar at Bottom (Hoàn tác, Làm lại, Zoom, Fit, Xóa, Nhân bản) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-slate-200/90 select-none">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canUndo || isReadOnly}
            onClick={onUndo}
            title="Hoàn tác (Ctrl+Z)"
            className={`p-1.5 rounded-xl border transition-all ${
              canUndo && !isReadOnly
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs'
                : 'border-slate-200/50 bg-slate-100/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
          </button>
          <button
            type="button"
            disabled={!canRedo || isReadOnly}
            onClick={onRedo}
            title="Làm lại (Ctrl+Y)"
            className={`p-1.5 rounded-xl border transition-all ${
              canRedo && !isReadOnly
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs'
                : 'border-slate-200/50 bg-slate-100/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">redo</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Zoom controls */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/80">
          <button
            type="button"
            onClick={onZoomOut}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all cursor-pointer"
            title="Thu nhỏ (-)"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span
            onClick={onZoomReset}
            className="px-2 font-mono text-[11px] font-semibold text-slate-600 cursor-pointer select-none hover:text-blue-700"
            title="Nhấp để đặt lại 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all cursor-pointer"
            title="Phóng to (+)"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Fit to screen */}
        <button
          type="button"
          onClick={() => {
            setPan({ x: 80, y: 80 });
            onFitView();
          }}
          className="p-1.5 px-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 bg-white rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          title="Căn giữa sơ đồ (Fit to screen)"
        >
          <span className="material-symbols-outlined text-[17px]">filter_center_focus</span>
          <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline">Căn giữa</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Duplicate selected */}
        <button
          type="button"
          disabled={!selectedStepId || isReadOnly}
          onClick={() => selectedStepId && onDuplicateStep(selectedStepId)}
          className={`p-1.5 px-2 rounded-xl border transition-colors flex items-center gap-1.5 ${
            selectedStepId && !isReadOnly
              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs'
              : 'border-slate-200/50 bg-slate-100/50 text-slate-400 cursor-not-allowed'
          }`}
          title="Nhân bản khối đang chọn (Ctrl+D)"
        >
          <span className="material-symbols-outlined text-[17px]">content_copy</span>
          <span className="text-[11px] font-semibold hidden sm:inline">Nhân bản</span>
        </button>

        {/* Delete selected */}
        <button
          type="button"
          disabled={(!selectedStepId && !selectedTransitionId) || isReadOnly}
          onClick={() => {
            if (selectedStepId) {
              const step = steps.find((s) => s.id === selectedStepId);
              if (step) {
                const relCount = transitions.filter(
                  (t) => t.fromStepId === selectedStepId || t.toStepId === selectedStepId
                ).length;
                if (relCount > 0) {
                  setConfirmDeleteStep(step);
                } else {
                  onDeleteStep(selectedStepId);
                }
              }
            } else if (selectedTransitionId) {
              onDeleteTransition(selectedTransitionId);
            }
          }}
          className={`p-1.5 px-2 rounded-xl border transition-colors flex items-center gap-1.5 ${
            (selectedStepId || selectedTransitionId) && !isReadOnly
              ? 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer shadow-2xs'
              : 'border-slate-200/50 bg-slate-100/50 text-slate-400 cursor-not-allowed'
          }`}
          title="Xóa thành phần đang chọn (Delete)"
        >
          <span className="material-symbols-outlined text-[17px]">delete</span>
          <span className="text-[11px] font-semibold hidden sm:inline">Xóa</span>
        </button>

        {/* Nút Lưu trực tiếp trên thanh công cụ canvas */}
        {onSave && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={onSave}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
              title="Lưu lại sơ đồ quy trình (Ctrl+S)"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu</span>
            </button>
          </>
        )}
      </div>

      {/* 3. Modal xác nhận xóa khối khi đã có kết nối */}
      {confirmDeleteStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Xác nhận xóa khối?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Khối &quot;{confirmDeleteStep.name}&quot; đang có các đường nối liên kết.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
              Xóa khối này sẽ đồng thời xóa toàn bộ các đường chuyển liên quan đến nó trong sơ đồ.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteStep(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStep(confirmDeleteStep.id);
                  setConfirmDeleteStep(null);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
