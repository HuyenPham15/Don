// src/components/modals/TaoBaoCaoDeXuatModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { SigningDocument, SignerItem } from '../../types/signing';

export interface BaoCaoDeXuatFormData {
  // 1. Thông tin tổng quan (Nhập phần hành chính)
  tieuDeBaoCao: string;
  nguoiDonViBaoCao: string;
  nguoiCoQuanNhan: string;
  soBaoCao?: string;
  ngayLap?: string;
  coQuanCapTren?: string;
  coQuanLap?: string;
  nguoiLap?: string;
  chucVuNguoiLap?: string;
  nguoiNhan?: string;
  soPhanCong?: string;
  ngayPhanCong?: string;
  maDon?: string;
  loaiDon?: string;

  // 2. Thông tin tóm tắt vụ việc (Nhập phần nội dung)
  tomTatNoiDungToCao: string;
  taiLieuChungCuKemTheo: string;
  ketQuaXacMinhSoBo: string;
  nguoiGuiDon?: string;
  diaChiNguoiGui?: string;
  ngayTiepNhan?: string;
  noiDungDon?: string;
  taiLieuThuThap?: string;
  noiDungXacMinh?: string;

  // 3. Nhận xét và Căn cứ pháp lý (Nhập phần phân tích)
  dieuKienThuLy: string;
  canCuPhapLyApDung: string;
  danhGiaNhanXet?: string;
  canCuPhapLy?: string;

  // 4. Đề xuất hướng xử lý cụ thể (Nhập phần kiến nghị)
  phuongAnDeXuat: number; // 1 | 2 | 3
  kienNghiChiTiet?: string;
  chiTietPhuongAn?: string;
  vanBanKemTheo?: string;
}

export interface TaoBaoCaoDeXuatModalProps {
  isOpen: boolean;
  onClose: () => void;
  donInfo?: {
    code?: string;
    title?: string;
    luotNhanId?: string;
    nguoiNop?: string;
    loaiDon?: string;
    noiDung?: string;
    ngayNhan?: string;
    canBoTiepNhan?: string;
    chucVuCanBo?: string;
    donViXuLy?: string;
    diaChi?: string;
    cccd?: string;
  };
  currentOfficer?: {
    name: string;
    chucVu: string;
    phongBan?: string;
    coQuan?: string;
  };
  initialHuongXuLy?: string;
  existingSigningDoc?: SigningDocument | null;
  onSaveDraft?: (formData: BaoCaoDeXuatFormData, updatedDoc: SigningDocument) => void;
  onSubmitToLeader?: (formData: BaoCaoDeXuatFormData, updatedDoc: SigningDocument) => void;
}

export const DANH_SACH_PHUONG_AN = [
  {
    id: 1,
    title: 'Thụ lý giải quyết',
    desc: 'Nếu đơn đủ điều kiện và thuộc thẩm quyền giải quyết của cơ quan.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    id: 2,
    title: 'Chuyển đơn đến cơ quan có thẩm quyền',
    desc: 'Nếu không thuộc thẩm quyền giải quyết của cơ quan mình.',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
  },
  {
    id: 3,
    title: 'Không thụ lý / Lưu đơn',
    desc: 'Nếu đơn nặc danh không có căn cứ, đơn trùng lặp, hoặc đã có kết luận giải quyết đúng pháp luật trước đó.',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
  },
];

/**
 * Hàm ánh xạ toàn bộ dữ liệu người dùng nhập vào biểu mẫu văn bản chuẩn:
 * “BÁO CÁO ĐỀ XUẤT HƯỚNG XỬ LÝ ĐƠN”
 */
