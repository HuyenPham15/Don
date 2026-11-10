import React, { useState, useEffect, useMemo } from 'react';

export type LoaiTaiLieuKhongPhaiDon = 'van_ban' | 'bieu_mau' | 'minh_chung' | 'tai_lieu_khac';

export type PhuongAnXuLyTaiLieuType =
  | 'ghi_nhan_tai_lieu'
  | 'ghep_tai_lieu'
  | 'ghep_don'
  | 'chuyen_xu_ly_theo_doi'
  | 'yeu_cau_bo_sung_xac_minh'
  | 'chuyen_luong_tiep_nhan_don';

export const PHUONG_AN_XU_LY_LABELS: Record<PhuongAnXuLyTaiLieuType, string> = {
  ghi_nhan_tai_lieu: 'Ghi nhận thành tài liệu tiếp nhận',
  ghep_tai_lieu: 'Ghép vào tài liệu tiếp nhận đã tồn tại',
  ghep_don: 'Ghép vào đơn đã tồn tại',
  chuyen_xu_ly_theo_doi: 'Chuyển xử lý / theo dõi',
  yeu_cau_bo_sung_xac_minh: 'Yêu cầu bổ sung hoặc xác minh',
  chuyen_luong_tiep_nhan_don: 'Chuyển sang luồng tiếp nhận đơn',
};

export type NhomTraCuuLienQuan = 'tat_ca' | 'luot_nhan' | 'tai_lieu' | 'don' | 'vu_viec';

export interface ThongTinNhanDienTaiLieu {
  loaiTaiLieu: LoaiTaiLieuKhongPhaiDon;
  loaiTaiLieuLabel: string;
  tenTaiLieu: string;
  soKyHieu?: string;
  ngayLapBanHanh?: string;
  coQuanNguoiGui: string;
  nguoiDonViNhan?: string;
  dinhDangTaiLieu: string;
  tinhTrangTaiLieu: string;
}

export interface TomTatPhanTichNoiDung {
  tomTatChinh: string;
  chuDe: string;
  mucDich: string;
  thongTinQuanTrong: string[];
  caNhanToChucLienQuan: { ten: string; vaiTro: string; dinhDanh?: string }[];
  thoiGianDiaDiemSuKienSoLieu: { nhan: string; giaTri: string; viTri?: string }[];
  yeuCauTrachNhiemThoiHan?: string;
}

export interface PhanTichVanBanChuyenBiet {
  coQuanBanHanh: string;
  trichYeuNoiDung: string;
  mucDichBanHanh: string;
  noiDungThongBaoChiDaoYeuCau: string;
  donViCaNhanChiuTrachNhiem: string;
  thoiHanThucHien?: string;
  ketQuaCanThucHien?: string;
}

export interface PhanTichBieuMauChuyenBiet {
  tenVaLoaiBieuMau: string;
  tongSoTruong: number;
  cacTruongThongTin: string[];
  truongDaDien: { tenTruong: string; giaTri: string }[];
  truongChuaDien: string[];
  truongKhongHopLeHoacMauThuan: { tenTruong: string; vanDe: string; canCu: string }[];
  mucDichSuDung?: string;
}

export interface PhanTichMinhChungChuyenBiet {
  loaiMinhChung: string;
  noiDungTheHien: string;
  suKienTinhTietPhanAnh: string;
  nguoiToChucDiaDiemThoiGian: string[];
  moiLienHeHoSoKhac: string;
  thongTinChuaTheXacDinh: string[];
}

export interface PhanTichTaiLieuKhacChuyenBiet {
  chuDe: string;
  mucDichTaiLieu: string;
  thongTinQuanTrong: string[];
  chuTheLienQuan: string[];
  noiDungCanLuuYTheoDoi: string[];
}

export interface CanhBaoKiemTraTaiLieu {
  id: string;
  nhomKiemTra:
    | 'chat_luong_ocr'
    | 'thieu_trang_bi_cat'
    | 'thieu_thong_tin_nhan_dien'
    | 'mau_thuan_du_lieu'
    | 'trung_lap_tai_lieu'
    | 'can_can_bo_kiem_tra';
  nhomLabel: string;
  mucDo: 'tot' | 'canh_bao' | 'nghiem_trong';
  noiDungCuThe: string;
  canCuTuTaiLieu: string;
  fileIndex?: number;
  highlightKey?: string;
}

export interface KetQuaTraCuuLienQuanItem {
  id: string;
  nhom: 'luot_nhan' | 'tai_lieu' | 'don' | 'vu_viec';
  nhomLabel: string;
  maHoSoTaiLieu: string;
  tenHoacTomTat: string;
  ngayTiepNhan: string;
  nguoiGuiHoacDonVi: string;
  trangThai: string;
  chuaLienKetDon?: boolean;
  lyDoLienQuan: string;
  danChungCuThe: string[];
  doTuongDong?: number;
  doTinCayAI?: string;
  chiTietHoSo: {
    donViPhuTrach: string;
    canBoXuLy: string;
    tepDinhKem: string[];
    ghiChuHoSo: string;
  };
}

export interface DeXuatXuLyTaiLieuItem {
  phuongAn: PhuongAnXuLyTaiLieuType;
  tenPhuongAn: string;
  isRecommended?: boolean;
  doTinCay?: string;
  lyDoDeXuat: string;
  duLieuLamCanCu: string[];
  thongTinCanCanBoXacNhan: string;
  targetCodeSuggested?: string;
}

export interface KichBanTaiLieuKhongPhaiDon {
  id: LoaiTaiLieuKhongPhaiDon;
  maKichBan: string;
  tenKichBan: string;
  moTaNgan: string;
  doTinCayPhanLoaiKhongPhaiDon: string;
  lyDoKhongPhaiDon: string[];
  nhanDien: ThongTinNhanDienTaiLieu;
  tomTatNoiDung: TomTatPhanTichNoiDung;
  chuyenBietVanBan?: PhanTichVanBanChuyenBiet;
  chuyenBietBieuMau?: PhanTichBieuMauChuyenBiet;
  chuyenBietMinhChung?: PhanTichMinhChungChuyenBiet;
  chuyenBietTaiLieuKhac?: PhanTichTaiLieuKhacChuyenBiet;
  kiemTraTaiLieu: CanhBaoKiemTraTaiLieu[];
  traCuuLienQuan: KetQuaTraCuuLienQuanItem[];
  deXuatXuLy: DeXuatXuLyTaiLieuItem[];
}

