import React, { useState, useMemo } from 'react';
import { OFFICERS, Officer } from '../../constants/departments';

export interface ThuLyDonSubmitData {
  stepId: 'STEP-03A';
  huongXuLy: 'thu_ly';
  // Kiểm tra 3 điều kiện thụ lý luật định (Điều 29 Luật Tố cáo 2018 & TT 05/2021/TT-TTCP)
  dieuKienThuLy: {
    duNangLucHVDS: boolean;
    thuocThamQuyen: boolean;
    coCoSoViPham: boolean;
    xuatPhatTuKhieuNai: boolean;
    coChungCuViPhamKhiKhieuNai: boolean;
  };
  // Bảo vệ thông tin & ngăn chặn thiệt hại
  baoMatVaBaoVe: {
    giuBiMatNguoiToCao: boolean;
    maBaoMat?: string;
    deNghiBaoVe: boolean;
    apDungBienPhapNganChan: boolean;
    lyDoNganChan?: string;
  };
  // Phương thức thụ lý & phân công
  phuongThucThuLy: 'tu_thu_ly' | 'phan_cong_can_bo';
  canBoThuLyId?: string;
  canBoThuLyName?: string;
  thoiHanXacMinhNgay: number;
  chiDaoDinhHuong?: string;
  // Báo cáo đề xuất thụ lý (Mẫu số 01/TT-TTCP)
  cauHinhBaoCao: {
    taoBaoCao: boolean;
    soKyHieu: string;
    ngayLap: string;
    kinhGui: string;
    nguoiDeXuat: string;
    chucVuNguoiDeXuat: string;
    chuKySo: {
      daKySo: boolean;
      phuongThucKy: string;
      thoiGianKy: string;
    };
  };
}

export interface ThuLyDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ThuLyDonSubmitData) => void;
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
    nguoiBiToCao?: string;
    chucVuNguoiBiToCao?: string;
    coQuanNguoiBiToCao?: string;
  };
}

