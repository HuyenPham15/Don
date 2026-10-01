// src/types/signing.ts

export type SigningStatus =
  | 'nhap'                  // Nháp
  | 'cho_trinh'              // Chờ trình ký
  | 'da_trinh'               // Đã trình (Chờ lãnh đạo ký)
  | 'yeu_cau_chinh_sua'      // Lãnh đạo yêu cầu chỉnh sửa
  | 'da_ky'                  // Đã ký
  | 'tu_choi';               // Từ chối ký

export type DocumentType =
  | 'to_trinh_thu_ly'        // Tờ trình đề xuất thụ lý
  | 'quyet_dinh_thu_ly'      // Quyết định thụ lý tố cáo
  | 'thong_bao_khong_thu_ly' // Thông báo không thụ lý
  | 'bien_ban_ban_giao'      // Biên bản bàn giao đơn
  | 'van_ban_tra_lai'        // Văn bản trả lại đơn
  | 'bao_cao_xac_minh'       // Báo cáo kết quả xác minh
  | 'ket_luan_to_cao';       // Kết luận nội dung tố cáo

export interface SigningHistoryLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  note?: string;
  signatureCert?: string;
}

export interface SigningAttachment {
  id: string;
  tenTep: string;
  dungLuong: string;
  loai: 'du_thao' | 'tai_lieu_kiem_tra' | 'chung_cu';
}

export interface ChuKyInfo {
  nguoiKy: string;
  chucVu: string;
  coQuan: string;
  thoiGianKy: string;
  loaiChungThu: string; // 'VGCA - Ban Cơ yếu Chính phủ' | 'USB Token Viettel-CA' | 'VNPT SmartCA'
  soSeri?: string;
  yKienLanhDao?: string;
}

export interface SigningDocument {
  id: string;                   // Mã văn bản trình ký (VB-2026-0089)
  hoSoCode: string;             // Số đơn / Mã hồ sơ (Đ-2026-00125)
  luotNhanId?: string;          // LN-2025-0819
  loaiDon: string;              // Đơn tố cáo cán bộ vi phạm
  nguoiGuiDon: string;          // Nguyễn Văn A
  noiDungDon: string;           // Tóm tắt nội dung đơn
  
  tenVanBan: string;            // Tờ trình đề xuất thụ lý đơn tố cáo
  loaiVanBan: DocumentType;     // to_trinh_thu_ly
  loaiVanBanLabel: string;
  trichYeu: string;             // Trích yếu nội dung
  noiDungChiTiet: string;       // Toàn văn nội dung dự thảo
  
  nguoiLap: string;             // Nguyễn Minh Anh
  donViNguoiLap: string;        // Phòng Tiếp công dân & Xử lý đơn
  ngayTao: string;              // 16/09/2026 10:15
  
  nguoiTrinh?: string;          // Nguyễn Minh Anh
  thoiGianTrinh?: string;       // 16/09/2026 14:30
  yKienCanBo?: string;          // Kính trình Đ/c Phó Chánh Thanh tra xem xét, phê duyệt
  
  lanhDaoId: string;            // ld-01
  lanhDaoName: string;          // Đ/c Trần Văn Hùng
  lanhDaoChucVu: string;        // Phó Chánh Thanh tra thành phố
  
  status: SigningStatus;
  hanXuLy?: string;             // 24 giờ / 18/09/2026
  mucDoUuTien: 'khan' | 'thuong' | 'hoa_toc';
  
  tepDinhKem: SigningAttachment[];
  
  // Thông tin chữ ký khi đã ký
  chuKyInfo?: ChuKyInfo;
  
  // Lý do trả lại / từ chối
  lyDoTraLai?: string;
  lyDoTuChoi?: string;
  
  // Lịch sử trình ký
  history: SigningHistoryLog[];
  
  // Liên kết Step trong quy trình
  stepId?: string; // e.g. 'STEP-04', 'STEP-05'
}

export interface LanhDaoAuthority {
  id: string;
  name: string;
  chucVu: string;
  coQuan: string;
  thamQuyenKy: DocumentType[];
  isAvailable: boolean;
}

export type UserRole = 'can_bo' | 'lanh_dao';

export interface CurrentUserAccount {
  id: string;
  name: string;
  shortName: string;
  role: UserRole;
  roleLabel: string;
  chucVu: string;
  phongBan: string;
  avatarBg: string;
  coQuan: string;
}

export const DEMO_ACCOUNTS: CurrentUserAccount[] = [
  {
    id: 'can_bo_minhanh',
    name: 'Nguyễn Minh Anh',
    shortName: 'MA',
    role: 'can_bo',
    roleLabel: 'Cán bộ thụ lý hồ sơ',
    chucVu: 'Chuyên viên xử lý đơn',
    phongBan: 'Phòng Tiếp công dân & Xử lý đơn',
    avatarBg: 'bg-[#004ac6]',
    coQuan: 'Thanh tra Thành phố Hà Nội',
  },
  {
    id: 'lanh_dao_cuong',
    name: 'Trần Văn Cường',
    shortName: 'TC',
    role: 'lanh_dao',
    roleLabel: 'Lãnh đạo ký duyệt',
    chucVu: 'Phó Chánh Thanh tra thành phố',
    phongBan: 'Ban Lãnh đạo Thanh tra',
    avatarBg: 'bg-indigo-700',
    coQuan: 'Thanh tra Thành phố Hà Nội',
  },
];