export const buildBaoCaoXacMinhDocumentText = (data: BaoCaoDeXuatFormData): string => {
  const parts = (data.ngayLap || '16/09/2026').split('/');
  const ngayStr = parts[0] || '16';
  const thangStr = parts[1] || '09';
  const namStr = parts[2] || '2026';

  const coQuanCapTren = data.coQuanCapTren || 'CÔNG AN TP. HÀ NỘI';
  const coQuanLap = data.coQuanLap || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA';

  return `${coQuanCapTren}
${coQuanLap}
Số: ${data.soBaoCao || '24/BC-CQĐT'}

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Hà Nội, ngày ${ngayStr} tháng ${thangStr} năm ${namStr}

${(data.tieuDeBaoCao || 'BÁO CÁO ĐỀ XUẤT HƯỚNG XỬ LÝ ĐƠN').toUpperCase()}

${data.nguoiCoQuanNhan || data.nguoiNhan || 'Kính gửi: Thủ trưởng (Phó Thủ trưởng) Cơ quan'}

Người / Đơn vị báo cáo: ${data.nguoiDonViBaoCao || data.nguoiLap || 'Cán bộ thụ lý'}
Đơn vị công tác: ${coQuanLap}
Mã hồ sơ: ${data.maDon || 'Đ-2025-0105'}

1. THÔNG TIN TỔNG QUAN
- Tiêu đề báo cáo: ${data.tieuDeBaoCao}
- Người/Đơn vị báo cáo: ${data.nguoiDonViBaoCao}
- Người/Cơ quan nhận báo cáo: ${data.nguoiCoQuanNhan}

2. THÔNG TIN TÓM TẮT VỤ VIỆC
- Tóm tắt nội dung tố cáo:
${data.tomTatNoiDungToCao || data.noiDungDon || ''}

- Tài liệu, chứng cứ kèm theo:
${data.taiLieuChungCuKemTheo || data.taiLieuThuThap || ''}

- Kết quả xác minh sơ bộ (nếu có):
${data.ketQuaXacMinhSoBo || data.noiDungXacMinh || '(Chưa có)'}

3. NHẬN XÉT VÀ CĂN CỨ PHÁP LÝ
- Điều kiện thụ lý:
${data.dieuKienThuLy || data.danhGiaNhanXet || ''}

- Căn cứ pháp lý áp dụng:
${data.canCuPhapLyApDung || data.canCuPhapLy || ''}

4. ĐỀ XUẤT HƯỚNG XỬ LÝ CỤ THỂ
Lựa chọn phương án:
[${data.phuongAnDeXuat === 1 ? 'X' : '  '}] Phương án 1: Thụ lý giải quyết (Nếu đơn đủ điều kiện và thuộc thẩm quyền).
[${data.phuongAnDeXuat === 2 ? 'X' : '  '}] Phương án 2: Chuyển đơn đến cơ quan có thẩm quyền (Nếu không thuộc thẩm quyền của mình).
[${data.phuongAnDeXuat === 3 ? 'X' : '  '}] Phương án 3: Không thụ lý / Lưu đơn (Nếu đơn nặc danh không có căn cứ, đơn trùng lặp, hoặc đã có kết luận giải quyết đúng pháp luật trước đó).

${data.kienNghiChiTiet || data.chiTietPhuongAn ? `Nội dung kiến nghị cụ thể: ${data.kienNghiChiTiet || data.chiTietPhuongAn}\n` : ''}${data.vanBanKemTheo ? `Dự thảo văn bản kèm theo: ${data.vanBanKemTheo}\n` : ''}
Kính trình Đồng chí phê duyệt./.

	NGƯỜI LẬP BÁO CÁO
	(Ký, ghi rõ họ tên)
	${data.nguoiDonViBaoCao?.split('-')[0]?.trim() || data.nguoiLap || 'Nguyễn Minh Anh'}
`;
};

