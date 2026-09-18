import React, { useState } from 'react';
import { WorkflowDefinition, WorkflowStepItem } from '../../types/workflow';

interface ThucHienBuocTiepTheoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (stepName: string, docTitle: string) => void;
  workflow: WorkflowDefinition;
  donCode: string;
  donTitle: string;
  nguoiNop: string;
  loaiDon: string;
}

export default function ThucHienBuocTiepTheoModal({
  isOpen,
  onClose,
  onSuccess,
  workflow,
  donCode,
  nguoiNop,
}: ThucHienBuocTiepTheoModalProps) {
  if (!isOpen) return null;

  // Lấy bước tiếp theo
  const nextStep: WorkflowStepItem =
    workflow.steps.find((s) => s.stepNumber === 2) ||
    workflow.steps[1] || {
      id: 'step-2',
      stepNumber: 2,
      name: 'Thụ lý & Phân công giải quyết',
      responsibleRole: 'Cán bộ thụ lý',
      responsibleUnit: 'Bộ phận Tiếp dân & Xử lý đơn',
      status: 'active',
      description: 'Tiến hành thụ lý hồ sơ đơn theo quy định của pháp luật.',
      transferCondition: 'Hồ sơ có đủ điều kiện thụ lý.',
      estimatedDays: 10,
    };

  const defaultDocTitle =
    workflow.id === 'to-giac'
      ? 'Quyết định phân công Điều tra viên thụ lý giải quyết nguồn tin tội phạm'
      : workflow.id === 'to-cao'
      ? 'Quyết định thụ lý giải quyết tố cáo'
      : workflow.id === 'kien-nghi'
      ? 'Phiếu chuyển đơn phản ánh, kiến nghị đến cơ quan có thẩm quyền'
      : 'Thông báo thụ lý giải quyết khiếu nại (Mẫu số 01)';

  const defaultSoHieu =
    workflow.id === 'to-giac'
      ? `QĐ-PC03/${new Date().getFullYear()}/CSĐT`
      : `TB-TL/${new Date().getFullYear()}/UBND`;

  const defaultAssignee =
    workflow.id === 'to-giac'
      ? 'Trung tá Lê Văn Nam (Điều tra viên Đội 3 - PC03)'
      : 'Đ/c Nguyễn Minh Anh (Chuyên viên Phòng Tiếp dân & Xử lý đơn)';

  const [docTitle, setDocTitle] = useState(defaultDocTitle);
  const [soHieu, setSoHieu] = useState(defaultSoHieu);
  const [assignee, setAssignee] = useState(defaultAssignee);
  const [hanGiaiQuyet, setHanGiaiQuyet] = useState(`${nextStep.estimatedDays || 10} ngày làm việc`);
  const [ghiChu, setGhiChu] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(nextStep.name, docTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                Chuyển bước: {nextStep.name}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Đơn <span className="font-semibold text-slate-700">{donCode}</span> • Người nộp: <strong className="text-slate-800">{nguoiNop}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Body: Chỉ giữ các thông tin cốt lõi */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tiêu đề văn bản / Quyết định ban hành <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Số hiệu văn bản <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={soHieu}
                onChange={(e) => setSoHieu(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Thời hạn giải quyết</label>
              <input
                type="text"
                value={hanGiaiQuyet}
                onChange={(e) => setHanGiaiQuyet(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Cán bộ / Đơn vị thụ lý chính <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Ghi chú / Chỉ đạo thực hiện <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập nội dung chỉ đạo hoặc yêu cầu xác minh..."
              className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">check</span>
              <span>Xác nhận chuyển bước</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
