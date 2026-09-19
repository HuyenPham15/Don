// src/screens/workflowAdmin/components/WorkflowLeftPalette.tsx
import React, { useState } from 'react';
import { ProcessLane, ProcessStage } from '../../../types/workflowConfig';

interface WorkflowLeftPaletteProps {
  lanes: ProcessLane[];
  stages: ProcessStage[];
  onAddStep: (type: 'normal' | 'start' | 'end' | 'review' | 'approval' | 'archive') => void;
  onAddLane: (name: string, code: string) => void;
  onAddStage: (name: string) => void;
  isReadOnly?: boolean;
}

export default function WorkflowLeftPalette({
  lanes,
  stages,
  onAddStep,
  onAddLane,
  onAddStage,
  isReadOnly = false,
}: WorkflowLeftPaletteProps) {
  const [activeTab, setActiveTab] = useState<'components' | 'lanes' | 'stages'>('components');
  const [newLaneName, setNewLaneName] = useState('');
  const [newLaneCode, setNewLaneCode] = useState('');
  const [newStageName, setNewStageName] = useState('');

  const handleAddLane = () => {
    if (!newLaneName.trim()) return;
    onAddLane(newLaneName.trim(), newLaneCode.trim() || 'NV');
    setNewLaneName('');
    setNewLaneCode('');
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    onAddStage(newStageName.trim());
    setNewStageName('');
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0 select-none shadow-2xs z-20">
      {/* 1. Header & Navigation Tabs */}
      <div className="p-3 border-b border-slate-200/90 bg-slate-50/70">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'components'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thành phần
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lanes')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'lanes'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhóm ({lanes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'stages'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Giai đoạn
          </button>
        </div>
      </div>

      {/* 2. Body based on active tab */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: THÀNH PHẦN (COMPONENTS) */}
        {activeTab === 'components' && (
          <div className="space-y-4">
            {/* Nhóm: Các điểm đầu - cuối */}
            <div>
              <span className="font-bold text-slate-400 text-[10.5px] uppercase tracking-wider block mb-2">
                Điểm đầu - cuối luồng
              </span>
              <div className="space-y-2">
                {/* Điểm bắt đầu */}
                <div
                  onClick={() => !isReadOnly && onAddStep('start')}
                  className={`p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between transition-all ${
                    isReadOnly ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    </div>
                    <div>
                      <span className="font-bold text-blue-950 block">Điểm bắt đầu</span>
                      <span className="text-[10px] text-blue-800/80">Khởi đầu tiếp nhận đơn</span>
                    </div>
                  </div>
                  {!isReadOnly && <span className="material-symbols-outlined text-blue-600 text-[18px]">add</span>}
                </div>

                {/* Điểm kết thúc */}
                <div
                  onClick={() => !isReadOnly && onAddStep('end')}
                  className={`p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between transition-all ${
                    isReadOnly ? 'opacity-60 cursor-not-allowed' : 'hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">flag</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950 block">Điểm kết thúc</span>
                      <span className="text-[10px] text-emerald-800/80">Lưu trữ &amp; đóng hồ sơ</span>
                    </div>
                  </div>
                  {!isReadOnly && <span className="material-symbols-outlined text-emerald-600 text-[18px]">add</span>}
                </div>
              </div>
            </div>

            {/* Nhóm: Mẫu Bước xử lý nghiệp vụ */}
            <div>
              <span className="font-bold text-slate-400 text-[10.5px] uppercase tracking-wider block mb-2">
                Bước xử lý nghiệp vụ
              </span>
              <div className="space-y-2">
                <div
                  onClick={() => !isReadOnly && onAddStep('normal')}
                  className={`p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between transition-all ${
                    isReadOnly ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Bước xử lý thông thường</span>
                      <span className="text-[10px] text-slate-400">Xác minh, thu thập chứng cứ</span>
                    </div>
                  </div>
                  {!isReadOnly && <span className="material-symbols-outlined text-slate-400 text-[18px]">add</span>}
                </div>

                <div
                  onClick={() => !isReadOnly && onAddStep('approval')}
                  className={`p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between transition-all ${
                    isReadOnly ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Bước trình duyệt / Phê duyệt</span>
                      <span className="text-[10px] text-slate-400">Dành cho Lãnh đạo thẩm quyền</span>
                    </div>
                  </div>
                  {!isReadOnly && <span className="material-symbols-outlined text-slate-400 text-[18px]">add</span>}
                </div>

                <div
                  onClick={() => !isReadOnly && onAddStep('archive')}
                  className={`p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between transition-all ${
                    isReadOnly ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Bước thông báo kết quả</span>
                      <span className="text-[10px] text-slate-400">Phát hành công văn trả lời</span>
                    </div>
                  </div>
                  {!isReadOnly && <span className="material-symbols-outlined text-slate-400 text-[18px]">add</span>}
                </div>
              </div>
            </div>

            {/* Chú thích loại đường chuyển */}
            <div className="pt-2 border-t border-slate-200/90">
              <span className="font-bold text-slate-400 text-[10.5px] uppercase tracking-wider block mb-2">
                Các loại đường nối (Connector)
              </span>
              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-0.5 bg-blue-600 inline-block"></span>
                    <span className="font-bold text-blue-900">Đường chuyển bình thường</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">
                    Di chuyển tiếp theo thứ tự giai đoạn khi đạt đủ điều kiện.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-0.5 border-t-2 border-dashed border-amber-600 inline-block"></span>
                    <span className="font-bold text-amber-900">Đường quay lại / Trả hồ sơ</span>
                  </div>
                  <p className="text-amber-800 text-[10px]">
                    Quay lại bước trước khi lãnh đạo yêu cầu xác minh bổ sung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NHÓM TRÁCH NHIỆM (LANES) */}
        {activeTab === 'lanes' && (
          <div className="space-y-3">
            <span className="text-[11px] text-slate-500 block">
              Mỗi hàng ngang (Lane) trên canvas đại diện cho 01 nhóm chịu trách nhiệm xử lý
            </span>

            <div className="space-y-2">
              {lanes.map((lane, i) => (
                <div
                  key={lane.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{lane.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Mã: {lane.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isReadOnly && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-3">
                <span className="font-bold text-slate-800 text-[11px] block">+ Thêm Nhóm trách nhiệm mới</span>
                <input
                  type="text"
                  value={newLaneName}
                  onChange={(e) => setNewLaneName(e.target.value)}
                  placeholder="Tên nhóm (vd: Thanh tra...)"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLaneCode}
                    onChange={(e) => setNewLaneCode(e.target.value)}
                    placeholder="Mã ngắn (TT)"
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddLane}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    Thêm Lane
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GIAI ĐOẠN (STAGES) */}
        {activeTab === 'stages' && (
          <div className="space-y-3">
            <span className="text-[11px] text-slate-500 block">
              Mỗi cột dọc trên canvas đại diện cho 01 giai đoạn trong tiến trình xử lý
            </span>

            <div className="space-y-2">
              {stages.map((stg, i) => (
                <div
                  key={stg.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center font-mono">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-900">{stg.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {!isReadOnly && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-3">
                <span className="font-bold text-slate-800 text-[11px] block">+ Thêm Giai đoạn mới</span>
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Tên giai đoạn mới..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Thêm Cột giai đoạn
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
