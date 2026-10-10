export type StepStatus = 'completed' | 'active' | 'pending';

export type DocStatus =
  | 'ban_nhap'
  | 'da_trinh'
  | 'da_ky'
  | 'da_phe_duyet'
  | 'da_ban_hanh'
  | 'yeu_cau_chinh_sua';

export interface DocumentInfo {
  id: string;
  tenVanBan: string;
  soKyHieu?: string;
  loaiVanBan: string; // 'Báo cáo xác minh' | 'Tờ trình' | 'Quyết định' | 'Thông báo' | 'Biên bản' | 'Phiếu phân loại' ...
  nguoiTao: string;
  chucVuNguoiTao: string;
  thoiGianTao: string;
  phienBan: string; // e.g., 'v1.0', 'v1.2', 'v2.0'
  fileDinhKem?: {
    tenFile: string;
    dungLuong: string;
    dinhDang: 'pdf' | 'docx' | 'xlsx';
    soTrang?: number;
    ngayCapNhat?: string;
  };
  noiDungTomTat: string;
  noiDungChiTiet: string;
  trangThaiVanBan: DocStatus;
  trangThaiText: string;
  chuKySo?: {
    nguoiKy: string;
    thoiGianKy: string;
    chungThu: string;
    trangThaiChuKy: 'hop_le' | 'chua_ky';
  };
}

export type ApprovalActionType =
  | 'trinh'
  | 'ky' // Đã ký (ký nháy, ký thừa ủy quyền, ký xác nhận)
  | 'phe_duyet' // Đã phê duyệt (quyết định phê duyệt cao nhất)
  | 'yeu_cau_chinh_sua' // Yêu cầu chỉnh sửa (trả lại)
  | 'tu_choi' // Từ chối
  | 'chuyen_tiep'; // Chuyển tiếp

export interface ApprovalStepParticipant {
  id: string;
  hoTen: string;
  chucVu: string;
  donVi: string;
  vaiTro: 'nguoi_trinh' | 'nguoi_nhan_trinh' | 'lanh_dao_phe_duyet' | 'can_bo_phoi_hop';
  vaiTroText: string; // e.g. "Người trình văn bản", "Người nhận trình (Ký nháy chuyên môn)", "Lãnh đạo có thẩm quyền phê duyệt"
  hanhDong: ApprovalActionType;
  hanhDongText: string; // 'Đã trình văn bản' | 'Đã ký (Ký nháy)' | 'Đã phê duyệt' | 'Yêu cầu chỉnh sửa' ...
  trangThaiXuLy: 'hoan_thanh' | 'cho_xu_ly' | 'da_tra_lai' | 'dang_xem_xet';
  trangThaiXuLyText: string; // 'Hoàn thành' | 'Chờ xử lý' | 'Đã trả lại' | 'Đang xem xét'
  thoiGian: string;
  yKien?: string;
  phienBanXuLy: string; // e.g. 'v1.0', 'v1.2'
  hinhThuc?: 'tuan_tu' | 'dong_thoi'; // Trình tuần tự hoặc Trình đồng thời
  soThuTu: number;
}

export interface SubmissionRound {
  id: string;
  luotTrinh: number; // 1, 2...
  tieuDeLuot: string; // 'Lượt trình 1 (Yêu cầu chỉnh sửa)' | 'Lượt trình 2 (Trình lại & Phê duyệt)'
  kieuTrinh: 'tuan_tu' | 'dong_thoi'; // 'tuan_tu' = Trình tuần tự | 'dong_thoi' = Trình đồng thời nhiều lãnh đạo
  kieuTrinhText: string; // 'Trình tuần tự' | 'Trình đồng thời nhiều lãnh đạo'
  thoiGianBatDau: string;
  thoiGianKetThuc?: string;
  phienBanVanBan: string;
  ketQuaCuoiCung: string; // 'Yêu cầu chỉnh sửa & hoàn thiện lại hồ sơ' | 'Đã phê duyệt và ban hành' | 'Đang xử lý lấy ý kiến'
  ketQuaStatus: 'phe_duyet' | 'tra_lai' | 'dang_xu_ly';
  nguoiTrinh: {
    hoTen: string;
    chucVu: string;
    thoiGian: string;
  };
  danhSachNguoiThamGia: ApprovalStepParticipant[];
}

export interface GovexNodeDetail {
  id: string;
  name: string;
  code?: string;
  role: 'can_bo' | 'lanh_dao' | 'he_thong';
  roleName: string;
  stageName: string;
  macroPhase: 'don_to_cao' | 'rut_don';
  status: StepStatus;
  trangThaiText: string; // 'Đã hoàn thành' | 'Đang xử lý' | 'Chờ xử lý'

  // A. THÔNG TIN CHUNG
  thoiGianBatDau: string;
  thoiGianHoanThanh: string; // hoặc 'Dự kiến: ...'
  thoiDiemChuyenTiep: string; // Thời điểm chuyển sang step tiếp theo
  noiDungCongViec: string; // Nội dung công việc đã thực hiện
  legalBasis?: string;
  description?: string;
  suggestedAction?: string;
  ketQuaCuoiCung: {
    tieuDe: string;
    vanBanDauRa: string;
    trangThaiHoSo: string;
    thoiHanThucHien: string;
    chiTietKetQua: string;
  };
  nguoiHanhDong: {
    canBoThucHien: {
      hoTen: string;
      chucVu: string;
      donVi: string;
      hanhDongCuThe: string;
    };
    lanhDaoKyDuyet?: {
      hoTen: string;
      chucVu: string;
      donVi: string;
      hanhDongCuThe: string;
    };
    donViPhoiHop?: string;
  };

  // B. TÀI LIỆU VÀ VĂN BẢN (Nếu step có tạo hoặc xử lý văn bản; null nếu không có)
  taiLieuVanBan?: DocumentInfo | null;

  // C. LỊCH SỬ TRÌNH KÝ VÀ PHÊ DUYỆT (Nếu step có trình ký; null nếu không có)
  lichSuTrinhKy?: SubmissionRound[] | null;
}

