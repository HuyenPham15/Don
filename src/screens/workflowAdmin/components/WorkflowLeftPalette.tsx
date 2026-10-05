// src/screens/workflowAdmin/components/WorkflowLeftPalette.tsx
import React, { useState } from 'react';
import { ProcessLane, ProcessStage } from '../../../types/workflowConfig';

export interface WorkflowLeftPaletteProps {
  lanes: ProcessLane[];
  stages: ProcessStage[];
  onAddStep: (type: 'normal' | 'start' | 'end' | 'review' | 'approval' | 'archive') => void;
  onAddLane: (name: string, code: string) => void;
  onAddStage: (name: string) => void;
  isReadOnly?: boolean;
  status?: string;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onFitView?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export default function WorkflowLeftPalette({
  lanes,
  stages,
  onAddStep,
  onAddLane,
  onAddStage,
  isReadOnly = false,
  status = 'draft',
  zoomLevel = 1.0,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitView,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: WorkflowLeftPaletteProps) {
  const [openMenu, setOpenMenu] = useState<'lane' | 'stage' | null>(null);

  // Form states for Lane & Stage creation
  const [newLaneName, setNewLaneName] = useState('');
  const [newLaneCode, setNewLaneCode] = useState('');
  const [newStageName, setNewStageName] = useState('');

  const handleCreateLane = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaneName.trim()) return;
    onAddLane(newLaneName.trim(), newLaneCode.trim() || 'NV');
    setNewLaneName('');
    setNewLaneCode('');
    setOpenMenu(null);
  };

  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    onAddStage(newStageName.trim());
    setNewStageName('');
    setOpenMenu(null);
  };

  const isPublished = status === 'published';

  return (
    <>
      {/* Backdrop for closing popovers on outside click */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setOpenMenu(null)}
        />
      )}

      {/* Main Dark Canvas Toolbar */}
      <div className="w-full bg-[#141416] border-b border-[#27272a] px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 select-none z-30 shadow-sm relative">
        {/* Left Side: Status Badge & Creation Buttons (+ Bước, + Nhóm, + Giai đoạn) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Status Badge: • Bản nháp – đang thiết kế */}
          <div className="flex items-center gap-2 px-1.5 py-1">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isPublished ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            />
            <span className="text-white text-xs sm:text-[13px] font-semibold tracking-tight whitespace-nowrap">
              {isPublished ? 'Đã phát hành – chỉ đọc' : 'Bản nháp – đang thiết kế'}
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-0.5 hidden sm:block" />

          {/* Button: + Bước */}
          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => !isReadOnly && onAddStep('normal')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isReadOnly
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-[#222226] border-zinc-700/80 text-zinc-200 hover:bg-zinc-700/70 hover:border-zinc-500 hover:text-white cursor-pointer active:scale-95'
            }`}
            title={isReadOnly ? 'Quy trình đã phát hành, không thể thêm bước' : 'Thêm bước xử lý thông thường'}
          >
            <span className="text-zinc-400 font-bold leading-none">+</span>
            <span>Bước</span>
          </button>

          {/* Button: + Nhóm */}
          <div className="relative">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setOpenMenu(openMenu === 'lane' ? null : 'lane')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isReadOnly
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                  : openMenu === 'lane'
                  ? 'bg-zinc-700 border-zinc-500 text-white shadow-xs'
                  : 'bg-[#222226] border-zinc-700/80 text-zinc-200 hover:bg-zinc-700/70 hover:border-zinc-500 hover:text-white'
              }`}
              title={isReadOnly ? 'Quy trình đã phát hành, không thể thêm nhóm' : 'Thêm nhóm trách nhiệm (Lane)'}
            >
              <span className="text-zinc-400 font-bold leading-none">+</span>
              <span>Nhóm</span>
            </button>

            {/* Popover for + Nhóm */}
            {openMenu === 'lane' && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-[#1c1c20] border border-zinc-700/90 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-400">table_rows</span>
                    Thêm Nhóm trách nhiệm (Lane)
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Hiện có: {lanes.length} nhóm
                  </span>
                </div>

                <form onSubmit={handleCreateLane} className="space-y-2.5">
                  <div>
                    <label className="text-[10.5px] text-zinc-300 font-medium block mb-1">
                      Tên nhóm trách nhiệm <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newLaneName}
                      onChange={(e) => setNewLaneName(e.target.value)}
                      placeholder="vd: Phòng Thanh tra - Tiếp dân..."
                      className="w-full px-2.5 py-1.5 bg-[#141416] border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-zinc-300 font-medium block mb-1">
                      Mã ngắn nhận diện
                    </label>
                    <input
                      type="text"
                      value={newLaneCode}
                      onChange={(e) => setNewLaneCode(e.target.value.toUpperCase())}
                      placeholder="TT, TCD, BGD..."
                      className="w-full px-2.5 py-1.5 bg-[#141416] border border-zinc-700 rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(null)}
                      className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!newLaneName.trim()}
                      className={`px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs ${
                        !newLaneName.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      Thêm Nhóm
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Button: + Giai đoạn */}
          <div className="relative">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setOpenMenu(openMenu === 'stage' ? null : 'stage')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isReadOnly
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed'
                  : openMenu === 'stage'
                  ? 'bg-zinc-700 border-zinc-500 text-white shadow-xs'
                  : 'bg-[#222226] border-zinc-700/80 text-zinc-200 hover:bg-zinc-700/70 hover:border-zinc-500 hover:text-white'
              }`}
              title={isReadOnly ? 'Quy trình đã phát hành, không thể thêm giai đoạn' : 'Thêm cột giai đoạn (Stage)'}
            >
              <span className="text-zinc-400 font-bold leading-none">+</span>
              <span>Giai đoạn</span>
            </button>

            {/* Popover for + Giai đoạn */}
            {openMenu === 'stage' && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-[#1c1c20] border border-zinc-700/90 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">view_column</span>
                    Thêm Cột Giai đoạn (Stage)
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Hiện có: {stages.length} cột
                  </span>
                </div>

                <form onSubmit={handleCreateStage} className="space-y-2.5">
                  <div>
                    <label className="text-[10.5px] text-zinc-300 font-medium block mb-1">
                      Tên giai đoạn mới <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="vd: Tiếp nhận, Xác minh, Phê duyệt..."
                      className="w-full px-2.5 py-1.5 bg-[#141416] border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(null)}
                      className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!newStageName.trim()}
                      className={`px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs ${
                        !newStageName.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      Thêm Giai đoạn
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Undo, Redo, Zoom Controls [⊖ 64% ⊕], Center / Fit View [⊙] */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo (↺) */}
          <button
            type="button"
            disabled={!canUndo || isReadOnly}
            onClick={onUndo}
            title={canUndo ? 'Hoàn tác thao tác vừa thực hiện' : 'Không có thao tác để hoàn tác'}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              canUndo && !isReadOnly
                ? 'border-zinc-700/80 bg-[#222226] text-zinc-300 hover:bg-zinc-700/70 hover:text-white cursor-pointer'
                : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
            </svg>
          </button>

          {/* Redo (↻) */}
          <button
            type="button"
            disabled={!canRedo || isReadOnly}
            onClick={onRedo}
            title={canRedo ? 'Làm lại thao tác vừa hoàn tác' : 'Không có thao tác để làm lại'}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              canRedo && !isReadOnly
                ? 'border-zinc-700/80 bg-[#222226] text-zinc-300 hover:bg-zinc-700/70 hover:text-white cursor-pointer'
                : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
            </svg>
          </button>

          {/* Zoom controls: [⊖ 64% ⊕] */}
          <div className="flex items-center h-8 px-1 rounded-lg border border-zinc-700/80 bg-[#222226] text-zinc-300">
            <button
              type="button"
              onClick={onZoomOut}
              title="Thu nhỏ (-)"
              className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-zinc-700/50 flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>

            <span
              onClick={onZoomReset}
              title="Nhấn để đặt lại 100%"
              className="text-xs font-mono font-medium text-white px-1.5 cursor-pointer hover:text-blue-400 select-none whitespace-nowrap"
            >
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              type="button"
              onClick={onZoomIn}
              title="Phóng to (+)"
              className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-zinc-700/50 flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
          </div>

          {/* Fit / Center view button (⊙) */}
          <button
            type="button"
            onClick={onFitView}
            title="Căn giữa sơ đồ (Fit view)"
            className="w-8 h-8 rounded-lg border border-zinc-700/80 bg-[#222226] text-zinc-300 hover:bg-zinc-700/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export { WorkflowLeftPalette as WorkflowToolbar };
