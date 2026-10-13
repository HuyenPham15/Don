import React, { useState } from 'react';
import { Screen, UploadedFile, LuotNhan, LoaiNghiepVuTiepNhan, TruongHopTrinhDien, AIAnalysisState } from '../types';

interface NhanDonThemProps {
  onNav: (s: Screen) => void;
  onSubmit?: (newRecord?: LuotNhan) => void;
}

type NguoiNopType = 'khong-ro' | 'ca-nhan' | 'to-chuc';
export type TuCachCaNhan = 'nguoi-dung-don' | 'nguoi-dai-dien';
type TuCachToChuc = 'dai-dien-phap-luat' | 'nguoi-duoc-uy-quyen';

export interface TaiLieuChungMinhItem {
  id: string;
  name: string;
  loai: 'Giấy ủy quyền' | 'Văn bản cử đại diện' | 'Giấy tờ chứng minh giám hộ' | 'Giấy khai sinh' | 'Tài liệu khác';
  size: string;
  ngayTai: string;
  nguoiTai: string;
}

const VIETNAMESE_PROVINCES = [
  'Thành phố Hà Nội',
  'Thành phố Hồ Chí Minh',
  'Thành phố Đà Nẵng',
  'Thành phố Hải Phòng',
  'Thành phố Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

const PROVINCES_AND_WARDS: Record<string, string[]> = {
  'Thành phố Hà Nội': [
    'Phường Dịch Vọng Hậu (Cầu Giấy)',
    'Phường Dịch Vọng (Cầu Giấy)',
    'Phường Nghĩa Tân (Cầu Giấy)',
    'Phường Trung Hòa (Cầu Giấy)',
    'Phường Yên Hòa (Cầu Giấy)',
    'Phường Mộ Lao (Hà Đông)',
    'Phường Văn Quán (Hà Đông)',
    'Phường Quang Trung (Hà Đông)',
    'Phường Tràng Tiền (Hoàn Kiếm)',
    'Phường Hàng Mã (Hoàn Kiếm)',
    'Phường Hàng Bạc (Hoàn Kiếm)',
    'Phường Lý Thái Tổ (Hoàn Kiếm)',
    'Phường Đội Cấn (Ba Đình)',
    'Phường Điện Biên (Ba Đình)',
    'Phường Liễu Giai (Ba Đình)',
    'Phường Giảng Võ (Ba Đình)',
    'Phường Kim Liên (Đống Đa)',
    'Phường Ô Chợ Dừa (Đống Đa)',
    'Phường Láng Hạ (Đống Đa)',
    'Phường Bách Khoa (Hai Bà Trưng)',
    'Phường Đồng Tâm (Hai Bà Trưng)',
    'Phường Bạch Mai (Hai Bà Trưng)',
    'Phường Mỹ Đình 1 (Nam Từ Liêm)',
    'Phường Mỹ Đình 2 (Nam Từ Liêm)',
    'Phường Mễ Trì (Nam Từ Liêm)',
    'Phường Xuân Đỉnh (Bắc Từ Liêm)',
    'Phường Cổ Nhuế 1 (Bắc Từ Liêm)',
    'Phường Khương Đình (Thanh Xuân)',
    'Phường Thanh Xuân Bắc (Thanh Xuân)',
    'Phường Nhân Chính (Thanh Xuân)',
    'Phường Hoàng Liệt (Hoàng Mai)',
    'Phường Giáp Bát (Hoàng Mai)',
    'Xã An Khánh (Hoài Đức)',
    'Xã Tân Triều (Thanh Trì)',
  ],
  'Thành phố Hồ Chí Minh': [
    'Phường Bến Nghé (Quận 1)',
    'Phường Bến Thành (Quận 1)',
    'Phường Đa Kao (Quận 1)',
    'Phường Cầu Kho (Quận 1)',
    'Phường Võ Thị Sáu (Quận 3)',
    'Phường 1 (Quận 3)',
    'Phường 2 (Quận 5)',
    'Phường 5 (Quận 5)',
    'Phường Thảo Điền (TP. Thủ Đức)',
    'Phường An Phú (TP. Thủ Đức)',
    'Phường Hiệp Phú (TP. Thủ Đức)',
    'Phường Linh Trung (TP. Thủ Đức)',
    'Phường Tân Phong (Quận 7)',
    'Phường Tân Phú (Quận 7)',
    'Phường 25 (Bình Thạnh)',
    'Phường 2 (Tân Bình)',
    'Phường 15 (Tân Bình)',
    'Phường 12 (Gò Vấp)',
  ],
  'Thành phố Đà Nẵng': [
    'Phường Hải Châu 1 (Hải Châu)',
    'Phường Hải Châu 2 (Hải Châu)',
    'Phường Thạch Thang (Hải Châu)',
    'Phường Thuận Phước (Hải Châu)',
    'Phường An Hải Bắc (Sơn Trà)',
    'Phường Phước Mỹ (Sơn Trà)',
    'Phường Mỹ An (Ngũ Hành Sơn)',
    'Phường Khuê Trung (Cẩm Lệ)',
    'Phường Hòa Minh (Liên Chiểu)',
    'Phường Hòa Khánh Bắc (Liên Chiểu)',
  ],
  'Thành phố Hải Phòng': [
    'Phường Minh Khai (Hồng Bàng)',
    'Phường Hoàng Văn Thụ (Hồng Bàng)',
    'Phường Lạc Viên (Ngô Quyền)',
    'Phường Cầu Đất (Ngô Quyền)',
    'Phường Lê Lợi (Ngô Quyền)',
    'Phường Trần Nguyên Hãn (Lê Chân)',
    'Phường An Dương (Lê Chân)',
    'Phường Đằng Giang (Ngô Quyền)',
  ],
  'Thành phố Cần Thơ': [
    'Phường An Cư (Ninh Kiều)',
    'Phường An Phú (Ninh Kiều)',
    'Phường Tân An (Ninh Kiều)',
    'Phường Cái Khế (Ninh Kiều)',
    'Phường Xuân Khánh (Ninh Kiều)',
    'Phường Trà Nóc (Bình Thủy)',
    'Phường An Thới (Bình Thủy)',
  ],
  'Bắc Ninh': [
    'Phường Suối Hoa (TP. Bắc Ninh)',
    'Phường Tiền An (TP. Bắc Ninh)',
    'Phường Ninh Xá (TP. Bắc Ninh)',
    'Phường Võ Cường (TP. Bắc Ninh)',
    'Phường Đại Phúc (TP. Bắc Ninh)',
    'Phường Đồng Nguyên (Từ Sơn)',
  ],
  'Quảng Ninh': [
    'Phường Bạch Đằng (Hạ Long)',
    'Phường Hồng Gai (Hạ Long)',
    'Phường Bãi Cháy (Hạ Long)',
    'Phường Cao Xanh (Hạ Long)',
    'Phường Cẩm Trung (Cẩm Phả)',
    'Phường Quang Trung (Uông Bí)',
  ],
  'Bình Dương': [
    'Phường Phú Hòa (Thủ Dầu Một)',
    'Phường Phú Cường (Thủ Dầu Một)',
    'Phường Hiệp Thành (Thủ Dầu Một)',
    'Phường Lái Thiêu (Thuận An)',
    'Phường Dĩ An (Dĩ An)',
  ],
  'Đồng Nai': [
    'Phường Trấn Biên (Biên Hòa)',
    'Phường Quyết Thắng (Biên Hòa)',
    'Phường Tân Phong (Biên Hòa)',
    'Phường Thống Nhất (Biên Hòa)',
    'Phường Long Bình (Biên Hòa)',
  ],
};

// Dữ liệu mô phỏng CSDL Dân cư phục vụ tra cứu theo CCCD
const MOCK_CITIZENS_DATA: Record<
  string,
  {
    hoTen: string;
    cccd: string;
    ngaySinh: string;
    gioiTinh: string;
    sdt: string;
    email: string;
    tinhThanh: string;
    phuongXa: string;
    diaChiChiTiet: string;
  }
> = {
  '001092015882': {
    hoTen: 'Trần Đức Minh',
    cccd: '001092015882',
    ngaySinh: '1986-04-12',
    gioiTinh: 'Nam',
    sdt: '0912 345 678',
    email: 'ducminh.tran@gmail.com',
    tinhThanh: 'Thành phố Hà Nội',
    phuongXa: 'Phường Dịch Vọng Hậu (Cầu Giấy)',
    diaChiChiTiet: 'Số 18 Duy Tân, Cầu Giấy',
  },
  '001088019482': {
    hoTen: 'Nguyễn Văn An',
    cccd: '001088019482',
    ngaySinh: '1988-05-15',
    gioiTinh: 'Nam',
    sdt: '0903 123 456',
    email: 'an.nguyen88@outlook.com',
    tinhThanh: 'Thành phố Hà Nội',
    phuongXa: 'Phường Dịch Vọng Hậu (Cầu Giấy)',
    diaChiChiTiet: 'Số 45 Trần Thái Tông, Cầu Giấy',
  },
  '001193004521': {
    hoTen: 'Lê Thị Thu Hà',
    cccd: '001193004521',
    ngaySinh: '1993-11-20',
    gioiTinh: 'Nữ',
    sdt: '0988 765 432',
    email: 'thuha.lawyer@anhduong.vn',
    tinhThanh: 'Thành phố Hà Nội',
    phuongXa: 'Phường Hàng Bạc (Hoàn Kiếm)',
    diaChiChiTiet: 'Văn phòng Luật sư Ánh Dương, 12 Tràng Thi',
  },
  '079190008899': {
    hoTen: 'Phạm Quốc Bảo',
    cccd: '079190008899',
    ngaySinh: '1990-08-08',
    gioiTinh: 'Nam',
    sdt: '0938 999 888',
    email: 'baopq@saigonlaw.com',
    tinhThanh: 'Thành phố Hồ Chí Minh',
    phuongXa: 'Phường Bến Nghé (Quận 1)',
    diaChiChiTiet: 'Tầng 5, 88 Đồng Khởi, Quận 1',
  },
};

// Dữ liệu mô phỏng CSDL Đăng ký doanh nghiệp / Thuế phục vụ tra cứu theo MST
const MOCK_ORGANIZATIONS_DATA: Record<
  string,
  {
    ten: string;
    tenVietTat: string;
    mst: string;
    loaiHinh: string;
    sdt: string;
    email: string;
    tinhThanh: string;
    phuongXa: string;
    diaChiChiTiet: string;
    ddHoTen: string;
    ddChucVu: string;
    ddCccd: string;
    ddSdt: string;
    ddEmail: string;
  }
> = {
  '0100109106': {
    ten: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)',
    tenVietTat: 'VIETTEL',
    mst: '0100109106',
    loaiHinh: 'Cơ quan nhà nước / Đơn vị sự nghiệp',
    sdt: '024 6255 6789',
    email: 'cskh@viettel.com.vn',
    tinhThanh: 'Thành phố Hà Nội',
    phuongXa: 'Phường Dịch Vọng Hậu (Cầu Giấy)',
    diaChiChiTiet: 'Lô D26 Khu đô thị mới Cầu Giấy, Yên Hòa, Cầu Giấy',
    ddHoTen: 'Tào Đức Thắng',
    ddChucVu: 'Chủ tịch kiêm Tổng Giám đốc',
    ddCccd: '001073008912',
    ddSdt: '0983 123 456',
    ddEmail: 'thangtd@viettel.com.vn',
  },
  '0101234567': {
    ten: 'Công ty Cổ phần Đầu tư và Phát triển Đô thị Sông Hồng',
    tenVietTat: 'SONGHONG CORP',
    mst: '0101234567',
    loaiHinh: 'Công ty Cổ phần',
    sdt: '024 3822 5566',
    email: 'info@songhongcorp.vn',
    tinhThanh: 'Thành phố Hà Nội',
    phuongXa: 'Phường Kim Mã (Ba Đình)',
    diaChiChiTiet: 'Số 165 Thái Hà, Đống Đa',
    ddHoTen: 'Trần Văn Mạnh',
    ddChucVu: 'Tổng Giám đốc',
    ddCccd: '001085002468',
    ddSdt: '0913 222 333',
    ddEmail: 'manhtv@songhongcorp.vn',
  },
  '0300123456': {
    ten: 'Công ty TNHH Thương mại & Dịch vụ Tân Phát Hưng',
    tenVietTat: 'TAN PHAT HUNG',
    mst: '0300123456',
    loaiHinh: 'Công ty TNHH',
    sdt: '028 3910 8888',
    email: 'contact@tanphathung.com.vn',
    tinhThanh: 'Thành phố Hồ Chí Minh',
    phuongXa: 'Phường Bến Nghé (Quận 1)',
    diaChiChiTiet: 'Số 12 Lê Duẩn, Phường Bến Nghé, Quận 1',
    ddHoTen: 'Lê Hoàng Nam',
    ddChucVu: 'Giám đốc',
    ddCccd: '079082001122',
    ddSdt: '0903 888 999',
    ddEmail: 'namlh@tanphathung.com.vn',
  },
  '0100112233': {
    ten: 'Tổng Công ty Xây dựng Công trình Giao thông 1 - CTCP',
    tenVietTat: 'CIENCO 1',
    mst: '0100112233',
    loaiHinh: 'Công ty Cổ phần',
    sdt: '024 3851 4455',
    email: 'vanphong@cienco1.com',
    tinhThanh: 'Thành phố Hà Nội',
    phuongXa: 'Phường Phương Mai (Đống Đa)',
    diaChiChiTiet: 'Số 623 La Thành, Ba Đình',
    ddHoTen: 'Nguyễn Đăng Giáp',
    ddChucVu: 'Chủ tịch HĐQT',
    ddCccd: '001079001357',
    ddSdt: '0912 111 222',
    ddEmail: 'giapnd@cienco1.com',
  },
};

