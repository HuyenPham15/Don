// src/screens/workflowAdmin/components/WorkflowVersionHistoryModal.tsx
import React, { useState } from 'react';
import { ProcessWorkflow, VersionHistoryItem } from '../../../types/workflowConfig';

interface WorkflowVersionHistoryModalProps {
  workflow: ProcessWorkflow | null;
  onClose: () => void;
  onViewVersion?: (wf: ProcessWorkflow, version: string) => void;
  onForkDraft?: (wf: ProcessWorkflow, version: string) => void;
}

export default function WorkflowVersionHistoryModal({
  workflow,
  onClose,
  onViewVersion,
  onForkDraft,
}: WorkflowVersionHistoryModalProps) {
  if (!workflow) return null;

  const versionList: VersionHistoryItem[] = workflow.versionHistory && workflow.versionHistory.length > 0
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

  const [selectedVersionIdx, setSelectedVersionIdx] = useState<number>(0);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'archived'>('all');
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const selectedItem = versionList[selectedVersionIdx] || versionList[0];

  const filteredVersions = versionList.filter((v) => {
    if (filterType === 'active') return v.isCurrentActive;
    if (filterType === 'archived') return !v.isCurrentActive;
    return true;
  });

  const handleCopyVersionSummary = () => {
    if (!selectedItem) return;
    const text = `Quy trình: ${workflow.name} (${workflow.code})\nPhiên bản: ${selectedItem.version} - ${selectedItem.isCurrentActive ? 'Đang hiệu lực' : 'Bản lưu trữ'}\nNgày ban hành: ${selectedItem.publishedAt}\nNgười ban hành: ${selectedItem.publishedBy}\nCăn cứ pháp lý: ${selectedItem.canCuPhapLy || 'Quy chuẩn GOVEX'}\nGhi chú thay đổi: ${selectedItem.notes}`;
    navigator.clipboard?.writeText(text);
    setCopiedToast('Đã sao chép thông tin phiên bản vào bộ nhớ tạm!');
    setTimeout(() => setCopiedToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* 1. ADMINISTRATIVE HEADER */}
        <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">history_edu</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Lịch sử cập nhật phiên bản quy trình
                </h3>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {workflow.code}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11.5px] text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-800">{workflow.name}</span>
                <span>•</span>
                <span>Loại đơn: <strong className="text-slate-700">{workflow.loaiDonName}</strong></span>
                <span>•</span>
                <span className="text-purple-700 font-semibold">{versionList.length} phiên bản đã lưu</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {copiedToast && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in font-medium">
                ✓ {copiedToast}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined text-[21px]">close</span>
            </button>
          </div>
        </div>

        {/* 2. BODY: 2 COLUMNS (TIMELINE & DETAILS) */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: TIMELINE LIST */}
          <div className="w-[340px] sm:w-[380px] shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col">
            {/* Filter Tabs */}
            <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                Danh sách phiên bản
              </span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tất cả ({versionList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('active')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    filterType === 'active'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hiệu lực
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('archived')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    filterType === 'archived'
                      ? 'bg-white text-slate-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Lưu trữ
                </button>
              </div>
            </div>

            {/* List items with connected timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredVersions.map((item, idx) => {
                const originalIndex = versionList.findIndex((v) => v.version === item.version);
                const isSelected = originalIndex === selectedVersionIdx;

                return (
                  <div
                    key={item.version || idx}
                    onClick={() => setSelectedVersionIdx(originalIndex)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-xs'
                        : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Active Ribbon / Dot */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            item.isCurrentActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.isCurrentActive && '★ '}
                          {item.version}
                        </span>
                        {item.isCurrentActive ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Đang áp dụng
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Bản cũ
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10.5px] text-slate-400">
                        {item.publishedAt}
                      </span>
                    </div>

                    {/* Summary Note */}
                    <p className="text-xs text-slate-700 line-clamp-2 font-medium mb-2">
                      {item.notes || 'Cập nhật cấu hình quy trình nghiệp vụ.'}
                    </p>

                    {/* Foot Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 truncate max-w-[190px]">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">person</span>
                        <span className="truncate">{item.publishedBy}</span>
                      </div>
                      {item.changes && item.changes.length > 0 && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                          {item.changes.length} thay đổi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom summary note */}
            <div className="p-3 bg-slate-100/70 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Hệ thống bảo toàn phiên bản</span>
              <span className="font-mono text-slate-400">ISO-9001 / GOVEX</span>
            </div>
          </div>

          {/* RIGHT: DETAILED CHANGELOG & CONFIGURATION */}
          <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col justify-between">
            <div className="space-y-6">
              {/* Selected Version Hero Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-slate-50 border border-blue-100 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-blue-200/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-blue-900 px-2.5 py-0.5 rounded-lg bg-white border border-blue-200 shadow-2xs">
                      Phiên bản {selectedItem.version}
                    </span>
                    {selectedItem.isCurrentActive ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Đang áp dụng trong hệ thống
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Phiên bản lưu trữ (Lịch sử)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyVersionSummary}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    title="Sao chép tóm tắt thông tin phiên bản"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Sao chép thông tin</span>
                  </button>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Thời điểm ban hành</span>
                    <strong className="text-slate-800 font-mono">{selectedItem.publishedAt}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Cán bộ ban hành</span>
                    <strong className="text-slate-800">{selectedItem.publishedBy}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Tổng bước xử lý</span>
                    <strong className="text-slate-800">{selectedItem.totalSteps || workflow.steps.length} bước</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Thời hạn quy trình (SLA)</span>
                    <strong className="text-blue-700">{selectedItem.slaDays || 20} ngày làm việc</strong>
                  </div>
                </div>
              </div>

              {/* 1. Legal Basis & Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">gavel</span>
                  Căn cứ pháp lý &amp; Mục đích cập nhật
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-500 shrink-0">Căn cứ:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedItem.canCuPhapLy || 'Quy chế giải quyết đơn thư khiếu nại, tố cáo và kiến nghị phản ánh.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200/80">
                    <span className="font-semibold text-slate-500 shrink-0">Nội dung:</span>
                    <span className="text-slate-700 leading-relaxed">
                      {selectedItem.notes}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Detailed Changelog Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">tune</span>
                    Chi tiết các thay đổi so với phiên bản trước
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {selectedItem.changes?.length || 0} điểm thay đổi được ghi nhận
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedItem.changes && selectedItem.changes.length > 0 ? (
                    selectedItem.changes.map((change, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/50 transition-colors space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          {change.type === 'add' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              + Bổ sung
                            </span>
                          )}
                          {change.type === 'modify' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                              ~ Điều chỉnh
                            </span>
                          )}
                          {change.type === 'remove' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                              - Bãi bỏ
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900">{change.title}</span>
                          {change.target && (
                            <span className="text-[11px] text-slate-400 font-mono ml-auto">
                              [{change.target}]
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 pl-0.5 leading-relaxed">
                          {change.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                      Phiên bản này kế thừa cấu hình chuẩn, không có danh mục thay đổi cấu trúc lớn.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Process Architecture Specs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">account_tree</span>
                  Kiến trúc quy trình tại phiên bản này
                </h4>
                <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Nhóm trách nhiệm (Lanes)</span>
                    <strong className="text-slate-800 text-sm">{selectedItem.lanesCount || workflow.lanes.length} làn</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Giai đoạn nghiệp vụ</span>
                    <strong className="text-slate-800 text-sm">{workflow.stages.length} giai đoạn</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Biểu mẫu quy chuẩn</span>
                    <strong className="text-slate-800 text-sm">{selectedItem.formsCount || 3} biểu mẫu</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Selected Version */}
            <div className="pt-5 mt-6 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400 italic">
                * Có thể xem lại cấu hình hoặc tạo phiên bản sửa đổi mới từ bản này
              </span>

              <div className="flex items-center gap-2">
                {onViewVersion && (
                  <button
                    type="button"
                    onClick={() => onViewVersion(workflow, selectedItem.version)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">visibility</span>
                    <span>Xem sơ đồ phiên bản {selectedItem.version}</span>
                  </button>
                )}

                {onForkDraft && (
                  <button
                    type="button"
                    onClick={() => onForkDraft(workflow, selectedItem.version)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">fork_right</span>
                    <span>Tạo bản nháp mới từ bản này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
