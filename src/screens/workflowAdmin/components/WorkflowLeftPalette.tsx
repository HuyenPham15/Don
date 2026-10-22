// src/screens/workflowAdmin/components/WorkflowLeftPalette.tsx
import React, { useState } from 'react';
import { ProcessLane, ProcessStage, WorkflowNodeType, ProcessStep } from '../../../types/workflowConfig';
import {
  WORKFLOW_COMPONENT_CATEGORIES,
  WORKFLOW_COMPONENT_REGISTRY,
  ComponentRegistryItem,
} from '../registry/workflowComponentRegistry';

export type ConditionGroupCategory = 'ALL' | 'THU_LY' | 'XAC_MINH' | 'PHE_DUYET' | 'BO_SUNG' | 'TU_CHOI' | 'CUSTOM';

export interface ConditionGroupItem {
  id: string;
  name: string;
  code: string;
  category: 'THU_LY' | 'XAC_MINH' | 'PHE_DUYET' | 'BO_SUNG' | 'TU_CHOI' | 'CUSTOM';
  description: string;
  icon: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
  };
  conditions: string[];
}

export const CONDITION_GROUP_CATEGORIES: { id: ConditionGroupCategory; label: string; icon: string }[] = [
  { id: 'ALL', label: 'Tất cả', icon: 'apps' },
  { id: 'THU_LY', label: 'Thụ lý', icon: 'fact_check' },
  { id: 'XAC_MINH', label: 'Xác minh', icon: 'troubleshoot' },
  { id: 'PHE_DUYET', label: 'Phê duyệt', icon: 'verified' },
  { id: 'BO_SUNG', label: 'Bổ sung', icon: 'rule_folder' },
  { id: 'TU_CHOI', label: 'Từ chối / Trả', icon: 'assignment_return' },
  { id: 'CUSTOM', label: 'Tự tạo', icon: 'tune' },
];

