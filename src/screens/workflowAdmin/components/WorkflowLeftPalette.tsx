// src/screens/workflowAdmin/components/WorkflowLeftPalette.tsx
import React, { useState } from 'react';
import { ProcessLane, ProcessStage, WorkflowNodeType, ProcessStep } from '../../../types/workflowConfig';

export type BasicNodeCategory = 'ALL' | 'TRIGGER' | 'ACTION' | 'LOGIC' | 'END';

export interface BasicNodeDefinition {
  id: string;
  type: WorkflowNodeType;
  category: BasicNodeCategory;
  categoryName: string;
  name: string;
  shortDesc: string;
  icon: string;
  badge: string;
  color: {
    bg: string;
    text: string;
    border: string;
    ring: string;
  };
  defaultTimeLimitDays: number;
  defaultWorkHours: number;
}

// Danh sách các khối bước cơ bản (Tham khảo mô hình Node Architecture của n8n)
// Không có cấu hình sẵn dữ liệu nghiệp vụ, để người dùng tự cấu hình tại bước
export const BASIC_WORKFLOW_NODES: BasicNodeDefinition[] = [
  // 1. Trigger / Khởi đầu
  {
    id: 'node-start',
    type: 'START',
    category: 'TRIGGER',
    categoryName: 'Khởi đầu',
    name: 'Bắt đầu tiếp nhận',
    shortDesc: 'Khởi tạo quy trình khi tiếp nhận hồ sơ, đơn thư mới',
    icon: 'play_circle',
    badge: 'Trigger',
    color: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      ring: 'ring-emerald-100',
    },
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
  },

  // 2. Actions / Thực thi nghiệp vụ
  {
    id: 'node-task',
    type: 'TASK',
    category: 'ACTION',
    categoryName: 'Thực thi',
    name: 'Bước xử lý nghiệp vụ',
    shortDesc: 'Thực hiện công việc chuyên môn, xác minh hoặc soạn thảo',
    icon: 'task_alt',
    badge: 'Action',
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      ring: 'ring-blue-100',
    },
    defaultTimeLimitDays: 3,
    defaultWorkHours: 24,
  },

  // 3. Flow & Logic / Điều hướng
  {
    id: 'node-condition',
    type: 'CHECK',
    category: 'LOGIC',
    categoryName: 'Điều hướng',
    name: 'Rẽ nhánh điều kiện (IF)',
    shortDesc: 'Kiểm tra điều kiện phân luồng 2 nhánh: Đạt / Không đạt',
    icon: 'alt_route',
    badge: 'If/Else',
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      ring: 'ring-amber-100',
    },
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
  },
  {
    id: 'node-switch',
    type: 'BRANCH',
    category: 'LOGIC',
    categoryName: 'Điều hướng',
    name: 'Phân luồng đa nhánh (Switch)',
    shortDesc: 'Rẽ nhiều hướng tùy theo phân loại vụ việc hoặc thẩm quyền',
    icon: 'schema',
    badge: 'Switch',
    color: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      ring: 'ring-orange-100',
    },
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
  },
  {
    id: 'node-merge',
    type: 'MERGE',
    category: 'LOGIC',
    categoryName: 'Điều hướng',
    name: 'Hợp nhất luồng (Merge)',
    shortDesc: 'Gom các nhánh xử lý song song về một bước chung',
    icon: 'call_merge',
    badge: 'Merge',
    color: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      ring: 'ring-indigo-100',
    },
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
  },

  // 4. End / Kết thúc
  {
    id: 'node-end',
    type: 'END',
    category: 'END',
    categoryName: 'Kết thúc',
    name: 'Kết thúc quy trình',
    shortDesc: 'Hoàn tất toàn bộ quy trình, lưu trữ hồ sơ và đóng vụ việc',
    icon: 'stop_circle',
    badge: 'End',
    color: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      ring: 'ring-rose-100',
    },
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
  },
];

export const NODE_CATEGORY_FILTERS: { id: BasicNodeCategory; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'TRIGGER', label: 'Khởi đầu' },
  { id: 'ACTION', label: 'Thực thi' },
  { id: 'LOGIC', label: 'Điều hướng' },
  { id: 'END', label: 'Kết thúc' },
];

export interface WorkflowLeftPaletteProps {
  lanes: ProcessLane[];
  stages: ProcessStage[];
  selectedStep?: ProcessStep | null;
  onApplyConditionGroupToStep?: (conditions: string[], groupName: string) => void;
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
  selectedStep,
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
  const [activeTab, setActiveTab] = useState<'nodes' | 'lanes' | 'stages'>('nodes');
  const [selectedCategory, setSelectedCategory] = useState<BasicNodeCategory>('ALL');
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

