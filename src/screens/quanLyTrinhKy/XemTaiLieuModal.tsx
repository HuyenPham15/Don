// src/screens/quanLyTrinhKy/XemTaiLieuModal.tsx
import React from 'react';
import { HoSoDocumentItem } from '../../types/quanLyTrinhKy';

interface XemTaiLieuModalProps {
  document: HoSoDocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  maHoSoLienQuan?: string;
  tieuDeDon?: string;
}

export default function XemTaiLieuModal({
  document,
  isOpen,
  onClose,
  maHoSoLienQuan,
  tieuDeDon,
}: XemTaiLieuModalProps) {
  if (!isOpen || !document) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-rose-400 text-2xl">picture_as_pdf</span>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{document.tenTaiLieu}</h4>
              <div className="flex items-center gap-2 text-[10.5px] text-slate-300">
                <span>{document.soKyHieu || 'Chưa cấp số'}</span>
                <span>•</span>
                <span>Phiên bản {document.phienBan}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold uppercase">{document.loaiTaiLieu}</span>
                {document.dungLuong && <span>• {document.dungLuong}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`✓ Đang chuẩn bị tải xuống: ${document.tenTaiLieu}`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Tải file</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body: A4 Paper Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-serif text-slate-800 bg-slate-100">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-6">
            {/* Header Thể thức hành chính */}
            <div className="grid grid-cols-2 gap-4 text-center font-sans border-b border-slate-200 pb-5">
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase text-slate-700">CƠ QUAN CÔNG AN / THANH TRA</div>
                <div className="text-[11px] font-bold uppercase text-blue-900">BỘ PHẬN XỬ LÝ ĐƠN THƯ</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {document.soKyHieu || 'Số: .../VB-TC'}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase text-slate-900 tracking-tight">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-[11px] font-bold text-slate-800 underline decoration-slate-400">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-[10px] text-slate-500 italic mt-1">
                  Hà Nội, ngày 14 tháng 03 năm 2026
                </div>
              </div>
            </div>

            {/* Tiêu đề văn bản */}
            <div className="text-center space-y-2 py-2">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 font-sans">
                {document.tenTaiLieu}
              </h2>
              {maHoSoLienQuan && (
                <p className="text-xs text-slate-500 font-sans italic">
                  (Thuộc hồ sơ đơn: <strong className="text-blue-900">{maHoSoLienQuan}</strong> - {tieuDeDon})
                </p>
              )}
            </div>

            {/* Nội dung chi tiết */}
            <div className="text-xs leading-relaxed text-slate-800 space-y-3 whitespace-pre-line font-sans">
              {document.noiDungChiTiet ||
                document.noiDungTrichYeu ||
                `Văn bản điện tử được trích xuất từ Hệ thống Quản lý và xử lý đơn thư nghiệp vụ.\n\nTài liệu thành phần đã được kiểm tra tính hợp lệ về mặt thể thức, phiên bản ${document.phienBan}.\nNgười soạn thảo: ${document.nguoiSoan || 'Cán bộ thụ lý'}\nNgày khởi tạo: ${document.ngayTao || '14/03/2026'}.`}
            </div>

            {/* Chữ ký số điện tử CA */}
            {document.chuKySo ? (
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs">
                <div></div>
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-300 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>ĐÃ KÝ SỐ ĐIỆN TỬ</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{document.chuKySo.nguoiKy}</div>
                  <div className="text-[10.5px] text-slate-600">{document.chuKySo.chucVu}</div>
                  <div className="text-[9.5px] text-slate-500 font-mono">
                    {document.chuKySo.thoiGianKy} • {document.chuKySo.loaiChungThu}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs">
                <div>
                  <div className="font-bold uppercase text-slate-600 text-[10.5px]">NGƯỜI SOẠN THẢO</div>
                  <div className="mt-6 font-bold text-slate-800">{document.nguoiSoan || 'Cán bộ thụ lý'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold uppercase text-slate-600 text-[10.5px]">YÊU CẦU XỬ LÝ</div>
                  <div className="mt-6">
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        document.yeuCauXuLy === 'ky_va_phe_duyet'
                          ? 'bg-purple-100 text-purple-800'
                          : document.yeuCauXuLy === 'phe_duyet'
                            ? 'bg-emerald-100 text-emerald-800'
                            : document.yeuCauXuLy === 'ky'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {document.yeuCauXuLy === 'ky_va_phe_duyet'
                        ? 'Yêu cầu Ký & Phê duyệt'
                        : document.yeuCauXuLy === 'phe_duyet'
                          ? 'Yêu cầu Phê duyệt'
                          : document.yeuCauXuLy === 'ky'
                            ? 'Yêu cầu Ký nháy'
                            : 'Tài liệu tham khảo'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
