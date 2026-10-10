// src/screens/quanLyTrinhKy/XuLyLanhDaoModal.tsx
import React, { useState } from 'react';
import { LuotTrinhKy, NguoiNhanTrinhItem } from '../../types/quanLyTrinhKy';

export type LeaderActionKind =
  | 'ky_nhay'
  | 'phe_duyet'
  | 'yeu_cau_chinh_sua'
  | 'tra_lai'
  | 'tu_choi';

interface XuLyLanhDaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  luotTrinh: LuotTrinhKy | null;
  leaderInfo: NguoiNhanTrinhItem | null;
  actionKind: LeaderActionKind;
  onConfirmAction: (params: {
    actionKind: LeaderActionKind;
    yKien: string;
    certName: string;
    soSeri: string;
  }) => void;
}

export default function XuLyLanhDaoModal({
  isOpen,
  onClose,
  luotTrinh,
  leaderInfo,
  actionKind,
  onConfirmAction,
}: XuLyLanhDaoModalProps) {
  const [yKien, setYKien] = useState('');
  const [certType, setCertType] = useState('VGCA - Ban Cơ yếu Chính phủ');
  const [pinCode, setPinCode] = useState('123456');

  if (!isOpen || !luotTrinh || !leaderInfo) return null;

  const isPositiveAction = actionKind === 'ky_nhay' || actionKind === 'phe_duyet';
  const isReturnAction = actionKind === 'tra_lai' || actionKind === 'yeu_cau_chinh_sua';

  const title =
    actionKind === 'ky_nhay'
      ? 'Ký nháy chuyên môn văn bản'
      : actionKind === 'phe_duyet'
        ? 'Phê duyệt & Ký số CA điện tử'
        : actionKind === 'yeu_cau_chinh_sua'
          ? 'Yêu cầu chỉnh sửa văn bản/hồ sơ'
          : actionKind === 'tra_lai'
            ? 'Trả lại lượt trình cho cán bộ'
            : 'Từ chối phê duyệt lượt trình';

  const handleConfirm = () => {
    if ((actionKind === 'tra_lai' || actionKind === 'yeu_cau_chinh_sua') && !yKien.trim()) {
      alert('Vui lòng nhập lý do/ý kiến chỉ đạo để cán bộ thụ lý thực hiện chỉnh sửa!');
      return;
    }

    onConfirmAction({
      actionKind,
      yKien:
        yKien.trim() ||
        (actionKind === 'phe_duyet'
          ? 'Đồng ý phê duyệt và ban hành văn bản.'
          : actionKind === 'ky_nhay'
            ? 'Đã kiểm tra, ký nháy xác nhận nghiệp vụ.'
            : ''),
      certName: certType,
      soSeri: '5404 8892 1102 9931',
    });
    setYKien('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 text-white flex items-center justify-between ${
            actionKind === 'phe_duyet'
              ? 'bg-emerald-700'
              : actionKind === 'ky_nhay'
                ? 'bg-blue-700'
                : isReturnAction
                  ? 'bg-amber-600'
                  : 'bg-rose-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl">
              {actionKind === 'phe_duyet'
                ? 'verified'
                : actionKind === 'ky_nhay'
                  ? 'draw'
                  : isReturnAction
                    ? 'assignment_return'
                    : 'cancel'}
            </span>
            <div>
              <h3 className="font-bold text-sm tracking-tight">{title}</h3>
              <p className="text-[11px] text-white/80">Lượt trình: {luotTrinh.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-slate-800 text-xs">
          {/* Thông tin đối tượng */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Đối tượng trình ký:</div>
            <div className="font-bold text-slate-900 text-xs">{luotTrinh.tenDoiTuong}</div>
            <div className="text-[11px] text-slate-500">
              Đơn: <strong className="text-blue-900">{luotTrinh.maHoSoLienQuan}</strong> • Người trình: {luotTrinh.nguoiTrinh}
            </div>
          </div>

          {/* Lãnh đạo thực hiện */}
          <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              {leaderInfo.hoTen.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900">{leaderInfo.hoTen}</div>
              <div className="text-[10.5px] text-slate-600">{leaderInfo.chucVu}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-blue-800 border border-blue-300">
              {leaderInfo.hanhDongYeuCau === 'phe_duyet' ? 'Thẩm quyền phê duyệt' : 'Ký nháy nghiệp vụ'}
            </span>
          </div>

          {/* Nếu là ký số / phê duyệt: chọn chứng thư số CA */}
          {actionKind === 'phe_duyet' && (
            <div className="space-y-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-emerald-700">lock</span>
                  <span>Cấu hình Chữ ký số điện tử (CA)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Hợp chuẩn Ban Cơ yếu
                </span>
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] text-slate-600 font-semibold block">Chứng thư số:</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="VGCA - Ban Cơ yếu Chính phủ">VGCA - Ban Cơ yếu Chính phủ (Token USB)</option>
                  <option value="Viettel-CA Cloud PKI">Viettel-CA Cloud PKI (Ký số từ xa qua SmartPhone)</option>
                  <option value="VNPT SmartCA Doanh nghiệp">VNPT SmartCA (Cấp thẩm quyền)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-500 block">Số Seri chứng thư:</label>
                  <span className="font-mono text-[10px] text-slate-700 font-bold">5404 8892 1102 9931</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Mã PIN xác thực:</label>
                  <input
                    type="password"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                    placeholder="Mã PIN"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ô nhập ý kiến chỉ đạo / nhận xét / lý do trả lại */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>
                {isReturnAction
                  ? 'Lý do trả lại / Yêu cầu chỉnh sửa *'
                  : actionKind === 'tu_choi'
                    ? 'Lý do từ chối *'
                    : 'Ý kiến chỉ đạo / Nhận xét:'}
              </span>
              {isReturnAction && <span className="text-amber-700 text-[10px] font-bold">Bắt buộc</span>}
            </label>
            <textarea
              rows={3}
              value={yKien}
              onChange={(e) => setYKien(e.target.value)}
              placeholder={
                isReturnAction
                  ? 'Nêu rõ nội dung cần cán bộ bổ sung hoặc chỉnh sửa (ví dụ: Thiếu trích lục địa chính, cần bổ sung lời khai...)'
                  : isPositiveAction
                    ? 'Nhập ý kiến giao việc, hướng dẫn hoặc lưu ý (không bắt buộc)...'
                    : 'Nêu lý do không chấp thuận phê duyệt...'
              }
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 ${
              actionKind === 'phe_duyet'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : actionKind === 'ky_nhay'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : isReturnAction
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPositiveAction ? 'check_circle' : 'send'}
            </span>
            <span>
              {actionKind === 'phe_duyet'
                ? 'Xác nhận Phê duyệt & Ký số'
                : actionKind === 'ky_nhay'
                  ? 'Xác nhận Ký nháy'
                  : actionKind === 'yeu_cau_chinh_sua'
                    ? 'Gửi yêu cầu chỉnh sửa'
                    : actionKind === 'tra_lai'
                      ? 'Xác nhận Trả lại'
                      : 'Xác nhận Từ chối'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