export const GOVEX_NODES_DATA: Record<string, GovexNodeDetail> = {
  'tn-1': {
    id: 'tn-1',
    name: '1. Tiếp nhận đơn',
    code: 'BƯỚC 1 (GĐ 1)',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'completed',
    trangThaiText: 'Đã hoàn thành',
    thoiGianBatDau: '08:00 - 12/03/2026',
    thoiGianHoanThanh: '11:30 - 12/03/2026',
    thoiDiemChuyenTiep: '11:35 - 12/03/2026 (Chuyển tiếp sang Bước 2)',
    noiDungCongViec:
      'Tiếp nhận đơn tố cáo từ công dân trực tiếp tại Bộ phận Một cửa. Kiểm tra tính pháp lý của thông tin người nộp đơn qua căn cước công dân/VNeID, đối chiếu tài liệu, chứng cứ kèm theo, quét số hóa 100% hồ sơ, vào sổ tiếp nhận điện tử và xuất Giấy biên nhận.',
    legalBasis: 'Điều 23 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    description:
      'Tiếp nhận đơn tố cáo từ các nguồn (trực tiếp, dịch vụ bưu chính, Cổng DVC, chuyển từ cơ quan khác). Vào sổ tiếp nhận điện tử và lập phiếu biên nhận.',
    suggestedAction: 'Kiểm tra thông tin người nộp, đối tượng bị tố cáo và tài liệu đính kèm.',
    ketQuaCuoiCung: {
      tieuDe: 'Đã vào sổ điện tử & Ban hành Giấy biên nhận tiếp nhận đơn',
      vanBanDauRa: 'Giấy biên nhận tiếp nhận đơn (Mẫu số 01/BN) & Sổ tiếp nhận điện tử',
      trangThaiHoSo: 'Đã tiếp nhận hợp lệ – Cấp mã hồ sơ điện tử Đ-2026-00125',
      thoiHanThucHien: 'Trong ngày làm việc (24 giờ kể từ khi tiếp nhận)',
      chiTietKetQua:
        'Đơn và tài liệu kèm theo được số hóa 100%, cấp mã số tiếp nhận duy nhất trên hệ thống, xác thực danh tính người nộp qua VNeID/CCCD và giao Giấy biên nhận cho người nộp đơn.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn tiếp nhận hồ sơ',
        donVi: 'Bộ phận Tiếp nhận & Một cửa',
        hanhDongCuThe:
          'Trực tiếp tiếp nhận đơn, kiểm tra tính đầy đủ của tài liệu kèm theo, đối chiếu CCCD/VNeID, nhập dữ liệu vào phần mềm và in Giấy biên nhận giao cho công dân.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Trung tá Lê Hồng Hải',
        chucVu: 'Chỉ huy phụ trách Bộ phận Một cửa / Tiếp dân',
        donVi: 'Phòng Tiếp công dân & Xử lý đơn',
        hanhDongCuThe:
          'Kiểm tra sổ theo dõi tiếp nhận định kỳ và phân công cán bộ chuyên môn thụ lý sơ bộ.',
      },
      donViPhoiHop: 'Văn thư cơ quan: Đóng dấu tiếp nhận và vào sổ công văn đến điện tử.',
    },
    taiLieuVanBan: {
      id: 'doc-tn-1',
      tenVanBan: 'Giấy biên nhận tiếp nhận đơn tố cáo (Mẫu số 01/BN)',
      soKyHieu: 'Số 01/BN-TCD',
      loaiVanBan: 'Giấy biên nhận',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ chuyên môn tiếp nhận hồ sơ',
      thoiGianTao: '09:15 - 12/03/2026',
      phienBan: 'v1.0 (Chính thức)',
      fileDinhKem: {
        tenFile: 'Giay_bien_nhan_tiep_nhan_don_01_BN.pdf',
        dungLuong: '450 KB',
        dinhDang: 'pdf',
        soTrang: 2,
        ngayCapNhat: '12/03/2026 09:30',
      },
      noiDungTomTat:
        'Xác nhận đã tiếp nhận 01 đơn tố cáo của Đại diện cư dân TDP số 3 cùng 05 tài liệu chứng cứ kèm theo (bản chụp hiện trường, biên bản tổ dân phố, trích lục bản đồ).',
      noiDungChiTiet:
        'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nGIẤY BIÊN NHẬN TIẾP NHẬN ĐƠN\nSố: 01/BN-TCD\n\n1. Người nộp đơn: Đại diện cư dân TDP số 3 (Đại diện: Ông Trần Văn Nam, CCCD: 001085012345)\n2. Thời điểm tiếp nhận: 08 giờ 30 phút, ngày 12 tháng 03 năm 2026.\n3. Nội dung tố cáo: Sai phạm trật tự xây dựng & lấn chiếm lối đi chung tại ngõ 128 Đội Cấn.\n4. Hồ sơ kèm theo gồm:\n- Đơn tố cáo gốc có chữ ký của 12 hộ dân.\n- Ảnh chụp hiện trường xây dựng vượt tầng.\n- Bản sao trích đo địa chính năm 2020.\n5. Cán bộ tiếp nhận: Nguyễn Minh Anh đã kiểm tra tính hợp lệ và vào Sổ tiếp nhận điện tử số Đ-2026-00125.',
      trangThaiVanBan: 'da_ban_hanh',
      trangThaiText: 'Đã ban hành',
      chuKySo: {
        nguoiKy: 'Trung tá Lê Hồng Hải',
        thoiGianKy: '12/03/2026 10:00:15',
        chungThu: 'Ban Cơ yếu Chính phủ - CA Bộ phận Tiếp dân',
        trangThaiChuKy: 'hop_le',
      },
    },
    lichSuTrinhKy: [
      {
        id: 'round-tn-1',
        luotTrinh: 1,
        tieuDeLuot: 'Lượt trình 1 (Duyệt sổ tiếp nhận & Ban hành Biên nhận)',
        kieuTrinh: 'tuan_tu',
        kieuTrinhText: 'Trình tuần tự (Sequential)',
        thoiGianBatDau: '09:30 - 12/03/2026',
        thoiGianKetThuc: '10:15 - 12/03/2026',
        phienBanVanBan: 'v1.0',
        ketQuaCuoiCung: 'Đã phê duyệt và ban hành Giấy biên nhận',
        ketQuaStatus: 'phe_duyet',
        nguoiTrinh: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ tiếp nhận hồ sơ',
          thoiGian: '09:30 - 12/03/2026',
        },
        danhSachNguoiThamGia: [
          {
            id: 'p-tn1-1',
            soThuTu: 1,
            hoTen: 'Nguyễn Minh Anh',
            chucVu: 'Cán bộ chuyên môn tiếp nhận',
            donVi: 'Bộ phận Tiếp nhận & Một cửa',
            vaiTro: 'nguoi_trinh',
            vaiTroText: 'Người trình văn bản',
            hanhDong: 'trinh',
            hanhDongText: 'Đã lập & Trình duyệt',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '09:30 - 12/03/2026',
            phienBanXuLy: 'v1.0',
            yKien: 'Kính trình Chỉ huy phụ trách duyệt sổ tiếp nhận điện tử và ký số Giấy biên nhận giao công dân.',
          },
          {
            id: 'p-tn1-2',
            soThuTu: 2,
            hoTen: 'Trung tá Lê Hồng Hải',
            chucVu: 'Chỉ huy phụ trách Tiếp dân',
            donVi: 'Phòng Tiếp công dân & Xử lý đơn',
            vaiTro: 'lanh_dao_phe_duyet',
            vaiTroText: 'Lãnh đạo có thẩm quyền phê duyệt',
            hanhDong: 'phe_duyet',
            hanhDongText: 'ĐÃ PHÊ DUYỆT (Ký số CA)',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '10:15 - 12/03/2026',
            phienBanXuLy: 'v1.0',
            yKien: 'Đồng ý tiếp nhận. Giao Tổ Xác minh & Xử lý đơn rà soát điều kiện thụ lý trong thời hạn 07 ngày làm việc.',
          },
        ],
      },
    ],
  },

  'tn-2': {
    id: 'tn-2',
    name: '2. Kiểm tra & Xác minh điều kiện thụ lý',
    code: 'BƯỚC 2 (GĐ 1)',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'active',
    trangThaiText: 'Đang xử lý',
    thoiGianBatDau: '13:30 - 12/03/2026',
    thoiGianHoanThanh: 'Dự kiến: 17:00 - 16/03/2026',
    thoiDiemChuyenTiep: 'Đang thực hiện (Chưa chuyển giao - Chờ kết luận phê duyệt)',
    noiDungCongViec:
      'Rà soát thẩm quyền giải quyết, xác minh tính danh tính người tố cáo, đối chiếu 4 điều kiện thụ lý theo Điều 29 Luật Tố cáo 2018 (rõ họ tên địa chỉ, có chứng cứ ban đầu, đúng thẩm quyền, người tố cáo có năng lực hành vi). Lập Báo cáo kiểm tra và Phiếu phân loại điều kiện thụ lý.',
    legalBasis: 'Điều 24 Luật Tố cáo 2018; Điều 8 Thông tư 05/2021/TT-TTCP',
    description:
      'Rà soát thẩm quyền, xác minh thông tin ban đầu, đối chiếu 4 điều kiện thụ lý (rõ họ tên, địa chỉ người tố cáo, nội dung có cơ sở hay nặc danh, trùng lặp). Đưa ra 1 trong các hướng xử lý cụ thể.',
    suggestedAction: 'Cán bộ xác nhận kết quả kiểm tra điều kiện thụ lý.',
    ketQuaCuoiCung: {
      tieuDe: 'Báo cáo kiểm tra xác minh ban đầu & Xác định hướng đủ điều kiện thụ lý',
      vanBanDauRa: 'Phiếu phân loại & Báo cáo kết quả xác minh ban đầu (Mẫu 02/PL)',
      trangThaiHoSo: 'Đang kiểm tra xác minh – Đã hoàn thiện hồ sơ trình Lãnh đạo',
      thoiHanThucHien: 'Không quá 07 ngày làm việc kể từ ngày nhận đơn',
      chiTietKetQua:
        'Kiểm tra thông tin người tố cáo, nội dung tố cáo, thẩm quyền giải quyết và các điều kiện thụ lý theo quy định của Luật Tố cáo. Đề xuất đủ điều kiện chuyển Giai đoạn 2: Lập Tờ trình đề xuất thụ lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý hồ sơ',
        donVi: 'Tổ Xác minh & Xử lý đơn',
        hanhDongCuThe:
          'Rà soát nội dung đơn, tra cứu CSDL đơn trùng lặp, liên hệ xác minh sơ bộ chứng cứ, lập Báo cáo kết quả kiểm tra và Phiếu đề xuất hướng xử lý theo Điều 29 Luật Tố cáo.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo phụ trách',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Xem xét và cho ý kiến chỉ đạo đối với báo cáo kết quả kiểm tra xác minh ban đầu của cán bộ thụ lý.',
      },
      donViPhoiHop: 'Bộ phận CNTT / Tra cứu CSDL quốc gia về tố cáo.',
    },
    taiLieuVanBan: {
      id: 'doc-tn-2',
      tenVanBan: 'Báo cáo kết quả kiểm tra xác minh ban đầu & Phiếu phân loại điều kiện thụ lý',
      soKyHieu: 'Số 02/BC-XMTL',
      loaiVanBan: 'Báo cáo xác minh',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ chuyên môn thụ lý hồ sơ',
      thoiGianTao: '14:00 - 12/03/2026',
      phienBan: 'v1.2 (Đã bổ sung tài liệu sau chỉnh sửa)',
      fileDinhKem: {
        tenFile: 'Bao_cao_kiem_tra_xac_minh_dieu_kien_thu_ly_v1.2.pdf',
        dungLuong: '2.4 MB',
        dinhDang: 'pdf',
        soTrang: 6,
        ngayCapNhat: '13/03/2026 09:00',
      },
      noiDungTomTat:
        'Kết quả kiểm tra xác minh đơn tố giác sai phạm tại ngõ 128 Đội Cấn. Xác định đơn đáp ứng đủ 4/4 điều kiện thụ lý theo Điều 29 Luật Tố cáo 2018. Đã bổ sung trích lục bản đồ địa chính và biên bản ghi nhận hiện trường ngày 13/03/2026.',
      noiDungChiTiet:
        'CƠ QUAN CẢNH SÁT ĐIỀU TRA\nTỔ XÁC MINH & XỬ LÝ ĐƠN\n\nBÁO CÁO KẾT QUẢ KIỂM TRA XÁC MINH BAN ĐẦU\nVề việc rà soát điều kiện thụ lý đơn tố cáo\nSố: 02/BC-XMTL - Phiên bản: v1.2\n\nKính gửi: Lãnh đạo Cơ quan CSĐT\n\n1. Về thẩm quyền: Vụ việc xảy ra trên địa bàn ngõ 128 Đội Cấn, thuộc thẩm quyền giải quyết của đơn vị theo phân cấp quản lý.\n2. Về điều kiện thụ lý (Điều 29 Luật Tố cáo 2018):\n- Tiêu chí 1: Người tố cáo có năng lực hành vi dân sự, có họ tên, địa chỉ rõ ràng (Đạt).\n- Tiêu chí 2: Nội dung tố cáo thuộc thẩm quyền giải quyết của người đứng đầu cơ quan (Đạt).\n- Tiêu chí 3: Nội dung tố cáo chưa được giải quyết hoặc có tình tiết mới có cơ sở chứng cứ (Đạt).\n- Tiêu chí 4: Có chứng cứ tài liệu ban đầu về hành vi vi phạm trật tự xây dựng và lấn chiếm lối đi chung (Đạt - Đã bổ sung trích lục bản đồ và biên bản xác minh ngày 13/03/2026).\n3. Kiến nghị: Đề nghị Lãnh đạo cơ quan xem xét, phê duyệt đủ điều kiện thụ lý và giao lập Tờ trình thụ lý chính thức.',
      trangThaiVanBan: 'da_trinh',
      trangThaiText: 'Đã trình xem xét',
      chuKySo: {
        nguoiKy: 'Nguyễn Minh Anh (Ký số Cán bộ lập)',
        thoiGianKy: '13/03/2026 09:10:00',
        chungThu: 'Chứng thư số chuyên dùng Chính phủ',
        trangThaiChuKy: 'hop_le',
      },
    },
    lichSuTrinhKy: [
      {
        id: 'round-tn2-1',
        luotTrinh: 1,
        tieuDeLuot: 'Lượt trình 1 (Bị trả lại - Yêu cầu bổ sung tài liệu)',
        kieuTrinh: 'tuan_tu',
        kieuTrinhText: 'Trình tuần tự (Sequential)',
        thoiGianBatDau: '14:00 - 12/03/2026',
        thoiGianKetThuc: '17:30 - 12/03/2026',
        phienBanVanBan: 'v1.0',
        ketQuaCuoiCung: '⚠️ Yêu cầu chỉnh sửa: Bổ sung trích lục bản đồ địa chính và xác minh thực tế',
        ketQuaStatus: 'tra_lai',
        nguoiTrinh: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ thụ lý hồ sơ',
          thoiGian: '14:00 - 12/03/2026',
        },
        danhSachNguoiThamGia: [
          {
            id: 'p-tn2-r1-1',
            soThuTu: 1,
            hoTen: 'Nguyễn Minh Anh',
            chucVu: 'Cán bộ chuyên môn thụ lý',
            donVi: 'Tổ Xác minh & Xử lý đơn',
            vaiTro: 'nguoi_trinh',
            vaiTroText: 'Người trình văn bản',
            hanhDong: 'trinh',
            hanhDongText: 'Đã lập & Trình duyệt',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '14:00 - 12/03/2026',
            phienBanXuLy: 'v1.0',
            yKien: 'Kính trình Đội trưởng và Lãnh đạo cơ quan xem xét báo cáo kiểm tra xác minh bước đầu.',
          },
          {
            id: 'p-tn2-r1-2',
            soThuTu: 2,
            hoTen: 'Trung tá Lê Hồng Hải',
            chucVu: 'Đội trưởng / Chỉ huy Đội phụ trách',
            donVi: 'Phòng Tiếp công dân & Xử lý đơn',
            vaiTro: 'nguoi_nhan_trinh',
            vaiTroText: 'Người nhận trình (Kiểm tra nghiệp vụ)',
            hanhDong: 'ky',
            hanhDongText: 'ĐÃ KÝ (Ký nháy chuyên môn)',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '15:30 - 12/03/2026',
            phienBanXuLy: 'v1.0',
            yKien: 'Đã kiểm tra thể thức văn bản và nội dung sơ bộ. Kính chuyển Thượng tá Trần Tuấn Nghĩa - Phó Thủ trưởng cơ quan xem xét chỉ đạo.',
          },
          {
            id: 'p-tn2-r1-3',
            soThuTu: 3,
            hoTen: 'Thượng tá Trần Tuấn Nghĩa',
            chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo phụ trách',
            donVi: 'Lãnh đạo đơn vị',
            vaiTro: 'lanh_dao_phe_duyet',
            vaiTroText: 'Lãnh đạo có thẩm quyền phê duyệt',
            hanhDong: 'yeu_cau_chinh_sua',
            hanhDongText: 'YÊU CẦU CHỈNH SỬA (Trả lại hồ sơ)',
            trangThaiXuLy: 'da_tra_lai',
            trangThaiXuLyText: 'Đã trả lại',
            thoiGian: '17:30 - 12/03/2026',
            phienBanXuLy: 'v1.0',
            yKien:
              'Hồ sơ còn thiếu cơ sở xác định ranh giới lối đi chung. Yêu cầu Cán bộ thụ lý phối hợp địa chính phường rút trích lục bản đồ năm 2020, lập biên bản ghi nhận hiện trạng và lấy ý kiến bổ sung của 3 hộ dân liền kề trước khi trình lại.',
          },
        ],
      },
      {
        id: 'round-tn2-2',
        luotTrinh: 2,
        tieuDeLuot: 'Lượt trình 2 (Trình lại sau chỉnh sửa - Đang xử lý)',
        kieuTrinh: 'dong_thoi',
        kieuTrinhText: 'Trình đồng thời nhiều lãnh đạo (Parallel)',
        thoiGianBatDau: '09:00 - 13/03/2026',
        phienBanVanBan: 'v1.2',
        ketQuaCuoiCung: '⏳ Đang xử lý lấy ý kiến đồng thời các Lãnh đạo',
        ketQuaStatus: 'dang_xu_ly',
        nguoiTrinh: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ thụ lý hồ sơ',
          thoiGian: '09:00 - 13/03/2026',
        },
        danhSachNguoiThamGia: [
          {
            id: 'p-tn2-r2-1',
            soThuTu: 1,
            hoTen: 'Nguyễn Minh Anh',
            chucVu: 'Cán bộ chuyên môn thụ lý',
            donVi: 'Tổ Xác minh & Xử lý đơn',
            vaiTro: 'nguoi_trinh',
            vaiTroText: 'Người trình văn bản',
            hanhDong: 'trinh',
            hanhDongText: 'Đã trình lại văn bản',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '09:00 - 13/03/2026',
            phienBanXuLy: 'v1.2',
            yKien:
              'Kính gửi Lãnh đạo: Đã bổ sung đầy đủ trích lục bản đồ địa chính ngõ 128 Đội Cấn và biên bản xác minh hiện trường ngày 13/03 với 3 hộ liền kề. Kính trình Lãnh đạo xem xét cho ý kiến.',
          },
          {
            id: 'p-tn2-r2-2',
            soThuTu: 2,
            hoTen: 'Thượng tá Trần Tuấn Nghĩa',
            chucVu: 'Phó Thủ trưởng Cơ quan (Người phê duyệt chính)',
            donVi: 'Lãnh đạo đơn vị',
            vaiTro: 'lanh_dao_phe_duyet',
            vaiTroText: 'Người nhận trình (Phê duyệt chính)',
            hanhDong: 'trinh',
            hanhDongText: 'Đang xem xét hồ sơ',
            trangThaiXuLy: 'dang_xem_xet',
            trangThaiXuLyText: 'Đang xem xét',
            thoiGian: 'Tiếp nhận: 09:05 - 13/03/2026',
            phienBanXuLy: 'v1.2',
            yKien: 'Đang nghiên cứu tài liệu địa chính bổ sung.',
          },
          {
            id: 'p-tn2-r2-3',
            soThuTu: 3,
            hoTen: 'Thượng tá Phạm Đình Trọng',
            chucVu: 'Phó Thủ trưởng Thường trực (Phối hợp cho ý kiến)',
            donVi: 'Ban Giám đốc / Lãnh đạo đơn vị',
            vaiTro: 'can_bo_phoi_hop',
            vaiTroText: 'Lãnh đạo nhận trình đồng thời (Phối hợp)',
            hanhDong: 'ky',
            hanhDongText: 'ĐÃ KÝ (Ý kiến đồng thuận)',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '11:15 - 13/03/2026',
            phienBanXuLy: 'v1.2',
            yKien: 'Đã xem xét tài liệu bổ sung. Nhất trí với đề xuất đủ điều kiện thụ lý tố cáo.',
          },
        ],
      },
    ],
  },

  'tn-kt-khong-thu-ly': {
    id: 'tn-kt-khong-thu-ly',
    name: 'Không thụ lý giải quyết',
    code: 'ĐIỀU KIỆN RẼ NHÁNH 1',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ xử lý (Nhánh điều kiện)',
    thoiGianBatDau: 'Chưa kích hoạt',
    thoiGianHoanThanh: 'Hạn: 05 ngày làm việc khi có kết quả',
    thoiDiemChuyenTiep: 'Kết thúc xử lý đơn ngay sau khi ban hành Thông báo',
    noiDungCongViec:
      'Dự thảo Thông báo không thụ lý tố cáo theo Mẫu số 03/TB-KTL nêu rõ căn cứ pháp luật theo Khoản 2 Điều 29 Luật Tố cáo (đơn không đủ điều kiện, nặc danh, không có chứng cứ hoặc đã được giải quyết đúng thẩm quyền không có tình tiết mới). Trình Lãnh đạo ký số ban hành.',
    legalBasis: 'Khoản 2 Điều 29 Luật Tố cáo 2018',
    description:
      'Đơn không đủ điều kiện thụ lý (không rõ họ tên, địa chỉ; người tố cáo không có năng lực hành vi; vụ việc đã được giải quyết đúng thẩm quyền không có tình tiết mới). Ban hành Thông báo không thụ lý.',
    suggestedAction: 'Ban hành thông báo không thụ lý gửi người tố cáo và kết thúc xử lý đơn.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Thông báo không thụ lý giải quyết tố cáo (KẾT THÚC ĐƠN)',
      vanBanDauRa: 'Thông báo không thụ lý giải quyết tố cáo (Mẫu số 03/TB-KTL)',
      trangThaiHoSo: '✓ KẾT THÚC XỬ LÝ ĐƠN – Lưu trữ hồ sơ điện tử',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày có kết quả kiểm tra',
      chiTietKetQua:
        'Không thụ lý đơn do không đủ điều kiện theo Điều 29 Luật Tố cáo 2018. Ban hành Thông báo gửi cho người tố cáo nêu rõ lý do không thụ lý, đồng thời kết thúc việc xử lý đơn trên hệ thống.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Dự thảo Thông báo không thụ lý giải quyết tố cáo nêu rõ căn cứ pháp luật theo Điều 29 Luật Tố cáo, hoàn thiện hồ sơ trình Lãnh đạo ký duyệt.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo có thẩm quyền quyết định',
        hanhDongCuThe:
          'Ký số phê duyệt ban hành Thông báo không thụ lý gửi người tố cáo; phê duyệt lệnh kết thúc và đóng hồ sơ.',
      },
      donViPhoiHop: 'Văn thư: Phát hành văn bản qua dịch vụ bưu chính bảo đảm kèm mã tra cứu bưu điện.',
    },
    taiLieuVanBan: {
      id: 'doc-kt-khong-thu-ly',
      tenVanBan: 'Thông báo không thụ lý giải quyết tố cáo',
      soKyHieu: 'Số 03/TB-KTL',
      loaiVanBan: 'Thông báo',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ thụ lý hồ sơ',
      thoiGianTao: 'Dự thảo theo mẫu',
      phienBan: 'v1.0 (Dự thảo)',
      fileDinhKem: {
        tenFile: 'Thong_bao_khong_thu_ly_to_cao_Mau_03_TB.pdf',
        dungLuong: '320 KB',
        dinhDang: 'pdf',
        soTrang: 2,
      },
      noiDungTomTat:
        'Thông báo lý do không thụ lý giải quyết tố cáo căn cứ Điều 29 Luật Tố cáo 2018 và hướng dẫn công dân theo quy định pháp luật.',
      noiDungChiTiet:
        'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nTHÔNG BÁO\nVề việc không thụ lý giải quyết tố cáo\nSố: 03/TB-KTL\n\nKính gửi: Người tố cáo\nCăn cứ Luật Tố cáo ngày 12 tháng 6 năm 2018;\nSau khi kiểm tra, xác minh sơ bộ nội dung đơn tố cáo, cơ quan nhận thấy đơn không đủ điều kiện thụ lý do: [Lý do luật định theo Khoản 2 Điều 29].\nCơ quan xin thông báo để công dân được biết và thực hiện quyền khiếu nại, khởi kiện theo đúng quy định pháp luật.',
      trangThaiVanBan: 'ban_nhap',
      trangThaiText: 'Bản nháp mẫu',
    },
    lichSuTrinhKy: null,
  },

  'tn-kt-yeu-cau-bo-sung': {
    id: 'tn-kt-yeu-cau-bo-sung',
    name: 'Yêu cầu bổ sung tài liệu / thông tin',
    code: 'ĐIỀU KIỆN RẼ NHÁNH 2',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ xử lý (Nhánh điều kiện)',
    thoiGianBatDau: 'Chưa kích hoạt',
    thoiGianHoanThanh: 'Hạn bổ sung: 10 ngày làm việc',
    thoiDiemChuyenTiep: 'Chờ công dân nộp bổ sung hồ sơ để xem xét tiếp',
    noiDungCongViec:
      'Lập danh mục tài liệu còn thiếu và soạn thảo văn bản Thông báo yêu cầu công dân bổ sung tài liệu, thông tin trong thời hạn 10 ngày làm việc. Tạm dừng tính thời hạn xử lý trên hệ thống.',
    legalBasis: 'Điều 24 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    description:
      'Hồ sơ thiếu chứng cứ hoặc nội dung chưa đủ rõ để xem xét thụ lý. Ban hành Thông báo yêu cầu công dân bổ sung thông tin, tài liệu trong thời hạn luật định (10 ngày làm việc).',
    suggestedAction: 'Lập danh mục tài liệu còn thiếu và ban hành văn bản yêu cầu bổ sung.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Thông báo yêu cầu bổ sung thông tin, tài liệu (Hạn 10 ngày)',
      vanBanDauRa: 'Thông báo yêu cầu bổ sung tài liệu, chứng cứ (Mẫu số 04/TB-BS)',
      trangThaiHoSo: 'Tạm dừng tính hạn giải quyết – Chờ công dân bổ sung (10 ngày)',
      thoiHanThucHien: 'Người gửi đơn có 10 ngày làm việc để nộp bổ sung hồ sơ',
      chiTietKetQua:
        'Chỉ rõ các nội dung, tài liệu còn thiếu cần bổ sung. Sau thời hạn 10 ngày làm việc nếu người tố cáo không bổ sung thì cơ quan ban hành Thông báo không thụ lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Liệt kê danh mục tài liệu còn thiếu (giấy ủy quyền, hợp đồng, sao kê, chứng cứ gốc), lập dự thảo Thông báo yêu cầu bổ sung, trình ký và gửi văn bản cho công dân qua bưu chính/VNeID.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo có thẩm quyền',
        hanhDongCuThe:
          'Ký số ban hành Thông báo yêu cầu bổ sung và phê duyệt tạm dừng thời hạn xử lý trên hệ thống.',
      },
      donViPhoiHop: 'Văn thư: Gửi phát bảo đảm và lưu phiếu theo dõi hạn bổ sung 10 ngày.',
    },
    taiLieuVanBan: {
      id: 'doc-kt-bo-sung',
      tenVanBan: 'Thông báo yêu cầu bổ sung tài liệu, chứng cứ',
      soKyHieu: 'Số 04/TB-BS',
      loaiVanBan: 'Thông báo',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ thụ lý hồ sơ',
      thoiGianTao: 'Dự thảo theo mẫu',
      phienBan: 'v1.0 (Dự thảo)',
      fileDinhKem: {
        tenFile: 'Thong_bao_yeu_cau_bo_sung_ho_so_04_TB.pdf',
        dungLuong: '310 KB',
        dinhDang: 'pdf',
        soTrang: 2,
      },
      noiDungTomTat:
        'Yêu cầu người nộp đơn bổ sung tài liệu chứng minh và văn bản ủy quyền hợp lệ trong thời hạn 10 ngày làm việc.',
      noiDungChiTiet:
        'THÔNG BÁO YÊU CẦU BỔ SUNG TÀI LIỆU, THÔNG TIN\nSố: 04/TB-BS\nCăn cứ Điều 24 Luật Tố cáo 2018...\nYêu cầu người gửi đơn nộp bổ sung các tài liệu còn thiếu trong vòng 10 ngày làm việc.',
      trangThaiVanBan: 'ban_nhap',
      trangThaiText: 'Bản nháp mẫu',
    },
    lichSuTrinhKy: null,
  },

  'tn-kt-ban-giao': {
    id: 'tn-kt-ban-giao',
    name: 'Bàn giao / Chuyển đơn',
    code: 'ĐIỀU KIỆN RẼ NHÁNH 3',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ xử lý (Nhánh điều kiện)',
    thoiGianBatDau: 'Chưa kích hoạt',
    thoiGianHoanThanh: 'Hạn: 05 ngày làm việc',
    thoiDiemChuyenTiep: 'Bàn giao cơ quan khác và kết thúc hồ sơ',
    noiDungCongViec:
      'Xác định đơn không thuộc thẩm quyền của cơ quan. Lập Phiếu chuyển đơn tố cáo số 15/PC-ĐTC và chuẩn bị biên bản bàn giao hồ sơ sang cơ quan có thẩm quyền giải quyết theo Điều 26 Luật Tố cáo.',
    legalBasis: 'Điều 26 Luật Tố cáo 2018',
    description:
      'Đơn không thuộc thẩm quyền giải quyết của cơ quan. Lập Phiếu chuyển đơn tố cáo và thực hiện bàn giao hồ sơ sang cơ quan có thẩm quyền giải quyết.',
    suggestedAction: 'Chuyển giao hồ sơ đơn và kết thúc xử lý tại đơn vị.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Phiếu chuyển đơn & Biên bản bàn giao hồ sơ (KẾT THÚC ĐƠN)',
      vanBanDauRa: 'Phiếu chuyển đơn tố cáo số 15/PC-ĐTC & Biên bản bàn giao hồ sơ',
      trangThaiHoSo: '✓ KẾT THÚC XỬ LÝ ĐƠN – Đã chuyển cơ quan có thẩm quyền',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày xác định thẩm quyền',
      chiTietKetQua:
        'Chuyển toàn bộ hồ sơ đơn và tài liệu đính kèm đến đúng cơ quan, người có thẩm quyền giải quyết theo Điều 26 Luật Tố cáo; đồng thời ban hành văn bản thông báo cho người tố cáo biết.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Tiếp nhận & Xử lý đơn',
        hanhDongCuThe:
          'Xác định chính xác cơ quan có thẩm quyền, lập Phiếu chuyển đơn và văn bản thông báo gửi công dân, niêm phong tài liệu gốc và hoàn tất thủ tục bàn giao.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Ký ban hành Phiếu chuyển đơn tố cáo gửi cơ quan tiếp nhận và ký thông báo gửi người gửi đơn.',
      },
      donViPhoiHop: 'Đơn vị tiếp nhận mới: Ký biên bản giao nhận hồ sơ vụ việc.',
    },
    taiLieuVanBan: {
      id: 'doc-kt-ban-giao',
      tenVanBan: 'Phiếu chuyển đơn tố cáo & Biên bản bàn giao hồ sơ',
      soKyHieu: 'Số 15/PC-ĐTC',
      loaiVanBan: 'Phiếu chuyển đơn',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ thụ lý hồ sơ',
      thoiGianTao: 'Dự thảo theo mẫu',
      phienBan: 'v1.0 (Dự thảo)',
      fileDinhKem: {
        tenFile: 'Phieu_chuyen_don_to_cao_15_PC.pdf',
        dungLuong: '380 KB',
        dinhDang: 'pdf',
        soTrang: 2,
      },
      noiDungTomTat:
        'Chuyển hồ sơ đơn tố cáo và toàn bộ tài liệu kèm theo đến cơ quan có thẩm quyền giải quyết theo Điều 26 Luật Tố cáo.',
      noiDungChiTiet:
        'PHIẾU CHUYỂN ĐƠN TỐ CÁO\nSố: 15/PC-ĐTC\nKính gửi: Cơ quan có thẩm quyền tiếp nhận vụ việc\nChuyển toàn bộ hồ sơ đơn để thụ lý giải quyết theo đúng thẩm quyền...',
      trangThaiVanBan: 'ban_nhap',
      trangThaiText: 'Bản nháp mẫu',
    },
    lichSuTrinhKy: null,
  },

  'tn-kt-tra-lai': {
    id: 'tn-kt-tra-lai',
    name: 'Trả lại đơn & Hướng dẫn',
    code: 'ĐIỀU KIỆN RẼ NHÁNH 4',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ xử lý (Nhánh điều kiện)',
    thoiGianBatDau: 'Chưa kích hoạt',
    thoiGianHoanThanh: 'Hạn: 05 ngày làm việc',
    thoiDiemChuyenTiep: 'Hoàn trả tài liệu cho công dân và đóng hồ sơ',
    noiDungCongViec:
      'Soạn Phiếu hướng dẫn công dân và biên bản hoàn trả tài liệu gốc đối với các trường hợp gửi sai nơi hoặc không thuộc diện chuyển tiếp theo Điều 25 Luật Tố cáo.',
    legalBasis: 'Điều 25 Luật Tố cáo 2018',
    description:
      'Đơn không thuộc thẩm quyền và không thuộc trường hợp chuyển tiếp, hoặc người tố cáo gửi sai quy định. Ban hành văn bản hướng dẫn và trả lại hồ sơ.',
    suggestedAction: 'Gửi văn bản trả lời cho người tố cáo và kết thúc xử lý đơn.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Phiếu hướng dẫn & Biên bản trả lại đơn (KẾT THÚC ĐƠN)',
      vanBanDauRa: 'Phiếu hướng dẫn công dân (Mẫu số 05/HD) & Biên bản trả đơn',
      trangThaiHoSo: '✓ KẾT THÚC XỬ LÝ ĐƠN – Đã trả lại đơn & hướng dẫn',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày nhận đơn',
      chiTietKetQua:
        'Hướng dẫn cụ thể cơ quan, tổ chức có thẩm quyền để người tố cáo làm lại đơn theo đúng quy định pháp luật; hoàn trả lại hồ sơ tài liệu gốc và đóng việc xử lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ tiếp nhận & xử lý đơn',
        donVi: 'Bộ phận Tiếp nhận & Một cửa',
        hanhDongCuThe:
          'Soạn thảo văn bản hướng dẫn gửi công dân nêu rõ cơ quan có thẩm quyền tiếp nhận; liên hệ công dân nhận lại tài liệu hoặc gửi trả qua bưu điện có bảo đảm.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Ký duyệt văn bản hướng dẫn công dân và phê duyệt lệnh kết thúc xử lý đơn trên hệ thống.',
      },
      donViPhoiHop: 'Văn thư: Gửi phát kèm biên nhận báo phát của bưu điện.',
    },
    taiLieuVanBan: {
      id: 'doc-kt-tra-lai',
      tenVanBan: 'Phiếu hướng dẫn công dân & Biên bản hoàn trả đơn',
      soKyHieu: 'Số 05/HD-TLĐ',
      loaiVanBan: 'Phiếu hướng dẫn',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ tiếp nhận & xử lý đơn',
      thoiGianTao: 'Dự thảo theo mẫu',
      phienBan: 'v1.0 (Dự thảo)',
      fileDinhKem: {
        tenFile: 'Phieu_huong_dan_tra_don_05_HD.pdf',
        dungLuong: '290 KB',
        dinhDang: 'pdf',
        soTrang: 1,
      },
      noiDungTomTat:
        'Hướng dẫn công dân gửi đơn đến đúng cơ quan có thẩm quyền giải quyết và hoàn trả tài liệu kèm theo.',
      noiDungChiTiet:
        'PHIẾU HƯỚNG DẪN CÔNG DÂN\nSố: 05/HD-TLĐ\nHướng dẫn người nộp đơn gửi đơn đến cơ quan có thẩm quyền theo đúng quy định tại Điều 25 Luật Tố cáo 2018...',
      trangThaiVanBan: 'ban_nhap',
      trangThaiText: 'Bản nháp mẫu',
    },
    lichSuTrinhKy: null,
  },

  'tn-du-dieu-kien': {
    id: 'tn-du-dieu-kien',
    name: 'Đủ điều kiện thụ lý (Chuyển GĐ 2)',
    code: 'ĐIỀU KIỆN TIÊN QUYẾT',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'active',
    trangThaiText: 'Đạt điều kiện – Đang hoàn tất chuyển tiếp',
    thoiGianBatDau: '13/03/2026',
    thoiGianHoanThanh: '13/03/2026',
    thoiDiemChuyenTiep: 'Kích hoạt ngay khi Lãnh đạo duyệt Báo cáo xác minh v1.2',
    noiDungCongViec:
      'Thẩm định toàn diện 4/4 tiêu chí theo Điều 29 Luật Tố cáo 2018, hoàn thiện Biên bản thẩm định điều kiện thụ lý, kích hoạt chế độ bảo vệ bí mật thông tin người tố cáo và chuyển giao sang Giai đoạn 2: Lập Tờ trình đề xuất thụ lý.',
    legalBasis: 'Điều 29 Luật Tố cáo 2018 (4 Điều kiện thụ lý)',
    description:
      'Hồ sơ thỏa mãn đầy đủ 4/4 điều kiện thụ lý luật định. Kích hoạt chuyển tiếp sang Giai đoạn 2: Lập Tờ trình đề xuất thụ lý.',
    suggestedAction: 'Chuyển trạng thái hồ sơ sang Giai đoạn 2 và tiến hành lập Tờ trình.',
    ketQuaCuoiCung: {
      tieuDe: 'Xác nhận hồ sơ đủ 4/4 điều kiện thụ lý – Chuyển Giai đoạn 2',
      vanBanDauRa: 'Biên bản thẩm định điều kiện thụ lý & Phiếu chuyển hồ sơ sang GĐ 2',
      trangThaiHoSo: 'Đạt điều kiện thụ lý – Chuyển sang Giai đoạn 2: Lập Tờ trình',
      thoiHanThucHien: 'Trong 07 ngày làm việc kể từ ngày nhận đơn',
      chiTietKetQua:
        'Đơn có họ tên, địa chỉ người tố cáo rõ ràng; nội dung thuộc thẩm quyền của cơ quan; có cơ sở chứng cứ ban đầu về hành vi vi phạm và người tố cáo có năng lực hành vi. Đủ điều kiện chuyển Lãnh đạo xem xét thụ lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý hồ sơ',
        donVi: 'Tổ Xác minh & Xử lý đơn',
        hanhDongCuThe:
          'Ký xác nhận đạt 4/4 tiêu chí thẩm tra theo Điều 29 Luật Tố cáo, kích hoạt chế độ bảo vệ bí mật thông tin người tố cáo và chuyển hồ sơ sang GĐ 2.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo phụ trách',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Ghi nhận báo cáo kiểm tra sơ bộ, phê duyệt chủ trương thụ lý và giao cán bộ lập Tờ trình chính thức.',
      },
      donViPhoiHop: 'Tổ Công nghệ thông tin: Kích hoạt chế độ bảo mật danh tính người tố cáo.',
    },
    taiLieuVanBan: {
      id: 'doc-du-dk',
      tenVanBan: 'Biên bản thẩm định điều kiện thụ lý & Phiếu chuyển tiếp Giai đoạn 2',
      soKyHieu: 'Số 12/BB-TĐ',
      loaiVanBan: 'Biên bản thẩm định',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ thụ lý hồ sơ',
      thoiGianTao: '13/03/2026 11:30',
      phienBan: 'v1.0 (Chính thức)',
      fileDinhKem: {
        tenFile: 'Bien_ban_tham_dinh_dieu_kien_thu_ly_12_BB.pdf',
        dungLuong: '520 KB',
        dinhDang: 'pdf',
        soTrang: 3,
        ngayCapNhat: '13/03/2026 11:35',
      },
      noiDungTomTat:
        'Xác nhận hồ sơ đáp ứng đủ 4/4 điều kiện thụ lý tố cáo luật định, đồng thời xác lập cơ chế bảo mật thông tin người tố cáo theo quy định.',
      noiDungChiTiet:
        'BIÊN BẢN THẨM ĐỊNH ĐIỀU KIỆN THỤ LÝ TỐ CÁO\nSố: 12/BB-TĐ\nĐối chiếu 4 điều kiện luật định theo Điều 29 Luật Tố cáo:\n1. Năng lực hành vi & thông tin nhân thân: ĐẠT\n2. Thẩm quyền cơ quan: ĐẠT\n3. Tính mới & không trùng lặp: ĐẠT\n4. Chứng cứ tài liệu kèm theo: ĐẠT\nKết luận: Đủ điều kiện chuyển sang Giai đoạn 2 để lập Tờ trình thụ lý giải quyết.',
      trangThaiVanBan: 'da_ky',
      trangThaiText: 'Đã ký xác nhận',
      chuKySo: {
        nguoiKy: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        thoiGianKy: '13/03/2026 11:35:00',
        chungThu: 'Ban Cơ yếu Chính phủ',
        trangThaiChuKy: 'hop_le',
      },
    },
    lichSuTrinhKy: null,
  },

  'tl-1': {
    id: 'tl-1',
    name: 'Đề xuất thụ lý',
    code: 'BƯỚC 1 (GĐ 2)',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ xử lý (GĐ 2)',
    thoiGianBatDau: 'Dự kiến: 17/03/2026',
    thoiGianHoanThanh: 'Dự kiến: 19/03/2026 (Trong 03 ngày)',
    thoiDiemChuyenTiep: 'Chuyển sang Bước 2 (Trình Lãnh đạo) ngay khi hoàn thành Tờ trình',
    noiDungCongViec:
      'Lập Tờ trình đề xuất thụ lý giải quyết tố cáo gửi Lãnh đạo có thẩm quyền phê duyệt; dự thảo Quyết định thụ lý theo Mẫu số 01 kèm Dự thảo Kế hoạch xác minh nội dung tố cáo chi tiết và dự kiến nhân sự Tổ xác minh.',
    legalBasis: 'Điều 29 Luật Tố cáo 2018',
    description:
      'Lập Báo cáo / Tờ trình đề xuất thụ lý giải quyết tố cáo gửi Lãnh đạo có thẩm quyền phê duyệt.',
    suggestedAction: 'Dự thảo Quyết định thụ lý theo Mẫu số 01 và dự thảo Thông báo thụ lý.',
    ketQuaCuoiCung: {
      tieuDe: 'Hoàn thiện Tờ trình đề xuất thụ lý & Dự thảo Quyết định Mẫu số 01',
      vanBanDauRa: 'Tờ trình đề xuất thụ lý tố cáo + Dự thảo QĐ Thụ lý (Mẫu 01) + Kế hoạch xác minh',
      trangThaiHoSo: 'Đã hoàn tất hồ sơ đề xuất – Sẵn sàng chuyển trình Lãnh đạo ký duyệt',
      thoiHanThucHien: 'Trong 03 ngày làm việc kể từ khi xác định đủ điều kiện',
      chiTietKetQua:
        'Xây dựng hoàn chỉnh hồ sơ đề xuất thụ lý: xác định rõ nội dung thụ lý, phạm vi xác minh, dự kiến nhân sự Tổ/Đoàn xác minh và các tài liệu chứng cứ chứng minh.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý chính',
        donVi: 'Tổ Xử lý đơn chuyên môn',
        hanhDongCuThe:
          'Lập Tờ trình đề xuất thụ lý giải quyết tố cáo; soạn thảo Dự thảo Quyết định thụ lý (Mẫu số 01) và Dự thảo Kế hoạch xác minh chi tiết.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Trung tá Lê Hồng Hải',
        chucVu: 'Đội trưởng / Chỉ huy Đội phụ trách',
        donVi: 'Lãnh đạo cấp phòng/đội',
        hanhDongCuThe:
          'Rà soát chuyên môn, ký nháy vào Tờ trình và dự thảo Quyết định trước khi gửi lên Lãnh đạo cơ quan.',
      },
      donViPhoiHop: 'Tổ chuyên môn: Họp thống nhất đường lối và danh sách thành viên Tổ xác minh.',
    },
    taiLieuVanBan: {
      id: 'doc-tl-1',
      tenVanBan: 'Tờ trình đề xuất thụ lý giải quyết tố cáo & Dự thảo Quyết định Mẫu số 01',
      soKyHieu: 'Số 88/TTr-TLTC',
      loaiVanBan: 'Tờ trình',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ thụ lý chính',
      thoiGianTao: '17/03/2026 (Dự thảo)',
      phienBan: 'v1.0 (Dự thảo)',
      fileDinhKem: {
        tenFile: 'To_trinh_de_xuat_thu_ly_88_TTr.pdf',
        dungLuong: '1.8 MB',
        dinhDang: 'pdf',
        soTrang: 5,
      },
      noiDungTomTat:
        'Đề xuất thụ lý giải quyết tố cáo vụ việc sai phạm trật tự xây dựng tại ngõ 128 Đội Cấn, thành lập Tổ xác minh gồm 03 đồng chí, thời hạn xác minh 30 ngày.',
      noiDungChiTiet:
        'TỜ TRÌNH ĐỀ XUẤT THỤ LÝ GIẢI QUYẾT TỐ CÁO\nSố: 88/TTr-TLTC\nKính gửi: Thủ trưởng Cơ quan Cảnh sát điều tra\nCăn cứ Điều 29 Luật Tố cáo 2018...\n1. Tóm tắt nội dung tố cáo\n2. Kết quả kiểm tra xác minh bước đầu\n3. Đề xuất: Thụ lý giải quyết và ban hành Quyết định thành lập Tổ xác minh.',
      trangThaiVanBan: 'ban_nhap',
      trangThaiText: 'Bản nháp hồ sơ',
    },
    lichSuTrinhKy: null,
  },

  'tl-2': {
    id: 'tl-2',
    name: 'Trình Lãnh đạo',
    code: 'BƯỚC 2 (GĐ 2)',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ xử lý',
    thoiGianBatDau: 'Dự kiến: 20/03/2026',
    thoiGianHoanThanh: 'Dự kiến: 21/03/2026',
    thoiDiemChuyenTiep: 'Chuyển vào hộp thư trình ký của Lãnh đạo',
    noiDungCongViec:
      'Chuyển hồ sơ và tờ trình thụ lý vào danh sách Trình ký của Lãnh đạo qua hệ thống Quản lý văn bản điện tử; tải lên toàn bộ tài liệu số hóa, chứng thư và mã hóa bảo mật thông tin.',
    legalBasis: 'Quy chế làm việc & phân cấp thẩm quyền ký duyệt',
    description:
      'Chuyển hồ sơ và tờ trình thụ lý vào danh sách Trình ký của Lãnh đạo qua hệ thống Quản lý công việc điện tử.',
    suggestedAction: 'Theo dõi ý kiến phản hồi hoặc yêu cầu chỉnh sửa từ Lãnh đạo.',
    ketQuaCuoiCung: {
      tieuDe: 'Hồ sơ thụ lý được gửi đến mục "Văn bản chờ ký" của Lãnh đạo',
      vanBanDauRa: 'Phiếu trình ký điện tử số 88/TK-TLTC kèm hồ sơ tài liệu số hóa',
      trangThaiHoSo: 'Đang trình Lãnh đạo – Chờ phê duyệt & ký số',
      thoiHanThucHien: 'Trong 24 giờ sau khi hoàn tất tờ trình',
      chiTietKetQua:
        'Chuyển hồ sơ lên phân hệ Trình ký điện tử, thông báo tự động tới tài khoản Lãnh đạo phụ trách để xem xét và cho ý kiến chỉ đạo phê duyệt.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Tải toàn bộ file tài liệu số hóa lên hệ thống Trình ký, chọn người ký là Thượng tá Trần Tuấn Nghĩa, nhập tóm tắt nội dung đề xuất và gửi lệnh trình ký.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo có thẩm quyền',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Tiếp nhận thông báo hồ sơ trình ký mới trong hòm thư công vụ và danh mục "Văn bản chờ ký".',
      },
      donViPhoiHop: 'Hệ thống Quản lý văn bản điện tử: Tự động ghi vết thời gian trình ký.',
    },
    taiLieuVanBan: {
      id: 'doc-tl-2',
      tenVanBan: 'Phiếu trình ký điện tử hồ sơ thụ lý đơn tố cáo',
      soKyHieu: 'Số 88/TK-TLTC',
      loaiVanBan: 'Phiếu trình ký',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ chuyên môn thụ lý',
      thoiGianTao: '20/03/2026',
      phienBan: 'v1.0',
      fileDinhKem: {
        tenFile: 'Phieu_trinh_ky_dien_tu_88_TK.pdf',
        dungLuong: '640 KB',
        dinhDang: 'pdf',
        soTrang: 2,
      },
      noiDungTomTat:
        'Hồ sơ trình ký điện tử gửi Lãnh đạo phê duyệt đề xuất thụ lý giải quyết đơn tố cáo ngõ 128 Đội Cấn.',
      noiDungChiTiet:
        'PHIẾU TRÌNH KÝ ĐIỆN TỬ\nSố: 88/TK-TLTC\nNgười trình: Nguyễn Minh Anh\nNgười duyệt: Thượng tá Trần Tuấn Nghĩa - Phó Thủ trưởng Cơ quan CSĐT\nDanh mục tệp đính kèm: 01 Tờ trình, 01 Dự thảo Quyết định, 01 Dự thảo Kế hoạch xác minh.',
      trangThaiVanBan: 'da_trinh',
      trangThaiText: 'Đã trình ký',
    },
    lichSuTrinhKy: null,
  },

  'tl-3': {
    id: 'tl-3',
    name: 'Lãnh đạo xem xét & phê duyệt đề xuất thụ lý',
    code: 'BƯỚC 3 (GĐ 2)',
    role: 'lanh_dao',
    roleName: 'Lãnh đạo',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ phê duyệt',
    thoiGianBatDau: 'Dự kiến: 21/03/2026',
    thoiGianHoanThanh: 'Dự kiến: 22/03/2026 (Trong 02 ngày làm việc)',
    thoiDiemChuyenTiep: 'Chuyển sang Bước 4 (Hệ thống tự động cấp số thụ lý)',
    noiDungCongViec:
      'Lãnh đạo xem xét toàn diện hồ sơ thụ lý, đánh giá tính pháp lý của chứng cứ, ký số phê duyệt Tờ trình và ký ban hành Quyết định thụ lý giải quyết tố cáo theo Điều 29, 30 Luật Tố cáo 2018 bằng chữ ký số chuyên dùng.',
    legalBasis: 'Điều 29, Điều 30 Luật Tố cáo 2018',
    description:
      'Lãnh đạo xem xét hồ sơ: Phê duyệt thụ lý hoặc yêu cầu cán bộ chuyên môn chỉnh sửa, làm rõ thêm.',
    suggestedAction: 'Lãnh đạo ký số phê duyệt hoặc phản hồi yêu cầu chỉnh sửa.',
    ketQuaCuoiCung: {
      tieuDe: 'Lãnh đạo ký số phê duyệt Tờ trình & Ký ban hành Quyết định thụ lý',
      vanBanDauRa: 'Quyết định thụ lý giải quyết tố cáo (Chữ ký số điện tử CA hợp lệ)',
      trangThaiHoSo: 'Đã phê duyệt thụ lý – Chuyển hệ thống cấp số chính thức',
      thoiHanThucHien: 'Trong 02 ngày làm việc kể từ ngày nhận tờ trình',
      chiTietKetQua:
        'Lãnh đạo có thẩm quyền xem xét toàn diện hồ sơ, ký số phê duyệt Tờ trình và ký ban hành Quyết định thụ lý giải quyết tố cáo theo Điều 29, 30 Luật Tố cáo 2018.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Trực tiếp báo cáo, giải trình các nội dung nghiệp vụ hoặc cập nhật chỉnh sửa theo ý kiến chỉ đạo của Lãnh đạo nếu có.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan CSĐT / Người có thẩm quyền',
        donVi: 'Thủ trưởng / Người đứng đầu cơ quan',
        hanhDongCuThe:
          'Sử dụng Token chữ ký số chuyên dùng ký phê duyệt Tờ trình và ký ban hành Quyết định thụ lý giải quyết tố cáo (hoặc gửi ý kiến yêu cầu chỉnh sửa lại).',
      },
      donViPhoiHop: 'Ban Cơ yếu / Đơn vị cung cấp dịch vụ chứng thực chữ ký số.',
    },
    taiLieuVanBan: {
      id: 'doc-tl-3',
      tenVanBan: 'Quyết định thụ lý giải quyết tố cáo (Mẫu số 01/QĐ-TLTC)',
      soKyHieu: 'Số 26/QĐ-TLTC (Dự kiến cấp số)',
      loaiVanBan: 'Quyết định',
      nguoiTao: 'Thượng tá Trần Tuấn Nghĩa',
      chucVuNguoiTao: 'Phó Thủ trưởng Cơ quan CSĐT',
      thoiGianTao: '22/03/2026',
      phienBan: 'v1.0 (Chính thức)',
      fileDinhKem: {
        tenFile: 'Quyet_dinh_thu_ly_to_cao_Mau_01_QD.pdf',
        dungLuong: '1.2 MB',
        dinhDang: 'pdf',
        soTrang: 3,
      },
      noiDungTomTat:
        'Quyết định thụ lý giải quyết tố cáo đối với hành vi vi phạm trật tự xây dựng tại ngõ 128 Đội Cấn và thành lập Tổ xác minh.',
      noiDungChiTiet:
        'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nQUYẾT ĐỊNH\nVề việc thụ lý giải quyết tố cáo\n\nTHỦ TRƯỞNG CƠ QUAN CSĐT\nCăn cứ Luật Tố cáo ngày 12 tháng 6 năm 2018;\nXét Tờ trình số 88/TTr-TLTC của Cán bộ thụ lý...\nQUYẾT ĐỊNH:\nĐiều 1: Thụ lý giải quyết tố cáo đối với hành vi sai phạm tại ngõ 128 Đội Cấn.\nĐiều 2: Thời hạn giải quyết tố cáo là 30 ngày kể từ ngày ban hành quyết định này.\nĐiều 3: Thành lập Tổ xác minh gồm các đồng chí...',
      trangThaiVanBan: 'da_phe_duyet',
      trangThaiText: 'Đã phê duyệt (Chờ cấp số)',
      chuKySo: {
        nguoiKy: 'Thượng tá Trần Tuấn Nghĩa',
        thoiGianKy: '22/03/2026 15:45:00',
        chungThu: 'Chứng thư số Ban Cơ yếu Chính phủ',
        trangThaiChuKy: 'hop_le',
      },
    },
    lichSuTrinhKy: [
      {
        id: 'round-tl3-1',
        luotTrinh: 1,
        tieuDeLuot: 'Lượt trình 1 (Trình tuần tự Lãnh đạo phê duyệt)',
        kieuTrinh: 'tuan_tu',
        kieuTrinhText: 'Trình tuần tự (Sequential)',
        thoiGianBatDau: '21/03/2026 08:30',
        thoiGianKetThuc: '22/03/2026 16:00',
        phienBanVanBan: 'v1.0',
        ketQuaCuoiCung: '✓ Đã phê duyệt và ký số Quyết định thụ lý',
        ketQuaStatus: 'phe_duyet',
        nguoiTrinh: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ thụ lý hồ sơ',
          thoiGian: '21/03/2026 08:30',
        },
        danhSachNguoiThamGia: [
          {
            id: 'p-tl3-1',
            soThuTu: 1,
            hoTen: 'Nguyễn Minh Anh',
            chucVu: 'Cán bộ chuyên môn thụ lý',
            donVi: 'Tổ Xử lý đơn',
            vaiTro: 'nguoi_trinh',
            vaiTroText: 'Người trình văn bản',
            hanhDong: 'trinh',
            hanhDongText: 'Đã trình ký',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '21/03/2026 08:30',
            phienBanXuLy: 'v1.0',
            yKien: 'Kính trình Lãnh đạo phê duyệt Tờ trình và ký Quyết định thụ lý giải quyết tố cáo.',
          },
          {
            id: 'p-tl3-2',
            soThuTu: 2,
            hoTen: 'Trung tá Lê Hồng Hải',
            chucVu: 'Đội trưởng / Chỉ huy Đội phụ trách',
            donVi: 'Phòng Tiếp công dân & Xử lý đơn',
            vaiTro: 'nguoi_nhan_trinh',
            vaiTroText: 'Người nhận trình (Kiểm tra nghiệp vụ)',
            hanhDong: 'ky',
            hanhDongText: 'ĐÃ KÝ (Ký nháy chuyên môn)',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '21/03/2026 14:00',
            phienBanXuLy: 'v1.0',
            yKien: 'Nhất trí với dự thảo quyết định và kế hoạch xác minh 30 ngày.',
          },
          {
            id: 'p-tl3-3',
            soThuTu: 3,
            hoTen: 'Thượng tá Trần Tuấn Nghĩa',
            chucVu: 'Phó Thủ trưởng Cơ quan CSĐT',
            donVi: 'Lãnh đạo đơn vị',
            vaiTro: 'lanh_dao_phe_duyet',
            vaiTroText: 'Lãnh đạo có thẩm quyền phê duyệt',
            hanhDong: 'phe_duyet',
            hanhDongText: 'ĐÃ PHÊ DUYỆT (Ký số điện tử CA)',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: '22/03/2026 15:45',
            phienBanXuLy: 'v1.0',
            yKien: 'Phê duyệt thụ lý. Chuyển Văn thư và Hệ thống cấp số chính thức để ban hành ngay.',
          },
        ],
      },
    ],
  },

  'tl-duyet': {
    id: 'tl-duyet',
    name: 'Ký duyệt thụ lý?',
    code: 'ĐIỀU KIỆN QUYẾT ĐỊNH',
    role: 'lanh_dao',
    roleName: 'Lãnh đạo',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ quyết định rẽ nhánh',
    thoiGianBatDau: 'Theo tiến độ bước 3',
    thoiGianHoanThanh: 'Trong ngày làm việc',
    thoiDiemChuyenTiep: 'Nếu duyệt: chuyển Bước 4; Nếu trả lại: quay về Cán bộ hoàn thiện',
    noiDungCongViec:
      'Nút quyết định rẽ nhánh nghiệp vụ: Lãnh đạo chấp thuận duyệt thụ lý (ký số chuyển cấp số) HOẶC yêu cầu trả lại để cán bộ chỉnh sửa, hoàn thiện bổ sung chứng cứ.',
    legalBasis: 'Điều 29, Điều 30 Luật Tố cáo 2018',
    description:
      'Nút quyết định rẽ nhánh: Lãnh đạo đồng ý ký duyệt thụ lý (chuyển cấp số) HOẶC yêu cầu cán bộ chỉnh sửa, hoàn thiện bổ sung chứng cứ.',
    suggestedAction: 'Phê duyệt hoặc chuyển trả yêu cầu hoàn thiện.',
    ketQuaCuoiCung: {
      tieuDe: 'Quyết định phê duyệt: Chấp thuận thụ lý HOẶC Yêu cầu chỉnh sửa',
      vanBanDauRa: 'Lệnh phê duyệt ký số (Chấp thuận) HOẶC Phiếu yêu cầu hoàn thiện hồ sơ',
      trangThaiHoSo: 'Nếu duyệt: Chuyển cấp số thụ lý; Nếu trả: Cán bộ hoàn thiện lại',
      thoiHanThucHien: 'Quyết định trong ngày làm việc',
      chiTietKetQua:
        'Xác định đường lối xử lý: Nếu hồ sơ đầy đủ -> Ký duyệt và chuyển cấp số chính thức; nếu chưa đạt -> Trả hồ sơ kèm lý do cụ thể để cán bộ thụ lý bổ sung.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Tiếp nhận kết quả ký duyệt của Lãnh đạo. Nếu có yêu cầu chỉnh sửa thì lập tức hoàn thiện lại hồ sơ theo chỉ đạo trong 24 giờ.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo có thẩm quyền',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Nhấn phê duyệt ký số để phát hành văn bản hoặc nhấn trả lại và nhập ý kiến chỉ đạo cụ thể.',
      },
      donViPhoiHop: 'Hệ thống Quản lý văn bản điều hành.',
    },
    taiLieuVanBan: null,
    lichSuTrinhKy: null,
  },

  'tl-4': {
    id: 'tl-4',
    name: 'Tự động cấp số thụ lý',
    code: 'BƯỚC 4 (GĐ 2)',
    role: 'he_thong',
    roleName: 'Hệ thống / Văn thư',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Tự động hóa hệ thống',
    thoiGianBatDau: 'Tức thời khi có lệnh duyệt',
    thoiGianHoanThanh: 'Tức thời (dưới 5 giây)',
    thoiDiemChuyenTiep: 'Chuyển sang Bước 5 để ban hành Thông báo',
    noiDungCongViec:
      'Sau khi Lãnh đạo hoàn tất ký số, Hệ thống tự động phát sinh số hiệu thụ lý kế tiếp, cập nhật tem thời gian điện tử (timestamp), điền số vào Quyết định thụ lý và khóa dữ liệu vào Sổ thụ lý điện tử.',
    legalBasis: 'Quy chuẩn số hóa & CSDL đơn thư điện tử',
    description:
      'Sau khi Lãnh đạo phê duyệt, Hệ thống tự động cấp số thụ lý chính thức (TLTC-2026/...) vào sổ thụ lý điện tử.',
    suggestedAction: 'Tự động cập nhật trạng thái hồ sơ trên toàn hệ thống.',
    ketQuaCuoiCung: {
      tieuDe: 'Hệ thống tự động cấp số thụ lý chính thức và cập nhật Sổ điện tử',
      vanBanDauRa: 'Số thụ lý chính thức: Số 26/QĐ-TLTC ghi nhận vào Sổ theo dõi thụ lý',
      trangThaiHoSo: 'Đã cấp số thụ lý chính thức – Khóa dữ liệu vào sổ',
      thoiHanThucHien: 'Tự động tức thời (ngay sau khi Lãnh đạo hoàn tất ký số)',
      chiTietKetQua:
        'Hệ thống tự động phát sinh số hiệu thụ lý kế tiếp, cập nhật tem thời gian điện tử (timestamp) và tự động điền số vào Quyết định thụ lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Kiểm tra số hiệu thụ lý được gắn trên văn bản điện tử và chuẩn bị phát hành thông báo gửi các bên liên quan.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Hệ thống CSDL & Văn thư điện tử',
        chucVu: 'Tác nhân tự động hóa hệ thống',
        donVi: 'Phân hệ Quản trị hệ thống',
        hanhDongCuThe:
          'Tự động kiểm tra chứng thư số của Lãnh đạo, giải mã và gắn số thụ lý chính thức theo quy chuẩn quản lý văn bản.',
      },
      donViPhoiHop: 'Văn thư đơn vị: Cập nhật sổ công văn đi điện tử.',
    },
    taiLieuVanBan: {
      id: 'doc-tl-4',
      tenVanBan: 'Sổ theo dõi thụ lý giải quyết đơn thư điện tử',
      soKyHieu: 'Mã số: TLTC-2026/026',
      loaiVanBan: 'Sổ điện tử hệ thống',
      nguoiTao: 'Hệ thống CSDL Quốc gia',
      chucVuNguoiTao: 'Tác nhân tự động hóa',
      thoiGianTao: 'Tự động theo thời gian thực',
      phienBan: 'v2.0',
      fileDinhKem: {
        tenFile: 'So_theo_doi_thu_ly_dien_tu_2026.pdf',
        dungLuong: '850 KB',
        dinhDang: 'pdf',
        soTrang: 4,
      },
      noiDungTomTat:
        'Ghi nhận số thụ lý chính thức 26/QĐ-TLTC vào CSDL điện tử quốc gia, đồng bộ liên thông đến các cổng dịch vụ công.',
      noiDungChiTiet:
        'TRÍCH LỤC SỔ THEO DÕI THỤ LÝ ĐIỆN TỬ\nMã hồ sơ: Đ-2026-00125\nSố thụ lý: 26/QĐ-TLTC\nThời điểm vào sổ: Timestamp điện tử hợp lệ.',
      trangThaiVanBan: 'da_ban_hanh',
      trangThaiText: 'Đã khóa sổ điện tử',
    },
    lichSuTrinhKy: null, // Bước hệ thống tự động, không qua trình ký thủ công
  },

  'tl-5': {
    id: 'tl-5',
    name: 'Ban hành Quyết định & Thông báo thụ lý tố cáo',
    code: 'BƯỚC 5 (GĐ 2)',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Chờ phát hành',
    thoiGianBatDau: 'Trong 05 ngày làm việc sau khi duyệt',
    thoiGianHoanThanh: 'Hạn: 05 ngày làm việc',
    thoiDiemChuyenTiep: 'Chuyển sang Bước 6 để đóng hồ sơ xử lý đơn',
    noiDungCongViec:
      'Ban hành Quyết định thụ lý và Thông báo thụ lý tố cáo gửi người tố cáo và người bị tố cáo. Gửi văn bản phát hành qua bưu chính bảo đảm và cập nhật mã vận đơn lên phần mềm.',
    legalBasis: 'Điều 30 Luật Tố cáo 2018',
    description:
      'Ban hành Quyết định thụ lý và Thông báo thụ lý tố cáo gửi người tố cáo và người bị tố cáo. Hoàn tất quy trình xử lý đơn tố cáo.',
    suggestedAction: 'Hoàn tất đóng Task xử lý đơn tố cáo trên hệ thống.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Thông báo thụ lý gửi người tố cáo (HOÀN TẤT XỬ LÝ ĐƠN)',
      vanBanDauRa: 'Thông báo thụ lý tố cáo số 26/TB-TLTC & Quyết định thụ lý (Mẫu số 01)',
      trangThaiHoSo: '✓ HOÀN TẤT XỬ LÝ ĐƠN – Chuyển sang giai đoạn Giải quyết tố cáo',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày ban hành Quyết định thụ lý',
      chiTietKetQua:
        'Gửi Thông báo việc thụ lý cho người tố cáo và thông báo cho người bị tố cáo về nội dung được thụ lý theo Điều 30 Luật Tố cáo 2018. Hoàn thành toàn diện quy trình xử lý đơn ban đầu!',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Lập danh sách gửi văn bản, phối hợp với Văn thư gửi Thông báo cho người tố cáo, người bị tố cáo và cơ quan cấp trên; cập nhật mã bưu chính lên hệ thống.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan CSĐT',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Ký ban hành Thông báo việc thụ lý gửi người tố cáo và ký Quyết định thành lập Tổ xác minh nội dung tố cáo.',
      },
      donViPhoiHop: 'Văn thư: Đóng dấu phát hành văn bản, gửi chuyển phát bảo đảm và lưu hồ sơ lưu chiểu.',
    },
    taiLieuVanBan: {
      id: 'doc-tl-5',
      tenVanBan: 'Thông báo thụ lý giải quyết tố cáo (Mẫu số 02/TB-TLTC)',
      soKyHieu: 'Số 26/TB-TLTC',
      loaiVanBan: 'Thông báo',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ chuyên môn thụ lý',
      thoiGianTao: 'Dự thảo theo mẫu',
      phienBan: 'v1.0',
      fileDinhKem: {
        tenFile: 'Thong_bao_thu_ly_to_cao_26_TB.pdf',
        dungLuong: '420 KB',
        dinhDang: 'pdf',
        soTrang: 2,
      },
      noiDungTomTat:
        'Thông báo chính thức cho người tố cáo và người bị tố cáo về việc đã thụ lý giải quyết nội dung tố cáo vi phạm tại ngõ 128 Đội Cấn theo Điều 30 Luật Tố cáo.',
      noiDungChiTiet:
        'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nTHÔNG BÁO\nVề việc thụ lý giải quyết tố cáo\nSố: 26/TB-TLTC\n\nKính gửi: Đại diện cư dân TDP số 3 (Người tố cáo)\nCăn cứ Điều 30 Luật Tố cáo ngày 12 tháng 6 năm 2018;\nCơ quan xin thông báo: Đã thụ lý giải quyết tố cáo vụ việc vi phạm tại ngõ 128 Đội Cấn kể từ ngày ký quyết định.',
      trangThaiVanBan: 'da_ban_hanh',
      trangThaiText: 'Đã ban hành',
      chuKySo: {
        nguoiKy: 'Thượng tá Trần Tuấn Nghĩa',
        thoiGianKy: 'Thời điểm ban hành chính thức',
        chungThu: 'Ban Cơ yếu Chính phủ',
        trangThaiChuKy: 'hop_le',
      },
    },
    lichSuTrinhKy: [
      {
        id: 'round-tl5-1',
        luotTrinh: 1,
        tieuDeLuot: 'Lượt trình 1 (Ký ban hành Thông báo thụ lý)',
        kieuTrinh: 'tuan_tu',
        kieuTrinhText: 'Trình tuần tự (Sequential)',
        thoiGianBatDau: 'Sau khi cấp số',
        thoiGianKetThuc: 'Trong ngày làm việc',
        phienBanVanBan: 'v1.0',
        ketQuaCuoiCung: 'Đã phê duyệt ban hành Thông báo',
        ketQuaStatus: 'phe_duyet',
        nguoiTrinh: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ thụ lý',
          thoiGian: 'Sau khi có số',
        },
        danhSachNguoiThamGia: [
          {
            id: 'p-tl5-1',
            soThuTu: 1,
            hoTen: 'Nguyễn Minh Anh',
            chucVu: 'Cán bộ chuyên môn thụ lý',
            donVi: 'Tổ Xử lý đơn',
            vaiTro: 'nguoi_trinh',
            vaiTroText: 'Người trình văn bản',
            hanhDong: 'trinh',
            hanhDongText: 'Đã trình duyệt thông báo',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: 'Trong ngày',
            phienBanXuLy: 'v1.0',
            yKien: 'Kính trình Lãnh đạo ký ban hành Thông báo thụ lý gửi người tố cáo.',
          },
          {
            id: 'p-tl5-2',
            soThuTu: 2,
            hoTen: 'Thượng tá Trần Tuấn Nghĩa',
            chucVu: 'Phó Thủ trưởng Cơ quan CSĐT',
            donVi: 'Lãnh đạo đơn vị',
            vaiTro: 'lanh_dao_phe_duyet',
            vaiTroText: 'Lãnh đạo có thẩm quyền phê duyệt',
            hanhDong: 'phe_duyet',
            hanhDongText: 'ĐÃ PHÊ DUYỆT (Ký số CA)',
            trangThaiXuLy: 'hoan_thanh',
            trangThaiXuLyText: 'Hoàn thành',
            thoiGian: 'Trong ngày',
            phienBanXuLy: 'v1.0',
            yKien: 'Đồng ý ban hành. Giao Văn thư chuyển phát bảo đảm ngay trong ngày.',
          },
        ],
      },
    ],
  },

  'tl-6': {
    id: 'tl-6',
    name: 'Hoàn tất đóng hồ sơ xử lý đơn',
    code: 'BƯỚC 6 (GĐ 2)',
    role: 'he_thong',
    roleName: 'Hệ thống / Văn thư',
    stageName: 'GĐ 2 – Phê duyệt & Thụ lý đơn',
    macroPhase: 'don_to_cao',
    status: 'pending',
    trangThaiText: 'Tự động khóa lưu trữ',
    thoiGianBatDau: 'Ngay sau khi phát hành',
    thoiGianHoanThanh: 'Hoàn thành trong 24h',
    thoiDiemChuyenTiep: 'Kết chuyển toàn bộ hồ sơ sang Tổ Xác minh giải quyết',
    noiDungCongViec:
      'Hệ thống tự động đồng bộ toàn bộ văn bản thụ lý vào CSDL đơn thư quốc gia, khóa hồ sơ xử lý đơn ban đầu và bàn giao sang phân hệ Xác minh giải quyết.',
    legalBasis: 'Điều 30 Luật Tố cáo 2018 & Quy chế văn thư điện tử',
    description:
      'Hệ thống đồng bộ văn bản thụ lý vào CSDL đơn thư, khóa hồ sơ xử lý đơn và lưu trữ kết quả tiếp nhận, thụ lý.',
    suggestedAction: 'Đóng quy trình xử lý đơn tố cáo.',
    ketQuaCuoiCung: {
      tieuDe: 'Đóng hồ sơ xử lý tiếp nhận đơn & Lưu trữ điện tử vĩnh viễn (HOÀN TẤT 100%)',
      vanBanDauRa: 'Mã lưu trữ điện tử: HS-TLTC-2026-00125.zip & Biên bản đóng hồ sơ',
      trangThaiHoSo: '✓ HOÀN THÀNH 100% XỬ LÝ ĐƠN – Kết chuyển Tổ xác minh giải quyết',
      thoiHanThucHien: 'Hoàn tất ngay sau khi phát hành thông báo thụ lý',
      chiTietKetQua:
        'Khóa quyền chỉnh sửa hồ sơ xử lý ban đầu, xuất gói dữ liệu số hóa lưu trữ điện tử vĩnh viễn và kết chuyển toàn bộ tài liệu sang Tổ/Đoàn xác minh giải quyết tố cáo.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Kiểm tra đối soát toàn bộ thành phần hồ sơ số, ký chốt biên mục tài liệu số và xác nhận hoàn tất nhiệm vụ xử lý đơn trên hệ thống.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Hệ thống CSDL & Văn thư Lưu trữ',
        chucVu: 'Tác nhân tự động hóa',
        donVi: 'Bộ phận Lưu trữ & CNTT',
        hanhDongCuThe:
          'Tự động phân quyền lưu trữ, cập nhật trạng thái "Đã giải quyết giai đoạn xử lý đơn" trên báo cáo thống kê định kỳ.',
      },
      donViPhoiHop: 'Tổ xác minh nội dung tố cáo: Tiếp nhận bàn giao hồ sơ để tiến hành xác minh thực tế.',
    },
    taiLieuVanBan: {
      id: 'doc-tl-6',
      tenVanBan: 'Biên mục đóng gói hồ sơ lưu trữ điện tử xử lý đơn',
      soKyHieu: 'HS-TLTC-2026-00125.zip',
      loaiVanBan: 'Gói lưu trữ điện tử',
      nguoiTao: 'Hệ thống Văn thư số & Lưu trữ',
      chucVuNguoiTao: 'Tác nhân tự động hóa',
      thoiGianTao: 'Khi hoàn tất',
      phienBan: 'v1.0 (Khóa vĩnh viễn)',
      fileDinhKem: {
        tenFile: 'HS-TLTC-2026-00125_dong_goi_luu_tru.zip',
        dungLuong: '14.6 MB',
        dinhDang: 'pdf',
        soTrang: 18,
      },
      noiDungTomTat:
        'Gói dữ liệu điện tử đầy đủ các biên bản, báo cáo, quyết định và tài liệu chứng minh được ký số bảo mật chuẩn RSA-4096.',
      noiDungChiTiet:
        'HỒ SƠ LƯU TRỮ ĐIỆN TỬ\nMã hồ sơ: HS-TLTC-2026-00125\nĐã khóa quyền chỉnh sửa, phục vụ kiểm toán và thanh tra theo quy định.',
      trangThaiVanBan: 'da_ban_hanh',
      trangThaiText: 'Đã lưu trữ vĩnh viễn',
    },
    lichSuTrinhKy: null, // Bước hệ thống tự động, không qua trình ký
  },

  'rut-don-1': {
    id: 'rut-don-1',
    name: 'Rút đơn trong quá trình xử lý đơn',
    code: 'LUỒNG PHÁT SINH',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'Luồng phát sinh – Rút đơn',
    macroPhase: 'rut_don',
    status: 'pending',
    trangThaiText: 'Chờ phát sinh nếu có',
    thoiGianBatDau: 'Khi nhận văn bản xin rút',
    thoiGianHoanThanh: 'Trong 03 ngày làm việc',
    thoiDiemChuyenTiep: 'Ban hành Quyết định đình chỉ giải quyết',
    noiDungCongViec:
      'Trực tiếp làm việc với người có đơn xin rút để ghi nhận lý do, lập biên bản làm việc và dự thảo Quyết định đình chỉ giải quyết theo Điều 33 Luật Tố cáo nếu việc rút đơn hoàn toàn tự nguyện.',
    legalBasis: 'Điều 33 Luật Tố cáo 2018: Rút tố cáo',
    description:
      'Người tố cáo có văn bản xin rút toàn bộ hoặc một phần đơn tố cáo trước thời điểm ban hành quyết định giải quyết.',
    suggestedAction: 'Cán bộ kiểm tra xem việc rút đơn có bị ép buộc hay có dấu hiệu vi phạm để quyết định đình chỉ hoặc tiếp tục xử lý.',
    ketQuaCuoiCung: {
      tieuDe: 'Quyết định đình chỉ giải quyết HOẶC Tiếp tục xử lý nếu có dấu hiệu phạm tội',
      vanBanDauRa: 'Quyết định đình chỉ giải quyết tố cáo (hoặc Báo cáo tiếp tục xác minh)',
      trangThaiHoSo: 'Đình chỉ giải quyết tố cáo (hoặc chuyển luồng xác minh độc lập)',
      thoiHanThucHien: 'Trong 03 ngày làm việc kể từ khi nhận đơn xin rút',
      chiTietKetQua:
        'Xác minh làm rõ việc rút đơn có hoàn toàn tự nguyện không. Nếu tự nguyện và không có dấu hiệu lợi dụng/đe dọa -> ban hành Quyết định đình chỉ; nếu phát hiện hành vi vi phạm pháp luật nghiêm trọng -> tiếp tục giải quyết theo thẩm quyền.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe:
          'Trực tiếp làm việc với người có đơn xin rút để ghi nhận lý do, lập biên bản làm việc và dự thảo Quyết định đình chỉ giải quyết.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe:
          'Xem xét biên bản làm việc và ký ban hành Quyết định đình chỉ giải quyết tố cáo theo Điều 33 Luật Tố cáo.',
      },
      donViPhoiHop: 'Văn thư: Gửi Quyết định đình chỉ cho các bên liên quan.',
    },
    taiLieuVanBan: {
      id: 'doc-rut-don',
      tenVanBan: 'Biên bản làm việc về việc rút đơn & Quyết định đình chỉ',
      soKyHieu: 'Số 08/QĐ-ĐC',
      loaiVanBan: 'Quyết định đình chỉ',
      nguoiTao: 'Nguyễn Minh Anh',
      chucVuNguoiTao: 'Cán bộ chuyên môn thụ lý',
      thoiGianTao: 'Khi phát sinh',
      phienBan: 'v1.0 (Dự thảo)',
      fileDinhKem: {
        tenFile: 'Quyet_dinh_dinh_chi_giai_quyet_to_cao_08_QD.pdf',
        dungLuong: '340 KB',
        dinhDang: 'pdf',
        soTrang: 2,
      },
      noiDungTomTat:
        'Đình chỉ việc giải quyết tố cáo căn cứ Điều 33 Luật Tố cáo 2018 do người tố cáo tự nguyện rút toàn bộ đơn.',
      noiDungChiTiet:
        'QUYẾT ĐỊNH ĐÌNH CHỈ GIẢI QUYẾT TỐ CÁO\nSố: 08/QĐ-ĐC\nCăn cứ Điều 33 Luật Tố cáo 2018...\nĐình chỉ giải quyết tố cáo do người tố cáo rút đơn tự nguyện.',
      trangThaiVanBan: 'ban_nhap',
      trangThaiText: 'Bản nháp mẫu',
    },
    lichSuTrinhKy: null,
  },
};
