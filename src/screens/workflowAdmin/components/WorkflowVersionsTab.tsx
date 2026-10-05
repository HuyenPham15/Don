// src/screens/workflowAdmin/components/WorkflowVersionsTab.tsx
import React, { useState, useMemo } from 'react';
import {
  ProcessWorkflow,
  VersionHistoryItem,
  WorkflowAuditLogItem,
  WorkflowAuditActionType,
} from '../../../types/workflowConfig';
import WorkflowVersionCompareModal from './WorkflowVersionCompareModal';
import WorkflowVersionDetailModal from './WorkflowVersionDetailModal';

interface WorkflowVersionsTabProps {
  workflow: ProcessWorkflow;
  onCreateNewVersion: (baseWf: ProcessWorkflow, versionNote?: string) => void;
  onViewVersionDetail: (versionItem: VersionHistoryItem) => void;
  onViewSnapshot?: (logItem: WorkflowAuditLogItem) => void;
}

export default function WorkflowVersionsTab({
  workflow,
  onCreateNewVersion,
  onViewVersionDetail,
  onViewSnapshot,
}: WorkflowVersionsTabProps) {
  // Sub-view: 'versions' (Danh sách phiên bản) or 'audit' (Nhật ký thao tác)
  const [subTab, setSubTab] = useState<'versions' | 'audit'>('versions');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [newVersionReason, setNewVersionReason] = useState(
    'Nâng cấp và chuẩn hóa quy trình giải quyết theo văn bản chỉ đạo mới'
  );
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Selected Version for Detail Modal
  const [detailVersionItem, setDetailVersionItem] = useState<VersionHistoryItem | null>(null);

  // Filter for Version list
  const [versionFilter, setVersionFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Audit Logs State
  const auditLogs = workflow.auditLogs || [];
  const [searchKw, setSearchKw] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [auditViewMode, setAuditViewMode] = useState<'timeline' | 'table'>('timeline');
  const [selectedLog, setSelectedLog] = useState<WorkflowAuditLogItem | null>(null);

  const versionHistory: VersionHistoryItem[] =
    workflow.versionHistory && workflow.versionHistory.length > 0
      ? workflow.versionHistory
      : [
        {
          version: workflow.version,
          publishedAt: workflow.effectiveDate || workflow.updatedAt,
          publishedBy: workflow.updatedBy,
          notes: workflow.description || 'Phiên bản ban hành ban đầu.',
          isCurrentActive: workflow.status === 'published',
          canCuPhapLy: 'Quy định quản lý hồ sơ tiếp nhận giải quyết đơn thư',
          totalSteps: workflow.steps.length,
          slaDays: 25,
          lanesCount: workflow.lanes.length,
          formsCount: 3,
          changes: [
            {
              type: 'add',
              title: 'Khởi tạo cấu trúc quy trình số hóa',
              description: 'Ban hành sơ đồ luồng quy trình nghiệp vụ điện tử đầu tiên trên hệ thống GOVEX.',
              target: 'Toàn bộ quy trình',
            },
          ],
        },
      ];

  // Filtered versions
  const filteredVersions = useMemo(() => {
    return versionHistory.filter((v) => {
      if (versionFilter === 'active') return v.isCurrentActive;
      if (versionFilter === 'archived') return !v.isCurrentActive;
      return true;
    });
  }, [versionHistory, versionFilter]);

  // Suggested next version
  const nextSuggestedVersion = (() => {
    const currentVerStr = workflow.version || 'v1.0';
    const numPart = parseFloat(currentVerStr.replace('v', ''));
    if (!isNaN(numPart)) {
      return `v${(numPart + 0.1).toFixed(1)}`;
    }
    return 'v2.0';
  })();

  const handleConfirmCreateNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateNewVersion(workflow, `${newVersionReason}. ${newVersionNotes}`);
    setIsCreateModalOpen(false);
  };

  // Authors for audit logs
  const authors = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.authorName)));
  }, [auditLogs]);

  // Filtered Audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (searchKw.trim()) {
        const kw = searchKw.toLowerCase();
        const matchTarget = log.targetName.toLowerCase().includes(kw);
        const matchNotes = log.notes?.toLowerCase().includes(kw);
        const matchAction = log.actionLabel.toLowerCase().includes(kw);
        if (!matchTarget && !matchNotes && !matchAction) return false;
      }
      if (selectedAuthor !== 'all' && log.authorName !== selectedAuthor) return false;
      if (selectedActionType !== 'all' && log.actionType !== selectedActionType) return false;
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* 1. TOP HEADER & ACTIONS BAR */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200/90 shadow-2xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[24px]">layers</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Lịch sử & Quản lý phiên bản quy trình
                </h3>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {workflow.code}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Tạo phiên bản mới</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs Segmented Switcher & Quick Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setSubTab('versions')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${subTab === 'versions'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">layers</span>
              <span>Danh sách phiên bản</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${subTab === 'versions' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
                }`}>
                {versionHistory.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${subTab === 'audit'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Nhật ký thao tác</span>
              {auditLogs.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${subTab === 'audit' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {auditLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUBTAB: DANH SÁCH PHIÊN BẢN (VERSIONS) */}
      {subTab === 'versions' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          <div className=" mx-auto space-y-3.5">
            {filteredVersions.map((v, idx) => {
              const isCurrentActive = v.isCurrentActive;
              const runningCount = isCurrentActive
                ? workflow.activeDonsCount || 68
                : idx === 1
                  ? 24
                  : 0;
              const stepsCount = v.totalSteps || (v.snapshotWorkflow?.steps ? v.snapshotWorkflow.steps.length : workflow.steps.length);
              const slaDays = v.slaDays || 28;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${isCurrentActive
                    ? 'border-emerald-300 ring-2 ring-emerald-100'
                    : 'border-slate-200/90 hover:border-purple-300'
                    }`}
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/60 to-white">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-extrabold px-3 py-1 rounded-xl font-mono ${isCurrentActive
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                      >
                        {isCurrentActive ? `★ ${v.version}` : v.version}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {isCurrentActive ? 'Phiên bản đang áp dụng chính thức' : 'Phiên bản lưu trữ lịch sử'}
                          </span>
                          {isCurrentActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Đang hiệu lực
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Đã lưu trữ
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11.5px] text-slate-500 mt-0.5">
                          <span>Ban hành: <strong className="text-slate-700 font-mono">{v.publishedAt}</strong></span>
                          <span>•</span>
                          <span>Người phát hành: <strong className="text-slate-700">{v.publishedBy}</strong> ({v.role || 'Cán bộ'})</span>
                        </div>
                      </div>
                    </div>

                    {/* Running Dossiers Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 ${runningCount > 0
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs'
                          : 'bg-slate-50 text-slate-400 border border-slate-200'
                          }`}
                        title="Số lượng hồ sơ đang vận hành theo phiên bản này"
                      >
                        <span className="material-symbols-outlined text-[15px]">folder_open</span>
                        <span>{runningCount} hồ sơ đang chạy</span>
                      </span>
                    </div>
                  </div>


                  {/* Card Action Footer */}
                  <div className="px-4 sm:px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11.5px]">
                      Mã phiên bản: <strong className="font-mono text-slate-600">{v.version}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailVersionItem(v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer"
                        title="Xem đầy đủ cấu trúc bước, căn cứ pháp lý và ghi chú của phiên bản này"
                      >
                        <span className="material-symbols-outlined text-[15px] text-purple-600">info</span>
                        <span>Xem chi tiết</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewVersionDetail(v)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                        title="Mở sơ đồ quy trình của phiên bản này trên Canvas"
                      >
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        <span>Xem trên sơ đồ</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SUBTAB: NHẬT KÝ THAO TÁC (AUDIT LOGS) */}
      {subTab === 'audit' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Main Logs List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter toolbar */}
            <div className="p-4 bg-white border-b border-slate-200/90 shadow-2xs space-y-2 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-2xl">
                  {/* Search */}
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

                  {/* Author */}
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

                  {/* Action Type */}
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
                      <option value="publish">Phát hành</option>
                    </select>
                  </div>
                </div>

                {/* View switcher */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setAuditViewMode('timeline')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${auditViewMode === 'timeline'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">timeline</span>
                      <span>Dòng thời gian</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${auditViewMode === 'table'
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
            </div>

            {/* Audit Content List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto shadow-2xs">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
                  <h4 className="text-sm font-bold text-slate-700">Chưa có bản ghi lịch sử phù hợp</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Các thao tác chỉnh sửa bước, điều kiện, chuyển làn sẽ tự động được ghi nhận tại đây.
                  </p>
                </div>
              ) : auditViewMode === 'timeline' ? (
                <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200/80 space-y-4 max-w-4xl mx-auto">
                  {filteredLogs.map((item, idx) => {
                    const isSelected = selectedLog?.id === item.id;
                    return (
                      <div key={item.id || idx} className="relative group">
                        <span
                          className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-all ${isSelected
                            ? 'bg-blue-600 ring-4 ring-blue-100 scale-110'
                            : 'bg-purple-600 ring-2 ring-purple-100'
                            }`}
                        ></span>

                        <div
                          onClick={() => setSelectedLog(item)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white text-left ${isSelected
                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                            : 'border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {getActionBadge(item.actionType)}
                              <span className="text-xs font-bold text-slate-900">{item.actionLabel}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
                          </div>

                          <div className="mt-2 text-xs font-semibold text-slate-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">
                              arrow_right
                            </span>
                            <span>Đối tượng:</span>
                            <span className="text-blue-700 font-bold">{item.targetName}</span>
                          </div>

                          {item.notes && (
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2 pl-4 border-l border-slate-200">
                              {item.notes}
                            </p>
                          )}

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              Thực hiện: <strong className="text-slate-700">{item.authorName}</strong> ({item.authorRole})
                            </span>
                            {onViewSnapshot && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewSnapshot(item);
                                }}
                                className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                <span>Xem snapshot</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden max-w-5xl mx-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Thời gian</th>
                        <th className="py-3 px-4">Thao tác</th>
                        <th className="py-3 px-4">Đối tượng</th>
                        <th className="py-3 px-4">Người thực hiện</th>
                        <th className="py-3 px-4">Ghi chú</th>
                        <th className="py-3 px-4 text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map((item, idx) => (
                        <tr
                          key={item.id || idx}
                          onClick={() => setSelectedLog(item)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                            {item.timestamp}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(item.actionType)}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{item.targetName}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800">{item.authorName}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{item.notes || '-'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(item);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Xem &rarr;
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

          {/* Side Drawer for Selected Audit Item */}
          {selectedLog && (
            <div className="w-80 border-l border-slate-200 bg-white p-5 flex flex-col space-y-4 shrink-0 shadow-lg animate-in slide-in-from-right-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Chi tiết thay đổi</h4>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">{selectedLog.timestamp}</span>
                <div className="text-sm font-bold text-slate-900">{selectedLog.actionLabel}</div>
                <div className="text-xs font-semibold text-blue-700">{selectedLog.targetName}</div>
              </div>

              {/* Before and After Values */}
              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                  <div className="font-bold text-rose-800 mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">remove_circle</span>
                    <span>Trước thay đổi:</span>
                  </div>
                  <div className="font-mono text-[11px] text-rose-900 break-all">
                    {selectedLog.beforeValue || 'Chưa thiết lập'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    <span>Sau thay đổi:</span>
                  </div>
                  <div className="font-mono text-[11px] text-emerald-900 break-all">
                    {selectedLog.afterValue || 'Không có giá trị'}
                  </div>
                </div>
              </div>

              {selectedLog.notes && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="block text-slate-800 mb-0.5">Ghi chú nghiệp vụ:</strong>
                  {selectedLog.notes}
                </div>
              )}

              {onViewSnapshot && (
                <button
                  type="button"
                  onClick={() => onViewSnapshot(selectedLog)}
                  className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Xem snapshot thời điểm này</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. MODALS */}
      {/* Modal tạo phiên bản mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700 text-[22px]">add_circle</span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Tạo phiên bản mới từ {workflow.version}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmCreateNewVersion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã phiên bản mới dự kiến:
                </label>
                <input
                  type="text"
                  readOnly
                  value={nextSuggestedVersion}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-purple-700 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý do tạo phiên bản mới: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newVersionReason}
                  onChange={(e) => setNewVersionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="Thay đổi căn cứ pháp lý / Luật / Nghị định mới">
                    Thay đổi căn cứ pháp lý / Luật / Nghị định mới
                  </option>
                  <option value="Nâng cấp và chuẩn hóa quy trình giải quyết theo văn bản chỉ đạo mới">
                    Nâng cấp và chuẩn hóa quy trình giải quyết theo văn bản chỉ đạo mới
                  </option>
                  <option value="Tối ưu rút ngắn thời gian giải quyết (SLA)">
                    Tối ưu rút ngắn thời gian giải quyết (SLA)
                  </option>
                  <option value="Bổ sung / điều chỉnh các bước xác minh, đối thoại nghiệp vụ">
                    Bổ sung / điều chỉnh các bước xác minh, đối thoại nghiệp vụ
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú chi tiết phiên bản mới:
                </label>
                <textarea
                  rows={3}
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  placeholder="Mô tả các nội dung thay đổi chính trong phiên bản mới..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 placeholder:text-slate-400"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">done</span>
                  <span>Tạo bản nháp {nextSuggestedVersion}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal So sánh phiên bản */}
      {isCompareModalOpen && (
        <WorkflowVersionCompareModal
          workflow={workflow}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}

      {/* Modal Chi tiết phiên bản (Xem chi tiết) */}
      {detailVersionItem && (
        <WorkflowVersionDetailModal
          workflow={workflow}
          versionItem={detailVersionItem}
          isOpen={Boolean(detailVersionItem)}
          onClose={() => setDetailVersionItem(null)}
          onViewOnCanvas={(v) => {
            setDetailVersionItem(null);
            onViewVersionDetail(v);
          }}
          onCompareWithCurrent={() => {
            setDetailVersionItem(null);
            setIsCompareModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