export default function TaoBaoCaoDeXuatModal({
  isOpen,
  onClose,
  donInfo,
  currentOfficer,
  initialHuongXuLy,
  existingSigningDoc,
  onSaveDraft,
  onSubmitToLeader,
}: TaoBaoCaoDeXuatModalProps) {
  const maDon = donInfo?.code || 'Đ-2025-0105';
  const loaiDon = donInfo?.loaiDon?.includes('khiếu nại') ? 'Đơn tố cáo' : (donInfo?.loaiDon || 'Đơn tố cáo');
  const nguoiGuiDonDefault = donInfo?.nguoiNop || 'Vũ Thị Thanh';
  const diaChiNguoiGuiDefault = donInfo?.diaChi || 'Số 15 đường Cầu Giấy, phường Quan Hoa, quận Cầu Giấy, Hà Nội';
  const ngayTiepNhanDefault = donInfo?.ngayNhan || '16/09/2026 09:30';

  const todayFormatted = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  // 1. Thông tin tổng quan (Nhập phần hành chính)
  const defaultTieuDe = donInfo?.loaiDon
    ? `Báo cáo đề xuất hướng xử lý ${donInfo.loaiDon.toLowerCase()} của công dân ${donInfo.nguoiNop || ''}`.trim()
    : `Báo cáo đề xuất hướng xử lý đơn tố cáo của công dân ${donInfo?.nguoiNop || 'Vũ Thị Thanh'}`;
  const defaultNguoiDonVi = `${currentOfficer?.name || donInfo?.canBoTiepNhan || 'Nguyễn Minh Anh'} - ${donInfo?.donViXuLy || currentOfficer?.phongBan || 'Phòng Tiếp công dân & Xử lý đơn'}`;
  const defaultNguoiNhan = 'Kính gửi: Thủ trưởng (Phó Thủ trưởng) Cơ quan Cảnh sát điều tra';

  const [tieuDeBaoCao, setTieuDeBaoCao] = useState<string>(defaultTieuDe);
  const [nguoiDonViBaoCao, setNguoiDonViBaoCao] = useState<string>(defaultNguoiDonVi);
  const [nguoiCoQuanNhan, setNguoiCoQuanNhan] = useState<string>(defaultNguoiNhan);

  // Administrative metadata
  const [soBaoCao, setSoBaoCao] = useState<string>('24/BC-CQĐT');
  const [ngayLap, setNgayLap] = useState<string>(todayFormatted);
  const [coQuanCapTren, setCoQuanCapTren] = useState<string>('CÔNG AN TP. HÀ NỘI');
  const [coQuanLap, setCoQuanLap] = useState<string>('CƠ QUAN CẢNH SÁT ĐIỀU TRA');

  // 2. Thông tin tóm tắt vụ việc (Nhập phần nội dung)
  const defaultTomTat = donInfo?.title || donInfo?.noiDung
    ? `Công dân ${donInfo?.nguoiNop || 'Vũ Thị Thanh'} (địa chỉ: ${donInfo?.diaChi || 'quận Cầu Giấy, TP. Hà Nội'}) tố cáo ông/bà đại diện Công ty Cổ phần Đầu tư & Phát triển Đô thị X có hành vi vi phạm: ${donInfo?.title || donInfo?.noiDung}.`
    : `Công dân ${nguoiGuiDonDefault} tố cáo đại diện Công ty Cổ phần Đầu tư & Phát triển Đô thị X có hành vi vi phạm quy định pháp luật trong quản lý đất đai và trật tự xây dựng, có dấu hiệu chiếm đoạt tài sản.`;

  const defaultChungCu =
    `- Các tài liệu chứng cứ do người tố cáo cung cấp: Đơn tố cáo bản chính; Bản sao CCCD; Hợp đồng giao dịch, phiếu thu và chứng từ sao kê ngân hàng; tệp ghi âm, hình ảnh vi bằng ghi nhận diễn biến vi phạm.\n- Mức độ xác thực ban đầu: Đã đối chiếu giấy tờ tùy thân và tài liệu nộp kèm, các văn bản có chữ ký, con dấu của pháp nhân và chứng từ sao kê qua ngân hàng thương mại có giá trị chứng minh ban đầu.`;

  const defaultXacMinhSoBo =
    `Đã kiểm tra nhanh trên Cơ sở dữ liệu quốc gia về dân cư và hệ thống quản lý đơn thư: Người tố cáo có nhân thân rõ ràng, đúng địa chỉ cư trú; tổ chức bị tố cáo đang hoạt động theo Giấy chứng nhận ĐKKD số 0108293847; chưa phát hiện đơn trùng lặp đã được cơ quan có thẩm quyền giải quyết trước đó.`;

  const [tomTatNoiDungToCao, setTomTatNoiDungToCao] = useState<string>(defaultTomTat);
  const [taiLieuChungCuKemTheo, setTaiLieuChungCuKemTheo] = useState<string>(defaultChungCu);
  const [ketQuaXacMinhSoBo, setKetQuaXacMinhSoBo] = useState<string>(defaultXacMinhSoBo);

  // 3. Nhận xét và Căn cứ pháp lý (Nhập phần phân tích)
  const defaultDieuKien =
    `- Về điều kiện thụ lý: Đơn có họ tên, địa chỉ, chữ ký của người tố cáo; nội dung tố cáo rõ ràng, có căn cứ, người và hành vi vi phạm cụ thể, kèm theo tài liệu chứng cứ xác thực ban đầu.\n- Về thẩm quyền: Vụ việc phát sinh trên địa bàn quản lý, thuộc thẩm quyền xem xét, giải quyết của cơ quan.\n- Về tính trùng lặp: Đơn nộp lần đầu, không trùng lặp với đơn đang thụ lý hoặc đã có kết luận giải quyết trước đó.`;

  const defaultCanCu =
    `Căn cứ Điều 145, 146, 147 Bộ luật Tố tụng hình sự năm 2015 (sửa đổi, bổ sung 2021); Điều 174 Bộ luật Hình sự năm 2015; Luật Tố cáo năm 2018; Thông tư liên tịch số 01/2017/TTLT-BCA-BQP-BTC-BNN&PTNT-VKSNDTC.`;

  const [dieuKienThuLy, setDieuKienThuLy] = useState<string>(defaultDieuKien);
  const [canCuPhapLyApDung, setCanCuPhapLyApDung] = useState<string>(defaultCanCu);

  // 4. Đề xuất hướng xử lý cụ thể (Nhập phần kiến nghị)
  const [phuongAnDeXuat, setPhuongAnDeXuat] = useState<number>(1);
  const [kienNghiChiTiet, setKienNghiChiTiet] = useState<string>(
    `Đơn đủ điều kiện thụ lý và thuộc thẩm quyền giải quyết của cơ quan. Đề xuất Thủ trưởng Cơ quan phê duyệt thụ lý giải quyết theo quy định, giao cán bộ thụ lý lập kế hoạch xác minh chi tiết.`
  );
  const [vanBanKemTheo, setVanBanKemTheo] = useState<string>(
    `Dự thảo Thông báo thụ lý giải quyết đơn; Kế hoạch xác minh; Danh mục tài liệu chứng cứ kèm theo.`
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tự động nạp dữ liệu khi modal mở hoặc thay đổi hồ sơ/văn bản đã có
  useEffect(() => {
    if (!isOpen) return;

    if (existingSigningDoc) {
      const savedFormData = (existingSigningDoc as any).formData as BaoCaoDeXuatFormData | undefined;
      if (savedFormData) {
        setTieuDeBaoCao(savedFormData.tieuDeBaoCao || defaultTieuDe);
        setNguoiDonViBaoCao(savedFormData.nguoiDonViBaoCao || defaultNguoiDonVi);
        setNguoiCoQuanNhan(savedFormData.nguoiCoQuanNhan || defaultNguoiNhan);

        setSoBaoCao(savedFormData.soBaoCao || existingSigningDoc.soKyHieu || '24/BC-CQĐT');
        setNgayLap(savedFormData.ngayLap || todayFormatted);
        setCoQuanCapTren(savedFormData.coQuanCapTren || 'CÔNG AN TP. HÀ NỘI');
        setCoQuanLap(savedFormData.coQuanLap || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA');

        setTomTatNoiDungToCao(savedFormData.tomTatNoiDungToCao || savedFormData.noiDungDon || defaultTomTat);
        setTaiLieuChungCuKemTheo(savedFormData.taiLieuChungCuKemTheo || savedFormData.taiLieuThuThap || defaultChungCu);
        setKetQuaXacMinhSoBo(savedFormData.ketQuaXacMinhSoBo || savedFormData.noiDungXacMinh || defaultXacMinhSoBo);

        setDieuKienThuLy(savedFormData.dieuKienThuLy || savedFormData.danhGiaNhanXet || defaultDieuKien);
        setCanCuPhapLyApDung(savedFormData.canCuPhapLyApDung || savedFormData.canCuPhapLy || defaultCanCu);

        setPhuongAnDeXuat(savedFormData.phuongAnDeXuat || 1);
        setKienNghiChiTiet(savedFormData.kienNghiChiTiet || savedFormData.chiTietPhuongAn || '');
        setVanBanKemTheo(savedFormData.vanBanKemTheo || '');
      } else {
        setSoBaoCao(existingSigningDoc.soKyHieu || '24/BC-CQĐT');
        setNgayLap(existingSigningDoc.ngayTao ? existingSigningDoc.ngayTao.split(' ')[0] : todayFormatted);
        setCoQuanLap(existingSigningDoc.donViNguoiLap || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA');
        if (existingSigningDoc.lanhDaoName) {
          setNguoiCoQuanNhan(`Kính gửi: ${existingSigningDoc.lanhDaoName} (${existingSigningDoc.lanhDaoChucVu || 'Thủ trưởng CQĐT'})`);
        }
        if (existingSigningDoc.tenVanBan) {
          setTieuDeBaoCao(existingSigningDoc.tenVanBan);
        }
        if (existingSigningDoc.noiDungChiTiet) {
          if (/\[X\]\s*Phương án 1|Thụ lý/i.test(existingSigningDoc.noiDungChiTiet)) setPhuongAnDeXuat(1);
          else if (/\[X\]\s*Phương án 2|Chuyển thẩm quyền/i.test(existingSigningDoc.noiDungChiTiet)) setPhuongAnDeXuat(2);
          else if (/\[X\]\s*Phương án 3|Không thụ lý|Lưu đơn/i.test(existingSigningDoc.noiDungChiTiet)) setPhuongAnDeXuat(3);
        }
      }
    } else {
      const generatedSo = `${maDon.replace(/\D/g, '') || '24'}/BC-CQĐT`;
      setSoBaoCao(generatedSo);
      setNgayLap(todayFormatted);
      setCoQuanCapTren('CÔNG AN TP. HÀ NỘI');
      setCoQuanLap(donInfo?.donViXuLy || currentOfficer?.phongBan || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA');

      setTieuDeBaoCao(defaultTieuDe);
      setNguoiDonViBaoCao(defaultNguoiDonVi);
      setNguoiCoQuanNhan(defaultNguoiNhan);

      setTomTatNoiDungToCao(defaultTomTat);
      setTaiLieuChungCuKemTheo(defaultChungCu);
      setKetQuaXacMinhSoBo(defaultXacMinhSoBo);

      setDieuKienThuLy(defaultDieuKien);
      setCanCuPhapLyApDung(defaultCanCu);

      if (initialHuongXuLy === 'thu_ly') setPhuongAnDeXuat(1);
      else if (initialHuongXuLy === 'ban_giao') setPhuongAnDeXuat(2);
      else if (initialHuongXuLy === 'tra_loi_don' || initialHuongXuLy === 'luu_don') setPhuongAnDeXuat(3);
      else setPhuongAnDeXuat(1);
    }

    setErrors({});
  }, [isOpen, existingSigningDoc, donInfo, currentOfficer, todayFormatted, maDon, initialHuongXuLy]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectPhuongAn = (paId: number) => {
    setPhuongAnDeXuat(paId);
    if (paId === 1) {
      setKienNghiChiTiet(
        'Đơn đủ điều kiện thụ lý và thuộc thẩm quyền giải quyết của cơ quan. Đề xuất Thủ trưởng Cơ quan phê duyệt thụ lý giải quyết theo quy định, giao cán bộ thụ lý lập kế hoạch xác minh chi tiết.'
      );
    } else if (paId === 2) {
      setKienNghiChiTiet(
        'Vụ việc không thuộc thẩm quyền giải quyết của cơ quan. Đề xuất chuyển toàn bộ đơn và tài liệu chứng cứ kèm theo đến Cơ quan có đúng thẩm quyền để thụ lý, giải quyết; đồng thời ban hành văn bản thông báo chuyển đơn cho công dân.'
      );
    } else if (paId === 3) {
      setKienNghiChiTiet(
        'Đơn không đủ điều kiện thụ lý giải quyết (nặc danh / không có căn cứ xác thực / trùng lặp / đã có kết luận giải quyết đúng pháp luật trước đó). Đề xuất không thụ lý giải quyết và thực hiện lưu đơn theo đúng quy định pháp luật.'
      );
    }
  };

  const getCurrentFormData = (): BaoCaoDeXuatFormData => {
    return {
      // 1. Tổng quan
      tieuDeBaoCao: tieuDeBaoCao.trim(),
      nguoiDonViBaoCao: nguoiDonViBaoCao.trim(),
      nguoiCoQuanNhan: nguoiCoQuanNhan.trim(),
      soBaoCao: soBaoCao.trim(),
      ngayLap: ngayLap.trim(),
      coQuanCapTren: coQuanCapTren.trim(),
      coQuanLap: coQuanLap.trim(),
      nguoiLap: nguoiDonViBaoCao.split('-')[0]?.trim() || 'Nguyễn Minh Anh',
      chucVuNguoiLap: currentOfficer?.chucVu || 'Cán bộ thụ lý',
      nguoiNhan: nguoiCoQuanNhan.trim(),
      soPhanCong: `${maDon.replace(/\D/g, '') || '24'}/QĐ-CQĐT`,
      ngayPhanCong: ngayLap.trim(),
      maDon,
      loaiDon,

      // 2. Tóm tắt vụ việc
      tomTatNoiDungToCao: tomTatNoiDungToCao.trim(),
      taiLieuChungCuKemTheo: taiLieuChungCuKemTheo.trim(),
      ketQuaXacMinhSoBo: ketQuaXacMinhSoBo.trim(),
      nguoiGuiDon: nguoiGuiDonDefault,
      diaChiNguoiGui: diaChiNguoiGuiDefault,
      ngayTiepNhan: ngayTiepNhanDefault,
      noiDungDon: tomTatNoiDungToCao.trim(),
      taiLieuThuThap: taiLieuChungCuKemTheo.trim(),
      noiDungXacMinh: ketQuaXacMinhSoBo.trim(),

      // 3. Nhận xét & căn cứ pháp lý
      dieuKienThuLy: dieuKienThuLy.trim(),
      canCuPhapLyApDung: canCuPhapLyApDung.trim(),
      danhGiaNhanXet: dieuKienThuLy.trim(),
      canCuPhapLy: canCuPhapLyApDung.trim(),

      // 4. Đề xuất
      phuongAnDeXuat,
      kienNghiChiTiet: kienNghiChiTiet.trim(),
      chiTietPhuongAn: kienNghiChiTiet.trim(),
      vanBanKemTheo: vanBanKemTheo.trim(),
    };
  };

  // Kiểm tra tính hợp lệ của các trường bắt buộc
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tieuDeBaoCao.trim()) newErrors.tieuDeBaoCao = 'Vui lòng nhập Tiêu đề báo cáo.';
    if (!nguoiDonViBaoCao.trim()) newErrors.nguoiDonViBaoCao = 'Vui lòng nhập Người/Đơn vị báo cáo.';
    if (!nguoiCoQuanNhan.trim()) newErrors.nguoiCoQuanNhan = 'Vui lòng nhập Người/Cơ quan nhận báo cáo.';
    if (!tomTatNoiDungToCao.trim()) newErrors.tomTatNoiDungToCao = 'Vui lòng nhập Tóm tắt nội dung tố cáo.';
    if (!dieuKienThuLy.trim()) newErrors.dieuKienThuLy = 'Vui lòng nhập Đánh giá điều kiện thụ lý.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi nhấn "Lưu" (Tạo báo cáo với trạng thái Bản nháp)
  const handleSave = () => {
    if (!validateForm()) {
      showToast('⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc được đánh dấu đỏ!');
      return;
    }

    const formData = getCurrentFormData();
    const docText = buildBaoCaoXacMinhDocumentText(formData);

    const docId = existingSigningDoc?.id || `VB-BC-${Date.now().toString().slice(-4)}`;
    const defaultSigner: SignerItem = {
      id: existingSigningDoc?.lanhDaoId || 'ld-01',
      name: existingSigningDoc?.lanhDaoName || 'Đ/c Trần Văn Hùng',
      chucVu: existingSigningDoc?.lanhDaoChucVu || 'Thủ trưởng / Phó Thủ trưởng Cơ quan Điều tra',
      coQuan: formData.coQuanLap || 'Cơ quan Cảnh sát điều tra',
      vaiTro: 'duyet',
      thuTu: 1,
      status: 'chua_den_luot',
    };

    const actorName = formData.nguoiLap || currentOfficer?.name || 'Nguyễn Minh Anh';
    const actorRole = formData.chucVuNguoiLap || currentOfficer?.chucVu || 'Cán bộ thụ lý';
    const coQuan = formData.coQuanLap || donInfo?.donViXuLy || 'Cơ quan Cảnh sát điều tra';
    const ngayGioTao = `${formData.ngayLap || todayFormatted} 09:00`;

    const updatedDoc: SigningDocument = {
      id: docId,
      soKyHieu: formData.soBaoCao || '24/BC-CQĐT',
      hoSoCode: maDon,
      luotNhanId: donInfo?.luotNhanId || 'LN-2025-0105',
      loaiDon: formData.loaiDon || loaiDon,
      nguoiGuiDon: formData.nguoiGuiDon || nguoiGuiDonDefault,
      noiDungDon: formData.tomTatNoiDungToCao,

      tenVanBan: formData.tieuDeBaoCao || 'Báo cáo đề xuất hướng xử lý đơn',
      loaiVanBan: 'bao_cao_de_xuat',
      loaiVanBanLabel: 'Báo cáo đề xuất',
      trichYeu: `V/v Đề xuất xử lý đơn của ${formData.nguoiGuiDon || nguoiGuiDonDefault}`,
      noiDungChiTiet: docText,

      nguoiLap: actorName,
      donViNguoiLap: coQuan,
      ngayTao: ngayGioTao,

      status: 'nhap', // Trạng thái ban đầu: Bản nháp
      mucDoUuTien: 'thuong',
      hanXuLy: '24 giờ',

      signers: existingSigningDoc?.signers?.length ? existingSigningDoc.signers : [defaultSigner],
      currentSignerIndex: 0,
      lanhDaoId: existingSigningDoc?.lanhDaoId || defaultSigner.id,
      lanhDaoName: existingSigningDoc?.lanhDaoName || defaultSigner.name,
      lanhDaoChucVu: existingSigningDoc?.lanhDaoChucVu || defaultSigner.chucVu,

      tepDinhKem: existingSigningDoc?.tepDinhKem || [
        {
          id: `att-bc-${Date.now()}`,
          tenTep: `Bao_cao_de_xuat_${maDon}.pdf`,
          dungLuong: '380 KB',
          loai: 'du_thao',
        },
      ],

      phienBanHienTai: existingSigningDoc?.phienBanHienTai || 'V1',
      versionHistory: [
        ...(existingSigningDoc?.versionHistory || []),
        {
          version: existingSigningDoc?.phienBanHienTai || 'V1',
          thoiGian: ngayGioTao,
          nguoiTao: actorName,
          trangThaiLucDo: 'Bản nháp',
          ghiChu: 'Lập Báo cáo đề xuất hướng xử lý đơn',
          noiDungSnapshot: docText,
        },
      ],
      history: [
        ...(existingSigningDoc?.history || []),
        {
          id: `hist-${Date.now()}`,
          time: ngayGioTao,
          actor: actorName,
          action: 'Lập báo cáo đề xuất hướng xử lý đơn (Bản nháp)',
        },
      ],
      auditLogs: [
        ...(existingSigningDoc?.auditLogs || []),
        {
          id: `al-${Date.now()}`,
          time: ngayGioTao,
          actor: actorName,
          actorRole: actorRole,
          action: 'Lập văn bản',
          statusBefore: existingSigningDoc?.status || 'chua_tao',
          statusAfter: 'nhap',
          version: 'V1',
          note: `Phương án đề xuất: ${formData.phuongAnDeXuat}`,
        },
      ],
      stepId: 'STEP-02',
    };

    (updatedDoc as any).formData = formData;

    onSaveDraft?.(formData, updatedDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-body-md">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-slide-in max-w-md">
          <span className="material-symbols-outlined text-amber-400 text-lg shrink-0">warning</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Container modal chính */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* ================= HEADER ================= */}
        <div className="bg-white px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004ac6] shrink-0">
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Tạo Báo cáo đề xuất
              </h2>
              <p className="text-[11px] text-slate-500 font-normal">
                Báo cáo đề xuất hướng xử lý đơn theo quy trình thụ lý • Hồ sơ: <strong className="font-mono text-slate-800">{maDon}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            title="Đóng (Hủy)"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* ================= NỘI DUNG FORM ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white text-xs">

          {/* Cảnh báo lỗi chung nếu có */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-lg shrink-0">error</span>
              <span>
                Vui lòng kiểm tra lại các trường đánh dấu <strong>*</strong> bắt buộc trước khi lưu báo cáo.
              </span>
            </div>
          )}

          {/* Tiêu đề báo cáo */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tiêu đề báo cáo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={tieuDeBaoCao}
              onChange={(e) => {
                setTieuDeBaoCao(e.target.value);
                if (errors.tieuDeBaoCao) setErrors((prev) => ({ ...prev, tieuDeBaoCao: '' }));
              }}
              className={`w-full p-2.5 text-slate-800 bg-white border rounded-xl leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-[12.5px] ${errors.tieuDeBaoCao ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              placeholder="Ví dụ: Báo cáo đề xuất hướng xử lý đơn tố cáo của công dân..."
            />
            {errors.tieuDeBaoCao && <p className="text-[10.5px] text-rose-600 mt-1">{errors.tieuDeBaoCao}</p>}
          </div>

          {/* Grid 2 cột: Người/Đơn vị báo cáo & Người/Cơ quan nhận báo cáo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Người / Đơn vị báo cáo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nguoiDonViBaoCao}
                onChange={(e) => {
                  setNguoiDonViBaoCao(e.target.value);
                  if (errors.nguoiDonViBaoCao) setErrors((prev) => ({ ...prev, nguoiDonViBaoCao: '' }));
                }}
                className={`w-full p-2.5 text-slate-800 bg-white border rounded-xl leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.nguoiDonViBaoCao ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                placeholder="Tên cán bộ hoặc phòng/ban được giao nhiệm vụ xử lý đơn"
              />
              {errors.nguoiDonViBaoCao && <p className="text-[10.5px] text-rose-600 mt-1">{errors.nguoiDonViBaoCao}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Người / Cơ quan nhận báo cáo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nguoiCoQuanNhan}
                onChange={(e) => {
                  setNguoiCoQuanNhan(e.target.value);
                  if (errors.nguoiCoQuanNhan) setErrors((prev) => ({ ...prev, nguoiCoQuanNhan: '' }));
                }}
                className={`w-full p-2.5 text-slate-800 bg-white border rounded-xl leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.nguoiCoQuanNhan ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                placeholder="Ví dụ: Kính gửi: Giám đốc Sở / Thủ trưởng Cơ quan..."
              />
              {errors.nguoiCoQuanNhan && <p className="text-[10.5px] text-rose-600 mt-1">{errors.nguoiCoQuanNhan}</p>}
            </div>
          </div>

          {/* Tóm tắt nội dung tố cáo */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tóm tắt nội dung tố cáo <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Ghi rõ người tố cáo là ai, tố cáo ai (họ tên, chức vụ, cơ quan), và hành vi vi phạm cụ thể bị cáo buộc là gì.
            </p>
            <textarea
              rows={3}
              value={tomTatNoiDungToCao}
              onChange={(e) => {
                setTomTatNoiDungToCao(e.target.value);
                if (errors.tomTatNoiDungToCao) setErrors((prev) => ({ ...prev, tomTatNoiDungToCao: '' }));
              }}
              className={`w-full p-2.5 text-slate-800 bg-white border rounded-xl leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.tomTatNoiDungToCao ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              placeholder="Ghi rõ người tố cáo là ai, tố cáo ai (họ tên, chức vụ, cơ quan), và hành vi vi phạm cụ thể..."
            />
            {errors.tomTatNoiDungToCao && <p className="text-[10.5px] text-rose-600 mt-1">{errors.tomTatNoiDungToCao}</p>}
          </div>

          {/* Đánh giá điều kiện thụ lý */}
          {/* <div>
            <label className="block font-bold text-slate-800 mb-1">
              Đánh giá điều kiện thụ lý <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={dieuKienThuLy}
              onChange={(e) => {
                setDieuKienThuLy(e.target.value);
                if (errors.dieuKienThuLy) setErrors((prev) => ({ ...prev, dieuKienThuLy: '' }));
              }}
              className={`w-full p-2.5 text-slate-800 bg-white border rounded-xl leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.dieuKienThuLy ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              placeholder="Đánh giá đơn có đủ điều kiện thụ lý, có đúng thẩm quyền, có bị trùng lặp không..."
            />
            {errors.dieuKienThuLy && <p className="text-[10.5px] text-rose-600 mt-1">{errors.dieuKienThuLy}</p>}
          </div> */}

          {/* Phương án đề xuất hướng xử lý */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Phương án đề xuất hướng xử lý <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DANH_SACH_PHUONG_AN.map((pa) => {
                const isChecked = phuongAnDeXuat === pa.id;
                return (
                  <div
                    key={pa.id}
                    onClick={() => handleSelectPhuongAn(pa.id)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${isChecked
                      ? 'border-[#004ac6] bg-blue-50/90 shadow-xs ring-2 ring-[#004ac6]/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="phuongAnDeXuat"
                      checked={isChecked}
                      onChange={() => handleSelectPhuongAn(pa.id)}
                      className="w-4 h-4 mt-0.5 text-[#004ac6] focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-2">
                      <strong className={`block text-[12.5px] font-bold leading-tight ${isChecked ? 'text-[#004ac6]' : 'text-slate-800'}`}>
                        {pa.title}
                      </strong>
                      {/* <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {pa.desc}
                      </p> */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kiến nghị, đề xuất cụ thể */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Nội dung kiến nghị / Đề xuất chi tiết
            </label>
            <textarea
              rows={3}
              value={kienNghiChiTiet}
              onChange={(e) => setKienNghiChiTiet(e.target.value)}
              className="w-full p-2.5 text-slate-800 bg-white border border-slate-300 rounded-xl leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nhập nội dung kiến nghị cụ thể gửi lãnh đạo xem xét phê duyệt..."
            />
          </div>

        </div>

        {/* ================= FOOTER BUTTONS ================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-98 text-white text-xs font-bold shadow-md cursor-pointer transition"
              title="Kiểm tra thông tin và Lưu báo cáo vào Hồ sơ & Văn bản (Trạng thái: Bản nháp)"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Lưu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