  // Lọc các khối bước theo tìm kiếm và danh mục (n8n node search)
  const filteredNodes = BASIC_WORKFLOW_NODES.filter((node) => {
    const matchesCat = selectedCategory === 'ALL' || node.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      node.name.toLowerCase().includes(q) ||
      node.shortDesc.toLowerCase().includes(q) ||
      node.badge.toLowerCase().includes(q) ||
      node.categoryName.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  // Nhấn thêm bước trực tiếp vào sơ đồ (không cấu hình sẵn dữ liệu)
  const handleSelectNode = (node: BasicNodeDefinition) => {
    if (isReadOnly) return;
    const defaultLaneId = lanes[0]?.id || 'lane-default';
    const defaultStageId = stages[0]?.id || 'stage-default';

    onAddStep(node.type, {
      name: node.name,
      description: '',
      nodeType: node.type,
      isStart: node.type === 'START',
      isEnd: node.type === 'END',
      timeLimitDays: node.defaultTimeLimitDays,
      workHours: node.defaultWorkHours,
      laneId: defaultLaneId,
      stageId: defaultStageId,
      conditions: [], // Không có cấu hình sẵn
      conditionsOverride: false,
      stepForms: [],
      formsOverride: false,
      storedDocuments: [],
      outputDocsOverride: false,
      usedDocuments: [],
      inputDocuments: [],
      usedDocsOverride: false,
      inputDocsOverride: false,
      isCustomized: true,
    });
  };

  // Kéo khối bước vào canvas
  const handleDragStart = (e: React.DragEvent, node: BasicNodeDefinition) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('application/workflow-component-id', node.id);
    e.dataTransfer.setData('application/workflow-node-type', node.type);
    e.dataTransfer.setData('text/plain', node.name);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Lane Operations
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

  // Stage Operations
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
      {/* 1. Header Navigation Tabs (Tập trung Khối bước cơ bản n8n style) */}
      <div className="p-2 border-b border-slate-200/90 bg-slate-50/70 shrink-0">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('nodes')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'nodes'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Thư viện khối bước cơ bản"
          >
            <span className="material-symbols-outlined text-[16px]">widgets</span>
            <span>Khối bước</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lanes')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'lanes'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Cấu hình nhóm trách nhiệm (Lanes)"
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span>Làn ({lanes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'stages'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Cấu hình cột giai đoạn (Stages)"
          >
            <span className="material-symbols-outlined text-[16px]">view_column</span>
            <span>Giai đoạn ({stages.length})</span>
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {/* ============================================================== */}
        {/* TAB 1: THƯ VIỆN BƯỚC CƠ BẢN (N8N STYLE - KHÔNG CẤU HÌNH SẴN)   */}
        {/* ============================================================== */}
        {activeTab === 'nodes' && (
          <div className="space-y-3">
            {/* Header info */}

            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bước (Bắt đầu, Xử lý, Rẽ nhánh...)"
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
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
              {NODE_CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Danh sách các bước cơ bản */}
            <div className="space-y-2">
              {filteredNodes.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  <span className="material-symbols-outlined text-[24px] text-slate-300 block mb-1">
                    search_off
                  </span>
                  <span>Không tìm thấy bước phù hợp</span>
                </div>
              ) : (
                filteredNodes.map((node) => (
                  <div
                    key={node.id}
                    draggable={!isReadOnly}
                    onDragStart={(e) => handleDragStart(e, node)}
                    onClick={() => handleSelectNode(node)}
                    className={`p-2 rounded-xl border bg-white flex items-center justify-between transition-all group ${node.color.border
                      } ${isReadOnly
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:border-blue-400 hover:shadow-xs hover:bg-slate-50/70 cursor-grab active:cursor-grabbing shadow-2xs'
                      }`}
                    title={isReadOnly ? 'Chế độ chỉ đọc' : 'Kéo thả vào Canvas hoặc nhấp để thêm bước'}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon Container (n8n signature square badge) */}
                      <div
                        className={`w-8 h-8 rounded-xl ${node.color.bg} ${node.color.text} border ${node.color.border} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        <span className="material-symbols-outlined text-[19px]">{node.icon}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 block truncate group-hover:text-blue-700 transition-colors text-xs">
                            {node.name}
                          </span>
                          <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                            {node.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1 leading-tight mt-0.5">
                          {node.shortDesc}
                        </span>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center gap-1 shrink-0 pl-1.5">
                        <button
                          type="button"
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Thêm bước này vào sơ đồ"
                        >
                          <span className="material-symbols-outlined text-[17px]">add</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LÀN TRÁCH NHIỆM (LANES)                                 */}
        {/* ============================================================== */}
        {activeTab === 'lanes' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Nhóm trách nhiệm (Lanes)</span>
              <span className="text-[10.5px] text-slate-500 block leading-relaxed mt-0.5">
                Mỗi hàng ngang đại diện cho một đơn vị hoặc vai trò phụ trách thực hiện các bước.
              </span>
            </div>

            {/* List of Lanes */}
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

                          <button
                            type="button"
                            onClick={() => handleStartEditLane(lane)}
                            className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Chỉnh sửa tên & mã nhóm"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>

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

            {/* Form Thêm Làn mới */}
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
        {/* TAB 3: GIAI ĐOẠN (STAGES)                                      */}
        {/* ============================================================== */}
        {activeTab === 'stages' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Cột Giai đoạn (Phases)</span>
              <span className="text-[10.5px] text-slate-500 block leading-relaxed mt-0.5">
                Mỗi cột dọc trên sơ đồ đại diện cho một mốc tiến độ trong vòng đời quy trình.
              </span>
            </div>

            {/* List of Stages */}
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

                          <button
                            type="button"
                            onClick={() => handleStartEditStage(stage)}
                            className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            title="Chỉnh sửa tên giai đoạn"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>

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

            {/* Form Thêm Giai đoạn mới */}
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
