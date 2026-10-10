// src/types/quanLyTrinhKy.ts

export type DoiTuongTrinhType = 'van_ban' | 'tep_ho_so';

export type HanhDongYeuCauType = 'ky' | 'phe_duyet' | 'ky_va_phe_duyet';

export type YeuCauXuLyTaiLieu = 'ky' | 'phe_duyet' | 'ky_va_phe_duyet' | 'tham_khao';

export type TrinhKyStatus =
  | 'ban_nhap'                  // Bản nháp
  | 'da_trinh'                  // Đã trình
  | 'dang_cho_xu_ly'            // Đang chờ xử lý
  | 'dang_xu_ly_mot_phan'       // Đang xử lý một phần
  | 'da_ky'                     // Đã ký (ký nháy / chuyên môn)
  | 'da_phe_duyet'              // Đã phê duyệt (ký số CA lãnh đạo)
  | 'da_ky_va_phe_duyet'        // Đã ký và phê duyệt
  | 'yeu_cau_chinh_sua'         // Yêu cầu chỉnh sửa
  | 'da_tra_lai'                // Đã trả lại
  | 'da_tu_choi'                // Đã từ chối
  | 'da_thu_hoi'                // Đã thu hồi
  | 'da_huy';                   // Đã hủy

export type KieuTrinhKy = 'tuan_tu' | 'dong_thoi';

export type TrangThaiNguoiNhan =
  | 'chua_den_luot'
  | 'dang_cho_xu_ly'
  | 'da_tiep_nhan'
  | 'da_ky'
  | 'da_phe_duyet'
  | 'yeu_cau_chinh_sua'
  | 'da_tra_lai'
  | 'tu_choi';

export interface ChuKySoInfo {
  nguoiKy: string;
  chucVu: string;
  coQuan: string;
  thoiGianKy: string;
  loaiChungThu: string; // 'VGCA - Ban Cơ yếu Chính phủ' | 'Viettel-CA Cloud' | 'VNPT SmartCA'
  soSeri?: string;
  tinhTrangHieuLuc: boolean;
}

export interface HoSoDocumentItem {
  id: string;
  tenTaiLieu: string;
  loaiTaiLieu: string;
  soKyHieu?: string;
  nguoiSoan?: string;
  ngayTao?: string;
  phienBan: string;
  dungLuong?: string;
  fileUrl?: string;
  yeuCauXuLy: YeuCauXuLyTaiLieu; // 'ky' | 'phe_duyet' | 'tham_khao'
  trangThaiXuLy: 'chua_xu_ly' | 'da_ky' | 'da_phe_duyet' | 'khong_ap_dung';
  chuKySo?: ChuKySoInfo;
  noiDungTrichYeu?: string;
  noiDungChiTiet?: string;
}

export interface NguoiNhanTrinhItem {
  id: string;
  hoTen: string;
  chucVu: string;
  phongBan?: string;
  avatarBg?: string;
  thuTu: number; // 1, 2, 3...
  kieuTrinh: KieuTrinhKy; // 'tuan_tu' | 'dong_thoi'
  hanhDongYeuCau: HanhDongYeuCauType; // 'ky' | 'phe_duyet' | 'ky_va_phe_duyet'
  trangThai: TrangThaiNguoiNhan;
  thoiDiemNhan?: string;
  thoiDiemXuLy?: string;
  yKien?: string;
  chuKySo?: ChuKySoInfo;
}

export interface LichSuXuLyItem {
  id: string;
  thoiGian: string;
  nguoiThucHien: string;
  chucVu: string;
  hanhDong:
    | 'Tạo lượt trình'
    | 'Trình văn bản / hồ sơ'
    | 'Tiếp nhận xử lý'
    | 'Đã ký nháy chuyên môn'
    | 'Đã phê duyệt & Ký số CA'
    | 'Yêu cầu chỉnh sửa'
    | 'Đã trả lại lượt trình'
    | 'Từ chối phê duyệt'
    | 'Thu hồi lượt trình'
    | 'Hủy lượt trình'
    | 'Trình lại (Lượt mới)';
  noiDungYKien?: string;
  phienBanXuLy: string;
  luotTrinhIndex: number;
}

export interface LuotTrinhKy {
  id: string; // e.g. 'LTK-2026-0042'
  doiTuongTrinh: DoiTuongTrinhType; // 'van_ban' | 'tep_ho_so'
  tenDoiTuong: string; // Tên văn bản hoặc tên tệp hồ sơ
  soLuongTaiLieu: number; // 1 nếu văn bản, >= 1 nếu tệp hồ sơ
  maHoSoLienQuan: string; // e.g. 'Đ-2026-00125'
  tieuDeDon: string;
  stepQuyTrinhId?: string; // e.g. 'tn-2', 'tl-2'
  tenStepQuyTrinh?: string;
  
  // Thông tin người trình
  nguoiTao: string;
  chucVuNguoiTao: string;
  nguoiTrinh: string;
  chucVuNguoiTrinh: string;
  donViTrinh: string;
  thoiGianTao: string;
  thoiGianTrinh: string;
  noiDungYeuCau: string;
  
  // Trạng thái & Độ ưu tiên
  status: TrinhKyStatus;
  mucDoUuTien: 'hoa_toc' | 'khan' | 'thuong';
  hanXuLy?: string;
  kieuTrinh: KieuTrinhKy; // 'tuan_tu' | 'dong_thoi'
  hanhDongYeuCauChung: HanhDongYeuCauType;
  
  // Danh sách tài liệu thành phần
  danhSachTaiLieu: HoSoDocumentItem[];
  
  // Danh sách lãnh đạo nhận trình
  danhSachNguoiNhan: NguoiNhanTrinhItem[];
  
  // Lịch sử xử lý chi tiết
  lichSuXuLy: LichSuXuLyItem[];
  
  // Quản lý các lượt trình (khi bị trả lại và trình lại)
  luotTrinhNumber: number; // 1, 2...
  tongSoLuotTrinh: number;
  previousRoundId?: string;
  lyDoTraLai?: string;
}
