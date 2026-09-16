import React, { useState } from 'react';
import { WorkflowDefinition } from '../../types/workflow';
import { WORKFLOW_DEFINITIONS, matchWorkflowByLoaiDon } from '../../constants/workflows';

interface ChuyenQuyTrinhModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLoaiDon: string;
  currentWorkflow: WorkflowDefinition;
  onConfirmChange: (newLoaiDon: string, newWorkflow: WorkflowDefinition, reason: string) => void;
}

const AVAILABLE_LOAI_DONS = [
  'Đơn tố giác về tội phạm',
  'Đơn khiếu nại (Lần 1)',
  'Đơn tố cáo',
  'Đơn phản ánh, kiến nghị',
];

export default function ChuyenQuyTrinhModal({
  isOpen,
  onClose,
  currentLoaiDon,
  currentWorkflow,
  onConfirmChange,
}: ChuyenQuyTrinhModalProps) {
  const [selectedNewLoaiDon, setSelectedNewLoaiDon] = useState<string>(() => {
    return currentLoaiDon.includes('tố giác')
      ? 'Đơn khiếu nại (Lần 1)'
      : 'Đơn tố giác về tội phạm';
  });

  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetWorkflow = matchWorkflowByLoaiDon(selectedNewLoaiDon);
  const isSame = selectedNewLoaiDon === currentLoaiDon;

  const handleConfirm = () => {
    if (isSame) {
      setError('Vui lòng chọn loại đơn khác với loại đơn hiện tại!');
      return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do điều chỉnh loại đơn để lưu vết kiểm toán hồ sơ!');
      return;
    }
    setError(null);
    onConfirmChange(selectedNewLoaiDon, targetWorkflow, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950 font-headline-md tracking-tight">
                Cảnh báo thay đổi loại đơn &amp; Chuyển đổi quy trình
              </h3>
              <p className="text-[11px] text-rose-700">
                Quy trình xử lý hiện tại đã được khởi tạo và đang có công việc tác nghiệp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
            <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5 shrink-0">
              info
            </span>
            <div>
              <strong>Lưu ý quan trọng: </strong> Thay đổi loại đơn có thể làm thay đổi toàn bộ quy trình xử lý hiện tại. Các công việc đang thực hiện sẽ được dừng và lưu trữ lịch sử kiểm toán.
            </div>
          </div>

          {/* So sánh quy trình Cũ vs Mới */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Cột hiện tại */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                HIỆN TẠI (ĐANG ÁP DỤNG)
              </span>
              <div>
                <span className="text-slate-500 block text-[11px]">Loại đơn:</span>
                <span className="font-bold text-slate-800 text-xs">{currentLoaiDon}</span>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-slate-500 block text-[11px]">Quy trình:</span>
                <span className="font-semibold text-[#004ac6] text-[11.5px] block leading-snug">
                  {currentWorkflow.name}
                </span>
                <span className="text-[10.5px] text-slate-400">({currentWorkflow.totalSteps} bước)</span>
              </div>
            </div>

            {/* Cột mới dự kiến */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <span className="text-[10.5px] font-bold text-[#004ac6] uppercase tracking-wider block flex items-center gap-1">
                <span>DỰ KIẾN CHUYỂN SANG</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </span>
              <div>
                <span className="text-slate-500 block text-[11px]">Chọn loại đơn mới:</span>
                <select
                  value={selectedNewLoaiDon}
                  onChange={(e) => {
                    setSelectedNewLoaiDon(e.target.value);
                    setError(null);
                  }}
                  className="w-full mt-0.5 p-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {AVAILABLE_LOAI_DONS.map((ld) => (
                    <option key={ld} value={ld}>
                      {ld}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-1 border-t border-blue-100">
                <span className="text-slate-500 block text-[11px]">Quy trình tương ứng:</span>
                <span className="font-semibold text-emerald-800 text-[11.5px] block leading-snug">
                  {targetWorkflow.name}
                </span>
                <span className="text-[10.5px] text-slate-500">({targetWorkflow.totalSteps} bước mới)</span>
              </div>
            </div>
          </div>

          {/* Nhập lý do điều chỉnh */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Lý do chuyển đổi loại đơn (Bắt buộc lưu vết kiểm toán): <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="Ví dụ: Đương sự nộp bổ sung tài liệu chứng minh bản chất vụ việc là khiếu nại hành chính thu hồi đất, không cấu thành tội phạm lừa đảo..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#004ac6] resize-none"
            />
            {error && <p className="text-[11px] text-rose-600 font-semibold mt-1">{error}</p>}
          </div>

          {/* Audit disclaimer */}
          <p className="text-[11px] text-slate-500 italic">
            * Sau khi xác nhận, hệ thống sẽ tự động đóng quy trình cũ theo luật nghiệp vụ, ghi nhận lịch sử thay đổi và khởi tạo danh mục công việc mới. Lịch sử quy trình cũ vẫn được bảo lưu nguyên vẹn.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Xác nhận chuyển quy trình</span>
          </button>
        </div>
      </div>
    </div>
  );
}