export default function NhanDonThem({ onNav, onSubmit }: NhanDonThemProps) {
  // ─── 0. PHÂN LOẠI NGHIỆP VỤ TIẾP NHẬN GOVEX ───────────────────
  const [loaiNghiepVu, setLoaiNghiepVu] = useState<LoaiNghiepVuTiepNhan>('tiep_nhan_don');
  const [isLoaiNghiepVuDropdownOpen, setIsLoaiNghiepVuDropdownOpen] = useState(false);
  const [gioNhan, setGioNhan] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [nguonTin, setNguonTin] = useState('Trực tiếp');
  const [yeuCauBaoMat, setYeuCauBaoMat] = useState(false);
  const [tuCachNguoiBao, setTuCachNguoiBao] = useState('Người đứng đơn');
  const [loaiDonToGiac, setLoaiDonToGiac] = useState('Đơn phản ánh, kiến nghị');
  const [hoSoLienKetId, setHoSoLienKetId] = useState('Đ-2025-0105');

  // Chi tiết sự việc tin báo / tố giác (Mục 4.3)
  const [thoiGianSuViec, setThoiGianSuViec] = useState('Từ tháng 01/2025 đến tháng 08/2026');
  const [diaDiemSuViec, setDiaDiemSuViec] = useState('Dự án Khu đô thị Nam An Khánh, Hoài Đức, Hà Nội');
  const [doiTuongBiToGiac, setDoiTuongBiToGiac] = useState('');
  const [dienBienSuViec, setDienBienSuViec] = useState('');
  const [hauQuaThietHai, setHauQuaThietHai] = useState('');

  // ─── THÔNG TIN CHUYÊN BIỆT TỰ THÚ / ĐẦU THÚ (MỤC 12.3 & 12.4) ─────
  const [diaDiemTiepNhan, setDiaDiemTiepNhan] = useState('Phòng Trực ban hình sự - Công an TP. Hà Nội');
  const [hinhThucTrinhDien, setHinhThucTrinhDien] = useState('Tự đến trực tiếp trình diện');
  const [truongHopTrinhDien, setTruongHopTrinhDien] = useState<TruongHopTrinhDien>('tu_thu');
  const [lyDoPhanLoai, setLyDoPhanLoai] = useState('Công dân tự giác đến cơ quan Công an khai nhận hành vi trước khi bị cơ quan điều tra phát hiện khởi tố.');
  const [ttQuocTich, setTtQuocTich] = useState('Việt Nam');
  const [ttNhanDang, setTtNhanDang] = useState('Có vết sẹo nhỏ 2cm ở đuôi lông mày trái, xăm hình hoa văn ở cánh tay phải');
  const [ttTrieuChungXacMinh, setTtTrieuChungXacMinh] = useState('Chưa xác minh');
  const [ttNoiOHienTai, setTtNoiOHienTai] = useState('Số 12 ngách 82/15 Kim Mã, Ba Đình, Hà Nội');

  // Người đi cùng / Người đưa đến nếu có
  const [hasNguoiDiCung, setHasNguoiDiCung] = useState(false);
  const [nguoiDiCungHoTen, setNguoiDiCungHoTen] = useState('');
  const [nguoiDiCungCccd, setNguoiDiCungCccd] = useState('');
  const [nguoiDiCungQuanHe, setNguoiDiCungQuanHe] = useState('Bố đẻ / Người thân khuyên giải đưa đến');
  const [nguoiDiCungSdt, setNguoiDiCungSdt] = useState('');

  // Đồ vật, tang vật, tiền tự nguyện giao nộp
  const [doVatGiaoNop, setDoVatGiaoNop] = useState('01 xe máy Honda Wave RSX BKS 29X1-567.89; 15.000.000 VNĐ tiền mặt (tiền bán linh kiện trộm cắp)');
  // Vụ việc hoặc hồ sơ đã tồn tại nếu có
  const [hoSoVuViecTonTai, setHoSoVuViecTonTai] = useState('');

  // Cảnh báo an toàn & Tình huống khẩn cấp cần ưu tiên (Mục 12.3.D)
  const [canHoTroYTe, setCanHoTroYTe] = useState(false);
  const [lyDoYTe, setLyDoYTe] = useState('');
  const [nguyCoMatAnToan, setNguyCoMatAnToan] = useState(false);
  const [canBaoVeNguoiTaiSan, setCanBaoVeNguoiTaiSan] = useState(false);
  const [canBaoQuanDoVat, setCanBaoQuanDoVat] = useState(true);

  // ─── THÔNG TIN BẮT QUẢ TANG & CÁN BỘ PHÁT HIỆN ─────────────────
  const [tangVatThuGiu, setTangVatThuGiu] = useState('02 gói nilon chứa tinh thể màu trắng nghi ma túy đá, 01 xe máy Wave BKS 29H1-888.99 và 02 điện thoại di động');
  const [nguoiLamChung, setNguoiLamChung] = useState('Anh Nguyễn Tiến Đ (Nhân viên bảo vệ) & Chị Lê Thị N (Hộ kinh doanh liền kề)');
  const [lucLuongPhatHien, setLucLuongPhatHien] = useState('Tổ Cảnh sát hình sự đặc nhiệm - Công an TP. Hà Nội');
  const [bienPhapPhatHien, setBienPhapPhatHien] = useState('Bắt giữ quả tang tại chỗ theo Điều 111 BLTTHS');

  // ─── 1. THÔNG TIN TIẾP NHẬN STATE ─────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const [ngayNhan, setNgayNhan] = useState(todayStr);
  const [ngayLamDon, setNgayLamDon] = useState('');
  const [hinhThucNhan, setHinhThucNhan] = useState('Trực tiếp');
  const [canBoNhan, setCanBoNhan] = useState('Lê Ngọc Mai');
  const [donViNhan, setDonViNhan] = useState('Phòng Tiếp công dân & Xử lý đơn');

  // ─── 2. LOẠI NGƯỜI NỘP ĐƠN STATE ──────────────────────────────
  const [loaiNguoiNop, setLoaiNguoiNop] = useState<NguoiNopType>('ca-nhan');

  // ─── 3. THÔNG TIN CÁ NHÂN ──────────────────────────────────────
  const [cnHoTen, setCnHoTen] = useState('');
  const [cnCccd, setCnCccd] = useState('');
  const [cnNgaySinh, setCnNgaySinh] = useState('');
  const [cnGioiTinh, setCnGioiTinh] = useState('Nam');
  const [cnSdt, setCnSdt] = useState('');
  const [cnEmail, setCnEmail] = useState('');
  const [cnTinhThanh, setCnTinhThanh] = useState('Thành phố Hà Nội');
  const [cnPhuongXa, setCnPhuongXa] = useState('Phường Dịch Vọng Hậu (Cầu Giấy)');
  const [cnDiaChiChiTiet, setCnDiaChiChiTiet] = useState('');
  const [isCustomPhuongXa, setIsCustomPhuongXa] = useState(false);
  const [cnTuCach, setCnTuCach] = useState<TuCachCaNhan>('nguoi-dung-don');

  // Người đại diện / Người được ủy quyền (Cá nhân)
  const [cnUqHoTen, setCnUqHoTen] = useState('');
  const [cnUqCccd, setCnUqCccd] = useState('');
  const [cnUqNgaySinh, setCnUqNgaySinh] = useState('');
  const [cnUqGioiTinh, setCnUqGioiTinh] = useState('Nam');
  const [cnUqSdt, setCnUqSdt] = useState('');
  const [cnUqEmail, setCnUqEmail] = useState('');
  const [cnUqTinhThanh, setCnUqTinhThanh] = useState('Thành phố Hà Nội');
  const [cnUqPhuongXa, setCnUqPhuongXa] = useState('Phường Dịch Vọng Hậu (Cầu Giấy)');
  const [cnUqDiaChiChiTiet, setCnUqDiaChiChiTiet] = useState('');
  const [isCustomUqPhuongXa, setIsCustomUqPhuongXa] = useState(false);
  const [cnUqVanBan, setCnUqVanBan] = useState<File | null>(null);

  // Căn cứ đại diện & Phạm vi
  const [cnUqLoaiDaiDien, setCnUqLoaiDaiDien] = useState('Người được ủy quyền');
  const [cnUqSoVanBan, setCnUqSoVanBan] = useState('08/2026/UQ-ND');
  const [cnUqNgayLap, setCnUqNgayLap] = useState('2026-03-15');
  const [cnUqNgayHieuLuc, setCnUqNgayHieuLuc] = useState('2026-03-15');
  const [cnUqNgayHetHieuLuc, setCnUqNgayHetHieuLuc] = useState('2027-03-15');
  const [cnUqPhamVi, setCnUqPhamVi] = useState('Nộp đơn, bổ sung tài liệu và làm việc với cơ quan');
  const [cnUqPhamViKhac, setCnUqPhamViKhac] = useState('');

  // Danh sách tài liệu chứng minh tư cách đại diện
  const [cnUqTaiLieuList, setCnUqTaiLieuList] = useState<TaiLieuChungMinhItem[]>([
    {
      id: 'TL-01',
      name: 'Giay_uy_quyen_so_08_2026.pdf',
      loai: 'Giấy ủy quyền',
      size: '1.8 MB',
      ngayTai: '20/09/2026',
      nguoiTai: 'Nguyễn Thị Hải Yến',
    },
  ]);

  // View / Edit mode & Scanner & Preview
  const [isViewModeDaiDien, setIsViewModeDaiDien] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<TaiLieuChungMinhItem | null>(null);
  const [isScanningDaiDien, setIsScanningDaiDien] = useState(false);
  const [cnUqBackup, setCnUqBackup] = useState<any>(null);

  // Địa chỉ đầy đủ người được ủy quyền (hỗ trợ tương thích ngược)
  const cnUqDiaChi = [cnUqDiaChiChiTiet, cnUqPhuongXa, cnUqTinhThanh].filter(Boolean).join(', ');

  // ─── 4. THÔNG TIN TỔ CHỨC ──────────────────────────────────────
  const [tcTen, setTcTen] = useState('');
  const [tcMst, setTcMst] = useState('');
  const [tcTenVietTat, setTcTenVietTat] = useState('');
  const [tcLoaiHinh, setTcLoaiHinh] = useState('Công ty TNHH');
  const [tcSdt, setTcSdt] = useState('');
  const [tcEmail, setTcEmail] = useState('');
  const [tcTinhThanh, setTcTinhThanh] = useState('Thành phố Hà Nội');
  const [tcPhuongXa, setTcPhuongXa] = useState('Phường Dịch Vọng Hậu (Cầu Giấy)');
  const [tcDiaChiChiTiet, setTcDiaChiChiTiet] = useState('');
  const [isCustomTcPhuongXa, setIsCustomTcPhuongXa] = useState(false);

  // Người đại diện (Tổ chức)
  const [tcDdHoTen, setTcDdHoTen] = useState('');
  const [tcDdChucVu, setTcDdChucVu] = useState('Giám đốc');
  const [tcDdCccd, setTcDdCccd] = useState('');
  const [tcDdSdt, setTcDdSdt] = useState('');
  const [tcDdEmail, setTcDdEmail] = useState('');
  const [tcTuCach, setTcTuCach] = useState<TuCachToChuc>('dai-dien-phap-luat');

  // Người được ủy quyền (Tổ chức)
  const [tcUqHoTen, setTcUqHoTen] = useState('');
  const [tcUqCccd, setTcUqCccd] = useState('');
  const [tcUqSdt, setTcUqSdt] = useState('');
  const [tcUqChucVu, setTcUqChucVu] = useState('');
  const [tcUqVanBan, setTcUqVanBan] = useState<File | null>(null);

  // ─── 5. GHI CHÚ ────────────────────────────────────────────────
  const [ghiChu, setGhiChu] = useState('');

  // ─── 6. TÀI LIỆU KÈM THEO ──────────────────────────────────────
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // ─── 7. VALIDATION & FEEDBACK ─────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Quét nhanh thẻ CCCD gắn chip (Simulation)
  const handleScanCccd = () => {
    setCnHoTen('Trần Đức Minh');
    setCnCccd('001092015882');
    setCnNgaySinh('1986-04-12');
    setCnGioiTinh('Nam');
    setCnSdt('0912 345 678');
    setCnTinhThanh('Thành phố Hà Nội');
    setCnPhuongXa('Phường Kim Mã, Quận Ba Đình');
    setIsCustomPhuongXa(true);
    setCnDiaChiChiTiet('Số 42 ngõ 82 phố Kim Mã');
    showToast('Đã quét thông tin thẻ CCCD gắn chip thành công!');
  };

  // Tra cứu công dân người nộp đơn chính theo CCCD (CSDL Dân cư)
  const handleSearchCccdCaNhan = (cccdQuery?: string) => {
    const raw = cccdQuery !== undefined ? cccdQuery : cnCccd;
    const q = raw.trim().replace(/\s+/g, '');
    if (!q) {
      showToast('Vui lòng nhập số CCCD để tra cứu');
      return;
    }
    const citizen = MOCK_CITIZENS_DATA[q];
    if (citizen) {
      setCnHoTen(citizen.hoTen);
      setCnCccd(citizen.cccd);
      setCnNgaySinh(citizen.ngaySinh);
      setCnGioiTinh(citizen.gioiTinh);
      setCnSdt(citizen.sdt);
      setCnEmail(citizen.email);
      setCnTinhThanh(citizen.tinhThanh);
      const wardList = PROVINCES_AND_WARDS[citizen.tinhThanh] || [];
      if (wardList.includes(citizen.phuongXa)) {
        setIsCustomPhuongXa(false);
      } else {
        setIsCustomPhuongXa(true);
      }
      setCnPhuongXa(citizen.phuongXa);
      setCnDiaChiChiTiet(citizen.diaChiChiTiet);
      setErrors((prev) => ({ ...prev, cnHoTen: '', cnCccd: '' }));
      showToast(`Đã tìm thấy công dân: ${citizen.hoTen} (${citizen.cccd}) từ CSDL Dân cư`);
    } else {
      showToast(`Không tìm thấy CCCD "${q}" trong CSDL Dân cư. Bạn có thể nhập thông tin thủ công.`);
    }
  };

  // Quét tài liệu từ máy scan
  const handleScanDocument = () => {
    const newDoc: UploadedFile = {
      name: `Scan_Don_tiep_nhan_${Date.now().toString().slice(-4)}.pdf`,
      size: '2.4 MB',
      category: 'main',
    };
    setFiles((prev) => [...prev, newDoc]);
    showToast('Đã quét tài liệu thành công từ máy scan!');
  };

  // Thêm tệp tải lên
  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const added: UploadedFile[] = Array.from(fileList).map((f) => {
      const kb = f.size / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
      return {
        name: f.name,
        size: sizeStr,
        category: files.length === 0 ? 'main' : 'attach',
      };
    });
    setFiles((prev) => [...prev, ...added]);
    showToast(`Đã thêm ${added.length} tệp tài liệu.`);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Tra cứu công dân đại diện theo CCCD
  const handleSearchCccdDaiDien = (cccdQuery?: string) => {
    const raw = cccdQuery !== undefined ? cccdQuery : cnUqCccd;
    const q = raw.trim().replace(/\s+/g, '');
    if (!q) {
      showToast('Vui lòng nhập số CCCD để tra cứu');
      return;
    }
    const citizen = MOCK_CITIZENS_DATA[q];
    if (citizen) {
      setCnUqHoTen(citizen.hoTen);
      setCnUqCccd(citizen.cccd);
      setCnUqNgaySinh(citizen.ngaySinh);
      setCnUqGioiTinh(citizen.gioiTinh);
      setCnUqSdt(citizen.sdt);
      setCnUqEmail(citizen.email);
      setCnUqTinhThanh(citizen.tinhThanh);
      setCnUqPhuongXa(citizen.phuongXa);
      setCnUqDiaChiChiTiet(citizen.diaChiChiTiet);
      setIsCustomUqPhuongXa(false);
      setErrors((prev) => ({ ...prev, cnUqHoTen: '', cnUqCccd: '' }));
      showToast(`Đã tìm thấy công dân: ${citizen.hoTen} (${citizen.cccd})`);
    } else {
      showToast(`Không tìm thấy CCCD "${q}" trong CSDL Dân cư. Bạn có thể nhập thông tin thủ công.`);
    }
  };

  // Tra cứu tổ chức / doanh nghiệp theo MST (CSDL Đăng ký doanh nghiệp)
  const handleSearchMstToChuc = (mstQuery?: string) => {
    const raw = mstQuery !== undefined ? mstQuery : tcMst;
    const q = raw.trim().replace(/\s+/g, '');
    if (!q) {
      showToast('Vui lòng nhập Mã số thuế / Mã định danh để tra cứu');
      return;
    }
    const org = MOCK_ORGANIZATIONS_DATA[q];
    if (org) {
      setTcTen(org.ten);
      setTcMst(org.mst);
      setTcTenVietTat(org.tenVietTat || '');
      setTcLoaiHinh(org.loaiHinh || 'Công ty TNHH');
      setTcSdt(org.sdt || '');
      setTcEmail(org.email || '');
      setTcTinhThanh(org.tinhThanh);
      const wardList = PROVINCES_AND_WARDS[org.tinhThanh] || [];
      if (wardList.includes(org.phuongXa)) {
        setIsCustomTcPhuongXa(false);
      } else {
        setIsCustomTcPhuongXa(true);
      }
      setTcPhuongXa(org.phuongXa);
      setTcDiaChiChiTiet(org.diaChiChiTiet || '');

      // Tự động điền người đại diện nếu có trong hồ sơ
      if (org.ddHoTen) {
        setTcDdHoTen(org.ddHoTen);
        setTcDdChucVu(org.ddChucVu || 'Giám đốc');
        setTcDdCccd(org.ddCccd || '');
        setTcDdSdt(org.ddSdt || '');
        setTcDdEmail(org.ddEmail || '');
      }

      setErrors((prev) => ({ ...prev, tcTen: '', tcMst: '', tcDdHoTen: '' }));
      showToast(`Đã tìm thấy tổ chức: ${org.ten} (MST: ${org.mst}) từ CSDL Doanh nghiệp`);
    } else {
      showToast(`Không tìm thấy MST "${q}" trong CSDL Doanh nghiệp. Bạn có thể nhập thông tin thủ công.`);
    }
  };

  // Tra cứu người đại diện tổ chức theo CCCD (CSDL Dân cư)
  const handleSearchCccdDaiDienToChuc = (cccdQuery?: string) => {
    const raw = cccdQuery !== undefined ? cccdQuery : tcDdCccd;
    const q = raw.trim().replace(/\s+/g, '');
    if (!q) {
      showToast('Vui lòng nhập số CCCD để tra cứu');
      return;
    }
    const citizen = MOCK_CITIZENS_DATA[q];
    if (citizen) {
      setTcDdHoTen(citizen.hoTen);
      setTcDdCccd(citizen.cccd);
      setTcDdSdt(citizen.sdt);
      setTcDdEmail(citizen.email);
      setErrors((prev) => ({ ...prev, tcDdHoTen: '' }));
      showToast(`Đã tìm thấy người đại diện: ${citizen.hoTen} (${citizen.cccd}) từ CSDL Dân cư`);
    } else {
      showToast(`Không tìm thấy CCCD "${q}" trong CSDL Dân cư. Bạn có thể nhập thông tin thủ công.`);
    }
  };


  // Quét tài liệu chứng minh tư cách đại diện (Simulation)
  const handleScanDaiDien = () => {
    setIsScanningDaiDien(true);
    setTimeout(() => {
      const idStr = Date.now().toString().slice(-4);
      const newDoc: TaiLieuChungMinhItem = {
        id: `TL-SCAN-${idStr}`,
        name: `Ban_quet_Van_ban_uy_quyen_${idStr}.pdf`,
        loai: 'Giấy ủy quyền',
        size: '2.1 MB',
        ngayTai: new Date().toLocaleDateString('vi-VN'),
        nguoiTai: canBoNhan || 'Nguyễn Thị Hải Yến',
      };
      setCnUqTaiLieuList((prev) => [...prev, newDoc]);
      setIsScanningDaiDien(false);
      showToast('Đã quét và số hóa thành công văn bản ủy quyền từ máy scan!');
    }, 900);
  };

  // Tải lên tài liệu chứng minh
  const handleUploadDaiDienDoc = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const addedDocs: TaiLieuChungMinhItem[] = Array.from(fileList).map((f, idx) => {
      const kb = f.size / 1024;
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
      const nameLower = f.name.toLowerCase();
      let loai: TaiLieuChungMinhItem['loai'] = 'Giấy ủy quyền';
      if (nameLower.includes('giam_ho') || nameLower.includes('giamho')) {
        loai = 'Giấy tờ chứng minh giám hộ';
      } else if (nameLower.includes('khai_sinh') || nameLower.includes('khaisinh')) {
        loai = 'Giấy khai sinh';
      } else if (nameLower.includes('cu_dai_dien')) {
        loai = 'Văn bản cử đại diện';
      }
      return {
        id: `TL-UP-${Date.now()}-${idx}`,
        name: f.name,
        loai,
        size: sizeStr,
        ngayTai: new Date().toLocaleDateString('vi-VN'),
        nguoiTai: canBoNhan || 'Nguyễn Thị Hải Yến',
      };
    });
    setCnUqTaiLieuList((prev) => [...prev, ...addedDocs]);
    showToast(`Đã tải lên ${addedDocs.length} tệp tài liệu chứng minh tư cách đại diện.`);
  };

  // Xóa tài liệu chứng minh
  const handleDeleteDaiDienDoc = (id: string) => {
    setCnUqTaiLieuList((prev) => prev.filter((d) => d.id !== id));
    showToast('Đã xóa tệp tài liệu chứng minh.');
  };

  // Thay đổi loại tài liệu
  const handleUpdateDocLoai = (id: string, newLoai: TaiLieuChungMinhItem['loai']) => {
    setCnUqTaiLieuList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, loai: newLoai } : d))
    );
  };

  // ─── 8. VALIDATE & SUBMIT ──────────────────────────────────────
  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    // Validate Thông tin tiếp nhận
    if (!ngayNhan) {
      newErrors.ngayNhan = 'Vui lòng chọn ngày nhận hồ sơ';
    }
    if (ngayLamDon && ngayNhan && ngayLamDon > ngayNhan) {
      newErrors.ngayLamDon = 'Ngày làm đơn không được lớn hơn Ngày nhận';
    }
    if (!hinhThucNhan) {
      newErrors.hinhThucNhan = 'Vui lòng chọn hình thức nhận';
    }
    if (!canBoNhan.trim()) {
      newErrors.canBoNhan = 'Vui lòng nhập tên cán bộ nhận';
    }
    if (!donViNhan.trim()) {
      newErrors.donViNhan = 'Vui lòng chọn/nhập đơn vị tiếp nhận';
    }

    // Validate theo loại người nộp (BR-04: Thông tin người nộp không bắt buộc)
    if (loaiNguoiNop === 'ca-nhan') {
      if (cnTuCach === 'nguoi-dai-dien') {
        if (!cnUqHoTen.trim() && cnHoTen.trim()) {
          newErrors.cnUqHoTen = 'Họ và tên người đại diện là bắt buộc khi chọn tư cách đại diện';
        }
        if (cnUqNgayHetHieuLuc && cnUqNgayHetHieuLuc < todayStr) {
          newErrors.cnUqHieuLuc = 'Văn bản ủy quyền đã hết hiệu lực';
        }
      }
    } else if (loaiNguoiNop === 'to-chuc') {
      if (tcTuCach === 'nguoi-duoc-uy-quyen') {
        if (!tcUqVanBan && files.every((f) => !f.name.toLowerCase().includes('uy_quyen'))) {
          // Gợi ý bổ sung giấy ủy quyền
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Vui lòng kiểm tra lại các trường thông tin bắt buộc còn thiếu hoặc không hợp lệ.');
      return;
    }

    const randomCode = Math.floor(100 + Math.random() * 900);
    const isTuThuType = loaiNghiepVu === 'nguoi_tu_thu';
    const isDauThuType = loaiNghiepVu === 'nguoi_dau_thu';
    const isBatQuaTangType = loaiNghiepVu === 'bat_qua_tang';
    const isCanBoPhatHienType = loaiNghiepVu === 'can_bo_phat_hien';
    const isTuThuDauThuType = isTuThuType || isDauThuType;

    const generatedId =
      isTuThuType
        ? `TT-${randomCode}/2026-CATPHN`
        : isDauThuType
          ? `DT-${randomCode}/2026-CATPHN`
          : isBatQuaTangType
            ? `QT-${randomCode}/2026-CATPHN`
            : isCanBoPhatHienType
              ? `PH-${randomCode}/2026-CATPHN`
              : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                ? `TB-${randomCode}/2026-CATPHN`
                : loaiNghiepVu === 'tai_lieu_bo_sung'
                  ? `BS-${randomCode}/2026-GOVEX`
                  : `LN-${randomCode}/2026-CATPHN`;

    let submitterName = loaiNguoiNop === 'khong-ro' ? 'Chưa xác định (Nặc danh/Giấu tên)' : 'Chưa rõ';
    let submitterCccd = cnCccd;
    let submitterSdt = cnSdt;
    let submitterDiaChi = [cnDiaChiChiTiet, cnPhuongXa, cnTinhThanh].filter(Boolean).join(', ');

    if (isBatQuaTangType) {
      submitterName = cnHoTen.trim() || 'Đối tượng bị bắt quả tang';
      submitterDiaChi = ttNoiOHienTai.trim() || submitterDiaChi;
    } else if (isCanBoPhatHienType) {
      submitterName = lucLuongPhatHien || 'Tổ công tác Cảnh sát kinh tế';
      submitterDiaChi = 'Công an thành phố Hà Nội';
    } else if (isTuThuDauThuType) {
      submitterName = cnHoTen.trim() || (isTuThuType ? 'Người tự thú (Chưa rõ họ tên)' : 'Người đầu thú (Chưa rõ họ tên)');
      submitterDiaChi = ttNoiOHienTai.trim() || submitterDiaChi;
    } else if (loaiNguoiNop === 'ca-nhan') {
      if (cnTuCach === 'nguoi-dai-dien' && cnUqHoTen.trim()) {
        submitterName = `${cnHoTen.trim() || 'Người đứng đơn'} (Đại diện: ${cnUqHoTen.trim()})`;
        submitterCccd = cnUqCccd || cnCccd;
        submitterSdt = cnUqSdt || cnSdt;
        submitterDiaChi = [cnUqDiaChiChiTiet, cnUqPhuongXa, cnUqTinhThanh].filter(Boolean).join(', ') || submitterDiaChi;
      } else if (cnHoTen.trim()) {
        submitterName = cnHoTen.trim();
      }
    } else if (loaiNguoiNop === 'to-chuc') {
      if (tcTen.trim()) {
        submitterName = tcTen.trim();
      } else {
        submitterName = 'Chưa rõ';
      }
      submitterCccd = tcDdCccd || tcMst;
      submitterSdt = tcSdt;
      submitterDiaChi = [tcDiaChiChiTiet, tcPhuongXa, tcTinhThanh].filter(Boolean).join(', ');
    }

    const hasAnyFile = files.length > 0;
    const hasNote = Boolean(ghiChu.trim());
    let srcType: 'file' | 'ghi_chu' | 'both' | undefined = undefined;
    if (hasAnyFile && hasNote) srcType = 'both';
    else if (hasAnyFile) srcType = 'file';
    else if (hasNote) srcType = 'ghi_chu';

    const timeNow = gioNhan || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const fullDate = ngayNhan.split('-').reverse().join('/');
    const fullDateTime = `${fullDate} ${timeNow}`;

    const defaultContent =
      isBatQuaTangType
        ? (ghiChu.trim() || dienBienSuViec.trim() || `Bắt người phạm tội quả tang đối tượng ${submitterName} tại ${diaDiemSuViec || 'Bến xe Giáp Bát, Hoàng Mai'}. Thu giữ phương tiện và tang vật tại hiện trường theo Điều 111 BLTTHS.`)
        : isCanBoPhatHienType
          ? (ghiChu.trim() || dienBienSuViec.trim() || `Tổ công tác ${submitterName} phát hiện dấu hiệu vi phạm pháp luật tại ${diaDiemSuViec || 'kho bãi Lĩnh Nam, Hoàng Mai'} qua công tác tuần tra theo Khoản 3 Điều 143 BLTTHS.`)
          : isTuThuType
            ? (ghiChu.trim() || dienBienSuViec.trim() || `Người tự thú ${submitterName} đến cơ quan trình diện và khai nhận hành vi phạm tội tại ${diaDiemSuViec || 'Hà Nội'}`)
            : isDauThuType
              ? (ghiChu.trim() || dienBienSuViec.trim() || `Người đầu thú ${submitterName} đến cơ quan trình diện sau khi có thông tin truy nã/phát hiện tại ${diaDiemSuViec || 'Hà Nội'}`)
              : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                ? (ghiChu.trim() || dienBienSuViec.trim() || `Tố giác đối tượng ${doiTuongBiToGiac} có hành vi vi phạm pháp luật tại ${diaDiemSuViec}`)
                : loaiNghiepVu === 'tai_lieu_bo_sung'
                  ? (ghiChu.trim() || `Tiếp nhận tài liệu bổ sung cho hồ sơ vụ việc ${hoSoLienKetId}`)
                  : (ghiChu.trim() || 'Đơn tiếp nhận mới vào hệ thống (Chờ xử lý)');

    // Xác định trạng thái AI ban đầu theo đa nguồn dữ liệu (không phụ thuộc OCR)
    const initialAiState: AIAnalysisState = hasAnyFile
      ? 'da_cap_nhat'
      : (dienBienSuViec.trim().length > 15 || ghiChu.trim().length > 15 || defaultContent.length > 20)
        ? 'phan_tich_so_bo'
        : 'chua_du_du_lieu';

    const newRecord: LuotNhan = {
      id: generatedId,
      ngayNhan: fullDate,
      gioNhan: timeNow,
      nguoiNop: submitterName,
      hinhThuc: isTuThuDauThuType ? hinhThucTrinhDien : isBatQuaTangType ? 'Bắt quả tang tại hiện trường' : isCanBoPhatHienType ? 'Tuần tra phát hiện' : hinhThucNhan,
      noiDung: defaultContent,
      donVi: donViNhan,
      aiJob: hasAnyFile ? 1 : 2, // Hỗ trợ AI bóc tách đa nguồn dữ liệu cả khi không có file
      aiAnalysisState: initialAiState,
      status: 'cho_chuyen', // BR-01, BR-02: Lượt nhận mới có trạng thái cho_chuyen
      ngayChuyenXuLy: 'Chưa chuyển xử lý',
      nguoiThaoTacGanNhat: `${canBoNhan || 'Lê Ngọc Mai'} – ${fullDateTime}`,
      hasFile: hasAnyFile,
      fileCount: files.length,
      files: files,
      ghiChu: ghiChu.trim(),
      sourceType: srcType,
      cccd: submitterCccd,
      sdt: submitterSdt,
      diaChi: submitterDiaChi,
      loaiNghiepVu: loaiNghiepVu,
      loaiDon:
        isBatQuaTangType
          ? 'Biên bản bắt người phạm tội quả tang'
          : isCanBoPhatHienType
            ? 'Báo cáo phát hiện dấu hiệu vi phạm'
            : isTuThuType
              ? 'Tiếp nhận người tự thú'
              : isDauThuType
                ? 'Tiếp nhận người đầu thú'
                : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                  ? loaiDonToGiac
                  : loaiNghiepVu === 'tai_lieu_bo_sung'
                    ? 'Tài liệu bổ sung hồ sơ'
                    : 'Đơn tiếp nhận',
      nguonTin: isTuThuDauThuType ? hinhThucTrinhDien : isBatQuaTangType ? 'Hiện trường bắt quả tang' : isCanBoPhatHienType ? 'Trực tiếp phát hiện' : nguonTin,
      yeuCauBaoMat: yeuCauBaoMat,
      tuCachNguoiBao: isBatQuaTangType ? 'Lực lượng bắt quả tang' : isCanBoPhatHienType ? 'Cán bộ phát hiện' : isTuThuType ? 'Người tự thú' : isDauThuType ? 'Người đầu thú' : tuCachNguoiBao,
      thoiGianSuViec: thoiGianSuViec,
      diaDiemSuViec: diaDiemSuViec,
      doiTuongLienQuan: doiTuongBiToGiac,
      dienBienSuViec: dienBienSuViec,
      hauQuaThietHai: hauQuaThietHai,
      hoSoLienKetId: hoSoLienKetId,
      // Bổ sung chuyên biệt cho Bắt quả tang & Cán bộ phát hiện
      tangVatThuGiu: tangVatThuGiu || doVatGiaoNop,
      nguoiLamChung: nguoiLamChung,
      lucLuongPhatHien: lucLuongPhatHien,
      bienPhapPhatHien: bienPhapPhatHien,
      // Các trường nghiệp vụ chuyên biệt Tự thú / Đầu thú (Mục 12.3 & 12.4)
      quocTich: ttQuocTich,
      gioiTinh: cnGioiTinh,
      ngaySinh: cnNgaySinh,
      noiOChinh: ttNoiOHienTai,
      nhanDangDacBiet: ttNhanDang,
      tinhTrangXacMinhDanhTinh: ttTrieuChungXacMinh,
      hinhThucTrinhDien: hinhThucTrinhDien,
      truongHopTrinhDien: truongHopTrinhDien,
      lyDoPhanLoai: lyDoPhanLoai,
      nguoiDiCung: hasNguoiDiCung
        ? {
          hoTen: nguoiDiCungHoTen,
          cccd: nguoiDiCungCccd,
          quanHe: nguoiDiCungQuanHe,
          sdt: nguoiDiCungSdt,
        }
        : undefined,
      doVatGiaoNop: doVatGiaoNop,
      canhBaoAnToan: {
        canHoTroYTe,
        lyDoYTe,
        nguyCoMatAnToan,
        canBaoVeNguoiTaiSan,
        canBaoQuanDoVat,
      },
      historyLogs: [
        {
          time: fullDateTime,
          action: `Ghi nhận tiếp nhận (${isTuThuType ? 'Người tự thú' : isDauThuType ? 'Người đầu thú' : loaiNghiepVu === 'tin_bao_to_giac' ? 'Tin tố giác tội phạm' : loaiNghiepVu === 'tai_lieu_bo_sung' ? 'Tài liệu bổ sung' : 'Đơn tiếp nhận'})`,
          actor: canBoNhan || 'Lê Ngọc Mai',
          note: `Đã ghi nhận lượt nhận vào hệ thống (${hasAnyFile ? `${files.length} tệp tài liệu` : 'Không có tệp'}, ${hasNote ? 'Có ghi chú' : 'Không có ghi chú'}${isTuThuDauThuType ? `, Phân loại: ${truongHopTrinhDien === 'tu_thu' ? 'Tự thú' : truongHopTrinhDien === 'dau_thu' ? 'Đầu thú' : 'Chờ xác nhận'}` : ''}${canHoTroYTe ? ', Cần hỗ trợ y tế khẩn cấp' : ''})`,
        },
      ],
    };

    const donCode = generatedId.startsWith('LN-') ? `Đ-${generatedId.replace('LN-', '')}` : `Đ-${generatedId}`;

    showToast(`Đã tiếp nhận thành công và hình thành Đơn [${donCode}]! Đang chuyển sang màn Công việc của tôi...`);

    setTimeout(() => {
      if (onSubmit) {
        onSubmit(newRecord);
      } else {
        onNav('cong-viec');
      }
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden w-full">
      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-bounce text-xs font-medium">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─── 1. FULL WIDTH HEADER BAR ─────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex flex-col min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 font-label-technical mb-1">
            <button
              type="button"
              onClick={() => onNav('cong-viec')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Trang chủ
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onNav('nhan-don-list')}
              className="hover:text-blue-700 cursor-pointer"
            >
              Hàng đợi tiếp nhận
            </button>
            <span>/</span>
            <span className="text-slate-700 font-semibold">
              {loaiNghiepVu === 'nguoi_tu_thu'
                ? 'Tiếp nhận người tự thú'
                : loaiNghiepVu === 'nguoi_dau_thu'
                  ? 'Tiếp nhận người đầu thú'
                  /* Tạm ẩn tiếp nhận tin báo, tố giác theo yêu cầu
                  : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham'
                    ? 'Tiếp nhận tin báo về tội phạm'
                    : loaiNghiepVu === 'to_giac_toi_pham'
                      ? 'Tiếp nhận tố giác về tội phạm'
                  */
                  : loaiNghiepVu === 'tai_lieu_bo_sung'
                    ? 'Tiếp nhận tài liệu bổ sung'
                    : 'Tiếp nhận đơn hành chính'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNav('nhan-don-list')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Quay lại"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[18px] font-bold text-slate-900 font-headline-md tracking-tight">
                {loaiNghiepVu === 'nguoi_tu_thu'
                  ? 'Tiếp nhận người tự thú'
                  : loaiNghiepVu === 'nguoi_dau_thu'
                    ? 'Tiếp nhận người đầu thú'
                    /* Tạm ẩn tiếp nhận tin báo, tố giác theo yêu cầu
                    : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham'
                      ? 'Tiếp nhận tin báo về tội phạm'
                      : loaiNghiepVu === 'to_giac_toi_pham'
                        ? 'Tiếp nhận tố giác về tội phạm'
                    */
                    : loaiNghiepVu === 'tai_lieu_bo_sung'
                      ? 'Tiếp nhận tài liệu bổ sung cho hồ sơ vụ việc'
                      : 'Thêm mới đơn tiếp nhận'}
              </h1>
              {/* {loaiNghiepVu === 'nguoi_tu_thu' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[11.5px] font-bold border border-indigo-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">front_hand</span>
                  Người tự thú (Điều 4, 145, 146 BLTTHS)
                </span>
              ) : loaiNghiepVu === 'nguoi_dau_thu' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[11.5px] font-bold border border-amber-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">security</span>
                  Người đầu thú (Điều 4, 145, 146 BLTTHS)
                </span>
              ) : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11.5px] font-bold border border-rose-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">local_police</span>
                  Tố tụng hình sự (BLTTHS 2015)
                </span>
              ) : loaiNghiepVu === 'tai_lieu_bo_sung' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11.5px] font-bold border border-purple-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">note_add</span>
                  Bổ sung hồ sơ đang mở
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11.5px] font-bold border border-blue-200">
                  Hành chính / Khiếu nại - Tố cáo
                </span>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNav('nhan-don-list')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[13px] transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white font-semibold text-[13px] shadow-xs hover:shadow-md transition-all cursor-pointer ${loaiNghiepVu === 'nguoi_tu_thu'
                ? 'bg-indigo-700 hover:bg-indigo-800'
                : loaiNghiepVu === 'nguoi_dau_thu'
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : loaiNghiepVu === 'bat_qua_tang'
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : loaiNghiepVu === 'can_bo_phat_hien'
                      ? 'bg-teal-700 hover:bg-teal-800'
                      : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                        ? 'bg-[#b91c1c] hover:bg-[#991b1b]'
                        : loaiNghiepVu === 'tai_lieu_bo_sung'
                          ? 'bg-purple-700 hover:bg-purple-800'
                          : 'bg-[#004ac6] hover:bg-[#003ea8]'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>
              {loaiNghiepVu === 'nguoi_tu_thu'
                ? 'Tiếp nhận người tự thú & Hình thành Đơn'
                : loaiNghiepVu === 'nguoi_dau_thu'
                  ? 'Tiếp nhận người đầu thú & Hình thành Đơn'
                  : loaiNghiepVu === 'bat_qua_tang'
                    ? 'Tiếp nhận Bắt quả tang & Hình thành Đơn'
                    : loaiNghiepVu === 'can_bo_phat_hien'
                      ? 'Tiếp nhận CB phát hiện & Hình thành Đơn'
                        /* Tạm ẩn tiếp nhận tin tố giác theo yêu cầu
                        : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                          ? 'Tiếp nhận tin tố giác & Hình thành Đơn'
                        */
                        : loaiNghiepVu === 'tai_lieu_bo_sung'
                          ? 'Tiếp nhận tài liệu & Hình thành Đơn'
                          : 'Tiếp nhận & Hình thành Đơn'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-8 w-full">
        {/* ─── 0. CHỌN LOẠI NGHIỆP VỤ TIẾP NHẬN GOVEX (DẠNG DROPDOWN) ───────────────── */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-700">category</span>
              <h2 className="text-[14px] font-bold text-slate-900 font-headline-md">
                Loại nghiệp vụ tiếp nhận
              </h2>
              <span className="text-red-500 font-bold">*</span>
            </div>
            <span className="text-[12px] text-slate-500">
              Chọn luồng nghiệp vụ để tự động tải biểu mẫu &amp; thẩm quyền thụ lý tương ứng
            </span>
          </div>

          {/* DROPDOWN SELECTOR */}
          {(() => {
            const NGHIEP_VU_OPTIONS: {
              value: LoaiNghiepVuTiepNhan;
              aliases?: LoaiNghiepVuTiepNhan[];
              label: string;
              subtitle: string;
              badge: string;
              badgeColor: string;
              icon: string;
              iconColor: string;
              canCu: string;
              donViDefault: string;
              handler: () => void;
            }[] = [
              {
                value: 'tiep_nhan_don',
                label: '1. Tiếp nhận đơn',
                subtitle: 'Đơn khiếu nại, tố cáo hành chính, phản ánh kiến nghị theo Luật Khiếu nại, Luật Tố cáo',
                badge: 'Hành chính',
                badgeColor: 'bg-blue-100 text-[#004ac6] border-blue-200',
                icon: 'description',
                iconColor: 'text-[#004ac6] bg-blue-50',
                canCu: 'Luật Khiếu nại 2011 & Luật Tố cáo 2018',
                donViDefault: 'Phòng Tiếp công dân & Xử lý đơn',
                handler: () => {
                  setLoaiNghiepVu('tiep_nhan_don');
                  setDonViNhan('Phòng Tiếp công dân & Xử lý đơn');
                },
              },
              /* Tạm ẩn các tùy chọn tiếp nhận tin báo, tố giác tội phạm theo yêu cầu
              {
                value: 'tin_bao_toi_pham',
                label: '2. Tiếp nhận tin báo về tội phạm',
                subtitle: 'Thông tin về hành vi có dấu hiệu tội phạm do cơ quan, tổ chức, cá nhân thông báo hoặc phản ánh',
                badge: 'Hình sự',
                badgeColor: 'bg-rose-100 text-[#b91c1c] border-rose-200',
                icon: 'campaign',
                iconColor: 'text-[#b91c1c] bg-rose-50',
                canCu: 'Điều 144, 145, 146 BLTTHS',
                donViDefault: 'Công an thành phố Hà Nội',
                handler: () => {
                  setLoaiNghiepVu('tin_bao_toi_pham');
                  setHinhThucNhan('Trực tiếp');
                  setDonViNhan('Công an thành phố Hà Nội');
                  setLoaiDonToGiac('Tin báo về tội phạm');
                },
              },
              {
                value: 'to_giac_toi_pham',
                aliases: ['tin_bao_to_giac'],
                label: '3. Tiếp nhận tố giác về tội phạm',
                subtitle: 'Cá nhân phát hiện và tố cáo hành vi có dấu hiệu tội phạm của đối tượng cụ thể với cơ quan có thẩm quyền',
                badge: 'Hình sự',
                badgeColor: 'bg-rose-100 text-[#b91c1c] border-rose-200',
                icon: 'local_police',
                iconColor: 'text-[#b91c1c] bg-rose-50',
                canCu: 'Điều 144, 145, 146 BLTTHS & TTLT 01/2017',
                donViDefault: 'Công an thành phố Hà Nội',
                handler: () => {
                  setLoaiNghiepVu('to_giac_toi_pham');
                  setHinhThucNhan('Trực tiếp');
                  setDonViNhan('Công an thành phố Hà Nội');
                  setLoaiDonToGiac('Đơn tố giác về tội phạm');
                },
              },
              */
              {
                value: 'nguoi_tu_thu',
                label: '4. Tiếp nhận người tự thú',
                subtitle: 'Người phạm tội tự nguyện khai báo với cơ quan có thẩm quyền trước khi hành vi phạm tội bị phát hiện',
                badge: 'Khoản 1 Điều 4 BLTTHS',
                badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                icon: 'front_hand',
                iconColor: 'text-indigo-700 bg-indigo-50',
                canCu: 'Khoản 1 Điều 4, Điều 145, Điều 146 BLTTHS',
                donViDefault: 'Công an TP. Hà Nội (Trực ban hình sự)',
                handler: () => {
                  setLoaiNghiepVu('nguoi_tu_thu');
                  setTruongHopTrinhDien('tu_thu');
                  setHinhThucTrinhDien('Tự đến trực tiếp trình diện');
                  setDonViNhan('Công an thành phố Hà Nội');
                  setDiaDiemTiepNhan('Phòng Trực ban hình sự - Công an TP. Hà Nội');
                  setLyDoPhanLoai('Công dân tự nguyện đến cơ quan Công an khai nhận hành vi phạm tội trước khi bị cơ quan có thẩm quyền phát hiện.');
                },
              },
              {
                value: 'nguoi_dau_thu',
                label: '5. Tiếp nhận người đầu thú',
                subtitle: 'Người phạm tội đến trình diện sau khi hành vi phạm tội đã bị phát hiện hoặc đang bị truy nã',
                badge: 'Khoản 1 Điều 4 BLTTHS',
                badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
                icon: 'security',
                iconColor: 'text-amber-700 bg-amber-50',
                canCu: 'Khoản 1 Điều 4, Điều 145, Điều 146 BLTTHS',
                donViDefault: 'Công an TP. Hà Nội (Trực ban hình sự)',
                handler: () => {
                  setLoaiNghiepVu('nguoi_dau_thu');
                  setTruongHopTrinhDien('dau_thu');
                  setHinhThucTrinhDien('Tự đến trực tiếp trình diện');
                  setDonViNhan('Công an thành phố Hà Nội');
                  setDiaDiemTiepNhan('Phòng Trực ban hình sự - Công an TP. Hà Nội');
                  setLyDoPhanLoai('Người phạm tội đến trình diện sau khi hành vi phạm tội đã bị cơ quan có thẩm quyền phát hiện hoặc đang bị truy nã.');
                },
              },
              {
                value: 'tai_lieu_bo_sung',
                label: '6. Tiếp nhận tài liệu bổ sung',
                subtitle: 'Bổ sung chứng cứ, văn bản hoặc giải trình gắn trực tiếp vào Hồ sơ / Đơn đang mở (không sinh đơn mới)',
                badge: 'Bổ sung hồ sơ',
                badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
                icon: 'note_add',
                iconColor: 'text-purple-700 bg-purple-50',
                canCu: 'Quy chế tiếp nhận & quản lý hồ sơ GOVEX',
                donViDefault: 'Phòng Tiếp công dân & Xử lý đơn',
                handler: () => {
                  setLoaiNghiepVu('tai_lieu_bo_sung');
                },
              },
              {
                value: 'bat_qua_tang',
                label: '7. Bắt người phạm tội quả tang',
                subtitle: 'Bắt người khi đang thực hiện hành vi phạm tội hoặc ngay sau khi phạm tội thì bị phát hiện, đuổi bắt (không cần đơn)',
                badge: 'Điều 111 BLTTHS',
                badgeColor: 'bg-red-100 text-red-900 border-red-300',
                icon: 'crisis_alert',
                iconColor: 'text-red-700 bg-red-50',
                canCu: 'Điều 111, Điều 115 BLTTHS',
                donViDefault: 'Công an thành phố Hà Nội',
                handler: () => {
                  setLoaiNghiepVu('bat_qua_tang');
                  setHinhThucNhan('Bắt quả tang tại hiện trường');
                  setDonViNhan('Công an thành phố Hà Nội');
                  setDiaDiemTiepNhan('Khu vực bãi đỗ xe số 2, Bến xe Giáp Bát, Hoàng Mai, Hà Nội');
                },
              },
              {
                value: 'can_bo_phat_hien',
                label: '8. Cán bộ trực tiếp phát hiện',
                subtitle: 'Cơ quan, cán bộ có thẩm quyền trực tiếp phát hiện dấu hiệu tội phạm qua công tác quản lý, tuần tra kiểm soát',
                badge: 'Khoản 3 Điều 143 BLTTHS',
                badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
                icon: 'radar',
                iconColor: 'text-teal-700 bg-teal-50',
                canCu: 'Khoản 3 Điều 143 BLTTHS',
                donViDefault: 'Công an thành phố Hà Nội',
                handler: () => {
                  setLoaiNghiepVu('can_bo_phat_hien');
                  setHinhThucNhan('Tuần tra phát hiện');
                  setDonViNhan('Công an thành phố Hà Nội');
                  setDiaDiemTiepNhan('Kho bãi ngõ 250 đường Lĩnh Nam, Hoàng Mai, Hà Nội');
                },
              },
            ];

            const currentOption =
              NGHIEP_VU_OPTIONS.find(
                (opt) => opt.value === loaiNghiepVu || (opt.aliases && opt.aliases.includes(loaiNghiepVu))
              ) || NGHIEP_VU_OPTIONS[0];

            return (
              <div className="space-y-2.5">
                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsLoaiNghiepVuDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-slate-50 hover:bg-slate-100/90 border-2 border-slate-300 hover:border-blue-500 rounded-xl transition-all cursor-pointer text-left shadow-2xs group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs ${currentOption.iconColor}`}>
                        <span className="material-symbols-outlined text-[22px]">{currentOption.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13.5px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {currentOption.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${currentOption.badgeColor}`}>
                            {currentOption.badge}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-500 truncate mt-0.5 max-w-[650px]">
                          {currentOption.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[11.5px] font-medium text-slate-400 hidden sm:inline">Nhấn để đổi</span>
                      <span className={`material-symbols-outlined text-[22px] text-slate-500 transition-transform duration-200 ${isLoaiNghiepVuDropdownOpen ? 'rotate-180 text-blue-600' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu Panel */}
                  {isLoaiNghiepVuDropdownOpen && (
                    <>
                      {/* Invisible backdrop to dismiss */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsLoaiNghiepVuDropdownOpen(false)}
                      />

                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-[460px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500 font-semibold px-3">
                          <span>DANH SÁCH LOẠI NGHIỆP VỤ TIẾP NHẬN THEO QUY ĐỊNH</span>
                          <span>Bấm để chọn</span>
                        </div>
                        {NGHIEP_VU_OPTIONS.map((opt) => {
                          const isSelected =
                            opt.value === loaiNghiepVu || (opt.aliases && opt.aliases.includes(loaiNghiepVu));
                          return (
                            <div
                              key={opt.value}
                              onClick={() => {
                                opt.handler();
                                setIsLoaiNghiepVuDropdownOpen(false);
                              }}
                              className={`p-3 sm:p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/80 text-blue-900 border-l-4 border-l-[#004ac6]'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/60 ${opt.iconColor}`}>
                                <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[13px] font-bold ${isSelected ? 'text-[#004ac6]' : 'text-slate-900'}`}>
                                      {opt.label}
                                    </span>
                                    <span className={`px-2 py-0.2 rounded-full text-[10.5px] font-semibold border ${opt.badgeColor}`}>
                                      {opt.badge}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <span className="material-symbols-outlined text-[18px] text-[#004ac6] shrink-0">
                                      check_circle
                                    </span>
                                  )}
                                </div>
                                <p className="text-[12px] text-slate-600 mt-0.5 leading-snug">
                                  {opt.subtitle}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
                                  <span>Căn cứ: <strong className="text-slate-700">{opt.canCu}</strong></span>
                                  <span>•</span>
                                  <span>Đơn vị mặc định: <strong className="text-slate-700">{opt.donViDefault}</strong></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Banner tóm tắt nghiệp vụ & căn cứ pháp lý của loại đang chọn */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 px-1 text-[12px] text-slate-600 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">gavel</span>
                    <span>Căn cứ pháp lý: <strong className="text-slate-800">{currentOption.canCu}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">account_balance</span>
                    <span>Đơn vị tiếp nhận mặc định: <strong className="text-slate-800">{currentOption.donViDefault}</strong></span>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ─── SECTION 1: THÔNG TIN TIẾP NHẬN ─────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${loaiNghiepVu === 'tin_bao_to_giac' ? 'bg-rose-100 text-rose-800' : 'bg-blue-50 text-blue-700'
                }`}>
                01
              </div>
              <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                Thông tin tiếp nhận &amp; Nguồn tiếp nhận
              </h2>
            </div>
            <span className="text-[12px] text-slate-400">
              Các trường có dấu (<span className="text-red-500">*</span>) là bắt buộc
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Ngày nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Ngày nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={ngayNhan}
                onChange={(e) => {
                  setNgayNhan(e.target.value);
                  if (errors.ngayNhan) setErrors((prev) => ({ ...prev, ngayNhan: '' }));
                }}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.ngayNhan ? 'border-red-500' : 'border-slate-200'
                  }`}
              />
              {errors.ngayNhan && (
                <p className="text-[11px] text-red-500 mt-1">{errors.ngayNhan}</p>
              )}
            </div>

            {/* Giờ nhận (Quan trọng xác định thời điểm tính hạn giải quyết) */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Thời điểm tiếp nhận (Giờ)
              </label>
              <input
                type="time"
                value={gioNhan}
                onChange={(e) => setGioNhan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
            </div>

            {/* Nguồn tin / Hình thức nhận * */}
            <div className="lg:col-span-2">
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                {loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu'
                  ? 'Hình thức người đó đến trình diện'
                  : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                    ? 'Nguồn tin / Phương thức tiếp nhận'
                    : 'Hình thức nhận'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={
                  loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu'
                    ? hinhThucTrinhDien
                    : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                      ? nguonTin
                      : hinhThucNhan
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu') {
                    setHinhThucTrinhDien(val);
                    setHinhThucNhan(val);
                  } else if (loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham') {
                    setNguonTin(val);
                    setHinhThucNhan(val.includes('lời nói') ? 'Trực tiếp' : val.includes('bưu') ? 'Bưu điện' : 'Trực tiếp');
                  } else {
                    setHinhThucNhan(val);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                {loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu' ? (
                  <>
                    <option value="Tự đến trực tiếp trình diện">Tự đến trực tiếp trình diện</option>
                    <option value="Người thân / Gia đình khuyên giải đưa đến">Người thân / Gia đình khuyên giải đưa đến</option>
                    <option value="Công an xã / phường / thị trấn áp giải chuyển giao">Công an xã / phường / thị trấn áp giải chuyển giao</option>
                    <option value="Cơ quan, đơn vị nơi làm việc / Đơn vị quân đội đưa đến">Cơ quan, đơn vị nơi làm việc / Đơn vị quân đội đưa đến</option>
                    <option value="Cơ quan khác bàn giao (Viện kiểm sát, Tòa án, Báo chí)">Cơ quan khác bàn giao (Viện kiểm sát, Tòa án, Báo chí)</option>
                  </>
                /* Tạm ẩn các lựa chọn hình thức nhận tin báo, tố giác theo yêu cầu
                ) : loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham' ? (
                  <>
                    <option value="Trực tiếp bằng văn bản (Đơn tố giác)">Trực tiếp bằng văn bản (Đơn tố giác có chữ ký)</option>
                    <option value="Trực tiếp bằng lời nói (Lập Biên bản tiếp nhận)">Trực tiếp bằng lời nói (Lập Biên bản tiếp nhận tin báo)</option>
                    <option value="Dịch vụ bưu chính / Chuyển phát">Dịch vụ bưu chính / Chuyển phát</option>
                    <option value="Cổng DVC / Ứng dụng VNeID">Cổng DVC / Ứng dụng định danh VNeID</option>
                    <option value="Đường dây nóng (Hotline 113 / Trực ban)">Đường dây nóng (Hotline 113 / Trực ban hình sự)</option>
                    <option value="Cơ quan khác chuyển giao (VKS, Tòa án, Báo chí)">Cơ quan khác chuyển giao (VKS, Tòa án, Báo chí)</option>
                  </>
                */
                ) : (
                  <>
                    <option value="Trực tiếp">Trực tiếp tại Một cửa</option>
                    <option value="Bưu điện">Dịch vụ bưu chính</option>
                    <option value="Trực tuyến">Trực tuyến (Cổng DVC)</option>
                    <option value="Chuyển phát">Chuyển phát cơ quan khác</option>
                  </>
                )}
              </select>
            </div>

            {/* Cán bộ nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Cán bộ tiếp nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={canBoNhan}
                onChange={(e) => setCanBoNhan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Tên cán bộ tiếp nhận"
              />
            </div>

            {/* Đơn vị nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Đơn vị nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={donViNhan}
                onChange={(e) => setDonViNhan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                {loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu' || loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham' ? (
                  <>
                    <option value="Công an thành phố Hà Nội">Công an thành phố Hà Nội</option>
                    <option value="Công an quận Cầu Giấy">Công an quận Cầu Giấy</option>
                    <option value="Công an phường Dịch Vọng Hậu">Công an phường Dịch Vọng Hậu</option>
                    <option value="Văn phòng Cơ quan CSĐT">Văn phòng Cơ quan CSĐT</option>
                    <option value="Phòng Cảnh sát hình sự">Phòng Cảnh sát hình sự (PC02)</option>
                    <option value="Phòng Cảnh sát kinh tế">Phòng Cảnh sát kinh tế (PC03)</option>
                  </>
                ) : (
                  <>
                    <option value="Phòng Tiếp công dân & Xử lý đơn">Phòng Tiếp công dân & Xử lý đơn</option>
                    <option value="Phòng Hành chính - Tổng hợp">Phòng Hành chính - Tổng hợp</option>
                    <option value="Ban Tiếp công dân tỉnh">Ban Tiếp công dân tỉnh</option>
                    <option value="Thanh tra tỉnh">Thanh tra tỉnh</option>
                    <option value="Sở Xây dựng">Sở Xây dựng</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Địa điểm tiếp nhận chuyên biệt (Mục 12.3.B) */}
          {(loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu') && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                Địa điểm tiếp nhận người trình diện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={diaDiemTiepNhan}
                onChange={(e) => setDiaDiemTiepNhan(e.target.value)}
                placeholder="Ví dụ: Phòng Trực ban hình sự - Công an TP. Hà Nội (Số 87 Trần Hưng Đạo)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              />
            </div>
          )}
        </section>

        {/* ─── SECTION 2: LOẠI NGƯỜI NỘP ĐƠN ───────────────────── */}
        {loaiNghiepVu !== 'nguoi_tu_thu' && loaiNghiepVu !== 'nguoi_dau_thu' && (
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                  {/* loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham'
                    ? 'Thông tin người cung cấp tin / Báo tin'
                    : */ 'Loại người nộp đơn & Thông tin chủ thể'}
                </h2>
              </div>
              {/* {(loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham') && (
                <span className="text-[12px] text-slate-500 italic">
                  Cho phép tiếp nhận nặc danh / Chưa có đầy đủ định danh (không ép buộc)
                </span>
              )} */}
            </div>

            {/* Lựa chọn loại người nộp dạng Radio Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-1">
              <div className="flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="loaiNguoiNop"
                    value="ca-nhan"
                    checked={loaiNguoiNop === 'ca-nhan'}
                    onChange={() => setLoaiNguoiNop('ca-nhan')}
                    className="w-4 h-4 text-[#004ac6] border-slate-300 focus:ring-[#004ac6] cursor-pointer"
                  />
                  <span className={`text-[13.5px] ${loaiNguoiNop === 'ca-nhan' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                    Cá nhân
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="loaiNguoiNop"
                    value="to-chuc"
                    checked={loaiNguoiNop === 'to-chuc'}
                    onChange={() => setLoaiNguoiNop('to-chuc')}
                    className="w-4 h-4 text-[#004ac6] border-slate-300 focus:ring-[#004ac6] cursor-pointer"
                  />
                  <span className={`text-[13.5px] ${loaiNguoiNop === 'to-chuc' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                    Tổ chức / Cơ quan
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="loaiNguoiNop"
                    value="khong-ro"
                    checked={loaiNguoiNop === 'khong-ro'}
                    onChange={() => setLoaiNguoiNop('khong-ro')}
                    className="w-4 h-4 text-[#004ac6] border-slate-300 focus:ring-[#004ac6] cursor-pointer"
                  />
                  <span className={`text-[13.5px] ${loaiNguoiNop === 'khong-ro' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {loaiNghiepVu === 'tin_bao_to_giac' ? 'Chưa xác định / Nặc danh (Giấu tên)' : 'Không rõ thông tin'}
                  </span>
                </label>
              </div>

              {/* Điều khiển bổ sung cho Tin báo tố giác: Tư cách & Bảo mật - Tạm ẩn theo yêu cầu */}
              {/* {loaiNghiepVu === 'tin_bao_to_giac' && (
                <div className="flex items-center gap-4 flex-wrap bg-amber-50/70 border border-amber-200/90 px-3.5 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <span className="font-semibold text-slate-800">Tư cách:</span>
                    <select
                      value={tuCachNguoiBao}
                      onChange={(e) => setTuCachNguoiBao(e.target.value)}
                      className="p-1 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="Người trực tiếp bị hại">Người trực tiếp bị hại</option>
                      <option value="Người phát hiện, chứng kiến sự việc">Người phát hiện / Chứng kiến</option>
                      <option value="Người đại diện / Người giám hộ">Người đại diện / Giám hộ</option>
                      <option value="Cơ quan, tổ chức phát hiện">Cơ quan / Tổ chức phát hiện</option>
                      <option value="Nặc danh / Chưa rõ tư cách">Nặc danh / Chưa rõ tư cách</option>
                    </select>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={yeuCauBaoMat}
                      onChange={(e) => {
                        setYeuCauBaoMat(e.target.checked);
                        if (e.target.checked) {
                          showToast('🛡️ Đã kích hoạt chế độ bảo mật danh tính người tố giác theo quy định!');
                        }
                      }}
                      className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-rose-700">lock</span>
                      Yêu cầu bảo mật danh tính
                    </span>
                  </label>
                </div>
              )} */}
            </div>

            {/* ─── TRƯỜNG HỢP: CÁ NHÂN ─── */}
            {loaiNguoiNop === 'ca-nhan' && (
              <div className="space-y-6 pt-1">
                {/* Thông tin cá nhân */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-slate-800 font-label-technical">
                      Thông tin cá nhân
                    </h3>
                    <button
                      type="button"
                      onClick={handleScanCccd}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">nfc</span>
                      <span>Quét CCCD gắn chip</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cnHoTen}
                        onChange={(e) => {
                          setCnHoTen(e.target.value);
                          if (errors.cnHoTen) setErrors((prev) => ({ ...prev, cnHoTen: '' }));
                        }}
                        placeholder="VD: Nguyễn Văn An"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.cnHoTen ? 'border-red-500' : 'border-slate-200'
                          }`}
                      />
                      {errors.cnHoTen && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.cnHoTen}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={cnNgaySinh}
                        onChange={(e) => setCnNgaySinh(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Giới tính
                      </label>
                      <select
                        value={cnGioiTinh}
                        onChange={(e) => setCnGioiTinh(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[12px] font-semibold text-slate-700">
                          Số định danh cá nhân / CCCD
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCnCccd('001088019482');
                            handleSearchCccdCaNhan('001088019482');
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          title="Điền nhanh CCCD mẫu có sẵn trong CSDL Dân cư"
                        >
                          CCCD mẫu
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={cnCccd}
                          onChange={(e) => {
                            setCnCccd(e.target.value);
                            if (errors.cnCccd) setErrors((prev) => ({ ...prev, cnCccd: '' }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchCccdCaNhan();
                            }
                          }}
                          placeholder="12 chữ số CCCD"
                          className={`flex-1 p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.cnCccd ? 'border-red-500' : 'border-slate-200'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchCccdCaNhan()}
                          title="Tra cứu CSDL Dân cư Quốc gia (Nhấn Enter hoặc bấm Tra cứu)"
                          className="px-3 py-2.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">search</span>
                          <span>Tra cứu</span>
                        </button>
                      </div>
                      {errors.cnCccd && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.cnCccd}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={cnSdt}
                        onChange={(e) => setCnSdt(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={cnEmail}
                        onChange={(e) => setCnEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* Cùng 1 hàng: Tỉnh/Thành phố, Phường/Xã và Địa chỉ chi tiết */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Tỉnh / Thành phố
                      </label>
                      <select
                        value={cnTinhThanh}
                        onChange={(e) => {
                          const newTinh = e.target.value;
                          setCnTinhThanh(newTinh);
                          const wards = PROVINCES_AND_WARDS[newTinh];
                          if (wards && wards.length > 0) {
                            setCnPhuongXa(wards[0]);
                            setIsCustomPhuongXa(false);
                          } else {
                            setCnPhuongXa('');
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                      >
                        {VIETNAMESE_PROVINCES.map((tinh) => (
                          <option key={tinh} value={tinh}>
                            {tinh}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[12px] font-semibold text-slate-700">
                          Phường / Xã
                        </label>
                      </div>
                      {isCustomPhuongXa || !PROVINCES_AND_WARDS[cnTinhThanh] ? (
                        <input
                          type="text"
                          value={cnPhuongXa}
                          onChange={(e) => setCnPhuongXa(e.target.value)}
                          placeholder="Phường/Xã/Thị trấn"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      ) : (
                        <select
                          value={cnPhuongXa}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomPhuongXa(true);
                              setCnPhuongXa('');
                            } else {
                              setCnPhuongXa(e.target.value);
                            }
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                        >
                          <option value="">-- Chọn Phường / Xã --</option>
                          {(PROVINCES_AND_WARDS[cnTinhThanh] || []).map((px) => (
                            <option key={px} value={px}>
                              {px}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Địa chỉ chi tiết
                      </label>
                      <input
                        type="text"
                        value={cnDiaChiChiTiet}
                        onChange={(e) => setCnDiaChiChiTiet(e.target.value)}
                        placeholder="Số nhà, đường phố, ngõ ngách..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Có người ủy quyền không? */}
                <div className="space-y-4 pt-2">
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${cnTuCach === 'nguoi-dai-dien'
                      ? 'border-[#004ac6] bg-blue-50/40 shadow-xs ring-1 ring-[#004ac6]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <input
                      type="checkbox"
                      id="checkbox-co-nguoi-uy-quyen"
                      checked={cnTuCach === 'nguoi-dai-dien'}
                      onChange={(e) => setCnTuCach(e.target.checked ? 'nguoi-dai-dien' : 'nguoi-dung-don')}
                      className="mt-0.5 w-4.5 h-4.5 text-[#004ac6] rounded border-slate-300 focus:ring-[#004ac6] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-slate-900 flex items-center gap-2">
                        <span>Có người ủy quyền không?</span>
                        {cnTuCach === 'nguoi-dai-dien' && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-100 text-[#004ac6] rounded-full">
                            Có người ủy quyền / đại diện
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5">
                        Tích chọn nếu người trực tiếp nộp đơn hoặc làm việc với cơ quan là người được ủy quyền hoặc người đại diện hợp pháp
                      </div>
                    </div>
                  </label>

                  {/* ─── KHU VỰC: THÔNG TIN NGƯỜI ĐẠI DIỆN ─── */}
                  {cnTuCach === 'nguoi-dai-dien' && (
                    <div className="space-y-4 pt-1 animate-in fade-in duration-200">

                      {/* CARD 1: THÔNG TIN NGƯỜI ĐẠI DIỆN */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-xs">
                              1
                            </span>
                            <div>
                              <h4 className="text-[13px] font-bold text-slate-800">
                                Thông tin người đại diện / Người được ủy quyền
                              </h4>
                              <p className="text-[11.5px] text-slate-500">
                                Thông tin cá nhân thực hiện nộp hồ sơ hoặc làm việc với cơ quan
                              </p>
                            </div>
                          </div>
                          {isViewModeDaiDien && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">
                              <span className="material-symbols-outlined text-xs">lock</span>
                              Chế độ xem
                            </span>
                          )}
                        </div>

                        {/* Tra cứu CCCD quick-bar (chỉ hiện khi ở Edit mode) */}
                        {/* {!isViewModeDaiDien && (
                        <div className="p-3 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#004ac6] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base">search</span>
                              Tra cứu tự động theo CCCD từ CSDL Quốc gia
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Tự động điền dữ liệu đã xác thực, có thể chỉnh sửa thủ công
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-medium text-slate-600">Gợi ý mẫu tra cứu:</span>
                            <button
                              type="button"
                              onClick={() => handleSearchCccdDaiDien('001092015882')}
                              className="px-2.5 py-1 bg-white hover:bg-blue-100/60 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                              001092015882 (Trần Đức Minh)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSearchCccdDaiDien('001193004521')}
                              className="px-2.5 py-1 bg-white hover:bg-blue-100/60 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                              001193004521 (Lê Thị Thu Hà - LS)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSearchCccdDaiDien('079190008899')}
                              className="px-2.5 py-1 bg-white hover:bg-blue-100/60 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                              079190008899 (Phạm Quốc Bảo)
                            </button>
                          </div>
                        </div>
                      )} */}

                        {/* Layout 3 cột trên desktop */}
                        {isViewModeDaiDien ? (
                          /* Read-only layout in View Mode */
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Họ và tên người đại diện</div>
                              <div className="text-sm font-bold text-slate-900">{cnUqHoTen || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Số CCCD / Định danh</div>
                              <div className="text-sm font-bold font-mono text-slate-900">{cnUqCccd || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Ngày sinh &amp; Giới tính</div>
                              <div className="text-sm font-semibold text-slate-900">
                                {cnUqNgaySinh || '---'} • {cnUqGioiTinh}
                              </div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Số điện thoại</div>
                              <div className="text-sm font-semibold text-slate-900">{cnUqSdt || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Email liên hệ</div>
                              <div className="text-sm font-semibold text-slate-900">{cnUqEmail || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Địa chỉ liên hệ</div>
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {[cnUqDiaChiChiTiet, cnUqPhuongXa, cnUqTinhThanh].filter(Boolean).join(', ') || '---'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Editable form in Edit Mode */
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Hàng 1: Họ tên, Ngày sinh, Giới tính */}
                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Họ và tên người đại diện <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={cnUqHoTen}
                                onChange={(e) => {
                                  setCnUqHoTen(e.target.value);
                                  if (errors.cnUqHoTen) setErrors((prev) => ({ ...prev, cnUqHoTen: '' }));
                                }}
                                placeholder="Nhập họ và tên đầy đủ"
                                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.cnUqHoTen ? 'border-red-500' : 'border-slate-200'
                                  }`}
                              />
                              {errors.cnUqHoTen && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.cnUqHoTen}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Ngày sinh
                              </label>
                              <input
                                type="date"
                                value={cnUqNgaySinh}
                                onChange={(e) => setCnUqNgaySinh(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Giới tính
                              </label>
                              <select
                                value={cnUqGioiTinh}
                                onChange={(e) => setCnUqGioiTinh(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                              >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                              </select>
                            </div>

                            {/* Hàng 2: Số CCCD + Nút tra cứu, Số điện thoại, Email */}
                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Số CCCD / Định danh <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={cnUqCccd}
                                  onChange={(e) => {
                                    setCnUqCccd(e.target.value);
                                    if (errors.cnUqCccd) setErrors((prev) => ({ ...prev, cnUqCccd: '' }));
                                  }}
                                  placeholder="12 chữ số CCCD"
                                  className={`flex-1 p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.cnUqCccd ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSearchCccdDaiDien()}
                                  title="Tra cứu trong CSDL Dân cư"
                                  className="px-3 py-2.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">search</span>
                                  <span>Tra cứu</span>
                                </button>
                              </div>
                              {errors.cnUqCccd && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.cnUqCccd}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Số điện thoại
                              </label>
                              <input
                                type="text"
                                value={cnUqSdt}
                                onChange={(e) => setCnUqSdt(e.target.value)}
                                placeholder="09xx xxx xxx"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Email liên hệ
                              </label>
                              <input
                                type="email"
                                value={cnUqEmail}
                                onChange={(e) => setCnUqEmail(e.target.value)}
                                placeholder="dai-dien@example.com"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>

                            {/* Hàng 3: Tỉnh/Thành phố, Phường/Xã, Địa chỉ chi tiết */}
                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Tỉnh / Thành phố
                              </label>
                              <select
                                value={cnUqTinhThanh}
                                onChange={(e) => {
                                  const newTinh = e.target.value;
                                  setCnUqTinhThanh(newTinh);
                                  const wards = PROVINCES_AND_WARDS[newTinh];
                                  if (wards && wards.length > 0) {
                                    setCnUqPhuongXa(wards[0]);
                                    setIsCustomUqPhuongXa(false);
                                  } else {
                                    setCnUqPhuongXa('');
                                  }
                                }}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                              >
                                {VIETNAMESE_PROVINCES.map((tinh) => (
                                  <option key={tinh} value={tinh}>
                                    {tinh}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[12px] font-semibold text-slate-700">
                                  Phường / Xã
                                </label>
                              </div>
                              {isCustomUqPhuongXa || !PROVINCES_AND_WARDS[cnUqTinhThanh] ? (
                                <input
                                  type="text"
                                  value={cnUqPhuongXa}
                                  onChange={(e) => setCnUqPhuongXa(e.target.value)}
                                  placeholder="Phường/Xã/Thị trấn"
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                              ) : (
                                <select
                                  value={cnUqPhuongXa}
                                  onChange={(e) => {
                                    if (e.target.value === '__custom__') {
                                      setIsCustomUqPhuongXa(true);
                                      setCnUqPhuongXa('');
                                    } else {
                                      setCnUqPhuongXa(e.target.value);
                                    }
                                  }}
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                >
                                  <option value="">-- Chọn Phường / Xã --</option>
                                  {(PROVINCES_AND_WARDS[cnUqTinhThanh] || []).map((px) => (
                                    <option key={px} value={px}>
                                      {px}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Địa chỉ chi tiết
                              </label>
                              <input
                                type="text"
                                value={cnUqDiaChiChiTiet}
                                onChange={(e) => setCnUqDiaChiChiTiet(e.target.value)}
                                placeholder="Số nhà, đường phố, ngõ ngách..."
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CARD 2: CĂN CỨ ĐẠI DIỆN & PHẠM VI ỦY QUYỀN */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-xs">
                            2
                          </span>
                          <div>
                            <h4 className="text-[13px] font-bold text-slate-800">
                              Căn cứ đại diện &amp; Phạm vi ủy quyền
                            </h4>
                            <p className="text-[11.5px] text-slate-500">
                              Xác định hình thức đại diện, số hiệu văn bản pháp lý và quyền hạn được giao
                            </p>
                          </div>
                        </div>

                        {/* Cảnh báo hết hạn hiệu lực */}
                        {cnUqNgayHetHieuLuc && cnUqNgayHetHieuLuc < todayStr && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-semibold animate-in fade-in">
                            <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                            <span>
                              Văn bản ủy quyền đã hết hiệu lực (hết hạn ngày {cnUqNgayHetHieuLuc}). Vui lòng kiểm tra lại văn bản gia hạn hoặc bổ sung giấy tờ hợp lệ.
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Hàng 1: Loại đại diện, Số văn bản, Ngày lập */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Loại đại diện <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={cnUqLoaiDaiDien}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqLoaiDaiDien(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer disabled:bg-slate-100"
                            >
                              <option value="Người được ủy quyền">Người được ủy quyền</option>
                              <option value="Người đại diện theo pháp luật">Người đại diện theo pháp luật</option>
                              <option value="Cha / Mẹ đại diện cho con chưa thành niên">
                                Cha / Mẹ đại diện cho con chưa thành niên
                              </option>
                              <option value="Người giám hộ">Người giám hộ</option>
                              <option value="Khác">Khác</option>
                            </select>
                          </div>

                          {/* Số văn bản / Giấy UQ */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Số văn bản / Giấy UQ
                            </label>
                            <input
                              type="text"
                              value={cnUqSoVanBan}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqSoVanBan(e.target.value)}
                              placeholder="VD: 08/2026/UQ-ND"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          {/* Ngày lập văn bản */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Ngày lập văn bản
                            </label>
                            <input
                              type="date"
                              value={cnUqNgayLap}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqNgayLap(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          {/* Hàng 2: Hiệu lực từ ngày, Đến ngày, Phạm vi đại diện */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Hiệu lực từ ngày
                            </label>
                            <input
                              type="date"
                              value={cnUqNgayHieuLuc}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqNgayHieuLuc(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Đến ngày
                            </label>
                            <input
                              type="date"
                              value={cnUqNgayHetHieuLuc}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqNgayHetHieuLuc(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          {/* Phạm vi đại diện / Quyền hạn được ủy quyền (dạng combobox) */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Phạm vi đại diện / Quyền hạn được ủy quyền
                            </label>
                            <select
                              value={cnUqPhamVi}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqPhamVi(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer disabled:bg-slate-100"
                            >
                              <option value="Toàn quyền đại diện">Toàn quyền đại diện</option>
                              <option value="Nộp đơn, bổ sung tài liệu và làm việc với cơ quan">
                                Nộp đơn, bổ sung tài liệu và làm việc với cơ quan
                              </option>
                              <option value="Nộp đơn và rút đơn">Nộp đơn và rút đơn</option>
                              <option value="Chỉ nộp đơn hồ sơ">Chỉ nộp đơn hồ sơ</option>
                              <option value="Bổ sung tài liệu & làm việc với cơ quan">
                                Bổ sung tài liệu &amp; làm việc với cơ quan
                              </option>
                              <option value="Khác">Khác (nhập chi tiết)</option>
                            </select>
                            {cnUqPhamVi === 'Khác' && (
                              <input
                                type="text"
                                value={cnUqPhamViKhac}
                                disabled={isViewModeDaiDien}
                                onChange={(e) => setCnUqPhamViKhac(e.target.value)}
                                placeholder="Ghi chú nội dung phạm vi cụ thể khác..."
                                className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: TÀI LIỆU CHỨNG MINH TƯ CÁCH ĐẠI DIỆN */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-xs">
                              3
                            </span>
                            <div>
                              <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                                <span>Tài liệu chứng minh tư cách đại diện</span>
                                <span className="text-red-500">*</span>
                              </h4>
                              <p className="text-[11.5px] text-slate-500">
                                Hồ sơ văn bản pháp lý (Giấy ủy quyền, Quyết định cử đại diện, Giấy tờ giám hộ...)
                              </p>
                            </div>
                          </div>

                          {/* Actions: Upload file + Quét máy scan */}
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              id="file-dai-dien-upload"
                              className="hidden"
                              multiple
                              accept=".pdf,.docx,.doc,.jpg,.png"
                              onChange={(e) => handleUploadDaiDienDoc(e.target.files)}
                            />
                            <label
                              htmlFor="file-dai-dien-upload"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm text-[#004ac6]">upload_file</span>
                              <span>Tải file lên</span>
                            </label>

                            <button
                              type="button"
                              onClick={handleScanDaiDien}
                              disabled={isScanningDaiDien}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span className={`material-symbols-outlined text-sm ${isScanningDaiDien ? 'animate-spin' : ''}`}>
                                scanner
                              </span>
                              <span>{isScanningDaiDien ? 'Đang quét...' : 'Quét tài liệu'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Scanner Feedback Simulation */}
                        {isScanningDaiDien && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-[#004ac6] text-xs font-medium animate-pulse">
                            <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
                            <span>Đang kết nối máy quét chuyên dụng và số hóa văn bản ủy quyền (OCR định dạng PDF/A)...</span>
                          </div>
                        )}

                        {/* Cảnh báo khi chưa có tài liệu chứng minh */}
                        {cnUqTaiLieuList.length === 0 && (
                          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs font-semibold animate-in fade-in">
                            <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
                            <span>
                              Chưa có tài liệu chứng minh tư cách đại diện. Vui lòng tải lên văn bản hoặc bấm "Quét tài liệu" từ máy scan để bảo đảm tính hợp lệ.
                            </span>
                          </div>
                        )}

                        {/* Bảng danh sách tài liệu chứng minh */}
                        {cnUqTaiLieuList.length > 0 && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="p-2.5 w-10 text-center">STT</th>
                                  <th className="p-2.5">Tên tệp văn bản</th>
                                  <th className="p-2.5 w-52">Loại tài liệu</th>
                                  <th className="p-2.5 w-24">Dung lượng</th>
                                  <th className="p-2.5 w-28">Ngày tải</th>
                                  <th className="p-2.5 w-36">Người tải</th>
                                  <th className="p-2.5 w-20 text-center">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {cnUqTaiLieuList.map((doc, idx) => (
                                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="p-2.5 text-center font-medium text-slate-500">{idx + 1}</td>
                                    <td className="p-2.5 font-medium text-slate-900">
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-base">picture_as_pdf</span>
                                        <span className="truncate max-w-[220px]" title={doc.name}>{doc.name}</span>
                                      </div>
                                    </td>
                                    <td className="p-2.5">
                                      <select
                                        value={doc.loai}
                                        onChange={(e) =>
                                          handleUpdateDocLoai(
                                            doc.id,
                                            e.target.value as TaiLieuChungMinhItem['loai']
                                          )
                                        }
                                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-200 cursor-pointer"
                                      >
                                        <option value="Giấy ủy quyền">Giấy ủy quyền</option>
                                        <option value="Văn bản cử đại diện">Văn bản cử đại diện</option>
                                        <option value="Giấy tờ chứng minh giám hộ">Giấy tờ chứng minh giám hộ</option>
                                        <option value="Giấy khai sinh">Giấy khai sinh</option>
                                        <option value="Tài liệu khác">Tài liệu khác</option>
                                      </select>
                                    </td>
                                    <td className="p-2.5 text-slate-500 font-mono text-[11px]">{doc.size}</td>
                                    <td className="p-2.5 text-slate-600 text-[11px]">{doc.ngayTai}</td>
                                    <td className="p-2.5 text-slate-600 truncate">{doc.nguoiTai}</td>
                                    <td className="p-2.5 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setPreviewDoc(doc)}
                                          title="Xem trước tài liệu"
                                          className="p-1 hover:bg-blue-50 text-[#004ac6] rounded-md transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-base">visibility</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteDaiDienDoc(doc.id)}
                                          title="Xóa tài liệu"
                                          className="p-1 hover:bg-red-50 text-red-600 rounded-md transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TRƯỜNG HỢP: TỔ CHỨC ─── */}
            {loaiNguoiNop === 'to-chuc' && (
              <div className="space-y-6 pt-1">
                {/* Thông tin tổ chức */}
                <div className="space-y-3.5">
                  <h3 className="text-[13px] font-bold text-slate-800 font-label-technical">
                    Thông tin tổ chức
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Hàng 1: Tên tổ chức, Mã số thuế, Tên viết tắt */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Tên tổ chức <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tcTen}
                        onChange={(e) => {
                          setTcTen(e.target.value);
                          if (errors.tcTen) setErrors((prev) => ({ ...prev, tcTen: '' }));
                        }}
                        placeholder="Tên đầy đủ theo ĐKKD hoặc QĐ thành lập"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.tcTen ? 'border-red-500' : 'border-slate-200'
                          }`}
                      />
                      {errors.tcTen && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.tcTen}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[12px] font-semibold text-slate-700">
                          Mã số thuế / Mã định danh
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setTcMst('0100109106');
                            handleSearchMstToChuc('0100109106');
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          title="Điền nhanh MST mẫu có sẵn trong CSDL Doanh nghiệp"
                        >
                          MST mẫu
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tcMst}
                          onChange={(e) => {
                            setTcMst(e.target.value);
                            if (errors.tcMst) setErrors((prev) => ({ ...prev, tcMst: '' }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchMstToChuc();
                            }
                          }}
                          placeholder="MST / Số ĐKKD (VD: 0100109106)"
                          className={`flex-1 p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.tcMst ? 'border-red-500' : 'border-slate-200'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchMstToChuc()}
                          title="Tra cứu CSDL Đăng ký doanh nghiệp (Nhấn Enter hoặc bấm Tra cứu)"
                          className="px-3 py-2.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">search</span>
                          <span>Tra cứu</span>
                        </button>
                      </div>
                      {errors.tcMst && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.tcMst}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Tên viết tắt
                      </label>
                      <input
                        type="text"
                        value={tcTenVietTat}
                        onChange={(e) => setTcTenVietTat(e.target.value)}
                        placeholder="VD: VINACONEX, EVN..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* Hàng 2: Loại hình, Số điện thoại, Email */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Loại hình tổ chức
                      </label>
                      <select
                        value={tcLoaiHinh}
                        onChange={(e) => setTcLoaiHinh(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                      >
                        <option value="Công ty TNHH">Công ty TNHH</option>
                        <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                        <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                        <option value="Cơ quan nhà nước / Đơn vị sự nghiệp">Cơ quan nhà nước / Đơn vị sự nghiệp</option>
                        <option value="Hợp tác xã">Hợp tác xã</option>
                        <option value="Tổ chức xã hội">Tổ chức xã hội</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Số điện thoại tổ chức
                      </label>
                      <input
                        type="text"
                        value={tcSdt}
                        onChange={(e) => setTcSdt(e.target.value)}
                        placeholder="Số hotline / Fax"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Email tổ chức
                      </label>
                      <input
                        type="email"
                        value={tcEmail}
                        onChange={(e) => setTcEmail(e.target.value)}
                        placeholder="contact@company.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* Hàng 3: Cùng 1 hàng: Tỉnh/Thành phố, Phường/Xã và Địa chỉ trụ sở chi tiết */}
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Tỉnh / Thành phố
                      </label>
                      <select
                        value={tcTinhThanh}
                        onChange={(e) => {
                          const newTinh = e.target.value;
                          setTcTinhThanh(newTinh);
                          const wards = PROVINCES_AND_WARDS[newTinh];
                          if (wards && wards.length > 0) {
                            setTcPhuongXa(wards[0]);
                            setIsCustomTcPhuongXa(false);
                          } else {
                            setTcPhuongXa('');
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                      >
                        {VIETNAMESE_PROVINCES.map((tinh) => (
                          <option key={tinh} value={tinh}>
                            {tinh}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[12px] font-semibold text-slate-700">
                          Phường / Xã
                        </label>
                      </div>
                      {isCustomTcPhuongXa || !PROVINCES_AND_WARDS[tcTinhThanh] ? (
                        <input
                          type="text"
                          value={tcPhuongXa}
                          onChange={(e) => setTcPhuongXa(e.target.value)}
                          placeholder="Phường/Xã trụ sở"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      ) : (
                        <select
                          value={tcPhuongXa}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomTcPhuongXa(true);
                              setTcPhuongXa('');
                            } else {
                              setTcPhuongXa(e.target.value);
                            }
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                        >
                          <option value="">-- Chọn Phường / Xã --</option>
                          {(PROVINCES_AND_WARDS[tcTinhThanh] || []).map((px) => (
                            <option key={px} value={px}>
                              {px}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Địa chỉ trụ sở chi tiết
                      </label>
                      <input
                        type="text"
                        value={tcDiaChiChiTiet}
                        onChange={(e) => setTcDiaChiChiTiet(e.target.value)}
                        placeholder="Số nhà, đường phố, tòa nhà..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Người đại diện */}
                <div className="space-y-3.5 pt-2">
                  <h3 className="text-[13px] font-bold text-slate-800 font-label-technical">
                    Người đại diện tổ chức
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Họ và tên người đại diện <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tcDdHoTen}
                        onChange={(e) => {
                          setTcDdHoTen(e.target.value);
                          if (errors.tcDdHoTen) setErrors((prev) => ({ ...prev, tcDdHoTen: '' }));
                        }}
                        placeholder="Họ tên người đại diện theo pháp luật"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.tcDdHoTen ? 'border-red-500' : 'border-slate-200'
                          }`}
                      />
                      {errors.tcDdHoTen && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.tcDdHoTen}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Chức vụ
                      </label>
                      <input
                        type="text"
                        value={tcDdChucVu}
                        onChange={(e) => setTcDdChucVu(e.target.value)}
                        placeholder="Giám đốc / Tổng Giám đốc..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        CCCD / Số định danh
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tcDdCccd}
                          onChange={(e) => setTcDdCccd(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchCccdDaiDienToChuc();
                            }
                          }}
                          placeholder="12 chữ số"
                          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchCccdDaiDienToChuc()}
                          title="Tra cứu CSDL Dân cư Quốc gia (Nhấn Enter hoặc bấm Tra cứu)"
                          className="px-3 py-2.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">search</span>
                          <span>Tra cứu</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={tcDdSdt}
                        onChange={(e) => setTcDdSdt(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={tcDdEmail}
                        onChange={(e) => setTcDdEmail(e.target.value)}
                        placeholder="email@company.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                </div>
                {/* Có người ủy quyền không? */}
                <div className="space-y-4 pt-2">
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${cnTuCach === 'nguoi-dai-dien'
                      ? 'border-[#004ac6] bg-blue-50/40 shadow-xs ring-1 ring-[#004ac6]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <input
                      type="checkbox"
                      id="checkbox-co-nguoi-uy-quyen"
                      checked={cnTuCach === 'nguoi-dai-dien'}
                      onChange={(e) => setCnTuCach(e.target.checked ? 'nguoi-dai-dien' : 'nguoi-dung-don')}
                      className="mt-0.5 w-4.5 h-4.5 text-[#004ac6] rounded border-slate-300 focus:ring-[#004ac6] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-slate-900 flex items-center gap-2">
                        <span>Có người ủy quyền không?</span>
                        {cnTuCach === 'nguoi-dai-dien' && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-100 text-[#004ac6] rounded-full">
                            Có người ủy quyền / đại diện
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5">
                        Tích chọn nếu người trực tiếp nộp đơn hoặc làm việc với cơ quan là người được ủy quyền hoặc người đại diện hợp pháp
                      </div>
                    </div>
                  </label>

                  {/* ─── KHU VỰC: THÔNG TIN NGƯỜI ĐẠI DIỆN ─── */}
                  {cnTuCach === 'nguoi-dai-dien' && (
                    <div className="space-y-4 pt-1 animate-in fade-in duration-200">

                      {/* CARD 1: THÔNG TIN NGƯỜI ĐẠI DIỆN */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-xs">
                              1
                            </span>
                            <div>
                              <h4 className="text-[13px] font-bold text-slate-800">
                                Thông tin người đại diện / Người được ủy quyền
                              </h4>
                              <p className="text-[11.5px] text-slate-500">
                                Thông tin cá nhân thực hiện nộp hồ sơ hoặc làm việc với cơ quan
                              </p>
                            </div>
                          </div>
                          {isViewModeDaiDien && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">
                              <span className="material-symbols-outlined text-xs">lock</span>
                              Chế độ xem
                            </span>
                          )}
                        </div>

                        {/* Tra cứu CCCD quick-bar (chỉ hiện khi ở Edit mode) */}
                        {/* {!isViewModeDaiDien && (
                        <div className="p-3 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#004ac6] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base">search</span>
                              Tra cứu tự động theo CCCD từ CSDL Quốc gia
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Tự động điền dữ liệu đã xác thực, có thể chỉnh sửa thủ công
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-medium text-slate-600">Gợi ý mẫu tra cứu:</span>
                            <button
                              type="button"
                              onClick={() => handleSearchCccdDaiDien('001092015882')}
                              className="px-2.5 py-1 bg-white hover:bg-blue-100/60 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                              001092015882 (Trần Đức Minh)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSearchCccdDaiDien('001193004521')}
                              className="px-2.5 py-1 bg-white hover:bg-blue-100/60 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                              001193004521 (Lê Thị Thu Hà - LS)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSearchCccdDaiDien('079190008899')}
                              className="px-2.5 py-1 bg-white hover:bg-blue-100/60 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                              079190008899 (Phạm Quốc Bảo)
                            </button>
                          </div>
                        </div>
                      )} */}

                        {/* Layout 3 cột trên desktop */}
                        {isViewModeDaiDien ? (
                          /* Read-only layout in View Mode */
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Họ và tên người đại diện</div>
                              <div className="text-sm font-bold text-slate-900">{cnUqHoTen || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Số CCCD / Định danh</div>
                              <div className="text-sm font-bold font-mono text-slate-900">{cnUqCccd || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Ngày sinh &amp; Giới tính</div>
                              <div className="text-sm font-semibold text-slate-900">
                                {cnUqNgaySinh || '---'} • {cnUqGioiTinh}
                              </div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Số điện thoại</div>
                              <div className="text-sm font-semibold text-slate-900">{cnUqSdt || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Email liên hệ</div>
                              <div className="text-sm font-semibold text-slate-900">{cnUqEmail || '---'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="text-[11px] font-semibold text-slate-500">Địa chỉ liên hệ</div>
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {[cnUqDiaChiChiTiet, cnUqPhuongXa, cnUqTinhThanh].filter(Boolean).join(', ') || '---'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Editable form in Edit Mode */
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Hàng 1: Họ tên, Ngày sinh, Giới tính */}
                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Họ và tên người đại diện <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={cnUqHoTen}
                                onChange={(e) => {
                                  setCnUqHoTen(e.target.value);
                                  if (errors.cnUqHoTen) setErrors((prev) => ({ ...prev, cnUqHoTen: '' }));
                                }}
                                placeholder="Nhập họ và tên đầy đủ"
                                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.cnUqHoTen ? 'border-red-500' : 'border-slate-200'
                                  }`}
                              />
                              {errors.cnUqHoTen && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.cnUqHoTen}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Ngày sinh
                              </label>
                              <input
                                type="date"
                                value={cnUqNgaySinh}
                                onChange={(e) => setCnUqNgaySinh(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Giới tính
                              </label>
                              <select
                                value={cnUqGioiTinh}
                                onChange={(e) => setCnUqGioiTinh(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                              >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                              </select>
                            </div>

                            {/* Hàng 2: Số CCCD + Nút tra cứu, Số điện thoại, Email */}
                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Số CCCD / Định danh <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={cnUqCccd}
                                  onChange={(e) => {
                                    setCnUqCccd(e.target.value);
                                    if (errors.cnUqCccd) setErrors((prev) => ({ ...prev, cnUqCccd: '' }));
                                  }}
                                  placeholder="12 chữ số CCCD"
                                  className={`flex-1 p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.cnUqCccd ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSearchCccdDaiDien()}
                                  title="Tra cứu trong CSDL Dân cư"
                                  className="px-3 py-2.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">search</span>
                                  <span>Tra cứu</span>
                                </button>
                              </div>
                              {errors.cnUqCccd && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.cnUqCccd}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Số điện thoại
                              </label>
                              <input
                                type="text"
                                value={cnUqSdt}
                                onChange={(e) => setCnUqSdt(e.target.value)}
                                placeholder="09xx xxx xxx"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Email liên hệ
                              </label>
                              <input
                                type="email"
                                value={cnUqEmail}
                                onChange={(e) => setCnUqEmail(e.target.value)}
                                placeholder="dai-dien@example.com"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>

                            {/* Hàng 3: Tỉnh/Thành phố, Phường/Xã, Địa chỉ chi tiết */}
                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Tỉnh / Thành phố
                              </label>
                              <select
                                value={cnUqTinhThanh}
                                onChange={(e) => {
                                  const newTinh = e.target.value;
                                  setCnUqTinhThanh(newTinh);
                                  const wards = PROVINCES_AND_WARDS[newTinh];
                                  if (wards && wards.length > 0) {
                                    setCnUqPhuongXa(wards[0]);
                                    setIsCustomUqPhuongXa(false);
                                  } else {
                                    setCnUqPhuongXa('');
                                  }
                                }}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                              >
                                {VIETNAMESE_PROVINCES.map((tinh) => (
                                  <option key={tinh} value={tinh}>
                                    {tinh}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[12px] font-semibold text-slate-700">
                                  Phường / Xã
                                </label>
                              </div>
                              {isCustomUqPhuongXa || !PROVINCES_AND_WARDS[cnUqTinhThanh] ? (
                                <input
                                  type="text"
                                  value={cnUqPhuongXa}
                                  onChange={(e) => setCnUqPhuongXa(e.target.value)}
                                  placeholder="Phường/Xã/Thị trấn"
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                              ) : (
                                <select
                                  value={cnUqPhuongXa}
                                  onChange={(e) => {
                                    if (e.target.value === '__custom__') {
                                      setIsCustomUqPhuongXa(true);
                                      setCnUqPhuongXa('');
                                    } else {
                                      setCnUqPhuongXa(e.target.value);
                                    }
                                  }}
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                >
                                  <option value="">-- Chọn Phường / Xã --</option>
                                  {(PROVINCES_AND_WARDS[cnUqTinhThanh] || []).map((px) => (
                                    <option key={px} value={px}>
                                      {px}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <div>
                              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                                Địa chỉ chi tiết
                              </label>
                              <input
                                type="text"
                                value={cnUqDiaChiChiTiet}
                                onChange={(e) => setCnUqDiaChiChiTiet(e.target.value)}
                                placeholder="Số nhà, đường phố, ngõ ngách..."
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CARD 2: CĂN CỨ ĐẠI DIỆN & PHẠM VI ỦY QUYỀN */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-xs">
                            2
                          </span>
                          <div>
                            <h4 className="text-[13px] font-bold text-slate-800">
                              Căn cứ đại diện &amp; Phạm vi ủy quyền
                            </h4>
                            <p className="text-[11.5px] text-slate-500">
                              Xác định hình thức đại diện, số hiệu văn bản pháp lý và quyền hạn được giao
                            </p>
                          </div>
                        </div>

                        {/* Cảnh báo hết hạn hiệu lực */}
                        {cnUqNgayHetHieuLuc && cnUqNgayHetHieuLuc < todayStr && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-semibold animate-in fade-in">
                            <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                            <span>
                              Văn bản ủy quyền đã hết hiệu lực (hết hạn ngày {cnUqNgayHetHieuLuc}). Vui lòng kiểm tra lại văn bản gia hạn hoặc bổ sung giấy tờ hợp lệ.
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Hàng 1: Loại đại diện, Số văn bản, Ngày lập */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Loại đại diện <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={cnUqLoaiDaiDien}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqLoaiDaiDien(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer disabled:bg-slate-100"
                            >
                              <option value="Người được ủy quyền">Người được ủy quyền</option>
                              <option value="Người đại diện theo pháp luật">Người đại diện theo pháp luật</option>
                              <option value="Cha / Mẹ đại diện cho con chưa thành niên">
                                Cha / Mẹ đại diện cho con chưa thành niên
                              </option>
                              <option value="Người giám hộ">Người giám hộ</option>
                              <option value="Khác">Khác</option>
                            </select>
                          </div>

                          {/* Số văn bản / Giấy UQ */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Số văn bản / Giấy UQ
                            </label>
                            <input
                              type="text"
                              value={cnUqSoVanBan}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqSoVanBan(e.target.value)}
                              placeholder="VD: 08/2026/UQ-ND"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          {/* Ngày lập văn bản */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Ngày lập văn bản
                            </label>
                            <input
                              type="date"
                              value={cnUqNgayLap}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqNgayLap(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          {/* Hàng 2: Hiệu lực từ ngày, Đến ngày, Phạm vi đại diện */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Hiệu lực từ ngày
                            </label>
                            <input
                              type="date"
                              value={cnUqNgayHieuLuc}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqNgayHieuLuc(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Đến ngày
                            </label>
                            <input
                              type="date"
                              value={cnUqNgayHetHieuLuc}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqNgayHetHieuLuc(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                            />
                          </div>

                          {/* Phạm vi đại diện / Quyền hạn được ủy quyền (dạng combobox) */}
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                              Phạm vi đại diện / Quyền hạn được ủy quyền
                            </label>
                            <select
                              value={cnUqPhamVi}
                              disabled={isViewModeDaiDien}
                              onChange={(e) => setCnUqPhamVi(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer disabled:bg-slate-100"
                            >
                              <option value="Toàn quyền đại diện">Toàn quyền đại diện</option>
                              <option value="Nộp đơn, bổ sung tài liệu và làm việc với cơ quan">
                                Nộp đơn, bổ sung tài liệu và làm việc với cơ quan
                              </option>
                              <option value="Nộp đơn và rút đơn">Nộp đơn và rút đơn</option>
                              <option value="Chỉ nộp đơn hồ sơ">Chỉ nộp đơn hồ sơ</option>
                              <option value="Bổ sung tài liệu & làm việc với cơ quan">
                                Bổ sung tài liệu &amp; làm việc với cơ quan
                              </option>
                              <option value="Khác">Khác (nhập chi tiết)</option>
                            </select>
                            {cnUqPhamVi === 'Khác' && (
                              <input
                                type="text"
                                value={cnUqPhamViKhac}
                                disabled={isViewModeDaiDien}
                                onChange={(e) => setCnUqPhamViKhac(e.target.value)}
                                placeholder="Ghi chú nội dung phạm vi cụ thể khác..."
                                className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-100"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: TÀI LIỆU CHỨNG MINH TƯ CÁCH ĐẠI DIỆN */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-100 text-[#004ac6] flex items-center justify-center font-bold text-xs">
                              3
                            </span>
                            <div>
                              <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                                <span>Tài liệu chứng minh tư cách đại diện</span>
                                <span className="text-red-500">*</span>
                              </h4>
                              <p className="text-[11.5px] text-slate-500">
                                Hồ sơ văn bản pháp lý (Giấy ủy quyền, Quyết định cử đại diện, Giấy tờ giám hộ...)
                              </p>
                            </div>
                          </div>

                          {/* Actions: Upload file + Quét máy scan */}
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              id="file-dai-dien-upload"
                              className="hidden"
                              multiple
                              accept=".pdf,.docx,.doc,.jpg,.png"
                              onChange={(e) => handleUploadDaiDienDoc(e.target.files)}
                            />
                            <label
                              htmlFor="file-dai-dien-upload"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm text-[#004ac6]">upload_file</span>
                              <span>Tải file lên</span>
                            </label>

                            <button
                              type="button"
                              onClick={handleScanDaiDien}
                              disabled={isScanningDaiDien}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span className={`material-symbols-outlined text-sm ${isScanningDaiDien ? 'animate-spin' : ''}`}>
                                scanner
                              </span>
                              <span>{isScanningDaiDien ? 'Đang quét...' : 'Quét tài liệu'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Scanner Feedback Simulation */}
                        {isScanningDaiDien && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-[#004ac6] text-xs font-medium animate-pulse">
                            <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
                            <span>Đang kết nối máy quét chuyên dụng và số hóa văn bản ủy quyền (OCR định dạng PDF/A)...</span>
                          </div>
                        )}

                        {/* Cảnh báo khi chưa có tài liệu chứng minh */}
                        {cnUqTaiLieuList.length === 0 && (
                          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs font-semibold animate-in fade-in">
                            <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
                            <span>
                              Chưa có tài liệu chứng minh tư cách đại diện. Vui lòng tải lên văn bản hoặc bấm "Quét tài liệu" từ máy scan để bảo đảm tính hợp lệ.
                            </span>
                          </div>
                        )}

                        {/* Bảng danh sách tài liệu chứng minh */}
                        {cnUqTaiLieuList.length > 0 && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="p-2.5 w-10 text-center">STT</th>
                                  <th className="p-2.5">Tên tệp văn bản</th>
                                  <th className="p-2.5 w-52">Loại tài liệu</th>
                                  <th className="p-2.5 w-24">Dung lượng</th>
                                  <th className="p-2.5 w-28">Ngày tải</th>
                                  <th className="p-2.5 w-36">Người tải</th>
                                  <th className="p-2.5 w-20 text-center">Thao tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {cnUqTaiLieuList.map((doc, idx) => (
                                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="p-2.5 text-center font-medium text-slate-500">{idx + 1}</td>
                                    <td className="p-2.5 font-medium text-slate-900">
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-base">picture_as_pdf</span>
                                        <span className="truncate max-w-[220px]" title={doc.name}>{doc.name}</span>
                                      </div>
                                    </td>
                                    <td className="p-2.5">
                                      <select
                                        value={doc.loai}
                                        onChange={(e) =>
                                          handleUpdateDocLoai(
                                            doc.id,
                                            e.target.value as TaiLieuChungMinhItem['loai']
                                          )
                                        }
                                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-200 cursor-pointer"
                                      >
                                        <option value="Giấy ủy quyền">Giấy ủy quyền</option>
                                        <option value="Văn bản cử đại diện">Văn bản cử đại diện</option>
                                        <option value="Giấy tờ chứng minh giám hộ">Giấy tờ chứng minh giám hộ</option>
                                        <option value="Giấy khai sinh">Giấy khai sinh</option>
                                        <option value="Tài liệu khác">Tài liệu khác</option>
                                      </select>
                                    </td>
                                    <td className="p-2.5 text-slate-500 font-mono text-[11px]">{doc.size}</td>
                                    <td className="p-2.5 text-slate-600 text-[11px]">{doc.ngayTai}</td>
                                    <td className="p-2.5 text-slate-600 truncate">{doc.nguoiTai}</td>
                                    <td className="p-2.5 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setPreviewDoc(doc)}
                                          title="Xem trước tài liệu"
                                          className="p-1 hover:bg-blue-50 text-[#004ac6] rounded-md transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-base">visibility</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteDaiDienDoc(doc.id)}
                                          title="Xóa tài liệu"
                                          className="p-1 hover:bg-red-50 text-red-600 rounded-md transition-colors cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ─── TRƯỜNG HỢP: KHÔNG RÕ ─── */}
            {/* {loaiNguoiNop === 'khong-ro' && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-[13px]">
                <span className="material-symbols-outlined text-[20px] text-amber-600">info</span>
                <span>Chế độ: Chưa xác định thông tin người nộp</span>
              </div>
              <p className="text-[12.5px] text-amber-900/90 leading-relaxed">
                Cho phép cán bộ tạo lượt/đơn tiếp nhận mà chưa xác định được thông tin người nộp (đơn gửi nặc danh, đơn thư qua bưu điện chưa đủ thông tin nhân thân).
                <br />
                <strong>Không bắt buộc</strong> nhập thông tin cá nhân hoặc tổ chức. Cán bộ có thể ghi nhận thông tin bổ sung tại ô <em>“Ghi chú”</em> bên dưới.
              </p>
            </div>
          )} */}
          </section>
        )}

        {/* ─── SECTION 2B: NỘI DUNG SỰ VIỆC & DIỄN BIẾN HÀNH VI TỐ GIÁC (CHUYÊN BIỆT TIN BÁO TỐ GIÁC) - Tạm ẩn theo yêu cầu ─── */}
        {/* {(loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham') && (
          <section className="space-y-4 bg-rose-50/30 border border-rose-200/70 p-5 rounded-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-rose-200/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                  02B
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight flex items-center gap-2">
                    <span>Nội dung sự việc &amp; Diễn biến hành vi bị tố giác</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      Nghiệp vụ Tiếp nhận Tin báo - Tố giác
                    </span>
                  </h2>
                  <p className="text-[11.5px] text-slate-500">
                    Ghi nhận sơ bộ diễn biến ban đầu để làm căn cứ phân tích AI và thụ lý theo Điều 145, 146 BLTTHS 2015
                  </p>
                </div>
              </div>
              <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Theo biểu mẫu Mẫu 01-BCA
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Thời gian xảy ra sự việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={thoiGianSuViec}
                  onChange={(e) => setThoiGianSuViec(e.target.value)}
                  placeholder="Ví dụ: Khoảng 14h30 ngày 15/03/2026 hoặc Từ tháng 01/2025 đến nay"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Địa điểm xảy ra sự việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={diaDiemSuViec}
                  onChange={(e) => setDiaDiemSuViec(e.target.value)}
                  placeholder="Ví dụ: Số 18 Duy Tân, Cầu Giấy, TP. Hà Nội"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Người hoặc tổ chức bị tố giác / Đối tượng liên quan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={doiTuongBiToGiac}
                  onChange={(e) => setDoiTuongBiToGiac(e.target.value)}
                  placeholder="Họ tên, chức vụ, cơ quan công tác, đặc điểm nhận dạng hoặc tên tổ chức bị tố giác..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Diễn biến hành vi được trình báo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={dienBienSuViec}
                  onChange={(e) => setDienBienSuViec(e.target.value)}
                  rows={3}
                  placeholder="Mô tả cụ thể hành vi, phương thức, thủ đoạn, công cụ phương tiện thực hiện..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200 leading-relaxed"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Hậu quả, thiệt hại được phản ánh (Vật chất, sức khỏe, tính mạng, trật tự xã hội)
                </label>
                <input
                  type="text"
                  value={hauQuaThietHai}
                  onChange={(e) => setHauQuaThietHai(e.target.value)}
                  placeholder="Ví dụ: Thiệt hại tài sản khoảng 2.8 tỷ đồng / Tổn hại sức khỏe..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-rose-200 rounded-xl flex flex-wrap items-center gap-4 text-xs">
              <span className="font-bold text-rose-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-[17px] text-rose-600">emergency</span>
                Dấu hiệu cần xem xét khẩn cấp:
              </span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-600 rounded border-slate-300" />
                <span>Có dấu hiệu đối tượng đang tẩu tán tài sản / Bỏ trốn</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                <input type="checkbox" className="w-4 h-4 text-rose-600 rounded border-slate-300" />
                <span>Có đe dọa vũ lực đối với người tố giác</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-600 rounded border-slate-300" />
                <span>Thời hạn giải quyết ban đầu: 20 ngày (Điều 147 BLTTHS)</span>
              </label>
            </div>
          </section>
        )} */}

        {/* ─── SECTION 2C: LIÊN KẾT HỒ SƠ / VỤ VIỆC (CHUYÊN BIỆT TÀI LIỆU BỔ SUNG) ─── */}
        {loaiNghiepVu === 'tai_lieu_bo_sung' && (
          <section className="space-y-4 bg-blue-50/40 border border-blue-200/80 p-5 rounded-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  02C
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight flex items-center gap-2">
                    <span>Hồ sơ / Vụ việc cần bổ sung tài liệu</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#004ac6] border border-blue-200">
                      Gắn tài liệu vào vụ việc đang thụ lý
                    </span>
                  </h2>
                  <p className="text-[11.5px] text-slate-500">
                    Không tạo vụ việc độc lập mới, tài liệu sẽ được lưu trữ vào cây văn bản của hồ sơ gốc
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Chọn hồ sơ / Vụ việc gốc đang thụ lý <span className="text-red-500">*</span>
                </label>
                <select
                  value={hoSoLienKetId}
                  onChange={(e) => setHoSoLienKetId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium cursor-pointer"
                >
                  <option value="Đ-2025-0105">Đ-2025-0105 | Đơn khiếu nại thu hồi đất DA Hòa Lạc (Đang xác minh - CB thụ lý: Nguyễn Văn B)</option>
                  <option value="Đ-2026-03-0089">Đ-2026-03-0089 | Đơn kiến nghị giải tỏa mặt bằng đường Vành đai 4 (Đang thụ lý - Cán bộ: Lê Ngọc Mai)</option>
                  <option value="LN-2026-03-0001">LN-2026-03-0001 | Đơn kiến nghị bồi thường GPMB đường gom (Chờ phê duyệt)</option>
                  <option value="HS-2026-02-0045">HS-2026-02-0045 | Tố cáo sai phạm trật tự xây dựng tại cụm công nghiệp (Đang giải quyết)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Hình thức bổ sung
                </label>
                <select className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
                  <option value="tu-nguyen">Công dân tự nguyện bổ sung</option>
                  <option value="yeu-cau">Theo yêu cầu của Cơ quan thụ lý</option>
                  <option value="giam-dinh">Bổ sung kết quả giám định / xác minh</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="material-symbols-outlined text-blue-600">folder_open</span>
                <span>Hồ sơ liên kết: <strong className="text-slate-900">{hoSoLienKetId}</strong> — Cán bộ thụ lý sẽ nhận được thông báo biến động tài liệu ngay sau khi lưu.</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Đã đồng bộ quy trình
              </span>
            </div>
          </section>
        )}

        {/* ─── SECTION 2D: GIAO DIỆN NGHIỆP VỤ CHUYÊN BIỆT TIẾP NHẬN NGƯỜI TỰ THÚ, ĐẦU THÚ (MỤC 12.3 & 12.4) ─── */}
        {(loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu') && (
          <section className="space-y-6 bg-slate-50/70 border border-indigo-200/90 p-5 sm:p-6 rounded-2xl animate-in fade-in">
            {/* Header Section 2D */}
            <div className="flex items-center justify-between border-b border-indigo-200 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs text-white ${loaiNghiepVu === 'nguoi_tu_thu' ? 'bg-indigo-700' : 'bg-amber-600'
                  }`}>
                  02
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 font-headline-md tracking-tight flex items-center gap-2">
                    <span>
                      Giao diện nghiệp vụ chuyên biệt: Tiếp nhận người {loaiNghiepVu === 'nguoi_tu_thu' ? 'tự thú' : 'đầu thú'}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${loaiNghiepVu === 'nguoi_tu_thu' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}>
                      Điều 4, 145, 146 BLTTHS 2015
                    </span>
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    Phân định rõ lời khai do người trình bày, chứng cứ giao nộp, tình trạng xác minh danh tính và tình huống khẩn cấp
                  </p>
                </div>
              </div>
              <span className="text-xs text-indigo-900 font-bold bg-indigo-100/90 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-indigo-700">verified</span>
                Theo Mẫu Biên bản 02-BCA Bộ Công an
              </span>
            </div>

            {/* ════ NHÓM A: THÔNG TIN NGƯỜI TỰ THÚ / ĐẦU THÚ (MỤC 12.3.A) ════ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    A
                  </span>
                  <h3 className="text-[13.5px] font-bold text-slate-900">
                    A. Thông tin người {loaiNghiepVu === 'nguoi_tu_thu' ? 'tự thú' : 'đầu thú'}
                  </h3>
                </div>
                <span className="text-[11.5px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
                  Cho phép ghi nhận khi chưa có đầy đủ giấy tờ định danh (không ép buộc / không suy đoán)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Họ và tên */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Họ và tên người trình diện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cnHoTen}
                    onChange={(e) => setCnHoTen(e.target.value)}
                    placeholder="Họ và tên theo lời khai"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
                  />
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Ngày tháng năm sinh
                  </label>
                  <input
                    type="date"
                    value={cnNgaySinh}
                    onChange={(e) => setCnNgaySinh(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={cnGioiTinh}
                    onChange={(e) => setCnGioiTinh(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác / Chưa xác định</option>
                  </select>
                </div>

                {/* Quốc tịch */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Quốc tịch
                  </label>
                  <input
                    type="text"
                    value={ttQuocTich}
                    onChange={(e) => setTtQuocTich(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Số định danh CCCD / Hộ chiếu */}
                <div className="lg:col-span-2">
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Số giấy tờ định danh (CCCD / Hộ chiếu nếu có)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={cnCccd}
                      onChange={(e) => setCnCccd(e.target.value)}
                      placeholder="Nhập 12 chữ số CCCD (để trống nếu người đến trình diện chưa mang theo)"
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={handleScanCccd}
                      className="px-3 py-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      title="Quét CCCD nếu đương sự có mang theo giấy tờ"
                    >
                      <span className="material-symbols-outlined text-base">nfc</span>
                      <span>Quét CCCD</span>
                    </button>
                  </div>
                </div>

                {/* Số điện thoại liên hệ */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Số điện thoại liên hệ (nếu có)
                  </label>
                  <input
                    type="text"
                    value={cnSdt}
                    onChange={(e) => setCnSdt(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Tình trạng xác minh danh tính */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Tình trạng xác minh danh tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ttTrieuChungXacMinh}
                    onChange={(e) => setTtTrieuChungXacMinh(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    <option value="Chưa xác minh">Chưa xác minh (Chưa đối soát C06)</option>
                    <option value="Đã đối soát C06">Đã đối soát CSDL Dân cư C06 (Khớp 100%)</option>
                    <option value="Cần thu thập dấu vết vân tay / Giám định">Cần thu thập dấu vết vân tay / Giám định</option>
                    <option value="Cần xác minh qua Công an địa phương">Cần xác minh qua Công an địa phương</option>
                  </select>
                </div>

                {/* Địa chỉ thường trú */}
                <div className="lg:col-span-2">
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Nơi thường trú theo lời khai hoặc hộ khẩu
                  </label>
                  <input
                    type="text"
                    value={cnDiaChiChiTiet}
                    onChange={(e) => setCnDiaChiChiTiet(e.target.value)}
                    placeholder="Ví dụ: Thôn 3, xã Tân Triều, huyện Thanh Trì, TP. Hà Nội"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Nơi ở hiện tại */}
                <div className="lg:col-span-2">
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Nơi ở hiện tại (Nơi cư trú trước khi đến trình diện)
                  </label>
                  <input
                    type="text"
                    value={ttNoiOHienTai}
                    onChange={(e) => setTtNoiOHienTai(e.target.value)}
                    placeholder="Ví dụ: Số 12 ngách 82/15 Kim Mã, Ba Đình, Hà Nội"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Đặc điểm nhận dạng khác */}
                <div className="lg:col-span-4">
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Thông tin nhận dạng khác theo quy định (Vết sẹo, nốt ruồi, hình xăm, dị tật, chiều cao...)
                  </label>
                  <input
                    type="text"
                    value={ttNhanDang}
                    onChange={(e) => setTtNhanDang(e.target.value)}
                    placeholder="Mô tả chi tiết đặc điểm nhận dạng thực tế của người trình diện tại thời điểm tiếp nhận..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* ════ NHÓM B: THÔNG TIN TIẾP NHẬN & PHÂN BIỆT TỰ THÚ / ĐẦU THÚ (MỤC 12.3.B & 12.4) ════ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    B
                  </span>
                  <h3 className="text-[13.5px] font-bold text-slate-900">
                    B. Phân định trường hợp trình diện &amp; Người đưa đến (Mục 12.4)
                  </h3>
                </div>
                <span className="text-[11.5px] font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Cán bộ có thẩm quyền xác nhận phân loại theo quy định
                </span>
              </div>

              {/* 4 lựa chọn Phân định Trường hợp trình diện (Mục 12.4) */}
              <div className="space-y-2">
                <label className="block text-[12px] font-semibold text-slate-700">
                  Trường hợp trình diện ban đầu:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className={`p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all ${truongHopTrinhDien === 'tu_thu' ? 'border-indigo-700 bg-indigo-50/70 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}>
                    <input
                      type="radio"
                      name="truongHopTrinhDien"
                      value="tu_thu"
                      checked={truongHopTrinhDien === 'tu_thu'}
                      onChange={() => {
                        setTruongHopTrinhDien('tu_thu');
                        setLoaiNghiepVu('nguoi_tu_thu');
                        setLyDoPhanLoai('Người phạm tội tự nguyện khai báo với cơ quan có thẩm quyền trước khi hành vi phạm tội bị phát hiện.');
                      }}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <strong className="text-slate-900 text-xs block">1. Tự thú</strong>
                      <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                        Tự nguyện khai báo trước khi hành vi bị phát hiện
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all ${truongHopTrinhDien === 'dau_thu' ? 'border-amber-600 bg-amber-50/70 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}>
                    <input
                      type="radio"
                      name="truongHopTrinhDien"
                      value="dau_thu"
                      checked={truongHopTrinhDien === 'dau_thu'}
                      onChange={() => {
                        setTruongHopTrinhDien('dau_thu');
                        setLoaiNghiepVu('nguoi_dau_thu');
                        setLyDoPhanLoai('Người phạm tội đến trình diện sau khi hành vi phạm tội đã bị phát hiện hoặc đang bị truy nã.');
                      }}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <strong className="text-slate-900 text-xs block">2. Đầu thú</strong>
                      <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                        Trình diện sau khi hành vi bị phát hiện / truy nã
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all ${truongHopTrinhDien === 'chua_xac_dinh' ? 'border-slate-700 bg-slate-100 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}>
                    <input
                      type="radio"
                      name="truongHopTrinhDien"
                      value="chua_xac_dinh"
                      checked={truongHopTrinhDien === 'chua_xac_dinh'}
                      onChange={() => {
                        setTruongHopTrinhDien('chua_xac_dinh');
                        setLyDoPhanLoai('Chưa đủ thông tin đối chiếu với hồ sơ vụ án để xác định đã bị phát hiện hay chưa.');
                      }}
                      className="mt-0.5 text-slate-700 focus:ring-slate-500"
                    />
                    <div>
                      <strong className="text-slate-900 text-xs block">3. Chưa đủ thông tin</strong>
                      <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                        Chưa rõ thời điểm vụ việc bị phát hiện
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all ${truongHopTrinhDien === 'can_can_bo_xac_nhan' ? 'border-blue-600 bg-blue-50/70 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}>
                    <input
                      type="radio"
                      name="truongHopTrinhDien"
                      value="can_can_bo_xac_nhan"
                      checked={truongHopTrinhDien === 'can_can_bo_xac_nhan'}
                      onChange={() => {
                        setTruongHopTrinhDien('can_can_bo_xac_nhan');
                        setLyDoPhanLoai('Cần Lãnh đạo Cơ quan Điều tra / Thủ trưởng kiểm tra tài liệu và phê chuẩn phân loại.');
                      }}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <strong className="text-slate-900 text-xs block">4. Cần CB thẩm quyền xác nhận</strong>
                      <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                        Chờ tra cứu hồ sơ vụ án &amp; QĐ truy nã
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Hộp lưu ý pháp lý theo Mục 12.4 */}
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
                <div>
                  <strong>Quy tắc nghiệp vụ GOVEX (Mục 12.4): </strong>
                  <span>Hệ thống không được tự kết luận một trường hợp là tự thú hoặc đầu thú chỉ dựa trên lời khai ban đầu. Cán bộ có thẩm quyền xác nhận phân loại theo quy định. Nếu phân loại thay đổi, hệ thống lưu lịch sử điều chỉnh (người thực hiện, thời điểm, lý do).</span>
                </div>
              </div>

              {/* Lý do phân loại */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Lý do / Căn cứ bước đầu của Cán bộ phân loại
                </label>
                <textarea
                  value={lyDoPhanLoai}
                  onChange={(e) => setLyDoPhanLoai(e.target.value)}
                  rows={2}
                  placeholder="Ghi rõ căn cứ (ví dụ: qua tra cứu CSDL chưa có quyết định khởi tố hoặc đã có Quyết định truy nã số...)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Checkbox: Có người đưa đến hoặc đi cùng không? */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasNguoiDiCung}
                    onChange={(e) => setHasNguoiDiCung(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Có người đưa đến hoặc người đi cùng (người thân, người áp giải, đại diện cơ quan)
                  </span>
                </label>

                {hasNguoiDiCung && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">Họ tên người đưa đến</label>
                      <input
                        type="text"
                        value={nguoiDiCungHoTen}
                        onChange={(e) => setNguoiDiCungHoTen(e.target.value)}
                        placeholder="Họ tên người đưa đến"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">Mối quan hệ</label>
                      <input
                        type="text"
                        value={nguoiDiCungQuanHe}
                        onChange={(e) => setNguoiDiCungQuanHe(e.target.value)}
                        placeholder="Ví dụ: Bố đẻ, Anh trai, Trưởng thôn..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">Số CCCD</label>
                      <input
                        type="text"
                        value={nguoiDiCungCccd}
                        onChange={(e) => setNguoiDiCungCccd(e.target.value)}
                        placeholder="CCCD người đi cùng"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        value={nguoiDiCungSdt}
                        onChange={(e) => setNguoiDiCungSdt(e.target.value)}
                        placeholder="Số điện thoại"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ════ NHÓM C: THÔNG TIN SỰ VIỆC DO NGƯỜI TRÌNH DIỆN TRÌNH BÀY (MỤC 12.3.C) ════ */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    C
                  </span>
                  <h3 className="text-[13.5px] font-bold text-slate-900">
                    C. Thông tin sự việc do người {loaiNghiepVu === 'nguoi_tu_thu' ? 'tự thú' : 'đầu thú'} trình bày
                  </h3>
                </div>
                <span className="text-[11.5px] text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-medium">
                  Phân biệt rõ: Lời khai ban đầu • Chứng cứ chứng minh • Thông tin đã xác minh
                </span>
              </div>

              <div className="space-y-3.5">
                {/* Lời khai ban đầu */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Nội dung trình bày ban đầu (Khai nhận tự nguyện của người đến trình diện) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={dienBienSuViec}
                    onChange={(e) => setDienBienSuViec(e.target.value)}
                    rows={3}
                    placeholder="Ghi nhận trung thực toàn bộ lời khai ban đầu của người trình diện (diễn biến hành vi, động cơ, thủ đoạn, phương tiện)..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Thời gian xảy ra */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Thời gian xảy ra sự việc được khai báo
                    </label>
                    <input
                      type="text"
                      value={thoiGianSuViec}
                      onChange={(e) => setThoiGianSuViec(e.target.value)}
                      placeholder="Ví dụ: Khoảng 23h30 ngày 08/10/2026"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Địa điểm xảy ra */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Địa điểm xảy ra sự việc được khai báo
                    </label>
                    <input
                      type="text"
                      value={diaDiemSuViec}
                      onChange={(e) => setDiaDiemSuViec(e.target.value)}
                      placeholder="Ví dụ: Kho bãi vật liệu xây dựng Tân Triều, Thanh Trì, Hà Nội"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Người / Tổ chức liên quan */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Người hoặc tổ chức liên quan (Đồng phạm, xúi giục, người bị hại...)
                    </label>
                    <input
                      type="text"
                      value={doiTuongBiToGiac}
                      onChange={(e) => setDoiTuongBiToGiac(e.target.value)}
                      placeholder="Ví dụ: Bị hại: Công ty TNHH Vật liệu xây dựng Hưng Thịnh; Đồng phạm: Nguyễn Văn B (chưa rõ nơi ở)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Thiệt hại hoặc hậu quả */}
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Thiệt hại hoặc hậu quả được trình bày
                    </label>
                    <input
                      type="text"
                      value={hauQuaThietHai}
                      onChange={(e) => setHauQuaThietHai(e.target.value)}
                      placeholder="Ví dụ: Mất trộm tài sản trị giá khoảng 80.000.000 VNĐ / Gây thương tích..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* Tài liệu, đồ vật, tang vật hoặc tiền tự nguyện giao nộp */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Tài liệu, đồ vật, phương tiện hoặc tiền tự nguyện cung cấp / giao nộp (Kèm tình trạng niêm phong)
                  </label>
                  <input
                    type="text"
                    value={doVatGiaoNop}
                    onChange={(e) => setDoVatGiaoNop(e.target.value)}
                    placeholder="Ví dụ: 01 xe máy Wave RSX BKS 29X1-567.89; 15.000.000 VNĐ tiền mặt; 01 kìm cộng lực"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
                  />
                </div>

                {/* Vụ việc / hồ sơ đã tồn tại nếu có */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    Thông tin về vụ việc hoặc hồ sơ đã tồn tại (nếu xác định được)
                  </label>
                  <input
                    type="text"
                    value={hoSoVuViecTonTai}
                    onChange={(e) => setHoSoVuViecTonTai(e.target.value)}
                    placeholder="Ví dụ: Quyết định truy nã số 14/QĐ-CQĐT ngày 20/08/2026 của Cơ quan CSĐT Công an TP. Hà Nội"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* ════ NHÓM D: THÔNG TIN AN TOÀN VÀ TÌNH HUỐNG ƯU TIÊN (MỤC 12.3.D) ════ */}
            <div className="bg-white border border-rose-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                    D
                  </span>
                  <h3 className="text-[13.5px] font-bold text-rose-950 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-rose-600 text-[18px]">emergency</span>
                    D. Thông tin an toàn và tình huống cần ưu tiên xử lý ngay (Mục 12.3.D)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Cán bộ nhận biết để thực hiện biện pháp theo thẩm quyền (Không để AI tự quyết)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Hỗ trợ y tế */}
                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${canHoTroYTe ? 'border-rose-400 bg-rose-50/70 shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}>
                  <input
                    type="checkbox"
                    checked={canHoTroYTe}
                    onChange={(e) => setCanHoTroYTe(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <div>
                    <strong className="text-rose-900 block">1. Cần hỗ trợ y tế khẩn cấp</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5 leading-snug">
                      Người tiếp nhận có dấu hiệu bị thương, suy kiệt, hoảng loạn hoặc say chất kích thích.
                    </span>
                  </div>
                </label>

                {/* 2. Nguy cơ mất an toàn */}
                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${nguyCoMatAnToan ? 'border-amber-400 bg-amber-50/70 shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}>
                  <input
                    type="checkbox"
                    checked={nguyCoMatAnToan}
                    onChange={(e) => setNguyCoMatAnToan(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <div>
                    <strong className="text-amber-950 block">2. Nguy cơ mất an toàn cho người liên quan</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5 leading-snug">
                      Có nguy cơ bị trả thù, đe dọa vũ lực đối với bản thân hoặc gia đình người trình diện.
                    </span>
                  </div>
                </label>

                {/* 3. Người/tài sản cần bảo vệ */}
                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${canBaoVeNguoiTaiSan ? 'border-blue-400 bg-blue-50/70 shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}>
                  <input
                    type="checkbox"
                    checked={canBaoVeNguoiTaiSan}
                    onChange={(e) => setCanBaoVeNguoiTaiSan(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <strong className="text-blue-950 block">3. Có người hoặc tài sản cần bảo vệ khẩn cấp</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5 leading-snug">
                      Có thông tin về địa điểm cất giấu tài sản hoặc đồng phạm có thể tẩu tán ngay lập tức.
                    </span>
                  </div>
                </label>

                {/* 4. Bảo quản đồ vật / niêm phong */}
                <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${canBaoQuanDoVat ? 'border-purple-400 bg-purple-50/70 shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}>
                  <input
                    type="checkbox"
                    checked={canBaoQuanDoVat}
                    onChange={(e) => setCanBaoQuanDoVat(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <div>
                    <strong className="text-purple-950 block">4. Có đồ vật/tang vật cần bảo quản, niêm phong</strong>
                    <span className="text-slate-600 text-[11.5px] block mt-0.5 leading-snug">
                      Đồ vật tự nguyện giao nộp cần lập biên bản niêm phong ngay theo quy định tố tụng.
                    </span>
                  </div>
                </label>
              </div>

              {canHoTroYTe && (
                <div className="pt-2 animate-in fade-in">
                  <label className="block text-[11.5px] font-semibold text-rose-800 mb-1">
                    Ghi chú tình trạng y tế sơ bộ &amp; Biện pháp hỗ trợ đã thực hiện:
                  </label>
                  <input
                    type="text"
                    value={lyDoYTe}
                    onChange={(e) => setLyDoYTe(e.target.value)}
                    placeholder="Ví dụ: Đương sự có vết thương ở bắp tay trái, đã gọi cán bộ y tế cơ quan sơ cứu khử trùng..."
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── SECTION 3: GHI CHÚ ───────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                Ghi chú
              </h2>
            </div>
          </div>

          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            rows={3}
            placeholder="Nhập các ghi chú ban đầu chưa chuẩn hóa (ví dụ: công dân hẹn bổ sung sổ hộ khẩu vào thứ 2, đơn kèm 2 tập hồ sơ gốc, hoặc trích yếu nội dung sơ bộ...)"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none transition-all"
          />
        </section>

        {/* ─── SECTION 4: TÀI LIỆU KÈM THEO ──────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                  Tài liệu kèm theo
                </h2>
                {/* Tạm ẩn badge trích xuất OCR tin báo tố giác theo yêu cầu
                {(loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham') && (
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Hỗ trợ trích xuất OCR &amp; AI
                  </span>
                )}
                */}
                {(loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu') && (
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Mẫu 02-BCA: Biên bản tiếp nhận người tự thú / đầu thú
                  </span>
                )}
              </div>
            </div>

            {/* Cảnh báo quy tắc: Không bắt buộc có tệp đính kèm */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">verified</span>
                <div>
                  <strong className="text-emerald-950 font-bold">Không bắt buộc tải file nếu nghiệp vụ không yêu cầu:</strong>
                  <p className="text-emerald-800 text-[11.5px] mt-0.5">
                    Hệ thống AI GOVEX hỗ trợ phân tích đa nguồn dữ liệu (nội dung cán bộ ghi nhận trực tiếp, lời trình bày của đương sự, biên bản tại chỗ). Có thể tiếp nhận ngay và bổ sung tài liệu sau nếu cần.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                Mô hình Đa nguồn dữ liệu • Không ép buộc OCR
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Tạm ẩn nút mẫu biên bản 01-BCA tiếp nhận tin báo tố giác theo yêu cầu
              {(loaiNghiepVu === 'tin_bao_to_giac' || loaiNghiepVu === 'tin_bao_toi_pham' || loaiNghiepVu === 'to_giac_toi_pham') && (
                <button
                  type="button"
                  onClick={() => {
                    const mockFile = new File(['Bien ban tiep nhan tin bao to giac toi pham'], 'Bien_ban_tiep_nhan_tin_bao_01_BCA.pdf', { type: 'application/pdf' });
                    handleAddFiles([mockFile] as any);
                    showToast('Đã đính kèm Biên bản tiếp nhận tin báo (Mẫu 01-BCA)!');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-300 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-600">post_add</span>
                  <span>+ Mẫu Biên bản 01-BCA</span>
                </button>
              )}
              */}

              {(loaiNghiepVu === 'nguoi_tu_thu' || loaiNghiepVu === 'nguoi_dau_thu') && (
                <button
                  type="button"
                  onClick={() => {
                    const tenMau = loaiNghiepVu === 'nguoi_dau_thu'
                      ? 'Bien_ban_tiep_nhan_nguoi_dau_thu_02_BCA.pdf'
                      : 'Bien_ban_tiep_nhan_nguoi_tu_thu_02_BCA.pdf';
                    const mockFile = new File([`Bien ban tiep nhan nguoi ${loaiNghiepVu === 'nguoi_dau_thu' ? 'dau thu' : 'tu thu'} (Mau so 02-BCA theo Thong tu 119/2021/TT-BCA)`], tenMau, { type: 'application/pdf' });
                    handleAddFiles([mockFile] as any);
                    showToast(`Đã đính kèm Biên bản tiếp nhận người ${loaiNghiepVu === 'nguoi_dau_thu' ? 'đầu thú' : 'tự thú'} (Mẫu 02-BCA)!`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-xs border border-purple-300 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-purple-600">post_add</span>
                  <span>+ Mẫu Biên bản 02-BCA</span>
                </button>
              )}

              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Tải tệp lên</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.rar,.zip"
                  onChange={(e) => {
                    handleAddFiles(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleScanDocument}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer border border-slate-200/80"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-600">scanner</span>
                <span>Quét tài liệu từ máy scan</span>
              </button>
            </div>
          </div>


          {files.length === 0 ? (
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <span className="material-symbols-outlined text-2xl">upload_file</span>
              </div>
              <p className="text-xs font-semibold text-slate-700">Chưa có tài liệu số hóa hoặc tệp đính kèm</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
                Tải tệp PDF/ảnh hoặc bấm &quot;Quét tài liệu từ máy scan&quot;. Khi có tài liệu đính kèm, hệ thống sẽ tự động kích hoạt tiến trình AI phân tích bóc tách 6 bước ngay khi ghi nhận lượt nhận.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[22px] text-red-600 shrink-0">
                      description
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <span className="text-[11.5px] text-slate-500 font-medium">
                        {file.size} • {file.category === 'main' ? 'Tài liệu chính' : 'Tài liệu kèm theo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0 self-stretch pl-2 py-0.5">
                    <span className="text-[11.5px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded leading-none">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => showToast(`Đang xem tài liệu: ${file.name}`)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        title="Xem tài liệu"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Xóa tệp"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── BOTTOM SUBMIT BAR ──────────────────────────────── */}

      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-blue-400 text-lg shrink-0">description</span>
                <span className="text-xs font-semibold truncate">{previewDoc.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[220px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3 shadow-inner">
                <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 max-w-sm break-all">{previewDoc.name}</h4>
              <p className="text-xs text-slate-500 mb-3">
                Phân loại: <span className="font-semibold text-slate-700">{previewDoc.loai}</span> • Dung lượng: {previewDoc.size}
              </p>
              <div className="text-[11.5px] text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                <div>Cán bộ số hóa / Người tải: <strong className="text-slate-800">{previewDoc.nguoiTai}</strong></div>
                <div>Thời gian tải lên hệ thống: <strong className="text-slate-800">{previewDoc.ngayTai}</strong></div>
              </div>
            </div>

            <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 italic">Văn bản số hóa lưu trữ chuẩn ISO/PDF-A</span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}