import React, { useState } from 'react';

export interface TraLoiDonSubmitData {
  soKyHieu: string;
  ngayBanHanh: string;
  loaiVanBan: string;
  trichYeu: string;
  noiDungChiTiet: string;
  canCuPhapLy: string;
  nguoiNhan: string;
  nguoiKy: string;
}

export interface TraLoiDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TraLoiDonSubmitData) => void;
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

const LOAI_VAN_BAN_TRA_LOI = [
  {
    id: 'tra_loi_kien_nghi',
    label: '1. Văn bản trả lời kiến nghị, phản ánh của công dân',
    canCu: 'Điều 28 Thông tư 05/2021/TT-TTCP; Luật Tiếp công dân 2013',
    mauTrichYeu: 'V/v Trả lời nội dung phản ánh, kiến nghị của công dân',
    noiDungGoiY:
      'Sau khi tiếp nhận và kiểm tra thông tin phản ánh/kiến nghị của công dân nêu trong đơn, cơ quan đã tiến hành rà soát các quy định hiện hành và hồ sơ quản lý liên quan.\nCăn cứ quy định của pháp luật, nội dung kiến nghị của công dân đã được xem xét, giải quyết đúng thẩm quyền và trình tự luật định. Kính thông báo để công dân được biết và thực hiện theo đúng hướng dẫn.',
  },
  {
    id: 'giai_thich_chinh_sach',
    label: '2. Công văn giải thích chính sách, pháp luật',
    canCu: 'Luật Khiếu nại 2011; Nghị định 124/2020/NĐ-CP',
    mauTrichYeu: 'V/v Hướng dẫn, giải thích chế độ chính sách và quy định pháp luật',
    noiDungGoiY:
      'Nội dung công dân nêu liên quan đến việc áp dụng chính sách bồi thường, hỗ trợ tái định cư hoặc thủ tục cấp giấy chứng nhận.\nCăn cứ các văn bản quy phạm pháp luật hiện hành, cơ quan giải thích rõ căn cứ áp dụng và quyền, nghĩa vụ pháp lý của công dân theo quy định.',
  },
  {
    id: 'thong_bao_ket_qua_kiem_tra',
    label: '3. Thông báo kết quả rà soát, kiểm tra ban đầu',
    canCu: 'Điều 26 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    mauTrichYeu: 'V/v Thông báo kết quả kiểm tra, xác minh ban đầu nội dung đơn',
    noiDungGoiY:
      'Qua kết quả kiểm tra, đối chiếu hồ sơ lưu trữ và thông tin cơ sở dữ liệu chuyên ngành, cơ quan thông báo tóm tắt kết quả kiểm tra nội dung đơn đến người đứng đơn.',
  },
  {
    id: 'phuc_dap_don_trung',
    label: '4. Phúc đáp đơn trùng / Đã có văn bản giải quyết trước đó',
    canCu: 'Khoản 2 Điều 29 Luật Tố cáo 2018; Điều 28 Luật Khiếu nại 2011',
    mauTrichYeu: 'V/v Phúc đáp đơn gửi nhiều lần đối với vụ việc đã giải quyết dứt điểm',
    noiDungGoiY:
      'Vụ việc công dân nêu đã được cơ quan có thẩm quyền ban hành văn bản giải quyết có hiệu lực pháp luật. Đơn gửi lần này không có tình tiết, chứng cứ mới làm thay đổi bản chất vụ việc. Cơ quan phúc đáp giữ nguyên kết quả giải quyết trước đó và đề nghị công dân chấp hành.',
  },
];

