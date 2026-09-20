// src/screens/workflowAdmin/components/WorkflowVersionsTab.tsx
import React, { useState } from 'react';
import { ProcessWorkflow, VersionHistoryItem } from '../../../types/workflowConfig';
import WorkflowVersionCompareModal from './WorkflowVersionCompareModal';

interface WorkflowVersionsTabProps {
  workflow: ProcessWorkflow;
  onCreateNewVersion: (baseWf: ProcessWorkflow, versionNote?: string) => void;
  onViewVersionDetail?: (version: string) => void;
}

export default function WorkflowVersionsTab({
  workflow,
  onCreateNewVersion,
  onViewVersionDetail,
}: WorkflowVersionsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [newVersionReason, setNewVersionReason] = useState('Nâng cấp và chuẩn hóa quy trình giải quyết theo văn bản chỉ đạo mới');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const versionHistory = workflow.versionHistory || [];

  // Xác định version kế tiếp
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Banner & Actions (Section 11, 12, 15) */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200/90 shadow-2xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-700 text-lg">layers</span>
              <span>Quản lý danh sách phiên bản quy trình ({workflow.code})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm soát các mốc phát hành, số lượng hồ sơ đang vận hành độc lập theo từng phiên bản
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">compare_arrows</span>
              <span>So sánh phiên bản</span>
            </button>

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

        {/* Rule 15 Banner */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-blue-700 text-[18px] shrink-0 mt-0.5">info</span>
          <div className="space-y-0.5">
            <span className="font-bold">Quy tắc quản lý tính toàn vẹn phiên bản (Quy tắc Section 15):</span>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Hồ sơ mới nộp sau ngày hiệu lực sẽ áp dụng phiên bản mới nhất. Các hồ sơ đã khởi tạo trước đó vẫn tiếp tục thụ lý theo đúng phiên bản cũ cho đến khi đóng hồ sơ (hệ thống không tự ý migrate sang phiên bản mới làm ảnh hưởng tiến độ vụ việc).
            </p>
          </div>
        </div>
      </div>

      {/* Main Table of Versions (Section 11 & 16) */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden max-w-5xl mx-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Phiên bản</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Người phát hành</th>
                <th className="py-3.5 px-4">Ngày hiệu lực</th>
                <th className="py-3.5 px-4 text-center">Hồ sơ đang chạy</th>
                <th className="py-3.5 px-4">Ghi chú nâng cấp</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versionHistory.map((v, idx) => {
                const isCurrentActive = v.isCurrentActive;
                // Giả lập số lượng hồ sơ đang chạy theo version (Section 16)
                const runningCount = isCurrentActive
                  ? workflow.activeDonsCount || 68
                  : idx === 1
                  ? 24
                  : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          isCurrentActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isCurrentActive ? `★ ${v.version}` : v.version}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {isCurrentActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Đang hiệu lực
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 w-fit block">
                          Đã lưu trữ
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{v.publishedBy}</div>
                      <div className="text-[10.5px] text-slate-400">{v.role || 'Cán bộ quản trị'}</div>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">
                      {v.publishedAt}
                    </td>

                    {/* Section 16: Số hồ sơ đang chạy theo version */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11.5px] ${
                          runningCount > 0
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {runningCount} hồ sơ
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-700 font-medium line-clamp-2">{v.notes}</p>
                      {v.canCuPhapLy && (
                        <span className="text-[10.5px] text-slate-400 italic block mt-0.5 truncate">
                          Căn cứ: {v.canCuPhapLy}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsCompareModalOpen(true)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="So sánh với phiên bản khác"
                        >
                          <span className="material-symbols-outlined text-[17px]">compare_arrows</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẠO PHIÊN BẢN MỚI (SECTION 12) */}
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
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmCreateNewVersion} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-purple-950 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Phiên bản hiện tại: {workflow.version}</span>
                  <span className="text-purple-700 font-extrabold text-sm">➔ {nextSuggestedVersion} (Bản nháp mới)</span>
                </div>
                <p className="text-[11.5px] text-slate-600">
                  Hệ thống sẽ sao chép toàn bộ sơ đồ, các bước và connector hiện có để bạn chỉnh sửa mà không ảnh hưởng tới phiên bản {workflow.version} đang hiệu lực.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do tạo phiên bản mới *</label>
                <input
                  type="text"
                  required
                  value={newVersionReason}
                  onChange={(e) => setNewVersionReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú tóm tắt nội dung thay đổi dự kiến</label>
                <textarea
                  rows={3}
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  placeholder="Ví dụ: Rút ngắn thời hạn xác minh, cập nhật biểu mẫu điện tử theo thông tư mới..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">fork_right</span>
                  <span>Tạo &amp; Chỉnh sửa bản nháp {nextSuggestedVersion}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SO SÁNH PHIÊN BẢN (SECTION 13) */}
      {isCompareModalOpen && (
        <WorkflowVersionCompareModal
          workflow={workflow}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
    </div>
  );
}
