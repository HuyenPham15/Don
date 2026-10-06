// src/screens/workflowAdmin/components/WorkflowLeftPalette.tsx
import React, { useState } from 'react';
import { ProcessLane, ProcessStage, WorkflowNodeType, ProcessStep } from '../../../types/workflowConfig';
import {
  WORKFLOW_COMPONENT_CATEGORIES,
  WORKFLOW_COMPONENT_REGISTRY,
  ComponentRegistryItem,
} from '../registry/workflowComponentRegistry';

export interface WorkflowLeftPaletteProps {
  lanes: ProcessLane[];
  stages: ProcessStage[];
  onAddStep: (type: WorkflowNodeType, customConfig?: Partial<ProcessStep>) => void;
  onAddLane: (name: string, code: string, description?: string) => void;
  onUpdateLane?: (laneId: string, updated: Partial<ProcessLane>) => void;
  onDeleteLane?: (laneId: string) => void;
  onReorderLanes?: (newLanes: ProcessLane[]) => void;
  onAddStage: (name: string) => void;
  onUpdateStage?: (stageId: string, updated: Partial<ProcessStage>) => void;
  onDeleteStage?: (stageId: string) => void;
  onReorderStages?: (newStages: ProcessStage[]) => void;
  isReadOnly?: boolean;
}

