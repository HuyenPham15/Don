// src/screens/workflowAdmin/components/WorkflowVersionDetailModal.tsx
import React, { useState } from 'react';
import {
  ProcessWorkflow,
  VersionHistoryItem,
  ProcessStep,
} from '../../../types/workflowConfig';

interface WorkflowVersionDetailModalProps {
  workflow: ProcessWorkflow;
  versionItem: VersionHistoryItem;
  isOpen: boolean;
  onClose: () => void;
  onViewOnCanvas: (versionItem: VersionHistoryItem) => void;
  onCompareWithCurrent?: (versionItem: VersionHistoryItem) => void;
}

export default function WorkflowVersionDetailModal({
  workflow,
  versionItem,
  isOpen,
  onClose,
  onViewOnCanvas,
  onCompareWithCurrent,
}: WorkflowVersionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'changes' | 'legal'>('steps');

  if (!isOpen) return null;

  // Resolve steps for this version
  const steps: ProcessStep[] = (() => {
    if (versionItem.snapshotWorkflow?.steps && versionItem.snapshotWorkflow.steps.length > 0) {
      return versionItem.snapshotWorkflow.steps;
    }
    if (versionItem.isCurrentActive) {
      return workflow.steps;
    }
    // Fallback: take first N steps or filter by totalSteps
    const count = versionItem.totalSteps || workflow.steps.length;
    return workflow.steps.slice(0, count);
  })();

  const isCurrentActive = versionItem.isCurrentActive;
  const runningCount = isCurrentActive
    ? workflow.activeDonsCount || 68
    : versionItem.version === 'v2.0'
    ? 24
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-purple-50/20 to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">layers</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Chi tiết Phiên bản quy trình
                </h3>
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {versionItem.version}
                </span>
                {isCurrentActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đang hiệu lực
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Bản lưu trữ
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {workflow.name} ({workflow.code}) • Loại đơn: <strong className="text-slate-700">{workflow.loaiDonName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewOnCanvas(versionItem);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Xem trên sơ đồ Canvas</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Số bước xử lý</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {versionItem.totalSteps || steps.length} <span className="text-xs font-semibold text-slate-400">bước</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Tổng SLA thời hạn</div>
            <div className="text-lg font-black text-blue-700 mt-0.5">
              {versionItem.slaDays || 28} <span className="text-xs font-semibold text-blue-500">ngày làm việc</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Người ban hành</div>
            <div className="text-xs font-bold text-slate-800 truncate mt-1">
              {versionItem.publishedBy}
            </div>
            <div className="text-[10.5px] text-slate-400 truncate">{versionItem.role || 'Cán bộ quản trị'}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Hồ sơ đang áp dụng</div>
            <div className="text-lg font-black text-purple-700 mt-0.5">
              {runningCount} <span className="text-xs font-semibold text-purple-400">hồ sơ</span>
            </div>
          </div>
        </div>

        {/* Sub-tabs inside Detail Modal */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-1 bg-white shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'steps'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
            <span>Cấu trúc bước xử lý ({steps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('changes')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'changes'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">change_circle</span>
            <span>Ghi chú & Thay đổi ({versionItem.changes?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'legal'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">gavel</span>
            <span>Căn cứ pháp lý & Thông tin ban hành</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Danh sách {steps.length} bước thuộc cấu hình phiên bản <strong>{versionItem.version}</strong>
                </span>
                <span className="italic text-[11px] text-slate-400">
                  Hiệu lực từ ngày: {versionItem.publishedAt}
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">STT</th>
                      <th className="py-3 px-4 w-32">Mã bước</th>
                      <th className="py-3 px-4">Tên bước xử lý</th>
                      <th className="py-3 px-4">Làn xử lý / Vai trò</th>
                      <th className="py-3 px-4 text-center">Thời hạn (SLA)</th>
                      <th className="py-3 px-4">Biểu mẫu đính kèm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {steps.map((st, idx) => {
                      const lane = workflow.lanes.find((l) => l.id === st.laneId)?.name || st.laneId;
                      return (
                        <tr key={st.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                              {st.code}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {st.isStart && (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                  Bắt đầu
                                </span>
                              )}
                              {st.isEnd && (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-200 text-slate-800">
                                  Kết thúc
                                </span>
                              )}
                              <span>{st.name}</span>
                            </div>
                            {st.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{st.description}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                              <span className="material-symbols-outlined text-[13px]">person</span>
                              {lane}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                            {st.timeLimitDays} ngày
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {st.stepForms && st.stepForms.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {st.stepForms.map((f, fi) => (
                                  <span
                                    key={fi}
                                    className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px] font-mono"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Không có</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950">
                <div className="font-bold flex items-center gap-1.5 text-purple-900 mb-1">
                  <span className="material-symbols-outlined text-[17px]">notes</span>
                  <span>Ghi chú phát hành phiên bản:</span>
                </div>
                <p className="leading-relaxed text-slate-700">{versionItem.notes}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Các thay đổi cụ thể đã áp dụng:
                </h4>

                {versionItem.changes && versionItem.changes.length > 0 ? (
                  <div className="space-y-2.5">
                    {versionItem.changes.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                              ch.type === 'add'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : ch.type === 'modify'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {ch.type === 'add' ? '+ Thêm mới' : ch.type === 'modify' ? '✎ Điều chỉnh' : '✕ Bãi bỏ'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{ch.title}</span>
                          {ch.target && (
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              {ch.target}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 pl-1">{ch.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                    Phiên bản ban hành cơ sở, không có ghi chú thay đổi thêm.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">gavel</span>
                  <span>Căn cứ pháp lý ban hành:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-6">
                  {versionItem.canCuPhapLy || 'Căn cứ Luật Tiếp công dân, Luật Khiếu nại, Luật Tố cáo và các văn bản hướng dẫn thi hành hiện hành.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-900">Thông tin hành chính phiên bản:</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã quy trình:</span>
                    <span className="font-mono font-bold text-slate-800">{workflow.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã phiên bản:</span>
                    <span className="font-mono font-bold text-purple-700">{versionItem.version}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày phát hành có hiệu lực:</span>
                    <span className="font-bold text-slate-800">{versionItem.publishedAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Người ký phát hành:</span>
                    <span className="font-bold text-slate-800">{versionItem.publishedBy} ({versionItem.role || 'Cán bộ'})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {isCurrentActive ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Phiên bản đang được áp dụng mặc định cho hồ sơ mới
              </span>
            ) : (
              <span className="text-slate-500">
                Phiên bản lịch sử lưu trữ (chỉ áp dụng cho hồ sơ đã thụ lý trước ngày phát hành bản mới)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCompareWithCurrent && !isCurrentActive && (
              <button
                type="button"
                onClick={() => onCompareWithCurrent(versionItem)}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                So sánh với bản hiện tại
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewOnCanvas(versionItem);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Xem trên sơ đồ Canvas &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
