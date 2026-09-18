export interface Department {
  id: string;
  name: string;
  shortName: string;
  code: string;
  leaderName: string;
  officerCount: number;
}

export interface Officer {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  departmentName: string;
  workloadCount: number;
  isCurrentUser?: boolean;
  isLeader?: boolean;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface TiepNhanDonItem {
  id: string;
  code: string;
  luotNhanId: string;
  nguoiNop: string;
  loaiDon: string;
  ngayNhan: string;
  ngayChuyenDen: string;
  donViHienTai: string;
  donViTiepNhanId: string;
  donViTiepNhan: string;
  hanXuLy: string;
  hanXuLyFull: string;
  trangThai: 'cho_phan_cong' | 'dang_xu_ly' | 'da_hoan_thanh';
  noiDungTomTat: string;
  ghiChuChuyen?: string;
  nguoiChuyen?: string;
  canBoXuLy?: string;
  canBoXuLyId?: string;
  chucVuCanBo?: string;
  ngayPhanCong?: string;
  nguoiPhanCong?: string;
  ghiChuPhanCong?: string;
  hinhThucChuyen?: 'hang_cho' | 'truc_tiep';
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'tiep-dan',
    name: 'Phòng Tiếp công dân & Xử lý đơn',
    shortName: 'Phòng Tiếp dân',
    code: 'P-TCD',
    leaderName: 'Trần Trọng Giáp',
    officerCount: 5,
  },
  {
    id: 'pc03',
    name: 'Phòng Cảnh sát điều tra tội phạm về tham nhũng, kinh tế, buôn lậu (PC03)',
    shortName: 'Phòng CS Kinh tế (PC03)',
    code: 'PC-03',
    leaderName: 'Đỗ Văn Thắng',
    officerCount: 4,
  },
  {
    id: 'tnmt',
    name: 'Phòng Tài nguyên và Môi trường',
    shortName: 'Phòng TN & MT',
    code: 'P-TNMT',
    leaderName: 'Nguyễn Tiến Đạt',
    officerCount: 3,
  },
  {
    id: 'qldt',
    name: 'Phòng Quản lý Đô thị',
    shortName: 'Phòng QL Đô thị',
    code: 'P-QLDT',
    leaderName: 'Lê Văn Hùng',
    officerCount: 3,
  },
  {
    id: 'thanh-tra',
    name: 'Thanh tra Quận / Huyện',
    shortName: 'Thanh tra Quận',
    code: 'TT-QH',
    leaderName: 'Vũ Đình Cường',
    officerCount: 4,
  },
  {
    id: 'tu-phap',
    name: 'Phòng Tư pháp',
    shortName: 'Phòng Tư pháp',
    code: 'P-TP',
    leaderName: 'Ngô Thu Trang',
    officerCount: 3,
  },
];

