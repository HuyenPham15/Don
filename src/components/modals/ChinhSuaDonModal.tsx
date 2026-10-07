import React, { useState, useEffect } from 'react';
import { DonDetail } from '../../types';

export interface ChinhSuaDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  donData: DonDetail;
  onSave: (updatedData: DonDetail) => void;
}

const LOAI_DON_OPTIONS = [
  'Đơn khiếu nại đất đai',
  'Đơn khiếu nại (Lần 1)',
  'Đơn khiếu nại (Lần 2)',
  'Đơn tố cáo cán bộ vi phạm công vụ',
  'Đơn tố cáo hành vi vi phạm pháp luật',
  'Đơn phản ánh, kiến nghị',
  'Đơn kiến nghị khởi tố',
  'Đơn tố giác về tội phạm',
  'Đơn tranh chấp dân sự / khởi kiện',
];

const DON_VI_OPTIONS = [
  'Phòng Tiếp công dân & Xử lý đơn',
  'Thanh tra Quận / Huyện',
  'Phòng Tài nguyên và Môi trường',
  'Phòng Quản lý đô thị',
  'Ban Quản lý dự án ĐTXD',
  'UBND Phường / Xã',
];

export default function ChinhSuaDonModal({
  isOpen,
  onClose,
  donData,
  onSave,
}: ChinhSuaDonModalProps) {
  const [formData, setFormData] = useState<DonDetail>({ ...donData });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...donData });
    }
  }, [isOpen, donData]);

  if (!isOpen) return null;

  const handleChange = (field: keyof DonDetail, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-500/10 via-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">edit_document</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                  CHỈNH SỬA THÔNG TIN ĐƠN
                </span>
                <span className="text-[11.5px] text-slate-500 font-mono">
                  Mã đơn: <strong className="text-slate-800">{formData.code}</strong>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Cập nhật thông tin hồ sơ &amp; người nộp đơn
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section 1: Thông tin hồ sơ đơn */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-200">
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">description</span>
              <span>1. Thông tin chung về đơn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Tiêu đề / Trích yếu đơn <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                  placeholder="Nhập tiêu đề hoặc trích yếu đơn..."
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Loại đơn <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                </label>
                <select
                  value={formData.loaiDon || 'Đơn khiếu nại đất đai'}
                  onChange={(e) => handleChange('loaiDon', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                >
                  {LOAI_DON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Ngày tiếp nhận <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ngayNhan || '16/09/2026 09:30'}
                  onChange={(e) => handleChange('ngayNhan', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin người nộp đơn */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-200">
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">person</span>
              <span>2. Thông tin người nộp đơn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Họ và tên người nộp <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nguoiNop}
                  onChange={(e) => handleChange('nguoiNop', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                  placeholder="Họ và tên..."
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Số CCCD / CMND / Mã định danh
                </label>
                <input
                  type="text"
                  value={formData.cccd || '001088012345'}
                  onChange={(e) => handleChange('cccd', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                  placeholder="12 chữ số CCCD..."
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  value={formData.sdt || '0983 123 456'}
                  onChange={(e) => handleChange('sdt', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                  placeholder="09xx..."
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Địa chỉ thường trú / liên hệ
                </label>
                <input
                  type="text"
                  value={formData.diaChi || 'Cầu Giấy, Hà Nội'}
                  onChange={(e) => handleChange('diaChi', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                  placeholder="Số nhà, đường, phường, quận..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cán bộ & Đơn vị phụ trách */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-200">
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">badge</span>
              <span>3. Cán bộ &amp; Đơn vị xử lý</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Cán bộ tiếp nhận <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.canBoTiepNhan || formData.canBoXuLy || 'Nguyễn Minh Anh'}
                  onChange={(e) => handleChange('canBoTiepNhan', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Chức vụ cán bộ
                </label>
                <input
                  type="text"
                  value={formData.chucVuCanBo || 'Chuyên viên Tiếp nhận'}
                  onChange={(e) => handleChange('chucVuCanBo', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Đơn vị xử lý <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                </label>
                <select
                  value={formData.donViXuLy || formData.donViTiepNhan || 'Phòng Tiếp công dân & Xử lý đơn'}
                  onChange={(e) => handleChange('donViXuLy', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                >
                  {DON_VI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Tóm tắt nội dung */}
          <div className="space-y-2 pt-2">
            <label className="block text-[12.5px] font-semibold text-slate-700">
              Nội dung tóm tắt vụ việc
            </label>
            <textarea
              rows={3}
              value={formData.noiDung || formData.title}
              onChange={(e) => handleChange('noiDung', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[13px] text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] resize-none"
              placeholder="Nhập nội dung tóm tắt đơn..."
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
