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
    workflow.id === 'to-giac'
      ? 'Quyết định thụ lý và phân công giải quyết nguồn tin về tội phạm'
      : workflow.id === 'to-cao'
        ? 'Quyết định thụ lý giải quyết tố cáo'
        : workflow.id === 'kien-nghi'
          ? 'Quyết định thụ lý giải quyết phản ánh kiến nghị'
          : 'Quyết định về việc thụ lý giải quyết khiếu nại';

  const defaultSoHieu =
    workflow.id === 'to-giac'
      ? `${donCode.replace(/\D/g, '') || '45'}/QĐ-PC03`
      : `${donCode.replace(/\D/g, '') || '125'}/QĐ-UBND`;

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
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-lg">gavel</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <span>Ban hành Quyết định thụ lý giải quyết</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Chuyển thành Vụ việc
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Hồ sơ: <span className="font-semibold text-slate-700">{donCode}</span> • Trình ký ban hành quyết định thụ lý chính thức
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
          {/* Thông báo chuyển đổi */}
          {/* <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-purple-900 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-purple-700 text-[18px] shrink-0 mt-0.5">info</span>
            <div className="text-[11.5px] leading-relaxed">
              Sau khi <strong>Trình ký Quyết định thụ lý</strong>, hồ sơ đơn <strong className="text-purple-950 font-bold">{donCode}</strong> sẽ chính thức được chuyển đổi thành <strong>VỤ VIỆC (Mã: {donCode.replace(/^Đ-/, 'VV-')})</strong> và bước vào giai đoạn xác minh giải quyết vụ việc.
            </div>
          </div> */}

          {/* Tiêu đề quyết định thụ lý */}
          {/* <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tiêu đề văn bản Quyết định <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div> */}

          {/* Số / Ký hiệu và Thời hạn giải quyết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Số / Ký hiệu quyết định <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={soHieu}
                onChange={(e) => setSoHieu(e.target.value)}
                placeholder="Ví dụ: 45/QĐ-UBND"
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Thời hạn giải quyết <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={hanGiaiQuyet}
                onChange={(e) => setHanGiaiQuyet(e.target.value)}
                placeholder="Ví dụ: 30 ngày làm việc"
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Cán bộ thụ lý chính (Được phân công) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Lãnh đạo phê duyệt / Ký ban hành <span className="text-rose-600">*</span>
            </label>
            <select
              value={lanhDaoKy}
              onChange={(e) => setLanhDaoKy(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            >
              <option value="Trần Văn Cường (Phó Chủ tịch UBND quận)">Đ/c Trần Văn Cường - Phó Chủ tịch UBND quận</option>
              <option value="Lê Trọng Minh (Chủ tịch UBND quận)">Đ/c Lê Trọng Minh - Chủ tịch UBND quận</option>
              <option value="Lê Hoàng Nam (Thủ trưởng Cơ quan CSĐT)">Đ/c Lê Hoàng Nam - Thủ trưởng Cơ quan CSĐT</option>
              <option value="Nguyễn Hải Đăng (Phó Thủ trưởng Cơ quan CSĐT)">Đ/c Nguyễn Hải Đăng - Phó Thủ trưởng Cơ quan CSĐT</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Chỉ đạo / Kế hoạch giải quyết vụ việc <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              rows={2}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập nội dung chỉ đạo, giao nhiệm vụ hoặc phân công cán bộ phối hợp xác minh..."
              className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 resize-none"
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
                onClick={(e) => handleFormSubmit(e, 'trinh_ky')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs"
                title="Trình ký Lãnh đạo ban hành Quyết định thụ lý và chính thức chuyển thành Vụ việc"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                <span>Lưu văn bản</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
