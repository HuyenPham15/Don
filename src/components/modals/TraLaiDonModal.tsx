import React, { useState, useMemo } from 'react';

export interface TaiLieuTraLaiItem {
  id: string;
  tenTaiLieu: string;
  soLuong: number;
  tinhTrang: string;
  traLaiCongDan: boolean;
}

export interface TraLaiDonSubmitData {
  stepId: 'STEP-03D';
  huongXuLy: 'tra_lai';
  // Dữ liệu lý do bắt buộc
  lyDoChinh: string;
  lyDoChiTiet: string;
  canCuPhapLy: string;
  // Cấu hình sản phẩm / văn bản trả lại
  cauHinhVanBan: {
    taoVanBan: boolean;
    loaiVanBan: 'van_ban_tra_loi_don' | 'thong_bao_tra_lai' | 'phieu_huong_dan' | 'thong_bao_khong_thu_ly';
    soKyHieu: string;
    ngayBanHanh: string;
    nguoiLap: string;
    coQuanHuongDan: string;
    diaChiCoQuan?: string;
    noiDungHuongDan: string;
    chuKyCanBo?: {
      daKySo: boolean;
      tenCanBo: string;
      chucDanh: string;
      phuongThucKy: string;
      thoiGianKy: string;
    };
  };
  // Phương thức gửi / trả hồ sơ
  phuongThucTra: 'truc_tiep_tai_bo_phan' | 'buu_chinh_cong_ich' | 'cong_dvc_dien_tu';
  maVanDonBuuDien?: string;
  danhMucTaiLieuTra: TaiLieuTraLaiItem[];
  ghiChuLuuTru?: string;
}

export interface TraLaiDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TraLaiDonSubmitData) => void;
  currentOfficerName?: string;
  currentDepartmentName?: string;
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

