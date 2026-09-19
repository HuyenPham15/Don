// src/screens/workflowAdmin/components/PublishModal.tsx
import React, { useState } from 'react';
import { ProcessWorkflow } from '../../../types/workflowConfig';

interface PublishModalProps {
  workflow: ProcessWorkflow;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: (effectiveDate: string, notes: string) => void;
}

export default function PublishModal({
  workflow,
  isOpen,
  onClose,
  onConfirmPublish,
}: PublishModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [effectiveDate, setEffectiveDate] = useState(today);
  const [releaseNotes, setReleaseNotes] = useState(
    `Phát hành chính thức phiên bản ${workflow.version} áp dụng cho toàn bộ hồ sơ ${workflow.loaiDonName}.`
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Phát hành Quy trình xử lý</h3>
              <span className="text-[11px] text-slate-500 font-mono">{workflow.code}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tên quy trình:</span>
              <span className="font-bold text-slate-900 text-right">{workflow.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Loại đơn áp dụng:</span>
              <span className="font-bold text-blue-700 px-2 py-0.5 rounded bg-white border border-blue-200">
                {workflow.loaiDonName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phiên bản ban hành:</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ★ {workflow.version} (Mới nhất)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tổng số bước / luồng:</span>
              <span className="font-medium text-slate-700">
                {workflow.steps.length} bước • {workflow.transitions.length} đường chuyển
              </span>
            </div>
            <div className="pt-2 border-t border-blue-100/80 flex items-start gap-1.5 text-[11px] text-blue-800">
              <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0 mt-0.5">sync_alt</span>
              <span>
                <strong>Tự động liên kết:</strong> Loại đơn <strong>"{workflow.loaiDonName}"</strong> sẽ được tự động gắn theo phiên bản mới nhất (<strong>{workflow.version}</strong>) này ngay khi phát hành.
              </span>
            </div>
          </div>

          {/* Ngày hiệu lực */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Ngày bắt đầu có hiệu lực <span className="text-rose-600">*</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[10.5px] text-slate-400 mt-1 block">
              Từ thời điểm này, các hồ sơ mới tiếp nhận thuộc Loại đơn sẽ tự động áp dụng quy trình phiên bản mới nhất này
            </span>
          </div>

          {/* Ghi chú phát hành */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Ghi chú phát hành &amp; Căn cứ ban hành
            </label>
            <textarea
              rows={2}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Rules Reminder (Notice Box) */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-amber-900">
            <span className="font-bold flex items-center gap-1 text-[11.5px]">
              <span className="material-symbols-outlined text-[15px] text-amber-700">info</span>
              Nguyên tắc quản trị phiên bản GOVEX:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              <li>Loại đơn <strong>{workflow.loaiDonName}</strong> sẽ tự động gắn với phiên bản mới nhất ({workflow.version}).</li>
              <li>Hồ sơ mới thuộc Loại đơn sẽ tự động chạy theo phiên bản mới nhất này.</li>
              <li>Các hồ sơ đang trong quá trình xử lý vẫn giữ nguyên phiên bản workflow ban đầu.</li>
              <li>Sau khi phát hành, không thể chỉnh sửa trực tiếp (muốn sửa phải tạo phiên bản mới).</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirmPublish(effectiveDate, releaseNotes)}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Xác nhận phát hành
          </button>
        </div>
      </div>
    </div>
  );
}
