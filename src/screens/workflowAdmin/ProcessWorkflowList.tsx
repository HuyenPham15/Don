// src/screens/workflowAdmin/ProcessWorkflowList.tsx
import React, { useState, useMemo } from 'react';
import { ProcessWorkflow, ProcessStatus } from '../../types/workflowConfig';
import { LOAI_DON_OPTIONS } from '../../constants';

interface ProcessWorkflowListProps {
  workflows: ProcessWorkflow[];
  onCreateNew: () => void;
  onEditWorkflow: (wf: ProcessWorkflow, mode?: 'edit' | 'view') => void;
  onDuplicateWorkflow: (wf: ProcessWorkflow) => void;
  onToggleStatus: (wfId: string, nextStatus: ProcessStatus) => void;
}

export default function ProcessWorkflowList({
  workflows,
  onCreateNew,
  onEditWorkflow,
  onDuplicateWorkflow,
  onToggleStatus,
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
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý, chuẩn hóa các luồng xử lý đơn thư theo từng loại đơn, phân quyền nhóm trách nhiệm và giai đoạn
            </p>
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

        {/* STATS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Tổng số quy trình</span>
              <span className="text-lg font-bold text-slate-800">{stats.total}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Đang hiệu lực</span>
              <span className="text-lg font-bold text-emerald-700">{stats.published}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Bản nháp thiết kế</span>
              <span className="text-lg font-bold text-amber-700">{stats.draft}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">edit_document</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Ngừng áp dụng</span>
              <span className="text-lg font-bold text-slate-600">{stats.archived}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
        </div>

        {/* 1.1 BANNER ÁNH XẠ: MỖI QUY TRÌNH GẮN VỚI 1 LOẠI ĐƠN & PHIÊN BẢN MỚI NHẤT */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Ánh xạ Loại đơn &amp; Phiên bản quy trình mới nhất
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 italic">
              * Khi một quy trình được cập nhật/phát hành, Loại đơn sẽ tự động gắn theo phiên bản mới nhất
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {loaiDonBindings.map((b) => (
              <div
                key={b.loaiDonId}
                onClick={() => {
                  if (b.activeWorkflow) {
                    onEditWorkflow(b.activeWorkflow, b.activeWorkflow.status === 'published' ? 'view' : 'edit');
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-white group ${
                  selectedLoaiDon === b.loaiDonId
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-xs'
                    : 'border-slate-200/90 hover:border-blue-400 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-slate-900 text-xs truncate group-hover:text-blue-700 transition-colors">
                    {b.loaiDonName}
                  </span>
                  {b.activeWorkflow?.status === 'published' ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      Đang hiệu lực
                    </span>
                  ) : b.activeWorkflow ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Bản nháp
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Chưa có</span>
                  )}
                </div>

                {b.activeWorkflow ? (
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700 line-clamp-1 group-hover:text-blue-900">
                      {b.activeWorkflow.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                      <span className="truncate max-w-[100px]">{b.activeWorkflow.code}</span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        ★ {b.activeWorkflow.version}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10.5px] text-slate-400 italic">Chưa cấu hình quy trình</p>
                )}
              </div>
            ))}
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
                          {wf.isLatestForLoaiDon && wf.status === 'published' && (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                              Đang gắn hiệu lực cho loại đơn
                            </span>
                          )}
                          {wf.isLatestForLoaiDon && wf.status === 'draft' && (
                            <span className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-[12px] text-amber-600">hourglass_top</span>
                              Bản nháp mới nhất của loại đơn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phiên bản */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          {wf.isLatestForLoaiDon ? (
                            <>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                                ★ {wf.version}
                              </span>
                              <span className="text-[9.5px] font-semibold text-emerald-600 mt-0.5">
                                Mới nhất
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {wf.version}
                              </span>
                              <span className="text-[9.5px] text-slate-400 mt-0.5">
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

                          {/* Xem lịch sử phiên bản */}
                          <button
                            type="button"
                            onClick={() => setHistoryModalWf(wf)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem lịch sử phiên bản"
                          >
                            <span className="material-symbols-outlined text-[17px]">history</span>
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

      {/* 4. MODAL LỊCH SỬ PHIÊN BẢN */}
      {historyModalWf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[22px]">history</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Lịch sử phiên bản quy trình</h3>
                  <span className="text-[11px] text-slate-500 font-mono">{historyModalWf.code} • {historyModalWf.name}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalWf(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="relative pl-6 border-l-2 border-blue-200 space-y-6">
                {historyModalWf.versionHistory && historyModalWf.versionHistory.length > 0 ? (
                  historyModalWf.versionHistory.map((v, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          v.isCurrentActive ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'
                        }`}
                      ></span>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            Phiên bản {v.version}
                            {v.isCurrentActive && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                                Đang áp dụng
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{v.publishedAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5">{v.notes || 'Không có ghi chú thay đổi'}</p>
                        <div className="mt-2 text-[10.5px] text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          Người thực hiện: <strong>{v.publishedBy}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Chưa có lịch sử phát hành cho quy trình này.</p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalWf(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