export default function TraLaiDonModal({
  isOpen,
  onClose,
  onSubmit,
  currentOfficerName = 'Nguyễn Minh Anh',
  currentDepartmentName = 'Phòng Tiếp công dân & Xử lý đơn',
  donInfo = {
    code: 'Đ-2026-00125',
    luotNhanId: 'LN-2026-0819',
    nguoiNop: 'Nguyễn Văn A',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Số 12, ngõ 45, Cầu Giấy, Hà Nội',
    loaiDon: 'Đơn kiến nghị phản ánh đất đai',
    noiDung: 'Kiến nghị giải quyết tranh chấp ranh giới quyền sử dụng đất giữa hai hộ gia đình liền kề',
    ngayNhan: '16/09/2026',
  },
}: TraLaiDonModalProps) {
  // Tabs: 'form' (Biểu mẫu lập lý do và hướng dẫn) vs 'preview' (Xem trước Văn bản/Thông báo trả lại)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Lý do trả lại đơn (Kiểm tra dữ liệu bắt buộc)
  const [lyDoChinh, setLyDoChinh] = useState<string>('khong_thuoc_tham_quyen');
  const [lyDoChiTiet, setLyDoChiTiet] = useState<string>(
    'Nội dung đơn là tranh chấp ranh giới quyền sử dụng đất giữa cá nhân với cá nhân đã được cấp Giấy chứng nhận QSDĐ. Căn cứ Khoản 1 Điều 203 Luật Đất đai năm 2013 và Điều 26 Bộ luật Tố tụng Dân sự 2015, vụ việc thuộc thẩm quyền giải quyết của Tòa án nhân dân, không thuộc thẩm quyền của UBND hoặc cơ quan hành chính.'
  );
  const [canCuPhapLy, setCanCuPhapLy] = useState<string>(
    'Khoản 1 Điều 203 Luật Đất đai 2013; Điều 26 Bộ luật Tố tụng Dân sự 2015; Điều 27 Thông tư số 05/2021/TT-TTCP.'
  );

  // Cấu hình sản phẩm / văn bản trả lại (Bắt buộc nếu cấu hình)
  const [taoVanBan, setTaoVanBan] = useState<boolean>(true);
  const [loaiVanBan, setLoaiVanBan] = useState<'van_ban_tra_loi_don' | 'thong_bao_tra_lai' | 'phieu_huong_dan' | 'thong_bao_khong_thu_ly'>('van_ban_tra_loi_don');
  const [soKyHieu, setSoKyHieu] = useState<string>('28/TL-TCD');
  const [coQuanHuongDan, setCoQuanHuongDan] = useState<string>('Tòa án nhân dân quận Cầu Giấy, TP. Hà Nội');
  const [diaChiCoQuan, setDiaChiCoQuan] = useState<string>('Số 10 phố Tôn Thất Thuyết, Cầu Giấy, Hà Nội');
  const [noiDungHuongDan, setNoiDungHuongDan] = useState<string>(
    'Đề nghị ông/bà Nguyễn Văn A gửi đơn khởi kiện kèm theo bản sao Giấy chứng nhận QSDĐ, biên bản hòa giải tại UBND phường (nếu có) và các chứng cứ liên quan đến Tòa án nhân dân quận Cầu Giấy để được xem xét thụ lý, giải quyết theo thủ tục tố tụng dân sự.'
  );

  // Chữ ký của cán bộ chuyên môn (Bắt buộc)
  const [daKySo, setDaKySo] = useState<boolean>(true);
  const [phuongThucKy, setPhuongThucKy] = useState<'vgca' | 'smart_ca' | 'usb_token'>('vgca');

  // Phương thức gửi / trả hồ sơ
  const [phuongThucTra, setPhuongThucTra] = useState<'truc_tiep_tai_bo_phan' | 'buu_chinh_cong_ich' | 'cong_dvc_dien_tu'>('truc_tiep_tai_bo_phan');
  const [maVanDonBuuDien, setMaVanDonBuuDien] = useState<string>('VN7729182390VN');
  const [ghiChuLuuTru, setGhiChuLuuTru] = useState<string>(
    'Hệ thống lưu 01 bản chụp số hóa hồ sơ và bản lưu Thông báo trả lại số 28/TB-TCD trong cơ sở dữ liệu để theo dõi kiểm tra theo quy định.'
  );

  // Danh mục tài liệu trả lại công dân
  const [danhMucTaiLieu, setDanhMucTaiLieu] = useState<TaiLieuTraLaiItem[]>([
    {
      id: 'doc-1',
      tenTaiLieu: 'Đơn kiến nghị / phản ánh bản chính có chữ ký công dân',
      soLuong: 1,
      tinhTrang: 'Nguyên vẹn',
      traLaiCongDan: true,
    },
    {
      id: 'doc-2',
      tenTaiLieu: 'Bản trích lục bản đồ địa chính & Giấy chứng nhận photo nộp kèm',
      soLuong: 4,
      tinhTrang: 'Đầy đủ 04 trang tài liệu nộp kèm',
      traLaiCongDan: true,
    },
    {
      id: 'doc-3',
      tenTaiLieu: 'Giấy tờ tùy thân photo nộp kèm',
      soLuong: 1,
      tinhTrang: 'Bản sao CCCD',
      traLaiCongDan: true,
    },
  ]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cập nhật khi chọn mẫu lý do
  const handleSelectLyDo = (key: string) => {
    setLyDoChinh(key);
    switch (key) {
      case 'khong_thuoc_tham_quyen':
        setLyDoChiTiet(
          'Nội dung đơn là tranh chấp ranh giới quyền sử dụng đất giữa cá nhân với cá nhân đã được cấp Giấy chứng nhận QSDĐ. Căn cứ Khoản 1 Điều 203 Luật Đất đai năm 2013 và Điều 26 BLTTDS 2015, vụ việc thuộc thẩm quyền của Tòa án nhân dân, không thuộc thẩm quyền của cơ quan hành chính.'
        );
        setCanCuPhapLy('Khoản 1 Điều 203 Luật Đất đai 2013; Điều 26 BLTTDS 2015; Điều 27 Thông tư 05/2021/TT-TTCP.');
        setCoQuanHuongDan('Tòa án nhân dân quận/huyện nơi có bất động sản');
        setNoiDungHuongDan('Đề nghị công dân gửi đơn khởi kiện đến Tòa án nhân dân có thẩm quyền để được xem xét giải quyết theo quy định của pháp luật tố tụng dân sự.');
        break;
      case 'khong_du_dieu_kien_thu_ly':
        setLyDoChiTiet(
          'Đơn không ghi rõ họ tên, địa chỉ hoặc không có chữ ký/điểm chỉ của người gửi đơn; tài liệu nặc danh không có tình tiết, chứng cứ cụ thể theo quy định tại Điều 25 Luật Tố cáo 2018.'
        );
        setCanCuPhapLy('Khoản 2 Điều 25 Luật Tố cáo 2018; Điều 8 Thông tư 05/2021/TT-TTCP.');
        setCoQuanHuongDan('Bộ phận Tiếp công dân & Xử lý đơn');
        setNoiDungHuongDan('Yêu cầu công dân hoàn thiện đơn ghi rõ thông tin họ tên, nơi cư trú và ký tên xác nhận nếu muốn gửi lại để được xem xét theo quy định.');
        break;
      case 'trung_lap_da_co_van_ban':
        setLyDoChiTiet(
          'Đơn có cùng nội dung, đối tượng với vụ việc đã được cơ quan có thẩm quyền ban hành văn bản giải quyết đúng pháp luật, đã có thông báo chấm dứt xem xét giải quyết và không phát sinh tài liệu, chứng cứ mới.'
        );
        setCanCuPhapLy('Điều 28 Thông tư số 05/2021/TT-TTCP về xử lý đơn trùng lặp.');
        setCoQuanHuongDan('Lưu đơn theo dõi, không tiếp nhận thụ lý lại');
        setNoiDungHuongDan('Cơ quan thông báo không thụ lý giải quyết lại đối với vụ việc đã có văn bản giải quyết có hiệu lực pháp luật.');
        break;
      case 'thieu_tai_lieu_chung_cu':
        setLyDoChiTiet(
          'Đơn gửi đến không có đầy đủ tài liệu, chứng cứ làm cơ sở xem xét; cơ quan đã yêu cầu bổ sung nhưng quá thời hạn người nộp không cung cấp được hồ sơ hợp lệ.'
        );
        setCanCuPhapLy('Điều 24 Luật Khiếu nại 2011; Thông tư 05/2021/TT-TTCP.');
        setCoQuanHuongDan('Bộ phận Tiếp nhận hồ sơ');
        setNoiDungHuongDan('Trả lại hồ sơ để người dân thu thập đầy đủ tài liệu chứng cứ, giấy tờ liên quan trước khi nộp lại.');
        break;
      case 'nguoi_nop_rut_don':
        setLyDoChiTiet(
          'Người gửi đơn có văn bản chính thức đề nghị rút toàn bộ yêu cầu khiếu nại, phản ánh và cam kết tự nguyện giải quyết theo quy định tại Điều 33 Luật Tố cáo / Điều 10 Luật Khiếu nại.'
        );
        setCanCuPhapLy('Điều 33 Luật Tố cáo 2018; Điều 10 Luật Khiếu nại 2011.');
        setCoQuanHuongDan('Ban Tiếp công dân');
        setNoiDungHuongDan('Lưu hồ sơ theo diện đình chỉ do người gửi đơn tự nguyện rút đơn.');
        break;
      default:
        break;
    }
  };

  const handleToggleTaiLieu = (id: string) => {
    setDanhMucTaiLieu((prev) =>
      prev.map((it) => (it.id === id ? { ...it, traLaiCongDan: !it.traLaiCongDan } : it))
    );
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!lyDoChiTiet.trim()) {
      errs.lyDo = 'Bắt buộc ghi lý do trả lại đơn theo yêu cầu của bước STEP-03D.';
    }

    if (taoVanBan) {
      if (!soKyHieu.trim()) {
        errs.soKyHieu = 'Vui lòng nhập số / ký hiệu của Thông báo trả lại đơn.';
      }
      if (!noiDungHuongDan.trim()) {
        errs.huongDan = 'Bắt buộc nhập nội dung hướng dẫn người nộp hồ sơ khi có cấu hình tạo văn bản trả lại.';
      }
    }

    if (phuongThucTra === 'buu_chinh_cong_ich' && !maVanDonBuuDien.trim()) {
      errs.vanDon = 'Vui lòng nhập mã vận đơn bưu điện khi chọn gửi qua đường bưu chính.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setActiveTab('form');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({
        stepId: 'STEP-03D',
        huongXuLy: 'tra_lai',
        lyDoChinh,
        lyDoChiTiet: lyDoChiTiet.trim(),
        canCuPhapLy: canCuPhapLy.trim(),
        cauHinhVanBan: {
          taoVanBan,
          loaiVanBan,
          soKyHieu: soKyHieu.trim(),
          ngayBanHanh: todayStr,
          nguoiLap: currentOfficerName,
          coQuanHuongDan: coQuanHuongDan.trim(),
          diaChiCoQuan: diaChiCoQuan.trim(),
          noiDungHuongDan: noiDungHuongDan.trim(),
          chuKyCanBo: {
            daKySo,
            tenCanBo: currentOfficerName,
            chucDanh: 'Chuyên viên Phòng Tiếp công dân & Xử lý đơn',
            phuongThucKy,
            thoiGianKy: `${todayStr} 09:30:15`,
          },
        },
        phuongThucTra,
        maVanDonBuuDien: phuongThucTra === 'buu_chinh_cong_ich' ? maVanDonBuuDien.trim() : undefined,
        danhMucTaiLieuTra: danhMucTaiLieu.filter((d) => d.traLaiCongDan),
        ghiChuLuuTru: ghiChuLuuTru.trim(),
      });
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== HEADER ===================== */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-rose-500/10 via-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">assignment_return</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[11px] font-bold tracking-wider font-label-technical">
                  STEP-03D
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                  Cán bộ chuyên môn
                </span>
                <span className="text-xs text-rose-700 font-semibold hidden sm:inline-block">
                  • Hướng xử lý: Trả lại
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Trả lại đơn &amp; Hướng dẫn công dân
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher: Lập thông tin vs Xem trước văn bản */}
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
                <span>Thông tin trả lại</span>
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
                <span>Xem trước văn bản trả lại</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ===================== HỒ SƠ TÓM TẮT BANNER ===================== */}
        <div className="bg-rose-50/60 border-b border-rose-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-rose-950 font-label-technical flex items-center gap-1">
              <span className="material-symbols-outlined text-rose-700 text-[16px]">folder_open</span>
              {donInfo.code || donInfo.luotNhanId}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700">
              Người nộp: <strong className="text-slate-900">{donInfo.nguoiNop}</strong> ({donInfo.diaChi || 'Cầu Giấy, Hà Nội'})
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-700 hidden sm:inline">
              Loại: <strong className="text-slate-900">{donInfo.loaiDon}</strong>
            </span>
          </div>
          <div className="text-[11px] text-rose-800 font-medium">
            Cán bộ xử lý: <strong>{currentOfficerName}</strong> ({currentDepartmentName})
          </div>
        </div>

        {/* ===================== BODY CONTENT ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error summary */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
                  <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">error</span>
                  <div>
                    <strong className="block font-bold">Vui lòng kiểm tra lại các dữ liệu bắt buộc (STEP-03D):</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11.5px]">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Notice Banner: Quy định trả lại đơn */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">info</span>
                <div>
                  <strong>Quy định nghiệp vụ (STEP-03D):</strong> Trả lại đơn cho người dân/người nộp hồ sơ khi đơn không thuộc thẩm quyền hoặc không đủ điều kiện thụ lý. Bắt buộc có lý do trả lại và văn bản trả lại hướng dẫn công dân (nếu cấu hình yêu cầu). Sau khi xác nhận, Task xử lý tại đơn vị sẽ kết thúc.
                </div>
              </div>

              {/* ──────────────── 1. GHI LÝ DO TRẢ LẠI ĐƠN (BẮT BUỘC) ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Lý do trả lại đơn <span className="text-rose-500">*</span>
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Ràng buộc dữ liệu bắt buộc</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh mục lý do chuẩn theo Luật:
                    </label>
                    <select
                      value={lyDoChinh}
                      onChange={(e) => handleSelectLyDo(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
                    >
                      <option value="khong_thuoc_tham_quyen">Không thuộc thẩm quyền giải quyết (Hướng dẫn gửi đúng nơi)</option>
                      <option value="khong_du_dieu_kien_thu_ly">Không đủ điều kiện thụ lý (Đơn nặc danh, thiếu họ tên, chữ ký)</option>
                      <option value="trung_lap_da_co_van_ban">Đơn trùng lặp nội dung đã có văn bản giải quyết có hiệu lực</option>
                      <option value="thieu_tai_lieu_chung_cu">Thiếu hồ sơ tài liệu chứng minh và quá hạn bổ sung</option>
                      <option value="nguoi_nop_rut_don">Người gửi đơn có văn bản xin rút yêu cầu giải quyết</option>
                      <option value="khac">Lý do khác...</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Diễn giải chi tiết lý do trả lại đơn <span className="text-rose-500">*</span>:
                    </label>
                    <textarea
                      rows={3}
                      value={lyDoChiTiet}
                      onChange={(e) => setLyDoChiTiet(e.target.value)}
                      placeholder="Giải trình cụ thể lý do cơ quan không thụ lý và trả lại hồ sơ..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Căn cứ pháp lý viện dẫn:
                  </label>
                  <input
                    type="text"
                    value={canCuPhapLy}
                    onChange={(e) => setCanCuPhapLy(e.target.value)}
                    placeholder="Các điều khoản luật áp dụng..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* ──────────────── 2. TẠO VĂN BẢN TRẢ LẠI (SẢN PHẨM ĐẦU RA BẮT BUỘC NẾU CẤU HÌNH) ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Tạo văn bản trả lại &amp; Hướng dẫn công dân
                    </h3>
                  </div>

                  {/* Switch cấu hình tạo văn bản */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taoVanBan}
                      onChange={(e) => setTaoVanBan(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 relative"></div>
                    <span className="text-xs font-bold text-slate-800">
                      {taoVanBan ? 'Có cấu hình tạo văn bản (Bắt buộc)' : 'Không tạo văn bản'}
                    </span>
                  </label>
                </div>

                {taoVanBan ? (
                  <div className="space-y-3.5 p-3.5 bg-rose-50/40 rounded-xl border border-rose-200/70">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Loại văn bản ban hành:
                        </label>
                        <select
                          value={loaiVanBan}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setLoaiVanBan(val);
                            if (val === 'van_ban_tra_loi_don') {
                              setSoKyHieu('28/TL-TCD');
                            } else if (val === 'thong_bao_tra_lai') {
                              setSoKyHieu('28/TB-TCD');
                            } else if (val === 'phieu_huong_dan') {
                              setSoKyHieu('28/PHD-TCD');
                            } else {
                              setSoKyHieu('28/TB-KTL');
                            }
                          }}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-semibold"
                        >
                          <option value="van_ban_tra_loi_don">Văn bản trả lời đơn cho đương sự (Mẫu 02/TL-Đ)</option>
                          <option value="thong_bao_tra_lai">Thông báo trả lại đơn &amp; hướng dẫn (Mẫu 02/TB)</option>
                          <option value="phieu_huong_dan">Phiếu hướng dẫn gửi đơn (Mẫu 03/PHD)</option>
                          <option value="thong_bao_khong_thu_ly">Thông báo không đủ điều kiện thụ lý (Mẫu 04/TB)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số / Ký hiệu văn bản <span className="text-rose-500">*</span>:
                        </label>
                        <input
                          type="text"
                          value={soKyHieu}
                          onChange={(e) => setSoKyHieu(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Ngày lập văn bản:
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={todayStr}
                          className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cơ quan / Đơn vị có thẩm quyền hướng dẫn công dân gửi đến:
                        </label>
                        <input
                          type="text"
                          value={coQuanHuongDan}
                          onChange={(e) => setCoQuanHuongDan(e.target.value)}
                          placeholder="Tên cơ quan có thẩm quyền đúng..."
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Địa chỉ cơ quan hướng dẫn:
                        </label>
                        <input
                          type="text"
                          value={diaChiCoQuan}
                          onChange={(e) => setDiaChiCoQuan(e.target.value)}
                          placeholder="Địa chỉ liên hệ..."
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nội dung hướng dẫn người nộp hồ sơ <span className="text-rose-500">*</span>:
                      </label>
                      <textarea
                        rows={3}
                        value={noiDungHuongDan}
                        onChange={(e) => setNoiDungHuongDan(e.target.value)}
                        placeholder="Nội dung chỉ dẫn công dân hoàn thiện hoặc nộp đơn đến cơ quan có thẩm quyền..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 text-rose-800">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Văn bản trả lại sẽ được ban hành và gửi cho người nộp đơn kèm lưu trữ hồ sơ.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className="text-xs text-rose-800 hover:text-rose-950 font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Xem trước văn bản này</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Chế độ không tạo văn bản. Hệ thống chỉ ghi nhận lý do trả lại trong nhật ký nghiệp vụ.
                  </p>
                )}
              </div>

              {/* ──────────────── 3. PHƯƠNG THỨC GỬI / TRẢ HỒ SƠ ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Phương thức gửi / trả hồ sơ
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Bàn giao lại tài liệu cho công dân</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPhuongThucTra('truc_tiep_tai_bo_phan')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                      phuongThucTra === 'truc_tiep_tai_bo_phan'
                        ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-200 shadow-2xs'
                        : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        phuongThucTra === 'truc_tiep_tai_bo_phan' ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                      }`}
                    >
                      {phuongThucTra === 'truc_tiep_tai_bo_phan' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      )}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Trả trực tiếp tại phòng</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Công dân đến nhận trực tiếp &amp; ký biên nhận</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhuongThucTra('buu_chinh_cong_ich')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                      phuongThucTra === 'buu_chinh_cong_ich'
                        ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-200 shadow-2xs'
                        : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        phuongThucTra === 'buu_chinh_cong_ich' ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                      }`}
                    >
                      {phuongThucTra === 'buu_chinh_cong_ich' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      )}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Bưu chính công ích</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Gửi phát bảo đảm qua VNPost có mã vận đơn</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhuongThucTra('cong_dvc_dien_tu')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                      phuongThucTra === 'cong_dvc_dien_tu'
                        ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-200 shadow-2xs'
                        : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        phuongThucTra === 'cong_dvc_dien_tu' ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                      }`}
                    >
                      {phuongThucTra === 'cong_dvc_dien_tu' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      )}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Cổng DVC trực tuyến</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Thông báo qua tài khoản DVC &amp; gửi SMS/Email</p>
                    </div>
                  </button>
                </div>

                {phuongThucTra === 'buu_chinh_cong_ich' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700 shrink-0">
                      Mã bưu gửi / vận đơn bưu điện <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={maVanDonBuuDien}
                      onChange={(e) => setMaVanDonBuuDien(e.target.value)}
                      placeholder="VD: VN123456789VN"
                      className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold w-64 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                {/* Danh mục tài liệu trả lại */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-rose-700">inventory</span>
                    <span>Tài liệu trả lại người nộp đơn ({danhMucTaiLieu.filter((d) => d.traLaiCongDan).length}/{danhMucTaiLieu.length})</span>
                  </label>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {danhMucTaiLieu.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleToggleTaiLieu(doc.id)}
                        className={`p-2.5 px-3 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          doc.traLaiCongDan ? 'bg-rose-50/20' : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={doc.traLaiCongDan}
                            onChange={() => handleToggleTaiLieu(doc.id)}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                          <span className="font-medium text-slate-800">{doc.tenTaiLieu}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span className="font-bold text-slate-700">{doc.soLuong} bản</span>
                          <span className="text-[11px]">({doc.tinhTrang})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ghi chú lưu trữ hồ sơ:
                  </label>
                  <input
                    type="text"
                    value={ghiChuLuuTru}
                    onChange={(e) => setGhiChuLuuTru(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* ──────────────── 4. CHỮ KÝ CỦA CÁN BỘ CHUYÊN MÔN (XÁC NHẬN VĂN BẢN TRẢ LỜI ĐƠN) ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Chữ ký của cán bộ chuyên môn
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Chứng thư số hợp lệ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Thông tin cán bộ */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm shrink-0 border border-rose-200">
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-slate-500 font-medium">Cán bộ lập &amp; ký văn bản trả lời:</div>
                      <div className="font-bold text-xs text-slate-900">{currentOfficerName}</div>
                      <div className="text-[11px] text-slate-600 truncate">{currentDepartmentName}</div>
                    </div>
                  </div>

                  {/* Chọn phương thức ký số */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-center">
                    <label className="text-[11px] text-slate-500 font-medium mb-1">Phương thức ký số cán bộ:</label>
                    <select
                      value={phuongThucKy}
                      onChange={(e) => setPhuongThucKy(e.target.value as any)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
                    >
                      <option value="vgca">Chứng thư số Ban Cơ yếu Chính phủ (VGCA)</option>
                      <option value="smart_ca">Chữ ký số từ xa SmartCA</option>
                      <option value="usb_token">USB Token chuyên dùng</option>
                    </select>
                  </div>
                </div>

                {/* Khung mô phỏng con dấu chữ ký số của Cán bộ chuyên môn */}
                <div className="p-3 bg-rose-50/50 rounded-xl border border-dashed border-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">draw</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                        <span>KÝ SỐ BỞI: {currentOfficerName.toUpperCase()}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-200/80 text-rose-900 font-semibold font-mono">ĐÃ XÁC THỰC</span>
                      </div>
                      <div className="text-[11px] text-rose-800 font-mono mt-0.5">
                        Chức danh: Cán bộ chuyên môn xử lý đơn • Ngày ký: {todayStr}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs hover:bg-rose-50/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={daKySo}
                      onChange={(e) => setDaKySo(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Đóng dấu ký số</span>
                  </label>
                </div>
              </div>
            </form>
          ) : (
            /* ===================== TAB 2: XEM TRƯỚC VĂN BẢN TRẢ LẠI (A4 PREVIEW) ===================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-700 text-xl">print</span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Xem trước bản in thể thức chuẩn: {loaiVanBan === 'van_ban_tra_loi_don' ? 'Văn bản trả lời đơn cho đương sự' : loaiVanBan === 'thong_bao_tra_lai' ? 'Thông báo trả lại đơn & hướng dẫn' : loaiVanBan === 'phieu_huong_dan' ? 'Phiếu hướng dẫn gửi đơn' : 'Thông báo không thụ lý'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>In văn bản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                </div>
              </div>

              {/* Tờ A4 Mockup */}
              <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-3xl mx-auto font-serif text-slate-900 space-y-6 text-sm leading-relaxed">
                {/* Quốc hiệu tiêu ngữ */}
                <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                  <div>
                    <p className="font-bold text-xs uppercase">{currentDepartmentName.toUpperCase()}</p>
                    <p className="font-bold text-xs">BỘ PHẬN TIẾP CÔNG DÂN</p>
                    <p className="text-[11px] font-sans mt-1">Số: {soKyHieu || '...../TL-TCD'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs underline decoration-1 underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] italic font-sans mt-1">Hà Nội, ngày {todayStr.split('/')[0]} tháng {todayStr.split('/')[1]} năm {todayStr.split('/')[2]}</p>
                  </div>
                </div>

                {/* Tiêu đề văn bản */}
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight text-slate-950">
                    {loaiVanBan === 'van_ban_tra_loi_don'
                      ? 'VĂN BẢN TRẢ LỜI ĐƠN'
                      : loaiVanBan === 'thong_bao_tra_lai'
                      ? 'THÔNG BÁO'
                      : loaiVanBan === 'phieu_huong_dan'
                      ? 'PHIẾU HƯỚNG DẪN GỬI ĐƠN'
                      : 'THÔNG BÁO KHÔNG ĐỦ ĐIỀU KIỆN THỤ LÝ'}
                  </h1>
                  <p className="font-bold text-xs font-sans uppercase text-slate-800">
                    {loaiVanBan === 'van_ban_tra_loi_don'
                      ? 'Về việc trả lời đơn kiến nghị, phản ánh của đương sự'
                      : 'Về việc trả lại đơn và hướng dẫn gửi đơn đến cơ quan có thẩm quyền'}
                  </p>
                </div>

                {/* Kính gửi */}
                <div className="font-sans text-xs space-y-1 text-center font-bold">
                  <p>Kính gửi đương sự: Ông / Bà <span className="uppercase text-slate-950 font-bold">{donInfo.nguoiNop}</span></p>
                  <p className="font-normal text-slate-600">CCCD số: {donInfo.cccd || '001088012345'} • Địa chỉ: {donInfo.diaChi || 'Cầu Giấy, Hà Nội'}</p>
                </div>

                {/* Căn cứ */}
                <div className="text-xs italic space-y-1 font-sans text-slate-700">
                  <p>• {canCuPhapLy}</p>
                  <p>• Căn cứ kết quả kiểm tra ban đầu và phân loại xử lý đơn tại bước [STEP-03D: Trả lại đơn].</p>
                </div>

                {/* Nội dung thông báo */}
                <div className="space-y-4 font-sans text-xs text-justify">
                  <p>
                    Ngày {donInfo.ngayNhan || todayStr}, {currentDepartmentName} nhận được đơn của ông/bà {donInfo.nguoiNop} (Mã đơn: <strong>{donInfo.code || donInfo.luotNhanId}</strong>), có nội dung: <em>&quot;{donInfo.noiDung}&quot;</em>.
                  </p>

                  <div>
                    <strong>1. Về lý do không thụ lý và trả lại hồ sơ:</strong>
                    <p className="pl-4 mt-1 text-slate-800 leading-relaxed italic">
                      &quot;{lyDoChiTiet}&quot;
                    </p>
                  </div>

                  <div>
                    <strong>2. Hướng dẫn đương sự gửi đơn đến cơ quan có thẩm quyền giải quyết:</strong>
                    <div className="pl-4 mt-1 space-y-1 text-slate-800">
                      <p>- Cơ quan có thẩm quyền: <strong>{coQuanHuongDan}</strong></p>
                      {diaChiCoQuan && <p>- Địa chỉ liên hệ: {diaChiCoQuan}</p>}
                      <p className="mt-1 leading-relaxed">- Nội dung hướng dẫn cụ thể: {noiDungHuongDan}</p>
                    </div>
                  </div>

                  <div>
                    <strong>3. Về việc hoàn trả tài liệu, chứng cứ kèm theo đơn:</strong>
                    <p className="pl-4 mt-1 text-slate-800">
                      Cơ quan tiến hành hoàn trả lại cho đương sự {donInfo.nguoiNop} các tài liệu gốc đính kèm (gồm: {danhMucTaiLieu.filter((d) => d.traLaiCongDan).map((d) => `${d.tenTaiLieu} (${d.soLuong} bản)`).join(', ')}).
                    </p>
                    <p className="pl-4 mt-0.5 text-slate-600 italic">
                      Phương thức trả: {phuongThucTra === 'truc_tiep_tai_bo_phan' ? 'Nhận trực tiếp tại Bộ phận Tiếp công dân' : phuongThucTra === 'buu_chinh_cong_ich' ? `Gửi dịch vụ bưu chính công ích (Mã bưu gửi: ${maVanDonBuuDien})` : 'Cổng Dịch vụ công trực tuyến'}.
                    </p>
                  </div>

                  <p className="pt-2 text-slate-700">
                    {currentDepartmentName} trả lời để đương sự {donInfo.nguoiNop} được biết và liên hệ cơ quan có thẩm quyền để được giải quyết theo quy định của pháp luật./.
                  </p>
                </div>

                {/* Nơi nhận và chữ ký */}
                <div className="grid grid-cols-2 gap-8 pt-8 font-sans">
                  <div className="text-left text-xs">
                    <p className="font-bold">Nơi nhận:</p>
                    <p className="text-[11px] text-slate-600">- Đương sự (để thực hiện);</p>
                    <p className="text-[11px] text-slate-600">- Lãnh đạo đơn vị (để b/c);</p>
                    <p className="text-[11px] text-slate-600">- Cơ quan hướng dẫn ({coQuanHuongDan});</p>
                    <p className="text-[11px] text-slate-600">- Lưu: VT, HS ({currentOfficerName}).</p>
                  </div>

                  <div className="text-center font-sans">
                    <p className="font-bold text-xs uppercase text-slate-900">CÁN BỘ CHUYÊN MÔN XỬ LÝ ĐƠN</p>
                    <p className="text-[11px] italic text-slate-500">(Ký số và ghi rõ họ tên)</p>
                    {daKySo ? (
                      <div className="my-2 p-2.5 rounded-lg border-2 border-rose-600 bg-rose-50/70 text-rose-900 text-left text-[11px] font-mono leading-snug shadow-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900 pb-1 border-b border-rose-300">
                          <span className="material-symbols-outlined text-[15px] text-rose-700">verified</span>
                          <span>KÝ SỐ BỞI: {currentOfficerName.toUpperCase()}</span>
                        </div>
                        <div className="pt-1 space-y-0.5 text-[10px]">
                          <div>• Chức danh: Cán bộ chuyên môn xử lý đơn</div>
                          <div>• Cơ quan: {currentDepartmentName}</div>
                          <div>• Thời gian ký: {todayStr} 09:30:15 +07:00</div>
                          <div className="text-emerald-700 font-bold">✓ Chứng thư số Ban Cơ yếu Chính phủ hợp lệ</div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-xs text-slate-400 italic">
                        (Chưa đóng dấu ký số)
                      </div>
                    )}
                    <p className="font-bold text-xs text-slate-950 uppercase">{currentOfficerName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== FOOTER BUTTONS ===================== */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-rose-600">info</span>
            <span>Hồ sơ chuyển trạng thái <strong>Đã trả lại</strong> và kết thúc Task xử lý của cán bộ chuyên môn.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>

            {activeTab === 'preview' ? (
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Quay lại biểu mẫu
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (validateForm()) setActiveTab('preview');
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Xem trước văn bản</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{isSubmitting ? 'Đang xử lý...' : 'Xác nhận & Trả lại đơn'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
