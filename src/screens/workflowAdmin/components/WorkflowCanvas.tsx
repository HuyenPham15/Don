// src/screens/workflowAdmin/components/WorkflowCanvas.tsx
import React, { useState, useRef, useMemo } from 'react';
import {
  ProcessStep,
  ProcessTransition,
  ProcessLane,
  ProcessStage,
  WorkflowNodeType,
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
  onDropNewNode?: (type: WorkflowNodeType, targetLaneId: string, targetStageId: string) => void;
  isReadOnly?: boolean;
}

// Geometry constants for accurate card & connector placement
const STAGE_COL_WIDTH = 340;
const LANE_HEADER_WIDTH = 160;
const CARD_WIDTH = 200;
const CARD_HEIGHT = 80;

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
  onDropNewNode,
  isReadOnly = false,
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag & drop state
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ laneId: string; stageId: string } | null>(null);

  // Connect mode state (click to connect)
  const [connectingSourceStepId, setConnectingSourceStepId] = useState<string | null>(null);

  // Lọc bỏ phần / làn Văn thư theo yêu cầu nghiệp vụ
  const activeLanes = useMemo(() => {
    const filtered = lanes.filter(
      (l) => !l.name.toLowerCase().includes('văn thư') && l.code !== 'VT'
    );
    return filtered.length > 0 ? filtered : lanes;
  }, [lanes]);

  // Tính chiều cao động cho từng làn (Lane) dựa theo số bước tối đa trong 1 ô của làn đó
  const laneHeights = useMemo(() => {
    return activeLanes.map((lane) => {
      let maxStepsInAnyCell = 1;
      stages.forEach((stg) => {
        const count = steps.filter(
          (s) => s.laneId === lane.id && s.stageId === stg.id
        ).length;
        if (count > maxStepsInAnyCell) {
          maxStepsInAnyCell = count;
        }
      });
      // Nếu có từ 3 bước trở lên trong 1 ô, mở rộng chiều cao để các bước xếp dọc không bị đè
      return Math.max(240, maxStepsInAnyCell * (CARD_HEIGHT + 24) + 40);
    });
  }, [activeLanes, stages, steps]);

  // Tọa độ Y bắt đầu của từng làn (sau thanh header 44px)
  const laneTops = useMemo(() => {
    const tops: number[] = [];
    let currentTop = 44; // Chiều cao Header
    for (let i = 0; i < laneHeights.length; i++) {
      tops.push(currentTop);
      currentTop += laneHeights[i];
    }
    return tops;
  }, [laneHeights]);

  // Tổng chiều cao vùng làn bơi
  const totalLanesHeight = useMemo(() => {
    if (laneHeights.length === 0) return 300;
    const lastTop = laneTops[laneTops.length - 1] || 44;
    const lastH = laneHeights[laneHeights.length - 1] || 240;
    return lastTop + lastH;
  }, [laneTops, laneHeights]);

  // Tính toán tọa độ tâm và biên của từng bước
  const stepPositions = useMemo(() => {
    const map = new Map<
      string,
      { x: number; y: number; centerX: number; centerY: number; laneIndex: number; stageIndex: number }
    >();

    // Nhóm các bước theo ô (laneId, stageId)
    const cellGroups = new Map<string, ProcessStep[]>();
    steps.forEach((step) => {
      let lId = step.laneId;
      if (!activeLanes.some((l) => l.id === lId)) {
        lId = activeLanes[0]?.id || 'lane-default';
      }
      const sId = step.stageId;
      const key = `${lId}_${sId}`;
      if (!cellGroups.has(key)) {
        cellGroups.set(key, []);
      }
      cellGroups.get(key)!.push(step);
    });

    cellGroups.forEach((stepsInCell, cellKey) => {
      const [lId, sId] = cellKey.split('_');
      const stageIdx = stages.findIndex((s) => s.id === sId);
      const laneIdx = activeLanes.findIndex((l) => l.id === lId);

      const validStageIdx = stageIdx >= 0 ? stageIdx : 0;
      const validLaneIdx = laneIdx >= 0 ? laneIdx : 0;

      const cellLeft = LANE_HEADER_WIDTH + validStageIdx * STAGE_COL_WIDTH;
      const cellTop = laneTops[validLaneIdx] || 44;
      const currentLaneH = laneHeights[validLaneIdx] || 240;

      const totalInCell = stepsInCell.length;

      stepsInCell.forEach((step, idx) => {
        // Nếu có tọa độ tùy chỉnh explicit từ trước
        if (step.position && typeof step.position.x === 'number' && typeof step.position.y === 'number') {
          map.set(step.id, {
            x: step.position.x,
            y: step.position.y,
            centerX: step.position.x + CARD_WIDTH / 2,
            centerY: step.position.y + CARD_HEIGHT / 2,
            laneIndex: validLaneIdx,
            stageIndex: validStageIdx,
          });
          return;
        }

        let x = cellLeft + (STAGE_COL_WIDTH - CARD_WIDTH) / 2;
        let y = cellTop + (currentLaneH - CARD_HEIGHT) / 2;

        if (totalInCell === 1) {
          // 1 bước duy nhất: Căn giữa ô
          x = cellLeft + (STAGE_COL_WIDTH - CARD_WIDTH) / 2;
          y = cellTop + (currentLaneH - CARD_HEIGHT) / 2;
        } else if (totalInCell === 2) {
          // 2 bước trong cùng 1 ô: Bước 1 ở góc trên trái, Bước 2 ở góc dưới phải
          if (idx === 0) {
            x = cellLeft + 24;
            y = cellTop + 24;
          } else {
            x = cellLeft + STAGE_COL_WIDTH - CARD_WIDTH - 24;
            y = cellTop + currentLaneH - CARD_HEIGHT - 24;
          }
        } else {
          // Từ 3 bước trở lên (ví dụ: các nhánh kết quả kết thúc): Xếp dọc thẳng hàng
          const verticalGap = 24;
          x = cellLeft + (STAGE_COL_WIDTH - CARD_WIDTH) / 2;
          y = cellTop + 24 + idx * (CARD_HEIGHT + verticalGap);
        }

        map.set(step.id, {
          x,
          y,
          centerX: x + CARD_WIDTH / 2,
          centerY: y + CARD_HEIGHT / 2,
          laneIndex: validLaneIdx,
          stageIndex: validStageIdx,
        });
      });
    });

    return map;
  }, [steps, activeLanes, stages, laneTops, laneHeights]);

  const canvasTotalWidth = useMemo(() => {
    return Math.max(920, LANE_HEADER_WIDTH + stages.length * STAGE_COL_WIDTH);
  }, [stages]);

  const canvasTotalHeight = useMemo(() => {
    return totalLanesHeight + 40; // 40px cho thanh legend đáy
  }, [totalLanesHeight]);

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
    const componentType = e.dataTransfer.getData('application/workflow-node-type') as WorkflowNodeType | null;
    const stepId = e.dataTransfer.getData('text/plain') || draggingStepId;

    if (componentType && onDropNewNode) {
      onDropNewNode(componentType, targetLaneId, targetStageId);
    } else if (stepId && !componentType) {
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

  const handleFitView = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      id="workflow-canvas-scroll-container"
      className="flex-1 min-w-0 w-full h-full overflow-auto bg-slate-50 relative select-none p-4"
      onClick={() => {
        if (connectingSourceStepId) setConnectingSourceStepId(null);
      }}
    >
      {/* Banner thông báo chế độ Nối bước */}
      {connectingSourceStepId && (
        <div className="sticky top-2 left-1/2 -translate-x-1/2 z-50 bg-[#2b5282] text-white px-4 py-2 rounded-full shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce w-fit mx-auto">
          <span className="material-symbols-outlined text-[16px]">cable</span>
          <span>Chọn bước đích để thiết lập đường chuyển</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConnectingSourceStepId(null);
            }}
            className="ml-2 px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px]"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Vỏ bọc kích thước thực theo tỷ lệ Zoom để thanh cuộn hoạt động chuẩn xác */}
      <div
        style={{
          width: `${canvasTotalWidth * zoomLevel + 32}px`,
          minHeight: `${canvasTotalHeight * zoomLevel + 60}px`,
        }}
        className="relative"
      >
        {/* Main Scalable Canvas Wrapper */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease-out',
            width: `${canvasTotalWidth}px`,
          }}
          className="transition-transform duration-150"
        >
        {/* Nút định vị góc nhìn / Crosshair Focus ở góc trên bên trái */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={handleFitView}
            className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title="Định vị trung tâm / Khôi phục góc nhìn"
          >
            <span className="material-symbols-outlined text-[17px]">filter_center_focus</span>
          </button>
          <span className="text-[11px] text-slate-400 font-medium">Sơ đồ quy trình xử lý luồng công việc</span>
        </div>

        {/* ========================================================================= */}
        {/* KHUNG BẢNG LÀN BƠI CHÍNH (THEO THIẾT KẾ ĐỒ HỌA MỚI)                       */}
        {/* ========================================================================= */}
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative"
          style={{ width: canvasTotalWidth, minHeight: canvasTotalHeight }}
        >
          {/* 1. STAGES HEADER ROW (Các cột Giai đoạn) */}
          <div
            className="h-11 flex border-b border-slate-200 bg-white text-slate-800 text-[11px] font-semibold select-none sticky top-0 z-20"
            style={{ width: canvasTotalWidth }}
          >
            {/* Cột 0: Nhóm trách nhiệm */}
            <div
              className="shrink-0 p-2.5 border-r border-slate-200 flex items-center text-slate-600 font-medium"
              style={{ width: LANE_HEADER_WIDTH }}
            >
              Nhóm trách nhiệm
            </div>

            {/* Tiêu đề từng cột Giai đoạn */}
            {stages.map((stg, sIdx) => (
              <div
                key={stg.id}
                className="shrink-0 p-2.5 border-r border-slate-200 flex items-center justify-between font-bold text-slate-700 bg-white"
                style={{ width: STAGE_COL_WIDTH }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-4 h-4 rounded-full border border-slate-300 text-slate-600 inline-flex items-center justify-center text-[10px] font-bold shrink-0">
                    {sIdx + 1}
                  </span>
                  <span className="truncate" title={stg.name}>
                    {stg.name}
                  </span>
                </div>
                <span className="text-[9.5px] font-normal text-slate-400 shrink-0">
                  Giai đoạn {sIdx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* 2. LANES ROWS & GRID CELLS */}
          <div className="relative" style={{ width: canvasTotalWidth, height: totalLanesHeight - 44 }}>
            {activeLanes.map((lane, lIdx) => {
              const laneTop = (laneTops[lIdx] || 44) - 44; // relative to lanes wrapper
              const laneHeight = laneHeights[lIdx] || 240;
              const stepsInThisLane = steps.filter((s) => s.laneId === lane.id);

              return (
                <div
                  key={lane.id}
                  className="absolute left-0 right-0 flex border-b border-slate-200"
                  style={{
                    top: laneTop,
                    height: laneHeight,
                    width: canvasTotalWidth,
                  }}
                >
                  {/* Cột Tác nhân bên trái (Nhóm trách nhiệm) */}
                  <div
                    className="h-full border-r border-slate-200 p-3 flex flex-col justify-between bg-white sticky left-0 z-10 select-none shadow-2xs"
                    style={{ width: LANE_HEADER_WIDTH }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 inline-block"></span>
                        <span className="truncate" title={lane.name}>
                          {lane.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 pl-3.5 leading-tight">
                        {lane.description || `${stepsInThisLane.length} bước - 2 vai trò`}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium">
                      Hàng {lIdx + 1}
                    </div>
                  </div>

                  {/* Grid Cells theo từng Giai đoạn (Nền lưới chấm Dot-grid) */}
                  {stages.map((stg) => {
                    const isHovered =
                      dragOverCell?.laneId === lane.id && dragOverCell?.stageId === stg.id;

                    return (
                      <div
                        key={stg.id}
                        onDragOver={(e) => handleDragOver(e, lane.id, stg.id)}
                        onDrop={(e) => handleDrop(e, lane.id, stg.id)}
                        className={`h-full border-r border-slate-200 relative transition-all ${
                          isHovered
                            ? 'bg-blue-50/70 ring-2 ring-inset ring-blue-500'
                            : ''
                        }`}
                        style={{
                          width: STAGE_COL_WIDTH,
                          backgroundImage: 'radial-gradient(#cbd5e1 1.25px, transparent 1.25px)',
                          backgroundSize: '24px 24px',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        {isHovered && (
                          <div className="absolute inset-2 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50/40 flex items-center justify-center pointer-events-none z-10 animate-pulse">
                            <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">add_circle</span>
                              Thả bước vào đây
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* 3. SVG CONNECTOR LAYER (Các đường nối Bézier mượt mà) */}
          <svg
            className="absolute top-0 left-0 pointer-events-none z-15"
            style={{ width: canvasTotalWidth, height: totalLanesHeight }}
          >
            <defs>
              {/* Arrowhead marker chuẩn theo thiết kế: Navy blue #2b5282 */}
              <marker
                id="wf-canvas-arrow-normal"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 7 5 L 0 8 z" fill="#2b5282" />
              </marker>

              {/* Arrowhead marker: Return (Amber) */}
              <marker
                id="wf-canvas-arrow-return"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 7 5 L 0 8 z" fill="#d97706" />
              </marker>

              {/* Arrowhead marker: Highlighted / Selected */}
              <marker
                id="wf-canvas-arrow-selected"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 7 5 L 0 8 z" fill="#7c3aed" />
              </marker>

              {/* Arrowhead marker: Focused */}
              <marker
                id="wf-canvas-arrow-focused"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 7 5 L 0 8 z" fill="#ef4444" />
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

              let startX: number;
              let startY: number;
              let endX: number;
              let endY: number;
              let pathD: string;

              if (isReturn) {
                // Đường quay lại / trả hồ sơ: Vòng ngược từ đỉnh hoặc đáy
                startX = pFrom.centerX;
                startY = pFrom.y;
                endX = pTo.centerX;
                endY = pTo.y;

                const midY = Math.min(startY, endY) - 45;
                pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY - 6}`;
              } else {
                // Đường chuyển tiếp bình thường: Nối mượt mà từ cạnh phải sang cạnh trái
                if (pTo.x > pFrom.x) {
                  startX = pFrom.x + CARD_WIDTH;
                  startY = pFrom.centerY;
                  endX = pTo.x;
                  endY = pTo.centerY;
                  const deltaX = Math.max(35, (endX - startX) * 0.5);
                  pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX - 5} ${endY}`;
                } else if (pTo.x === pFrom.x) {
                  // Cùng cột: Nối từ đáy xuống đỉnh
                  if (pTo.y >= pFrom.y) {
                    startX = pFrom.centerX;
                    startY = pFrom.y + CARD_HEIGHT;
                    endX = pTo.centerX;
                    endY = pTo.y;
                    pathD = `M ${startX} ${startY} L ${endX} ${endY - 5}`;
                  } else {
                    startX = pFrom.centerX;
                    startY = pFrom.y;
                    endX = pTo.centerX;
                    endY = pTo.y + CARD_HEIGHT;
                    pathD = `M ${startX} ${startY} L ${endX} ${endY + 5}`;
                  }
                } else {
                  // Đi lùi sang cột trước
                  startX = pFrom.x;
                  startY = pFrom.centerY;
                  endX = pTo.x + CARD_WIDTH;
                  endY = pTo.centerY;
                  const deltaX = Math.max(35, Math.abs(endX - startX) * 0.5);
                  pathD = `M ${startX} ${startY} C ${startX - deltaX} ${startY}, ${endX + deltaX} ${endY}, ${endX + 5} ${endY}`;
                }
              }

              // Tọa độ đặt nhãn hành động
              const labelX = (startX + endX) / 2;
              const labelY = isReturn ? Math.min(startY, endY) - 32 : (startY + endY) / 2;

              const strokeColor = isFocused
                ? '#ef4444'
                : isSelected
                ? '#7c3aed'
                : isReturn
                ? '#d97706'
                : '#2b5282';

              const markerId = isFocused
                ? 'url(#wf-canvas-arrow-focused)'
                : isSelected
                ? 'url(#wf-canvas-arrow-selected)'
                : isReturn
                ? 'url(#wf-canvas-arrow-return)'
                : 'url(#wf-canvas-arrow-normal)';

              return (
                <g key={trans.id} className="cursor-pointer pointer-events-auto">
                  {/* Hit area rộng hơn để dễ bấm chọn đường nối */}
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

                  {/* Đường nối chính thức */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected || isFocused ? 2.5 : 1.75}
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
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-900'
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

          {/* 4. STEP CARDS LAYER (Các thẻ bước theo đúng chuẩn giao diện) */}
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
                  className={`absolute top-0 left-0 bg-white rounded-xl border p-2.5 flex flex-col justify-between transition-all pointer-events-auto shadow-2xs group cursor-pointer ${
                    isFocused
                      ? 'border-rose-500 ring-4 ring-rose-200 animate-pulse bg-rose-50/20'
                      : isSelected
                      ? 'ring-2 ring-blue-600 border-blue-500 bg-blue-50/20 shadow-sm scale-[1.01]'
                      : isConnectSource
                      ? 'ring-2 ring-purple-600 border-purple-500 bg-purple-50/30'
                      : 'border-slate-300 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  {/* Top row: Huy hiệu loại bước & Nút nối nhanh */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1 min-w-0 flex-wrap">
                        {/* Node Type Badge */}
                        {step.isStart || step.nodeType === 'START' ? (
                          <span className="inline-block text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded w-fit">
                            BẮT ĐẦU
                          </span>
                        ) : step.isEnd || step.nodeType === 'END' ? (
                          <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded w-fit">
                            KẾT THÚC
                          </span>
                        ) : step.nodeType === 'APPROVAL' ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                            <span className="material-symbols-outlined text-[11px]">verified</span>
                            Phê duyệt
                          </span>
                        ) : step.nodeType === 'CHECK' ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                            <span className="material-symbols-outlined text-[11px]">fact_check</span>
                            Kiểm tra
                          </span>
                        ) : step.nodeType === 'BRANCH' ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                            <span className="material-symbols-outlined text-[11px]">call_split</span>
                            Rẽ nhánh
                          </span>
                        ) : step.nodeType === 'NOTIFICATION' ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                            <span className="material-symbols-outlined text-[11px]">notifications</span>
                            Thông báo
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-slate-400 font-mono font-medium block truncate max-w-[95px]">
                            {step.code}
                          </span>
                        )}

                        {/* AI Indicator badge */}
                        {step.aiConfig?.enabled && (
                          <span
                            className="px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold text-[8.5px] flex items-center gap-0.5"
                            title="Trợ lý AI được kích hoạt"
                          >
                            <span className="material-symbols-outlined text-[10px]">smart_toy</span>
                            AI
                          </span>
                        )}

                        {/* Override Indicator */}
                        {(step.isCustomized ||
                          step.conditionsOverride ||
                          step.formsOverride ||
                          step.inputDocsOverride ||
                          step.outputDocsOverride) && (
                          <span
                            className="px-1 py-0.2 rounded bg-amber-50 text-amber-800 font-semibold text-[8px] border border-amber-300"
                            title="Đang tùy chỉnh riêng (Override)"
                          >
                            Tùy chỉnh
                          </span>
                        )}
                      </div>

                      {/* Quick Connect Button */}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={(e) => handleStartConnect(e, step.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isConnectSource
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100'
                          }`}
                          title={isConnectSource ? 'Đang chọn bước này' : 'Nối bước từ đây'}
                        >
                          <span className="material-symbols-outlined text-[14px]">cable</span>
                        </button>
                      )}
                    </div>

                    {/* Step Name */}
                    <h4 className="font-bold text-slate-900 text-[12px] leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {step.name}
                    </h4>
                  </div>

                  {/* Bottom card: Thời hạn (SLA) & Chỉ số biểu mẫu, hành động */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>
                      {step.timeLimitDays > 0
                        ? `${step.timeLimitDays} ngày`
                        : step.workHours > 0
                        ? `${step.workHours} giờ`
                        : 'Không hạn'}
                    </span>

                    <div className="flex items-center gap-1">
                      {step.stepForms && step.stepForms.length > 0 && (
                        <span>{step.stepForms.length} BM</span>
                      )}
                      {((step.documentConditions && step.documentConditions.length > 0) ||
                        (step.usedDocuments && step.usedDocuments.length > 0)) && (
                        <span
                          className="text-blue-700 font-semibold"
                          title="Số lượng văn bản / hồ sơ yêu cầu"
                        >
                          {(step.documentConditions?.length || step.usedDocuments?.length || 0)} VB
                        </span>
                      )}
                      {step.conditions && step.conditions.length > 0 && (
                        <span
                          className="text-indigo-700 font-semibold"
                          title="Số lượng điều kiện nghiệp vụ / tiêu chí"
                        >
                          {step.conditions.length} ĐK
                        </span>
                      )}
                      {step.actions && step.actions.length > 0 && (
                        <span className="text-purple-700 font-semibold">
                          {step.actions.length} HĐ
                        </span>
                      )}
                      {step.storedDocuments && step.storedDocuments.length > 0 && (
                        <span className="text-slate-600">
                          {step.storedDocuments.length} VB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. CHÚ GIẢI CHÂN BẢNG QUY TRÌNH (LEGEND THEO ẢNH MẪU) */}
          <div
            className="flex items-center gap-6 px-4 py-2.5 border-t border-slate-200 text-[11px] text-slate-600 bg-white select-none z-20 mt-auto"
            style={{ width: canvasTotalWidth }}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-[2px] bg-[#2b5282] inline-block"></span>
              <span>Chuyển tiếp bình thường</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-[2px] border-b-2 border-dashed border-amber-500 inline-block"></span>
              <span>Quay lại / trả hồ sơ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <span>Nhóm trách nhiệm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
