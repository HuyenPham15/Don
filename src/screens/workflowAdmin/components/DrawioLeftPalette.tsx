// src/screens/workflowAdmin/components/DrawioLeftPalette.tsx
import React, { useState } from 'react';
import { WorkflowNodeType } from '../../../types/workflowConfig';

export interface DrawioPaletteItem {
  id: string;
  type: WorkflowNodeType;
  name: string;
  desc: string;
  icon: string;
  shape: 'pill' | 'rect' | 'diamond' | 'card';
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    iconColor: string;
  };
}

export const DRAWIO_COMPONENT_GROUPS = [
  {
    id: 'steps',
    title: 'Bước',
    icon: 'linear_scale',
    items: [
      {
        id: 'start-node',
        type: 'START' as WorkflowNodeType,
        name: 'Bắt đầu',
        desc: 'Khởi tạo luồng tiếp nhận hồ sơ',
        icon: 'play_circle',
        shape: 'pill' as const,
        badgeColor: {
          bg: 'bg-emerald-50 hover:bg-emerald-100/80',
          text: 'text-emerald-800',
          border: 'border-emerald-300',
          iconColor: 'text-emerald-600',
        },
      },
      {
        id: 'task-node',
        type: 'TASK' as WorkflowNodeType,
        name: 'Bước xử lý',
        desc: 'Nhiệm vụ nghiệp vụ chuyên môn',
        icon: 'task_alt',
        shape: 'rect' as const,
        badgeColor: {
          bg: 'bg-blue-50 hover:bg-blue-100/80',
          text: 'text-blue-800',
          border: 'border-blue-300',
          iconColor: 'text-blue-600',
        },
      },
      {
        id: 'end-node',
        type: 'END' as WorkflowNodeType,
        name: 'Kết thúc',
        desc: 'Hoàn tất và đóng quy trình',
        icon: 'stop_circle',
        shape: 'pill' as const,
        badgeColor: {
          bg: 'bg-rose-50 hover:bg-rose-100/80',
          text: 'text-rose-800',
          border: 'border-rose-300',
          iconColor: 'text-rose-600',
        },
      },
    ],
  },
  {
    id: 'conditions',
    title: 'Điều kiện',
    icon: 'alt_route',
    items: [
      {
        id: 'condition-node',
        type: 'CHECK' as WorkflowNodeType,
        name: 'Điều kiện rẽ nhánh',
        desc: 'Phân luồng theo quy tắc Đúng/Sai',
        icon: 'alt_route',
        shape: 'diamond' as const,
        badgeColor: {
          bg: 'bg-amber-50 hover:bg-amber-100/80',
          text: 'text-amber-800',
          border: 'border-amber-300',
          iconColor: 'text-amber-600',
        },
      },
    ],
  },
  {
    id: 'information',
    title: 'Thông tin',
    icon: 'folder_open',
    items: [
      {
        id: 'info-group-node',
        type: 'INFO_GROUP' as WorkflowNodeType,
        name: 'Nhóm thông tin',
        desc: 'Tập hợp các trường dữ liệu hồ sơ',
        icon: 'description',
        shape: 'card' as const,
        badgeColor: {
          bg: 'bg-purple-50 hover:bg-purple-100/80',
          text: 'text-purple-800',
          border: 'border-purple-300',
          iconColor: 'text-purple-600',
        },
      },
      {
        id: 'data-field-node',
        type: 'DATA_FIELD' as WorkflowNodeType,
        name: 'Trường dữ liệu',
        desc: 'Trường thông tin cụ thể trong đơn',
        icon: 'short_text',
        shape: 'rect' as const,
        badgeColor: {
          bg: 'bg-slate-100 hover:bg-slate-200/80',
          text: 'text-slate-800',
          border: 'border-slate-300',
          iconColor: 'text-slate-600',
        },
      },
    ],
  },
];

interface DrawioLeftPaletteProps {
  onAddNode: (type: WorkflowNodeType, defaultName: string) => void;
  isReadOnly?: boolean;
}

export default function DrawioLeftPalette({
  onAddNode,
  isReadOnly = false,
}: DrawioLeftPaletteProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleDragStart = (e: React.DragEvent, item: DrawioPaletteItem) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('application/workflow-node-type', item.type);
    e.dataTransfer.setData('text/plain', item.name);
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (isPanelCollapsed) {
    return (
      <div className="w-10 bg-white border-r border-slate-200/90 flex flex-col items-center py-3 select-none shrink-0 shadow-2xs z-20">
        <button
          type="button"
          onClick={() => setIsPanelCollapsed(false)}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Mở rộng thư viện thành phần"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
        <span className="mt-8 text-[11px] font-bold text-slate-400 rotate-90 whitespace-nowrap tracking-wider uppercase">
          Thư viện
        </span>
      </div>
    );
  }

  return (
    <aside className="w-[220px] bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0 select-none shadow-2xs z-20">
      {/* 1. Header */}
      <div className="h-11 px-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">widgets</span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Thành phần
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsPanelCollapsed(true)}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Thu gọn bảng thư viện"
        >
          <span className="material-symbols-outlined text-[17px]">chevron_left</span>
        </button>
      </div>

      {/* 2. Drag & Drop Helper Text */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10.5px] text-slate-500 leading-tight">
        Kéo thả hoặc nhấp <span className="font-bold text-blue-600">+</span> để thêm vào canvas
      </div>

      {/* 3. Collapsible Component Groups */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {DRAWIO_COMPONENT_GROUPS.map((group) => {
          const isCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full px-2.5 py-1.5 bg-slate-50/90 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-slate-500 text-[16px]">
                    {group.icon}
                  </span>
                  <span className="text-[11.5px] font-bold text-slate-700 truncate">
                    {group.title}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    ({group.items.length})
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[16px] transition-transform duration-150">
                  {isCollapsed ? 'expand_more' : 'expand_less'}
                </span>
              </button>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="p-1.5 space-y-1.5 bg-white">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      draggable={!isReadOnly}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => !isReadOnly && onAddNode(item.type, item.name)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs cursor-grab active:cursor-grabbing transition-all ${item.badgeColor.bg} ${item.badgeColor.border} hover:shadow-xs`}
                      title={`Kéo thả "${item.name}" vào canvas hoặc bấm để thêm`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Shape Preview Indicator */}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {item.shape === 'diamond' ? (
                            <div className="w-3.5 h-3.5 border-2 border-amber-500 rotate-45 bg-amber-100" />
                          ) : item.shape === 'pill' ? (
                            <div className={`w-4 h-3 rounded-full border-2 ${item.type === 'START' ? 'border-emerald-500 bg-emerald-100' : 'border-rose-500 bg-rose-100'}`} />
                          ) : item.shape === 'card' ? (
                            <div className="w-4 h-3.5 border-2 border-purple-500 rounded bg-purple-100 flex items-center justify-center">
                              <span className="w-2 h-0.5 bg-purple-400 block" />
                            </div>
                          ) : (
                            <div className="w-4 h-3.5 border-2 border-blue-500 rounded-sm bg-blue-100" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className={`font-semibold block truncate text-[11.5px] ${item.badgeColor.text}`}>
                            {item.name}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isReadOnly) onAddNode(item.type, item.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 text-slate-600 transition-opacity"
                        title="Thêm nhanh vào canvas"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
