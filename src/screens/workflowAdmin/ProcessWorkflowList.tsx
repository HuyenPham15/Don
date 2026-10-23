// src/screens/workflowAdmin/ProcessWorkflowList.tsx
import React, { useState, useMemo } from 'react';
import { ProcessWorkflow, ProcessStatus } from '../../types/workflowConfig';
import { LOAI_DON_OPTIONS } from '../../constants';
import WorkflowVersionHistoryModal from './components/WorkflowVersionHistoryModal';
import CreateWorkflowModal from './components/CreateWorkflowModal';

interface ProcessWorkflowListProps {
  workflows: ProcessWorkflow[];
  onCreateNew: () => void;
  onCreateAndDesign?: (newWf: ProcessWorkflow) => void;
  onEditWorkflow: (wf: ProcessWorkflow, mode?: 'edit' | 'view') => void;
  onDuplicateWorkflow: (wf: ProcessWorkflow, openDesigner?: boolean) => void;
  onToggleStatus: (wfId: string, nextStatus: ProcessStatus) => void;
  onCreateNewVersion?: (wf: ProcessWorkflow) => void;
}

export default function ProcessWorkflowList({
  workflows,
  onCreateNew,
  onCreateAndDesign,
  onEditWorkflow,
  onDuplicateWorkflow,
  onToggleStatus,
  onCreateNewVersion,
}: ProcessWorkflowListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoaiDon, setSelectedLoaiDon] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');

  // Trạng thái mở menu 3 chấm cho từng hàng quy trình
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

  // Trạng thái dropdown "Tạo quy trình" và modal thêm mới / tạo từ mẫu
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSearchKeyword, setCloneSearchKeyword] = useState('');
  const [cloneFilterLoaiDon, setCloneFilterLoaiDon] = useState('all');

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

  // Danh sách quy trình nguồn có thể chọn để nhân bản tạo mới
  const cloneableWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      if (cloneFilterLoaiDon !== 'all' && w.loaiDonId !== cloneFilterLoaiDon) return false;
      if (cloneSearchKeyword.trim()) {
        const kw = cloneSearchKeyword.toLowerCase().trim();
        return w.name.toLowerCase().includes(kw) || w.code.toLowerCase().includes(kw);
      }
      return true;
    });
  }, [workflows, cloneSearchKeyword, cloneFilterLoaiDon]);

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
    <div className="bg-[#f4f7fb]">
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
            {/* Nút Tạo quy trình dạng dropdown */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setShowCreateDropdown((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Tạo quy trình</span>
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${showCreateDropdown ? 'rotate-180' : ''}`}>
                  arrow_drop_down
                </span>
              </button>

              {showCreateDropdown && (
                <>
                  {/* Backdrop đóng dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCreateDropdown(false)}
                  />

                  {/* Menu dropdown */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Chọn hình thức khởi tạo
                    </div>

                    {/* 1. Tạo mới */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateDropdown(false);
                        setShowCreateModal(true);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-blue-50/80 transition-colors cursor-pointer flex items-start gap-3 group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">note_add</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 group-hover:text-blue-700 text-xs transition-colors flex items-center justify-between">
                          <span>Tạo mới</span>
                          <span className="text-[9.5px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">Trống</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                          Thiết kế quy trình xử lý mới từ khung vẽ ban đầu
                        </p>
                      </div>
                    </button>

                    {/* 2. Tạo từ quy trình */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateDropdown(false);
                        setShowCloneModal(true);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-indigo-50/80 transition-colors cursor-pointer flex items-start gap-3 group text-left mt-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">copy_all</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 group-hover:text-indigo-700 text-xs transition-colors flex items-center justify-between">
                          <span>Tạo từ quy trình</span>
                          <span className="text-[9.5px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">{workflows.length} mẫu</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                          Chọn một quy trình có sẵn để nhân bản và chỉnh sửa
                        </p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
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
            {/* <div>
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
            </div> */}

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
            {/* <div>
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
            </div> */}
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
          <div className="overflow-x-auto min-h-[380px] pb-16">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200/90 text-[11.5px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[240px]">Tên quy trình</th>
                  <th className="py-3 px-4 min-w-[140px]">Mã quy trình</th>
                  <th className="py-3 px-4 min-w-[100px] text-center">Phiên bản</th>
                  <th className="py-3 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[170px]">Cập nhật lần cuối</th>
                  <th className="py-3 px-4 min-w-[130px] text-right sticky right-0 bg-slate-50/90 z-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-[42px] block text-slate-300 mb-2">
                        inbox
                      </span>
                      <p className="text-sm font-medium text-slate-600">Không tìm thấy quy trình nào</p>
                      <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc tạo quy trình xử lý mới</p>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Tạo quy trình ngay
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((wf, idx) => {
                    const isActionOpen = openActionDropdownId === wf.id;
                    const isNearBottom = idx > 0 && idx >= filteredWorkflows.length - 2;

                    return (
                      <tr
                        key={wf.id}
                        className={`hover:bg-blue-50/40 transition-colors group ${isActionOpen ? 'relative z-30' : ''
                          }`}
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

                            </button>


                          </div>
                        </td>

                        {/* Mã quy trình */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-100/80">
                            {wf.code}
                          </span>
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
                                  {wf.version}
                                </span>

                              </>
                            ) : (
                              <>
                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 group-hover/ver:bg-slate-200 transition-all">
                                  {wf.version}
                                </span>

                              </>
                            )}
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4">
                          {renderStatusBadge(wf.status)}
                        </td>

                        {/* Cập nhật lần cuối (Người & Ngày cập nhật) */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-medium text-[12.5px] leading-snug">
                              {wf.updatedBy}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px] text-slate-400">schedule</span>
                              {wf.updatedAt}
                            </span>
                          </div>
                        </td>

                        {/* Thao tác (Actions) */}
                        <td
                          className={`py-3.5 px-4 text-right sticky right-0 transition-colors ${isActionOpen
                            ? 'z-30 bg-white shadow-xs'
                            : 'z-10 bg-white group-hover:bg-[#f7faff]'
                            }`}
                        >
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Nút chính: Chỉnh sửa / Mở thiết kế */}
                            <button
                              type="button"
                              onClick={() => onEditWorkflow(wf, 'edit')}
                              className="px-2.5 py-1 text-xs font-semibold  text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title={wf.status === 'published' ? 'Mở thiết kế quy trình (chế độ bảo vệ phiên bản)' : 'Chỉnh sửa quy trình'}
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                              {/* <span>{wf.status === 'published' ? 'Thiết kế' : 'Sửa'}</span> */}
                            </button>

                            {/* Nút 3 chấm mở menu thao tác khác */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionDropdownId(isActionOpen ? null : wf.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${isActionOpen
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                  }`}
                                title="Tùy chọn khác"
                              >
                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                              </button>

                              {isActionOpen && (
                                <>
                                  {/* Overlay trong suốt để đóng dropdown khi click ngoài */}
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionDropdownId(null);
                                    }}
                                  />

                                  {/* Menu dropdown */}
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className={`absolute right-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                                      } w-64 bg-white rounded-xl shadow-2xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left`}
                                  >
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between gap-2">
                                      <span>Tùy chọn thao tác</span>
                                      <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-100 shrink-0">
                                        {wf.code}
                                      </span>
                                    </div>

                                    {/* 1. Xem sơ đồ */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionDropdownId(null);
                                        onEditWorkflow(wf, 'view');
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-slate-400">visibility</span>
                                      <span>Xem sơ đồ quy trình</span>
                                    </button>

                                    {/* 2. Chỉnh sửa */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionDropdownId(null);
                                        onEditWorkflow(wf, 'edit');
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-blue-600">edit</span>
                                      <span>{wf.status === 'published' ? 'Mở thiết kế (chế độ bảo vệ)' : 'Chỉnh sửa quy trình'}</span>
                                    </button>

                                    {/* 3. Sao chép */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionDropdownId(null);
                                        onDuplicateWorkflow(wf);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-emerald-600">content_copy</span>
                                      <span>Sao chép quy trình</span>
                                    </button>

                                    {/* 4. Tạo phiên bản mới */}
                                    {onCreateNewVersion && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenActionDropdownId(null);
                                          onCreateNewVersion(wf);
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px] text-indigo-600">fork_right</span>
                                        <span>Tạo phiên bản mới</span>
                                      </button>
                                    )}

                                    {/* 5. Xem lịch sử phiên bản */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionDropdownId(null);
                                        setHistoryModalWf(wf);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-purple-600">history</span>
                                        <span>Lịch sử phiên bản</span>
                                      </div>
                                      {wf.versionHistory && wf.versionHistory.length > 0 && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 font-mono font-bold">
                                          {wf.versionHistory.length}
                                        </span>
                                      )}
                                    </button>

                                    {/* Phân cách trạng thái */}
                                    <div className="my-1 border-t border-slate-100" />

                                    {wf.status === 'published' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenActionDropdownId(null);
                                          onToggleStatus(wf.id, 'archived');
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px] text-rose-500">pause_circle</span>
                                        <span>Ngừng áp dụng</span>
                                      </button>
                                    )}

                                    {wf.status === 'archived' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenActionDropdownId(null);
                                          onToggleStatus(wf.id, 'draft');
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px] text-emerald-500">restart_alt</span>
                                        <span>Khôi phục bản nháp</span>
                                      </button>
                                    )}

                                    {wf.status === 'draft' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenActionDropdownId(null);
                                          onToggleStatus(wf.id, 'published');
                                        }}
                                        className="w-full px-3 py-1.5 text-left text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                                        <span>Ban hành quy trình</span>
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

      {/* 5. MODAL TẠO TỪ QUY TRÌNH CÓ SẴN */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
                  <span className="material-symbols-outlined text-[20px]">copy_all</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tạo từ quy trình có sẵn</h3>
                  <p className="text-xs text-slate-500">
                    Chọn một quy trình làm khuôn mẫu để sao chép toàn bộ các bước và cấu hình
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloneModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Filter & Search */}
            <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[17px] text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={cloneSearchKeyword}
                  onChange={(e) => setCloneSearchKeyword(e.target.value)}
                  placeholder="Tìm theo tên hoặc mã quy trình..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>

              <select
                value={cloneFilterLoaiDon}
                onChange={(e) => setCloneFilterLoaiDon(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
              >
                <option value="all">Tất cả loại đơn / nghiệp vụ</option>
                {LOAI_DON_OPTIONS.map((ld) => (
                  <option key={ld.id} value={ld.id}>
                    {ld.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Workflow List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5 max-h-[50vh]">
              {cloneableWorkflows.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[36px] text-slate-300 block mb-1">
                    search_off
                  </span>
                  <p className="text-xs font-semibold text-slate-600">Không tìm thấy quy trình phù hợp</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Thử đổi từ khóa tìm kiếm hoặc bộ lọc loại đơn</p>
                </div>
              ) : (
                cloneableWorkflows.map((wf) => {
                  const loaiDonObj = LOAI_DON_OPTIONS.find((ld) => ld.id === wf.loaiDonId);
                  return (
                    <div
                      key={wf.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                            {wf.code}
                          </span>
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {wf.name}
                          </span>
                          {renderStatusBadge(wf.status)}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                          <span className="text-slate-600 font-medium">
                            {loaiDonObj ? loaiDonObj.name : 'Chung'}
                          </span>
                          <span>•</span>
                          <span>{wf.steps.length} bước</span>
                          <span>•</span>
                          <span>{wf.lanes.length} nhóm trách nhiệm</span>
                          <span>•</span>
                          <span>{wf.stages.length} giai đoạn</span>
                          <span>•</span>
                          <span className="font-mono text-[10.5px]">Phiên bản: {wf.version}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCloneModal(false);
                            onDuplicateWorkflow(wf, true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Tạo bản sao và mở màn hình thiết kế quy trình ngay"
                        >
                          <span className="material-symbols-outlined text-[15px]">design_services</span>
                          <span>Tạo & Thiết kế</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
              <span>
                Tìm thấy <strong>{cloneableWorkflows.length}</strong> / <strong>{workflows.length}</strong> quy trình
              </span>
              <button
                type="button"
                onClick={() => setShowCloneModal(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL THÊM MỚI QUY TRÌNH (POPUP THÊM MỚI) */}
      <CreateWorkflowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAndDesign={(newWf) => {
          if (onCreateAndDesign) {
            onCreateAndDesign(newWf);
          } else {
            onCreateNew();
          }
        }}
        existingWorkflowsCount={workflows.length}
      />
    </div>
  );
}