export default function TraLoiDonModal({
  isOpen,
  onClose,
  onSubmit,
  donInfo = {
    code: 'Đ-2025-0105',
    luotNhanId: 'LN-2025-0105',
    nguoiNop: 'Vũ Thị Thanh',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Cầu Giấy, Hà Nội',
    loaiDon: 'Đơn khiếu nại',
    noiDung: 'Thẩm tra thay đổi ngành nghề HKD cá thể',
    ngayNhan: '16/09/2026',
  },
}: TraLoiDonModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [selectedLoaiId, setSelectedLoaiId] = useState<string>('tra_loi_kien_nghi');
  const [soKyHieu, setSoKyHieu] = useState<string>(`TL-ĐON/${new Date().getFullYear()}/UBND`);
  const [ngayBanHanh, setNgayBanHanh] = useState<string>(
    new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [nguoiKy, setNguoiKy] = useState<string>('Trần Văn Cường (Phó Chủ tịch UBND)');
  const [customTrichYeu, setCustomTrichYeu] = useState<string>('');
  const [customDetail, setCustomDetail] = useState<string>('');

  if (!isOpen) return null;

  const currentLoai = LOAI_VAN_BAN_TRA_LOI.find((l) => l.id === selectedLoaiId) || LOAI_VAN_BAN_TRA_LOI[0];
  const finalTrichYeu = customTrichYeu || currentLoai.mauTrichYeu;
  const finalChiTiet = customDetail || currentLoai.noiDungGoiY;

  const handleConfirmSubmit = () => {
    onSubmit({
      soKyHieu,
      ngayBanHanh,
      loaiVanBan: currentLoai.label,
      trichYeu: finalTrichYeu,
      noiDungChiTiet: finalChiTiet,
      canCuPhapLy: currentLoai.canCu,
      nguoiNhan: donInfo.nguoiNop || 'Công dân nộp đơn',
      nguoiKy,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-500/10 via-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">reply</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wide">
                  HƯỚNG: TRẢ LỜI ĐƠN
                </span>
                <span className="text-[11.5px] text-slate-500 font-mono">
                  Đơn: <strong className="text-slate-800">{donInfo.code}</strong>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Lập văn bản trả lời đơn công dân
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Nhập liệu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                <span>Xem văn bản</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Thông tin đơn tóm tắt */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Người nộp đơn</span>
              <p className="font-bold text-slate-900 text-sm">{donInfo.nguoiNop || 'Vũ Thị Thanh'}</p>
              <p className="text-slate-500 font-mono text-[11px]">CCCD: {donInfo.cccd || '001088012345'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Thông tin tiếp nhận</span>
              <p className="font-semibold text-slate-800">{donInfo.loaiDon || 'Đơn khiếu nại'}</p>
              <p className="text-slate-500 text-[11px]">Ngày tiếp nhận: {donInfo.ngayNhan || '16/09/2026'}</p>
            </div>
            <div className="space-y-1 md:border-l md:border-slate-200 md:pl-3">
              <span className="text-[11px] text-slate-400 block font-medium">Nội dung tóm tắt</span>
              <p className="text-slate-700 leading-snug line-clamp-2 italic" title={donInfo.noiDung}>
                "{donInfo.noiDung || 'Thẩm tra thay đổi ngành nghề HKD cá thể'}"
              </p>
            </div>
          </div>

          {activeTab === 'form' ? (
            <>
              {/* Chọn loại văn bản trả lời */}
              <div className="space-y-2.5">
                <label className="block text-[13px] font-bold text-slate-800">
                  1. Chọn tính chất / Mẫu văn bản trả lời đơn <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {LOAI_VAN_BAN_TRA_LOI.map((item) => {
                    const isSelected = selectedLoaiId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedLoaiId(item.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-200 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[13px] font-bold text-slate-900 block">{item.label}</span>
                            <span className="text-[11.5px] text-teal-800 font-medium inline-block bg-teal-100/70 px-2 py-0.5 rounded">
                              ⚖ {item.canCu}
                            </span>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông số văn bản hành chính */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-[13px] font-bold text-slate-800">
                  2. Thông số văn bản ban hành theo Nghị định 30/2020/NĐ-CP
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                      Số ký hiệu văn bản <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                    </label>
                    <input
                      type="text"
                      value={soKyHieu}
                      onChange={(e) => setSoKyHieu(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                      Ngày ban hành <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                    </label>
                    <input
                      type="text"
                      value={ngayBanHanh}
                      onChange={(e) => setNgayBanHanh(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                    Trích yếu nội dung văn bản <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customTrichYeu || currentLoai.mauTrichYeu}
                    onChange={(e) => setCustomTrichYeu(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                    Nội dung trả lời / giải thích chi tiết gửi công dân{' '}
                    <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={customDetail || currentLoai.noiDungGoiY}
                    onChange={(e) => setCustomDetail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[13px] text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 resize-none font-normal"
                    placeholder="Nhập nội dung trả lời đơn..."
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                    Người ký / Phê duyệt ban hành <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>
                  </label>
                  <input
                    type="text"
                    value={nguoiKy}
                    onChange={(e) => setNguoiKy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-[13.5px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Preview khổ A4 mô phỏng */
            <div className="bg-white border-2 border-slate-300 rounded-xl p-8 shadow-inner text-slate-900 font-serif space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-start text-center text-xs font-sans pb-3 border-b border-slate-200">
                <div>
                  <p className="font-bold uppercase">ỦY BAN NHÂN DÂN</p>
                  <p className="font-semibold text-slate-600">PHÒNG TIẾP CÔNG DÂN &amp; XỬ LÝ ĐƠN</p>
                  <p className="text-[11px] font-mono mt-1">Số: {soKyHieu}</p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="italic font-normal">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-[11px] italic mt-1 font-sans">Hà Nội, ngày {ngayBanHanh}</p>
                </div>
              </div>

              <div className="text-center py-2">
                <h3 className="text-base font-bold uppercase tracking-wide font-sans">VĂN BẢN TRẢ LỜI ĐƠN CÔNG DÂN</h3>
                <p className="text-xs italic mt-1 font-sans text-slate-600">Trích yếu: {finalTrichYeu}</p>
              </div>

              <div className="text-xs space-y-2 leading-relaxed font-sans text-slate-800">
                <p>
                  <strong>Kính gửi:</strong> Ông/Bà <strong>{donInfo.nguoiNop || 'Công dân nộp đơn'}</strong>
                </p>
                <p>
                  Cơ quan tiếp nhận đơn của công dân mang mã số <strong>{donInfo.code}</strong> ngày{' '}
                  {donInfo.ngayNhan || '16/09/2026'}.
                </p>
                <p>
                  <strong>Căn cứ pháp lý:</strong> {currentLoai.canCu}.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-line text-slate-800 text-xs">
                  {finalChiTiet}
                </div>
                <p>Kính thông báo để Ông/Bà được biết và thực hiện theo quy định pháp luật./.</p>
              </div>

              <div className="flex justify-between items-end pt-6 font-sans text-xs">
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold">Nơi nhận:</p>
                  <p>- Như trên;</p>
                  <p>- Lưu: VT, Hồ sơ đơn.</p>
                </div>
                <div className="text-center">
                  <p className="font-bold uppercase">TM. ỦY BAN NHÂN DÂN</p>
                  <p className="italic text-[11px]">Người ký</p>
                  <div className="h-10 flex items-center justify-center text-teal-600 text-[11px] font-bold">
                    [Đã ký số VGCA]
                  </div>
                  <p className="font-bold">{nguoiKy}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Ban hành Văn bản trả lời đơn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