export const OFFICERS: Officer[] = [
  // Phòng Tiếp dân & Xử lý đơn
  {
    id: 'OFF-TD-01',
    name: 'Trần Trọng Giáp',
    role: 'Trưởng phòng Tiếp công dân & Xử lý đơn',
    departmentId: 'tiep-dan',
    departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
    workloadCount: 14,
    isLeader: true,
    phone: '0912 345 678',
    email: 'giap.tt@govex.gov.vn',
  },
  {
    id: 'OFF-TD-02',
    name: 'Nguyễn Minh Anh',
    role: 'Cán bộ thụ lý hồ sơ',
    departmentId: 'tiep-dan',
    departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
    workloadCount: 8,
    isCurrentUser: true,
    phone: '0983 123 456',
    email: 'anh.nm@govex.gov.vn',
  },
  {
    id: 'OFF-TD-03',
    name: 'Lê Hoàng Yến',
    role: 'Chuyên viên xử lý đơn thư',
    departmentId: 'tiep-dan',
    departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
    workloadCount: 12,
    phone: '0977 889 900',
    email: 'yen.lh@govex.gov.vn',
  },
  {
    id: 'OFF-TD-04',
    name: 'Vũ Thành Long',
    role: 'Chuyên viên tổng hợp tiếp dân',
    departmentId: 'tiep-dan',
    departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
    workloadCount: 5,
    phone: '0903 221 144',
    email: 'long.vt@govex.gov.vn',
  },
  {
    id: 'OFF-TD-05',
    name: 'Phạm Thu Hương',
    role: 'Cán bộ tiếp nhận một cửa',
    departmentId: 'tiep-dan',
    departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
    workloadCount: 9,
    phone: '0966 332 211',
    email: 'huong.pt@govex.gov.vn',
  },

  // Phòng Cảnh sát kinh tế (PC03)
  {
    id: 'OFF-PC-01',
    name: 'Đỗ Văn Thắng',
    role: 'Phó Thủ trưởng CQĐT (Phó Trưởng phòng)',
    departmentId: 'pc03',
    departmentName: 'Phòng Cảnh sát điều tra tội phạm về tham nhũng, kinh tế, buôn lậu (PC03)',
    workloadCount: 6,
    isLeader: true,
    phone: '0913 222 333',
    email: 'thang.dv@pc03.gov.vn',
  },
  {
    id: 'OFF-PC-02',
    name: 'Hoàng Đức Minh',
    role: 'Điều tra viên chính',
    departmentId: 'pc03',
    departmentName: 'Phòng Cảnh sát điều tra tội phạm về tham nhũng, kinh tế, buôn lậu (PC03)',
    workloadCount: 15,
    phone: '0988 554 321',
    email: 'minh.hd@pc03.gov.vn',
  },
  {
    id: 'OFF-PC-03',
    name: 'Trần Quang Hà',
    role: 'Cán bộ thụ lý đơn tố giác',
    departmentId: 'pc03',
    departmentName: 'Phòng Cảnh sát điều tra tội phạm về tham nhũng, kinh tế, buôn lậu (PC03)',
    workloadCount: 11,
    phone: '0904 112 233',
    email: 'ha.tq@pc03.gov.vn',
  },
  {
    id: 'OFF-PC-04',
    name: 'Nguyễn Thị Mai',
    role: 'Cán bộ điều tra kinh tế',
    departmentId: 'pc03',
    departmentName: 'Phòng Cảnh sát điều tra tội phạm về tham nhũng, kinh tế, buôn lậu (PC03)',
    workloadCount: 8,
    phone: '0912 887 766',
    email: 'mai.nt@pc03.gov.vn',
  },

  // Phòng Tài nguyên và Môi trường
  {
    id: 'OFF-TN-01',
    name: 'Nguyễn Tiến Đạt',
    role: 'Trưởng phòng TN&MT',
    departmentId: 'tnmt',
    departmentName: 'Phòng Tài nguyên và Môi trường',
    workloadCount: 7,
    isLeader: true,
    phone: '0913 888 999',
    email: 'dat.nt@tnmt.gov.vn',
  },
  {
    id: 'OFF-TN-02',
    name: 'Đặng Thuỳ Linh',
    role: 'Chuyên viên địa chính - đất đai',
    departmentId: 'tnmt',
    departmentName: 'Phòng Tài nguyên và Môi trường',
    workloadCount: 16,
    phone: '0979 123 456',
    email: 'linh.dt@tnmt.gov.vn',
  },
  {
    id: 'OFF-TN-03',
    name: 'Bùi Quốc Huy',
    role: 'Chuyên viên quản lý môi trường',
    departmentId: 'tnmt',
    departmentName: 'Phòng Tài nguyên và Môi trường',
    workloadCount: 6,
    phone: '0903 445 566',
    email: 'huy.bq@tnmt.gov.vn',
  },

  // Phòng Quản lý Đô thị
  {
    id: 'OFF-QL-01',
    name: 'Lê Văn Hùng',
    role: 'Trưởng phòng Quản lý Đô thị',
    departmentId: 'qldt',
    departmentName: 'Phòng Quản lý Đô thị',
    workloadCount: 5,
    isLeader: true,
    phone: '0912 667 788',
    email: 'hung.lv@qldt.gov.vn',
  },
  {
    id: 'OFF-QL-02',
    name: 'Phan Đức Thắng',
    role: 'Chuyên viên thẩm định cấp phép XD',
    departmentId: 'qldt',
    departmentName: 'Phòng Quản lý Đô thị',
    workloadCount: 13,
    phone: '0982 334 455',
    email: 'thang.pd@qldt.gov.vn',
  },
  {
    id: 'OFF-QL-03',
    name: 'Nguyễn Quỳnh Nga',
    role: 'Chuyên viên trật tự & quy hoạch',
    departmentId: 'qldt',
    departmentName: 'Phòng Quản lý Đô thị',
    workloadCount: 9,
    phone: '0944 556 677',
    email: 'nga.nq@qldt.gov.vn',
  },

  // Thanh tra
  {
    id: 'OFF-TT-01',
    name: 'Vũ Đình Cường',
    role: 'Chánh Thanh tra',
    departmentId: 'thanh-tra',
    departmentName: 'Thanh tra Quận / Huyện',
    workloadCount: 4,
    isLeader: true,
    phone: '0912 999 111',
    email: 'cuong.vd@thanhtra.gov.vn',
  },
  {
    id: 'OFF-TT-02',
    name: 'Tạ Quang Khải',
    role: 'Thanh tra viên chính',
    departmentId: 'thanh-tra',
    departmentName: 'Thanh tra Quận / Huyện',
    workloadCount: 10,
    phone: '0983 445 566',
    email: 'khai.tq@thanhtra.gov.vn',
  },

  // Phòng Tư pháp
  {
    id: 'OFF-TP-01',
    name: 'Ngô Thu Trang',
    role: 'Trưởng phòng Tư pháp',
    departmentId: 'tu-phap',
    departmentName: 'Phòng Tư pháp',
    workloadCount: 5,
    isLeader: true,
    phone: '0912 111 222',
    email: 'trang.nt@tuphap.gov.vn',
  },
  {
    id: 'OFF-TP-02',
    name: 'Lê Minh Tuấn',
    role: 'Chuyên viên tư pháp & hộ tịch',
    departmentId: 'tu-phap',
    departmentName: 'Phòng Tư pháp',
    workloadCount: 11,
    phone: '0978 990 011',
    email: 'tuan.lm@tuphap.gov.vn',
  },
];

