import React from 'react';
import { QuyetDinhTraLaiInfo, ThongTinGuiQuyetDinh } from '../../types';

export interface LichSuGuiModalProps {
  isOpen: boolean;
  onClose: () => void;
  quyetDinhInfo: QuyetDinhTraLaiInfo;
  donCode: string;
  onOpenResend?: () => void;
  onOpenBoSungChungTu?: () => void;
}

export default function LichSuGuiModal({
  isOpen,
  onClose,
  quyetDinhInfo,
  donCode,
  onOpenResend,
  onOpenBoSungChungTu,
}: LichSuGuiModalProps) {
  if (!isOpen) return null;

  const lichSuList: ThongTinGuiQuyetDinh[] =
    quyetDinhInfo.lichSuGui && quyetDinhInfo.lichSuGui.length > 0
      ? quyetDinhInfo.lichSuGui
      : quyetDinhInfo.thongTinGuiHienTai
        ? [quyetDinhInfo.thongTinGuiHienTai]
        : [];

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'buu_chinh':
        return {
          label: 'Bưu chính',
          icon: 'local_post_office',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'truc_tiep':
        return {
          label: 'Trực tiếp tại trụ sở',
          icon: 'how_to_reg',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'dien_tu':
        return {
          label: 'Điện tử (DVC/Email)',
          icon: 'forward_to_inbox',
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      default:
        return {
          label: method,
          icon: 'send',
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'da_giao_nhan':
        return {
          label: 'Đã giao / Đã nhận',
          icon: 'verified',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
      case 'da_gui':
        return {
          label: 'Đã gửi cho đương sự',
          icon: 'mark_email_read',
          className: 'bg-sky-50 text-sky-800 border-sky-300',
        };
      case 'gui_that_bai':
        return {
          label: 'Gửi thất bại / Hoàn trả',
          icon: 'error',
          className: 'bg-rose-50 text-rose-800 border-rose-300',
        };
      case 'cho_gui':
      default:
        return {
          label: 'Chờ gửi cho đương sự',
          icon: 'schedule_send',
          className: 'bg-amber-50 text-amber-800 border-amber-300',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-body-md select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-headline-md">
                  Lịch sử &amp; Chi tiết gửi quyết định cho đương sự
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {lichSuList.length} lần gửi
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hồ sơ đơn: <strong className="text-slate-800 font-mono">{donCode}</strong> • Quyết định: <strong className="text-slate-800 font-mono">{quyetDinhInfo.soQuyetDinh}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {lichSuList.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">schedule_send</span>
              <div className="font-bold text-slate-800 text-sm">Chưa có lượt gửi nào được ghi nhận</div>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Quyết định trả lại đơn số <strong>{quyetDinhInfo.soQuyetDinh}</strong> đang ở trạng thái <strong>Bước 3: Chờ gửi cho đương sự</strong>. Cán bộ nhấn nút &quot;Gửi cho đương sự&quot; để thực hiện.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lichSuList.map((item, idx) => {
                const methodBadge = getMethodBadge(item.phuongThuc);
                const statusBadge = getStatusBadge(item.trangThai);
                const isLatest = idx === 0;

                return (
                  <div
                    key={item.id || idx}
                    className={`border rounded-2xl p-4.5 space-y-3 transition-all ${
                      isLatest
                        ? 'border-blue-200 bg-blue-50/20 shadow-xs ring-1 ring-blue-100'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Header item */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                          {item.lanGui || lichSuList.length - idx}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          Lần gửi thứ {item.lanGui || lichSuList.length - idx}
                          {isLatest && (
                            <span className="ml-2 text-[10px] font-bold text-[#004ac6] bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                              Mới nhất
                            </span>
                          )}
                        </h4>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {item.gioGui ? `${item.gioGui} ngày ` : ''}{item.ngayGui}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${methodBadge.className}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">{methodBadge.icon}</span>
                          <span>{methodBadge.label}</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.className}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">{statusBadge.icon}</span>
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Chi tiết người nhận & địa chỉ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Người nhận tại thời điểm gửi:</span>
                        <span className="font-bold text-slate-900">{item.nguoiNhan}</span>
                        {item.sdtNhan && <span className="text-slate-500 ml-1">({item.sdtNhan})</span>}
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Địa chỉ chuyển phát / giao nhận:</span>
                        <span className="font-medium text-slate-800">{item.diaChiNhan}</span>
                      </div>

                      {/* Chi tiết theo phương thức */}
                      {item.phuongThuc === 'buu_chinh' && (
                        <>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Đơn vị vận chuyển:</span>
                            <span className="font-semibold text-slate-800">{item.donViVanChuyen || 'VNPost'}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Mã vận đơn bưu chính:</span>
                            <span className="font-bold text-blue-700 font-mono text-[13px]">
                              {item.maVanDon || 'Chưa cập nhật'}
                            </span>
                          </div>
                        </>
                      )}

                      {item.phuongThuc === 'truc_tiep' && (
                        <>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Cán bộ giao:</span>
                            <span className="font-semibold text-slate-800">{item.nguoiGiao || item.nguoiThucHien}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Xác nhận giao nhận:</span>
                            <span className="font-medium text-slate-800">{item.xacNhanGiaoNhan || 'Có ký nhận biên bản'}</span>
                          </div>
                        </>
                      )}

                      {item.phuongThuc === 'dien_tu' && (
                        <>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Hộp thư / Cổng DVC:</span>
                            <span className="font-semibold text-slate-800">{item.diaChiDienTu}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Mã phản hồi hệ thống:</span>
                            <span className="font-mono font-bold text-purple-700">{item.maPhanHoiDienTu || 'ACK-SUCCESS'}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Lý do gửi lại nếu có */}
                    {item.lyDoGuiLai && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <span className="font-bold">Lý do gửi lại:</span> {item.lyDoGuiLai}
                      </div>
                    )}

                    {/* Ghi chú */}
                    {item.ghiChu && (
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Ghi chú:</span> {item.ghiChu}
                      </div>
                    )}

                    {/* Chứng từ đính kèm */}
                    {item.chungTuList && item.chungTuList.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 block">
                          Chứng từ giao nhận kèm theo ({item.chungTuList.length} tệp):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {item.chungTuList.map((ct) => (
                            <span
                              key={ct.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                            >
                              <span className="material-symbols-outlined text-[15px] text-blue-600">receipt_long</span>
                              <span>{ct.name}</span>
                              <span className="text-[10px] text-slate-400">({ct.size})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Cán bộ thực hiện ghi nhận: <strong>{item.nguoiThucHien}</strong></span>
                      {item.ketQuaGui && <span className="text-slate-600 italic">{item.ketQuaGui}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {onOpenBoSungChungTu && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBoSungChungTu();
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">attach_file</span>
                <span>Bổ sung chứng từ</span>
              </button>
            )}

            {onOpenResend && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenResend();
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>Thực hiện gửi lại</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