export const KICH_BAN_TAI_LIEU_MAP: Record<LoaiTaiLieuKhongPhaiDon, KichBanTaiLieuKhongPhaiDon> = {
  // ============================================================================
  // 1. TÀI LIỆU MINH CHỨNG (TC03, TC05, TC06: Chứng từ / Biên bản / Hình ảnh minh chứng)
  // ============================================================================
  minh_chung: {
    id: 'minh_chung',
    maKichBan: 'TC03 • TC05 • TC06',
    tenKichBan: 'Tài liệu minh chứng (Hợp đồng, Báo giá & Ảnh hiện trường)',
    moTaNgan: 'Chứng từ giao nhận vật tư & biên bản hiện trường gửi rời, liên quan đến Tài liệu tiếp nhận cũ TL-2026-0084 và Đơn Đ-2026-00125',
    doTinCayPhanLoaiKhongPhaiDon: '97.4%',
    lyDoKhongPhaiDon: [
      'Không có tiêu đề đơn và không có nội dung khiếu nại, tố cáo, kiến nghị hay phản ánh.',
      'Không chứa yêu cầu cơ quan nhà nước giải quyết một vấn đề hành chính hay tư pháp cụ thể.',
      'Bản chất là bộ chứng từ giao dịch vật tư và bảng điều chỉnh đơn giá cung cấp thông tin minh chứng.',
    ],
    nhanDien: {
      loaiTaiLieu: 'minh_chung',
      loaiTaiLieuLabel: 'Tài liệu minh chứng',
      tenTaiLieu: 'Hợp đồng kinh tế cung ứng vật tư xây dựng & Thông báo điều chỉnh bảng báo giá VLXD Quý III/2026',
      soKyHieu: '18/2026/HĐKT-MK',
      ngayLapBanHanh: '02/08/2026 (Phụ lục báo giá ngày 05/09/2026)',
      coQuanNguoiGui: 'Công ty TNHH Vật liệu Xây dựng Minh Khôi (Đại diện: Ông Lê Quốc Khánh - Giám đốc)',
      nguoiDonViNhan: 'Ban Điều hành Gói thầu hạ tầng số 04 - Công ty CP Đầu tư Phát triển Đô thị X',
      dinhDangTaiLieu: 'PDF Scan có dấu đỏ pháp nhân (02 tệp • 2.25 MB)',
      tinhTrangTaiLieu: 'Đầy đủ trang, chữ ký và con dấu rõ nét; không kèm công văn hay đơn dẫn chiếu',
    },
    tomTatNoiDung: {
      tomTatChinh:
        'Bộ tài liệu gồm Hợp đồng kinh tế số 18/2026/HĐKT-MK ký ngày 02/08/2026 giữa Công ty TNHH VLXD Minh Khôi (Bên A) và Ban Điều hành Gói thầu hạ tầng số 04 - Công ty CP Đầu tư Phát triển Đô thị X (Bên B) về việc cung cấp xi măng, thép xây dựng và cát san lấp phục vụ thi công Giai đoạn 2 tại Dự án Khu đô thị mới Y, kèm theo Thông báo điều chỉnh đơn giá vật liệu xây dựng áp dụng từ ngày 05/09/2026.',
      chuDe: 'Giao dịch cung ứng vật tư san lấp mặt bằng và điều chỉnh đơn giá vật liệu xây dựng tại Dự án KĐT mới Y',
      mucDich: 'Xác lập nghĩa vụ giao nhận vật tư xây dựng, đơn giá thanh toán và tiến độ cung ứng tại công trường Lô TT-02 KĐT mới Y',
      thongTinQuanTrong: [
        'Tổng giá trị hợp đồng tạm tính: 1.485.000.000 VNĐ (đã bao gồm thuế GTGT 10% và vận chuyển đến chân công trình).',
        'Địa điểm tập kết vật tư: Kho bãi công trường Lô TT-02, Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông.',
        'Đơn giá cát vàng san lấp điều chỉnh tăng từ 410.000 đ/m³ lên 425.000 đ/m³; thép CB240-T tăng từ 14.650 đ/kg lên 14.900 đ/kg.',
      ],
      caNhanToChucLienQuan: [
        {
          ten: 'Công ty TNHH Vật liệu Xây dựng Minh Khôi',
          vaiTro: 'Bên bán / Đơn vị gửi tài liệu',
          dinhDanh: 'MST: 0108923471 • Đ/c: CCN Yên Nghĩa, Hà Đông',
        },
        {
          ten: 'Công ty CP Đầu tư Phát triển Đô thị X (Ban ĐH Gói thầu 04)',
          vaiTro: 'Bên mua vật tư trên hợp đồng',
          dinhDanh: 'MST: 0105519820',
        },
        {
          ten: 'Ông Lê Quốc Khánh',
          vaiTro: 'Giám đốc Công ty TNHH VLXD Minh Khôi (Người ký Bên A)',
          dinhDanh: 'SĐT: 0243 998 1122',
        },
        {
          ten: 'Ông Phạm Đức Tùng',
          vaiTro: 'Chỉ huy trưởng Gói thầu hạ tầng số 04 (Người ký Bên B)',
        },
      ],
      thoiGianDiaDiemSuKienSoLieu: [
        {
          nhan: 'Ngày ký kết hợp đồng',
          giaTri: '02/08/2026 (HĐ số 18/2026/HĐKT-MK)',
          viTri: 'Trang 1, góc phải dưới Quốc hiệu',
        },
        {
          nhan: 'Thời hạn giao nhận vật tư',
          giaTri: 'Chia làm 03 đợt từ 05/08/2026 đến 10/09/2026',
          viTri: 'Trang 1, Điều 2 Khoản 2.1',
        },
        {
          nhan: 'Địa điểm giao hàng',
          giaTri: 'Kho bãi công trường Lô TT-02, Dự án KĐT mới Y, phường Mộ Lao, quận Hà Đông',
          viTri: 'Trang 1, Thông tin Bên B',
        },
        {
          nhan: 'Số liệu giá trị & tạm ứng',
          giaTri: 'Giá trị 1.485.000.000 VNĐ • Tạm ứng 30% trong 05 ngày làm việc, thanh toán 70% trong 15 ngày sau nghiệm thu',
          viTri: 'Trang 1, Điều 1 & Điều 2',
        },
      ],
      yeuCauTrachNhiemThoiHan:
        'Bên A có trách nhiệm giao đủ khối lượng vật tư theo phiếu yêu cầu của Ban chỉ huy công trường từ 05/08/2026 đến 10/09/2026; Bên B có trách nhiệm nghiệm thu và thanh toán 70% giá trị còn lại trong vòng 15 ngày kể từ khi ký biên bản nghiệm thu từng đợt.',
    },
    chuyenBietMinhChung: {
      loaiMinhChung: 'Chứng từ hợp đồng kinh tế, phụ lục thông báo giá và tài liệu đối chiếu khối lượng san lấp',
      noiDungTheHien:
        'Thể hiện thỏa thuận cung cấp vật tư san lấp hạ tầng Giai đoạn 2 giữa nhà cung ứng (Công ty Minh Khôi) và nhà thầu/chủ đầu tư (Công ty CP ĐTPT Đô thị X) cùng bảng điều chỉnh tăng đơn giá vật liệu Quý III/2026.',
      suKienTinhTietPhanAnh:
        'Quá trình tập kết vật tư và thi công san lấp mặt bằng tại khu vực Lô TT-02 thuộc Dự án Khu đô thị mới Y trong tháng 08–09/2026.',
      nguoiToChucDiaDiemThoiGian: [
        'Tổ chức: Công ty TNHH VLXD Minh Khôi (MST 0108923471) & Công ty CP ĐTPT Đô thị X (MST 0105519820).',
        'Cá nhân ký tên: Ông Lê Quốc Khánh (Giám đốc Bên A) & Ông Phạm Đức Tùng (Chỉ huy trưởng Bên B).',
        'Địa điểm: Lô TT-02, Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông, TP. Hà Nội.',
        'Thời gian: Ký ngày 02/08/2026; thực hiện giao hàng 05/08/2026 – 10/09/2026; điều chỉnh giá 05/09/2026.',
      ],
      moiLienHeHoSoKhac:
        'Trùng khớp trực tiếp với: (1) Tài liệu tiếp nhận độc lập mã TL-2026-0084 (Phiếu xuất kho & Biên bản giao nhận vật tư đợt 1 ngày 12/08/2026 do Công ty Minh Khôi gửi trước đó, chưa gắn đơn); (2) Đơn Đ-2026-00125 và Vụ việc VV-2026-0042 đang xác minh hoạt động san lấp mặt bằng tại Dự án KĐT mới Y (trùng MST 0105519820, trùng địa điểm Lô TT-02 KĐT mới Y và trùng tên Chỉ huy trưởng Phạm Đức Tùng).',
      thongTinChuaTheXacDinh: [
        'Chưa xác định được khối lượng vật tư thực tế đã nghiệm thu của đợt 2 và đợt 3 (do chưa có biên bản nghiệm thu khối lượng kèm theo).',
        'Chưa xác định người gửi bưu phẩm muốn bổ sung cho Tài liệu tiếp nhận TL-2026-0084 hay gửi theo Phiếu yêu cầu cung cấp tài liệu số 14/PYC-ĐXM của Đoàn xác minh.',
      ],
    },
    kiemTraTaiLieu: [
      {
        id: 'chk-mc-1',
        nhomKiemTra: 'chat_luong_ocr',
        nhomLabel: 'Chất lượng OCR & Khả năng đọc',
        mucDo: 'tot',
        noiDungCuThe: 'Độ rõ nét đạt 98.6% trên cả 02 tệp PDF; nhận diện đầy đủ bảng biểu đơn giá, chữ ký và con dấu pháp nhân.',
        canCuTuTaiLieu: 'Tệp #1 (Hop_dong_cung_ung_vat_tu_so_18_2026.pdf) & Tệp #2 (Bang_bao_gia_VLXD.pdf)',
        fileIndex: 0,
      },
      {
        id: 'chk-mc-2',
        nhomKiemTra: 'thieu_thong_tin_nhan_dien',
        nhomLabel: 'Kiểm tra văn bản dẫn chiếu đi kèm',
        mucDo: 'canh_bao',
        noiDungCuThe: 'Tài liệu được gửi rời qua bưu chính, không có Công văn gửi kèm và không ghi mã hồ sơ/vụ việc tham chiếu trên bì thư.',
        canCuTuTaiLieu: 'Trang 1 Hợp đồng số 18/2026/HĐKT-MK (Chỉ có tiêu đề Hợp đồng kinh tế antara Bên A và Bên B)',
        fileIndex: 0,
        highlightKey: 'nguoiGui',
      },
      {
        id: 'chk-mc-3',
        nhomKiemTra: 'trung_lap_tai_lieu',
        nhomLabel: 'Phát hiện tài liệu cùng bộ chứng từ đã tiếp nhận',
        mucDo: 'canh_bao',
        noiDungCuThe: 'Phát hiện 01 Tài liệu tiếp nhận trước đó (Mã TL-2026-0084 ngày 18/08/2026) là "Biên bản giao nhận vật tư đợt 1 theo HĐ số 18/2026/HĐKT-MK" của cùng Công ty TNHH VLXD Minh Khôi.',
        canCuTuTaiLieu: 'Đối chiếu số hiệu hợp đồng "18/2026/HĐKT-MK" và MST "0108923471" tại Phần đầu Hợp đồng',
        fileIndex: 0,
        highlightKey: 'noiDung',
      },
      {
        id: 'chk-mc-4',
        nhomKiemTra: 'can_can_bo_kiem_tra',
        nhomLabel: 'Nội dung cần cán bộ kiểm tra lại',
        mucDo: 'canh_bao',
        noiDungCuThe: 'Cán bộ cần kiểm tra xem bộ hợp đồng này được gửi để ghép hoàn thiện với Tài liệu tiếp nhận TL-2026-0084 hay ghép làm tài liệu minh chứng cho Đơn Đ-2026-00125 (Vụ việc VV-2026-0042).',
        canCuTuTaiLieu: 'Mục Bên B (Công ty CP ĐTPT Đô thị X - MST 0105519820) & Địa điểm Lô TT-02 Dự án KĐT mới Y',
        fileIndex: 0,
        highlightKey: 'doiTuong',
      },
    ],
    traCuuLienQuan: [
      {
        id: 'tc-tl-1',
        nhom: 'tai_lieu',
        nhomLabel: 'Tài liệu tiếp nhận đã tồn tại (Chưa gắn đơn)',
        maHoSoTaiLieu: 'TL-2026-0084',
        tenHoacTomTat: 'Biên bản giao nhận vật tư xây dựng đợt 1 & Phiếu xuất kho ngày 12/08/2026 (Thuộc HĐKT số 18/2026/HĐKT-MK)',
        ngayTiepNhan: '18/08/2026',
        nguoiGuiHoacDonVi: 'Công ty TNHH Vật liệu Xây dựng Minh Khôi (MST: 0108923471)',
        trangThai: 'Đã ghi nhận tài liệu • Chưa liên kết đơn',
        chuaLienKetDon: true,
        lyDoLienQuan: 'Cùng đơn vị gửi (Công ty Minh Khôi) và dẫn chiếu trực tiếp đến số Hợp đồng 18/2026/HĐKT-MK ngày 02/08/2026.',
        danChungCuThe: [
          'Trùng 100% số hiệu hợp đồng gốc: "18/2026/HĐKT-MK ngày 02/08/2026".',
          'Trùng 100% pháp nhân gửi: Công ty TNHH VLXD Minh Khôi (MST: 0108923471) và Giám đốc Lê Quốc Khánh.',
          'Tài liệu TL-2026-0084 đang thiếu bản gốc Hợp đồng 18/2026/HĐKT-MK (lượt nhận hiện tại chính là bản hợp đồng gốc đó).',
        ],
        doTuongDong: 98,
        doTinCayAI: '98.2%',
        chiTietHoSo: {
          donViPhuTrach: 'Phòng Tiếp công dân & Xử lý đơn (Kho tài liệu tiếp nhận)',
          canBoXuLy: 'Nguyễn Minh Anh',
          tepDinhKem: ['Bien_ban_giao_nhan_dot_1_12_08_2026.pdf', 'Phieu_xuat_kho_MK_084.pdf'],
          ghiChuHoSo: 'Tài liệu được tạo từ lượt nhận LN-42/2026-GOVEX ngày 18/08/2026, đang lưu ở trạng thái Tài liệu tiếp nhận độc lập chờ bổ sung hợp đồng chính.',
        },
      },
      {
        id: 'tc-don-1',
        nhom: 'don',
        nhomLabel: 'Đơn liên quan đang thụ lý',
        maHoSoTaiLieu: 'Đ-2026-00125',
        tenHoacTomTat: 'Phản ánh, tố cáo sai phạm trong bồi thường GPMB và san lấp hạ tầng tại Dự án Khu đô thị mới Y, phường Mộ Lao, quận Hà Đông',
        ngayTiepNhan: '12/09/2026',
        nguoiGuiHoacDonVi: 'Bà Vũ Thị Thanh & Ông Nguyễn Văn A',
        trangThai: 'Đang xác minh',
        lyDoLienQuan: 'Trùng pháp nhân Bên Mua (Công ty CP ĐTPT Đô thị X - MST 0105519820), trùng địa điểm thi công (Dự án KĐT mới Y) và trùng người đại diện công trường (Ông Phạm Đức Tùng).',
        danChungCuThe: [
          'Dẫn chứng 1 (Pháp nhân): Bên B trong hợp đồng là Công ty CP ĐTPT Đô thị X (MST 0105519820) trùng 100% với chủ đầu tư có liên quan trong đơn Đ-2026-00125.',
          'Dẫn chứng 2 (Địa điểm): Kho bãi Lô TT-02 Dự án KĐT mới Y, phường Mộ Lao nằm sát khu đất số 48 đang được kiểm tra hiện trạng.',
          'Dẫn chứng 3 (Nhân sự): Ông Phạm Đức Tùng (Chỉ huy trưởng ký Bên B) có tên trong Biên bản làm việc hiện trường ngày 18/05/2026.',
        ],
        doTuongDong: 95,
        doTinCayAI: '95.8%',
        chiTietHoSo: {
          donViPhuTrach: 'Phòng Tiếp công dân & Thanh tra quận Hà Đông',
          canBoXuLy: 'Nguyễn Minh Anh',
          tepDinhKem: ['Don_goc_Đ_2026_00125.pdf', 'Trich_luc_ban_do_thua_48.pdf'],
          ghiChuHoSo: 'Đang trong quá trình thu thập hồ sơ, chứng từ san lấp mặt bằng tại Dự án KĐT mới Y.',
        },
      },
      {
        id: 'tc-vv-1',
        nhom: 'vu_viec',
        nhomLabel: 'Vụ việc liên quan',
        maHoSoTaiLieu: 'VV-2026-0042',
        tenHoacTomTat: 'Hồ sơ vụ việc kiểm tra công tác GPMB và thi công hạ tầng Giai đoạn 2 tại Dự án Khu đô thị mới Y (QĐ số 89/QĐ-UBND)',
        ngayTiepNhan: '05/09/2026',
        nguoiGuiHoacDonVi: 'Đoàn kiểm tra liên ngành quận Hà Đông',
        trangThai: 'Đang thu thập tài liệu minh chứng',
        lyDoLienQuan: 'Đoàn kiểm tra đã ban hành Phiếu yêu cầu số 14/PYC-ĐXM ngày 10/09/2026 đề nghị cung cấp hợp đồng cung ứng vật tư và báo giá san lấp Quý III/2026 tại KĐT mới Y.',
        danChungCuThe: [
          'Khớp nội dung Phiếu yêu cầu số 14/PYC-ĐXM ngày 10/09/2026 về việc thu thập Hợp đồng vật tư Gói thầu hạ tầng số 04.',
          'Khớp giai đoạn cung ứng vật tư từ 05/08/2026 đến 10/09/2026.',
        ],
        doTuongDong: 94,
        doTinCayAI: '96.0%',
        chiTietHoSo: {
          donViPhuTrach: 'Đoàn kiểm tra theo QĐ 89/QĐ-UBND',
          canBoXuLy: 'Trần Hoàng Long (Tổ trưởng)',
          tepDinhKem: ['QD_89_UBND_Thanh_lap_doan.pdf', 'Phieu_yeu_cau_14_PYC_DXM.pdf'],
          ghiChuHoSo: 'Đang chờ các nhà thầu và đơn vị cung ứng nộp bản sao hợp đồng vật tư.',
        },
      },
      {
        id: 'tc-ln-1',
        nhom: 'luot_nhan',
        nhomLabel: 'Lượt nhận liên quan trước đó',
        maHoSoTaiLieu: 'LN-42/2026-GOVEX',
        tenHoacTomTat: 'Lượt nhận bưu chính từ Công ty TNHH VLXD Minh Khôi gửi Biên bản giao nhận vật tư đợt 1',
        ngayTiepNhan: '18/08/2026',
        nguoiGuiHoacDonVi: 'Công ty TNHH Vật liệu Xây dựng Minh Khôi',
        trangThai: 'Đã chuyển thành tài liệu TL-2026-0084',
        lyDoLienQuan: 'Cùng người gửi, cùng số điện thoại 0243 998 1122 và cùng địa chỉ Lô B4 CCN Yên Nghĩa.',
        danChungCuThe: [
          'Trùng 100% thông tin đơn vị gửi trên phong bì bưu chính VNPost.',
          'Lượt nhận LN-42/2026-GOVEX đã được ghi nhận thành tài liệu TL-2026-0084.',
        ],
        doTuongDong: 96,
        doTinCayAI: '97.5%',
        chiTietHoSo: {
          donViPhuTrach: 'Bộ phận Tiếp nhận Một cửa',
          canBoXuLy: 'Nguyễn Minh Anh',
          tepDinhKem: ['Phieu_buu_chinh_LN42.pdf'],
          ghiChuHoSo: 'Lượt nhận trước của cùng doanh nghiệp.',
        },
      },
    ],
    deXuatXuLy: [
      {
        phuongAn: 'ghep_don',
        tenPhuongAn: 'Ghép vào đơn đã tồn tại (Đ-2026-00125)',
        isRecommended: true,
        doTinCay: '95.8%',
        lyDoDeXuat:
          'Tài liệu chứa thông tin về đơn giá và khối lượng vật tư san lấp của Công ty CP ĐTPT Đô thị X (MST 0105519820) tại Lô TT-02 Dự án KĐT mới Y, khớp với nội dung đang xác minh tại đơn Đ-2026-00125 (Vụ việc VV-2026-0042). Ghép vào đơn hiện có để làm tài liệu minh chứng, không tạo thêm đơn mới.',
        duLieuLamCanCu: [
          'Bên Mua trong hợp đồng là Công ty CP ĐTPT Đô thị X (MST: 0105519820) — trùng chủ đầu tư liên quan trong đơn Đ-2026-00125.',
          'Địa điểm giao nhận tại Lô TT-02 Dự án KĐT mới Y, phường Mộ Lao, quận Hà Đông.',
          'Người ký nhận Bên B là Ông Phạm Đức Tùng (Chỉ huy trưởng Gói thầu số 04).',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghép tài liệu vào hồ sơ đơn Đ-2026-00125 dưới dạng "Tài liệu minh chứng bổ sung" (không sinh mã đơn mới).',
        targetCodeSuggested: 'Đ-2026-00125',
      },
      {
        phuongAn: 'ghep_tai_lieu',
        tenPhuongAn: 'Ghép vào tài liệu tiếp nhận đã tồn tại (TL-2026-0084)',
        doTinCay: '94.2%',
        lyDoDeXuat:
          'Ghép nối tiếp vào Tài liệu tiếp nhận đã tồn tại TL-2026-0084 (Biên bản giao nhận vật tư đợt 1 ngày 18/08/2026 của cùng Công ty TNHH VLXD Minh Khôi, hiện chưa gắn đơn) để hoàn thiện bộ chứng từ Hợp đồng 18/2026/HĐKT-MK.',
        duLieuLamCanCu: [
          'Trùng 100% số hiệu hợp đồng dẫn chiếu: 18/2026/HĐKT-MK ngày 02/08/2026.',
          'Trùng pháp nhân gửi: Công ty TNHH VLXD Minh Khôi (MST: 0108923471).',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghép vào hồ sơ Tài liệu tiếp nhận TL-2026-0084 (không tạo đơn mới).',
        targetCodeSuggested: 'TL-2026-0084',
      },
      {
        phuongAn: 'ghi_nhan_tai_lieu',
        tenPhuongAn: 'Ghi nhận thành tài liệu tiếp nhận độc lập',
        doTinCay: '90.5%',
        lyDoDeXuat:
          'Ghi nhận lượt nhận thành một bản ghi Tài liệu tiếp nhận mới trong Kho tài liệu tiếp nhận (cấp mã TL-2026-0119) để quản lý độc lập theo luồng tài liệu, tuyệt đối không tạo đơn mới.',
        duLieuLamCanCu: [
          'Tài liệu đủ thông tin nhận diện: Số hiệu 18/2026/HĐKT-MK, ngày lập 02/08/2026, đơn vị gửi Công ty TNHH VLXD Minh Khôi.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghi nhận thành Tài liệu tiếp nhận mới (không tạo đơn, không khởi chạy quy trình xử lý đơn).',
        targetCodeSuggested: 'TL-2026-0119',
      },
      {
        phuongAn: 'yeu_cau_bo_sung_xac_minh',
        tenPhuongAn: 'Yêu cầu bổ sung hoặc xác minh (Làm rõ biên bản nghiệm thu đợt 2, 3)',
        doTinCay: '85.0%',
        lyDoDeXuat:
          'Tài liệu mới có hợp đồng và bảng điều chỉnh báo giá, chưa có biên bản nghiệm thu khối lượng thực tế đợt 2 và đợt 3 như quy định tại Điều 2 của hợp đồng.',
        duLieuLamCanCu: [
          'Điều 2 Hợp đồng quy định giao hàng làm 03 đợt từ 05/08/2026 đến 10/09/2026 nhưng chưa kèm biên bản nghiệm thu đợt 2, 3.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận gửi thông báo đề nghị Công ty TNHH VLXD Minh Khôi cung cấp bổ sung biên bản nghiệm thu khối lượng đợt 2, 3.',
        targetCodeSuggested: 'TL-2026-0084',
      },
      {
        phuongAn: 'chuyen_luong_tiep_nhan_don',
        tenPhuongAn: 'Chuyển sang luồng tiếp nhận đơn (Nếu cán bộ xác định có nội dung đơn)',
        doTinCay: 'Dành cho cán bộ quyết định',
        lyDoDeXuat:
          'Sử dụng khi cán bộ kiểm tra trực tiếp và xác định tài liệu có kèm nội dung kiến nghị, phản ánh hoặc yêu cầu cơ quan nhà nước giải quyết quyền lợi.',
        duLieuLamCanCu: [
          'Quyền quyết định nghiệp vụ của cán bộ tiếp nhận khi phát hiện yếu tố đơn thư trong hồ sơ.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận chuyển lượt nhận này sang màn hình Phân tích & Tiếp nhận đơn.',
      },
    ],
  },

  // ============================================================================
  // 2. VĂN BẢN CỦA CƠ QUAN KHÁC (TC01: Văn bản thông báo / Phối hợp hành chính)
  // ============================================================================
  van_ban: {
    id: 'van_ban',
    maKichBan: 'TC01',
    tenKichBan: 'Văn bản của cơ quan khác (Thông báo kế hoạch kiểm tra)',
    moTaNgan: 'Công văn số 412/TB-SXD của Sở Xây dựng thông báo lịch phối hợp kiểm tra định kỳ trật tự xây dựng Quý III/2026',
    doTinCayPhanLoaiKhongPhaiDon: '99.1%',
    lyDoKhongPhaiDon: [
      'Là văn bản hành chính thông báo kế hoạch phối hợp công tác giữa các cơ quan nhà nước (Sở Xây dựng gửi UBND quận).',
      'Hoàn toàn không chứa nội dung khiếu nại, tố cáo, kiến nghị hay phản ánh của công dân/tổ chức.',
    ],
    nhanDien: {
      loaiTaiLieu: 'van_ban',
      loaiTaiLieuLabel: 'Văn bản hành chính',
      tenTaiLieu: 'Thông báo về việc phối hợp kiểm tra định kỳ công tác quản lý trật tự xây dựng và an toàn thi công Quý III/2026',
      soKyHieu: '412/TB-SXD',
      ngayLapBanHanh: '10/09/2026',
      coQuanNguoiGui: 'Sở Xây dựng TP. Hà Nội (Ký bởi: Phó Giám đốc Nguyễn Trọng Hải)',
      nguoiDonViNhan: 'UBND quận Hà Đông; Phòng Quản lý Đô thị; Đội Quản lý TTXD Đô thị quận',
      dinhDangTaiLieu: 'PDF ký số chuyên dùng Chính phủ (01 tệp • 640 KB)',
      tinhTrangTaiLieu: 'Bản điện tử nguyên vẹn, chữ ký số hợp lệ, đầy đủ 02/02 trang',
    },
    tomTatNoiDung: {
      tomTatChinh:
        'Sở Xây dựng TP. Hà Nội thông báo lịch làm việc và đề nghị UBND quận Hà Đông phối hợp kiểm tra định kỳ công tác quản lý trật tự xây dựng, an toàn lao động tại 05 dự án khu đô thị trên địa bàn quận trong Quý III/2026, đồng thời yêu cầu gửi báo cáo số liệu trước ngày 25/09/2026.',
      chuDe: 'Phối hợp kiểm tra định kỳ công tác quản lý trật tự xây dựng Quý III/2026',
      mucDich: 'Thông báo lịch kiểm tra liên ngành và yêu cầu đơn vị địa phương chuẩn bị hồ sơ, báo cáo số liệu phục vụ đoàn công tác',
      thongTinQuanTrong: [
        'Thời gian Đoàn kiểm tra Sở Xây dựng làm việc tại quận Hà Đông: Từ ngày 28/09/2026 đến ngày 30/09/2026.',
        'Phạm vi kiểm tra: 05 dự án đầu tư xây dựng khu đô thị mới trên địa bàn phường Mộ Lao, Dương Nội, Yên Nghĩa.',
        'Thời hạn gửi báo cáo tự kiểm tra và danh mục giấy phép xây dựng: Trước 17h00 ngày 25/09/2026.',
      ],
      caNhanToChucLienQuan: [
        { ten: 'Sở Xây dựng TP. Hà Nội', vaiTro: 'Cơ quan ban hành văn bản', dinhDanh: 'Số hiệu: 412/TB-SXD' },
        { ten: 'Ông Nguyễn Trọng Hải', vaiTro: 'Phó Giám đốc Sở Xây dựng (Người ký)', dinhDanh: 'Chữ ký số VGCA hợp lệ' },
        { ten: 'UBND quận Hà Đông & Phòng Quản lý Đô thị', vaiTro: 'Đơn vị nhận & chịu trách nhiệm phối hợp' },
      ],
      thoiGianDiaDiemSuKienSoLieu: [
        { nhan: 'Ngày ban hành văn bản', giaTri: '10/09/2026', viTri: 'Phần đầu văn bản' },
        { nhan: 'Hạn nộp báo cáo chuẩn bị', giaTri: 'Trước 17h00 ngày 25/09/2026', viTri: 'Mục 2, Trang 1' },
        { nhan: 'Thời gian kiểm tra thực địa', giaTri: '28/09/2026 – 30/09/2026 (03 ngày làm việc)', viTri: 'Mục 1, Trang 1' },
        { nhan: 'Số lượng dự án kiểm tra', giaTri: '05 dự án khu đô thị trên địa bàn quận Hà Đông', viTri: 'Phụ lục đính kèm' },
      ],
      yeuCauTrachNhiemThoiHan:
        'Giao Phòng Quản lý Đô thị và Đội Quản lý TTXD Đô thị quận Hà Đông lập báo cáo tổng hợp tình hình cấp phép, kiểm tra sau cấp phép Quý III/2026 và cử đại diện tham gia Đoàn kiểm tra; hoàn thành gửi báo cáo về Sở Xây dựng trước ngày 25/09/2026.',
    },
    chuyenBietVanBan: {
      coQuanBanHanh: 'Sở Xây dựng TP. Hà Nội (Thanh tra Sở tham mưu)',
      trichYeuNoiDung: 'V/v phối hợp kiểm tra định kỳ công tác quản lý trật tự xây dựng và an toàn thi công Quý III/2026 trên địa bàn quận Hà Đông',
      mucDichBanHanh: 'Thông báo kế hoạch kiểm tra định kỳ và phân công chuẩn bị hồ sơ, báo cáo phục vụ đoàn kiểm tra',
      noiDungThongBaoChiDaoYeuCau:
        '1. Tổ chức kiểm tra thực địa tại 05 dự án từ 28/09–30/09/2026; 2. Đề nghị UBND quận chỉ đạo Phòng QLĐT chuẩn bị hồ sơ pháp lý và báo cáo theo đề cương; 3. Cử 02 cán bộ chuyên môn tham gia phối hợp cùng Đoàn.',
      donViCaNhanChiuTrachNhiem: 'Phòng Quản lý Đô thị quận Hà Đông (Chủ trì) & Đội Quản lý TTXD Đô thị (Phối hợp)',
      thoiHanThucHien: 'Gửi báo cáo trước 17h00 ngày 25/09/2026; Phối hợp kiểm tra từ 28/09 đến 30/09/2026',
      ketQuaCanThucHien: '01 Báo cáo tổng hợp tình hình trật tự xây dựng Quý III/2026 và Danh sách cán bộ tham gia đoàn công tác',
    },
    kiemTraTaiLieu: [
      {
        id: 'chk-vb-1',
        nhomKiemTra: 'chat_luong_ocr',
        nhomLabel: 'Chất lượng OCR & Chữ ký số',
        mucDo: 'tot',
        noiDungCuThe: 'Văn bản điện tử PDF lớp văn bản gốc (100% độ chính xác OCR), xác thực thành công chữ ký số của Sở Xây dựng TP. Hà Nội.',
        canCuTuTaiLieu: 'Trang 1 & Trang 2 tệp Thong_bao_412_TB_SXD.pdf',
      },
      {
        id: 'chk-vb-2',
        nhomKiemTra: 'can_can_bo_kiem_tra',
        nhomLabel: 'Lưu ý thời hạn thực hiện trong văn bản',
        mucDo: 'canh_bao',
        noiDungCuThe: 'Văn bản có thời hạn yêu cầu gửi báo cáo trước ngày 25/09/2026 nhưng được gửi vào luồng tiếp nhận đơn; cần chuyển ngay cho Phòng Quản lý Đô thị để kịp tiến độ.',
        canCuTuTaiLieu: 'Mục 2: "Đề nghị gửi báo cáo bằng văn bản về Sở Xây dựng trước ngày 25/09/2026"',
      },
    ],
    traCuuLienQuan: [
      {
        id: 'tc-vb-tl1',
        nhom: 'tai_lieu',
        nhomLabel: 'Tài liệu tiếp nhận đã tồn tại (Chưa gắn đơn)',
        maHoSoTaiLieu: 'TL-2026-0061',
        tenHoacTomTat: 'Kế hoạch số 198/KH-SXD ngày 15/01/2026 của Sở Xây dựng về kiểm tra trật tự xây dựng năm 2026',
        ngayTiepNhan: '18/01/2026',
        nguoiGuiHoacDonVi: 'Sở Xây dựng TP. Hà Nội',
        trangThai: 'Đang theo dõi định kỳ • Chưa gắn đơn',
        chuaLienKetDon: true,
        lyDoLienQuan: 'Thông báo 412/TB-SXD dẫn chiếu trực tiếp căn cứ thực hiện theo Kế hoạch số 198/KH-SXD ngày 15/01/2026.',
        danChungCuThe: [
          'Phần căn cứ tại dòng 2 Thông báo 412/TB-SXD ghi rõ: "Thực hiện Kế hoạch số 198/KH-SXD ngày 15/01/2026".',
        ],
        doTuongDong: 95,
        doTinCayAI: '96.5%',
        chiTietHoSo: {
          donViPhuTrach: 'Phòng Quản lý Đô thị',
          canBoXuLy: 'Lê Hoàng Nam',
          tepDinhKem: ['Ke_hoach_198_KH_SXD_2026.pdf'],
          ghiChuHoSo: 'Văn bản kế hoạch đầu năm (không liên kết đơn).',
        },
      },
      {
        id: 'tc-vb-ln1',
        nhom: 'luot_nhan',
        nhomLabel: 'Lượt nhận liên quan',
        maHoSoTaiLieu: 'LN-12/2026-GOVEX',
        tenHoacTomTat: 'Lượt nhận văn bản trục liên thông từ Sở Xây dựng gửi Kế hoạch 198/KH-SXD',
        ngayTiepNhan: '18/01/2026',
        nguoiGuiHoacDonVi: 'Sở Xây dựng TP. Hà Nội',
        trangThai: 'Đã ghi nhận thành TL-2026-0061',
        lyDoLienQuan: 'Cùng cơ quan gửi (Sở Xây dựng TP. Hà Nội) và cùng chuyên đề kiểm tra trật tự xây dựng năm 2026.',
        danChungCuThe: ['Trùng mã định danh điện tử cơ quan gửi Sở Xây dựng TP. Hà Nội.'],
        doTuongDong: 90,
        doTinCayAI: '94.0%',
        chiTietHoSo: {
          donViPhuTrach: 'Văn phòng HĐND & UBND',
          canBoXuLy: 'Nguyễn Minh Anh',
          tepDinhKem: ['Ke_hoach_198_KH_SXD_2026.pdf'],
          ghiChuHoSo: 'Lượt nhận đầu năm 2026.',
        },
      },
      {
        id: 'tc-vb-don1',
        nhom: 'don',
        nhomLabel: 'Đơn liên quan trên cùng địa bàn kiểm tra',
        maHoSoTaiLieu: 'Đ-2026-00125',
        tenHoacTomTat: 'Phản ánh, tố cáo liên quan công tác GPMB và thi công hạ tầng tại Dự án Khu đô thị mới Y, phường Mộ Lao',
        ngayTiepNhan: '12/09/2026',
        nguoiGuiHoacDonVi: 'Bà Vũ Thị Thanh & Ông Nguyễn Văn A',
        trangThai: 'Đang xác minh',
        lyDoLienQuan: 'Dự án Khu đô thị mới Y, phường Mộ Lao nằm trong danh sách 05 dự án được Sở Xây dựng kiểm tra theo Thông báo 412/TB-SXD.',
        danChungCuThe: [
          'Phụ lục kèm Thông báo 412/TB-SXD liệt kê Dự án KĐT mới Y (phường Mộ Lao, quận Hà Đông) trùng địa điểm trong đơn Đ-2026-00125.',
        ],
        doTuongDong: 86,
        doTinCayAI: '91.2%',
        chiTietHoSo: {
          donViPhuTrach: 'Phòng Tiếp công dân & Thanh tra quận Hà Đông',
          canBoXuLy: 'Nguyễn Minh Anh',
          tepDinhKem: ['Don_goc_Đ_2026_00125.pdf'],
          ghiChuHoSo: 'Hồ sơ đơn đang xác minh.',
        },
      },
      {
        id: 'tc-vb-vv1',
        nhom: 'vu_viec',
        nhomLabel: 'Vụ việc liên quan',
        maHoSoTaiLieu: 'VV-2026-0042',
        tenHoacTomTat: 'Hồ sơ vụ việc kiểm tra công tác GPMB và thi công hạ tầng tại Dự án Khu đô thị mới Y (QĐ 89/QĐ-UBND)',
        ngayTiepNhan: '05/09/2026',
        nguoiGuiHoacDonVi: 'Đoàn kiểm tra liên ngành quận Hà Đông',
        trangThai: 'Đang xác minh',
        lyDoLienQuan: 'Cùng đối tượng dự án được kiểm tra thực địa trên địa bàn phường Mộ Lao.',
        danChungCuThe: ['Trùng phạm vi kiểm tra trật tự xây dựng tại Dự án Khu đô thị mới Y.'],
        doTuongDong: 85,
        doTinCayAI: '90.0%',
        chiTietHoSo: {
          donViPhuTrach: 'Đoàn kiểm tra theo QĐ 89/QĐ-UBND',
          canBoXuLy: 'Trần Hoàng Long',
          tepDinhKem: ['QD_89_UBND_Thanh_lap_doan.pdf'],
          ghiChuHoSo: 'Vụ việc đang theo dõi.',
        },
      },
    ],
    deXuatXuLy: [
      {
        phuongAn: 'chuyen_xu_ly_theo_doi',
        tenPhuongAn: 'Chuyển xử lý / theo dõi (Chuyển Phòng Quản lý Đô thị thực hiện trước hạn 25/09/2026)',
        isRecommended: true,
        doTinCay: '98.5%',
        lyDoDeXuat:
          'Thông báo số 412/TB-SXD của Sở Xây dựng yêu cầu lập báo cáo số liệu trật tự xây dựng Quý III/2026 gửi trước 17h00 ngày 25/09/2026 và phối hợp đoàn kiểm tra từ 28/09–30/09/2026. Cần ghi nhận tài liệu và chuyển ngay Phòng Quản lý Đô thị chủ trì theo dõi thực hiện.',
        duLieuLamCanCu: [
          'Số hiệu 412/TB-SXD ngày 10/09/2026 của Sở Xây dựng TP. Hà Nội.',
          'Thời hạn hoàn thành báo cáo phối hợp: Trước 17h00 ngày 25/09/2026.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận chuyển văn bản cho Phòng Quản lý Đô thị chủ trì theo dõi, thực hiện đúng hạn 25/09/2026 (không tạo đơn).',
        targetCodeSuggested: 'TL-2026-0061',
      },
      {
        phuongAn: 'ghi_nhan_tai_lieu',
        tenPhuongAn: 'Ghi nhận thành tài liệu tiếp nhận (Lưu Kho tài liệu hành chính)',
        doTinCay: '96.0%',
        lyDoDeXuat:
          'Ghi nhận Thông báo số 412/TB-SXD thành Tài liệu tiếp nhận loại "Văn bản của cơ quan khác" trong hệ thống quản lý tài liệu, không sinh mã đơn thư.',
        duLieuLamCanCu: [
          'Văn bản điện tử có chữ ký số hợp lệ của Sở Xây dựng TP. Hà Nội, đầy đủ 02/02 trang.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận tiếp nhận thành Tài liệu tiếp nhận loại "Văn bản" (không tạo đơn).',
        targetCodeSuggested: 'TL-2026-0120',
      },
      {
        phuongAn: 'ghep_tai_lieu',
        tenPhuongAn: 'Ghép vào tài liệu tiếp nhận đã tồn tại (Kế hoạch TL-2026-0061)',
        doTinCay: '93.5%',
        lyDoDeXuat:
          'Ghép Thông báo 412/TB-SXD vào bộ hồ sơ Tài liệu tiếp nhận đã tồn tại TL-2026-0061 (Kế hoạch số 198/KH-SXD ngày 15/01/2026 của Sở Xây dựng).',
        duLieuLamCanCu: [
          'Dòng căn cứ của Thông báo 412/TB-SXD dẫn chiếu trực tiếp Kế hoạch số 198/KH-SXD ngày 15/01/2026.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghép vào Tài liệu tiếp nhận TL-2026-0061.',
        targetCodeSuggested: 'TL-2026-0061',
      },
      {
        phuongAn: 'ghep_don',
        tenPhuongAn: 'Ghép vào đơn đã tồn tại (Đ-2026-00125)',
        doTinCay: '86.0%',
        lyDoDeXuat:
          'Áp dụng nếu cán bộ cần đính kèm văn bản thông báo kiểm tra trật tự xây dựng tại địa bàn phường Mộ Lao làm tài liệu tham khảo cho hồ sơ đơn Đ-2026-00125 đang thụ lý.',
        duLieuLamCanCu: [
          'Phạm vi kiểm tra của Thông báo 412/TB-SXD bao gồm các dự án khu đô thị trên địa bàn phường Mộ Lao, quận Hà Đông.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghép văn bản vào hồ sơ đơn Đ-2026-00125 mà không tạo thêm đơn mới.',
        targetCodeSuggested: 'Đ-2026-00125',
      },
    ],
  },

  // ============================================================================
  // 3. BIỂU MẪU (TC02: Biểu mẫu trống hoặc điền dở dang, không tự sinh nội dung đơn)
  // ============================================================================
  bieu_mau: {
    id: 'bieu_mau',
    maKichBan: 'TC02',
    tenKichBan: 'Biểu mẫu kê khai (Có trường chưa điền & dữ liệu chưa thống nhất)',
    moTaNgan: 'Mẫu số 02/ĐK-HT: Tờ khai đăng ký thông tin hiện trạng sử dụng đất và hạ tầng kỹ thuật (bỏ trống nhiều mục bắt buộc)',
    doTinCayPhanLoaiKhongPhaiDon: '98.8%',
    lyDoKhongPhaiDon: [
      'Tài liệu có cấu trúc khung biểu mẫu kê khai hành chính định sẵn (Mẫu số 02/ĐK-HT).',
      'Các mục nội dung đề nghị và chữ ký xác nhận đang để trống; không có bất kỳ nội dung khiếu nại, tố cáo hay phản ánh nào.',
    ],
    nhanDien: {
      loaiTaiLieu: 'bieu_mau',
      loaiTaiLieuLabel: 'Biểu mẫu',
      tenTaiLieu: 'Tờ khai đăng ký thông tin hiện trạng sử dụng đất và đấu nối hạ tầng kỹ thuật (Mẫu số 02/ĐK-HT)',
      soKyHieu: 'Mẫu số 02/ĐK-HT',
      ngayLapBanHanh: 'Chưa xác định (Mục ngày tháng năm cuối biểu mẫu chưa điền)',
      coQuanNguoiGui: 'Hộ kinh doanh Nguyễn Văn Hòa (Điền tại mục 1.1 của tờ khai)',
      nguoiDonViNhan: 'Bộ phận Tiếp nhận và Trả kết quả quận Hà Đông',
      dinhDangTaiLieu: 'PDF Scan từ bản giấy A4 (01 tệp • 510 KB)',
      tinhTrangTaiLieu: 'Biểu mẫu điền dở dang (Đã điền 05/11 trường, bỏ trống 06 trường bắt buộc và chưa ký tên)',
    },
    tomTatNoiDung: {
      tomTatChinh:
        'Tài liệu là Tờ khai đăng ký thông tin hiện trạng sử dụng đất và đấu nối hạ tầng kỹ thuật (Mẫu số 02/ĐK-HT). Người nộp mới điền thông tin định danh cơ bản tại Phần I, nhưng để trống hoàn toàn Phần II (Thông số kỹ thuật đấu nối), mục Cam đoan và mục Chữ ký người kê khai.',
      chuDe: 'Kê khai thông tin hiện trạng sử dụng đất và hạ tầng kỹ thuật theo biểu mẫu',
      mucDich: 'Kê khai thông tin ban đầu phục vụ thủ tục quản lý hạ tầng đô thị (không phải đơn khiếu nại, tố cáo)',
      thongTinQuanTrong: [
        'Cấu trúc biểu mẫu gồm 03 phần với tổng cộng 11 trường thông tin.',
        'Đã điền 05/11 trường; còn 06/11 trường đang bỏ trống (bao gồm cả chữ ký người kê khai).',
        'Phát hiện 02 trường có dữ liệu không hợp lệ / mâu thuẫn nội tại giữa số CCCD và năm sinh.',
      ],
      caNhanToChucLienQuan: [
        { ten: 'Nguyễn Văn Hòa', vaiTro: 'Người kê khai tại mục 1.1', dinhDanh: 'SĐT: 0912 884 102' },
      ],
      thoiGianDiaDiemSuKienSoLieu: [
        { nhan: 'Địa chỉ thửa đất kê khai', giaTri: 'Số 18 ngõ 42 phố Tô Hiệu, phường Nguyễn Trãi, quận Hà Đông', viTri: 'Mục 1.4 Tờ khai' },
        { nhan: 'Diện tích kê khai', giaTri: '85,5 m²', viTri: 'Mục 2.1 Tờ khai' },
      ],
    },
    chuyenBietBieuMau: {
      tenVaLoaiBieuMau: 'Mẫu số 02/ĐK-HT — Tờ khai đăng ký thông tin hiện trạng sử dụng đất & đấu nối hạ tầng kỹ thuật',
      tongSoTruong: 11,
      cacTruongThongTin: [
        '1.1. Họ và tên người kê khai',
        '1.2. Ngày tháng năm sinh',
        '1.3. Số CCCD / Mã số định danh',
        '1.4. Địa chỉ liên hệ',
        '1.5. Số điện thoại',
        '2.1. Diện tích thửa đất sử dụng (m²)',
        '2.2. Số tờ bản đồ / Số thửa đất',
        '2.3. Hiện trạng điểm đấu nối cấp thoát nước',
        '2.4. Công suất sử dụng đăng ký',
        '3.1. Ngày tháng năm lập tờ khai',
        '3.2. Chữ ký và họ tên người kê khai',
      ],
      truongDaDien: [
        { tenTruong: '1.1. Họ và tên người kê khai', giaTri: 'Nguyễn Văn Hòa' },
        { tenTruong: '1.2. Ngày tháng năm sinh', giaTri: '12/05/1985' },
        { tenTruong: '1.3. Số CCCD / Mã số định danh', giaTri: '00109201842 (Ghi 11 chữ số, mã năm sinh 92)' },
        { tenTruong: '1.4. Địa chỉ liên hệ', giaTri: 'Số 18 ngõ 42 phố Tô Hiệu, phường Nguyễn Trãi, quận Hà Đông' },
        { tenTruong: '2.1. Diện tích thửa đất sử dụng', giaTri: '85,5 m²' },
      ],
      truongChuaDien: [
        '1.5. Số điện thoại liên hệ trên biểu mẫu (Chưa điền)',
        '2.2. Số tờ bản đồ / Số thửa đất (Để trống)',
        '2.3. Hiện trạng điểm đấu nối cấp thoát nước (Chưa đánh dấu ô chọn)',
        '2.4. Công suất sử dụng đăng ký (Để trống)',
        '3.1. Ngày tháng năm lập tờ khai (Để trống "Hà Nội, ngày ... tháng ... năm 202...")',
        '3.2. Chữ ký và họ tên người kê khai (Để trống hoàn toàn)',
      ],
      truongKhongHopLeHoacMauThuan: [
        {
          tenTruong: '1.3. Số CCCD / Mã số định danh',
          vanDe: 'Số CCCD chỉ có 11 chữ số ("00109201842") — thiếu 01 chữ số so với chuẩn 12 số.',
          canCu: 'Mục 1.3 Phần I Tờ khai (Trang 1)',
        },
        {
          tenTruong: 'Mâu thuẫn giữa Mục 1.2 (Năm sinh) và Mục 1.3 (Mã thế kỷ/năm sinh trong CCCD)',
          vanDe: 'Mục 1.2 ghi sinh năm 1985 nhưng 6 số đầu CCCD ghi "001092" (tương ứng nam sinh năm 1992).',
          canCu: 'Đối chiếu dòng 2 và dòng 3 Phần I Tờ khai',
        },
      ],
      mucDichSuDung: 'Sử dụng để công dân/hộ kinh doanh kê khai thông tin kỹ thuật khi đăng ký thỏa thuận đấu nối hạ tầng đô thị.',
    },
    kiemTraTaiLieu: [
      {
        id: 'chk-bm-1',
        nhomKiemTra: 'thieu_thong_tin_nhan_dien',
        nhomLabel: 'Biểu mẫu chưa điền đầy đủ & thiếu chữ ký',
        mucDo: 'nghiem_trong',
        noiDungCuThe: 'Biểu mẫu còn bỏ trống 06/11 trường thông tin, đặc biệt chưa điền Số tờ/Số thửa (Mục 2.2), Ngày lập (Mục 3.1) và Chữ ký người kê khai (Mục 3.2).',
        canCuTuTaiLieu: 'Phần II và Phần III của Mẫu số 02/ĐK-HT (Trang 1)',
      },
      {
        id: 'chk-bm-2',
        nhomKiemTra: 'mau_thuan_du_lieu',
        nhomLabel: 'Dữ liệu không hợp lệ & mâu thuẫn trong biểu mẫu',
        mucDo: 'canh_bao',
        noiDungCuThe: 'Số CCCD tại Mục 1.3 chỉ có 11 số (00109201842) và mã năm sinh "92" mâu thuẫn với ngày sinh "12/05/1985" tại Mục 1.2.',
        canCuTuTaiLieu: 'Mục 1.2 và Mục 1.3 Phần I Tờ khai',
      },
    ],
    traCuuLienQuan: [
      {
        id: 'tc-bm-tl1',
        nhom: 'tai_lieu',
        nhomLabel: 'Tài liệu tiếp nhận đã tồn tại (Chưa gắn đơn)',
        maHoSoTaiLieu: 'TL-2026-0102',
        tenHoacTomTat: 'Bản sao Giấy chứng nhận QSDĐ và sơ đồ thửa đất tại số 18 ngõ 42 phố Tô Hiệu của hộ ông Nguyễn Văn Hòa',
        ngayTiepNhan: '14/09/2026',
        nguoiGuiHoacDonVi: 'Nguyễn Văn Hòa (SĐT: 0912 884 102)',
        trangThai: 'Đã ghi nhận tài liệu • Chưa gắn vào đơn',
        chuaLienKetDon: true,
        lyDoLienQuan: 'Tài liệu tiếp nhận từ lượt nhận trước đó (LN-51/2026-GOVEX) của cùng ông Nguyễn Văn Hòa tại cùng địa chỉ số 18 ngõ 42 Tô Hiệu, đang chờ bổ sung tờ khai Mẫu 02/ĐK-HT.',
        danChungCuThe: [
          'Trùng 100% họ tên người nộp "Nguyễn Văn Hòa" và địa chỉ "Số 18 ngõ 42 phố Tô Hiệu, phường Nguyễn Trãi, quận Hà Đông".',
          'Diện tích trên GCN QSDĐ trong TL-2026-0102 là 85,5 m² trùng khớp với Mục 2.1 của biểu mẫu hiện tại.',
        ],
        doTuongDong: 97,
        doTinCayAI: '97.8%',
        chiTietHoSo: {
          donViPhuTrach: 'Bộ phận Tiếp nhận và Trả kết quả',
          canBoXuLy: 'Nguyễn Minh Anh',
          tepDinhKem: ['Ban_sao_GCN_QSDD_ToHieu.pdf'],
          ghiChuHoSo: 'Tài liệu tiếp nhận độc lập từ lượt nhận LN-51/2026-GOVEX, chưa ghép vào đơn.',
        },
      },
      {
        id: 'tc-bm-ln1',
        nhom: 'luot_nhan',
        nhomLabel: 'Lượt nhận liên quan',
        maHoSoTaiLieu: 'LN-51/2026-GOVEX',
        tenHoacTomTat: 'Lượt nhận trực tiếp của ông Nguyễn Văn Hòa nộp Bản sao Giấy chứng nhận QSDĐ tại số 18 ngõ 42 Tô Hiệu',
        ngayTiepNhan: '14/09/2026',
        nguoiGuiHoacDonVi: 'Nguyễn Văn Hòa',
        trangThai: 'Đã tạo Tài liệu tiếp nhận TL-2026-0102',
        chuaLienKetDon: true,
        lyDoLienQuan: 'Trùng họ tên "Nguyễn Văn Hòa" và trùng địa chỉ "Số 18 ngõ 42 phố Tô Hiệu, phường Nguyễn Trãi, quận Hà Đông".',
        danChungCuThe: [
          'Trùng 100% họ tên người nộp và địa chỉ thửa đất tại Mục 1.1 & 1.4 Tờ khai.',
        ],
        doTuongDong: 93,
        doTinCayAI: '95.0%',
        chiTietHoSo: {
          donViPhuTrach: 'Bộ phận Một cửa',
          canBoXuLy: 'Nguyễn Minh Anh',
          tepDinhKem: ['Ban_sao_GCN_QSDD_ToHieu.pdf'],
          ghiChuHoSo: 'Công dân nộp thiếu tờ khai Mẫu 02/ĐK-HT vào ngày 14/09/2026, nay nộp bổ sung tờ khai nhưng điền chưa đầy đủ.',
        },
      },
    ],
    deXuatXuLy: [
      {
        phuongAn: 'yeu_cau_bo_sung_xac_minh',
        tenPhuongAn: 'Yêu cầu bổ sung hoặc xác minh (Hoàn thiện 06 trường trống & đính chính CCCD)',
        isRecommended: true,
        doTinCay: '96.5%',
        lyDoDeXuat:
          'Biểu mẫu Mẫu số 02/ĐK-HT còn bỏ trống 06/11 trường bắt buộc (trong đó chưa ký tên tại Mục 3.2) và số CCCD tại Mục 1.3 bị thiếu 01 chữ số, mâu thuẫn với năm sinh tại Mục 1.2. Cần đề nghị người nộp hoàn thiện biểu mẫu trước khi sử dụng.',
        duLieuLamCanCu: [
          'Bỏ trống 06/11 trường tại Phần II và Phần III của Mẫu số 02/ĐK-HT.',
          'Mục 1.3 ghi CCCD 11 số (00109201842) mâu thuẫn với năm sinh 1985 tại Mục 1.2.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghi nhận tạm thời biểu mẫu và gửi yêu cầu công dân Nguyễn Văn Hòa bổ sung 06 trường còn trống, đính chính số CCCD & ký tên.',
        targetCodeSuggested: 'TL-2026-0102',
      },
      {
        phuongAn: 'ghep_tai_lieu',
        tenPhuongAn: 'Ghép vào tài liệu tiếp nhận đã tồn tại (TL-2026-0102 từ lượt nhận LN-51/2026-GOVEX)',
        doTinCay: '94.0%',
        lyDoDeXuat:
          'Ghép biểu mẫu Mẫu số 02/ĐK-HT vào Tài liệu tiếp nhận đã tồn tại TL-2026-0102 (Bản sao GCN QSDĐ tại số 18 ngõ 42 Tô Hiệu do ông Nguyễn Văn Hòa nộp ngày 14/09/2026, chưa liên kết đơn).',
        duLieuLamCanCu: [
          'Trùng 100% họ tên người kê khai Nguyễn Văn Hòa và địa chỉ thửa đất số 18 ngõ 42 phố Tô Hiệu.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghép biểu mẫu vào hồ sơ Tài liệu tiếp nhận TL-2026-0102 (không tạo đơn).',
        targetCodeSuggested: 'TL-2026-0102',
      },
      {
        phuongAn: 'ghi_nhan_tai_lieu',
        tenPhuongAn: 'Ghi nhận thành tài liệu tiếp nhận',
        doTinCay: '91.0%',
        lyDoDeXuat:
          'Ghi nhận biểu mẫu Mẫu số 02/ĐK-HT vào danh mục Tài liệu tiếp nhận kèm trạng thái ghi chú các trường chưa điền, tuyệt đối không tự tạo đơn mới.',
        duLieuLamCanCu: [
          'Biểu mẫu hành chính Mẫu số 02/ĐK-HT do Hộ kinh doanh Nguyễn Văn Hòa nộp.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận tiếp nhận thành Tài liệu tiếp nhận loại "Biểu mẫu" (không tạo đơn).',
        targetCodeSuggested: 'TL-2026-0121',
      },
      {
        phuongAn: 'ghep_don',
        tenPhuongAn: 'Ghép vào đơn đã tồn tại (Nếu có liên quan)',
        doTinCay: '82.5%',
        lyDoDeXuat:
          'Áp dụng trong trường hợp cán bộ xác định người nộp gửi bổ sung biểu mẫu kê khai diện tích đất cho một hồ sơ đơn đã tiếp nhận trước đó.',
        duLieuLamCanCu: [
          'Thông tin người kê khai Nguyễn Văn Hòa và địa chỉ thửa đất tại quận Hà Đông.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận chọn mã đơn hiện có để ghép biểu mẫu làm tài liệu đính kèm (không tạo thêm đơn mới).',
        targetCodeSuggested: 'Đ-2026-00125',
      },
    ],
  },

  // ============================================================================
  // 4. TÀI LIỆU KHÁC / BÁO CÁO NGHIỆP VỤ & CẢNH BÁO MỜ/THIẾU TRANG (TC04 & TC07)
  // ============================================================================
  tai_lieu_khac: {
    id: 'tai_lieu_khac',
    maKichBan: 'TC04 • TC07',
    tenKichBan: 'Tài liệu khác / Báo cáo nghiệp vụ (Có cảnh báo thiếu trang & mờ OCR)',
    moTaNgan: 'Báo cáo tổng hợp kết quả quan trắc môi trường định kỳ tháng 08/2026 tại Cụm CN Yên Nghĩa (Khuyết trang 3/4 và mờ phụ lục)',
    doTinCayPhanLoaiKhongPhaiDon: '96.9%',
    lyDoKhongPhaiDon: [
      'Là báo cáo tổng hợp số liệu kỹ thuật quan trắc môi trường định kỳ gửi để cung cấp thông tin theo dõi.',
      'Không có nội dung khiếu nại, tố cáo, kiến nghị hay yêu cầu giải quyết tranh chấp/vi phạm.',
    ],
    nhanDien: {
      loaiTaiLieu: 'tai_lieu_khac',
      loaiTaiLieuLabel: 'Tài liệu khác (Báo cáo chuyên môn)',
      tenTaiLieu: 'Báo cáo tổng hợp kết quả quan trắc môi trường không khí và nước thải định kỳ tháng 08/2026 tại Cụm công nghiệp Yên Nghĩa',
      soKyHieu: '88/BC-TTQTMT',
      ngayLapBanHanh: '04/09/2026',
      coQuanNguoiGui: 'Trung tâm Quan trắc Tài nguyên và Môi trường Hà Nội',
      nguoiDonViNhan: 'Phòng Tài nguyên và Môi trường quận Hà Đông; Ban Quản lý Cụm CN Yên Nghĩa',
      dinhDangTaiLieu: 'PDF Scan (01 tệp • 3.1 MB • Nhận diện 03 trang thực tế trên tổng số 04 trang đánh số)',
      tinhTrangTaiLieu: 'Thiếu trang 3/4; nửa dưới trang Phụ lục bảng số liệu bị mờ nhòe không đọc được OCR',
    },
    tomTatNoiDung: {
      tomTatChinh:
        'Báo cáo tổng hợp số liệu đo đạc định kỳ tháng 08/2026 tại 06 điểm quan trắc thuộc Cụm công nghiệp Yên Nghĩa. Kết quả tại Trang 1–2 cho thấy 05/06 điểm đạt quy chuẩn QCVN, riêng điểm xả thải K3 có chỉ số TSS vượt 1,18 lần. Phần nhận xét chi tiết tại Trang 3 bị thiếu do quét sót trang và bảng thông số phụ lục cuối tệp bị mờ không thể trích xuất.',
      chuDe: 'Số liệu quan trắc chất lượng môi trường định kỳ tháng 08/2026 tại Cụm CN Yên Nghĩa',
      mucDich: 'Cung cấp dữ liệu quan trắc định kỳ phục vụ công tác theo dõi, giám sát môi trường tại địa phương',
      thongTinQuanTrong: [
        'Tổng số mẫu quan trắc trong kỳ (15/08 – 25/08/2026): 18 mẫu khí thải và 12 mẫu nước thải.',
        'Tỷ lệ đạt chuẩn: 28/30 mẫu đạt QCVN 40:2011/BTNMT và QCVN 19:2009/BTNMT (đạt 93,3%).',
        'Điểm cần lưu ý: Điểm quan trắc nước thải K3 (rãnh thoát nước phía Đông Lô B4) có thông số TSS = 118 mg/L (vượt ngưỡng 1,18 lần).',
        'Phần dữ liệu không thể đọc (Trang 3 bị khuyết & Phụ lục bị mờ): AI giữ nguyên trạng thái "Chưa xác định", tuyệt đối không tự suy diễn số liệu.',
      ],
      caNhanToChucLienQuan: [
        { ten: 'Trung tâm Quan trắc Tài nguyên và Môi trường Hà Nội', vaiTro: 'Đơn vị lập báo cáo', dinhDanh: 'Số: 88/BC-TTQTMT' },
        { ten: 'Phòng Tài nguyên và Môi trường quận Hà Đông', vaiTro: 'Đơn vị nhận báo cáo theo dõi' },
        { ten: 'Ban Quản lý Cụm công nghiệp Yên Nghĩa', vaiTro: 'Đơn vị quản lý hạ tầng cụm công nghiệp' },
      ],
      thoiGianDiaDiemSuKienSoLieu: [
        { nhan: 'Kỳ lấy mẫu quan trắc', giaTri: 'Từ ngày 15/08/2026 đến ngày 25/08/2026', viTri: 'Mục I.2, Trang 1' },
        { nhan: 'Địa điểm quan trắc', giaTri: '06 điểm đo tại Cụm công nghiệp Yên Nghĩa, quận Hà Đông', viTri: 'Mục I.1, Trang 1' },
        { nhan: 'Số liệu TSS tại điểm K3', giaTri: '118 mg/L (Quy chuẩn cho phép: 100 mg/L — vượt 1,18 lần)', viTri: 'Bảng 2, Trang 2' },
        { nhan: 'Số liệu COD/BOD5 tại Trang 3', giaTri: 'Chưa xác định (Do tệp scan bị thiếu Trang 3/4)', viTri: 'Khuyết trang 3' },
      ],
      yeuCauTrachNhiemThoiHan:
        'Đề nghị Ban Quản lý Cụm CN Yên Nghĩa nhắc nhở các cơ sở tại phân khu Lô B4 nạo vét hố ga lắng cặn trước kỳ quan trắc tháng 09/2026.',
    },
    chuyenBietTaiLieuKhac: {
      chuDe: 'Báo cáo kết quả quan trắc kỹ thuật môi trường định kỳ tháng 08/2026',
      mucDichTaiLieu: 'Cung cấp thông tin, số liệu quan trắc môi trường định kỳ cho cơ quan quản lý chuyên ngành địa phương',
      thongTinQuanTrong: [
        '18 mẫu không khí xung quanh và 12 mẫu nước thải đã được phân tích tại phòng thí nghiệm VILAS 128.',
        'Điểm K3 có thông số chất rắn lơ lửng (TSS) vượt nhẹ 1,18 lần; các chỉ tiêu kim loại nặng đều nằm trong giới hạn cho phép.',
        'Nội dung Mục III (Đánh giá xu hướng biến động) nằm ở Trang 3 hiện bị thiếu trong tệp PDF.',
      ],
      chuTheLienQuan: [
        'Trung tâm Quan trắc TN&MT Hà Nội (Đơn vị thực hiện)',
        'Phòng Tài nguyên và Môi trường quận Hà Đông (Đơn vị theo dõi)',
        'Ban Quản lý Cụm công nghiệp Yên Nghĩa (Đơn vị phối hợp)',
      ],
      noiDungCanLuuYTheoDoi: [
        'Theo dõi chỉ số TSS tại điểm xả K3 trong kỳ quan trắc tiếp theo (tháng 09/2026).',
        'Yêu cầu bộ phận văn thư/người gửi quét bổ sung Trang 3/4 bị thiếu và quét lại trang Phụ lục bị mờ nhòe.',
      ],
    },
    kiemTraTaiLieu: [
      {
        id: 'chk-tlk-1',
        nhomKiemTra: 'thieu_trang_bi_cat',
        nhomLabel: 'Phát hiện thiếu trang trong tệp tài liệu (TC07)',
        mucDo: 'nghiem_trong',
        noiDungCuThe: 'Chân trang (Footer) ghi tổng số 04 trang ("Trang 1/4", "Trang 2/4", "Trang 4/4") nhưng tệp PDF tải lên chỉ có 03 trang — bị khuyết hoàn toàn Trang 3/4 (chứa Mục III và đầu Mục IV).',
        canCuTuTaiLieu: 'Thứ tự đánh số trang giữa trang thứ 2 ("Trang 2/4") nhảy thẳng sang trang thứ 3 ("Trang 4/4")',
      },
      {
        id: 'chk-tlk-2',
        nhomKiemTra: 'chat_luong_ocr',
        nhomLabel: 'Cảnh báo vùng văn bản bị mờ không thể đọc OCR (TC07)',
        mucDo: 'nghiem_trong',
        noiDungCuThe: 'Nửa dưới Trang 4/4 (Phụ lục bảng thông số vi khí hậu và độ ồn) bị nhòe mực và mất nét (độ tin cậy OCR < 32%). Hệ thống giữ nguyên trạng thái "Chưa đọc được", không tự suy diễn số liệu.',
        canCuTuTaiLieu: 'Vùng bảng Phụ lục 02 nửa dưới Trang 4/4',
      },
      {
        id: 'chk-tlk-3',
        nhomKiemTra: 'can_can_bo_kiem_tra',
        nhomLabel: 'Nội dung cần cán bộ kiểm tra lại',
        mucDo: 'canh_bao',
        noiDungCuThe: 'Cán bộ cần kiểm tra bản giấy gốc tại bộ phận văn thư để quét bổ sung Trang 3/4 và chụp lại Phụ lục 02 trước khi chuyển Phòng TN&MT lưu trữ.',
        canCuTuTaiLieu: 'Toàn bộ tệp Bao_cao_quan_trac_88_BC_TTQTMT.pdf',
      },
    ],
    traCuuLienQuan: [
      {
        id: 'tc-tlk-1',
        nhom: 'tai_lieu',
        nhomLabel: 'Tài liệu tiếp nhận kỳ trước (Chưa gắn đơn)',
        maHoSoTaiLieu: 'TL-2026-0072',
        tenHoacTomTat: 'Báo cáo số 71/BC-TTQTMT ngày 05/08/2026 về kết quả quan trắc môi trường định kỳ tháng 07/2026 tại Cụm CN Yên Nghĩa',
        ngayTiepNhan: '07/08/2026',
        nguoiGuiHoacDonVi: 'Trung tâm Quan trắc Tài nguyên và Môi trường Hà Nội',
        trangThai: 'Đã lưu hồ sơ theo dõi định kỳ • Chưa gắn đơn',
        chuaLienKetDon: true,
        lyDoLienQuan: 'Là báo cáo quan trắc định kỳ tháng liền kề trước đó (tháng 07/2026) của cùng đơn vị lập tại cùng địa điểm Cụm CN Yên Nghĩa.',
        danChungCuThe: [
          'Cùng cơ quan ban hành: Trung tâm Quan trắc TN&MT Hà Nội.',
          'Báo cáo 88/BC-TTQTMT có bảng so sánh đối chiếu số liệu với Báo cáo kỳ tháng 07/2026 (TL-2026-0072).',
        ],
        doTuongDong: 92,
        doTinCayAI: '96.4%',
        chiTietHoSo: {
          donViPhuTrach: 'Phòng Tài nguyên & Môi trường',
          canBoXuLy: 'Phạm Thu Hằng',
          tepDinhKem: ['Bao_cao_71_BC_TTQTMT_Thang7.pdf'],
          ghiChuHoSo: 'Tài liệu tiếp nhận định kỳ hàng tháng (độc lập, không gắn với đơn).',
        },
      },
      {
        id: 'tc-tlk-ln1',
        nhom: 'luot_nhan',
        nhomLabel: 'Lượt nhận liên quan',
        maHoSoTaiLieu: 'LN-36/2026-GOVEX',
        tenHoacTomTat: 'Lượt nhận Báo cáo quan trắc môi trường kỳ tháng 07/2026 từ Trung tâm Quan trắc TN&MT Hà Nội',
        ngayTiepNhan: '07/08/2026',
        nguoiGuiHoacDonVi: 'Trung tâm Quan trắc Tài nguyên và Môi trường Hà Nội',
        trangThai: 'Đã chuyển thành TL-2026-0072',
        lyDoLienQuan: 'Lượt nhận kỳ liền kề của cùng đơn vị gửi báo cáo định kỳ.',
        danChungCuThe: ['Trùng đơn vị gửi Trung tâm Quan trắc TN&MT Hà Nội.'],
        doTuongDong: 90,
        doTinCayAI: '94.5%',
        chiTietHoSo: {
          donViPhuTrach: 'Phòng Tài nguyên & Môi trường',
          canBoXuLy: 'Phạm Thu Hằng',
          tepDinhKem: ['Bao_cao_71_BC_TTQTMT_Thang7.pdf'],
          ghiChuHoSo: 'Lượt nhận báo cáo kỳ trước.',
        },
      },
    ],
    deXuatXuLy: [
      {
        phuongAn: 'ghi_nhan_tai_lieu',
        tenPhuongAn: 'Ghi nhận thành tài liệu tiếp nhận (Lưu Kho tài liệu chuyên môn)',
        isRecommended: true,
        doTinCay: '95.5%',
        lyDoDeXuat:
          'Ghi nhận Báo cáo số 88/BC-TTQTMT thành Tài liệu tiếp nhận chuyên môn (liên kết theo chuỗi với Báo cáo kỳ trước TL-2026-0072 và kèm ghi chú yêu cầu bổ sung Trang 3/4 bị thiếu & Phụ lục 02 bị mờ), không tạo đơn mới.',
        duLieuLamCanCu: [
          'Số hiệu 88/BC-TTQTMT ngày 04/09/2026 của Trung tâm Quan trắc TN&MT Hà Nội.',
          'Liên quan cùng chuỗi báo cáo định kỳ với Tài liệu tiếp nhận TL-2026-0072 (tháng 07/2026).',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận tiếp nhận thành Tài liệu tiếp nhận loại "Tài liệu khác / Báo cáo nghiệp vụ" (không tạo đơn).',
        targetCodeSuggested: 'TL-2026-0072',
      },
      {
        phuongAn: 'yeu_cau_bo_sung_xac_minh',
        tenPhuongAn: 'Yêu cầu bổ sung hoặc xác minh (Quét bổ sung Trang 3/4 bị thiếu & Phụ lục 02 bị mờ)',
        doTinCay: '94.8%',
        lyDoDeXuat:
          'Tệp PDF tải lên bị khuyết Trang 3/4 và vùng bảng Phụ lục 02 ở nửa dưới Trang 4/4 bị nhòe mực không đọc được OCR. Cần yêu cầu cung cấp/quét lại bản rõ nét.',
        duLieuLamCanCu: [
          'Chân trang nhảy từ "Trang 2/4" sang "Trang 4/4" (khuyết Trang 3/4).',
          'Độ tin cậy OCR vùng Phụ lục 02 dưới 32%.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận yêu cầu bộ phận văn thư / đơn vị gửi quét bổ sung Trang 3/4 và chụp lại Phụ lục 02.',
        targetCodeSuggested: 'TL-2026-0072',
      },
      {
        phuongAn: 'chuyen_xu_ly_theo_doi',
        tenPhuongAn: 'Chuyển xử lý / theo dõi (Chuyển Phòng Tài nguyên & Môi trường theo dõi điểm xả K3)',
        doTinCay: '91.0%',
        lyDoDeXuat:
          'Chuyển Báo cáo số 88/BC-TTQTMT cho Phòng Tài nguyên và Môi trường quận Hà Đông và Ban Quản lý Cụm CN Yên Nghĩa để theo dõi thông số TSS vượt 1,18 lần tại điểm K3.',
        duLieuLamCanCu: [
          'Bảng 2 Trang 2 ghi nhận TSS tại điểm K3 = 118 mg/L (vượt ngưỡng QCVN 1,18 lần).',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận chuyển Phòng Tài nguyên & Môi trường theo dõi định kỳ (không tạo đơn).',
        targetCodeSuggested: 'TL-2026-0072',
      },
      {
        phuongAn: 'ghep_tai_lieu',
        tenPhuongAn: 'Ghép vào tài liệu tiếp nhận đã tồn tại (Báo cáo kỳ trước TL-2026-0072)',
        doTinCay: '89.5%',
        lyDoDeXuat:
          'Ghép nối tiếp vào hồ sơ Tài liệu tiếp nhận kỳ trước TL-2026-0072 (Báo cáo quan trắc tháng 07/2026 tại Cụm CN Yên Nghĩa, chưa gắn đơn) để theo dõi chuỗi số liệu liên tục.',
        duLieuLamCanCu: [
          'Cùng đơn vị lập Trung tâm Quan trắc TN&MT Hà Nội và cùng địa điểm quan trắc Cụm CN Yên Nghĩa.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghép vào Tài liệu tiếp nhận TL-2026-0072.',
        targetCodeSuggested: 'TL-2026-0072',
      },
      {
        phuongAn: 'ghep_don',
        tenPhuongAn: 'Ghép vào đơn đã tồn tại (Đ-2026-00125)',
        doTinCay: '84.0%',
        lyDoDeXuat:
          'Áp dụng nếu cán bộ xác định báo cáo số liệu quan trắc tại khu vực Lô B4 / Cụm CN Yên Nghĩa cần được đính kèm làm tài liệu tham khảo cho đơn Đ-2026-00125.',
        duLieuLamCanCu: [
          'Địa điểm quan trắc tại phân khu Lô B4 Cụm CN Yên Nghĩa, quận Hà Đông.',
        ],
        thongTinCanCanBoXacNhan:
          'Xác nhận ghép báo cáo vào hồ sơ đơn Đ-2026-00125 (không tạo thêm đơn mới).',
        targetCodeSuggested: 'Đ-2026-00125',
      },
    ],
  },
};

interface PhanTichTaiLieuKhongPhaiDonSectionProps {
  activeScenario: LoaiTaiLieuKhongPhaiDon;
  onChangeScenario: (scenario: LoaiTaiLieuKhongPhaiDon) => void;
  selectedPhuongAn: PhuongAnXuLyTaiLieuType;
  onSelectPhuongAn: (phuongAn: PhuongAnXuLyTaiLieuType, summaryNote: string, targetCode?: string) => void;
  onNavigateToDocument: (fileIndex: number, highlightKey?: string) => void;
  onSwitchToPetitionFlow: () => void;
  onOpenConfirmActionModal: (phuongAn: PhuongAnXuLyTaiLieuType, targetItem?: KetQuaTraCuuLienQuanItem) => void;
  showToast: (msg: string) => void;
}

export const PhanTichTaiLieuKhongPhaiDonSection: React.FC<PhanTichTaiLieuKhongPhaiDonSectionProps> = ({
  activeScenario,
  onChangeScenario,
  selectedPhuongAn,
  onSelectPhuongAn,
  onNavigateToDocument,
  onSwitchToPetitionFlow,
  onOpenConfirmActionModal,
  showToast,
}) => {
  const scenarioData = KICH_BAN_TAI_LIEU_MAP[activeScenario];

  // Quản lý đóng/mở từng phân khu A, B, C, D, E, F (đáp ứng yêu cầu thu gọn/mở rộng)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    A: true,
    B: true,
    C: true,
    D: true,
    E: true,
    F: true,
  });

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Quản lý chỉnh sửa trường nhận diện (A) nhưng giữ nguyên dữ liệu gốc OCR để đối chiếu
  const [isEditingMetadata, setIsEditingMetadata] = useState<boolean>(false);
  const [editedMetadata, setEditedMetadata] = useState<ThongTinNhanDienTaiLieu>(scenarioData.nhanDien);
  const originalOcrMetadata = scenarioData.nhanDien;

  useEffect(() => {
    setEditedMetadata(scenarioData.nhanDien);
    setIsEditingMetadata(false);
  }, [activeScenario, scenarioData.nhanDien]);

  // Quản lý tìm kiếm & lọc trong mục E (Tra cứu tài liệu và hồ sơ liên quan)
  const [traCuuNhomFilter, setTraCuuNhomFilter] = useState<NhomTraCuuLienQuan>('tat_ca');
  const [traCuuSearchText, setTraCuuSearchText] = useState<string>('');
  const [selectedTraCuuDetail, setSelectedTraCuuDetail] = useState<KetQuaTraCuuLienQuanItem | null>(null);
  const [linkedTargetCode, setLinkedTargetCode] = useState<string | null>(
    scenarioData.traCuuLienQuan[0]?.maHoSoTaiLieu || null
  );

  useEffect(() => {
    setLinkedTargetCode(scenarioData.traCuuLienQuan[0]?.maHoSoTaiLieu || null);
    setTraCuuNhomFilter('tat_ca');
    setTraCuuSearchText('');
  }, [activeScenario, scenarioData]);

  const filteredTraCuuList = useMemo(() => {
    return scenarioData.traCuuLienQuan.filter((item) => {
      if (traCuuNhomFilter !== 'tat_ca' && item.nhom !== traCuuNhomFilter) return false;
      if (!traCuuSearchText.trim()) return true;
      const q = traCuuSearchText.toLowerCase();
      return (
        item.maHoSoTaiLieu.toLowerCase().includes(q) ||
        item.tenHoacTomTat.toLowerCase().includes(q) ||
        item.nguoiGuiHoacDonVi.toLowerCase().includes(q) ||
        item.lyDoLienQuan.toLowerCase().includes(q) ||
        item.danChungCuThe.some((d) => d.toLowerCase().includes(q))
      );
    });
  }, [scenarioData.traCuuLienQuan, traCuuNhomFilter, traCuuSearchText]);

  const countByGroup = useMemo(() => {
    const list = scenarioData.traCuuLienQuan;
    return {
      tat_ca: list.length,
      luot_nhan: list.filter((i) => i.nhom === 'luot_nhan').length,
      tai_lieu: list.filter((i) => i.nhom === 'tai_lieu').length,
      don: list.filter((i) => i.nhom === 'don').length,
      vu_viec: list.filter((i) => i.nhom === 'vu_viec').length,
    };
  }, [scenarioData.traCuuLienQuan]);

  return (
    <div className="space-y-4 text-xs">
      {/* ========================================================================= */}
      {/* THANH CHỌN KỊCH BẢN LOẠI TÀI LIỆU & NGUYÊN TẮC PHÂN LOẠI (MỤC 2 & MỤC 6) */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-lg bg-linear-to-r from-slate-50 via-amber-50/40 to-blue-50/40 border border-slate-200/90 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <span className="material-symbols-outlined text-[18px]">folder_managed</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-[13px] uppercase tracking-tight">
                  Kết quả phân tích AI: Tài liệu không phải là đơn (Chế độ Quản lý tài liệu)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Độ tin cậy phân loại: {scenarioData.doTinCayPhanLoaiKhongPhaiDon}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#004ac6] border border-blue-200">
                  Loại nhận diện: {editedMetadata.loaiTaiLieuLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                AI xác định tài liệu không chứa yếu tố khiếu nại, tố cáo, kiến nghị, phản ánh • Tự động ẩn các trường nghiệp vụ đơn và không tự động khởi tạo đơn mới.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchToPetitionFlow}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            title="TC08: Nếu cán bộ xác định tài liệu thực chất có nội dung là đơn, chuyển ngay sang luồng phân tích & tiếp nhận đơn mà không phải tạo lại lượt nhận"
          >
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
            <span>Chuyển sang luồng Tiếp nhận đơn (TC08)</span>
          </button>
        </div>

        {/* Bộ chuyển đổi 4 loại tài liệu (Kiểm thử đầy đủ TC01 -> TC08) */}
        <div className="pt-1 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] font-bold text-slate-600 mr-1">
              Loại tài liệu nhận diện (TC01–TC07):
            </span>
            {(
              [
                { id: 'minh_chung', label: 'Tài liệu minh chứng (TC03/05/06)', icon: 'fact_check' },
                { id: 'van_ban', label: 'Văn bản cơ quan khác (TC01)', icon: 'article' },
                { id: 'bieu_mau', label: 'Biểu mẫu (TC02)', icon: 'dynamic_form' },
                { id: 'tai_lieu_khac', label: 'Tài liệu khác / Báo cáo mờ, thiếu trang (TC04/07)', icon: 'analytics' },
              ] as { id: LoaiTaiLieuKhongPhaiDon; label: string; icon: string }[]
            ).map((tab) => {
              const isActive = activeScenario === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeScenario(tab.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#004ac6] text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Căn cứ AI xác định tài liệu không phải là đơn */}
        <div className="p-2.5 rounded bg-white/90 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-600">verified_user</span>
              Căn cứ phân loại của AI (Phân biệt rõ với nhận định cán bộ):
            </span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
              {scenarioData.lyDoKhongPhaiDon.map((lyDo, idx) => (
                <li key={idx}>{lyDo}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setExpandedSections({ A: true, B: true, C: true, D: true, E: true, F: true })
              }
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-semibold cursor-pointer"
            >
              Mở rộng tất cả
            </button>
            <button
              type="button"
              onClick={() =>
                setExpandedSections({ A: true, B: false, C: false, D: false, E: true, F: true })
              }
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-semibold cursor-pointer"
            >
              Thu gọn gọn gàng
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* A. THÔNG TIN NHẬN DIỆN TÀI LIỆU                                           */}
      {/* ========================================================================= */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div
          onClick={() => toggleSection('A')}
          className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-[#004ac6]">badge</span>
            <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
              A. Thông tin nhận diện tài liệu
            </h4>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Dữ liệu trích xuất OCR
            </span>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isEditingMetadata ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingMetadata(false);
                    showToast('✓ Đã lưu thông tin nhận diện tài liệu (vẫn giữ nguyên dữ liệu gốc OCR để đối chiếu).');
                  }}
                  className="px-2.5 py-1 rounded bg-[#004ac6] text-white text-[11px] font-bold cursor-pointer"
                >
                  Lưu chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedMetadata(originalOcrMetadata);
                    setIsEditingMetadata(false);
                  }}
                  className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                >
                  Khôi phục gốc OCR
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingMetadata(true)}
                className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
                <span>Chỉnh sửa nhận diện</span>
              </button>
            )}
            <span
              onClick={() => toggleSection('A')}
              className="material-symbols-outlined text-slate-400 text-[18px] cursor-pointer"
            >
              {expandedSections.A ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {expandedSections.A && (
          <div className="divide-y divide-slate-100 text-[11.5px]">
            {/* Hàng 1: Loại tài liệu | Số, ký hiệu | Ngày lập/ban hành */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-2.5">
                <span className="text-[10.5px] text-slate-500 block mb-0.5">Loại tài liệu</span>
                {isEditingMetadata ? (
                  <select
                    value={editedMetadata.loaiTaiLieu}
                    onChange={(e) => {
                      const val = e.target.value as LoaiTaiLieuKhongPhaiDon;
                      const labelMap: Record<LoaiTaiLieuKhongPhaiDon, string> = {
                        van_ban: 'Văn bản hành chính',
                        bieu_mau: 'Biểu mẫu',
                        minh_chung: 'Tài liệu minh chứng',
                        tai_lieu_khac: 'Tài liệu khác',
                      };
                      setEditedMetadata((prev) => ({
                        ...prev,
                        loaiTaiLieu: val,
                        loaiTaiLieuLabel: labelMap[val],
                      }));
                    }}
                    className="w-full p-1 border border-blue-300 rounded text-[11.5px] font-bold text-[#004ac6]"
                  >
                    <option value="van_ban">Văn bản</option>
                    <option value="bieu_mau">Biểu mẫu</option>
                    <option value="minh_chung">Tài liệu minh chứng</option>
                    <option value="tai_lieu_khac">Tài liệu khác</option>
                  </select>
                ) : (
                  <span className="font-bold text-[#004ac6] text-[12px]">{editedMetadata.loaiTaiLieuLabel}</span>
                )}
                {editedMetadata.loaiTaiLieuLabel !== originalOcrMetadata.loaiTaiLieuLabel && (
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Gốc OCR: <code>{originalOcrMetadata.loaiTaiLieuLabel}</code>
                  </span>
                )}
              </div>

              <div className="p-2.5">
                <span className="text-[10.5px] text-slate-500 block mb-0.5">Số, ký hiệu</span>
                {isEditingMetadata ? (
                  <input
                    type="text"
                    value={editedMetadata.soKyHieu || ''}
                    onChange={(e) => setEditedMetadata((prev) => ({ ...prev, soKyHieu: e.target.value }))}
                    className="w-full p-1 border border-blue-300 rounded font-mono text-[11.5px]"
                  />
                ) : (
                  <span className="font-mono font-bold text-slate-900">
                    {editedMetadata.soKyHieu || 'Chưa xác định'}
                  </span>
                )}
                {editedMetadata.soKyHieu !== originalOcrMetadata.soKyHieu && (
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Gốc OCR: <code>{originalOcrMetadata.soKyHieu || 'Chưa xác định'}</code>
                  </span>
                )}
              </div>

              <div className="p-2.5">
                <span className="text-[10.5px] text-slate-500 block mb-0.5">Ngày lập / Ngày ban hành</span>
                {isEditingMetadata ? (
                  <input
                    type="text"
                    value={editedMetadata.ngayLapBanHanh || ''}
                    onChange={(e) => setEditedMetadata((prev) => ({ ...prev, ngayLapBanHanh: e.target.value }))}
                    className="w-full p-1 border border-blue-300 rounded text-[11.5px]"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">
                    {editedMetadata.ngayLapBanHanh || 'Chưa xác định'}
                  </span>
                )}
                {editedMetadata.ngayLapBanHanh !== originalOcrMetadata.ngayLapBanHanh && (
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Gốc OCR: <code>{originalOcrMetadata.ngayLapBanHanh || 'Chưa xác định'}</code>
                  </span>
                )}
              </div>
            </div>

            {/* Hàng 2: Tên tài liệu */}
            <div className="p-2.5">
              <span className="text-[10.5px] text-slate-500 block mb-0.5">Tên tài liệu</span>
              {isEditingMetadata ? (
                <input
                  type="text"
                  value={editedMetadata.tenTaiLieu}
                  onChange={(e) => setEditedMetadata((prev) => ({ ...prev, tenTaiLieu: e.target.value }))}
                  className="w-full p-1.5 border border-blue-300 rounded font-semibold text-slate-900 text-[12px]"
                />
              ) : (
                <span className="font-bold text-slate-900 text-[12px] block">{editedMetadata.tenTaiLieu}</span>
              )}
              {editedMetadata.tenTaiLieu !== originalOcrMetadata.tenTaiLieu && (
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Dữ liệu gốc OCR: <code>{originalOcrMetadata.tenTaiLieu}</code>
                </span>
              )}
            </div>

            {/* Hàng 3: Cơ quan ban hành / Người lập / Người gửi | Người hoặc đơn vị nhận */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-2.5">
                <span className="text-[10.5px] text-slate-500 block mb-0.5">
                  Cơ quan ban hành / Người lập / Người gửi
                </span>
                {isEditingMetadata ? (
                  <input
                    type="text"
                    value={editedMetadata.coQuanNguoiGui}
                    onChange={(e) => setEditedMetadata((prev) => ({ ...prev, coQuanNguoiGui: e.target.value }))}
                    className="w-full p-1 border border-blue-300 rounded text-[11.5px]"
                  />
                ) : (
                  <span className="font-semibold text-slate-900">{editedMetadata.coQuanNguoiGui}</span>
                )}
                {editedMetadata.coQuanNguoiGui !== originalOcrMetadata.coQuanNguoiGui && (
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Gốc OCR: <code>{originalOcrMetadata.coQuanNguoiGui}</code>
                  </span>
                )}
              </div>

              {editedMetadata.nguoiDonViNhan && (
                <div className="p-2.5">
                  <span className="text-[10.5px] text-slate-500 block mb-0.5">Người hoặc đơn vị nhận</span>
                  {isEditingMetadata ? (
                    <input
                      type="text"
                      value={editedMetadata.nguoiDonViNhan}
                      onChange={(e) => setEditedMetadata((prev) => ({ ...prev, nguoiDonViNhan: e.target.value }))}
                      className="w-full p-1 border border-blue-300 rounded text-[11.5px]"
                    />
                  ) : (
                    <span className="text-slate-800 font-medium">{editedMetadata.nguoiDonViNhan}</span>
                  )}
                </div>
              )}
            </div>

            {/* Hàng 4: Định dạng tài liệu | Tình trạng tài liệu */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-2.5">
                <span className="text-[10.5px] text-slate-500 block mb-0.5">Định dạng tài liệu</span>
                <span className="text-slate-800">{editedMetadata.dinhDangTaiLieu}</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10.5px] text-slate-500 block mb-0.5">Tình trạng tài liệu</span>
                <span className="font-semibold text-amber-900">{editedMetadata.tinhTrangTaiLieu}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* B. TÓM TẮT VÀ PHÂN TÍCH NỘI DUNG                                          */}
      {/* ========================================================================= */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div
          onClick={() => toggleSection('B')}
          className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-[#004ac6]">summarize</span>
            <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
              B. Tóm tắt và phân tích nội dung tài liệu
            </h4>
            <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-[#004ac6] border border-blue-200">
              AI Tổng hợp nội dung
            </span>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            {expandedSections.B ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        {expandedSections.B && (
          <div className="p-3.5 space-y-3 text-[11.5px]">
            {/* Tóm tắt nội dung chính */}
            <div className="p-2.5 rounded-md bg-blue-50/40 border border-blue-200/80 space-y-1">
              <span className="text-[10.5px] font-bold text-[#004ac6] uppercase">
                1. Tóm tắt nội dung chính (Nhận định AI):
              </span>
              <p className="text-slate-800 leading-relaxed text-justify">
                {scenarioData.tomTatNoiDung.tomTatChinh}
              </p>
            </div>

            {/* Chủ đề & Mục đích */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                <span className="text-[10.5px] font-bold text-slate-500 block">2. Chủ đề của tài liệu:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{scenarioData.tomTatNoiDung.chuDe}</p>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                <span className="text-[10.5px] font-bold text-slate-500 block">3. Mục đích của tài liệu:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{scenarioData.tomTatNoiDung.mucDich}</p>
              </div>
            </div>

            {/* Những thông tin quan trọng */}
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-slate-700 uppercase">
                4. Những thông tin &amp; số liệu quan trọng:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-800 bg-slate-50/70 p-2.5 rounded border border-slate-200/80">
                {scenarioData.tomTatNoiDung.thongTinQuanTrong.map((info, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {info}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cá nhân, tổ chức, đơn vị liên quan & Thời gian, địa điểm, sự kiện, số liệu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold text-slate-700 uppercase block">
                  5. Cá nhân, tổ chức, đơn vị liên quan:
                </span>
                <div className="space-y-1.5">
                  {scenarioData.tomTatNoiDung.caNhanToChucLienQuan.map((ct, idx) => (
                    <div key={idx} className="p-2 rounded border border-slate-200 bg-white">
                      <p className="font-bold text-slate-900">{ct.ten}</p>
                      <p className="text-[10.5px] text-slate-600">
                        Vai trò: {ct.vaiTro}
                        {ct.dinhDanh ? ` • ${ct.dinhDanh}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold text-slate-700 uppercase block">
                  6. Thời gian, địa điểm, sự kiện &amp; số liệu trích xuất:
                </span>
                <div className="space-y-1.5">
                  {scenarioData.tomTatNoiDung.thoiGianDiaDiemSuKienSoLieu.map((item, idx) => (
                    <div key={idx} className="p-2 rounded border border-slate-200 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-slate-600">{item.nhan}</span>
                        {item.viTri && (
                          <span className="text-[9.5px] text-[#004ac6] bg-blue-50 px-1.5 py-0.2 rounded">
                            {item.viTri}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-900 font-medium mt-0.5">{item.giaTri}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Yêu cầu, trách nhiệm hoặc thời hạn thực hiện nếu có */}
            {scenarioData.tomTatNoiDung.yeuCauTrachNhiemThoiHan && (
              <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200">
                <span className="text-[10.5px] font-bold text-amber-900 uppercase block">
                  7. Yêu cầu, trách nhiệm hoặc thời hạn thực hiện đề cập trong tài liệu:
                </span>
                <p className="text-slate-800 mt-0.5 leading-relaxed">
                  {scenarioData.tomTatNoiDung.yeuCauTrachNhiemThoiHan}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* C. PHÂN TÍCH CHUYÊN BIỆT THEO LOẠI TÀI LIỆU (CHỈ HIỂN THỊ 1 NHÓM TƯƠNG ỨNG) */}
      {/* ========================================================================= */}
      <div className="rounded-lg border border-indigo-200 bg-white overflow-hidden shadow-2xs">
        <div
          onClick={() => toggleSection('C')}
          className="px-3.5 py-2.5 bg-indigo-50/60 border-b border-indigo-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-indigo-700">category</span>
            <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
              C. Phân tích chuyên biệt theo loại tài liệu:{' '}
              <span className="text-indigo-700">{editedMetadata.loaiTaiLieuLabel}</span>
            </h4>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            {expandedSections.C ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        {expandedSections.C && (
          <div className="p-3.5 space-y-3 text-[11.5px]">
            {/* C1. CHỈ HIỂN THỊ KHI LÀ VĂN BẢN */}
            {activeScenario === 'van_ban' && scenarioData.chuyenBietVanBan && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                  <span className="text-[10.5px] text-slate-500 font-semibold block">1. Cơ quan ban hành:</span>
                  <strong className="text-slate-900">{scenarioData.chuyenBietVanBan.coQuanBanHanh}</strong>
                </div>
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                  <span className="text-[10.5px] text-slate-500 font-semibold block">2. Mục đích ban hành:</span>
                  <strong className="text-slate-900">{scenarioData.chuyenBietVanBan.mucDichBanHanh}</strong>
                </div>
                <div className="p-2.5 rounded border border-slate-200 bg-white md:col-span-2">
                  <span className="text-[10.5px] text-slate-500 font-semibold block">3. Trích yếu nội dung:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{scenarioData.chuyenBietVanBan.trichYeuNoiDung}</p>
                </div>
                <div className="p-2.5 rounded border border-slate-200 bg-white md:col-span-2">
                  <span className="text-[10.5px] text-slate-500 font-semibold block">
                    4. Nội dung thông báo / chỉ đạo / yêu cầu:
                  </span>
                  <p className="text-slate-800 mt-0.5">{scenarioData.chuyenBietVanBan.noiDungThongBaoChiDaoYeuCau}</p>
                </div>
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50/50">
                  <span className="text-[10.5px] text-slate-500 font-semibold block">
                    5. Đơn vị / cá nhân chịu trách nhiệm:
                  </span>
                  <strong className="text-slate-900">{scenarioData.chuyenBietVanBan.donViCaNhanChiuTrachNhiem}</strong>
                </div>
                <div className="p-2.5 rounded border border-amber-200 bg-amber-50/50">
                  <span className="text-[10.5px] text-amber-800 font-semibold block">6. Thời hạn thực hiện:</span>
                  <strong className="text-amber-950">
                    {scenarioData.chuyenBietVanBan.thoiHanThucHien || 'Chưa xác định'}
                  </strong>
                </div>
                {scenarioData.chuyenBietVanBan.ketQuaCanThucHien && (
                  <div className="p-2.5 rounded border border-blue-200 bg-blue-50/40 md:col-span-2">
                    <span className="text-[10.5px] text-[#004ac6] font-semibold block">
                      7. Kết quả / Sản phẩm cần thực hiện:
                    </span>
                    <strong className="text-slate-900">{scenarioData.chuyenBietVanBan.ketQuaCanThucHien}</strong>
                  </div>
                )}
              </div>
            )}

            {/* C2. CHỈ HIỂN THỊ KHI LÀ BIỂU MẪU */}
            {activeScenario === 'bieu_mau' && scenarioData.chuyenBietBieuMau && (
              <div className="space-y-3">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10.5px] text-slate-500 block">Tên và loại biểu mẫu:</span>
                    <strong className="text-slate-900 text-[12px]">
                      {scenarioData.chuyenBietBieuMau.tenVaLoaiBieuMau}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 text-[10.5px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      Đã điền: {scenarioData.chuyenBietBieuMau.truongDaDien.length}/
                      {scenarioData.chuyenBietBieuMau.tongSoTruong} trường
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                      Chưa điền: {scenarioData.chuyenBietBieuMau.truongChuaDien.length} trường
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50/30 space-y-1.5">
                    <span className="font-bold text-emerald-900 text-[11px] block">
                      ✓ Các trường thông tin ĐÃ ĐIỀN ({scenarioData.chuyenBietBieuMau.truongDaDien.length}):
                    </span>
                    <ul className="space-y-1 text-[11px]">
                      {scenarioData.chuyenBietBieuMau.truongDaDien.map((f, idx) => (
                        <li key={idx} className="p-1.5 rounded bg-white border border-emerald-100">
                          <span className="text-slate-500">{f.tenTruong}: </span>
                          <strong className="text-slate-900">{f.giaTri}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded border border-rose-200 bg-rose-50/30 space-y-1.5">
                    <span className="font-bold text-rose-900 text-[11px] block">
                      ⚠ Các trường thông tin CHƯA ĐIỀN ({scenarioData.chuyenBietBieuMau.truongChuaDien.length}):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-950 bg-white p-2 rounded border border-rose-100">
                      {scenarioData.chuyenBietBieuMau.truongChuaDien.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-2.5 rounded border border-amber-300 bg-amber-50/60 space-y-1.5">
                  <span className="font-bold text-amber-950 text-[11px] block">
                    Trường có dữ liệu không hợp lệ hoặc không thống nhất:
                  </span>
                  {scenarioData.chuyenBietBieuMau.truongKhongHopLeHoacMauThuan.map((err, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-amber-200">
                      <p className="font-bold text-rose-800">{err.tenTruong}</p>
                      <p className="text-slate-800 mt-0.5">{err.vanDe}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Căn cứ: {err.canCu}</p>
                    </div>
                  ))}
                </div>

                {scenarioData.chuyenBietBieuMau.mucDichSuDung && (
                  <p className="text-[11px] text-slate-600 italic">
                    <strong>Mục đích sử dụng biểu mẫu: </strong>
                    {scenarioData.chuyenBietBieuMau.mucDichSuDung}
                  </p>
                )}
              </div>
            )}

            {/* C3. CHỈ HIỂN THỊ KHI LÀ TÀI LIỆU MINH CHỨNG */}
            {activeScenario === 'minh_chung' && scenarioData.chuyenBietMinhChung && (
              <div className="space-y-2.5">
                <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[10.5px] text-slate-600 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-500">info</span>
                  <span>
                    <strong>Lưu ý nguyên tắc AI:</strong> Hệ thống chỉ mô tả nội dung thể hiện và đối soát thông tin liên quan; không tự kết luận tính xác thực hoặc giá trị chứng minh pháp lý của tài liệu minh chứng.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded border border-slate-200 bg-slate-50/60">
                    <span className="text-[10.5px] text-slate-500 font-semibold block">1. Loại minh chứng:</span>
                    <strong className="text-slate-900">{scenarioData.chuyenBietMinhChung.loaiMinhChung}</strong>
                  </div>
                  <div className="p-2.5 rounded border border-slate-200 bg-slate-50/60">
                    <span className="text-[10.5px] text-slate-500 font-semibold block">
                      2. Sự kiện / Tình tiết được phản ánh:
                    </span>
                    <strong className="text-slate-900">{scenarioData.chuyenBietMinhChung.suKienTinhTietPhanAnh}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-white">
                  <span className="text-[10.5px] text-slate-500 font-semibold block">3. Nội dung thể hiện:</span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">
                    {scenarioData.chuyenBietMinhChung.noiDungTheHien}
                  </p>
                </div>

                <div className="p-2.5 rounded border border-indigo-200 bg-indigo-50/40">
                  <span className="text-[10.5px] text-indigo-900 font-bold block">
                    4. Mối liên hệ với sự việc hoặc hồ sơ khác (Dẫn chứng đối soát):
                  </span>
                  <p className="text-slate-900 font-medium mt-0.5 leading-relaxed">
                    {scenarioData.chuyenBietMinhChung.moiLienHeHoSoKhac}
                  </p>
                </div>

                <div className="p-2.5 rounded border border-amber-200 bg-amber-50/40">
                  <span className="text-[10.5px] text-amber-900 font-bold block">
                    5. Những thông tin chưa thể xác định từ tài liệu:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 mt-0.5">
                    {scenarioData.chuyenBietMinhChung.thongTinChuaTheXacDinh.map((u, idx) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* C4. CHỈ HIỂN THỊ KHI LÀ TÀI LIỆU KHÁC */}
            {activeScenario === 'tai_lieu_khac' && scenarioData.chuyenBietTaiLieuKhac && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded border border-slate-200 bg-slate-50/60">
                    <span className="text-[10.5px] text-slate-500 font-semibold block">1. Chủ đề tài liệu:</span>
                    <strong className="text-slate-900">{scenarioData.chuyenBietTaiLieuKhac.chuDe}</strong>
                  </div>
                  <div className="p-2.5 rounded border border-slate-200 bg-slate-50/60">
                    <span className="text-[10.5px] text-slate-500 font-semibold block">2. Mục đích của tài liệu:</span>
                    <strong className="text-slate-900">{scenarioData.chuyenBietTaiLieuKhac.mucDichTaiLieu}</strong>
                  </div>
                </div>
                <div className="p-2.5 rounded border border-slate-200 bg-white">
                  <span className="text-[10.5px] text-slate-500 font-semibold block">3. Thông tin quan trọng:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-800 mt-1">
                    {scenarioData.chuyenBietTaiLieuKhac.thongTinQuanTrong.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 rounded border border-amber-200 bg-amber-50/50">
                  <span className="text-[10.5px] text-amber-900 font-bold block">
                    4. Những nội dung cần lưu ý hoặc theo dõi:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-800 mt-1">
                    {scenarioData.chuyenBietTaiLieuKhac.noiDungCanLuuYTheoDoi.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* D. KIỂM TRA TÀI LIỆU (CHẤT LƯỢNG OCR, THIẾU TRANG, MÂU THUẪN, TRÙNG LẶP)  */}
      {/* ========================================================================= */}
      <div className="rounded-lg border border-amber-200 bg-white overflow-hidden shadow-2xs">
        <div
          onClick={() => toggleSection('D')}
          className="px-3.5 py-2.5 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-amber-700">rule</span>
            <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
              D. Kiểm tra tài liệu &amp; Cảnh báo đối soát
            </h4>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {scenarioData.kiemTraTaiLieu.length} mục kiểm tra
            </span>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            {expandedSections.D ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        {expandedSections.D && (
          <div className="p-3.5 space-y-2 text-[11.5px]">
            {scenarioData.kiemTraTaiLieu.map((chk) => (
              <div
                key={chk.id}
                className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-start justify-between gap-2 ${
                  chk.mucDo === 'nghiem_trong'
                    ? 'bg-rose-50/60 border-rose-200'
                    : chk.mucDo === 'canh_bao'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        chk.mucDo === 'nghiem_trong'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : chk.mucDo === 'canh_bao'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {chk.nhomLabel}
                    </span>
                  </div>
                  <p className="text-slate-900 font-medium leading-relaxed">{chk.noiDungCuThe}</p>
                  <p className="text-[10.5px] text-slate-600">
                    <strong>Căn cứ trên tài liệu: </strong>
                    {chk.canCuTuTaiLieu}
                  </p>
                </div>

                {chk.fileIndex !== undefined && (
                  <button
                    type="button"
                    onClick={() => onNavigateToDocument(chk.fileIndex!, chk.highlightKey)}
                    className="px-2 py-1 rounded bg-white hover:bg-blue-50 text-[#004ac6] border border-blue-200 text-[10.5px] font-semibold shrink-0 cursor-pointer self-start"
                  >
                    Định vị trên tài liệu ↗
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* E. TRA CỨU TÀI LIỆU VÀ HỒ SƠ LIÊN QUAN (4 NHÓM + DẪN CHỨNG CỤ THỂ)        */}
      {/* ========================================================================= */}
      <div className="rounded-lg border border-blue-200 bg-white overflow-hidden shadow-2xs">
        <div
          onClick={() => toggleSection('E')}
          className="px-3.5 py-2.5 bg-blue-50/60 border-b border-blue-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-[17px] text-[#004ac6]">manage_search</span>
            <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
              E. Tra cứu tài liệu và hồ sơ liên quan
            </h4>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-[#004ac6] border border-blue-300">
              Tìm thấy {scenarioData.traCuuLienQuan.length} hồ sơ / tài liệu có dẫn chứng liên quan
            </span>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            {expandedSections.E ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        {expandedSections.E && (
          <div className="p-3.5 space-y-3 text-[11.5px]">
            {/* Thanh lọc 4 nhóm bắt buộc + Ô tìm kiếm tra cứu */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                {(
                  [
                    { key: 'tat_ca', label: `Tất cả (${countByGroup.tat_ca})` },
                    { key: 'tai_lieu', label: `Tài liệu tiếp nhận đã tồn tại (${countByGroup.tai_lieu})` },
                    { key: 'don', label: `Đơn liên quan (${countByGroup.don})` },
                    { key: 'vu_viec', label: `Vụ việc liên quan (${countByGroup.vu_viec})` },
                    { key: 'luot_nhan', label: `Lượt nhận liên quan (${countByGroup.luot_nhan})` },
                  ] as { key: NhomTraCuuLienQuan; label: string }[]
                ).map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setTraCuuNhomFilter(g.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                      traCuuNhomFilter === g.key
                        ? 'bg-[#004ac6] text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[230px] flex-1 sm:flex-initial">
                <input
                  type="text"
                  value={traCuuSearchText}
                  onChange={(e) => setTraCuuSearchText(e.target.value)}
                  placeholder="Tìm mã TL-2026-0084, Đ-2026-00125, MST, tên..."
                  className="w-full pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-300 rounded-md text-[11px] text-slate-800 focus:outline-none focus:bg-white focus:border-[#004ac6]"
                />
                <span className="material-symbols-outlined text-[14px] text-slate-400 absolute left-2 top-1.5">
                  search
                </span>
              </div>
            </div>

            {/* Danh sách kết quả tra cứu kèm dẫn chứng cụ thể */}
            <div className="space-y-2.5">
              {filteredTraCuuList.map((item) => {
                const isLinked = linkedTargetCode === item.maHoSoTaiLieu;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isLinked
                        ? 'bg-blue-50/50 border-[#004ac6] ring-1 ring-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[#004ac6] text-[12.5px]">
                            {item.maHoSoTaiLieu}
                          </span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            {item.nhomLabel}
                          </span>
                          {item.chuaLienKetDon && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Độc lập • Chưa liên kết với đơn nào
                            </span>
                          )}
                          {item.doTuongDong !== undefined && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Tương đồng {item.doTuongDong}% • Tin cậy AI: {item.doTinCayAI}
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-slate-900 text-[12px]">{item.tenHoacTomTat}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-slate-500">
                          <span>
                            Ngày tiếp nhận: <strong className="text-slate-700">{item.ngayTiepNhan}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Nguồn/Người gửi: <strong className="text-slate-700">{item.nguoiGuiHoacDonVi}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Trạng thái: <strong className="text-blue-800">{item.trangThai}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedTraCuuDetail(item)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">visibility</span>
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLinkedTargetCode(item.maHoSoTaiLieu);
                            const suggestedPA: PhuongAnXuLyTaiLieuType =
                              item.nhom === 'don' ? 'ghep_don' : 'ghi_nhan_tai_lieu';
                            onSelectPhuongAn(
                              suggestedPA,
                              `Xác nhận liên kết / ghép tài liệu lượt nhận vào ${item.nhomLabel.toLowerCase()} mã ${item.maHoSoTaiLieu} (${item.tenHoacTomTat}). Lý do: ${item.lyDoLienQuan}`,
                              item.maHoSoTaiLieu
                            );
                            showToast(`✓ Đã chọn liên kết với ${item.maHoSoTaiLieu} và cập nhật đề xuất xử lý!`);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                            isLinked
                              ? 'bg-[#004ac6] text-white'
                              : 'bg-blue-50 hover:bg-blue-100 text-[#004ac6] border border-blue-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {isLinked ? 'check_circle' : 'add_link'}
                          </span>
                          <span>{isLinked ? 'Đã chọn liên kết' : 'Chọn ghép / Liên kết'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Lý do AI xác định có liên quan & Dẫn chứng cụ thể */}
                    <div className="mt-2 p-2.5 rounded bg-slate-50 border border-slate-200/80 space-y-1">
                      <p className="text-[11px] text-slate-800">
                        <strong className="text-[#004ac6]">Lý do AI xác định có liên quan: </strong>
                        {item.lyDoLienQuan}
                      </p>
                      <div className="pt-0.5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase block">
                          Dẫn chứng đối soát cụ thể:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 pl-1">
                          {item.danChungCuThe.map((dc, i) => (
                            <li key={i}>{dc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* F. ĐỀ XUẤT HƯỚNG XỬ LÝ ĐỐI VỚI TÀI LIỆU KHÔNG PHẢI ĐƠN                   */}
      {/* ========================================================================= */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div
          onClick={() => toggleSection('F')}
          className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-[#a61c1c]">alt_route</span>
            <h4 className="font-bold text-slate-900 text-[12px] uppercase tracking-tight">
              F. Đề xuất hướng xử lý tài liệu (Cán bộ kiểm tra &amp; quyết định)
            </h4>
          </div>
          <span className="text-[10.5px] text-slate-500 italic">
            Không tự động thực thi — Cán bộ chọn phương án và bấm Xác nhận
          </span>
        </div>

        {expandedSections.F && (
          <div className="divide-y divide-slate-100 text-[11.5px]">
            {scenarioData.deXuatXuLy.map((dx) => {
              const isSelected = selectedPhuongAn === dx.phuongAn;
              return (
                <div
                  key={dx.phuongAn}
                  onClick={() => {
                    onSelectPhuongAn(
                      dx.phuongAn,
                      `${dx.tenPhuongAn}: ${dx.lyDoDeXuat} (${dx.thongTinCanCanBoXacNhan})`,
                      dx.targetCodeSuggested
                    );
                  }}
                  className={`p-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-l-[#004ac6]'
                      : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <div className="w-4.5 h-4.5 rounded-full bg-[#004ac6] text-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-[13px]">check</span>
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                        )}
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-[12.5px]">{dx.tenPhuongAn}</span>
                          {dx.isRecommended && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              AI Khuyến nghị
                            </span>
                          )}
                          {dx.doTinCay && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-[#004ac6] border border-blue-200">
                              Độ tin cậy: {dx.doTinCay}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 leading-relaxed">
                          <strong>Lý do đề xuất: </strong>
                          {dx.lyDoDeXuat}
                        </p>

                        <div className="p-2 rounded bg-white/90 border border-slate-200/90 space-y-1">
                          <span className="text-[10.5px] font-bold text-slate-700 block">
                            Dữ liệu làm căn cứ:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                            {dx.duLieuLamCanCu.map((cc, i) => (
                              <li key={i}>{cc}</li>
                            ))}
                          </ul>
                        </div>

                        <p className="text-[11px] text-[#004ac6] font-medium">
                          <strong>Thông tin cần cán bộ xác nhận: </strong>
                          {dx.thongTinCanCanBoXacNhan}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const matchedTarget = scenarioData.traCuuLienQuan.find(
                          (t) => t.maHoSoTaiLieu === (dx.targetCodeSuggested || linkedTargetCode)
                        );
                        onOpenConfirmActionModal(dx.phuongAn, matchedTarget);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white text-[11px] font-bold shrink-0 cursor-pointer shadow-2xs"
                    >
                      Kiểm tra &amp; Thực hiện ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL XEM CHI TIẾT KẾT QUẢ TRA CỨU TÀI LIỆU / HỒ SƠ LIÊN QUAN             */}
      {/* ========================================================================= */}
      {selectedTraCuuDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-fade-in">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#004ac6] text-sm">
                    {selectedTraCuuDetail.maHoSoTaiLieu}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#004ac6] border border-blue-200">
                    {selectedTraCuuDetail.nhomLabel}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {selectedTraCuuDetail.tenHoacTomTat}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTraCuuDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10.5px] text-slate-500 block">Đơn vị quản lý:</span>
                  <strong className="text-slate-900">{selectedTraCuuDetail.chiTietHoSo.donViPhuTrach}</strong>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-500 block">Cán bộ phụ trách:</span>
                  <strong className="text-slate-900">{selectedTraCuuDetail.chiTietHoSo.canBoXuLy}</strong>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-500 block">Ngày tiếp nhận:</span>
                  <strong className="text-slate-900">{selectedTraCuuDetail.ngayTiepNhan}</strong>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-500 block">Trạng thái:</span>
                  <strong className="text-emerald-700">{selectedTraCuuDetail.trangThai}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Dẫn chứng đối soát liên quan:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
                  {selectedTraCuuDetail.danChungCuThe.map((dc, i) => (
                    <li key={i}>{dc}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Tệp đính kèm trong hồ sơ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTraCuuDetail.chiTietHoSo.tepDinhKem.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 italic">
                <strong>Ghi chú hồ sơ: </strong>
                {selectedTraCuuDetail.chiTietHoSo.ghiChuHoSo}
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTraCuuDetail(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = selectedTraCuuDetail;
                  setSelectedTraCuuDetail(null);
                  setLinkedTargetCode(item.maHoSoTaiLieu);
                  const pa: PhuongAnXuLyTaiLieuType = item.nhom === 'don' ? 'ghep_don' : 'ghi_nhan_tai_lieu';
                  onOpenConfirmActionModal(pa, item);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-bold cursor-pointer"
              >
                Xác nhận liên kết với {selectedTraCuuDetail.maHoSoTaiLieu}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhanTichTaiLieuKhongPhaiDonSection;

