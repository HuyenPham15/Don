import React, { useState, useEffect } from 'react';
import {
  QuyetDinhTraLaiInfo,
  ThongTinGuiQuyetDinh,
  PhuongThucGuiQuyetDinh,
  ChungTuGiaoNhan,
} from '../../types';

export interface GuiQuyetDinhModalProps {
  isOpen: boolean;
  onClose: () => void;
  quyetDinhInfo: QuyetDinhTraLaiInfo;
  donInfo: {
    code: string;
    nguoiNop: string;
    diaChi?: string;
    sdt?: string;
    email?: string;
  };
  currentOfficerName?: string;
  mode?: 'send' | 'resend' | 'bo_sung_chung_tu';
  onSaveDraft: (data: Partial<ThongTinGuiQuyetDinh>) => void;
  onConfirmSend: (data: ThongTinGuiQuyetDinh) => void;
}

export default function GuiQuyetDinhModal({
  isOpen,
  onClose,
  quyetDinhInfo,
  donInfo,
  currentOfficerName = 'Nguyễn Minh Anh',
  mode = 'send',
  onSaveDraft,
  onConfirmSend,
}: GuiQuyetDinhModalProps) {
  // Mode title & icon
  const isResend = mode === 'resend';
  const isBoSung = mode === 'bo_sung_chung_tu';

  // State: Thông tin người nhận (cho phép kiểm tra, cập nhật)
  const [nguoiNhan, setNguoiNhan] = useState<string>(donInfo.nguoiNop || '');
  const [diaChiNhan, setDiaChiNhan] = useState<string>(donInfo.diaChi || '');
  const [sdtNhan, setSdtNhan] = useState<string>(donInfo.sdt || '');
  const [emailNhan, setEmailNhan] = useState<string>(donInfo.email || 'congdan@govex.vn');
  const [hasChangedReceiver, setHasChangedReceiver] = useState<boolean>(false);

  // State: Phương thức gửi
  const [phuongThuc, setPhuongThuc] = useState<PhuongThucGuiQuyetDinh>('buu_chinh');

  // Chi tiết: Gửi trực tiếp
  const [nguoiGiao, setNguoiGiao] = useState<string>(currentOfficerName);
  const [ngayGiao, setNgayGiao] = useState<string>(
    new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [cccdNguoiNhan, setCccdNguoiNhan] = useState<string>('001088012345');
  const [xacNhanGiaoNhan, setXacNhanGiaoNhan] = useState<string>(
    'Đã ký nhận biên bản bàn giao và nhận đủ hồ sơ gốc tại bộ phận Tiếp công dân'
  );
  const [coKyNhanTrucTiep, setCoKyNhanTrucTiep] = useState<boolean>(true);

  // Chi tiết: Bưu chính
  const [donViVanChuyen, setDonViVanChuyen] = useState<string>('VNPost (Bưu điện Việt Nam)');
  const [maVanDon, setMaVanDon] = useState<string>('VN982348123VN');
  const [ngayGuiBuuChinh, setNgayGuiBuuChinh] = useState<string>(
    new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );

  // Chi tiết: Điện tử
  const [diaChiDienTu, setDiaChiDienTu] = useState<string>(emailNhan || 'congdan@govex.vn');
  const [simulatedError, setSimulatedError] = useState<boolean>(false);
  const [electronicErrorCode, setElectronicErrorCode] = useState<string>('');

  // Ghi chú & Đính kèm chứng từ
  const [ghiChu, setGhiChu] = useState<string>('');
  const [chungTuList, setChungTuList] = useState<ChungTuGiaoNhan[]>([
    {
      id: 'CT-01',
      name: 'Phieu_gui_chuyen_phat_nhanh_VNPost.pdf',
      size: '280 KB',
      uploadTime: 'Hôm nay 10:15',
      loaiChungTu: 'phieu_gui_buu_dien',
    },
  ]);

  // Trường hợp gửi lại
  const [lyDoGuiLai, setLyDoGuiLai] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNguoiNhan(donInfo.nguoiNop || '');
      setDiaChiNhan(donInfo.diaChi || '');
      setSdtNhan(donInfo.sdt || '');
      setEmailNhan(donInfo.email || 'congdan@govex.vn');
      setHasChangedReceiver(false);
      setErrors({});
      setShowConfirmDialog(false);
      setIsSubmitting(false);
      setSimulatedError(false);
      setElectronicErrorCode('');

      // If existing info exists
      if (quyetDinhInfo.thongTinGuiHienTai) {
        const curr = quyetDinhInfo.thongTinGuiHienTai;
        setPhuongThuc(curr.phuongThuc || 'buu_chinh');
        if (curr.maVanDon) setMaVanDon(curr.maVanDon);
        if (curr.donViVanChuyen) setDonViVanChuyen(curr.donViVanChuyen);
        if (curr.ghiChu) setGhiChu(curr.ghiChu);
        if (curr.chungTuList && curr.chungTuList.length > 0) {
          setChungTuList(curr.chungTuList);
        }
      }
    }
  }, [isOpen, donInfo, quyetDinhInfo]);

  if (!isOpen) return null;

  // Validate form
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!nguoiNhan.trim()) {
      errs.nguoiNhan = 'Vui lòng nhập họ tên người nhận quyết định.';
    }
    if (!diaChiNhan.trim()) {
      errs.diaChiNhan = 'Vui lòng nhập địa chỉ nhận của đương sự.';
    }

    if (phuongThuc === 'buu_chinh') {
      if (!maVanDon.trim()) {
        errs.maVanDon = 'Vui lòng nhập mã vận đơn bưu chính để theo dõi gửi.';
      }
      if (!donViVanChuyen.trim()) {
        errs.donViVanChuyen = 'Vui lòng chọn hoặc nhập đơn vị vận chuyển.';
      }
    }

    if (phuongThuc === 'truc_tiep') {
      if (!ngayGiao.trim()) {
        errs.ngayGiao = 'Vui lòng nhập ngày giao trực tiếp.';
      }
      if (!cccdNguoiNhan.trim()) {
        errs.cccdNguoiNhan = 'Vui lòng ghi nhận số CCCD/Định danh người nhận trực tiếp.';
      }
    }

    if (phuongThuc === 'dien_tu') {
      if (!diaChiDienTu.trim()) {
        errs.diaChiDienTu = 'Vui lòng nhập địa chỉ Email hoặc Cổng DVC nhận văn bản.';
      } else if (!diaChiDienTu.includes('@') && !diaChiDienTu.toLowerCase().includes('dvc')) {
        errs.diaChiDienTu = 'Địa chỉ gửi điện tử không hợp lệ.';
      }
    }

    if (isResend && !lyDoGuiLai.trim()) {
      errs.lyDoGuiLai = 'Bắt buộc nhập lý do gửi lại quyết định cho đương sự.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Click "Lưu thông tin gửi" (lưu nháp, trạng thái vẫn là Chờ gửi)
  const handleSaveDraftClick = () => {
    onSaveDraft({
      nguoiNhan,
      diaChiNhan,
      sdtNhan,
      emailNhan,
      phuongThuc,
      maVanDon: phuongThuc === 'buu_chinh' ? maVanDon : undefined,
      donViVanChuyen: phuongThuc === 'buu_chinh' ? donViVanChuyen : undefined,
      ngayGiao: phuongThuc === 'truc_tiep' ? ngayGiao : undefined,
      nguoiGiao: phuongThuc === 'truc_tiep' ? nguoiGiao : undefined,
      xacNhanGiaoNhan: phuongThuc === 'truc_tiep' ? xacNhanGiaoNhan : undefined,
      diaChiDienTu: phuongThuc === 'dien_tu' ? diaChiDienTu : undefined,
      ghiChu: ghiChu.trim(),
      chungTuList,
    });
    onClose();
  };

  // Click "Xác nhận gửi" -> Mở confirmation dialog
  const handleInitiateConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Check simulated error for electronic delivery
    if (phuongThuc === 'dien_tu' && simulatedError) {
      setElectronicErrorCode('ERR-SMTP-550: Hộp thư công dân từ chối nhận hoặc không tồn tại. Vui lòng kiểm tra lại địa chỉ hoặc thử lại.');
      return;
    }

    setShowConfirmDialog(true);
  };

  // Xác nhận lần cuối trong Confirmation Dialog
  const handleFinalConfirmSubmit = () => {
    setIsSubmitting(true);
    const timeNow = `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date().toLocaleDateString('vi-VN')}`;
    const nextLanGui = (quyetDinhInfo.lichSuGui?.length || 0) + 1;

    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmDialog(false);

      const isDirectReceived = phuongThuc === 'truc_tiep' && coKyNhanTrucTiep;

      const newRecord: ThongTinGuiQuyetDinh = {
        id: `SEND-${Date.now()}`,
        lanGui: nextLanGui,
        ngayGui: new Date().toLocaleDateString('vi-VN'),
        gioGui: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        nguoiThucHien: currentOfficerName,
        phuongThuc,
        trangThai: isDirectReceived ? 'da_giao_nhan' : 'da_gui',
        nguoiNhan: nguoiNhan.trim(),
        diaChiNhan: diaChiNhan.trim(),
        sdtNhan: sdtNhan.trim() || undefined,
        emailNhan: emailNhan.trim() || undefined,
        // Trực tiếp
        nguoiGiao: phuongThuc === 'truc_tiep' ? nguoiGiao : undefined,
        ngayGiao: phuongThuc === 'truc_tiep' ? ngayGiao : undefined,
        xacNhanGiaoNhan:
          phuongThuc === 'truc_tiep'
            ? `${xacNhanGiaoNhan} (CCCD: ${cccdNguoiNhan})`
            : undefined,
        // Bưu chính
        donViVanChuyen: phuongThuc === 'buu_chinh' ? donViVanChuyen : undefined,
        maVanDon: phuongThuc === 'buu_chinh' ? maVanDon.trim() : undefined,
        ngayGuiBuuChinh: phuongThuc === 'buu_chinh' ? ngayGuiBuuChinh : undefined,
        // Điện tử
        diaChiDienTu: phuongThuc === 'dien_tu' ? diaChiDienTu.trim() : undefined,
        thoiDiemGuiDienTu: phuongThuc === 'dien_tu' ? timeNow : undefined,
        maPhanHoiDienTu: phuongThuc === 'dien_tu' ? `DVC-ACK-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
        trangThaiGuiDienTu: phuongThuc === 'dien_tu' ? 'thanh_cong' : undefined,
        // Ghi chú & Chứng từ
        ghiChu: ghiChu.trim() || undefined,
        chungTuList,
        lyDoGuiLai: isResend ? lyDoGuiLai.trim() : undefined,
        ketQuaGui: isDirectReceived
          ? 'Đã bàn giao và ký nhận trực tiếp tại cơ quan'
          : phuongThuc === 'buu_chinh'
            ? `Đã giao bưu cục ${donViVanChuyen} (Mã VĐ: ${maVanDon})`
            : `Đã phát điện tử thành công tới ${diaChiDienTu}`,
        thoiDiemNhanThanhCong: isDirectReceived ? timeNow : undefined,
        nguoiKyNhan: isDirectReceived ? nguoiNhan : undefined,
      };

      onConfirmSend(newRecord);
      onClose();
    }, 450);
  };

  // Upload giả lập chứng từ
  const handleAddChungTu = () => {
    const fileId = `CT-${Date.now().toString().slice(-4)}`;
    const newDoc: ChungTuGiaoNhan = {
      id: fileId,
      name: `Chung_tu_giao_nhan_${fileId}.pdf`,
      size: `${Math.floor(150 + Math.random() * 300)} KB`,
      uploadTime: 'Vừa xong',
      loaiChungTu: phuongThuc === 'truc_tiep' ? 'bien_ban_ban_giao' : 'phieu_gui_buu_dien',
    };
    setChungTuList((prev) => [newDoc, ...prev]);
  };

  const handleRemoveChungTu = (id: string) => {
    setChungTuList((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-body-md select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-white px-6 py-4 border-b border-blue-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {isResend ? 'replay' : isBoSung ? 'attach_file' : 'mark_email_read'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight">
                  {isResend
                    ? 'Gửi lại quyết định trả lại đơn cho đương sự'
                    : isBoSung
                      ? 'Bổ sung chứng từ giao nhận quyết định'
                      : 'Gửi quyết định trả lại đơn cho đương sự'}
                </h2>
                {/* <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  <span className="material-symbols-outlined text-[13px]">schedule_send</span>
                  <span>Bước 3: Chờ gửi cho đương sự</span>
                </span> */}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hồ sơ: <strong className="text-slate-800 font-mono">{donInfo.code}</strong> • Người nộp: <strong className="text-slate-800">{donInfo.nguoiNop}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
            title="Đóng modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ===================== BODY (SCROLLABLE) ===================== */}
        <form onSubmit={handleInitiateConfirm} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Cảnh báo nếu đang gửi lại */}
          {isResend && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                <span>Thực hiện gửi lại quyết định (Lần gửi thứ {(quyetDinhInfo.lichSuGui?.length || 0) + 1})</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Hệ thống lưu giữ đầy đủ lịch sử các lần gửi trước. Vui lòng ghi rõ lý do cần gửi lại văn bản cho công dân.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  Lý do gửi lại <span className="text-rose-600">*</span>:
                </label>
                <textarea
                  rows={2}
                  value={lyDoGuiLai}
                  onChange={(e) => setLyDoGuiLai(e.target.value)}
                  placeholder="Ví dụ: Bưu điện hoàn trả do sai thông tin số nhà; công dân đổi địa chỉ tạm trú; cần gửi lại bảo đảm..."
                  className={`w-full px-3 py-2 bg-white rounded-lg border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-200 ${errors.lyDoGuiLai ? 'border-rose-500' : 'border-amber-300'}`}
                />
                {errors.lyDoGuiLai && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.lyDoGuiLai}</p>
                )}
              </div>
            </div>
          )}


          {/* NHÓM B: THÔNG TIN NGƯỜI NHẬN */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-indigo-600">person_pin</span>
                <span>B. Thông tin đương sự nhận quyết định</span>
              </span>
              {hasChangedReceiver && (
                <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Đã cập nhật thông tin nhận
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Họ tên người nhận <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  value={nguoiNhan}
                  onChange={(e) => {
                    setNguoiNhan(e.target.value);
                    setHasChangedReceiver(true);
                  }}
                  placeholder="Nhập họ tên đương sự"
                  className={`w-full px-3 py-2 rounded-xl border bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#004ac6] ${errors.nguoiNhan ? 'border-rose-500 ring-1 ring-rose-200' : 'border-slate-200'}`}
                />
                {errors.nguoiNhan && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.nguoiNhan}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Số điện thoại liên hệ:
                </label>
                <input
                  type="text"
                  value={sdtNhan}
                  onChange={(e) => {
                    setSdtNhan(e.target.value);
                    setHasChangedReceiver(true);
                  }}
                  placeholder="Số điện thoại công dân"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Địa chỉ nhận kết quả / văn bản <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  value={diaChiNhan}
                  onChange={(e) => {
                    setDiaChiNhan(e.target.value);
                    setHasChangedReceiver(true);
                  }}
                  placeholder="Địa chỉ số nhà, ngõ ngách, phường/xã, quận/huyện nhận bưu gửi"
                  className={`w-full px-3 py-2 rounded-xl border bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:border-[#004ac6] ${errors.diaChiNhan ? 'border-rose-500 ring-1 ring-rose-200' : 'border-slate-200'}`}
                />
                {errors.diaChiNhan && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.diaChiNhan}</p>
                )}
              </div>
            </div>
          </div>

          {/* NHÓM C: PHƯƠNG THỨC GỬI VÀ THÔNG TIN CHI TIẾT */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-emerald-600">local_shipping</span>
              <span>C. Lựa chọn phương thức gửi văn bản</span>
            </span>

            {/* Selector 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Gửi qua Bưu chính */}
              <button
                type="button"
                onClick={() => setPhuongThuc('buu_chinh')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${phuongThuc === 'buu_chinh'
                  ? 'border-[#004ac6] bg-blue-50/70 ring-2 ring-blue-600/20 text-[#004ac6]'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-[22px]">local_post_office</span>
                  {phuongThuc === 'buu_chinh' && (
                    <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Qua dịch vụ bưu chính</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Chuyển phát qua VNPost/ViettelPost có mã vận đơn</div>
                </div>
              </button>

              {/* 2. Giao trực tiếp */}
              <button
                type="button"
                onClick={() => setPhuongThuc('truc_tiep')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${phuongThuc === 'truc_tiep'
                  ? 'border-[#004ac6] bg-blue-50/70 ring-2 ring-blue-600/20 text-[#004ac6]'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                  {phuongThuc === 'truc_tiep' && (
                    <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Giao trực tiếp tại trụ sở</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Đương sự ký nhận biên bản bàn giao tại bộ phận tiếp dân</div>
                </div>
              </button>

              {/* 3. Gửi điện tử */}
              <button
                type="button"
                onClick={() => setPhuongThuc('dien_tu')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${phuongThuc === 'dien_tu'
                  ? 'border-[#004ac6] bg-blue-50/70 ring-2 ring-blue-600/20 text-[#004ac6]'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
                  {phuongThuc === 'dien_tu' && (
                    <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Gửi điện tử (DVC / Email)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Phát hành qua Cổng Dịch vụ công hoặc Email xác thực</div>
                </div>
              </button>
            </div>

            {phuongThuc === 'truc_tiep' && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fade-in">
                <div className="text-xs font-bold text-slate-800">Thông tin biên bản giao nhận trực tiếp</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Cán bộ thực hiện giao:
                    </label>
                    <input
                      type="text"
                      value={nguoiGiao}
                      onChange={(e) => setNguoiGiao(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Ngày giao trực tiếp <span className="text-rose-600">*</span>:
                    </label>
                    <input
                      type="text"
                      value={ngayGiao}
                      onChange={(e) => setNgayGiao(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Số CCCD/Định danh người nhận <span className="text-rose-600">*</span>:
                    </label>
                    <input
                      type="text"
                      value={cccdNguoiNhan}
                      onChange={(e) => setCccdNguoiNhan(e.target.value)}
                      placeholder="Nhập số CCCD"
                      className={`w-full px-3 py-2 bg-white rounded-xl border text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#004ac6] ${errors.cccdNguoiNhan ? 'border-rose-500' : 'border-slate-300'}`}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Thông tin xác nhận giao nhận:
                    </label>
                    <input
                      type="text"
                      value={xacNhanGiaoNhan}
                      onChange={(e) => setXacNhanGiaoNhan(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chkKyNhan"
                      checked={coKyNhanTrucTiep}
                      onChange={(e) => setCoKyNhanTrucTiep(e.target.checked)}
                      className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                    />
                    <label htmlFor="chkKyNhan" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Đương sự đã trực tiếp ký nhận vào biên bản bàn giao (Chuyển ngay sang trạng thái &quot;Đã giao/Đã nhận&quot;)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Chi tiết theo phương thức: Điện tử */}
            {phuongThuc === 'dien_tu' && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fade-in">
                <div className="text-xs font-bold text-slate-800">Cấu hình gửi qua Cổng Dịch vụ công / Thư điện tử</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Địa chỉ nhận điện tử (Email / Tài khoản DVC) <span className="text-rose-600">*</span>:
                    </label>
                    <input
                      type="text"
                      value={diaChiDienTu}
                      onChange={(e) => {
                        setDiaChiDienTu(e.target.value);
                        setElectronicErrorCode('');
                      }}
                      placeholder="VD: congdan@govex.vn hoặc Mã tài khoản DVC"
                      className={`w-full px-3 py-2 bg-white rounded-xl border text-xs text-slate-900 focus:outline-none focus:border-[#004ac6] ${errors.diaChiDienTu ? 'border-rose-500' : 'border-slate-300'}`}
                    />
                    {errors.diaChiDienTu && (
                      <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.diaChiDienTu}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Thời điểm phát hành:
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Ngay khi cán bộ bấm xác nhận gửi"
                      className="w-full px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium"
                    />
                  </div>
                </div>

                {/* Mô phỏng tình huống ngoại lệ kiểm thử lỗi */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chkErrorSim"
                      checked={simulatedError}
                      onChange={(e) => setSimulatedError(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 cursor-pointer"
                    />
                    <label htmlFor="chkErrorSim" className="text-[11px] text-slate-600 cursor-pointer">
                      Mô phỏng tình huống gửi điện tử thất bại (kiểm tra ngoại lệ nghiệp vụ)
                    </label>
                  </div>
                </div>

                {electronicErrorCode && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[17px] text-rose-600 shrink-0">error</span>
                    <div>
                      <div className="font-bold">Gửi điện tử không thành công:</div>
                      <div className="text-[11px] mt-0.5">{electronicErrorCode}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NHÓM D: GHI CHÚ VÀ CHỨNG TỪ GIAO NHẬN */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-purple-600">attach_file</span>
              <span>D. Ghi chú &amp; Chứng từ giao nhận</span>
            </span>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Ghi chú gửi (không bắt buộc):
              </label>
              <textarea
                rows={2}
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Ghi chú thêm về việc giao gửi, hẹn thời gian kiểm tra lại..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 focus:outline-none focus:border-[#004ac6]"
              />
            </div>
          </div>
        </form>

        {/* ===================== FOOTER BUTTONS ===================== */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2.5">
            {/* Nút "Lưu thông tin gửi": Lưu nhưng chưa xác nhận hoàn tất -> Vẫn ở Bước 3 */}
            <button
              type="button"
              onClick={handleSaveDraftClick}
              className="px-4 py-2 rounded-xl border border-blue-300 bg-white hover:bg-blue-50 text-[#004ac6] text-xs font-bold cursor-pointer transition shadow-2xs flex items-center gap-1.5"
              title="Lưu thông tin đã khai báo nhưng chưa xác nhận gửi đi (Trạng thái vẫn là Chờ gửi)"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu thông tin gửi</span>
            </button>

            {/* Nút "Xác nhận gửi": Mở hộp thoại xác nhận rồi mới hoàn tất */}
            <button
              type="button"
              onClick={handleInitiateConfirm}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">send</span>
              <span>{isResend ? 'Xác nhận gửi lại ➔' : 'Xác nhận gửi ➔'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== CONFIRMATION DIALOG (YÊU CẦU 2.4) ===================== */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#004ac6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận gửi quyết định cho đương sự</h3>
                <p className="text-xs text-slate-500">
                  Vui lòng kiểm tra kỹ các thông tin trước khi hoàn tất ghi nhận gửi
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Văn bản:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {quyetDinhInfo.soQuyetDinh || '28/TL-TCD'} ({quyetDinhInfo.ngayBanHanh || '16/09/2026'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người ký:</span>
                <span className="font-semibold text-slate-800">{quyetDinhInfo.nguoiKy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người nhận:</span>
                <strong className="text-slate-900 font-bold">{nguoiNhan}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ nhận:</span>
                <span className="text-right max-w-[240px] text-slate-800 font-medium">{diaChiNhan}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Phương thức gửi:</span>
                <span className="font-bold text-[#004ac6]">
                  {phuongThuc === 'buu_chinh'
                    ? `Bưu chính (${donViVanChuyen} - Mã VĐ: ${maVanDon})`
                    : phuongThuc === 'truc_tiep'
                      ? 'Giao trực tiếp tại trụ sở'
                      : `Điện tử (${diaChiDienTu})`}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sau khi xác nhận, trạng thái gửi của quyết định sẽ được chuyển sang <strong>&quot;Đã gửi cho đương sự&quot;</strong> và ghi vào dòng thời gian hồ sơ.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Quay lại sửa
              </button>
              <button
                type="button"
                onClick={handleFinalConfirmSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang hoàn tất...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Đồng ý gửi đi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
