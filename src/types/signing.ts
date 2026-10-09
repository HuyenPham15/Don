// src/types/signing.ts

export type SigningStatus =
  | 'nhap'                  // Bản nháp
  | 'cho_trinh'             // Chờ trình ký
  | 'da_trinh'              // Đã trình
  | 'cho_ky'                // Chờ ký
  | 'dang_ky'               // Đang ký (tuần tự qua các lãnh đạo)
  | 'yeu_cau_chinh_sua'     // Yêu cầu chỉnh sửa
  | 'da_ky'                 // Đã ký
  | 'hoan_tat'              // Hoàn tất
  | 'da_thu_hoi'            // Đã thu hồi
  | 'tu_choi'               // Từ chối ký
  | 'da_huy';               // Đã hủy

export type SignerRole = 'ky' | 'duyet' | 'cho_y_kien';

export type SignerStatus =
  | 'chua_den_luot'  // Chưa đến lượt
  | 'cho_ky'         // Chờ ký
  | 'dang_xu_ly'     // Đang xử lý
  | 'da_ky'          // Đã ký
  | 'tra_lai'        // Trả lại / Yêu cầu chỉnh sửa
  | 'tu_choi'        // Từ chối
  | 'bo_qua';        // Bỏ qua

export interface SignerItem {
  id: string;              // ld-01, ld-02...
  name: string;            // Đ/c Trần Văn Hùng
  chucVu: string;          // Phó Chánh Thanh tra thành phố
  coQuan?: string;         // Thanh tra Thành phố
  vaiTro: SignerRole;      // 'ky' | 'duyet' | 'cho_y_kien'
  thuTu: number;           // 1, 2, 3...
  status: SignerStatus;    // 'chua_den_luot' | 'cho_ky' | 'dang_xu_ly' | 'da_ky' | 'tra_lai' | 'tu_choi' | 'bo_qua'
  thoiGianKy?: string;     // '09:32 04/10/2026'
  yKien?: string;          // Ý kiến của người ký
  signatureCert?: string;  // VGCA - Ban Cơ yếu Chính phủ / SmartCA...
  soSeri?: string;
}

export interface DocumentVersion {
  version: string;         // 'V1', 'V2'
  thoiGian: string;
  nguoiTao: string;
  trangThaiLucDo: string;
  ghiChu: string;
  noiDungSnapshot: string;
}

export interface DetailedAuditLog {
  id: string;
  time: string;
  actor: string;
  actorRole: string;       // Cán bộ thụ lý / Lãnh đạo ký duyệt / Hệ thống...
  action: string;          // Trình văn bản, Ký số phê duyệt, Chuyển nhiệm vụ ký, Yêu cầu chỉnh sửa, Thu hồi...
  statusBefore?: string;
  statusAfter?: string;
  version: string;         // 'V1', 'V2'
  note?: string;           // Ý kiến, lý do nếu có
  signatureCert?: string;
}

export type DocumentType =
  | 'bao_cao_de_xuat'       // Báo cáo đề xuất hướng xử lý đơn
  | 'to_trinh_thu_ly'        // Tờ trình đề xuất thụ lý
  | 'quyet_dinh_thu_ly'      // Quyết định thụ lý tố cáo
  | 'thong_bao_khong_thu_ly' // Thông báo không thụ lý
  | 'thong_bao'              // Thông báo hành chính
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
  soKyHieu?: string;            // Số / ký hiệu văn bản (89/TTr-TTTP)
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
  
  // Danh sách người ký tuần tự
  signers: SignerItem[];
  currentSignerIndex: number;   // 0, 1, 2...
  
  // Lãnh đạo hiện tại đang đến lượt (để tương thích ngược)
  lanhDaoId: string;            // ld-01
  lanhDaoName: string;          // Đ/c Trần Văn Hùng
  lanhDaoChucVu: string;        // Phó Chánh Thanh tra thành phố
  
  status: SigningStatus;
  hanXuLy?: string;             // 24 giờ / 18/09/2026
  mucDoUuTien: 'khan' | 'thuong' | 'hoa_toc';
  
  tepDinhKem: SigningAttachment[];
  
  // Quản lý phiên bản văn bản
  phienBanHienTai: string;      // 'V1', 'V2'
  versionHistory: DocumentVersion[];
  
  // Thông tin chữ ký khi đã ký
  chuKyInfo?: ChuKyInfo;
  
  // Lý do trả lại / từ chối
  lyDoTraLai?: string;
  lyDoTuChoi?: string;
  
  // Lịch sử trình ký & Audit log
  history: SigningHistoryLog[];
  auditLogs: DetailedAuditLog[];
  
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
    id: 'lanh_dao_hung',
    name: 'Trần Văn Hùng',
    shortName: 'TH',
    role: 'lanh_dao',
    roleLabel: 'Lãnh đạo A (Ký duyệt bước 1)',
    chucVu: 'Phó Chánh Thanh tra thành phố',
    phongBan: 'Ban Lãnh đạo Thanh tra',
    avatarBg: 'bg-emerald-700',
    coQuan: 'Thanh tra Thành phố Hà Nội',
  },
  {
    id: 'lanh_dao_cuong',
    name: 'Trần Văn Cường',
    shortName: 'TC',
    role: 'lanh_dao',
    roleLabel: 'Lãnh đạo B (Ký duyệt bước 2)',
    chucVu: 'Phó Chánh Thanh tra thành phố',
    phongBan: 'Ban Lãnh đạo Thanh tra',
    avatarBg: 'bg-indigo-700',
    coQuan: 'Thanh tra Thành phố Hà Nội',
  },
  {
    id: 'lanh_dao_bao',
    name: 'Đặng Quốc Bảo',
    shortName: 'QB',
    role: 'lanh_dao',
    roleLabel: 'Lãnh đạo C (Phê duyệt cuối cùng)',
    chucVu: 'Chánh Thanh tra thành phố',
    phongBan: 'Ban Lãnh đạo Thanh tra',
    avatarBg: 'bg-purple-700',
    coQuan: 'Thanh tra Thành phố Hà Nội',
  },
];
