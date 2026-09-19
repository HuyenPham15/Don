// src/screens/workflowAdmin/components/WorkflowCanvas.tsx
import React, { useState, useRef } from 'react';
import {
  ProcessStep,
  ProcessTransition,
  ProcessLane,
  ProcessStage,
} from '../../../types/workflowConfig';

interface WorkflowCanvasProps {
  steps: ProcessStep[];
  transitions: ProcessTransition[];
  lanes: ProcessLane[];
  stages: ProcessStage[];
  selectedStepId: string | null;
  selectedTransitionId: string | null;
  focusedTarget: { type: 'step' | 'transition' | 'general'; id?: string } | null;
  zoomLevel: number;
  onSelectStep: (stepId: string) => void;
  onSelectTransition: (transId: string) => void;
  onMoveStep: (stepId: string, targetLaneId: string, targetStageId: string) => void;
  onConnectSteps: (fromStepId: string, toStepId: string) => void;
  isReadOnly?: boolean;
}

// Geometry constants for accurate card & connector placement
const STAGE_COL_WIDTH = 260;
const LANE_HEADER_WIDTH = 190;
const LANE_ROW_HEIGHT = 195;
const CARD_WIDTH = 210;
const CARD_HEIGHT = 135;

export default function WorkflowCanvas({
  steps,
  transitions,
  lanes,
  stages,
  selectedStepId,
  selectedTransitionId,
  focusedTarget,
  zoomLevel,
  onSelectStep,
  onSelectTransition,
  onMoveStep,
  onConnectSteps,
  isReadOnly = false,
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag & drop state
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ laneId: string; stageId: string } | null>(null);

  // Connect mode state (click to connect)
  const [connectingSourceStepId, setConnectingSourceStepId] = useState<string | null>(null);

  // Tính toán tọa độ tâm và biên của từng bước
  const stepPositions = React.useMemo(() => {
    const map = new Map<
      string,
      { x: number; y: number; centerX: number; centerY: number; laneIndex: number; stageIndex: number }
    >();

    // Nhóm các bước cùng ô để tránh đè nhau nếu có nhiều hơn 1 bước trong cùng 1 ô
    const cellCount = new Map<string, number>();

    steps.forEach((step) => {
      const stageIdx = stages.findIndex((s) => s.id === step.stageId);
      const laneIdx = lanes.findIndex((l) => l.id === step.laneId);

      const validStageIdx = stageIdx >= 0 ? stageIdx : 0;
      const validLaneIdx = laneIdx >= 0 ? laneIdx : 0;

      const cellKey = `${step.laneId}_${step.stageId}`;
      const countInCell = cellCount.get(cellKey) || 0;
      cellCount.set(cellKey, countInCell + 1);

      const cellLeft = LANE_HEADER_WIDTH + validStageIdx * STAGE_COL_WIDTH;
      const cellTop = 48 + validLaneIdx * LANE_ROW_HEIGHT;

      // Căn giữa thẻ bước trong ô (hoặc offset nhẹ nếu trùng ô)
      const x = cellLeft + (STAGE_COL_WIDTH - CARD_WIDTH) / 2 + (countInCell > 0 ? 15 : 0);
      const y = cellTop + (LANE_ROW_HEIGHT - CARD_HEIGHT) / 2 + (countInCell > 0 ? 15 : 0);

      map.set(step.id, {
        x,
        y,
        centerX: x + CARD_WIDTH / 2,
        centerY: y + CARD_HEIGHT / 2,
        laneIndex: validLaneIdx,
        stageIndex: validStageIdx,
      });
    });

    return map;
  }, [steps, lanes, stages]);

  const canvasTotalWidth = LANE_HEADER_WIDTH + stages.length * STAGE_COL_WIDTH + 80;
  const canvasTotalHeight = 48 + lanes.length * LANE_ROW_HEIGHT + 60;

  // Xử lý kéo thả HTML5
  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    if (isReadOnly) return;
    setDraggingStepId(stepId);
    e.dataTransfer.setData('text/plain', stepId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, laneId: string, stageId: string) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverCell || dragOverCell.laneId !== laneId || dragOverCell.stageId !== stageId) {
      setDragOverCell({ laneId, stageId });
    }
  };

  const handleDrop = (e: React.DragEvent, targetLaneId: string, targetStageId: string) => {
    if (isReadOnly) return;
    e.preventDefault();
    const stepId = e.dataTransfer.getData('text/plain') || draggingStepId;
    if (stepId) {
      onMoveStep(stepId, targetLaneId, targetStageId);
    }
    setDraggingStepId(null);
    setDragOverCell(null);
  };

  const handleDragEnd = () => {
    setDraggingStepId(null);
    setDragOverCell(null);
  };

  // Nối bước
  const handleStartConnect = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    if (isReadOnly) return;
    if (!connectingSourceStepId) {
      setConnectingSourceStepId(stepId);
    } else if (connectingSourceStepId === stepId) {
      setConnectingSourceStepId(null);
    } else {
      onConnectSteps(connectingSourceStepId, stepId);
      setConnectingSourceStepId(null);
    }
  };

  const handleStepClick = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    if (connectingSourceStepId) {
      if (connectingSourceStepId !== stepId) {
        onConnectSteps(connectingSourceStepId, stepId);
      }
      setConnectingSourceStepId(null);
      return;
    }
    onSelectStep(stepId);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-[#f8fafc] relative select-none cursor-grab active:cursor-grabbing"
      onClick={() => {
        if (connectingSourceStepId) setConnectingSourceStepId(null);
      }}
    >
      {/* Banner thông báo chế độ Nối bước */}
      {connectingSourceStepId && (
        <div className="sticky top-3 left-1/2 -translate-x-1/2 z-40 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[16px]">cable</span>
          <span>Chọn bước đích để thiết lập đường chuyển</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConnectingSourceStepId(null);
            }}
            className="ml-2 text-blue-200 hover:text-white"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Main Scalable Canvas Wrapper */}
      <div
        style={{
          width: canvasTotalWidth,
          height: canvasTotalHeight,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s ease-out',
        }}
        className="relative"
      >
        {/* 1. STAGES HEADER ROW (Columns) */}
        <div
          className="absolute top-0 left-0 right-0 h-12 flex border-b border-slate-300/80 bg-slate-100 z-10"
          style={{ width: canvasTotalWidth }}
        >
          {/* Góc trên bên trái */}
          <div
            className="h-full bg-slate-200/80 border-r border-slate-300 font-extrabold text-[11px] uppercase tracking-wider text-slate-600 flex items-center px-4"
            style={{ width: LANE_HEADER_WIDTH }}
          >
            Nhóm trách nhiệm
          </div>

          {/* Tiêu đề từng cột Giai đoạn */}
          {stages.map((stg, sIdx) => (
            <div
              key={stg.id}
              className="h-full border-r border-slate-300/80 px-4 flex items-center justify-between font-bold text-xs text-slate-800 bg-white/70"
              style={{ width: STAGE_COL_WIDTH }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                  {sIdx + 1}
                </span>
                <span className="truncate">{stg.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 2. LANES ROWS & GRID CELLS */}
        <div className="absolute top-12 left-0 right-0 bottom-0" style={{ width: canvasTotalWidth }}>
          {lanes.map((lane, lIdx) => {
            const laneTop = lIdx * LANE_ROW_HEIGHT;
            return (
              <div
                key={lane.id}
                className="absolute left-0 right-0 flex border-b border-slate-200/90"
                style={{
                  top: laneTop,
                  height: LANE_ROW_HEIGHT,
                  width: canvasTotalWidth,
                  backgroundColor: lIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                }}
              >
                {/* Lane Header (Bên trái) */}
                <div
                  className="h-full border-r border-slate-300 p-3.5 flex flex-col justify-between bg-slate-50/90 sticky left-0 z-10 shadow-xs"
                  style={{ width: LANE_HEADER_WIDTH }}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">
                        {lane.name}
                      </h4>
                    </div>
                    {lane.description && (
                      <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                        {lane.description}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 w-fit">
                    Lane {lIdx + 1} • {lane.code}
                  </span>
                </div>

                {/* Grid Cells theo từng Giai đoạn */}
                {stages.map((stg) => {
                  const isHovered =
                    dragOverCell?.laneId === lane.id && dragOverCell?.stageId === stg.id;
                  return (
                    <div
                      key={stg.id}
                      onDragOver={(e) => handleDragOver(e, lane.id, stg.id)}
                      onDrop={(e) => handleDrop(e, lane.id, stg.id)}
                      className={`h-full border-r border-slate-200/80 transition-colors ${
                        isHovered ? 'bg-blue-100/50 border-blue-400 border-2' : ''
                      }`}
                      style={{ width: STAGE_COL_WIDTH }}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 3. SVG CONNECTOR LAYER */}
        <svg
          className="absolute top-0 left-0 pointer-events-none z-15"
          style={{ width: canvasTotalWidth, height: canvasTotalHeight }}
        >
          <defs>
            {/* Arrowhead marker: Normal (Blue) */}
            <marker
              id="arrow-normal"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#004ac6" />
            </marker>

            {/* Arrowhead marker: Return (Amber) */}
            <marker
              id="arrow-return"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#d97706" />
            </marker>

            {/* Arrowhead marker: Highlighted / Selected */}
            <marker
              id="arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#7c3aed" />
            </marker>
          </defs>

          {/* Render All Transitions */}
          {transitions.map((trans) => {
            const pFrom = stepPositions.get(trans.fromStepId);
            const pTo = stepPositions.get(trans.toStepId);

            if (!pFrom || !pTo) return null;

            const isSelected = selectedTransitionId === trans.id;
            const isFocused =
              focusedTarget?.type === 'transition' && focusedTarget?.id === trans.id;
            const isReturn = trans.type === 'return';

            // Điểm xuất phát & điểm đến
            let startX: number;
            let startY: number;
            let endX: number;
            let endY: number;
            let pathD: string;

            if (isReturn) {
              // Đường trả lại: Vẽ vòng lượn từ đỉnh hoặc đáy ngược về
              startX = pFrom.centerX;
              startY = pFrom.y;
              endX = pTo.centerX;
              endY = pTo.y;

              const midY = Math.min(startY, endY) - 50;
              pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY - 6}`;
            } else {
              // Đường bình thường: Nối từ cạnh phải sang cạnh trái (hoặc thẳng nếu cùng cột)
              if (pTo.x > pFrom.x) {
                startX = pFrom.x + CARD_WIDTH;
                startY = pFrom.centerY;
                endX = pTo.x;
                endY = pTo.centerY;
                const deltaX = (endX - startX) * 0.5;
                pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX - 6} ${endY}`;
              } else if (pTo.x === pFrom.x) {
                // Cùng cột: Nối từ đáy xuống đỉnh
                startX = pFrom.centerX;
                startY = pFrom.y + CARD_HEIGHT;
                endX = pTo.centerX;
                endY = pTo.y;
                pathD = `M ${startX} ${startY} L ${endX} ${endY - 6}`;
              } else {
                // Đi lùi nhưng là đường bình thường
                startX = pFrom.x;
                startY = pFrom.centerY;
                endX = pTo.x + CARD_WIDTH;
                endY = pTo.centerY;
                const deltaX = Math.abs(endX - startX) * 0.5;
                pathD = `M ${startX} ${startY} C ${startX - deltaX} ${startY}, ${endX + deltaX} ${endY}, ${endX + 6} ${endY}`;
              }
            }

            // Tọa độ trung tâm để đặt nhãn hành động
            const labelX = (startX + endX) / 2;
            const labelY = isReturn ? Math.min(startY, endY) - 35 : (startY + endY) / 2;

            const strokeColor = isFocused
              ? '#ef4444'
              : isSelected
              ? '#7c3aed'
              : isReturn
              ? '#d97706'
              : '#004ac6';

            const markerId = isFocused || isSelected
              ? 'url(#arrow-selected)'
              : isReturn
              ? 'url(#arrow-return)'
              : 'url(#arrow-normal)';

            return (
              <g key={trans.id} className="cursor-pointer pointer-events-auto">
                {/* Hit area rộng hơn để dễ click */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTransition(trans.id);
                  }}
                />

                {/* Đường nối hiển thị */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected || isFocused ? 2.5 : 2}
                  strokeDasharray={isReturn ? '5,4' : undefined}
                  markerEnd={markerId}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTransition(trans.id);
                  }}
                  className={`transition-all ${isFocused ? 'animate-pulse' : ''}`}
                />

                {/* Nhãn hành động trên đường chuyển */}
                {trans.actionName && (
                  <foreignObject
                    x={labelX - 70}
                    y={labelY - 12}
                    width={140}
                    height={26}
                    className="overflow-visible pointer-events-auto"
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransition(trans.id);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-center truncate border shadow-2xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                          : isReturn
                          ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                          : 'bg-white text-blue-900 border-blue-200 hover:border-blue-400'
                      }`}
                      title={trans.actionName}
                    >
                      {isReturn && '↩ '}
                      {trans.actionName}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* 4. STEP CARDS LAYER */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
          {steps.map((step) => {
            const pos = stepPositions.get(step.id);
            if (!pos) return null;

            const isSelected = selectedStepId === step.id;
            const isFocused =
              focusedTarget?.type === 'step' && focusedTarget?.id === step.id;
            const isConnectSource = connectingSourceStepId === step.id;

            return (
              <div
                key={step.id}
                draggable={!isReadOnly}
                onDragStart={(e) => handleDragStart(e, step.id)}
                onDragEnd={handleDragEnd}
                onClick={(e) => handleStepClick(e, step.id)}
                style={{
                  transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                }}
                className={`absolute top-0 left-0 bg-white rounded-2xl border p-3 flex flex-col justify-between transition-all pointer-events-auto shadow-xs group cursor-pointer ${
                  isFocused
                    ? 'border-rose-500 ring-4 ring-rose-200 animate-pulse bg-rose-50/20'
                    : isSelected
                    ? 'border-blue-600 ring-3 ring-blue-100 shadow-md'
                    : isConnectSource
                    ? 'border-purple-600 ring-3 ring-purple-200 bg-purple-50/30'
                    : 'border-slate-200/90 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                {/* Top card: Badges & Step Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {step.isStart && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Bắt đầu
                        </span>
                      )}
                      {step.isEnd && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Kết thúc
                        </span>
                      )}
                      {!step.isStart && !step.isEnd && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] font-bold">
                          {step.code}
                        </span>
                      )}
                    </div>

                    {/* Quick Connect Button */}
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={(e) => handleStartConnect(e, step.id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                          isConnectSource
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        title={isConnectSource ? 'Đang chọn bước này' : 'Nối bước từ đây'}
                      >
                        <span className="material-symbols-outlined text-[15px]">cable</span>
                      </button>
                    )}
                  </div>

                  {/* Step Name */}
                  <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {step.name}
                  </h4>
                </div>

                {/* Bottom card: Time limit & Forms indicators */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                    {step.timeLimitDays > 0 ? `${step.timeLimitDays} ngày` : '—'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {step.stepForms.length > 0 && (
                      <span
                        className="px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold text-[9.5px]"
                        title={`${step.stepForms.length} biểu mẫu`}
                      >
                        {step.stepForms.length} BM
                      </span>
                    )}
                    {step.storedDocuments.length > 0 && (
                      <span
                        className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[9.5px]"
                        title={`${step.storedDocuments.length} văn bản lưu`}
                      >
                        {step.storedDocuments.length} VB
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
