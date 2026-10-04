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

  if (!isOpen) return null;

  const currentReason = LY_DO_KHONG_THU_LY.find((r) => r.id === selectedReasonId) || LY_DO_KHONG_THU_LY[0];
  const finalChiTiet = customDetail || currentReason.chiTiet;

  const handleConfirmSubmit = () => {
    onSubmit({
      soKyHieu,
      ngayBanHanh,
      lyDoChinh: currentReason.label,
      lyDoChiTiet: finalChiTiet,
      canCuPhapLy: currentReason.canCu,
      nguoiNhan: donInfo.nguoiNop || 'Công dân nộp đơn',
      nguoiKy,
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                  Hướng giải quyết: Không thụ lý
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Căn cứ Điều 29 Luật Tố cáo 2018
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Ban hành Thông báo không thụ lý giải quyết đơn
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'form' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Biểu mẫu &amp; Căn cứ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Xem trước Thông báo
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
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
              {/* TÓM TẮT HỒ SƠ ĐƠN */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Mã đơn / Lượt nhận:</span>
                  <span className="font-bold text-slate-800 font-mono">{donInfo.code} ({donInfo.luotNhanId})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Người nộp đơn:</span>
                  <span className="font-bold text-slate-800">{donInfo.nguoiNop}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Loại đơn:</span>
                  <span className="font-semibold text-rose-700">{donInfo.loaiDon || 'Đơn tố cáo'}</span>
                </div>
                <div className="sm:col-span-3 pt-1 border-t border-slate-200/80">
                  <span className="text-slate-400 block text-[10.5px]">Nội dung đơn tóm tắt:</span>
                  <span className="text-slate-700 italic">"{donInfo.noiDung}"</span>
                </div>
              </div>

              {/* LÝ DO KHÔNG THỤ LÝ LUẬT ĐỊNH */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-rose-600 text-[18px]">gavel</span>
                  <span>Chọn căn cứ &amp; Lý do không thụ lý (Theo Điều 29 Luật Tố cáo 2018):</span>
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {LY_DO_KHONG_THU_LY.map((item) => (
                    <label
                      key={item.id}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        selectedReasonId === item.id
                          ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="khong_thu_ly_reason"
                        value={item.id}
                        checked={selectedReasonId === item.id}
                        onChange={() => {
                          setSelectedReasonId(item.id);
                          setCustomDetail(item.chiTiet);
                        }}
                        className="mt-1 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer shrink-0"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{item.label}</span>
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                            {item.canCu}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{item.chiTiet}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* CHI TIẾT NỘI DUNG VĂN BẢN THÔNG BÁO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Số ký hiệu văn bản *</label>
                  <input
                    type="text"
                    value={soKyHieu}
                    onChange={(e) => setSoKyHieu(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ngày ban hành *</label>
                  <input
                    type="text"
                    value={ngayBanHanh}
                    onChange={(e) => setNgayBanHanh(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Người ký văn bản *</label>
                  <input
                    type="text"
                    value={nguoiKy}
                    onChange={(e) => setNguoiKy(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nội dung giải thích lý do không thụ lý (Ghi rõ trong Thông báo gửi công dân):
                  </label>
                  <textarea
                    rows={3}
                    value={finalChiTiet}
                    onChange={(e) => setCustomDetail(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:border-rose-500 focus:outline-none resize-none"
                    placeholder="Nhập lý do chi tiết..."
                  />
                </div>
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
                  <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg font-sans text-[11.5px] text-rose-950 font-medium">
                    {finalChiTiet}
                  </div>
                  <p>
                    Căn cứ <strong>{currentReason.canCu}</strong>, Ủy ban nhân dân quận thông báo: <strong>Không thụ lý giải quyết nội dung tố cáo nêu trên</strong>.
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
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'form' ? 'preview' : 'form')}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {activeTab === 'form' ? 'visibility' : 'edit_note'}
              </span>
              <span>{activeTab === 'form' ? 'Xem trước bản in' : 'Quay lại biểu mẫu'}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 cursor-pointer flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Ban hành Thông báo Không thụ lý ➔ Kết thúc đơn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
