// src/types/baoCaoXacMinh.ts

export type TrangThaiBaoCaoXacMinh =
  | 'du_thao'                // Cán bộ đang soạn thảo / lưu nháp
  | 'cho_kiem_tra'           // Đã chuyển cán bộ kiểm tra / hoàn thiện
  | 'cho_duyet'              // Đang trình Trưởng/Phó Trưởng Công an xã hoặc Thủ trưởng CQĐT
  | 'yeu_cau_chinh_sua'      // Lãnh đạo yêu cầu bổ sung/chỉnh sửa nội dung xác minh
  | 'da_phe_duyet'           // Đã được lãnh đạo ký số/phê duyệt
  | 'da_chuyen_luong_sau';   // Đã chuyển sang bước lập đề xuất / chuyển cơ quan điều tra

export interface NguoiLienQuanNguonTin {
  id: string;
  hoTen: string;
  vaiTro: 'nguoi_to_giac' | 'nguoi_bi_to_giac' | 'nguoi_bi_hai' | 'nguoi_lam_chung' | 'nguoi_lien_quan';
  cccd?: string;
  sdt?: string;
  diaChi?: string;
  ghiChu?: string;
}

export interface HoatDongXacMinhRecord {
  id: string;
  tenHoatDong: string;
  loaiHoatDong: 'lay_loi_khai' | 'kham_nghiem_kiem_tra' | 'thu_giu_niem_phong' | 'tra_soat_xac_minh' | 'khac';
  ngayThucHien: string;
  canBoThucHien: string;
  diaDiem: string;
  moTaChiTiet: string;
  ketQuaTuongUng: string;
  taiLieuDinhKemId?: string;
  tenTaiLieuDinhKem?: string;
  daLienKetBaoCao: boolean;
}

export interface TaiLieuCanCuItem {
  id: string;
  maTaiLieu: string;
  tenTaiLieu: string;
  loaiTaiLieu: 'bien_ban' | 'loi_khai' | 'hinh_anh_video' | 'tai_lieu_thu_giu' | 'ket_qua_tra_cuu' | 'khac';
  ngayNhanLap: string;
  nguoiCungCap: string;
  tinhTrang: 'ban_chinh' | 'ban_sao_chuyen_hoa' | 'file_so_hoa';
  trichDanChungMinh: string;
  urlFile?: string;
}

export interface LichSuChinhSuaBaoCao {
  id: string;
  phienBan: string;
  thoiDiem: string;
  nguoiThucHien: string;
  chucVu: string;
  hanhDong: string;
  noiDungThayDoi: string;
  yKienGhiChu?: string;
}

export interface BaoCaoXacMinhData {
  id: string;
  maHoSo: string;                      // Mã hồ sơ tố giác/tin báo (e.g. TG-2026-0044)
  tieuDeHoSo: string;
  soBaoCao: string;                     // Số hiệu văn bản (e.g. 08/BC-CAX-XM)
  ngayLap: string;
  nguoiLap: string;
  chucVuNguoiLap: string;
  donViLap: string;                    // Công an xã/phường...
  trangThai: TrangThaiBaoCaoXacMinh;

  // 1. Dữ liệu tổng hợp từ hồ sơ gốc (read-only / auto-populated)
  thoiGianTiepNhan: string;
  nguonTinChiTiet: string;
  thoiGianDiaDiemXayRa: string;
  danhSachNguoiLienQuan: NguoiLienQuanNguonTin[];

  // 2. Dữ liệu hoạt động xác minh và kết quả tương ứng
  danhSachHoatDong: HoatDongXacMinhRecord[];

  // 3. Danh mục tài liệu làm căn cứ báo cáo
  danhMucTaiLieuCanCu: TaiLieuCanCuItem[];

  // 4. Nội dung báo cáo do cán bộ biên tập & xác nhận
  noiDungTomTat: string;
  dienBienSuViecXacMinh: string;
  ketQuaLamViecCacBen: string;
  ketQuaKiemTraVatChungDauVet: string;
  danhGiaTinhCoCanCu: string;          // Khách quan, không tự kết luận tội danh thay CQĐT
  khoKhanVuongMac?: string;

  // 5. Cấu hình phân tách: Ý kiến sơ bộ (tùy biến theo nghiệp vụ được cấu hình)
  choPhepKemDeXuat: boolean;           // Nếu true: cho phép ghi nhận ý kiến đề xuất sơ bộ trong cùng báo cáo
  yKienDeXuatSoBo?: string;            // Đề xuất: Chuyển CQĐT cấp huyện / Xử phạt hành chính / Tiếp tục xác minh

  // 6. Điều kiện kiểm tra trước khi trình
  dieuKienTrinh: {
    daDuKetQuaXacMinh: boolean;
    daDinhKemTaiLieuCanCu: boolean;
    daKyXacNhanNoiDung: boolean;
  };

  // 7. Thông tin trình & phê duyệt
  nguoiKiemTra?: string;
  chucVuNguoiKiemTra?: string;
  ngayKiemTra?: string;
  yKienKiemTra?: string;

  nguoiPheDuyet?: string;
  chucVuNguoiPheDuyet?: string;
  ngayPheDuyet?: string;
  yKienPheDuyet?: string;

  // 8. Lịch sử sửa đổi & vết kiểm toán
  lichSuChinhSua: LichSuChinhSuaBaoCao[];
}
