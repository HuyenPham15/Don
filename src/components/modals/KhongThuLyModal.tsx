import React, { useState } from 'react';

export interface KhongThuLyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    soKyHieu: string;
    ngayBanHanh: string;
    lyDoChinh: string;
    lyDoChiTiet: string;
    canCuPhapLy: string;
    nguoiNhan: string;
    nguoiKy: string;
    action?: 'save' | 'trinh_ky';
  }) => void;
  donInfo?: {
    code?: string;
    luotNhanId?: string;
    nguoiNop?: string;
    cccd?: string;
    sdt?: string;
    diaChi?: string;
    loaiDon?: string;
    noiDung?: string;
    ngayNhan?: string;
  };
}

const LY_DO_KHONG_THU_LY = [
  {
    id: 'khong_ro_danh_tinh',
    label: '1. Không rõ họ tên, địa chỉ người tố cáo / Sử dụng tên người khác',
    canCu: 'Khoản 2 Điều 29 & Điều 25 Luật Tố cáo 2018',
    chiTiet:
      'Đơn tố cáo không ghi rõ họ tên, địa chỉ của người tố cáo; qua đối soát CSDL dân cư và xác minh ban đầu không xác định được nhân thân người tố cáo, hoặc có hành vi mạo danh người khác để nộp đơn.',
  },
  {
    id: 'da_giai_quyet_khong_tinh_tiet_moi',
    label: '2. Vụ việc đã được cơ quan có thẩm quyền giải quyết đúng pháp luật, không có tình tiết mới',
    canCu: 'Điểm b Khoản 2 Điều 29 Luật Tố cáo 2018',
    chiTiet:
      'Nội dung tố cáo đã được cơ quan có thẩm quyền giải quyết đúng pháp luật, có Kết luận nội dung tố cáo đã có hiệu lực thi hành; người tố cáo không cung cấp được chứng cứ hay tình tiết mới làm thay đổi bản chất vụ việc.',
  },
  {
    id: 'khong_co_co_so_chung_cu',
    label: '3. Nội dung tố cáo không có cơ sở, không có tài liệu chứng minh hành vi vi phạm',
    canCu: 'Khoản 1 Điều 29 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    chiTiet:
      'Người tố cáo không cung cấp được thông tin, tài liệu chứng minh về hành vi vi phạm pháp luật của đối tượng bị tố cáo; qua xác minh ban đầu cơ quan nhận đơn thấy không có dấu hiệu vi phạm pháp luật cần thụ lý.',
  },
  {
    id: 'het_thoi_hieu',
    label: '4. Đã hết thời hiệu giải quyết hoặc thuộc trường hợp đình chỉ theo luật',
    canCu: 'Điều 30, Điều 33 Luật Tố cáo 2018',
    chiTiet:
      'Hành vi bị tố cáo đã hết thời hiệu xử lý theo quy định của pháp luật hoặc người tố cáo có văn bản tự nguyện rút toàn bộ đơn tố cáo và vụ việc không có dấu hiệu gây thiệt hại đến lợi ích Nhà nước, quyền lợi hợp pháp của công dân.',
  },
  {
    id: 'ly_do_khac',
    label: '5. Lý do khác (Tự nhập lý do cụ thể)',
    canCu: 'Quy định pháp luật hiện hành',
    chiTiet: '',
  },
];

