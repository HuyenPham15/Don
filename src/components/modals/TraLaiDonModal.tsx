import React, { useState, useMemo, useEffect } from 'react';

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
  // Thông tin đương sự & địa chỉ nhận lại
  nguoiNhan: string;
  diaChiNhan: string;
  sdtLienHe?: string;
  // Hình thức nhận kết quả (đồng bộ từ lượt nhận)
  hinhThucNhan: string;
  phuongThucTra: 'truc_tiep_tai_bo_phan' | 'buu_chinh_cong_ich' | 'cong_dvc_dien_tu';
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
  danhMucTaiLieuTra?: TaiLieuTraLaiItem[];
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
    hinhThucTiepNhan?: string;
  };
}

// Danh mục các lý do trả lại đơn chuẩn hóa theo Luật Tố cáo 2018 & Thông tư số 05/2021/TT-TTCP
const TRA_LAI_REASONS = [
  {
    id: 'khong_thuoc_tham_quyen',
    label: '1. Không thuộc thẩm quyền giải quyết (Thuộc thẩm quyền Tòa án hoặc cơ quan khác)',
    chiTiet:
      'Nội dung đơn là tranh chấp dân sự, ranh giới quyền sử dụng đất giữa các cá nhân đã được cấp Giấy chứng nhận quyền sử dụng đất. Căn cứ Khoản 1 Điều 203 Luật Đất đai và Điều 26 Bộ luật Tố tụng Dân sự 2015, vụ việc thuộc thẩm quyền của Tòa án nhân dân, không thuộc thẩm quyền của cơ quan hành chính.',
    canCu: 'Khoản 1 Điều 203 Luật Đất đai; Điều 26 Bộ luật Tố tụng Dân sự 2015; Thông tư số 05/2021/TT-TTCP.',
    coQuanHuongDan: 'Tòa án nhân dân quận/huyện có thẩm quyền',
    noiDungHuongDan:
      'Đề nghị công dân gửi đơn khởi kiện đến Tòa án nhân dân có thẩm quyền để được xem xét giải quyết theo quy định của pháp luật tố tụng dân sự.',
  },
  {
    id: 'vi_pham_thu_tuc_khieu_nai',
    label: '2. Tố cáo người giải quyết khiếu nại vi phạm thẩm quyền, trình tự (Không thụ lý, hướng dẫn khiếu nại tiếp hoặc kiện Tòa án)',
    chiTiet:
      'Đơn tố cáo người giải quyết khiếu nại vi phạm về thẩm quyền, trình tự, thủ tục giải quyết khiếu nại (không có tài liệu, chứng cứ về hành vi cản trở, đe dọa, thiếu trách nhiệm, làm sai lệch hồ sơ hoặc bao che vi phạm). Căn cứ quy định của Luật Tố cáo 2018, vụ việc không thụ lý theo thủ tục giải quyết tố cáo.',
    canCu: 'Điều 12, Điều 29 Luật Tố cáo 2018; Luật Khiếu nại 2011; Luật Tố tụng Hành chính 2015; Thông tư số 05/2021/TT-TTCP.',
    coQuanHuongDan: 'Cơ quan cấp trên của người giải quyết khiếu nại hoặc Tòa án nhân dân',
    noiDungHuongDan:
      'Hướng dẫn người có đơn tiếp tục thực hiện việc khiếu nại đến người đứng đầu cơ quan cấp trên trực tiếp hoặc khởi kiện vụ án hành chính tại Tòa án nhân dân có thẩm quyền theo quy định của Luật Tố tụng Hành chính.',
  },
  {
    id: 'khong_du_dieu_kien_thu_ly',
    label: '3. Không đủ điều kiện thụ lý (Mất năng lực HVDS không có đại diện, nặc danh, không có cơ sở xác định vi phạm)',
    chiTiet:
      'Đơn không ghi rõ họ tên, địa chỉ hoặc không có chữ ký/điểm chỉ của người gửi đơn; hoặc người tố cáo không đủ năng lực hành vi dân sự và không có người đại diện theo quy định pháp luật; nội dung không có cơ sở xác định người vi phạm theo Điều 29 Luật Tố cáo 2018.',
    canCu: 'Khoản 2 Điều 25, Điều 29 Luật Tố cáo 2018; Điều 8 Thông tư 05/2021/TT-TTCP.',
    coQuanHuongDan: 'Bộ phận Tiếp công dân & Xử lý đơn',
    noiDungHuongDan:
      'Yêu cầu người nộp hoàn thiện đơn và các điều kiện pháp lý cần thiết trước khi gửi lại để được xem xét giải quyết theo luật định.',
  },
  {
    id: 'khieu_nai_chuyen_sang_to_cao_thieu_chung_cu',
    label: '4. Tố cáo từ vụ khiếu nại đã giải quyết nhưng thiếu tài liệu, chứng cứ chứng minh vi phạm',
    chiTiet:
      'Vụ việc xuất phát từ khiếu nại đã được giải quyết đúng thẩm quyền, trình tự, thủ tục theo quy định của pháp luật nhưng người khiếu nại không đồng ý mà chuyển sang tố cáo người đã giải quyết khiếu nại; người tố cáo không cung cấp được thông tin, tài liệu, chứng cứ chứng minh người giải quyết khiếu nại có hành vi vi phạm pháp luật.',
    canCu: 'Luật Tố cáo 2018; Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ.',
    coQuanHuongDan: 'Bộ phận Tiếp công dân',
    noiDungHuongDan:
      'Cơ quan thông báo không thụ lý do không có thông tin, tài liệu chứng cứ chứng minh hành vi vi phạm pháp luật của người giải quyết khiếu nại.',
  },
  {
    id: 'trung_lap_da_co_van_ban',
    label: '5. Đơn trùng lặp nội dung đã có văn bản giải quyết có hiệu lực pháp luật',
    chiTiet:
      'Đơn có cùng nội dung, đối tượng với vụ việc đã được cơ quan có thẩm quyền ban hành văn bản giải quyết đúng pháp luật, đã có thông báo chấm dứt xem xét giải quyết và không phát sinh tài liệu, chứng cứ mới.',
    canCu: 'Điều 28 Thông tư số 05/2021/TT-TTCP về xử lý đơn trùng lặp.',
    coQuanHuongDan: 'Lưu đơn theo dõi, không thụ lý giải quyết lại',
    noiDungHuongDan:
      'Cơ quan thông báo không thụ lý giải quyết lại đối với vụ việc đã có văn bản giải quyết có hiệu lực pháp luật.',
  },
  {
    id: 'thieu_tai_lieu_chung_cu',
    label: '6. Thiếu tài liệu, chứng cứ làm cơ sở xem xét và quá thời hạn bổ sung',
    chiTiet:
      'Đơn gửi đến không có đầy đủ tài liệu, chứng cứ làm cơ sở xem xét; cơ quan đã yêu cầu bổ sung nhưng quá thời hạn người nộp không cung cấp được hồ sơ hợp lệ.',
    canCu: 'Điều 24 Luật Khiếu nại 2011; Thông tư 05/2021/TT-TTCP.',
    coQuanHuongDan: 'Bộ phận Tiếp nhận hồ sơ',
    noiDungHuongDan:
      'Trả lại hồ sơ để người dân thu thập đầy đủ tài liệu chứng cứ, giấy tờ liên quan trước khi nộp lại.',
  },
  {
    id: 'khac',
    label: '7. Khác (Cán bộ tự nhập lý do cụ thể...)',
    chiTiet: '',
    canCu: 'Luật Khiếu nại 2011; Luật Tố cáo 2018; Thông tư số 05/2021/TT-TTCP.',
    coQuanHuongDan: 'Cơ quan có thẩm quyền liên quan',
    noiDungHuongDan: 'Đề nghị công dân liên hệ cơ quan có thẩm quyền để được hướng dẫn giải quyết theo quy định.',
  },
];

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
    hinhThucTiepNhan: 'Trực tiếp tại cơ quan',
  },
}: TraLaiDonModalProps) {
  // Tabs: 'form' (Lập lý do và hướng dẫn) vs 'preview' (Xem trước Văn bản/Thông báo trả lại)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Lý do trả lại đơn (mặc định là lý do đầu tiên)
  const [lyDoChinh, setLyDoChinh] = useState<string>('khong_thuoc_tham_quyen');
  const [lyDoChiTiet, setLyDoChiTiet] = useState<string>(TRA_LAI_REASONS[0].chiTiet);
  const [canCuPhapLy, setCanCuPhapLy] = useState<string>(TRA_LAI_REASONS[0].canCu);
  const [coQuanHuongDan, setCoQuanHuongDan] = useState<string>(TRA_LAI_REASONS[0].coQuanHuongDan);
  const [noiDungHuongDan, setNoiDungHuongDan] = useState<string>(TRA_LAI_REASONS[0].noiDungHuongDan);

  // Thông tin địa chỉ trả lại của đương sự (mặc định lấy từ donInfo.diaChi)
  const [diaChiTraLai, setDiaChiTraLai] = useState<string>(donInfo.diaChi || 'Cầu Giấy, Hà Nội');

  // Cấu hình văn bản trả lại
  const [soKyHieu, setSoKyHieu] = useState<string>('28/TL-TCD');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cập nhật địa chỉ khi donInfo thay đổi
  useEffect(() => {
    if (donInfo.diaChi) {
      setDiaChiTraLai(donInfo.diaChi);
    }
  }, [donInfo.diaChi]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  // Xác định hình thức nhận kết quả của đương sự tự động từ hình thức tiếp nhận của lượt nhận
  const hinhThucNhanInfo = useMemo(() => {
    const rawHinhThuc = (donInfo.hinhThucTiepNhan || 'Trực tiếp').toLowerCase();

    if (rawHinhThuc.includes('bưu') || rawHinhThuc.includes('buu') || rawHinhThuc.includes('chính')) {
      return {
        key: 'buu_chinh_cong_ich' as const,
        label: 'Gửi qua Bưu chính công ích',
        moTa: 'Hồ sơ và Văn bản trả lời sẽ được gửi chuyển phát bảo đảm qua Bưu chính công ích về địa chỉ của đương sự.',
        icon: 'local_shipping',
        badge: 'Bưu chính công ích',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      };
    }

    if (
      rawHinhThuc.includes('cổng') ||
      rawHinhThuc.includes('dvc') ||
      rawHinhThuc.includes('tuyến') ||
      rawHinhThuc.includes('online') ||
      rawHinhThuc.includes('công')
    ) {
      return {
        key: 'cong_dvc_dien_tu' as const,
        label: 'Cổng Dịch vụ công điện tử',
        moTa: 'Kết quả số hóa được gửi trực tiếp vào hòm thư điện tử và tài khoản Dịch vụ công của công dân.',
        icon: 'language',
        badge: 'Cổng DVC trực tuyến',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      };
    }

    // Mặc định: Trực tiếp
    return {
      key: 'truc_tiep_tai_bo_phan' as const,
      label: 'Nhận trực tiếp tại Bộ phận Tiếp công dân',
      moTa: 'Đương sự trực tiếp đến trụ sở Tiếp công dân để ký nhận lại hồ sơ và văn bản trả lời.',
      icon: 'person_pin_circle',
      badge: 'Trực tiếp tại trụ sở',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    };
  }, [donInfo.hinhThucTiepNhan]);

  // Xử lý khi chọn lý do từ dropdown
  const handleSelectLyDo = (key: string) => {
    setLyDoChinh(key);
    const matched = TRA_LAI_REASONS.find((r) => r.id === key);

    if (matched) {
      if (key === 'khac') {
        setLyDoChiTiet('');
        setCanCuPhapLy(matched.canCu);
        setCoQuanHuongDan('');
        setNoiDungHuongDan('');
      } else {
        setLyDoChiTiet(matched.chiTiet);
        setCanCuPhapLy(matched.canCu);
        setCoQuanHuongDan(matched.coQuanHuongDan);
        setNoiDungHuongDan(matched.noiDungHuongDan);
      }
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!lyDoChiTiet.trim()) {
      errs.lyDo = 'Vui lòng nhập lý do trả lại đơn để thông báo cho đương sự.';
    }

    if (!diaChiTraLai.trim()) {
      errs.diaChi = 'Vui lòng nhập địa chỉ nhận lại hồ sơ của đương sự.';
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
        nguoiNhan: donInfo.nguoiNop || 'Đương sự',
        diaChiNhan: diaChiTraLai.trim(),
        sdtLienHe: donInfo.sdt,
        hinhThucNhan: hinhThucNhanInfo.label,
        phuongThucTra: hinhThucNhanInfo.key,
        cauHinhVanBan: {
          taoVanBan: true,
          loaiVanBan: 'van_ban_tra_loi_don',
          soKyHieu: soKyHieu.trim(),
          ngayBanHanh: todayStr,
          nguoiLap: currentOfficerName,
          coQuanHuongDan: coQuanHuongDan.trim(),
          diaChiCoQuan: 'Số 10 phố Tôn Thất Thuyết, Cầu Giấy, Hà Nội',
          noiDungHuongDan: noiDungHuongDan.trim(),
          chuKyCanBo: {
            daKySo: true,
            tenCanBo: currentOfficerName,
            chucDanh: 'Chuyên viên Tiếp công dân & Xử lý đơn',
            phuongThucKy: 'vgca',
            thoiGianKy: `${todayStr} 09:30:15`,
          },
        },
      });
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
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
                  • Mẫu số 02/TL-Đ (TT 05/2021/TT-TTCP)
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
                <span>Xem trước Mẫu 02 (A4)</span>
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
              Đương sự: <strong className="text-slate-900">{donInfo.nguoiNop}</strong>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error summary */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-shake">
                  <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">error</span>
                  <div>
                    <strong className="block font-bold">Vui lòng kiểm tra lại:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11.5px]">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ──────────────── 1. CHỌN LÝ DO TRẢ LẠI ĐƠN ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Lý do trả lại đơn <span className="text-rose-500">*</span>
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Chọn lý do theo luật định hoặc nhập Khác</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Chọn lý do trả lại đơn:
                  </label>
                  <select
                    value={lyDoChinh}
                    onChange={(e) => handleSelectLyDo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500 focus:bg-white shadow-2xs cursor-pointer transition-colors"
                  >
                    {TRA_LAI_REASONS.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nếu chọn lý do "Khác" -> Cho nhập lý do vào */}
                {lyDoChinh === 'khac' ? (
                  <div className="space-y-1.5 animate-fade-in pt-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Nhập lý do trả lại đơn cụ thể <span className="text-rose-500">*</span>:
                    </label>
                    <textarea
                      rows={3}
                      value={lyDoChiTiet}
                      onChange={(e) => setLyDoChiTiet(e.target.value)}
                      placeholder="Ghi rõ lý do trả lại đơn để thông báo cho đương sự..."
                      className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-200 resize-none shadow-2xs leading-relaxed"
                    />
                    {errors.lyDo && <p className="text-[11px] text-rose-600 font-medium">{errors.lyDo}</p>}
                  </div>
                ) : (
                  /* Hiển thị tóm tắt lý do và căn cứ pháp lý đã được chọn */
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5 animate-fade-in">
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <span className="material-symbols-outlined text-rose-600 text-[16px] shrink-0 mt-0.5">info</span>
                      <p className="leading-relaxed italic text-slate-800">&quot;{lyDoChiTiet}&quot;</p>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                      Căn cứ: {canCuPhapLy}
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────────── 2. THÔNG TIN ĐỊA CHỈ TRẢ LẠI CỦA ĐƯƠNG SỰ ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Thông tin đương sự &amp; Địa chỉ trả lại hồ sơ
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Địa chỉ nhận kết quả</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Họ tên đương sự:</span>
                    <strong className="text-slate-900 text-sm block">{donInfo.nguoiNop}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">CCCD: {donInfo.cccd || '001088012345'}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Số điện thoại liên hệ:</span>
                    <span className="font-mono font-bold text-slate-800 text-sm block">
                      {donInfo.sdt || '0983 123 456'}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      Đã xác thực thông tin
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Địa chỉ nhận lại hồ sơ, văn bản <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={diaChiTraLai}
                      onChange={(e) => setDiaChiTraLai(e.target.value)}
                      placeholder="Nhập địa chỉ trả lại hồ sơ..."
                      className="w-full p-2 bg-slate-50 hover:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-rose-500 focus:bg-white shadow-2xs transition-colors"
                    />
                    {errors.diaChi && <p className="text-[11px] text-rose-600 font-medium mt-0.5">{errors.diaChi}</p>}
                  </div>
                </div>
              </div>

              {/* ──────────────── 3. HÌNH THỨC NHẬN CỦA ĐƯƠNG SỰ (ĐỒNG BỘ TỪ LƯỢT NHẬN) ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Hình thức nhận của đương sự
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">sync</span>
                    Tự động đồng bộ từ Lượt nhận
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[22px]">{hinhThucNhanInfo.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-xs sm:text-sm text-slate-900">{hinhThucNhanInfo.label}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${hinhThucNhanInfo.badgeColor}`}>
                        {hinhThucNhanInfo.badge}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        (Nguồn tiếp nhận: {donInfo.hinhThucTiepNhan || 'Trực tiếp tại trụ sở'})
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
                      {hinhThucNhanInfo.moTa}
                    </p>
                  </div>
                </div>
              </div>

              {/* ──────────────── 4. KÝ SỐ & VĂN BẢN TRẢ LỜI ĐƠN (MẪU SỐ 02/TL-Đ) ──────────────── */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-rose-600 text-[20px]">assignment_turned_in</span>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Văn bản trả lời đơn cho đương sự (Mẫu số 02/TL-Đ) • Số: <strong className="font-mono text-rose-800">{soKyHieu}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Cán bộ xử lý: <strong>{currentOfficerName}</strong> ({currentDepartmentName}) • Ngày ban hành: {todayStr}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Đã tích hợp Chữ ký số VGCA</span>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 flex-wrap">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="px-4 py-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-900 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Xem bản in Mẫu 02 (A4)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang ban hành...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>Xác nhận &amp; Ban hành văn bản trả lại ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ===================== TAB PREVIEW: BẢN IN A4 MẪU SỐ 02/TL-Đ ===================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs text-slate-600">
                <span>
                  Bản in chuẩn thể thức: <strong>Mẫu số 02 - Văn bản trả lời đơn (ban hành kèm theo Thông tư số 05/2021/TT-TTCP của Thanh tra Chính phủ)</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">print</span>
                    <span>In văn bản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
              </div>

              {/* Tờ A4 Mockup Thể thức hành chính chuẩn */}
              <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-2xl mx-auto font-serif text-slate-900 space-y-6 text-sm leading-relaxed">
                {/* Quốc hiệu tiêu ngữ */}
                <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                  <div>
                    <p className="font-bold text-xs uppercase">{currentDepartmentName.toUpperCase()}</p>
                    <p className="font-bold text-xs">BỘ PHẬN TIẾP NHẬN &amp; XỬ LÝ ĐƠN</p>
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
                  <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                    VĂN BẢN TRẢ LỜI ĐƠN VÀ HƯỚNG DẪN ĐƯƠNG SỰ
                  </h1>
                  <p className="text-xs italic font-sans text-slate-700">
                    (V/v Trả lại hồ sơ đơn {donInfo.code || donInfo.luotNhanId} của ông/bà {donInfo.nguoiNop})
                  </p>
                </div>

                {/* Kính gửi */}
                <div className="font-sans text-xs space-y-1">
                  <p>
                    <strong>Kính gửi:</strong> Ông/Bà <strong>{donInfo.nguoiNop}</strong>
                  </p>
                  <p>- Địa chỉ nhận kết quả: <strong className="text-slate-900">{diaChiTraLai}</strong></p>
                  <p>- Số CCCD/Định danh: {donInfo.cccd || '001088012345'} - Điện thoại: {donInfo.sdt || '0983 123 456'}</p>
                  <p>- Hình thức gửi trả kết quả: <strong>{hinhThucNhanInfo.label}</strong></p>
                </div>

                {/* Nội dung trả lời */}
                <div className="space-y-3 font-sans text-xs text-justify">
                  <p>
                    {currentDepartmentName} nhận được đơn của ông/bà ghi ngày nộp {donInfo.ngayNhan || '16/09/2026'}.
                    Nội dung đơn: <em>&quot;{donInfo.noiDung}&quot;</em>.
                  </p>

                  <p>
                    Sau khi kiểm tra hồ sơ, đối chiếu quy định tại <strong>{canCuPhapLy}</strong>, {currentDepartmentName} nhận thấy:
                  </p>

                  <div className="p-3 bg-slate-50 border-l-2 border-rose-500 rounded-r text-slate-800 italic leading-relaxed">
                    &quot;{lyDoChiTiet}&quot;
                  </div>

                  <p>
                    Do đó, đơn của ông/bà không đủ điều kiện thụ lý giải quyết tại cơ quan chúng tôi. {currentDepartmentName} xin thông báo trả lại hồ sơ đơn kèm các giấy tờ tài liệu công dân đã nộp.
                  </p>

                  {noiDungHuongDan && (
                    <div>
                      <strong>HƯỚNG DẪN CÔNG DÂN:</strong>
                      <p className="mt-1 text-slate-800 leading-relaxed">
                        {noiDungHuongDan}
                      </p>
                      {coQuanHuongDan && (
                        <p className="mt-1 font-semibold text-slate-900">
                          • Cơ quan có thẩm quyền tiếp nhận giải quyết: {coQuanHuongDan}.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Nơi nhận và chữ ký */}
                <div className="grid grid-cols-2 gap-8 pt-6 font-sans">
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p className="font-bold text-xs text-slate-800">Nơi nhận:</p>
                    <p>- Như trên (để thực hiện);</p>
                    <p>- Lãnh đạo Ban (để báo cáo);</p>
                    <p>- Lưu: VT, Hồ sơ TCD ({soKyHieu}).</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="font-bold text-xs uppercase">CÁN BỘ XỬ LÝ ĐƠN</p>
                    <p className="text-[11px] italic text-slate-500">(Ký số, xác thực điện tử)</p>
                    <div className="h-16 flex items-center justify-center">
                      <div className="px-3 py-1 bg-rose-50 border border-dashed border-rose-300 text-rose-800 text-[10.5px] rounded font-mono font-bold leading-tight">
                        <div>ĐÃ KÝ SỐ ĐIỆN TỬ VGCA</div>
                        <div className="text-[9.5px] text-slate-500 mt-0.5">{currentOfficerName} • {todayStr}</div>
                      </div>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{currentOfficerName}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Quay lại biểu mẫu
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Xác nhận &amp; Ban hành văn bản ➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