export default function ThuLyDonModal({
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
    loaiDon: 'Đơn tố cáo cán bộ vi phạm công vụ',
    noiDung: 'Tố cáo hành vi sách nhiễu, cố ý kéo dài thời gian giải quyết hồ sơ cấp Giấy chứng nhận quyền sử dụng đất trái quy định',
    ngayNhan: '16/09/2026',
    nguoiBiToCao: 'Trần Văn Cường',
    chucVuNguoiBiToCao: 'Chuyên viên Chi nhánh Văn phòng Đăng ký đất đai',
    coQuanNguoiBiToCao: 'Chi nhánh Văn phòng Đăng ký đất đai quận Cầu Giấy',
  },
}: ThuLyDonModalProps) {
  // Tab switcher: 'form' (Lập đề xuất 1 chạm) vs 'preview' (Xem trước Mẫu 01/TT-TTCP)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Điều kiện thụ lý theo Điều 29 Luật Tố cáo 2018
  const [duNangLucHVDS, setDuNangLucHVDS] = useState<boolean>(true);
  const [thuocThamQuyen, setThuocThamQuyen] = useState<boolean>(true);
  const [coCoSoViPham, setCoCoSoViPham] = useState<boolean>(true);
  const [xuatPhatTuKhieuNai, setXuatPhatTuKhieuNai] = useState<boolean>(false);
  const [coChungCuViPhamKhiKhieuNai, setCoChungCuViPhamKhiKhieuNai] = useState<boolean>(true);

  // Bảo vệ thông tin & Biện pháp ngăn chặn
  const [giuBiMatNguoiToCao, setGiuBiMatNguoiToCao] = useState<boolean>(true);
  const [deNghiBaoVe, setDeNghiBaoVe] = useState<boolean>(false);
  const [apDungBienPhapNganChan, setApDungBienPhapNganChan] = useState<boolean>(false);
  const [lyDoNganChan, setLyDoNganChan] = useState<string>(
    'Có dấu hiệu tẩu tán tài sản, hủy hoại tài liệu chứng cứ liên quan đến hành vi vi phạm.'
  );

  // Phương thức thụ lý & Phân công cán bộ
  const [phuongThucThuLy, setPhuongThucThuLy] = useState<'tu_thu_ly' | 'phan_cong_can_bo'>('tu_thu_ly');
  const [canBoThuLyId, setCanBoThuLyId] = useState<string>('officer-01');
  const [thoiHanXacMinhNgay, setThoiHanXacMinhNgay] = useState<number>(30);
  const [chiDaoDinhHuong, setChiDaoDinhHuong] = useState<string>(
    'Tập trung thu thập hồ sơ địa chính, trích xuất nhật ký tiếp nhận xử lý hồ sơ hành chính để đối chiếu thời hạn quy định.'
  );

  // Báo cáo Mẫu số 01/TT-TTCP
  const [soKyHieu, setSoKyHieu] = useState<string>('01/BC-TCD');
  const [kinhGui, setKinhGui] = useState<string>('Chủ tịch Ủy ban nhân dân quận Cầu Giấy');
  const [noiDungDeXuat, setNoiDungDeXuat] = useState<string>(
    'Đề xuất Chủ tịch UBND quận ban hành Quyết định thụ lý giải quyết tố cáo và thành lập Tổ xác minh nội dung tố cáo theo đúng quy định tại Điều 29, 30 Luật Tố cáo 2018.'
  );

  // Chữ ký số cán bộ
  const [daKySo, setDaKySo] = useState<boolean>(true);
  const [phuongThucKy, setPhuongThucKy] = useState<'vgca' | 'smart_ca' | 'token'>('vgca');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  const maBaoMat = useMemo(() => {
    return `TC-SEC-${donInfo.code?.replace(/[^0-9]/g, '').slice(-4) || '8819'}`;
  }, [donInfo.code]);

  const selectedOfficerObj = useMemo(() => {
    return OFFICERS.find((o) => o.id === canBoThuLyId) || OFFICERS[0];
  }, [canBoThuLyId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({
        stepId: 'STEP-03A',
        huongXuLy: 'thu_ly',
        dieuKienThuLy: {
          duNangLucHVDS,
          thuocThamQuyen,
          coCoSoViPham,
          xuatPhatTuKhieuNai,
          coChungCuViPhamKhiKhieuNai: xuatPhatTuKhieuNai ? coChungCuViPhamKhiKhieuNai : true,
        },
        baoMatVaBaoVe: {
          giuBiMatNguoiToCao,
          maBaoMat: giuBiMatNguoiToCao ? maBaoMat : undefined,
          deNghiBaoVe,
          apDungBienPhapNganChan,
          lyDoNganChan: apDungBienPhapNganChan ? lyDoNganChan : undefined,
        },
        phuongThucThuLy,
        canBoThuLyId: phuongThucThuLy === 'phan_cong_can_bo' ? canBoThuLyId : undefined,
        canBoThuLyName: phuongThucThuLy === 'phan_cong_can_bo' ? selectedOfficerObj?.name : currentOfficerName,
        thoiHanXacMinhNgay,
        chiDaoDinhHuong,
        cauHinhBaoCao: {
          taoBaoCao: true,
          soKyHieu,
          ngayLap: todayStr,
          kinhGui,
          nguoiDeXuat: currentOfficerName,
          chucVuNguoiDeXuat: 'Chuyên viên Tiếp công dân & Xử lý đơn',
          chuKySo: {
            daKySo,
            phuongThucKy,
            thoiGianKy: `${todayStr} 09:45:00`,
          },
        },
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-6 py-4 border-b border-emerald-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Mẫu số 01 / TT 05/2021/TT-TTCP
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Luật Tố cáo 2018 (Điều 12, Điều 29)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Báo cáo đề xuất thụ lý giải quyết tố cáo
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher: Form vs Preview Mẫu 01 */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Thông tin đề xuất</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>Xem trước Mẫu 01 (A4)</span>
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
        <div className="bg-emerald-50/50 border-b border-emerald-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-950 font-label-technical flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-700 text-[16px]">folder_open</span>
              {donInfo.code || donInfo.luotNhanId}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700">
              Người tố cáo:{' '}
              <strong className="text-slate-900">
                {giuBiMatNguoiToCao ? `${donInfo.nguoiNop} (Mã mật: ${maBaoMat})` : donInfo.nguoiNop}
              </strong>
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-700 hidden sm:inline">
              Người bị tố cáo: <strong className="text-rose-900">{donInfo.nguoiBiToCao || 'Cán bộ địa chính'}</strong>
            </span>
          </div>
          <div className="text-[11px] text-emerald-800 font-medium">
            Người đề xuất: <strong>{currentOfficerName}</strong> ({currentDepartmentName})
          </div>
        </div>

        {/* ===================== BODY CONTENT ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notice Banner: Chuẩn hóa Thông tư 05/2021/TT-TTCP */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5 leading-relaxed">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">verified_user</span>
                <div>
                  <strong>Quy trình xử lý đơn tố cáo thuộc thẩm quyền:</strong> Theo Điều 12, Điều 29 Luật Tố cáo 2018 và Thông tư 05/2021/TT-TTCP, người xử lý đơn kiểm tra điều kiện thụ lý, báo cáo Người đứng đầu cơ quan để ban hành Quyết định thụ lý và thành lập Tổ xác minh. Hệ thống tự động lập sẵn <strong>Mẫu số 01</strong> kèm ký số VGCA.
                </div>
              </div>

              {/* ──────────────── 1. KIỂM TRA ĐIỀU KIỆN THỤ LÝ LUẬT ĐỊNH ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Kiểm tra điều kiện thụ lý (Điều 29 Luật Tố cáo 2018)
                    </h3>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Đủ điều kiện thụ lý
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Điều kiện 1 */}
                  <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 cursor-pointer flex items-start gap-2.5 transition-all">
                    <input
                      type="checkbox"
                      checked={duNangLucHVDS}
                      onChange={(e) => setDuNangLucHVDS(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-bold">1. Năng lực hành vi dân sự</strong>
                      <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                        Người tố cáo có đủ năng lực HVDS hoặc có người đại diện hợp pháp theo quy định.
                      </span>
                    </div>
                  </label>

                  {/* Điều kiện 2 */}
                  <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 cursor-pointer flex items-start gap-2.5 transition-all">
                    <input
                      type="checkbox"
                      checked={thuocThamQuyen}
                      onChange={(e) => setThuocThamQuyen(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-bold">2. Đúng thẩm quyền Điều 12</strong>
                      <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                        Vụ việc thuộc thẩm quyền người đứng đầu cơ quan quản lý CBCCVC bị tố cáo.
                      </span>
                    </div>
                  </label>

                  {/* Điều kiện 3 */}
                  <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 cursor-pointer flex items-start gap-2.5 transition-all">
                    <input
                      type="checkbox"
                      checked={coCoSoViPham}
                      onChange={(e) => setCoCoSoViPham(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <div className="text-xs">
                      <strong className="text-slate-900 block font-bold">3. Có cơ sở xác định vi phạm</strong>
                      <span className="text-slate-500 text-[11px] leading-tight block mt-0.5">
                        Xác định rõ người bị tố cáo, hành vi vi phạm pháp luật và tài liệu kèm theo.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Tùy chọn mở rộng: Xuất phát từ vụ việc khiếu nại */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={xuatPhatTuKhieuNai}
                      onChange={(e) => setXuatPhatTuKhieuNai(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>
                      Tố cáo xuất phát từ vụ việc khiếu nại đã giải quyết chuyển sang tố cáo người giải quyết khiếu nại
                    </span>
                  </label>

                  {xuatPhatTuKhieuNai && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
                        <span className="font-bold">Quy định đặc thù khi tố cáo người giải quyết khiếu nại:</span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-amber-800">
                        Chỉ thụ lý tố cáo khi người tố cáo cung cấp được thông tin, tài liệu, chứng cứ chứng minh người giải quyết khiếu nại có hành vi cản trở, đe dọa, thiếu trách nhiệm, làm sai lệch hồ sơ hoặc bao che vi phạm.
                      </p>
                      <label className="flex items-center gap-2 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={coChungCuViPhamKhiKhieuNai}
                          onChange={(e) => setCoChungCuViPhamKhiKhieuNai(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span>Đã có tài liệu, chứng cứ chứng minh người giải quyết khiếu nại vi phạm pháp luật</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* ──────────────── 2. BẢO MẬT THÔNG TIN & BIỆN PHÁP NGĂN CHẶN ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Bảo mật thông tin &amp; Biện pháp ngăn chặn (Điều 26, Điều 47)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Bảo vệ theo quy định pháp luật</span>
                </div>

                <div className="space-y-3">
                  {/* Option Bảo vệ bí mật thông tin */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">lock</span>
                      <div>
                        <strong className="text-xs text-slate-900 block font-bold">
                          Giữ bí mật thông tin và bảo vệ người tố cáo (Điều 47 Luật Tố cáo 2018)
                        </strong>
                        <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                          Hệ thống tự động ẩn họ tên, thông tin nhân thân của người tố cáo trên các văn bản luân chuyển công khai. Mã định danh bảo vệ: <strong className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">{maBaoMat}</strong>.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={giuBiMatNguoiToCao}
                        onChange={(e) => setGiuBiMatNguoiToCao(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Option Đề xuất biện pháp ngăn chặn khẩn cấp */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0 mt-0.5">warning</span>
                      <div>
                        <strong className="text-xs text-slate-900 block font-bold">
                          Kiến nghị áp dụng biện pháp ngăn chặn khẩn cấp (Khoản 2 Điều 26)
                        </strong>
                        <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                          Kích hoạt khi hành vi bị tố cáo gây thiệt hại hoặc đe dọa gây thiệt hại nghiêm trọng đến lợi ích Nhà nước, tổ chức, cá nhân (phong tỏa tài khoản, đình chỉ thi công, niêm phong tài liệu...).
                        </p>
                        {apDungBienPhapNganChan && (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={lyDoNganChan}
                              onChange={(e) => setLyDoNganChan(e.target.value)}
                              placeholder="Nội dung biện pháp ngăn chặn khẩn cấp đề xuất..."
                              className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg text-slate-800 focus:outline-none focus:border-rose-600"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={apDungBienPhapNganChan}
                        onChange={(e) => setApDungBienPhapNganChan(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ──────────────── 3. ĐỀ XUẤT THỤ LÝ & PHÂN CÔNG TỔ XÁC MINH ──────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Phương thức thụ lý &amp; Phân công cán bộ
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Thời hạn xác minh: 30 ngày</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPhuongThucThuLy('tu_thu_ly')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      phuongThucThuLy === 'tu_thu_ly'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-200 shadow-2xs'
                        : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="phuongThucThuLy"
                        checked={phuongThucThuLy === 'tu_thu_ly'}
                        onChange={() => setPhuongThucThuLy('tu_thu_ly')}
                        className="text-emerald-600"
                      />
                      <span className="font-bold text-xs text-slate-900">Tôi trực tiếp thụ lý (Tổ trưởng xác minh)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-5">
                      Cán bộ hiện tại ({currentOfficerName}) trực tiếp lập hồ sơ xác minh và dự thảo Kết luận nội dung tố cáo.
                    </p>
                  </div>

                  <div
                    onClick={() => setPhuongThucThuLy('phan_cong_can_bo')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      phuongThucThuLy === 'phan_cong_can_bo'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-200 shadow-2xs'
                        : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="phuongThucThuLy"
                        checked={phuongThucThuLy === 'phan_cong_can_bo'}
                        onChange={() => setPhuongThucThuLy('phan_cong_can_bo')}
                        className="text-emerald-600"
                      />
                      <span className="font-bold text-xs text-slate-900">Phân công cán bộ chuyên môn khác</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-5">
                      Giao cho cán bộ/thanh tra viên có chuyên môn thuộc đơn vị chủ trì xác minh.
                    </p>
                  </div>
                </div>

                {phuongThucThuLy === 'phan_cong_can_bo' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-700">
                      Chọn cán bộ chủ trì xác minh:
                    </label>
                    <select
                      value={canBoThuLyId}
                      onChange={(e) => setCanBoThuLyId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-medium"
                    >
                      {OFFICERS.filter((o) => o.departmentId === 'tiep-dan').map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} - {o.role} (Đang xử lý: {o.workloadCount} hồ sơ)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Định hướng chỉ đạo xác minh */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Định hướng nội dung xác minh (Đề xuất người đứng đầu):
                  </label>
                  <textarea
                    rows={2}
                    value={chiDaoDinhHuong}
                    onChange={(e) => setChiDaoDinhHuong(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* ──────────────── 4. KÝ SỐ CÁN BỘ & GỬI BÁO CÁO ──────────────── */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                    VGCA
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Ký số xác nhận Báo cáo đề xuất thụ lý (Mẫu số 01/TT-TTCP)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Cán bộ đề xuất: <strong>{currentOfficerName}</strong> • Chức thư số Ban Cơ yếu Chính phủ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sẵn sàng ký số
                  </span>
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
                    className="px-4 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Xem bản in A4</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>Ký số &amp; Báo cáo Người đứng đầu đề xuất thụ lý ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ===================== TAB PREVIEW: BẢN IN A4 MẪU SỐ 01 ===================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs text-slate-600">
                <span>
                  Bản in chuẩn thể thức: <strong>Mẫu số 01 ban hành kèm theo Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ</strong>
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">print</span>
                  <span>In báo cáo</span>
                </button>
              </div>

              {/* KHUNG A4 */}
              <div className="bg-white border border-slate-300 rounded-lg shadow-md p-8 sm:p-12 text-slate-900 font-serif leading-relaxed max-w-3xl mx-auto space-y-6 text-sm">
                {/* Header 2 cột Quốc hiệu & Tên cơ quan */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                  <div className="text-center space-y-0.5">
                    <p className="uppercase font-sans font-bold text-xs tracking-wider">ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY</p>
                    <p className="uppercase font-sans font-bold text-xs text-emerald-800 underline decoration-emerald-600">
                      BAN TIẾP CÔNG DÂN
                    </p>
                    <p className="font-sans text-[11px] text-slate-500 mt-1">Số: {soKyHieu}</p>
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="uppercase font-sans font-bold text-xs">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-sans font-bold text-xs">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="font-sans text-[11px] italic text-slate-600 mt-1">
                      Cầu Giấy, ngày {todayStr.split('/')[0]} tháng {todayStr.split('/')[1]} năm {todayStr.split('/')[2]}
                    </p>
                  </div>
                </div>

                {/* Tiêu đề văn bản */}
                <div className="text-center space-y-1 pt-2">
                  <h1 className="font-sans font-bold text-base uppercase tracking-wide">
                    BÁO CÁO
                  </h1>
                  <h2 className="font-sans font-bold text-sm uppercase text-slate-800">
                    Đề xuất thụ lý giải quyết tố cáo
                  </h2>
                  <p className="font-sans text-xs italic text-slate-500">
                    (Ban hành kèm theo Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ)
                  </p>
                </div>

                <div className="text-center font-sans text-xs pt-1">
                  Kính gửi:{' '}
                  <span className="font-bold underline uppercase">{kinhGui}</span>
                </div>

                {/* Nội dung báo cáo */}
                <div className="space-y-4 text-justify font-sans text-xs leading-relaxed text-slate-800">
                  <p>
                    Căn cứ Luật Tố cáo ngày 12 tháng 6 năm 2018;
                  </p>
                  <p>
                    Căn cứ Thông tư số 05/2021/TT-TTCP ngày 01 tháng 10 năm 2021 của Thanh tra Chính phủ quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh;
                  </p>
                  <p>
                    Ban Tiếp công dân quận Cầu Giấy báo cáo kết quả kiểm tra, xử lý đơn tố cáo với các nội dung cụ thể sau:
                  </p>

                  {/* Mục 1: Thông tin đương sự */}
                  <div className="space-y-1.5 pl-2">
                    <p className="font-bold text-slate-900">
                      I. Thông tin về người tố cáo và người bị tố cáo:
                    </p>
                    <div className="pl-4 space-y-1">
                      <p>
                        1. Người tố cáo:{' '}
                        <strong>
                          {giuBiMatNguoiToCao ? `[ĐÃ ÁP DỤNG CHẾ ĐỘ BẢO MẬT - MÃ: ${maBaoMat}]` : donInfo.nguoiNop}
                        </strong>
                        {giuBiMatNguoiToCao ? (
                          <span className="text-[11px] italic text-slate-500 block">
                            (Thông tin cá nhân được niêm phong trong Hồ sơ bảo mật theo Điều 47 Luật Tố cáo 2018)
                          </span>
                        ) : (
                          <span> - CCCD: {donInfo.cccd} - Địa chỉ: {donInfo.diaChi}</span>
                        )}
                      </p>
                      <p>
                        2. Người bị tố cáo: <strong className="text-rose-900">{donInfo.nguoiBiToCao || 'Cán bộ vi phạm'}</strong>
                        {donInfo.chucVuNguoiBiToCao && ` - Chức vụ: ${donInfo.chucVuNguoiBiToCao}`}
                        {donInfo.coQuanNguoiBiToCao && ` - Cơ quan: ${donInfo.coQuanNguoiBiToCao}`}
                      </p>
                    </div>
                  </div>

                  {/* Mục 2: Nội dung tố cáo và kết quả kiểm tra điều kiện */}
                  <div className="space-y-1.5 pl-2">
                    <p className="font-bold text-slate-900">
                      II. Nội dung tố cáo và kết quả kiểm tra điều kiện thụ lý:
                    </p>
                    <div className="pl-4 space-y-1">
                      <p>
                        1. Tóm tắt nội dung tố cáo: <em>"{donInfo.noiDung}"</em>
                      </p>
                      <p>2. Kết quả kiểm tra điều kiện thụ lý theo Điều 29 Luật Tố cáo 2018:</p>
                      <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-700">
                        <li>
                          Người tố cáo có đủ năng lực hành vi dân sự:{' '}
                          <strong className="text-emerald-700">{duNangLucHVDS ? 'Đạt yêu cầu' : 'Chưa đạt'}</strong>.
                        </li>
                        <li>
                          Vụ việc thuộc thẩm quyền giải quyết tố cáo của {kinhGui} theo quy định tại Điều 12 Luật Tố cáo 2018:{' '}
                          <strong className="text-emerald-700">{thuocThamQuyen ? 'Đúng thẩm quyền' : 'Không đúng'}</strong>.
                        </li>
                        <li>
                          Nội dung tố cáo có cơ sở để xác định người vi phạm, hành vi vi phạm pháp luật:{' '}
                          <strong className="text-emerald-700">{coCoSoViPham ? 'Có cơ sở rõ ràng kèm chứng cứ' : 'Chưa đủ'}</strong>.
                        </li>
                        {xuatPhatTuKhieuNai && (
                          <li>
                            Tố cáo xuất phát từ khiếu nại đã giải quyết: Đã có tài liệu chứng cứ chứng minh vi phạm của người giải quyết khiếu nại theo luật định.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Mục 3: Đề xuất, kiến nghị */}
                  <div className="space-y-1.5 pl-2">
                    <p className="font-bold text-slate-900">
                      III. Đề xuất, kiến nghị:
                    </p>
                    <div className="pl-4 space-y-1">
                      <p>
                        Từ kết quả kiểm tra nêu trên, đối chiếu với quy định tại Điều 12, Điều 29, Điều 30 Luật Tố cáo năm 2018, Ban Tiếp công dân trân trọng đề xuất Người đứng đầu cơ quan:
                      </p>
                      <p className="font-semibold text-slate-900">
                        1. Ban hành Quyết định thụ lý giải quyết tố cáo đối với hành vi nêu trên.
                      </p>
                      <p className="font-semibold text-slate-900">
                        2. Thành lập Tổ xác minh nội dung tố cáo; giao đồng chí{' '}
                        <u>{phuongThucThuLy === 'phan_cong_can_bo' ? selectedOfficerObj.name : currentOfficerName}</u> làm Tổ trưởng Tổ xác minh. Thời hạn xác minh là {thoiHanXacMinhNgay} ngày làm việc kể từ ngày ban hành Quyết định thụ lý.
                      </p>
                      {apDungBienPhapNganChan && (
                        <p className="font-semibold text-rose-900">
                          3. Kịp thời áp dụng biện pháp ngăn chặn theo quy định pháp luật: {lyDoNganChan}.
                        </p>
                      )}
                      {giuBiMatNguoiToCao && (
                        <p className="font-semibold text-emerald-900">
                          4. Nghiêm ngặt thực hiện chế độ giữ bí mật thông tin người tố cáo theo quy định tại Điều 47 Luật Tố cáo 2018.
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="pt-2">
                    Kính trình {kinhGui} xem xét, quyết định./.
                  </p>
                </div>

                {/* Phần ký duyệt 2 bên */}
                <div className="grid grid-cols-2 gap-4 pt-6 font-sans text-xs">
                  <div className="text-left space-y-1">
                    <p className="font-bold uppercase text-slate-700">Ý KIẾN PHÊ DUYỆT CỦA THỦ TRƯỞNG</p>
                    <p className="italic text-[11px] text-slate-500">(Đồng ý thụ lý / Giao Tổ xác minh thực hiện)</p>
                    <div className="h-16"></div>
                    <p className="font-bold text-slate-400">....................................................</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="font-bold uppercase text-slate-900">NGƯỜI BÁO CÁO ĐỀ XUẤT</p>
                    <p className="italic text-[11px] text-slate-500">
                      (Ký số điện tử chuyên dùng VGCA)
                    </p>

                    <div className="py-2 flex flex-col items-center justify-center">
                      <div className="p-2 border border-emerald-400 bg-emerald-50/50 rounded text-center w-52 text-[10.5px] leading-tight space-y-0.5">
                        <span className="font-bold text-emerald-900 block flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-emerald-700">verified</span>
                          ĐÃ KÝ SỐ ĐIỆN TỬ
                        </span>
                        <span className="text-slate-700 block font-semibold">{currentOfficerName}</span>
                        <span className="text-slate-500 block text-[9.5px]">Phòng Tiếp công dân &amp; Xử lý đơn</span>
                        <span className="text-slate-400 block text-[9px] font-mono">{todayStr} 09:45:00</span>
                      </div>
                    </div>

                    <p className="font-bold text-slate-900 pt-1">{currentOfficerName}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Quay lại chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Xác nhận nộp báo cáo Mẫu 01 ➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
