// src/screens/workflowAdmin/ProcessWorkflowList.tsx
import React, { useState, useMemo } from 'react';
import { ProcessWorkflow, ProcessStatus } from '../../types/workflowConfig';
import { LOAI_DON_OPTIONS } from '../../constants';
import WorkflowVersionHistoryModal from './components/WorkflowVersionHistoryModal';

interface ProcessWorkflowListProps {
  workflows: ProcessWorkflow[];
  onCreateNew: () => void;
  onEditWorkflow: (wf: ProcessWorkflow, mode?: 'edit' | 'view') => void;
  onDuplicateWorkflow: (wf: ProcessWorkflow) => void;
  onToggleStatus: (wfId: string, nextStatus: ProcessStatus) => void;
  onCreateNewVersion?: (wf: ProcessWorkflow) => void;
}

export default function ProcessWorkflowList({
  workflows,
  onCreateNew,
  onEditWorkflow,
  onDuplicateWorkflow,
  onToggleStatus,
  onCreateNewVersion,
}: ProcessWorkflowListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoaiDon, setSelectedLoaiDon] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');

  // Modal lịch sử phiên bản
  const [historyModalWf, setHistoryModalWf] = useState<ProcessWorkflow | null>(null);

  // Thống kê nhanh
  const stats = useMemo(() => {
    return {
      total: workflows.length,
      published: workflows.filter((w) => w.status === 'published').length,
      draft: workflows.filter((w) => w.status === 'draft').length,
      archived: workflows.filter((w) => w.status === 'archived').length,
    };
  }, [workflows]);

  // Bộ lọc
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      // 1. Tên / Mã quy trình
      if (searchTerm.trim()) {
        const kw = searchTerm.toLowerCase().trim();
        const matchName = w.name.toLowerCase().includes(kw);
        const matchCode = w.code.toLowerCase().includes(kw);
        if (!matchName && !matchCode) return false;
      }

      // 2. Loại đơn
      if (selectedLoaiDon !== 'all' && w.loaiDonId !== selectedLoaiDon) {
        return false;
      }

      // 3. Trạng thái
      if (selectedStatus !== 'all' && w.status !== selectedStatus) {
        return false;
      }

      // 4. Phiên bản
      if (selectedVersion !== 'all' && !w.version.toLowerCase().includes(selectedVersion.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [workflows, searchTerm, selectedLoaiDon, selectedStatus, selectedVersion]);

  // Danh sách phiên bản duy nhất cho dropdown
  const uniqueVersions = useMemo(() => {
    return Array.from(new Set(workflows.map((w) => w.version)));
  }, [workflows]);

  // Danh sách liên kết Loại đơn & Quy trình phiên bản mới nhất
  const loaiDonBindings = useMemo(() => {
    return LOAI_DON_OPTIONS.map((ld) => {
      // Tìm quy trình mới nhất đang gắn với loại đơn này
      const activeWf =
        workflows.find((w) => w.loaiDonId === ld.id && w.status === 'published' && w.isLatestForLoaiDon) ||
        workflows.find((w) => w.loaiDonId === ld.id && w.status === 'published') ||
        workflows.find((w) => w.loaiDonId === ld.id && w.isLatestForLoaiDon) ||
        workflows.find((w) => w.loaiDonId === ld.id);

      const totalCount = workflows.filter((w) => w.loaiDonId === ld.id).length;

      return {
        loaiDonId: ld.id,
        loaiDonName: ld.name,
        activeWorkflow: activeWf,
        totalCount,
      };
    });
  }, [workflows]);

  const renderStatusBadge = (status: ProcessStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Đã phát hành
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Bản nháp
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Ngừng áp dụng
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7fb] overflow-y-auto">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span className="hover:text-slate-800 transition-colors cursor-pointer">Quản trị nghiệp vụ</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-blue-700 font-semibold">Quy trình xử lý</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="material-symbols-outlined text-blue-600 text-[26px]">account_tree</span>
              Danh mục Quy trình xử lý
            </h1>

          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Tạo quy trình</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. FILTER & CONTROLS */}
      <div className="p-6 pb-2">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[17px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên quy trình, mã quy trình..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Loại đơn dropdown */}
            <div>
              <select
                value={selectedLoaiDon}
                onChange={(e) => setSelectedLoaiDon(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">Tất cả Loại đơn áp dụng</option>
                {LOAI_DON_OPTIONS.map((ld) => (
                  <option key={ld.id} value={ld.id}>
                    {ld.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Trạng thái dropdown */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">Tất cả Trạng thái</option>
                <option value="published">Đã phát hành</option>
                <option value="draft">Bản nháp</option>
                <option value="archived">Ngừng áp dụng</option>
              </select>
            </div>

            {/* Phiên bản dropdown */}
            <div>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">Tất cả Phiên bản</option>
                {uniqueVersions.map((ver) => (
                  <option key={ver} value={ver}>
                    Phiên bản {ver}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters notice & reset */}
          {(searchTerm || selectedLoaiDon !== 'all' || selectedStatus !== 'all' || selectedVersion !== 'all') && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Tìm thấy <strong>{filteredWorkflows.length}</strong> quy trình phù hợp
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLoaiDon('all');
                  setSelectedStatus('all');
                  setSelectedVersion('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. WORKFLOW TABLE */}
      <div className="p-6 pt-2 flex-1">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200/90 text-[11.5px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[240px]">Tên quy trình</th>
                  <th className="py-3 px-4 min-w-[140px]">Mã quy trình</th>
                  <th className="py-3 px-4 min-w-[160px]">Loại đơn áp dụng</th>
                  <th className="py-3 px-4 min-w-[100px] text-center">Phiên bản</th>
                  <th className="py-3 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[140px]">Ngày cập nhật</th>
                  <th className="py-3 px-4 min-w-[160px]">Người cập nhật</th>
                  <th className="py-3 px-4 min-w-[180px] text-right sticky right-0 bg-slate-50/90">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-[42px] block text-slate-300 mb-2">
                        inbox
                      </span>
                      <p className="text-sm font-medium text-slate-600">Không tìm thấy quy trình nào</p>
                      <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc tạo quy trình xử lý mới</p>
                      <button
                        type="button"
                        onClick={onCreateNew}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Tạo quy trình ngay
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((wf, idx) => (
                    <tr
                      key={wf.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      {/* Tên quy trình */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => onEditWorkflow(wf, wf.status === 'published' ? 'view' : 'edit')}
                            className="text-left font-bold text-slate-900 hover:text-blue-700 transition-colors text-[13px] leading-snug cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{wf.name}</span>
                            {wf.status === 'draft' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-normal">
                                Đang sửa
                              </span>
                            )}
                          </button>
                          {wf.description && (
                            <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {wf.description}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[10.5px] text-slate-400">
                            <span>{wf.steps.length} bước</span>
                            <span>•</span>
                            <span>{wf.lanes.length} nhóm trách nhiệm</span>
                            <span>•</span>
                            <span>{wf.stages.length} giai đoạn</span>
                          </div>
                        </div>
                      </td>

                      {/* Mã quy trình */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-100/80">
                          {wf.code}
                        </span>
                      </td>

                      {/* Loại đơn áp dụng */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-slate-800 font-bold">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">label</span>
                            {wf.loaiDonName}
                          </span>


                        </div>
                      </td>

                      {/* Phiên bản */}
                      <td className="py-3.5 px-4 text-center">
                        <div
                          onClick={() => setHistoryModalWf(wf)}
                          className="inline-flex flex-col items-center group/ver cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-all"
                          title="Nhấn để xem chi tiết lịch sử cập nhật phiên bản"
                        >
                          {wf.isLatestForLoaiDon ? (
                            <>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs group-hover/ver:border-emerald-400 group-hover/ver:bg-emerald-100 transition-all flex items-center gap-1">
                                ★ {wf.version}
                              </span>
                              <span className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-0.5 group-hover/ver:underline">
                                <span className="material-symbols-outlined text-[13px]">history</span>
                                {wf.versionHistory?.length ? `${wf.versionHistory.length} bản` : 'Lịch sử'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 group-hover/ver:bg-slate-200 transition-all">
                                {wf.version}
                              </span>
                              <span className="text-[9.5px] text-slate-400 mt-0.5 flex items-center gap-0.5 group-hover/ver:text-blue-600">
                                <span className="material-symbols-outlined text-[12px]">history</span>
                                Bản cũ
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(wf.status)}
                      </td>

                      {/* Ngày cập nhật */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11.5px]">
                        {wf.updatedAt}
                      </td>

                      {/* Người cập nhật */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium">{wf.updatedBy}</span>
                      </td>

                      {/* Thao tác (Actions) */}
                      <td className="py-3.5 px-4 text-right sticky right-0 bg-white group-hover:bg-[#f7faff] transition-colors">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Xem */}
                          <button
                            type="button"
                            onClick={() => onEditWorkflow(wf, 'view')}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem sơ đồ quy trình"
                          >
                            <span className="material-symbols-outlined text-[17px]">visibility</span>
                          </button>

                          {/* Chỉnh sửa */}
                          <button
                            type="button"
                            onClick={() => onEditWorkflow(wf, 'edit')}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title={wf.status === 'published' ? 'Mở thiết kế quy trình (chế độ bảo vệ phiên bản)' : 'Chỉnh sửa quy trình'}
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>

                          {/* Sao chép */}
                          <button
                            type="button"
                            onClick={() => onDuplicateWorkflow(wf)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Sao chép tạo quy trình mới"
                          >
                            <span className="material-symbols-outlined text-[17px]">content_copy</span>
                          </button>

                          {/* Tạo phiên bản mới */}
                          {onCreateNewVersion && (
                            <button
                              type="button"
                              onClick={() => onCreateNewVersion(wf)}
                              className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Tạo phiên bản mới từ quy trình này"
                            >
                              <span className="material-symbols-outlined text-[17px]">fork_right</span>
                            </button>
                          )}

                          {/* Xem lịch sử phiên bản */}
                          <button
                            type="button"
                            onClick={() => setHistoryModalWf(wf)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer relative"
                            title="Xem chi tiết lịch sử cập nhật phiên bản quy trình"
                          >
                            <span className="material-symbols-outlined text-[17px]">history</span>
                            {wf.versionHistory && wf.versionHistory.length > 1 && (
                              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-purple-600 text-white font-mono text-[8.5px] font-bold flex items-center justify-center">
                                {wf.versionHistory.length}
                              </span>
                            )}
                          </button>

                          {/* Ngừng áp dụng / Kích hoạt lại */}
                          {wf.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => onToggleStatus(wf.id, 'archived')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Ngừng áp dụng quy trình này"
                            >
                              <span className="material-symbols-outlined text-[17px]">pause_circle</span>
                            </button>
                          )}

                          {wf.status === 'archived' && (
                            <button
                              type="button"
                              onClick={() => onToggleStatus(wf.id, 'draft')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Khôi phục thành bản nháp"
                            >
                              <span className="material-symbols-outlined text-[17px]">restart_alt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination info */}
          <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <strong>{filteredWorkflows.length}</strong> / <strong>{workflows.length}</strong> quy trình xử lý
            </span>
            <span className="text-[11px] text-slate-400">Hệ thống GOVEX Workflow Engine v2.6</span>
          </div>
        </div>
      </div>

      {/* 4. MODAL LỊCH SỬ PHIÊN BẢN (NÂNG CẤP) */}
      {historyModalWf && (
        <WorkflowVersionHistoryModal
          workflow={historyModalWf}
          onClose={() => setHistoryModalWf(null)}
          onViewVersion={(wf) => {
            setHistoryModalWf(null);
            onEditWorkflow(wf, 'view');
          }}
          onForkDraft={(wf) => {
            setHistoryModalWf(null);
            onDuplicateWorkflow(wf);
          }}
        />
      )}
    </div>
  );
}