export default function WorkflowLeftPalette({
  lanes,
  stages,
  onAddStep,
  onAddLane,
  onUpdateLane,
  onDeleteLane,
  onReorderLanes,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
  onReorderStages,
  isReadOnly = false,
}: WorkflowLeftPaletteProps) {
  const [activeTab, setActiveTab] = useState<'components' | 'lanes' | 'stages'>('components');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for Lane
  const [newLaneName, setNewLaneName] = useState('');
  const [newLaneCode, setNewLaneCode] = useState('');
  const [newLaneDesc, setNewLaneDesc] = useState('');
  const [editingLaneId, setEditingLaneId] = useState<string | null>(null);
  const [editLaneName, setEditLaneName] = useState('');
  const [editLaneCode, setEditLaneCode] = useState('');

  // Form states for Stage
  const [newStageName, setNewStageName] = useState('');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editStageName, setEditStageName] = useState('');

  // Filtered components
  const filteredComponents = WORKFLOW_COMPONENT_REGISTRY.filter((comp) => {
    const matchesCategory = selectedCategory === 'ALL' || comp.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Handle adding step from item
  const handleSelectComponent = (comp: ComponentRegistryItem) => {
    if (isReadOnly) return;
    const defaultLaneId = lanes[0]?.id || 'lane-default';
    const defaultStageId = stages[0]?.id || 'stage-default';
    const defaultConfig = comp.createDefaultNode(Date.now() % 100, defaultLaneId, defaultStageId);
    onAddStep(comp.type, defaultConfig);
  };

  // Drag start for library component
  const handleDragStart = (e: React.DragEvent, comp: ComponentRegistryItem) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('application/workflow-component-id', comp.id);
    e.dataTransfer.setData('application/workflow-node-type', comp.type);
    e.dataTransfer.setData('text/plain', comp.label);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle Lane Operations
  const handleCreateLane = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaneName.trim()) return;
    onAddLane(newLaneName.trim(), (newLaneCode.trim() || 'NV').toUpperCase(), newLaneDesc.trim());
    setNewLaneName('');
    setNewLaneCode('');
    setNewLaneDesc('');
  };

  const handleStartEditLane = (lane: ProcessLane) => {
    setEditingLaneId(lane.id);
    setEditLaneName(lane.name);
    setEditLaneCode(lane.code);
  };

  const handleSaveEditLane = (laneId: string) => {
    if (onUpdateLane && editLaneName.trim()) {
      onUpdateLane(laneId, {
        name: editLaneName.trim(),
        code: (editLaneCode.trim() || 'NV').toUpperCase(),
      });
    }
    setEditingLaneId(null);
  };

  const handleMoveLane = (index: number, direction: 'up' | 'down') => {
    if (!onReorderLanes) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lanes.length) return;
    const newLanes = [...lanes];
    const [moved] = newLanes.splice(index, 1);
    newLanes.splice(newIndex, 0, moved);
    onReorderLanes(newLanes.map((l, i) => ({ ...l, order: i + 1 })));
  };

  // Handle Stage Operations
  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    onAddStage(newStageName.trim());
    setNewStageName('');
  };

  const handleStartEditStage = (stage: ProcessStage) => {
    setEditingStageId(stage.id);
    setEditStageName(stage.name);
  };

  const handleSaveEditStage = (stageId: string) => {
    if (onUpdateStage && editStageName.trim()) {
      onUpdateStage(stageId, { name: editStageName.trim() });
    }
    setEditingStageId(null);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (!onReorderStages) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stages.length) return;
    const newStages = [...stages];
    const [moved] = newStages.splice(index, 1);
    newStages.splice(newIndex, 0, moved);
    onReorderStages(newStages.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0 select-none shadow-2xs z-20">
      {/* 1. Header & Navigation Tabs */}
      <div className="p-3 border-b border-slate-200/90 bg-slate-50/70 shrink-0">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'components'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span className="material-symbols-outlined text-[15px]">widgets</span>
            <span>Thành phần</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lanes')}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'lanes'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span className="material-symbols-outlined text-[15px]">table_rows</span>
            <span>Nhóm ({lanes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'stages'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span className="material-symbols-outlined text-[15px]">view_column</span>
            <span>Giai đoạn ({stages.length})</span>
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT BASED ON ACTIVE TAB */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* ============================================================== */}
        {/* TAB 1: REUSABLE COMPONENT LIBRARY                              */}
        {/* ============================================================== */}
        {activeTab === 'components' && (
          <div className="space-y-3.5">
            {/* Search Box */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm thành phần..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10.5px]">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                Tất cả ({WORKFLOW_COMPONENT_REGISTRY.length})
              </button>
              {WORKFLOW_COMPONENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  title={cat.description}
                >
                  <span>{cat.title}</span>
                </button>
              ))}
            </div>


            {WORKFLOW_COMPONENT_CATEGORIES.filter(
              (cat) => selectedCategory === 'ALL' || selectedCategory === cat.id
            ).map((cat) => {
              const catComps = filteredComponents.filter((c) => c.category === cat.id);
              if (catComps.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">{cat.icon}</span>
                      {cat.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{catComps.length}</span>
                  </div>

                  <div className="space-y-2">
                    {catComps.map((comp) => (
                      <div
                        key={comp.id}
                        draggable={!isReadOnly}
                        onDragStart={(e) => handleDragStart(e, comp)}
                        onClick={() => handleSelectComponent(comp)}
                        className={`p-2.5 rounded-xl border bg-white flex items-center justify-between transition-all group ${comp.color.border
                          } ${isReadOnly
                            ? 'opacity-60 cursor-not-allowed'
                            : 'hover:border-blue-400 hover:shadow-xs hover:bg-slate-50/60 cursor-grab active:cursor-grabbing shadow-2xs'
                          }`}
                        title={isReadOnly ? 'Chế độ chỉ đọc' : 'Kéo thả vào Canvas hoặc nhấp để thêm'}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg ${comp.color.bg} ${comp.color.text} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                          >
                            <span className="material-symbols-outlined text-[17px]">{comp.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate group-hover:text-blue-700 transition-colors">
                              {comp.label}
                            </span>
                            <span className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                              {comp.description}
                            </span>
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="flex items-center gap-1 shrink-0 pl-1">
                            <button
                              type="button"
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 group-hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Thêm vào sơ đồ"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Chú thích loại đường nối (Connectors) */}
            <div className="pt-3 border-t border-slate-200/90 space-y-2">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">
                Các loại đường nối (Connector)
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-0.5 bg-blue-600 inline-block"></span>
                    <span className="font-bold text-blue-900 text-[10.5px]">Đường chuyển tuần tự</span>
                  </div>
                  <p className="text-slate-500 text-[9.5px]">
                    Chuyển sang bước tiếp theo khi hoàn tất nghiệp vụ.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-amber-600 inline-block"></span>
                    <span className="font-bold text-amber-900 text-[10.5px]">Đường quay lại / Trả hồ sơ</span>
                  </div>
                  <p className="text-amber-800 text-[9.5px]">
                    Quay lại bước trước khi cần bổ sung hoặc sửa đổi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: RESPONSIBILITY LANES (CONFIGURABLE)                     */}
        {/* ============================================================== */}
        {activeTab === 'lanes' && (
          <div className="space-y-3.5">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Nhóm trách nhiệm (Lanes)</span>
              <span className="text-[10.5px] text-slate-500 block leading-relaxed mt-0.5">
                Mỗi hàng ngang đại diện cho một đơn vị hoặc vai trò phụ trách thực hiện các bước.
              </span>
            </div>

            {/* List of Lanes with Reorder / Edit / Delete */}
            <div className="space-y-2">
              {lanes.map((lane, index) => (
                <div
                  key={lane.id}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all"
                >
                  {editingLaneId === lane.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editLaneName}
                          onChange={(e) => setEditLaneName(e.target.value)}
                          placeholder="Tên nhóm..."
                          className="flex-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={editLaneCode}
                          onChange={(e) => setEditLaneCode(e.target.value)}
                          placeholder="Mã..."
                          className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase text-center focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingLaneId(null)}
                          className="px-2 py-0.5 text-[10.5px] text-slate-500 hover:text-slate-800"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditLane(lane.id)}
                          className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10.5px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{lane.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Mã: {lane.code}</span>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="flex items-center gap-0.5">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveLane(index, 'up')}
                            className={`p-1 rounded hover:bg-slate-100 ${index === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800 cursor-pointer'
                              }`}
                            title="Di chuyển lên trên"
                          >
                            <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            disabled={index === lanes.length - 1}
                            onClick={() => handleMoveLane(index, 'down')}
                            className={`p-1 rounded hover:bg-slate-100 ${index === lanes.length - 1
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-500 hover:text-slate-800 cursor-pointer'
                              }`}
                            title="Di chuyển xuống dưới"
                          >
                            <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleStartEditLane(lane)}
                            className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Chỉnh sửa tên & mã nhóm"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>

                          {/* Delete */}
                          {onDeleteLane && lanes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteLane(lane.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Xóa nhóm này"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form + Thêm Nhóm mới */}
            {!isReadOnly && (
              <form onSubmit={handleCreateLane} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-3">
                <span className="font-bold text-slate-800 text-[11px] block flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-blue-600">add_circle</span>
                  Thêm Nhóm trách nhiệm mới
                </span>

                <input
                  type="text"
                  value={newLaneName}
                  onChange={(e) => setNewLaneName(e.target.value)}
                  placeholder="Tên nhóm (vd: Phòng Thanh tra...)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLaneCode}
                    onChange={(e) => setNewLaneCode(e.target.value.toUpperCase())}
                    placeholder="Mã ngắn (TT)"
                    className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={newLaneDesc}
                    onChange={(e) => setNewLaneDesc(e.target.value)}
                    placeholder="Mô tả chức năng..."
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newLaneName.trim()}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${newLaneName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  + Thêm nhóm trách nhiệm
                </button>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PHASES / GIAI ĐOẠN (CONFIGURABLE)                       */}
        {/* ============================================================== */}
        {activeTab === 'stages' && (
          <div className="space-y-3.5">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Cột Giai đoạn (Phases)</span>
              <span className="text-[10.5px] text-slate-500 block leading-relaxed mt-0.5">
                Mỗi cột dọc trên sơ đồ đại diện cho một mốc tiến độ trong vòng đời quy trình.
              </span>
            </div>

            {/* List of Stages with Reorder / Edit / Delete */}
            <div className="space-y-2">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all"
                >
                  {editingStageId === stage.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editStageName}
                        onChange={(e) => setEditStageName(e.target.value)}
                        placeholder="Tên giai đoạn..."
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingStageId(null)}
                          className="px-2 py-0.5 text-[10.5px] text-slate-500 hover:text-slate-800"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditStage(stage.id)}
                          className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10.5px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] font-mono flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-900 block truncate">{stage.name}</span>
                      </div>

                      {!isReadOnly && (
                        <div className="flex items-center gap-0.5">
                          {/* Reorder Left (Up) */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveStage(index, 'up')}
                            className={`p-1 rounded hover:bg-slate-100 ${index === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800 cursor-pointer'
                              }`}
                            title="Di chuyển sang trái"
                          >
                            <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                          </button>

                          {/* Reorder Right (Down) */}
                          <button
                            type="button"
                            disabled={index === stages.length - 1}
                            onClick={() => handleMoveStage(index, 'down')}
                            className={`p-1 rounded hover:bg-slate-100 ${index === stages.length - 1
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-500 hover:text-slate-800 cursor-pointer'
                              }`}
                            title="Di chuyển sang phải"
                          >
                            <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleStartEditStage(stage)}
                            className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Chỉnh sửa tên giai đoạn"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>

                          {/* Delete */}
                          {onDeleteStage && stages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteStage(stage.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Xóa cột giai đoạn này"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form + Thêm Giai đoạn mới */}
            {!isReadOnly && (
              <form onSubmit={handleCreateStage} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-3">
                <span className="font-bold text-slate-800 text-[11px] block flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-blue-600">add_circle</span>
                  Thêm Cột giai đoạn mới
                </span>

                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Tên giai đoạn (vd: Tiếp nhận, Xác minh...)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={!newStageName.trim()}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${newStageName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  + Thêm cột giai đoạn
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