export const INITIAL_TIEP_NHAN_ITEMS: TiepNhanDonItem[] = [
  {
    id: 'TN-2026-00125',
    code: 'Đ-2026-00125',
    luotNhanId: 'LN-2025-0819',
    nguoiNop: 'Nguyễn Văn A',
    loaiDon: 'Đơn tố giác về tội phạm',
    ngayNhan: '16/09/2026 09:15',
    ngayChuyenDen: '16/09/2026 10:30',
    donViHienTai: 'Bộ phận Tiếp nhận đơn',
    donViTiepNhanId: 'tiep-dan',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    hanXuLy: 'Còn 3 ngày',
    hanXuLyFull: '19/09/2026 - 17:00',
    trangThai: 'cho_phan_cong',
    noiDungTomTat: 'Tố giác ông Trần Văn B và Công ty Cổ phần X có hành vi huy động vốn trái phép tại Dự án Khu đô thị Y, chiếm đoạt hơn 3.5 tỷ đồng.',
    ghiChuChuyen: 'Chuyển đơn vị để Trưởng phòng phân công cán bộ thụ lý xác minh sơ bộ theo quy định Thông tư liên tịch 01/2017.',
    nguoiChuyen: 'Cán bộ tiếp nhận Một cửa (Phạm Thu Hương)',
  },
  {
    id: 'TN-2026-00142',
    code: 'Đ-2026-00142',
    luotNhanId: 'LN-2026-0430',
    nguoiNop: 'Nguyễn Hải Phong',
    loaiDon: 'Đơn phản ánh kiến nghị',
    ngayNhan: '15/09/2026 14:20',
    ngayChuyenDen: '16/09/2026 08:45',
    donViHienTai: 'Bộ phận Tiếp nhận đơn',
    donViTiepNhanId: 'tiep-dan',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    hanXuLy: 'Còn 2 ngày',
    hanXuLyFull: '18/09/2026 - 16:30',
    trangThai: 'cho_phan_cong',
    noiDungTomTat: 'Kiến nghị kiểm tra công trình xây dựng số 45 Đội Cấn cơi nới sai phép, lấn chiếm không gian ngõ đi chung của khu dân cư.',
    ghiChuChuyen: 'Chuyển hàng chờ đơn vị. Đề xuất phối hợp Phòng QL Đô thị và UBND Phường.',
    nguoiChuyen: 'Cán bộ tiếp nhận Một cửa (Phạm Thu Hương)',
  },
  {
    id: 'TN-2026-00148',
    code: 'Đ-2026-00148',
    luotNhanId: 'LN-2026-0512',
    nguoiNop: 'Trần Thị Thu Thảo',
    loaiDon: 'Đơn khiếu nại hành chính',
    ngayNhan: '14/09/2026 11:10',
    ngayChuyenDen: '15/09/2026 16:00',
    donViHienTai: 'Bộ phận Tiếp nhận đơn',
    donViTiepNhanId: 'tiep-dan',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    hanXuLy: 'Hôm nay',
    hanXuLyFull: '16/09/2026 - 17:00',
    trangThai: 'cho_phan_cong',
    noiDungTomTat: 'Khiếu nại Quyết định thu hồi đất số 208/QĐ-UBND và phương án bồi thường hỗ trợ tái định cư chưa thỏa đáng tại dự án mở đường.',
    ghiChuChuyen: 'Hồ sơ có nhiều tài liệu đính kèm, đề nghị Trưởng phòng phân công cán bộ có chuyên môn sâu về đất đai giải quyết.',
    nguoiChuyen: 'Cán bộ thụ lý hồ sơ (Nguyễn Minh Anh)',
  },
  {
    id: 'TN-2026-00155',
    code: 'Đ-2026-00155',
    luotNhanId: 'LN-2026-0689',
    nguoiNop: 'Đại diện cư dân TDP 4 (Bà Hoàng Mai Anh)',
    loaiDon: 'Đơn phản ánh kiến nghị',
    ngayNhan: '16/09/2026 08:30',
    ngayChuyenDen: '16/09/2026 09:40',
    donViHienTai: 'Bộ phận Tiếp nhận đơn',
    donViTiepNhanId: 'tiep-dan',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    hanXuLy: 'Còn 5 ngày',
    hanXuLyFull: '21/09/2026 - 17:00',
    trangThai: 'cho_phan_cong',
    noiDungTomTat: 'Phản ánh cơ sở tái chế phế liệu xả khói bụi và phát sinh tiếng ồn ban đêm vượt ngưỡng cho phép tại khu dân cư số 4.',
    ghiChuChuyen: 'Đơn có danh sách đồng ký tên của 42 hộ dân.',
    nguoiChuyen: 'Cán bộ tiếp nhận Một cửa (Phạm Thu Hương)',
  },
  // Các đơn đang xử lý
  {
    id: 'TN-2026-00101',
    code: 'Đ-2026-00101',
    luotNhanId: 'LN-2026-0311',
    nguoiNop: 'Vũ Quốc Toàn',
    loaiDon: 'Đơn tranh chấp đất đai',
    ngayNhan: '12/09/2026 10:00',
    ngayChuyenDen: '12/09/2026 11:15',
    donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
    donViTiepNhanId: 'tiep-dan',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    hanXuLy: 'Còn 4 ngày',
    hanXuLyFull: '20/09/2026 - 17:00',
    trangThai: 'dang_xu_ly',
    noiDungTomTat: 'Tranh chấp ranh giới quyền sử dụng đất giữa thửa số 14 và thửa số 15 tờ bản đồ số 8.',
    canBoXuLy: 'Nguyễn Minh Anh',
    canBoXuLyId: 'OFF-TD-02',
    chucVuCanBo: 'Cán bộ thụ lý hồ sơ',
    ngayPhanCong: '12/09/2026 14:00',
    nguoiPhanCong: 'Trần Trọng Giáp (Trưởng phòng)',
    ghiChuPhanCong: 'Yêu cầu trích đo địa chính và liên hệ các bên đối chiếu hồ sơ.',
  },
  {
    id: 'TN-2026-00098',
    code: 'Đ-2026-00098',
    luotNhanId: 'LN-2026-0298',
    nguoiNop: 'Đỗ Thị Minh Châu',
    loaiDon: 'Đơn tố cáo cán bộ',
    ngayNhan: '10/09/2026 14:15',
    ngayChuyenDen: '11/09/2026 09:00',
    donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
    donViTiepNhanId: 'tiep-dan',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    hanXuLy: 'Còn 1 ngày',
    hanXuLyFull: '17/09/2026 - 17:00',
    trangThai: 'dang_xu_ly',
    noiDungTomTat: 'Tố cáo hành vi sách nhiễu, chậm giải quyết thủ tục cấp GCN QSDĐ tại Chi nhánh VP Đăng ký đất đai.',
    canBoXuLy: 'Lê Hoàng Yến',
    canBoXuLyId: 'OFF-TD-03',
    chucVuCanBo: 'Chuyên viên xử lý đơn thư',
    ngayPhanCong: '11/09/2026 10:30',
    nguoiPhanCong: 'Trần Trọng Giáp (Trưởng phòng)',
    ghiChuPhanCong: 'Xác minh hồ sơ lưu chuyển điện tử Một cửa.',
  },
  // Đơn đã hoàn thành
  {
    id: 'TN-2026-00085',
    code: 'Đ-2026-00085',
    luotNhanId: 'LN-2026-0210',
    nguoiNop: 'Lê Văn Bảy',
    loaiDon: 'Đơn kiến nghị phản ánh',
    ngayNhan: '05/09/2026 09:00',
    ngayChuyenDen: '05/09/2026 10:00',
    donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
    donViTiepNhanId: 'tiep-dan',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    hanXuLy: 'Đã giải quyết',
    hanXuLyFull: '15/09/2026',
    trangThai: 'da_hoan_thanh',
    noiDungTomTat: 'Đề nghị khơi thông hệ thống thoát nước ngõ 12 phố Kim Mã trước mùa mưa bão.',
    canBoXuLy: 'Vũ Thành Long',
    canBoXuLyId: 'OFF-TD-04',
    chucVuCanBo: 'Chuyên viên tổng hợp tiếp dân',
    ngayPhanCong: '05/09/2026 11:00',
    nguoiPhanCong: 'Trần Trọng Giáp (Trưởng phòng)',
    ghiChuPhanCong: 'Đã có văn bản trả lời công dân và gửi Xí nghiệp Thoát nước số 1 xử lý.',
  },
];
