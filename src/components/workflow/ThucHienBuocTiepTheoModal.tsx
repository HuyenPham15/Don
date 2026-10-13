import React, { useState, useEffect } from 'react';
import { WorkflowDefinition, WorkflowStepItem } from '../../types/workflow';

interface ThucHienBuocTiepTheoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    stepName: string,
    docTitle: string,
    docDetails?: {
      docTitle: string;
      soHieu: string;
      assignee: string;
      lanhDaoKy?: string;
      ghiChu: string;
      hanGiaiQuyet: string;
      loaiVanBan?: string;
      category?: string;
      stepNumber?: number;
      stepName?: string;
      action?: 'save' | 'trinh_ky';
    }
  ) => void;
  workflow: WorkflowDefinition;
  donCode: string;
  donTitle: string;
  nguoiNop: string;
  loaiDon: string;
  stepNumber?: number;
}

export default function ThucHienBuocTiepTheoModal({
  isOpen,
  onClose,
  onSuccess,
  workflow,
  donCode,
  stepNumber,
}: ThucHienBuocTiepTheoModalProps) {
  if (!isOpen) return null;

  // Lấy bước theo stepNumber hoặc bước 2
  const targetStepNumber = stepNumber || 2;
  const nextStep: WorkflowStepItem =
    workflow.steps.find((s) => s.stepNumber === targetStepNumber) ||
    workflow.steps[1] || {
      id: `step-${targetStepNumber}`,
      stepNumber: targetStepNumber,
      name: 'Thụ lý & Phân công giải quyết',
      responsibleRole: 'Cán bộ thụ lý',
      responsibleUnit: 'Bộ phận Tiếp dân & Xử lý đơn',
      status: 'active',
      description: 'Tiến hành thụ lý hồ sơ đơn theo quy định của pháp luật.',
      transferCondition: 'Hồ sơ có đủ điều kiện thụ lý.',
      estimatedDays: 10,
    };

  const defaultDocTitle =
    targetStepNumber === 2
      ? (workflow.id === 'to-giac'
        ? 'Quyết định phân công Điều tra viên thụ lý giải quyết nguồn tin tội phạm'
        : workflow.id === 'to-cao'
          ? 'Quyết định thụ lý giải quyết tố cáo'
          : workflow.id === 'kien-nghi'
            ? 'Phiếu chuyển đơn phản ánh, kiến nghị đến cơ quan có thẩm quyền'
            : 'Thông báo thụ lý giải quyết khiếu nại (Mẫu số 01)')
      : `Báo cáo / Văn bản thực hiện ${nextStep.name}`;

  const defaultSoHieu =
    workflow.id === 'to-giac'
      ? `QĐ-PC03/${new Date().getFullYear()}/CSĐT`
      : `TB-${nextStep.stepNumber}/${new Date().getFullYear()}/UBND`;

  const defaultAssignee =
    nextStep.responsibleRole
      ? `${nextStep.responsibleRole} - ${nextStep.responsibleUnit}`
      : 'Đ/c Nguyễn Minh Anh (Chuyên viên Phòng Tiếp dân & Xử lý đơn)';

  const defaultLanhDao =
    workflow.id === 'to-giac'
      ? 'Lê Hoàng Nam (Thủ trưởng Cơ quan CSĐT)'
      : 'Trần Văn Cường (Phó Chủ tịch UBND quận)';

  const [docTitle, setDocTitle] = useState(defaultDocTitle);
  const [soHieu, setSoHieu] = useState(defaultSoHieu);
  const [assignee, setAssignee] = useState(defaultAssignee);
  const [lanhDaoKy, setLanhDaoKy] = useState(defaultLanhDao);
  const [hanGiaiQuyet, setHanGiaiQuyet] = useState(`${nextStep.estimatedDays || 10} ngày làm việc`);
  const [ghiChu, setGhiChu] = useState('');

  // Đồng bộ lại dữ liệu mặc định khi modal mở hoặc bước/loại quy trình thay đổi
  useEffect(() => {
    setDocTitle(defaultDocTitle);
    setSoHieu(defaultSoHieu);
    setAssignee(defaultAssignee);
    setLanhDaoKy(defaultLanhDao);
    setHanGiaiQuyet(`${nextStep.estimatedDays || 10} ngày làm việc`);
    setGhiChu('');
  }, [isOpen, targetStepNumber, workflow.id]);

  const handleFormSubmit = (e: React.FormEvent, action: 'save' | 'trinh_ky' = 'trinh_ky') => {
    e.preventDefault();
    const isQuyetDinh = docTitle.toLowerCase().includes('quyết định');
    const isThongBao = docTitle.toLowerCase().includes('thông báo');
    const loaiVanBan = isQuyetDinh ? 'quyet_dinh' : isThongBao ? 'thong_bao' : 'cong_van';
    const category = isQuyetDinh ? 'Quyết định thụ lý' : isThongBao ? 'Thông báo thụ lý' : 'Văn bản quy trình';

    onSuccess(nextStep.name, docTitle, {
      docTitle,
      soHieu,
      assignee,
      lanhDaoKy,
      ghiChu,
      hanGiaiQuyet,
      loaiVanBan,
      category,
      stepNumber: targetStepNumber,
      stepName: nextStep.name,
      action,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-body-md">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                Đề xuất thụ lý đơn
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Đơn <span className="font-semibold text-slate-700">{donCode}</span>
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

        {/* Form Body */}
        <form onSubmit={(e) => handleFormSubmit(e, 'trinh_ky')} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Cán bộ thụ lý (Người lập đề xuất) <span className="text-rose-600">*</span>
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
              Lãnh đạo phê duyệt / Ký duyệt <span className="text-rose-600">*</span>
            </label>
            <select
              value={lanhDaoKy}
              onChange={(e) => setLanhDaoKy(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
            >
              <option value="Trần Văn Cường (Phó Chủ tịch UBND quận)">Đ/c Trần Văn Cường - Phó Chủ tịch UBND quận</option>
              <option value="Lê Trọng Minh (Chủ tịch UBND quận)">Đ/c Lê Trọng Minh - Chủ tịch UBND quận</option>
              <option value="Lê Hoàng Nam (Thủ trưởng Cơ quan CSĐT)">Đ/c Lê Hoàng Nam - Thủ trưởng Cơ quan CSĐT</option>
              <option value="Nguyễn Hải Đăng (Phó Thủ trưởng Cơ quan CSĐT)">Đ/c Nguyễn Hải Đăng - Phó Thủ trưởng Cơ quan CSĐT</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Nội dung đề xuất / Ghi chú <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập nội dung đề xuất hoặc yêu cầu xác minh làm rõ..."
              className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
            >
              Hủy
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleFormSubmit(e, 'save')}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Lưu văn bản dưới dạng bản nháp"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>Lưu nháp</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleFormSubmit(e, 'trinh_ky')}
                className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs active:scale-95"
                title="Lưu đề xuất và chuyển trình Lãnh đạo phê duyệt"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                <span>Lưu &amp; Trình ký Lãnh đạo</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