export const INITIAL_CONDITION_GROUPS: ConditionGroupItem[] = [
  {
    id: 'grp-thu-ly',
    name: 'Nhóm điều kiện thụ lý & tính hợp lệ',
    code: 'NDK-TL',
    category: 'THU_LY',
    description: 'Đối chiếu tính hợp lệ, thẩm quyền và thời hiệu theo Luật Khiếu nại, Tố cáo',
    icon: 'fact_check',
    color: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-600',
    },
    conditions: [
      'Người nộp đơn được xác định danh tính (CCCD/Định danh hợp lệ)',
      'Có nội dung, đối tượng bị khiếu nại / tố cáo cụ thể rõ ràng',
      'Vụ việc thuộc thẩm quyền giải quyết của cơ quan',
      'Còn trong thời hiệu khiếu nại / tố cáo theo quy định pháp luật',
      'Chưa có quyết định giải quyết có hiệu lực pháp luật cuối cùng',
    ],
  },
  {
    id: 'grp-xac-minh',
    name: 'Nhóm điều kiện xác minh thực tế',
    code: 'NDK-XM',
    category: 'XAC_MINH',
    description: 'Điều kiện chuẩn bị và thực thi kế hoạch xác minh hiện trường, đối thoại',
    icon: 'troubleshoot',
    color: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-600',
    },
    conditions: [
      'Đã ban hành Quyết định thành lập đoàn / tổ xác minh',
      'Đã gửi thông báo lịch làm việc cho các bên liên quan',
      'Đầy đủ thành phần tổ xác minh theo quyết định phân công',
      'Có biên bản làm việc trực tiếp có chữ ký xác nhận của các bên',
    ],
  },
  {
    id: 'grp-bo-sung',
    name: 'Nhóm điều kiện yêu cầu bổ sung',
    code: 'NDK-BS',
    category: 'BO_SUNG',
    description: 'Ràng buộc khi tạm dừng tính hạn để yêu cầu bổ sung tài liệu chứng cứ',
    icon: 'rule_folder',
    color: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-800',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-600',
    },
    conditions: [
      'Hồ sơ còn thiếu tài liệu quan trọng theo quy định pháp luật',
      'Đã phát hành Thông báo / Phiếu hướng dẫn bổ sung hồ sơ',
      'Thời hạn bổ sung còn trong hiệu lực (chưa quá hạn)',
    ],
  },
  {
    id: 'grp-phe-duyet',
    name: 'Nhóm điều kiện thẩm định & phê duyệt',
    code: 'NDK-PD',
    category: 'PHE_DUYET',
    description: 'Tiêu chuẩn rà soát trước khi Lãnh đạo ký duyệt văn bản quyết định',
    icon: 'verified',
    color: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-600',
    },
    conditions: [
      'Cán bộ chuyên môn đã trình đủ hồ sơ và dự thảo văn bản',
      'Dự thảo văn bản tuân thủ đúng thể thức và thẩm quyền',
      'Đã kiểm tra căn cứ pháp lý và kết quả xác minh trước khi ký',
      'Đã lấy ý kiến thẩm định pháp chế (nếu thuộc trường hợp phức tạp)',
    ],
  },
  {
    id: 'grp-tu-choi',
    name: 'Nhóm điều kiện trả lại / từ chối',
    code: 'NDK-TC',
    category: 'TU_CHOI',
    description: 'Căn cứ pháp lý để từ chối thụ lý hoặc chuyển đơn đúng thẩm quyền',
    icon: 'assignment_return',
    color: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-600',
    },
    conditions: [
      'Vụ việc không thuộc thẩm quyền giải quyết của cơ quan',
      'Đã hết thời hiệu khiếu nại theo quy định pháp luật',
      'Đơn khiếu nại / tố cáo trùng lặp đã được giải quyết dứt điểm',
      'Đơn mạo danh, nặc danh hoặc không có chữ ký / điểm chỉ hợp pháp',
    ],
  },
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
  onApplyConditionGroupToStep,
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
  const [activeTab, setActiveTab] = useState<'components' | 'conditions' | 'lanes' | 'stages'>('components');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Condition Groups states
  const [conditionGroups, setConditionGroups] = useState<ConditionGroupItem[]>(INITIAL_CONDITION_GROUPS);
  const [selectedCondCategory, setSelectedCondCategory] = useState<ConditionGroupCategory>('ALL');
  const [condSearchQuery, setCondSearchQuery] = useState('');
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set(['grp-thu-ly']));
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);

  // New Condition Group Form State
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState<ConditionGroupItem['category']>('CUSTOM');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupConditions, setNewGroupConditions] = useState<string[]>([]);
  const [newCondInputLine, setNewCondInputLine] = useState('');

  // Editing Condition Group State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupCode, setEditGroupCode] = useState('');
  const [editGroupCategory, setEditGroupCategory] = useState<ConditionGroupItem['category']>('CUSTOM');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [editGroupConditions, setEditGroupConditions] = useState<string[]>([]);
  const [editCondInputLine, setEditCondInputLine] = useState('');


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

  // Condition Groups Handlers
  const handleToggleExpandGroup = (groupId: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleAddConditionToNewGroup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCondInputLine.trim()) return;
    setNewGroupConditions((prev) => [...prev, newCondInputLine.trim()]);
    setNewCondInputLine('');
  };

  const handleRemoveConditionFromNewGroup = (idx: number) => {
    setNewGroupConditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateConditionGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const code = newGroupCode.trim().toUpperCase() || `NDK-${String(conditionGroups.length + 1).padStart(2, '0')}`;
    const newGroup: ConditionGroupItem = {
      id: `grp-custom-${Date.now()}`,
      name: newGroupName.trim(),
      code,
      category: newGroupCategory,
      description: newGroupDesc.trim() || 'Nhóm điều kiện nghiệp vụ tùy chỉnh',
      icon: 'tune',
      color: {
        bg: 'bg-indigo-50/70',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        badgeBg: 'bg-indigo-600',
      },
      conditions: newGroupConditions.length > 0 ? newGroupConditions : ['Điều kiện hợp lệ theo quy định'],
    };

    setConditionGroups((prev) => [...prev, newGroup]);
    setIsAddingGroup(false);
    setNewGroupName('');
    setNewGroupCode('');
    setNewGroupDesc('');
    setNewGroupConditions([]);
    setNewCondInputLine('');
    setExpandedGroupIds((prev) => new Set([...prev, newGroup.id]));
  };

  const handleStartEditGroup = (group: ConditionGroupItem) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
    setEditGroupCode(group.code);
    setEditGroupCategory(group.category);
    setEditGroupDesc(group.description);
    setEditGroupConditions([...group.conditions]);
    setEditCondInputLine('');
  };

  const handleAddConditionToEditGroup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editCondInputLine.trim()) return;
    setEditGroupConditions((prev) => [...prev, editCondInputLine.trim()]);
    setEditCondInputLine('');
  };

  const handleRemoveConditionFromEditGroup = (idx: number) => {
    setEditGroupConditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveEditGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupId || !editGroupName.trim()) return;
    setConditionGroups((prev) =>
      prev.map((g) => {
        if (g.id !== editingGroupId) return g;
        return {
          ...g,
          name: editGroupName.trim(),
          code: editGroupCode.trim().toUpperCase() || g.code,
          category: editGroupCategory,
          description: editGroupDesc.trim(),
          conditions: editGroupConditions.length > 0 ? editGroupConditions : g.conditions,
        };
      })
    );
    setEditingGroupId(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhóm điều kiện này khỏi danh mục?')) {
      setConditionGroups((prev) => prev.filter((g) => g.id !== groupId));
    }
  };

  const handleCopyConditions = (group: ConditionGroupItem) => {
    const text = group.conditions.map((c, i) => `${i + 1}. ${c}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedGroupId(group.id);
    setTimeout(() => setCopiedGroupId(null), 2000);
  };

  const handleCreateStepFromGroup = (group: ConditionGroupItem) => {
    if (isReadOnly) return;
    onAddStep('CHECK', {
      name: group.name,
      description: group.description,
      conditions: [...group.conditions],
      conditionsOverride: true,
      isCustomized: true,
    });
  };

  const filteredConditionGroups = conditionGroups.filter((g) => {
    const matchesCat = selectedCondCategory === 'ALL' || g.category === selectedCondCategory;
    const q = condSearchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.code.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.conditions.some((c) => c.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <aside className="w-80 bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0 select-none shadow-2xs z-20">
      {/* 1. Header & Navigation Tabs (4 TABS) */}
      <div className="p-2 border-b border-slate-200/90 bg-slate-50/70 shrink-0">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`py-1.5 px-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${activeTab === 'components'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Thư viện các khối thành phần bước"
          >
            <span className="material-symbols-outlined text-[16px]">widgets</span>
            <span className="truncate">Khối bước</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`py-1.5 px-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${activeTab === 'conditions'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Cấu hình danh mục các Nhóm điều kiện"
          >
            <span className="material-symbols-outlined text-[16px]">rule</span>
            <span className="truncate">Điều kiện ({conditionGroups.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lanes')}
            className={`py-1.5 px-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${activeTab === 'lanes'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Nhóm trách nhiệm (Lanes)"
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span className="truncate">Làn ({lanes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`py-1.5 px-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${activeTab === 'stages'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            title="Cột giai đoạn (Phases / Stages)"
          >
            <span className="material-symbols-outlined text-[16px]">view_column</span>
            <span className="truncate">Giai đoạn ({stages.length})</span>
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
                placeholder="Tìm thành phần bước..."
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
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === 'ALL'
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
                  className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={cat.description}
                >
                  <span>{cat.title}</span>
                </button>
              ))}
            </div>

            {/* Danh sách các khối bước quy trình chuẩn */}
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
                        className={`p-2.5 rounded-xl border bg-white flex items-center justify-between transition-all group ${
                          comp.color.border
                        } ${
                          isReadOnly
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
        {/* TAB 2: CẤU HÌNH CÁC NHÓM ĐIỀU KIỆN (CONDITION GROUPS)          */}
        {/* ============================================================== */}
        {activeTab === 'conditions' && (
          <div className="space-y-3.5">
            {/* Header info & Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">rule</span>
                  <span>Nhóm điều kiện nghiệp vụ</span>
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Quản lý danh mục nhóm điều kiện áp dụng cho bước &amp; đường chuyển
                </span>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setIsAddingGroup(!isAddingGroup)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isAddingGroup ? 'close' : 'add'}
                  </span>
                  <span>{isAddingGroup ? 'Đóng' : 'Thêm'}</span>
                </button>
              )}
            </div>

            {/* Banner nếu đang chọn một Bước trên canvas */}
            {selectedStep && (
              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs flex items-start gap-2 shadow-2xs">
                <span className="material-symbols-outlined text-blue-600 text-[17px] shrink-0 mt-0.5">touch_app</span>
                <div className="min-w-0">
                  <span className="text-[10.5px] text-blue-800 font-medium block">
                    Đang chọn bước trên sơ đồ:
                  </span>
                  <span className="font-bold text-slate-900 truncate block text-[11.5px]">
                    {selectedStep.name}
                  </span>
                  <span className="text-[9.5px] text-blue-700 font-mono">
                    ({selectedStep.code} • {selectedStep.conditions?.length || 0} điều kiện)
                  </span>
                </div>
              </div>
            )}

            {/* Form Thêm Nhóm điều kiện mới */}
            {isAddingGroup && !isReadOnly && (
              <form
                onSubmit={handleCreateConditionGroup}
                className="p-3 bg-white rounded-xl border-2 border-blue-200 shadow-md space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">add_circle</span>
                    Tạo Nhóm điều kiện mới
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingGroup(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Tên nhóm điều kiện *</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="VD: Nhóm điều kiện xác minh đột xuất..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Mã nhóm</label>
                    <input
                      type="text"
                      value={newGroupCode}
                      onChange={(e) => setNewGroupCode(e.target.value.toUpperCase())}
                      placeholder="NDK-01"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-center focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Phân loại</label>
                    <select
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="THU_LY">Thụ lý</option>
                      <option value="XAC_MINH">Xác minh</option>
                      <option value="PHE_DUYET">Phê duyệt</option>
                      <option value="BO_SUNG">Bổ sung</option>
                      <option value="TU_CHOI">Từ chối / Trả</option>
                      <option value="CUSTOM">Tự định nghĩa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Mô tả mục đích</label>
                  <input
                    type="text"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Mô tả phạm vi áp dụng..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Sub-conditions builder */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <label className="text-[10.5px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Danh sách điều kiện con ({newGroupConditions.length}):</span>
                  </label>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newCondInputLine}
                      onChange={(e) => setNewCondInputLine(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddConditionToNewGroup();
                        }
                      }}
                      placeholder="Nhập nội dung điều kiện rồi nhấn Thêm..."
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddConditionToNewGroup()}
                      disabled={!newCondInputLine.trim()}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>

                  {newGroupConditions.length > 0 && (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {newGroupConditions.map((cond, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                        >
                          <span className="line-clamp-1 flex-1 pr-2">
                            <strong className="text-slate-500 font-mono mr-1">{idx + 1}.</strong> {cond}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveConditionFromNewGroup(idx)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingGroup(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!newGroupName.trim()}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Lưu nhóm điều kiện
                  </button>
                </div>
              </form>
            )}

            {/* Search Box */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={condSearchQuery}
                onChange={(e) => setCondSearchQuery(e.target.value)}
                placeholder="Tìm tên nhóm, mã hoặc nội dung điều kiện..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
              {condSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCondSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10.5px]">
              {CONDITION_GROUP_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCondCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${selectedCondCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* List of Condition Groups */}
            <div className="space-y-2.5">
              {filteredConditionGroups.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  <span className="material-symbols-outlined text-[24px] text-slate-300 block mb-1">
                    filter_alt_off
                  </span>
                  <span>Không tìm thấy nhóm điều kiện phù hợp.</span>
                  {condSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setCondSearchQuery('');
                        setSelectedCondCategory('ALL');
                      }}
                      className="text-blue-600 font-bold block mx-auto mt-1 hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              ) : (
                filteredConditionGroups.map((group) => {
                  const isExpanded = expandedGroupIds.has(group.id);
                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all overflow-hidden"
                    >
                      {/* Group Header */}
                      <div
                        onClick={() => handleToggleExpandGroup(group.id)}
                        className="p-2.5 cursor-pointer flex items-start justify-between gap-2 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg ${group.color.bg} ${group.color.text} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            <span className="material-symbols-outlined text-[17px]">{group.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs leading-snug">
                                {group.name}
                              </span>
                              <span className="font-mono text-[9.5px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                {group.code}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {group.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-700">
                            {group.conditions.length} ĐK
                          </span>
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </div>

                      {/* Group Expanded Content */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-2.5">
                          {/* List of sub conditions */}
                          <div className="space-y-1.5 text-[11px] pt-1">
                            {group.conditions.map((cond, cIdx) => (
                              <div
                                key={cIdx}
                                className="flex items-start gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs leading-relaxed"
                              >
                                <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">
                                  check_circle
                                </span>
                                <span className="text-slate-700 font-medium">{cond}</span>
                              </div>
                            ))}
                          </div>

                          {/* Quick Actions Bar */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/60 text-xs">
                            {/* Nút Gán trực tiếp vào bước đang chọn */}
                            {selectedStep && onApplyConditionGroupToStep && !isReadOnly && (
                              <button
                                type="button"
                                onClick={() => onApplyConditionGroupToStep(group.conditions, group.name)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10.5px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                title={`Gán ${group.conditions.length} điều kiện này vào bước: ${selectedStep.name}`}
                              >
                                <span className="material-symbols-outlined text-[14px]">add_task</span>
                                <span>Gán vào bước</span>
                              </button>
                            )}

                            {/* Nút Tạo bước mới từ nhóm điều kiện này */}
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleCreateStepFromGroup(group)}
                                className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10.5px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                title="Thêm một bước kiểm tra mới vào sơ đồ mang nhóm điều kiện này"
                              >
                                <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                <span>+ Tạo bước</span>
                              </button>
                            )}

                            {/* Nút Sao chép điều kiện */}
                            <button
                              type="button"
                              onClick={() => handleCopyConditions(group)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer ml-auto"
                              title="Sao chép toàn bộ điều kiện vào Clipboard"
                            >
                              <span className="material-symbols-outlined text-[13px] text-slate-500">
                                {copiedGroupId === group.id ? 'check' : 'content_copy'}
                              </span>
                              <span>{copiedGroupId === group.id ? 'Đã chép!' : 'Chép ĐK'}</span>
                            </button>

                            {/* Nút Chỉnh sửa nhóm */}
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleStartEditGroup(group)}
                                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-blue-700 rounded-md transition-colors cursor-pointer"
                                title="Chỉnh sửa nhóm điều kiện này"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                              </button>
                            )}

                            {/* Nút Xóa nhóm */}
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleDeleteGroup(group.id)}
                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                title="Xóa nhóm điều kiện này"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: RESPONSIBILITY LANES (CONFIGURABLE)                     */}
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

      {/* Modal Chỉnh sửa Nhóm điều kiện */}
      {editingGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">rule</span>
                <span>Chỉnh sửa Nhóm điều kiện</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingGroupId(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên nhóm điều kiện *</label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã nhóm</label>
                  <input
                    type="text"
                    value={editGroupCode}
                    onChange={(e) => setEditGroupCode(e.target.value.toUpperCase())}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-center text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={editGroupCategory}
                    onChange={(e) => setEditGroupCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="THU_LY">Thụ lý</option>
                    <option value="XAC_MINH">Xác minh</option>
                    <option value="PHE_DUYET">Phê duyệt</option>
                    <option value="BO_SUNG">Bổ sung</option>
                    <option value="TU_CHOI">Từ chối / Trả</option>
                    <option value="CUSTOM">Tự định nghĩa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả mục đích</label>
                <input
                  type="text"
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700">
                  Danh sách các điều kiện con ({editGroupConditions.length}):
                </label>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editCondInputLine}
                    onChange={(e) => setEditCondInputLine(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddConditionToEditGroup();
                      }
                    }}
                    placeholder="Nội dung điều kiện mới..."
                    className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddConditionToEditGroup()}
                    disabled={!editCondInputLine.trim()}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {editGroupConditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                    >
                      <span className="flex-1 pr-2">
                        <strong className="text-slate-500 font-mono mr-1">{idx + 1}.</strong> {cond}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveConditionFromEditGroup(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                        title="Xóa điều kiện này"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGroupId(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={!editGroupName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
