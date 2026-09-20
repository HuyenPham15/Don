// src/screens/workflowAdmin/components/WorkflowEditHistoryTab.tsx
import React, { useState, useMemo } from 'react';
import { ProcessWorkflow, WorkflowAuditLogItem, WorkflowAuditActionType } from '../../../types/workflowConfig';

interface WorkflowEditHistoryTabProps {
  workflow: ProcessWorkflow;
  onViewSnapshot?: (logItem: WorkflowAuditLogItem) => void;
}

export default function WorkflowEditHistoryTab({
  workflow,
  onViewSnapshot,
}: WorkflowEditHistoryTabProps) {
  const auditLogs = workflow.auditLogs || [];

  // Bộ lọc
  const [searchKw, setSearchKw] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Selected Log Item for Side Panel Detail (Section 9)
  const [selectedLog, setSelectedLog] = useState<WorkflowAuditLogItem | null>(null);

  // Danh sách tác giả
  const authors = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.authorName)));
  }, [auditLogs]);

  // Lọc danh sách audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // 1. Từ khóa
      if (searchKw.trim()) {
        const kw = searchKw.toLowerCase();
        const matchTarget = log.targetName.toLowerCase().includes(kw);
        const matchNotes = log.notes?.toLowerCase().includes(kw);
        const matchAction = log.actionLabel.toLowerCase().includes(kw);
        if (!matchTarget && !matchNotes && !matchAction) return false;
      }

      // 2. Tác giả
      if (selectedAuthor !== 'all' && log.authorName !== selectedAuthor) {
        return false;
      }

      // 3. Loại thao tác
      if (selectedActionType !== 'all' && log.actionType !== selectedActionType) {
        return false;
      }

      return true;
    });
  }, [auditLogs, searchKw, selectedAuthor, selectedActionType]);

  const getActionBadge = (type: WorkflowAuditActionType) => {
    switch (type) {
      case 'create_step':
      case 'create_transition':
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[13px]">add_circle</span>
            Thêm mới
          </span>
        );
      case 'delete_step':
      case 'delete_transition':
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[13px]">delete</span>
            Xóa bỏ
          </span>
        );
      case 'move_step':
      case 'change_lane':
      case 'change_stage':
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[13px]">drag_indicator</span>
            Di chuyển vị trí
          </span>
        );
      case 'change_sla':
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[13px]">timer</span>
            Đổi SLA
          </span>
        );
      case 'edit_condition':
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[13px]">rule</span>
            Sửa điều kiện
          </span>
        );
      case 'publish':
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            Phát hành
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-[13px]">edit</span>
            Chỉnh sửa
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f4f7fb]">
      {/* MAIN HISTORY LOG LIST */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top filter toolbar */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/90 shadow-2xs space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700 text-lg">history</span>
                <span>Lịch sử chỉnh sửa quy trình (Phiên bản {workflow.version})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận đầy đủ audit log các thao tác nghiệp vụ, so sánh giá trị trước và sau của từng thành phần
              </p>
            </div>

            {/* View switcher: Timeline vs Table */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'timeline'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">timeline</span>
                  <span>Dòng thời gian</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">table_rows</span>
                  <span>Bảng chi tiết</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[17px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchKw}
                onChange={(e) => setSearchKw(e.target.value)}
                placeholder="Tìm bước, thành phần, ghi chú..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="all">Tất cả người thực hiện</option>
                {authors.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedActionType}
                onChange={(e) => setSelectedActionType(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="all">Tất cả loại thao tác</option>
                <option value="create_step">Tạo bước</option>
                <option value="edit_step">Sửa bước</option>
                <option value="delete_step">Xóa bước</option>
                <option value="move_step">Di chuyển bước</option>
                <option value="edit_condition">Sửa điều kiện</option>
                <option value="change_sla">Thay đổi SLA</option>
                <option value="change_form">Biểu mẫu</option>
                <option value="publish">Phát hành</option>
              </select>
            </div>

            <div className="text-right flex items-center justify-end text-xs text-slate-500">
              <span>Đang hiển thị <strong>{filteredLogs.length}</strong> / {auditLogs.length} bản ghi</span>
            </div>
          </div>
        </div>

        {/* Content area: Timeline or Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto shadow-2xs">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
              <h4 className="text-sm font-bold text-slate-700">Chưa có bản ghi lịch sử phù hợp</h4>
              <p className="text-xs text-slate-400 mt-1">
                Các thao tác chỉnh sửa bước, điều kiện, chuyển làn sẽ tự động được ghi nhận tại đây.
              </p>
            </div>
          ) : viewMode === 'timeline' ? (
            /* TIMELINE VIEW (SECTION 8) */
            <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200/80 space-y-6 max-w-4xl mx-auto">
              {filteredLogs.map((item, idx) => {
                const isSelected = selectedLog?.id === item.id;
                return (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline dot */}
                    <span
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 ring-4 ring-blue-100 scale-110'
                          : 'bg-purple-600 ring-2 ring-purple-100'
                      }`}
                    ></span>

                    {/* Card */}
                    <div
                      onClick={() => setSelectedLog(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white text-left ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                          : 'border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getActionBadge(item.actionType)}
                          <span className="font-extrabold text-slate-900 text-xs">
                            {item.actionLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.targetName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="font-mono text-[11px]">{item.timestamp}</span>
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                            {item.authorName}
                          </span>
                        </div>
                      </div>

                      {/* Before / After Diff Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Giá trị trước
                          </span>
                          <span className="text-slate-600 font-mono line-clamp-2">
                            {item.beforeValue || '(Chưa có / Khởi tạo mới)'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900">
                          <span className="text-[10.5px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                            Giá trị sau
                          </span>
                          <span className="font-mono font-semibold line-clamp-2">
                            {item.afterValue || '(Đã xóa / Không còn)'}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Notes & Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 italic text-[11.5px] line-clamp-1">
                          {item.notes ? `Ghi chú: ${item.notes}` : 'Không có ghi chú bổ sung'}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          {onViewSnapshot && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewSnapshot(item);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Xem lại sơ đồ quy trình tại thời điểm thao tác này"
                            >
                              <span className="material-symbols-outlined text-[13px]">preview</span>
                              <span>Xem snapshot</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedLog(item)}
                            className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                          >
                            Chi tiết thay đổi →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW (SECTION 8) */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Người thực hiện</th>
                    <th className="py-3 px-4">Loại thao tác</th>
                    <th className="py-3 px-4">Thành phần thay đổi</th>
                    <th className="py-3 px-4">Giá trị trước</th>
                    <th className="py-3 px-4">Giá trị sau</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11.5px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {log.authorName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(log.actionType)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-[180px] truncate">
                        {log.targetName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono max-w-[200px] truncate">
                        {log.beforeValue || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-800 font-mono max-w-[200px] truncate">
                        {log.afterValue || '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SIDE PANEL: CHI TIẾT MỘT LẦN THAY ĐỔI (SECTION 9) */}
      {selectedLog && (
        <aside className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-lg select-none z-20 animate-in slide-in-from-right duration-150">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">manage_search</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Chi tiết một lần thay đổi
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Action Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] uppercase font-bold">Loại thao tác</span>
                {getActionBadge(selectedLog.actionType)}
              </div>
              <h5 className="font-extrabold text-slate-900 text-sm">{selectedLog.actionLabel}</h5>
              <div className="text-slate-500 font-mono text-[11px] pt-1 border-t border-slate-200">
                Thời gian: <strong>{selectedLog.timestamp}</strong>
              </div>
            </div>

            {/* Author */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Người thực hiện
              </span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {selectedLog.authorName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{selectedLog.authorName}</div>
                  <div className="text-[10.5px] text-slate-400">{selectedLog.authorRole}</div>
                </div>
              </div>
            </div>

            {/* Target Component */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Thành phần bị thay đổi
              </span>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="font-extrabold text-slate-900 font-mono">{selectedLog.targetName}</div>
                <div className="text-[10.5px] text-slate-400">
                  Đối tượng: <span className="font-semibold text-slate-700 uppercase">{selectedLog.targetType}</span> • ID: <span className="font-mono">{selectedLog.targetId}</span>
                </div>
              </div>
            </div>

            {/* Before vs After comparison */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                So sánh trước và sau khi sửa
              </span>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Giá trị trước (Before)
                </span>
                <p className="text-slate-700 font-mono text-[11px] leading-relaxed break-words">
                  {selectedLog.beforeValue || '(Chưa có)'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Giá trị sau (After)
                </span>
                <p className="text-emerald-950 font-mono text-[11px] font-semibold leading-relaxed break-words">
                  {selectedLog.afterValue || '(Đã xóa)'}
                </p>
              </div>
            </div>

            {/* Notes */}
            {selectedLog.notes && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Ghi chú nghiệp vụ
                </span>
                <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 italic leading-relaxed">
                  {selectedLog.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer (Section 10) */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-col gap-2">
            {onViewSnapshot && (
              <button
                type="button"
                onClick={() => onViewSnapshot(selectedLog)}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Xem quy trình tại thời điểm này (Snapshot)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="w-full py-1.5 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng panel
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