export default function KhongThuLyModal({
  isOpen,
  onClose,
  onSubmit,
  donInfo = {
    code: 'Đ-2026-00125',
    luotNhanId: 'LN-2026-0819',
    nguoiNop: 'Nguyễn Văn A',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Cầu Giấy, Hà Nội',
    loaiDon: 'Đơn tố cáo',
    noiDung: 'Tố cáo hành vi vi phạm pháp luật nhưng không có tài liệu chứng cứ chứng minh.',
    ngayNhan: '16/09/2026',
  },
}: KhongThuLyModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [selectedReasonId, setSelectedReasonId] = useState<string>('da_giai_quyet_khong_tinh_tiet_moi');
  const [soKyHieu, setSoKyHieu] = useState<string>(`TB-KTL/${new Date().getFullYear()}/TB-UBND`);
  const [ngayBanHanh, setNgayBanHanh] = useState<string>(
    new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [nguoiKy, setNguoiKy] = useState<string>('Trần Văn Cường (Phó Chủ tịch UBND)');
  const [customDetail, setCustomDetail] = useState<string>('');
  const [customLyDoKhac, setCustomLyDoKhac] = useState<string>('');
  const [customCanCu, setCustomCanCu] = useState<string>('Quy định pháp luật hiện hành');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentReason = LY_DO_KHONG_THU_LY.find((r) => r.id === selectedReasonId) || LY_DO_KHONG_THU_LY[0];
  const isKhac = selectedReasonId === 'ly_do_khac';
  const finalChiTiet = isKhac ? customLyDoKhac : (customDetail || currentReason.chiTiet);
  const finalCanCu = isKhac ? (customCanCu.trim() || 'Quy định pháp luật hiện hành') : currentReason.canCu;
  const finalLyDoChinh = isKhac
    ? (customLyDoKhac.trim()
        ? `Lý do khác: ${customLyDoKhac.trim().slice(0, 60)}${customLyDoKhac.trim().length > 60 ? '...' : ''}`
        : 'Lý do khác')
    : currentReason.label;

  const handleConfirmSubmit = (action: 'save' | 'trinh_ky' = 'save') => {
    if (isKhac && !customLyDoKhac.trim()) {
      setErrorMsg('Vui lòng nhập lý do không thụ lý giải quyết đơn.');
      setActiveTab('form');
      return;
    }

    onSubmit({
      soKyHieu,
      ngayBanHanh,
      lyDoChinh: finalLyDoChinh,
      lyDoChiTiet: finalChiTiet,
      canCuPhapLy: finalCanCu,
      nguoiNhan: donInfo.nguoiNop || 'Công dân nộp đơn',
      nguoiKy,
      action,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-body-md">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-rose-50 via-slate-50 to-white px-6 py-3.5 border-b border-rose-100 flex items-center justify-between gap-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-200 shrink-0">
              <span className="material-symbols-outlined text-[24px]">block</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {donInfo.code && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    {donInfo.code}
                  </span>
                )}
                {donInfo.nguoiNop && (
                  <span className="text-xs text-slate-500">
                    Người nộp: <strong className="text-slate-800">{donInfo.nguoiNop}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Thông báo không thụ lý giải quyết đơn
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Tab switcher: Biểu mẫu vs Xem trước bản in */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">edit_document</span>
                <span>Biểu mẫu</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-white text-rose-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>Xem trước bản in</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'form' ? (
            <>
              {/* THÔNG TIN VĂN BẢN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số ký hiệu thông báo:
                  </label>
                  <input
                    type="text"
                    value={soKyHieu}
                    onChange={(e) => setSoKyHieu(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500 shadow-2xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ngày ban hành:
                  </label>
                  <input
                    type="text"
                    value={ngayBanHanh}
                    onChange={(e) => setNgayBanHanh(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500 shadow-2xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Người ký / Chức vụ:
                  </label>
                  <input
                    type="text"
                    value={nguoiKy}
                    onChange={(e) => setNguoiKy(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500 shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* LÝ DO KHÔNG THỤ LÝ LUẬT ĐỊNH DẠNG DROPDOWN */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-rose-600 text-[18px]">gavel</span>
                    <span>Chọn căn cứ &amp; Lý do không thụ lý (Theo Điều 29 Luật Tố cáo 2018):</span>
                  </label>

                  <div className="relative">
                    <select
                      value={selectedReasonId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedReasonId(newId);
                        setErrorMsg('');
                        const matched = LY_DO_KHONG_THU_LY.find((item) => item.id === newId);
                        if (matched && newId !== 'ly_do_khac') {
                          setCustomDetail(matched.chiTiet);
                        }
                      }}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white hover:bg-slate-50/80 border-2 border-slate-200 focus:border-rose-500 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-100 shadow-2xs cursor-pointer transition-all appearance-none"
                    >
                      {LY_DO_KHONG_THU_LY.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* NẾU CHỌN LÝ DO KHÁC: HIỂN THỊ TEXTAREA NHẬP LÝ DO */}
                {isKhac ? (
                  <div className="space-y-2.5 animate-fade-in p-4 rounded-xl border-2 border-rose-300 bg-rose-50/50 shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-rose-600 text-[18px]">edit_note</span>
                          <span>Nhập lý do không thụ lý:</span>
                          <span className="text-rose-600 font-bold">*</span>
                        </label>
                        <span className="text-[11px] font-normal text-slate-400">
                          {customLyDoKhac.length} ký tự
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={customLyDoKhac}
                        onChange={(e) => {
                          setCustomLyDoKhac(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="Nhập cụ thể lý do không thụ lý giải quyết đơn..."
                        className={`w-full p-3 bg-white border-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-2xs transition-all leading-relaxed ${
                          errorMsg
                            ? 'border-rose-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                            : 'border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        }`}
                        autoFocus
                      />
                      {errorMsg && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          <span>{errorMsg}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        * Nội dung lý do này sẽ được trích dẫn trực tiếp vào văn bản Thông báo không thụ lý gửi công dân và trình Lãnh đạo.
                      </p>
                    </div>

                    <div className="pt-1 border-t border-rose-200/60">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <span>Căn cứ pháp lý áp dụng (tùy chỉnh):</span>
                      </label>
                      <input
                        type="text"
                        value={customCanCu}
                        onChange={(e) => setCustomCanCu(e.target.value)}
                        placeholder="Ví dụ: Quy định pháp luật liên quan, Nghị định..."
                        className="w-full px-3 py-2 bg-white border border-rose-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 rounded-lg text-xs text-slate-800 focus:outline-none shadow-2xs font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  /* NẾU CHỌN CĂN CỨ LUẬT ĐỊNH (1-4): HIỂN THỊ CĂN CỨ VÀ NỘI DUNG */
                  <div className="p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/50 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-rose-600 text-[16px]">verified</span>
                        <span>Căn cứ pháp lý:</span>
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        {currentReason.canCu}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      {finalChiTiet}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* PREVIEW THÔNG BÁO KHÔNG THỤ LÝ CHUẨN MẪU */
            <div className="bg-slate-100 p-4 rounded-xl flex justify-center">
              <div className="bg-white border border-slate-300 shadow-md p-8 rounded-lg max-w-2xl w-full text-xs text-slate-800 space-y-4 font-serif leading-relaxed">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3 font-sans">
                  <div className="text-center font-bold">
                    <p className="uppercase text-[11px]">ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY</p>
                    <p className="text-[10px] text-slate-600">Số: {soKyHieu}</p>
                  </div>
                  <div className="text-center font-bold">
                    <p className="uppercase text-[11px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-[10px] underline">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[10px] font-normal italic mt-1">Hà Nội, ngày {ngayBanHanh}</p>
                  </div>
                </div>

                <div className="text-center py-2 space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 font-sans">
                    THÔNG BÁO
                  </h3>
                  <h4 className="text-xs font-semibold uppercase text-slate-800">
                    Về việc không thụ lý giải quyết tố cáo
                  </h4>
                  <p className="text-[11px] italic font-sans">
                    Kính gửi: Ông/Bà <strong>{donInfo.nguoiNop}</strong> (Địa chỉ: {donInfo.diaChi})
                  </p>
                </div>

                <div className="space-y-2.5 text-justify">
                  <p>
                    Ngày {donInfo.ngayNhan}, Ủy ban nhân dân quận tiếp nhận đơn của Ông/Bà mang mã hồ sơ <strong>{donInfo.code}</strong>.
                    Nội dung đơn: <em>"{donInfo.noiDung}"</em>.
                  </p>
                  <p>
                    Sau khi kiểm tra điều kiện thụ lý tố cáo theo quy định tại Điều 24 và Điều 29 Luật Tố cáo năm 2018, Ủy ban nhân dân quận nhận thấy:
                  </p>
                  <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg font-sans text-[11.5px] text-rose-950 font-medium whitespace-pre-wrap">
                    {finalChiTiet || (isKhac ? '(Chưa nhập chi tiết lý do không thụ lý)' : currentReason.chiTiet)}
                  </div>
                  <p>
                    Căn cứ <strong>{finalCanCu}</strong>, Ủy ban nhân dân quận thông báo: <strong>Không thụ lý giải quyết nội dung tố cáo nêu trên</strong>.
                  </p>
                  <p>
                    Ủy ban nhân dân quận thông báo để Ông/Bà được biết và thực hiện theo đúng quy định của pháp luật./.
                  </p>
                </div>

                <div className="pt-6 flex justify-between items-start font-sans">
                  <div className="text-[10px] text-slate-500">
                    <p className="font-bold">Nơi nhận:</p>
                    <p>- Như trên;</p>
                    <p>- Chủ tịch UBND quận (để b/c);</p>
                    <p>- Lưu: VT, Hồ sơ đơn {donInfo.code}.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold uppercase">TM. ỦY BAN NHÂN DÂN</p>
                    <p className="text-[10px] italic">KT. CHỦ TỊCH - PHÓ CHỦ TỊCH</p>
                    <div className="h-12 flex items-center justify-center text-rose-700 italic text-[11px]">
                      [Đã ký số điện tử]
                    </div>
                    <p className="text-xs font-bold">{nguoiKy}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'form' ? 'preview' : 'form')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">
                {activeTab === 'form' ? 'visibility' : 'edit_note'}
              </span>
              <span>{activeTab === 'form' ? 'Xem trước bản in' : 'Quay lại biểu mẫu'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleConfirmSubmit('save')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
              title="Lưu văn bản vào tab Hồ sơ & Văn bản (Trạng thái: Bản nháp)"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">save</span>
              <span>Lưu văn bản</span>
            </button>

            <button
              type="button"
              onClick={() => handleConfirmSubmit('trinh_ky')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-rose-200 cursor-pointer transition"
              title="Lưu văn bản và chuyển sang luồng trình ký Lãnh đạo phê duyệt"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Trình ký Lãnh đạo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
