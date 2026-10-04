// src/constants/signingData.ts
import { SigningDocument, LanhDaoAuthority, SignerItem } from '../types/signing';

export const INITIAL_LEADERS: LanhDaoAuthority[] = [
  {
    id: 'ld-01',
    name: 'Đ/c Trần Văn Hùng',
    chucVu: 'Phó Chánh Thanh tra thành phố',
    coQuan: 'Thanh tra Thành phố',
    thamQuyenKy: ['to_trinh_thu_ly', 'quyet_dinh_thu_ly', 'bao_cao_xac_minh', 'ket_luan_to_cao'],
    isAvailable: true,
  },
  {
    id: 'ld-02',
    name: 'Đ/c Trần Văn Cường',
    chucVu: 'Phó Chánh Thanh tra thành phố',
    coQuan: 'Thanh tra Thành phố',
    thamQuyenKy: ['to_trinh_thu_ly', 'quyet_dinh_thu_ly', 'bao_cao_xac_minh'],
    isAvailable: true,
  },
  {
    id: 'ld-05',
    name: 'Đ/c Đặng Quốc Bảo',
    chucVu: 'Chánh Thanh tra thành phố',
    coQuan: 'Ban Lãnh đạo Thanh tra',
    thamQuyenKy: ['to_trinh_thu_ly', 'quyet_dinh_thu_ly', 'bao_cao_xac_minh', 'ket_luan_to_cao'],
    isAvailable: true,
  },
  {
    id: 'ld-03',
    name: 'Đ/c Nguyễn Hoàng Nam',
    chucVu: 'Phó Chủ tịch UBND Quận',
    coQuan: 'UBND Quận',
    thamQuyenKy: ['to_trinh_thu_ly', 'quyet_dinh_thu_ly', 'thong_bao_khong_thu_ly', 'bien_ban_ban_giao', 'van_ban_tra_lai'],
    isAvailable: true,
  },
  {
    id: 'ld-04',
    name: 'Đ/c Phạm Thu Hương',
    chucVu: 'Trưởng phòng Tiếp công dân & Xử lý đơn',
    coQuan: 'Ban Tiếp công dân',
    thamQuyenKy: ['to_trinh_thu_ly', 'bien_ban_ban_giao', 'van_ban_tra_lai', 'thong_bao_khong_thu_ly'],
    isAvailable: true,
  },
  {
    id: 'ld-06',
    name: 'Đ/c Lê Hồng Phong',
    chucVu: 'Thủ trưởng Cơ quan CSĐT',
    coQuan: 'Công an Thành phố',
    thamQuyenKy: ['quyet_dinh_thu_ly', 'ket_luan_to_cao', 'thong_bao_khong_thu_ly'],
    isAvailable: true,
  },
];

