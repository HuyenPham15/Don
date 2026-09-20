import React, { useState } from 'react';
import { Screen, UploadedFile, LuotNhan } from '../types';

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

export default function NhanDonThem({ onNav, onSubmit }: NhanDonThemProps) {
  // ─── 1. THÔNG TIN TIẾP NHẬN STATE ─────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const [ngayNhan, setNgayNhan] = useState(todayStr);
  const [ngayLamDon, setNgayLamDon] = useState('');
  const [hinhThucNhan, setHinhThucNhan] = useState('Trực tiếp');
  const [canBoNhan, setCanBoNhan] = useState('Nguyễn Thị Hải Yến');
  const [donViNhan, setDonViNhan] = useState('Phòng Hành chính - Tổng hợp');

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

    // Validate theo loại người nộp
    if (loaiNguoiNop === 'ca-nhan') {
      if (!cnHoTen.trim()) {
        newErrors.cnHoTen = 'Họ và tên cá nhân là bắt buộc';
      }
      if (cnTuCach === 'nguoi-dai-dien') {
        if (!cnUqHoTen.trim()) {
          newErrors.cnUqHoTen = 'Họ và tên người đại diện là bắt buộc';
        }
        if (!cnUqCccd.trim()) {
          newErrors.cnUqCccd = 'Số CCCD người đại diện là bắt buộc';
        }
        if (cnUqTaiLieuList.length === 0) {
          newErrors.cnUqTaiLieu = 'Chưa có tài liệu chứng minh tư cách đại diện';
        }
        if (cnUqNgayHetHieuLuc && cnUqNgayHetHieuLuc < todayStr) {
          newErrors.cnUqHieuLuc = 'Văn bản ủy quyền đã hết hiệu lực';
        }
      }
    } else if (loaiNguoiNop === 'to-chuc') {
      if (!tcTen.trim()) {
        newErrors.tcTen = 'Tên tổ chức / doanh nghiệp là bắt buộc';
      }
      if (!tcDdHoTen.trim()) {
        newErrors.tcDdHoTen = 'Họ và tên người đại diện là bắt buộc';
      }
      if (tcTuCach === 'nguoi-duoc-uy-quyen') {
        if (!tcUqHoTen.trim()) {
          newErrors.tcUqHoTen = 'Họ và tên người được ủy quyền cho tổ chức là bắt buộc';
        }
        if (!tcUqVanBan && files.every((f) => !f.name.toLowerCase().includes('uy_quyen'))) {
          newErrors.tcUqVanBan = 'Bắt buộc tải lên giấy ủy quyền/công văn ủy quyền từ tổ chức';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Vui lòng kiểm tra lại các trường thông tin bắt buộc còn thiếu hoặc không hợp lệ.');
      return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `LN-2026-${randomCode}_HC`;

    let submitterName = 'Chưa xác định (Không rõ)';
    if (loaiNguoiNop === 'ca-nhan') {
      if (cnTuCach === 'nguoi-dai-dien' && cnUqHoTen.trim()) {
        submitterName = `${cnHoTen.trim() || 'Người đứng đơn'} (Đại diện: ${cnUqHoTen.trim()})`;
      } else {
        submitterName = cnHoTen.trim();
      }
    } else if (loaiNguoiNop === 'to-chuc') {
      submitterName = tcTen.trim();
    }

    const newRecord: LuotNhan = {
      id: generatedId,
      ngayNhan: ngayNhan.split('-').reverse().join('/'),
      nguoiNop: submitterName,
      hinhThuc: hinhThucNhan,
      noiDung: ghiChu.trim() || 'Đơn tiếp nhận mới vào hàng đợi (Chờ tiếp nhận)',
      donVi: donViNhan,
      aiJob: 0, // Trạng thái ban đầu: "Chờ tiếp nhận"
    };

    showToast(`Đã lưu thành công đơn tiếp nhận ${generatedId}!`);

    setTimeout(() => {
      if (onSubmit) {
        onSubmit(newRecord);
      } else {
        onNav('cong-viec');
      }
    }, 800);
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
              Nhận đơn
            </button>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Thêm mới đơn tiếp nhận</span>
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
            <div className="flex items-center gap-2.5">
              <h1 className="text-[18px] font-bold text-slate-900 font-headline-md tracking-tight">
                Thêm mới đơn tiếp nhận
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-semibold font-label-technical">
                Chờ tiếp nhận
              </span>
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
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white font-semibold text-[13px] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Lưu đơn tiếp nhận</span>
          </button>
        </div>
      </div>

      {/* ─── FULL WIDTH SCROLLABLE BODY ───────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-8 w-full">
        {/* ─── SECTION 1: THÔNG TIN TIẾP NHẬN ─────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
                Thông tin tiếp nhận
              </h2>
            </div>
            <span className="text-[12px] text-slate-400">
              Các trường có dấu (<span className="text-red-500">*</span>) là bắt buộc
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
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

            {/* Ngày làm đơn */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-slate-700">
                  Ngày làm đơn
                </label>
              </div>
              <input
                type="date"
                value={ngayLamDon}
                onChange={(e) => {
                  setNgayLamDon(e.target.value);
                  if (errors.ngayLamDon) setErrors((prev) => ({ ...prev, ngayLamDon: '' }));
                }}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${errors.ngayLamDon ? 'border-red-500' : 'border-slate-200'
                  }`}
              />
              {errors.ngayLamDon && (
                <p className="text-[11px] text-red-500 mt-1">{errors.ngayLamDon}</p>
              )}
            </div>

            {/* Hình thức nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Hình thức nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={hinhThucNhan}
                onChange={(e) => setHinhThucNhan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="Trực tiếp">Trực tiếp</option>
                <option value="Bưu điện">Bưu điện</option>
                <option value="Trực tuyến">Trực tuyến (Cổng DVC)</option>
                <option value="Chuyển phát">Chuyển phát cơ quan khác</option>
              </select>
            </div>

            {/* Cán bộ nhận * */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Cán bộ nhận <span className="text-red-500">*</span>
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
                <option value="Phòng Hành chính - Tổng hợp">Phòng Hành chính - Tổng hợp</option>
                <option value="Ban Tiếp công dân tỉnh">Ban Tiếp công dân tỉnh</option>
                <option value="Thanh tra tỉnh">Thanh tra tỉnh</option>
                <option value="Sở Tài nguyên và Môi trường">Sở Tài nguyên và Môi trường</option>
                <option value="Sở Xây dựng">Sở Xây dựng</option>
              </select>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: LOẠI NGƯỜI NỘP ĐƠN ───────────────────── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
                Loại người nộp đơn &amp; Thông tin chủ thể
              </h2>
            </div>
          </div>

          {/* Lựa chọn loại người nộp dạng Radio Button */}
          <div className="flex flex-wrap items-center gap-8 py-1">
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
                Không rõ
              </span>
            </label>

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
                Tổ chức
              </span>
            </label>
          </div>

          {/* ─── TRƯỜNG HỢP: CÁ NHÂN ─── */}
          {loaiNguoiNop === 'ca-nhan' && (
            <div className="space-y-6 pt-1">
              {/* Thông tin cá nhân */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
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
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Số định danh cá nhân / CCCD
                    </label>
                    <input
                      type="text"
                      value={cnCccd}
                      onChange={(e) => setCnCccd(e.target.value)}
                      placeholder="12 chữ số"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
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

              {/* Tư cách nộp đơn / Tư cách thực hiện */}
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
                    Tư cách thực hiện
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Xác định người trực tiếp nộp hồ sơ hoặc làm việc với cơ quan
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${cnTuCach === 'nguoi-dung-don'
                      ? 'border-[#004ac6] bg-blue-50/40 shadow-xs ring-1 ring-[#004ac6]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <input
                      type="radio"
                      name="cnTuCach"
                      value="nguoi-dung-don"
                      checked={cnTuCach === 'nguoi-dung-don'}
                      onChange={() => setCnTuCach('nguoi-dung-don')}
                      className="mt-1 w-4 h-4 text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                    />
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">Người đứng đơn</div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5">
                        Chính chủ người nộp đơn khiếu nại, tố cáo, kiến nghị, phản ánh
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${cnTuCach === 'nguoi-dai-dien'
                      ? 'border-[#004ac6] bg-blue-50/40 shadow-xs ring-1 ring-[#004ac6]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <input
                      type="radio"
                      name="cnTuCach"
                      value="nguoi-dai-dien"
                      checked={cnTuCach === 'nguoi-dai-dien'}
                      onChange={() => setCnTuCach('nguoi-dai-dien')}
                      className="mt-1 w-4 h-4 text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                    />
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">
                        Người đại diện / Người được ủy quyền
                      </div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5">
                        Đại diện theo pháp luật hoặc được ủy quyền thực hiện nộp đơn và làm việc
                      </div>
                    </div>
                  </label>
                </div>

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
                <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
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
                    <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                      Mã số thuế / Mã định danh
                    </label>
                    <input
                      type="text"
                      value={tcMst}
                      onChange={(e) => setTcMst(e.target.value)}
                      placeholder="MST / Số ĐKKD"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
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
                <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
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
                    <input
                      type="text"
                      value={tcDdCccd}
                      onChange={(e) => setTcDdCccd(e.target.value)}
                      placeholder="12 chữ số"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 font-label-technical focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
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

              {/* Tư cách nộp đơn & Ủy quyền */}
              <div className="space-y-3 pt-2">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-800 uppercase font-label-technical">
                    Tư cách nộp đơn &amp; Ủy quyền
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Xác định tư cách của người thực hiện nộp hồ sơ cho tổ chức
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setTcTuCach('dai-dien-phap-luat')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${tcTuCach === 'dai-dien-phap-luat'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={tcTuCach === 'dai-dien-phap-luat'}
                        onChange={() => setTcTuCach('dai-dien-phap-luat')}
                        className="text-blue-600"
                      />
                      <span className="font-bold text-slate-900 text-[13px]">
                        Người đại diện theo pháp luật
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1 pl-6">
                      Chính người đại diện đứng tên và nộp đơn
                    </p>
                  </div>

                  <div
                    onClick={() => setTcTuCach('nguoi-duoc-uy-quyen')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${tcTuCach === 'nguoi-duoc-uy-quyen'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-200 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={tcTuCach === 'nguoi-duoc-uy-quyen'}
                        onChange={() => setTcTuCach('nguoi-duoc-uy-quyen')}
                        className="text-amber-600"
                      />
                      <span className="font-bold text-slate-900 text-[13px]">
                        Người được ủy quyền
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1 pl-6">
                      Có giấy ủy quyền/công văn ủy quyền hợp lệ từ tổ chức
                    </p>
                  </div>
                </div>

                {/* Khi chọn Người được ủy quyền của Tổ chức */}
                {tcTuCach === 'nguoi-duoc-uy-quyen' && (
                  <div className="mt-3 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                      <span>Thông tin người nhận ủy quyền &amp; Giấy ủy quyền từ tổ chức (Bắt buộc)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Họ và tên người được ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={tcUqHoTen}
                          onChange={(e) => setTcUqHoTen(e.target.value)}
                          placeholder="Họ tên người đến nộp thay"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        {errors.tcUqHoTen && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.tcUqHoTen}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Chức vụ trong tổ chức
                        </label>
                        <input
                          type="text"
                          value={tcUqChucVu}
                          onChange={(e) => setTcUqChucVu(e.target.value)}
                          placeholder="Chuyên viên pháp lý..."
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          CCCD người được ủy quyền
                        </label>
                        <input
                          type="text"
                          value={tcUqCccd}
                          onChange={(e) => setTcUqCccd(e.target.value)}
                          placeholder="12 chữ số"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-label-technical"
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Số điện thoại liên hệ
                        </label>
                        <input
                          type="text"
                          value={tcUqSdt}
                          onChange={(e) => setTcUqSdt(e.target.value)}
                          placeholder="09xx xxx xxx"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                          Khu vực tải Giấy ủy quyền / Công văn ủy quyền <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-amber-300 rounded-xl p-3.5 text-center bg-white">
                          <input
                            type="file"
                            id="file-tc-uq-full"
                            className="hidden"
                            accept=".pdf,.docx,.doc,.jpg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setTcUqVanBan(e.target.files[0]);
                                setFiles((prev) => [
                                  ...prev,
                                  {
                                    name: `Cong_van_uy_quyen_${e.target.files![0].name}`,
                                    size: '1.8 MB',
                                    category: 'attach',
                                  },
                                ]);
                                if (errors.tcUqVanBan) setErrors((prev) => ({ ...prev, tcUqVanBan: '' }));
                              }
                            }}
                          />
                          <label
                            htmlFor="file-tc-uq-full"
                            className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline font-medium"
                          >
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            <span>
                              {tcUqVanBan ? tcUqVanBan.name : 'Chọn Giấy ủy quyền / Công văn có dấu đỏ'}
                            </span>
                          </label>
                          {errors.tcUqVanBan && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.tcUqVanBan}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TRƯỜNG HỢP: KHÔNG RÕ ─── */}
          {loaiNguoiNop === 'khong-ro' && (
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
          )}
        </section>

        {/* ─── SECTION 3: GHI CHÚ ───────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
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
                <h2 className="text-[15px] font-bold text-slate-900 uppercase font-label-technical tracking-wide">
                  Tài liệu kèm theo
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] font-label-technical">
                  {files.length} tài liệu
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScanDocument}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-600">scanner</span>
              <span>Quét tài liệu từ máy scan</span>
            </button>
          </div>

          {/* Full-width Upload Dropzone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
              }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleAddFiles(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              id="file-upload-full"
              className="hidden"
              multiple
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff"
              onChange={(e) => handleAddFiles(e.target.files)}
            />
            <label htmlFor="file-upload-full" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004ac6] mx-auto mb-2 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[28px]">upload_file</span>
              </div>
              <div className="text-[13.5px] font-semibold text-slate-800 mb-0.5">
                Nhấn để chọn tệp hoặc kéo thả tài liệu vào đây
              </div>
              <p className="text-[11.5px] text-slate-400">
                Hỗ trợ tệp PDF, DOCX, JPG, PNG (Tối đa 25MB)
              </p>
            </label>
          </div>

          {/* Danh sách tệp đã đính kèm */}
          {files.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <p className="text-[12.5px] font-medium text-slate-700">Chưa có tài liệu đính kèm</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tải tệp lên hoặc quét tài liệu ngay.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[22px] text-red-600 shrink-0">
                      description
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium text-slate-800 truncate">
                        {file.name}
                      </p>
                      <span className="text-[10.5px] text-slate-400 font-label-technical">
                        {file.size} • {file.category === 'main' ? 'Tài liệu chính' : 'Tài liệu kèm theo'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Xóa tệp"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ─── STICKY FOOTER ACTION ─────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="text-[12px] text-slate-500">
          Trạng thái ban đầu sau khi lưu: <strong className="text-blue-700 font-medium font-label-technical">Chờ tiếp nhận</strong>
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
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white font-semibold text-[13px] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Lưu</span>
          </button>
        </div>
      </div>

      {/* ─── MODAL: XEM TRƯỚC TÀI LIỆU CHỨNG MINH ĐẠI DIỆN ─── */}
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