export const INITIAL_SIGNING_DOCUMENTS: SigningDocument[] = [
  {
    id: 'VB-2026-0089',
    soKyHieu: '89/TTr-TTTP',
    hoSoCode: 'Đ-2026-00125',
    luotNhanId: 'LN-2025-0819',
    loaiDon: 'Đơn tố cáo cán bộ vi phạm',
    nguoiGuiDon: 'Nguyễn Văn A',
    noiDungDon: 'Tố cáo hành vi bao che vi phạm trật tự xây dựng tại công trình liền kề, xây dựng vượt tầng phá vỡ quy hoạch đã được phản ánh nhiều lần nhưng chưa xử lý dứt điểm.',
    
    tenVanBan: 'Tờ trình đề xuất thụ lý đơn tố cáo vi phạm trật tự xây dựng',
    loaiVanBan: 'to_trinh_thu_ly',
    loaiVanBanLabel: 'Tờ trình đề xuất thụ lý',
    trichYeu: 'V/v Đề xuất thụ lý giải quyết đơn tố cáo đối với hành vi bao che vi phạm trật tự xây dựng tại công trình số 45 đường Lê Lợi',
    noiDungChiTiet: `Kính gửi: Lãnh đạo Thanh tra Thành phố

Căn cứ Luật Tố cáo năm 2018;
Căn cứ Nghị định số 31/2019/NĐ-CP ngày 10/04/2019 của Chính phủ quy định chi tiết một số điều và biện pháp thi hành Luật Tố cáo;
Căn cứ Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh;

Sau khi kiểm tra ban đầu và đối chiếu hồ sơ đơn số Đ-2026-00125 của ông Nguyễn Văn A (CCCD: 001089012345, trú tại: Số 12 ngõ 45 phố Lê Lợi):
1. Tư cách người tố cáo: Đầy đủ năng lực hành vi dân sự, đơn có chữ ký trực tiếp, thông tin nhân thân rõ ràng.
2. Nội dung tố cáo: Tố cáo ông Trần Văn B (Cán bộ phụ trách quản lý trật tự đô thị) có hành vi bao che, không lập biên bản đình chỉ thi công công trình xây dựng vượt 02 tầng tại số 45 Lê Lợi.
3. Căn cứ và tài liệu kèm theo: Bản scan hồ sơ xin phép xây dựng số 89/GPXD, 04 ảnh chụp hiện trạng công trình đang hoàn thiện tầng thứ 7 (vượt 2 tầng), 01 USB ghi nhận hình ảnh làm việc.
4. Thẩm quyền: Vụ việc thuộc thẩm quyền thụ lý giải quyết của Thanh tra Thành phố theo quy định tại Điều 12 Luật Tố cáo 2018.

Ý kiến đề xuất:
Kính trình Lãnh đạo Thanh tra Thành phố:
- Phê duyệt thụ lý giải quyết nội dung tố cáo nêu trên.
- Ban hành Quyết định thụ lý và thành lập Tổ xác minh gồm 03 thành viên.`,

    nguoiLap: 'Nguyễn Minh Anh',
    donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
    ngayTao: '16/09/2026 10:15',
    
    nguoiTrinh: 'Nguyễn Minh Anh',
    thoiGianTrinh: '16/09/2026 14:30',
    yKienCanBo: 'Kính trình Đ/c Phó Chánh Thanh tra xem xét, phê duyệt để hệ thống cấp số thụ lý và triển khai thành lập Tổ xác minh thực địa theo quy định.',
    
    // Luồng ký tuần tự: Lãnh đạo A -> Lãnh đạo B -> Lãnh đạo C
    signers: [
      {
        id: 'ld-01',
        name: 'Đ/c Trần Văn Hùng',
        chucVu: 'Phó Chánh Thanh tra thành phố',
        coQuan: 'Thanh tra Thành phố',
        vaiTro: 'ky',
        thuTu: 1,
        status: 'cho_ky', // Đang chờ Lãnh đạo A ký
      },
      {
        id: 'ld-02',
        name: 'Đ/c Trần Văn Cường',
        chucVu: 'Phó Chánh Thanh tra thành phố',
        coQuan: 'Thanh tra Thành phố',
        vaiTro: 'duyet',
        thuTu: 2,
        status: 'chua_den_luot',
      },
      {
        id: 'ld-05',
        name: 'Đ/c Đặng Quốc Bảo',
        chucVu: 'Chánh Thanh tra thành phố',
        coQuan: 'Ban Lãnh đạo Thanh tra',
        vaiTro: 'ky',
        thuTu: 3,
        status: 'chua_den_luot',
      },
    ],
    currentSignerIndex: 0,

    lanhDaoId: 'ld-01',
    lanhDaoName: 'Đ/c Trần Văn Hùng',
    lanhDaoChucVu: 'Phó Chánh Thanh tra thành phố',
    
    status: 'da_trinh', // Đang chờ Lãnh đạo A ký
    hanXuLy: '24 giờ (Hạn: 17/09/2026 17:00)',
    mucDoUuTien: 'khan',
    
    tepDinhKem: [
      { id: 'att-1', tenTep: 'Du_thao_To_trinh_thu_ly_VB0089.docx', dungLuong: '2.4 MB', loai: 'du_thao' },
      { id: 'att-2', tenTep: 'Ban_scan_Don_to_cao_goc_NguyenVanA.pdf', dungLuong: '5.1 MB', loai: 'chung_cu' },
      { id: 'att-3', tenTep: 'Bien_ban_kiem_tra_hien_trang_xay_dung.pdf', dungLuong: '3.8 MB', loai: 'tai_lieu_kiem_tra' },
    ],
    
    phienBanHienTai: 'V1',
    versionHistory: [
      {
        version: 'V1',
        thoiGian: '16/09/2026 14:30',
        nguoiTao: 'Nguyễn Minh Anh',
        trangThaiLucDo: 'Đã trình',
        ghiChu: 'Bản thảo ban đầu trích xuất từ dữ liệu thụ lý và đối chiếu Luật Tố cáo 2018',
        noiDungSnapshot: 'Bản thảo tờ trình số 89/TTr-TTTP phê duyệt thụ lý giải quyết đơn tố cáo vi phạm xây dựng số 45 Lê Lợi.',
      },
    ],

    history: [
      {
        id: 'h-1',
        time: '16/09/2026 10:15',
        actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        action: 'Tạo dự thảo tờ trình đề xuất thụ lý',
        note: 'AI hỗ trợ trích xuất căn cứ pháp lý theo Luật Tố cáo 2018',
      },
      {
        id: 'h-2',
        time: '16/09/2026 14:30',
        actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        action: 'Nhấn nút [TRÌNH LÃNH ĐẠO] phê duyệt',
        note: 'Đã chuyển đến Đ/c Trần Văn Hùng (Lãnh đạo bước 1)',
      },
    ],
    auditLogs: [
      {
        id: 'al-1',
        time: '16/09/2026 10:15',
        actor: 'Nguyễn Minh Anh',
        actorRole: 'Cán bộ thụ lý',
        action: 'Khởi tạo văn bản dự thảo',
        statusBefore: 'Khởi tạo',
        statusAfter: 'Bản nháp',
        version: 'V1',
        note: 'Soạn thảo tờ trình đề xuất thụ lý số 89/TTr-TTTP',
      },
      {
        id: 'al-2',
        time: '16/09/2026 14:30',
        actor: 'Nguyễn Minh Anh',
        actorRole: 'Cán bộ thụ lý',
        action: 'Trình văn bản đến Lãnh đạo A để ký',
        statusBefore: 'Bản nháp',
        statusAfter: 'Đã trình',
        version: 'V1',
        note: 'Kính trình Đ/c Trần Văn Hùng xem xét, phê duyệt bước 1',
      },
      {
        id: 'al-3',
        time: '16/09/2026 14:31',
        actor: 'Hệ thống tự động',
        actorRole: 'Hệ thống',
        action: 'Tạo nhiệm vụ ký cho Lãnh đạo A (Đ/c Trần Văn Hùng)',
        statusBefore: 'Đã trình',
        statusAfter: 'Chờ ký',
        version: 'V1',
        note: 'Hạn xử lý theo quy chế: 24 giờ',
      },
    ],
    stepId: 'STEP-04',
  },
  {
    id: 'VB-2026-0072',
    soKyHieu: '72/TTr-UBND',
    hoSoCode: 'Đ-2025-0105',
    luotNhanId: 'LN-2025-0105',
    loaiDon: 'Đơn khiếu nại đất đai',
    nguoiGuiDon: 'Vũ Thị Thanh',
    noiDungDon: 'Khiếu nại Quyết định thu hồi đất số 45/QĐ-UBND và phương án bồi thường giá 18.5 triệu/m2 chưa thỏa đáng so với giá thị trường.',
    
    tenVanBan: 'Tờ trình đề xuất đối thoại và xác minh nguồn gốc đất khiếu nại',
    loaiVanBan: 'to_trinh_thu_ly',
    loaiVanBanLabel: 'Tờ trình đề xuất thụ lý',
    trichYeu: 'V/v Đề xuất thụ lý khiếu nại lần 1 và thành lập tổ kiểm tra thực địa thửa đất số 45 tờ bản đồ số 12',
    noiDungChiTiet: `Kính gửi: Phó Chủ tịch UBND Quận

Đơn khiếu nại của bà Vũ Thị Thanh đã nộp trong thời hiệu 90 ngày kể từ ngày nhận Quyết định thu hồi đất.
Cán bộ thụ lý đã đối chiếu hồ sơ địa chính và bảng giá đất hiện hành, kiến nghị Lãnh đạo UBND quận phê duyệt thụ lý lần 1 và giao Phòng TN&MT tổ chức đối thoại công khai với công dân.`,

    nguoiLap: 'Nguyễn Minh Anh',
    donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
    ngayTao: '15/09/2026 14:00',
    
    nguoiTrinh: 'Nguyễn Minh Anh',
    thoiGianTrinh: '15/09/2026 16:45',
    yKienCanBo: 'Kính trình Lãnh đạo UBND phê duyệt thụ lý khiếu nại lần 1.',
    
    signers: [
      {
        id: 'ld-04',
        name: 'Đ/c Phạm Thu Hương',
        chucVu: 'Trưởng phòng Tiếp công dân & Xử lý đơn',
        coQuan: 'Ban Tiếp công dân',
        vaiTro: 'duyet',
        thuTu: 1,
        status: 'da_ky',
        thoiGianKy: '15/09/2026 17:15',
        yKien: 'Đồng ý dự thảo tờ trình. Đề nghị chuyển Lãnh đạo UBND quận xem xét.',
        signatureCert: 'VGCA - 89 22 14 BB 01',
      },
      {
        id: 'ld-03',
        name: 'Đ/c Nguyễn Hoàng Nam',
        chucVu: 'Phó Chủ tịch UBND Quận',
        coQuan: 'UBND Quận',
        vaiTro: 'ky',
        thuTu: 2,
        status: 'tra_lai',
        thoiGianKy: '16/09/2026 08:30',
        yKien: 'Cần bổ sung văn bản xác nhận nguồn gốc đất của UBND Phường trước thời điểm thu hồi và bản trích lục bản đồ địa chính mới nhất trước khi trình ký thụ lý.',
      },
    ],
    currentSignerIndex: 1,

    lanhDaoId: 'ld-03',
    lanhDaoName: 'Đ/c Nguyễn Hoàng Nam',
    lanhDaoChucVu: 'Phó Chủ tịch UBND Quận',
    
    status: 'yeu_cau_chinh_sua', // Bị trả lại
    hanXuLy: 'Hôm nay (17:00)',
    mucDoUuTien: 'khan',
    lyDoTraLai: 'Cần bổ sung văn bản xác nhận nguồn gốc đất của UBND Phường trước thời điểm thu hồi và bản trích lục bản đồ địa chính mới nhất trước khi trình ký thụ lý.',
    
    tepDinhKem: [
      { id: 'att-21', tenTep: 'To_trinh_khiet_nai_VuThiThanh.docx', dungLuong: '1.8 MB', loai: 'du_thao' },
      { id: 'att-22', tenTep: 'Quyet_dinh_thu_hoi_dat_so_45.pdf', dungLuong: '4.2 MB', loai: 'chung_cu' },
    ],
    
    phienBanHienTai: 'V1',
    versionHistory: [
      {
        version: 'V1',
        thoiGian: '15/09/2026 16:45',
        nguoiTao: 'Nguyễn Minh Anh',
        trangThaiLucDo: 'Yêu cầu chỉnh sửa',
        ghiChu: 'Lãnh đạo A (Đ/c Phạm Thu Hương) đã duyệt; Lãnh đạo B (Đ/c Nguyễn Hoàng Nam) yêu cầu chỉnh sửa.',
        noiDungSnapshot: 'Tờ trình ban đầu chưa có bản xác nhận nguồn gốc đất của UBND Phường.',
      },
    ],

    history: [
      {
        id: 'h-11',
        time: '15/09/2026 16:45',
        actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        action: 'Trình lãnh đạo phê duyệt',
        note: 'Trình Đ/c Phạm Thu Hương duyệt bước 1',
      },
      {
        id: 'h-12',
        time: '15/09/2026 17:15',
        actor: 'Đ/c Phạm Thu Hương (Trưởng phòng)',
        action: 'Duyệt văn bản bước 1',
        note: 'Chuyển Lãnh đạo UBND quận',
      },
      {
        id: 'h-13',
        time: '16/09/2026 08:30',
        actor: 'Đ/c Nguyễn Hoàng Nam (Phó Chủ tịch UBND)',
        action: 'Yêu cầu chỉnh sửa tờ trình',
        note: 'Yêu cầu: Bổ sung xác nhận nguồn gốc đất của UBND Phường và bản trích lục bản đồ.',
      },
    ],
    auditLogs: [
      {
        id: 'al-21',
        time: '15/09/2026 16:45',
        actor: 'Nguyễn Minh Anh',
        actorRole: 'Cán bộ thụ lý',
        action: 'Trình văn bản đến Lãnh đạo A (Trưởng phòng)',
        statusBefore: 'Bản nháp',
        statusAfter: 'Đã trình',
        version: 'V1',
      },
      {
        id: 'al-22',
        time: '15/09/2026 17:15',
        actor: 'Đ/c Phạm Thu Hương',
        actorRole: 'Lãnh đạo A (Duyệt)',
        action: 'Ký duyệt bước 1 thành công',
        statusBefore: 'Đang ký',
        statusAfter: 'Chờ ký',
        version: 'V1',
        note: 'Đồng ý dự thảo tờ trình',
      },
      {
        id: 'al-23',
        time: '15/09/2026 17:16',
        actor: 'Hệ thống tự động',
        actorRole: 'Hệ thống',
        action: 'Chuyển nhiệm vụ ký cho Lãnh đạo B (Đ/c Nguyễn Hoàng Nam)',
        statusBefore: 'Chờ ký',
        statusAfter: 'Chờ ký',
        version: 'V1',
      },
      {
        id: 'al-24',
        time: '16/09/2026 08:30',
        actor: 'Đ/c Nguyễn Hoàng Nam',
        actorRole: 'Lãnh đạo B (Ký chính)',
        action: 'Yêu cầu chỉnh sửa nội dung văn bản',
        statusBefore: 'Chờ ký',
        statusAfter: 'Yêu cầu chỉnh sửa',
        version: 'V1',
        note: 'Cần bổ sung văn bản xác nhận nguồn gốc đất của UBND Phường trước khi trình ký lại',
      },
    ],
    stepId: 'STEP-03A',
  },
  {
    id: 'VB-2026-0095',
    soKyHieu: '95/TB-BTCD',
    hoSoCode: 'Đ-2026-00142',
    luotNhanId: 'LN-2026-0912',
    loaiDon: 'Đơn tố cáo nặc danh',
    nguoiGuiDon: 'Không rõ họ tên (Đơn nặc danh)',
    noiDungDon: 'Tố cáo chung chung cán bộ bộ phận Một cửa có thái độ sách nhiễu nhưng không nêu rõ danh tính cán bộ, không có bằng chứng kèm theo.',
    
    tenVanBan: 'Thông báo không đủ điều kiện thụ lý giải quyết tố cáo',
    loaiVanBan: 'thong_bao_khong_thu_ly',
    loaiVanBanLabel: 'Thông báo không thụ lý',
    trichYeu: 'V/v Đơn tố cáo không đủ điều kiện thụ lý theo quy định tại Điều 29 Luật Tố cáo 2018',
    noiDungChiTiet: `Kính gửi: Lãnh đạo Ban Tiếp công dân

Căn cứ Khoản 2 Điều 25 và Điều 29 Luật Tố cáo năm 2018;
Đơn tố cáo gửi đến không ghi rõ họ tên, địa chỉ của người tố cáo; nội dung không có tài liệu, chứng cứ cụ thể chứng minh hành vi vi phạm pháp luật.
Đề xuất: Không thụ lý giải quyết và lưu đơn theo dõi theo quy định.`,

    nguoiLap: 'Nguyễn Minh Anh',
    donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
    ngayTao: '16/09/2026 11:30',
    
    signers: [
      {
        id: 'ld-04',
        name: 'Đ/c Phạm Thu Hương',
        chucVu: 'Trưởng phòng Tiếp công dân & Xử lý đơn',
        coQuan: 'Ban Tiếp công dân',
        vaiTro: 'ky',
        thuTu: 1,
        status: 'cho_ky',
      },
      {
        id: 'ld-01',
        name: 'Đ/c Trần Văn Hùng',
        chucVu: 'Phó Chánh Thanh tra thành phố',
        coQuan: 'Thanh tra Thành phố',
        vaiTro: 'duyet',
        thuTu: 2,
        status: 'chua_den_luot',
      },
    ],
    currentSignerIndex: 0,

    lanhDaoId: 'ld-04',
    lanhDaoName: 'Đ/c Phạm Thu Hương',
    lanhDaoChucVu: 'Trưởng phòng Tiếp công dân & Xử lý đơn',
    
    status: 'cho_trinh', // Cán bộ đã soạn xong, chờ bấm nút Trình ký
    hanXuLy: '03 ngày',
    mucDoUuTien: 'thuong',
    
    tepDinhKem: [
      { id: 'att-31', tenTep: 'Du_thao_TB_khong_thu_ly_Đ2026-00142.docx', dungLuong: '1.1 MB', loai: 'du_thao' },
      { id: 'att-32', tenTep: 'Ban_chup_don_nac_danh.pdf', dungLuong: '2.0 MB', loai: 'chung_cu' },
    ],
    
    phienBanHienTai: 'V1',
    versionHistory: [
      {
        version: 'V1',
        thoiGian: '16/09/2026 11:30',
        nguoiTao: 'Nguyễn Minh Anh',
        trangThaiLucDo: 'Chờ trình',
        ghiChu: 'Hoàn tất soạn thảo dự thảo Thông báo không thụ lý',
        noiDungSnapshot: 'Dự thảo văn bản không thụ lý áp dụng mẫu BM-03/KTL.',
      },
    ],

    history: [
      {
        id: 'h-21',
        time: '16/09/2026 11:30',
        actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        action: 'Tạo văn bản Thông báo không thụ lý',
        note: 'Áp dụng mẫu BM-03/KTL',
      },
    ],
    auditLogs: [
      {
        id: 'al-31',
        time: '16/09/2026 11:30',
        actor: 'Nguyễn Minh Anh',
        actorRole: 'Cán bộ thụ lý',
        action: 'Khởi tạo văn bản dự thảo',
        statusBefore: 'Khởi tạo',
        statusAfter: 'Chờ trình',
        version: 'V1',
        note: 'Soạn thảo hoàn tất dự thảo thông báo không thụ lý',
      },
    ],
    stepId: 'STEP-03B',
  },
  {
    id: 'VB-2026-0065',
    soKyHieu: '65/QĐ-CQĐT',
    hoSoCode: 'Đ-2026-00088',
    luotNhanId: 'LN-2026-0801',
    loaiDon: 'Đơn tố giác tội phạm',
    nguoiGuiDon: 'Trần Đình Trọng',
    noiDungDon: 'Tố giác công ty kinhdong đa cấp có dấu hiệu lừa đảo huy động vốn trái phép số tiền hơn 12 tỷ đồng.',
    
    tenVanBan: 'Quyết định phân công Điều tra viên thụ lý giải quyết nguồn tin tội phạm',
    loaiVanBan: 'quyet_dinh_thu_ly',
    loaiVanBanLabel: 'Quyết định thụ lý / Phân công',
    trichYeu: 'V/v Phân công Điều tra viên thụ lý kiểm tra, xác minh nguồn tin về tội phạm số 88/CQĐT',
    noiDungChiTiet: `Thủ trưởng Cơ quan Cảnh sát điều tra Công an thành phố
Quyết định:
Điều 1. Phân công Đ/c Thượng tá Đặng Đình Toàn - Phó Thủ trưởng CQĐT trực tiếp chỉ đạo; Đ/c Thiếu tá Lê Tuấn Anh - Điều tra viên thụ lý kiểm tra, xác minh nguồn tin tội phạm.
Điều 2. Thời hạn giải quyết: 20 ngày kể từ ngày ký quyết định này.`,

    nguoiLap: 'Nguyễn Minh Anh',
    donViNguoiLap: 'Đội Tham mưu tổng hợp',
    ngayTao: '12/09/2026 09:00',
    
    nguoiTrinh: 'Nguyễn Minh Anh',
    thoiGianTrinh: '12/09/2026 10:30',
    
    signers: [
      {
        id: 'ld-04',
        name: 'Đ/c Phạm Thu Hương',
        chucVu: 'Trưởng phòng Tham mưu',
        coQuan: 'Ban Tiếp công dân',
        vaiTro: 'cho_y_kien',
        thuTu: 1,
        status: 'da_ky',
        thoiGianKy: '12/09/2026 11:15',
        yKien: 'Nhất trí chuyển hồ sơ sang CQĐT giải quyết theo thẩm quyền.',
        signatureCert: 'VGCA - 33 01 99 FF 12',
      },
      {
        id: 'ld-02',
        name: 'Đ/c Trần Văn Cường',
        chucVu: 'Phó Thủ trưởng CQĐT',
        coQuan: 'Công an Thành phố',
        vaiTro: 'duyet',
        thuTu: 2,
        status: 'da_ky',
        thoiGianKy: '12/09/2026 13:40',
        yKien: 'Đã thẩm định hồ sơ, đủ dấu hiệu tội phạm để thụ lý.',
        signatureCert: 'VGCA - 12 AB 44 CD 55',
      },
      {
        id: 'ld-06',
        name: 'Đ/c Lê Hồng Phong',
        chucVu: 'Thủ trưởng Cơ quan CSĐT',
        coQuan: 'Công an Thành phố',
        vaiTro: 'ky',
        thuTu: 3,
        status: 'da_ky',
        thoiGianKy: '12/09/2026 15:20',
        yKien: 'Đồng ý phân công Đ/c Đặng Đình Toàn và Lê Tuấn Anh. Ký ban hành quyết định.',
        signatureCert: 'VGCA - 54 02 1A BC 89 22 FE 09',
        soSeri: '54 02 1A BC 89 22 FE 09',
      },
    ],
    currentSignerIndex: 2,

    lanhDaoId: 'ld-06',
    lanhDaoName: 'Đ/c Lê Hồng Phong',
    lanhDaoChucVu: 'Thủ trưởng Cơ quan CSĐT',
    
    status: 'hoan_tat', // Đã ký hoàn tất toàn bộ các bước
    hanXuLy: 'Đã hoàn thành',
    mucDoUuTien: 'hoa_toc',
    
    tepDinhKem: [
      { id: 'att-41', tenTep: 'Quyet_dinh_phan_cong_DTV_88.pdf', dungLuong: '3.1 MB', loai: 'du_thao' },
    ],
    
    chuKyInfo: {
      nguoiKy: 'Lê Hồng Phong',
      chucVu: 'Thủ trưởng Cơ quan CSĐT - Công an Thành phố',
      coQuan: 'Cơ quan Cảnh sát Điều tra Công an TP',
      thoiGianKy: '12/09/2026 15:20',
      loaiChungThu: 'Chữ ký số chuyên dùng công vụ - VGCA',
      soSeri: '54 02 1A BC 89 22 FE 09',
      yKienLanhDao: 'Đồng ý phân công Đ/c Đặng Đình Toàn và Lê Tuấn Anh. Yêu cầu tập trung tra soát tài khoản ngân hàng và phong tỏa dòng tiền ngay.',
    },
    
    phienBanHienTai: 'V1',
    versionHistory: [
      {
        version: 'V1',
        thoiGian: '12/09/2026 15:20',
        nguoiTao: 'Nguyễn Minh Anh',
        trangThaiLucDo: 'Hoàn tất',
        ghiChu: 'Hoàn tất toàn bộ chu trình 3 cấp phê duyệt',
        noiDungSnapshot: 'Quyết định số 65/QĐ-CQĐT đã ký số ban hành chính thức.',
      },
    ],

    history: [
      {
        id: 'h-31',
        time: '12/09/2026 10:30',
        actor: 'Nguyễn Minh Anh',
        action: 'Trình ký Quyết định phân công',
      },
      {
        id: 'h-32',
        time: '12/09/2026 15:20',
        actor: 'Đ/c Lê Hồng Phong (Thủ trưởng CQĐT)',
        action: 'Ký số văn bản thành công',
        note: 'Ký bằng chữ ký số chuyên dùng VGCA',
        signatureCert: 'VGCA - 54 02 1A BC 89 22 FE 09',
      },
    ],
    auditLogs: [
      {
        id: 'al-41',
        time: '12/09/2026 10:30',
        actor: 'Nguyễn Minh Anh',
        actorRole: 'Cán bộ thụ lý',
        action: 'Trình văn bản đến Lãnh đạo bước 1',
        statusBefore: 'Bản nháp',
        statusAfter: 'Đã trình',
        version: 'V1',
      },
      {
        id: 'al-42',
        time: '12/09/2026 11:15',
        actor: 'Đ/c Phạm Thu Hương',
        actorRole: 'Lãnh đạo bước 1',
        action: 'Cho ý kiến đồng ý & chuyển bước 2',
        statusBefore: 'Chờ ký',
        statusAfter: 'Đang ký',
        version: 'V1',
      },
      {
        id: 'al-43',
        time: '12/09/2026 13:40',
        actor: 'Đ/c Trần Văn Cường',
        actorRole: 'Lãnh đạo bước 2',
        action: 'Ký duyệt bước 2 & chuyển Thủ trưởng CQĐT',
        statusBefore: 'Đang ký',
        statusAfter: 'Đang ký',
        version: 'V1',
      },
      {
        id: 'al-44',
        time: '12/09/2026 15:20',
        actor: 'Đ/c Lê Hồng Phong',
        actorRole: 'Lãnh đạo ký chính (Bước 3)',
        action: 'Ký số VGCA phê duyệt ban hành',
        statusBefore: 'Đang ký',
        statusAfter: 'Hoàn tất',
        version: 'V1',
        note: 'Quyết định có hiệu lực thi hành kể từ ngày ký',
        signatureCert: 'VGCA - 54 02 1A BC 89 22 FE 09',
      },
    ],
    stepId: 'STEP-05',
  },
  {
    id: 'VB-2026-0044',
    soKyHieu: '44/BB-SYT',
    hoSoCode: 'Đ-2026-00041',
    luotNhanId: 'LN-2026-0715',
    loaiDon: 'Đơn tố cáo sai phạm tài chính',
    nguoiGuiDon: 'Hoàng Kim Dung',
    noiDungDon: 'Tố cáo hành vi thu tiền phụ phí trái quy định tại Trung tâm y tế huyện.',
    
    tenVanBan: 'Biên bản bàn giao hồ sơ đơn tố cáo sang Thanh tra Sở Y tế',
    loaiVanBan: 'bien_ban_ban_giao',
    loaiVanBanLabel: 'Biên bản bàn giao',
    trichYeu: 'V/v Bàn giao hồ sơ đơn tố cáo theo thẩm quyền ngành dọc sang Thanh tra Sở Y tế giải quyết',
    noiDungChiTiet: `Căn cứ phân cấp thẩm quyền, vụ việc sai phạm tài chính tại đơn vị trực thuộc Sở Y tế thuộc thẩm quyền giải quyết của Giám đốc Sở Y tế. Ban Tiếp công dân tiến hành bàn giao toàn bộ hồ sơ kèm tài liệu chứng cứ cho Thanh tra Sở Y tế.`,

    nguoiLap: 'Nguyễn Minh Anh',
    donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
    ngayTao: '10/09/2026 14:15',
    
    signers: [
      {
        id: 'ld-04',
        name: 'Đ/c Phạm Thu Hương',
        chucVu: 'Trưởng phòng Tiếp công dân & Xử lý đơn',
        coQuan: 'Ban Tiếp công dân',
        vaiTro: 'ky',
        thuTu: 1,
        status: 'chua_den_luot',
      },
    ],
    currentSignerIndex: 0,

    lanhDaoId: 'ld-04',
    lanhDaoName: 'Đ/c Phạm Thu Hương',
    lanhDaoChucVu: 'Trưởng phòng Tiếp công dân & Xử lý đơn',
    
    status: 'nhap', // Nháp
    mucDoUuTien: 'thuong',
    
    tepDinhKem: [
      { id: 'att-51', tenTep: 'Bien_ban_ban_giao_SYT.docx', dungLuong: '1.2 MB', loai: 'du_thao' },
    ],
    
    phienBanHienTai: 'V1',
    versionHistory: [
      {
        version: 'V1',
        thoiGian: '10/09/2026 14:15',
        nguoiTao: 'Nguyễn Minh Anh',
        trangThaiLucDo: 'Bản nháp',
        ghiChu: 'Lập bản thảo ban đầu',
        noiDungSnapshot: 'Bản nháp biên bản bàn giao hồ sơ vụ việc sang Sở Y tế.',
      },
    ],

    history: [
      {
        id: 'h-41',
        time: '10/09/2026 14:15',
        actor: 'Nguyễn Minh Anh',
        action: 'Lập bản thảo biên bản bàn giao',
      },
    ],
    auditLogs: [
      {
        id: 'al-51',
        time: '10/09/2026 14:15',
        actor: 'Nguyễn Minh Anh',
        actorRole: 'Cán bộ thụ lý',
        action: 'Tạo bản thảo biên bản bàn giao',
        statusBefore: 'Khởi tạo',
        statusAfter: 'Bản nháp',
        version: 'V1',
      },
    ],
    stepId: 'STEP-03C',
  },
  {
    id: 'VB-2026-0038',
    soKyHieu: '38/TTr-TNMT',
    hoSoCode: 'Đ-2026-00032',
    luotNhanId: 'LN-2026-0688',
    loaiDon: 'Đơn kiến nghị đất đai',
    nguoiGuiDon: 'Lê Văn Cường',
    noiDungDon: 'Kiến nghị cấp giấy chứng nhận QSDĐ đối với đất lấn chiếm hành lang đê điều.',
    
    tenVanBan: 'Tờ trình đề xuất cấp Giấy chứng nhận QSDĐ',
    loaiVanBan: 'to_trinh_thu_ly',
    loaiVanBanLabel: 'Tờ trình đề xuất',
    trichYeu: 'V/v Đề xuất thụ lý hồ sơ cấp GCNQSDĐ cho thửa đất nằm trong hành lang thoát lũ',
    noiDungChiTiet: `Đề xuất thụ lý xem xét hồ sơ công nhận quyền sử dụng đất.`,

    nguoiLap: 'Trần Văn Nam',
    donViNguoiLap: 'Phòng Tài nguyên và Môi trường',
    ngayTao: '08/09/2026 09:30',
    
    nguoiTrinh: 'Trần Văn Nam',
    thoiGianTrinh: '08/09/2026 11:00',
    
    signers: [
      {
        id: 'ld-03',
        name: 'Đ/c Nguyễn Hoàng Nam',
        chucVu: 'Phó Chủ tịch UBND Quận',
        coQuan: 'UBND Quận',
        vaiTro: 'ky',
        thuTu: 1,
        status: 'tu_choi',
        thoiGianKy: '09/09/2026 14:00',
        yKien: 'Đất nằm hoàn toàn trong chỉ giới bảo vệ hành lang an toàn đê điều theo Luật Đê điều 2006, nghiêm cấm cấp giấy chứng nhận. Yêu cầu lập văn bản trả lại đơn.',
      },
    ],
    currentSignerIndex: 0,

    lanhDaoId: 'ld-03',
    lanhDaoName: 'Đ/c Nguyễn Hoàng Nam',
    lanhDaoChucVu: 'Phó Chủ tịch UBND Quận',
    
    status: 'tu_choi', // Lãnh đạo từ chối ký
    hanXuLy: 'Đã đóng',
    mucDoUuTien: 'thuong',
    lyDoTuChoi: 'Đất nằm hoàn toàn trong chỉ giới bảo vệ hành lang an toàn đê điều theo Luật Đê điều 2006, nghiêm cấm cấp giấy chứng nhận. Yêu cầu lập văn bản trả lại đơn và giải thích rõ quy định pháp luật cho công dân.',
    
    tepDinhKem: [
      { id: 'att-61', tenTep: 'To_trinh_cap_GCN_LeVanCuong.docx', dungLuong: '1.9 MB', loai: 'du_thao' },
    ],
    
    phienBanHienTai: 'V1',
    versionHistory: [
      {
        version: 'V1',
        thoiGian: '08/09/2026 09:30',
        nguoiTao: 'Trần Văn Nam',
        trangThaiLucDo: 'Từ chối',
        ghiChu: 'Lãnh đạo từ chối phê duyệt do vi phạm Luật Đê điều',
        noiDungSnapshot: 'Tờ trình ban đầu đề xuất cấp giấy chứng nhận.',
      },
    ],

    history: [
      {
        id: 'h-51',
        time: '08/09/2026 11:00',
        actor: 'Trần Văn Nam',
        action: 'Trình Lãnh đạo ký tờ trình',
      },
      {
        id: 'h-52',
        time: '09/09/2026 14:00',
        actor: 'Đ/c Nguyễn Hoàng Nam (Phó Chủ tịch UBND)',
        action: 'Từ chối ký văn bản',
        note: 'Từ chối do vi phạm Luật Đê điều',
      },
    ],
    auditLogs: [
      {
        id: 'al-61',
        time: '08/09/2026 11:00',
        actor: 'Trần Văn Nam',
        actorRole: 'Cán bộ thụ lý',
        action: 'Trình văn bản',
        statusBefore: 'Bản nháp',
        statusAfter: 'Đã trình',
        version: 'V1',
      },
      {
        id: 'al-62',
        time: '09/09/2026 14:00',
        actor: 'Đ/c Nguyễn Hoàng Nam',
        actorRole: 'Lãnh đạo ký duyệt',
        action: 'Từ chối ký văn bản',
        statusBefore: 'Chờ ký',
        statusAfter: 'Từ chối',
        version: 'V1',
        note: 'Nghiêm cấm cấp sổ theo Luật Đê điều',
      },
    ],
  },
  {
    id: 'VB-2026-0104',
    soKyHieu: '104/KH-TTTP',
    hoSoCode: 'Đ-2026-00156',
    luotNhanId: 'LN-2026-1011',
    loaiDon: 'Đơn tố cáo vi phạm đất đai',
    nguoiGuiDon: 'Phạm Minh Tuấn',
    noiDungDon: 'Tố cáo hành vi cấp giấy chứng nhận quyền sử dụng đất sai diện tích tại khu dân cư mới.',
    tenVanBan: 'Tờ trình phê duyệt Kế hoạch xác minh nội dung tố cáo',
    loaiVanBan: 'to_trinh_thu_ly',
    loaiVanBanLabel: 'Tờ trình đề xuất thụ lý',
    trichYeu: 'V/v Đề xuất phê duyệt Kế hoạch xác minh 15 ngày đối với nội dung tố cáo cấp sổ đỏ sai diện tích',
    noiDungChiTiet: `Kính gửi: Lãnh đạo Thanh tra Thành phố

Căn cứ Quyết định thụ lý tố cáo số 156/QĐ-TTTP;
Cán bộ thụ lý xây dựng dự thảo Kế hoạch xác minh nội dung tố cáo:
1. Mục đích: Làm rõ ranh giới, diện tích thửa đất theo hồ sơ kỹ thuật thửa đất năm 2018 so với hiện trạng thực tế.
2. Nội dung xác minh: Làm việc với UBND Phường, Chi nhánh Văn phòng Đăng ký đất đai, tiến hành đo đạc hiện trạng.
3. Thời hạn thực hiện: 15 ngày làm việc kể từ ngày phê duyệt kế hoạch.

Kính trình Lãnh đạo Thanh tra xem xét, phê duyệt để triển khai thực hiện.`,
    nguoiLap: 'Nguyễn Minh Anh',
    donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
    ngayTao: '16/09/2026 15:10',
    nguoiTrinh: 'Nguyễn Minh Anh',
    thoiGianTrinh: '16/09/2026 15:40',
    yKienCanBo: 'Kính trình Đ/c Phó Chánh Thanh tra phê duyệt Kế hoạch xác minh để Tổ công tác xuống địa bàn làm việc.',
    
    signers: [
      {
        id: 'ld-01',
        name: 'Đ/c Trần Văn Hùng',
        chucVu: 'Phó Chánh Thanh tra thành phố',
        coQuan: 'Thanh tra Thành phố',
        vaiTro: 'ky',
        thuTu: 1,
        status: 'cho_ky',
      },
      {
        id: 'ld-05',
        name: 'Đ/c Đặng Quốc Bảo',
        chucVu: 'Chánh Thanh tra thành phố',
        coQuan: 'Ban Lãnh đạo Thanh tra',
        vaiTro: 'duyet',
        thuTu: 2,
        status: 'chua_den_luot',
      },
    ],
    currentSignerIndex: 0,

    lanhDaoId: 'ld-01',
    lanhDaoName: 'Đ/c Trần Văn Hùng',
    lanhDaoChucVu: 'Phó Chánh Thanh tra thành phố',
    status: 'da_trinh',
    hanXuLy: '48 giờ (Hạn: 18/09/2026 17:00)',
    mucDoUuTien: 'thuong',
    tepDinhKem: [
      { id: 'att-71', tenTep: 'Ke_hoach_xac_minh_so_156.docx', dungLuong: '1.4 MB', loai: 'du_thao' },
      { id: 'att-72', tenTep: 'So_do_ranh_gioi_thua_dat.pdf', dungLuong: '3.5 MB', loai: 'tai_lieu_kiem_tra' },
    ],
    
    phienBanHienTai: 'V1',
    versionHistory: [
      {
        version: 'V1',
        thoiGian: '16/09/2026 15:10',
        nguoiTao: 'Nguyễn Minh Anh',
        trangThaiLucDo: 'Đã trình',
        ghiChu: 'Kế hoạch xác minh dự thảo ban đầu',
        noiDungSnapshot: 'Kế hoạch xác minh 15 ngày đối với vụ việc số Đ-2026-00156.',
      },
    ],

    history: [
      {
        id: 'h-61',
        time: '16/09/2026 15:40',
        actor: 'Nguyễn Minh Anh',
        action: 'Trình lãnh đạo phê duyệt Kế hoạch xác minh',
      },
    ],
    auditLogs: [
      {
        id: 'al-71',
        time: '16/09/2026 15:40',
        actor: 'Nguyễn Minh Anh',
        actorRole: 'Cán bộ thụ lý',
        action: 'Trình văn bản đến Lãnh đạo A',
        statusBefore: 'Bản nháp',
        statusAfter: 'Đã trình',
        version: 'V1',
      },
      {
        id: 'al-72',
        time: '16/09/2026 15:41',
        actor: 'Hệ thống tự động',
        actorRole: 'Hệ thống',
        action: 'Tạo nhiệm vụ ký cho Đ/c Trần Văn Hùng',
        statusBefore: 'Đã trình',
        statusAfter: 'Chờ ký',
        version: 'V1',
      },
    ],
    stepId: 'STEP-04',
  },
];
