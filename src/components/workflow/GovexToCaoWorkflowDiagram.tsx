import React, { useState } from 'react';

export interface GovexNodeDetail {
  id: string;
  name: string;
  code?: string;
  role: 'can_bo' | 'lanh_dao' | 'he_thong';
  roleName: string;
  stageName: string;
  macroPhase: 'don_to_cao' | 'rut_don';
  status: 'completed' | 'active' | 'pending';
  legalBasis?: string;
  description?: string;
  draftDocument?: string;
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
}

const NODES_DATA: Record<string, GovexNodeDetail> = {
  'tn-1': {
    id: 'tn-1',
    name: '1. Tiếp nhận đơn',
    code: 'BƯỚC 1 (GĐ 1)',
    role: 'can_bo',
    roleName: 'Cán bộ chuyên môn',
    stageName: 'GĐ 1 – Tiếp nhận & Xác định hướng xử lý đơn',
    macroPhase: 'don_to_cao',
    status: 'completed',
    legalBasis: 'Điều 23 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    description: 'Tiếp nhận đơn tố cáo từ các nguồn (trực tiếp, dịch vụ bưu chính, Cổng DVC, chuyển từ cơ quan khác). Vào sổ tiếp nhận điện tử và lập phiếu biên nhận.',
    draftDocument: 'Phiếu tiếp nhận đơn tố cáo (Mẫu 01/BN).pdf',
    suggestedAction: 'Kiểm tra thông tin người nộp, đối tượng bị tố cáo và tài liệu đính kèm.',
    ketQuaCuoiCung: {
      tieuDe: 'Đã vào sổ điện tử & Ban hành Giấy biên nhận tiếp nhận đơn',
      vanBanDauRa: 'Giấy biên nhận tiếp nhận đơn (Mẫu số 01/BN) & Sổ tiếp nhận điện tử',
      trangThaiHoSo: 'Đã tiếp nhận hợp lệ – Cấp mã hồ sơ điện tử',
      thoiHanThucHien: 'Trong ngày làm việc (24 giờ kể từ khi tiếp nhận)',
      chiTietKetQua: 'Đơn và tài liệu kèm theo được số hóa 100%, cấp mã số tiếp nhận duy nhất trên hệ thống, xác thực danh tính người nộp qua VNeID/CCCD và giao Giấy biên nhận cho người nộp đơn.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn tiếp nhận hồ sơ',
        donVi: 'Bộ phận Tiếp nhận & Một cửa',
        hanhDongCuThe: 'Trực tiếp tiếp nhận đơn, kiểm tra tính đầy đủ của tài liệu kèm theo, đối chiếu CCCD/VNeID, nhập dữ liệu vào phần mềm và in Giấy biên nhận giao cho công dân.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Trung tá Lê Hồng Hải',
        chucVu: 'Chỉ huy phụ trách Bộ phận Một cửa / Tiếp dân',
        donVi: 'Phòng Tiếp công dân & Xử lý đơn',
        hanhDongCuThe: 'Kiểm tra sổ theo dõi tiếp nhận định kỳ và phân công cán bộ chuyên môn thụ lý sơ bộ.',
      },
      donViPhoiHop: 'Văn thư cơ quan: Đóng dấu tiếp nhận và vào sổ công văn đến điện tử.',
    },
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
    legalBasis: 'Điều 24 Luật Tố cáo 2018; Điều 8 Thông tư 05/2021/TT-TTCP',
    description: 'Rà soát thẩm quyền, xác minh thông tin ban đầu, đối chiếu 4 điều kiện thụ lý (rõ họ tên, địa chỉ người tố cáo, nội dung có cơ sở hay nặc danh, trùng lặp). Đưa ra 1 trong các hướng xử lý cụ thể.',
    draftDocument: 'Phiếu phân loại & Đề xuất hướng xử lý đơn.pdf',
    suggestedAction: 'Cán bộ xác nhận kết quả kiểm tra điều kiện thụ lý.',
    ketQuaCuoiCung: {
      tieuDe: 'Báo cáo kiểm tra xác minh ban đầu & Xác định 1 trong 4 hướng xử lý',
      vanBanDauRa: 'Phiếu phân loại & Báo cáo kết quả xác minh ban đầu (Mẫu 02/PL)',
      trangThaiHoSo: 'Đã hoàn tất phân loại sơ bộ – Xác định hướng xử lý luật định',
      thoiHanThucHien: 'Không quá 07 ngày làm việc kể từ ngày nhận đơn',
      chiTietKetQua: 'Kiểm tra thông tin người tố cáo, nội dung tố cáo, thẩm quyền giải quyết và các điều kiện thụ lý theo quy định của Luật Tố cáo. Lập phiếu đề xuất hướng xử lý cụ thể.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý hồ sơ',
        donVi: 'Tổ Xác minh & Xử lý đơn',
        hanhDongCuThe: 'Rà soát nội dung đơn, tra cứu CSDL đơn trùng lặp, liên hệ xác minh sơ bộ chứng cứ, lập Phiếu đề xuất chọn 1 trong 4 hướng: Không thụ lý / Yêu cầu bổ sung / Bàn giao / Trả lại đơn hoặc Đủ điều kiện thụ lý.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo phụ trách',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Xem xét và cho ý kiến chỉ đạo đối với báo cáo kết quả kiểm tra xác minh ban đầu của cán bộ thụ lý.',
      },
      donViPhoiHop: 'Bộ phận CNTT / Tra cứu CSDL quốc gia về tố cáo.',
    },
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
    legalBasis: 'Khoản 2 Điều 29 Luật Tố cáo 2018',
    description: 'Đơn không đủ điều kiện thụ lý (không rõ họ tên, địa chỉ; người tố cáo không có năng lực hành vi; vụ việc đã được giải quyết đúng thẩm quyền không có tình tiết mới). Ban hành Thông báo không thụ lý.',
    draftDocument: 'Thông báo không thụ lý tố cáo (Mẫu 03/TB-KTL).pdf',
    suggestedAction: 'Ban hành thông báo không thụ lý gửi người tố cáo và kết thúc xử lý đơn.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Thông báo không thụ lý giải quyết tố cáo (KẾT THÚC ĐƠN)',
      vanBanDauRa: 'Thông báo không thụ lý giải quyết tố cáo (Mẫu số 03/TB-KTL)',
      trangThaiHoSo: '✓ KẾT THÚC XỬ LÝ ĐƠN – Lưu trữ hồ sơ điện tử',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày có kết quả kiểm tra',
      chiTietKetQua: 'Không thụ lý đơn do không đủ điều kiện theo Điều 29 Luật Tố cáo 2018. Ban hành Thông báo gửi cho người tố cáo nêu rõ lý do không thụ lý, đồng thời kết thúc việc xử lý đơn trên hệ thống.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Dự thảo Thông báo không thụ lý giải quyết tố cáo nêu rõ căn cứ pháp luật theo Điều 29 Luật Tố cáo, hoàn thiện hồ sơ trình Lãnh đạo ký duyệt.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo có thẩm quyền quyết định',
        hanhDongCuThe: 'Ký số phê duyệt ban hành Thông báo không thụ lý gửi người tố cáo; phê duyệt lệnh kết thúc và đóng hồ sơ.',
      },
      donViPhoiHop: 'Văn thư: Phát hành văn bản qua dịch vụ bưu chính bảo đảm kèm mã tra cứu bưu điện.',
    },
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
    legalBasis: 'Điều 24 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
    description: 'Hồ sơ thiếu chứng cứ hoặc nội dung chưa đủ rõ để xem xét thụ lý. Ban hành Thông báo yêu cầu công dân bổ sung thông tin, tài liệu trong thời hạn luật định (10 ngày làm việc).',
    draftDocument: 'Thông báo yêu cầu bổ sung hồ sơ đơn (Mẫu 04/TB-BS).pdf',
    suggestedAction: 'Lập danh mục tài liệu còn thiếu và ban hành văn bản yêu cầu bổ sung.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Thông báo yêu cầu bổ sung thông tin, tài liệu (Hạn 10 ngày)',
      vanBanDauRa: 'Thông báo yêu cầu bổ sung tài liệu, chứng cứ (Mẫu số 04/TB-BS)',
      trangThaiHoSo: 'Tạm dừng tính hạn giải quyết – Chờ công dân bổ sung (10 ngày)',
      thoiHanThucHien: 'Người gửi đơn có 10 ngày làm việc để nộp bổ sung hồ sơ',
      chiTietKetQua: 'Chỉ rõ các nội dung, tài liệu còn thiếu cần bổ sung. Sau thời hạn 10 ngày làm việc nếu người tố cáo không bổ sung thì cơ quan ban hành Thông báo không thụ lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Liệt kê danh mục tài liệu còn thiếu (giấy ủy quyền, hợp đồng, sao kê, chứng cứ gốc), lập dự thảo Thông báo yêu cầu bổ sung, trình ký và gửi văn bản cho công dân qua bưu chính/VNeID.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo có thẩm quyền',
        hanhDongCuThe: 'Ký số ban hành Thông báo yêu cầu bổ sung và phê duyệt tạm dừng thời hạn xử lý trên hệ thống.',
      },
      donViPhoiHop: 'Văn thư: Gửi phát bảo đảm và lưu phiếu theo dõi hạn bổ sung 10 ngày.',
    },
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
    legalBasis: 'Điều 26 Luật Tố cáo 2018',
    description: 'Đơn không thuộc thẩm quyền giải quyết của cơ quan. Lập Phiếu chuyển đơn tố cáo và thực hiện bàn giao hồ sơ sang cơ quan có thẩm quyền giải quyết.',
    draftDocument: 'Phiếu chuyển đơn tố cáo số 15/PC-ĐTC.pdf',
    suggestedAction: 'Chuyển giao hồ sơ đơn và kết thúc xử lý tại đơn vị.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Phiếu chuyển đơn & Biên bản bàn giao hồ sơ (KẾT THÚC ĐƠN)',
      vanBanDauRa: 'Phiếu chuyển đơn tố cáo số 15/PC-ĐTC & Biên bản bàn giao hồ sơ',
      trangThaiHoSo: '✓ KẾT THÚC XỬ LÝ ĐƠN – Đã chuyển cơ quan có thẩm quyền',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày xác định thẩm quyền',
      chiTietKetQua: 'Chuyển toàn bộ hồ sơ đơn và tài liệu đính kèm đến đúng cơ quan, người có thẩm quyền giải quyết theo Điều 26 Luật Tố cáo; đồng thời ban hành văn bản thông báo cho người tố cáo biết.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Tiếp nhận & Xử lý đơn',
        hanhDongCuThe: 'Xác định chính xác cơ quan có thẩm quyền, lập Phiếu chuyển đơn và văn bản thông báo gửi công dân, niêm phong tài liệu gốc và hoàn tất thủ tục bàn giao.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Ký ban hành Phiếu chuyển đơn tố cáo gửi cơ quan tiếp nhận và ký thông báo gửi người gửi đơn.',
      },
      donViPhoiHop: 'Đơn vị tiếp nhận mới: Ký biên bản giao nhận hồ sơ vụ việc.',
    },
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
    legalBasis: 'Điều 25 Luật Tố cáo 2018',
    description: 'Đơn không thuộc thẩm quyền và không thuộc trường hợp chuyển tiếp, hoặc người tố cáo gửi sai quy định. Ban hành văn bản hướng dẫn và trả lại hồ sơ.',
    draftDocument: 'Văn bản hướng dẫn & Phiếu trả lại đơn.pdf',
    suggestedAction: 'Gửi văn bản trả lời cho người tố cáo và kết thúc xử lý đơn.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Phiếu hướng dẫn & Biên bản trả lại đơn (KẾT THÚC ĐƠN)',
      vanBanDauRa: 'Phiếu hướng dẫn công dân (Mẫu số 05/HD) & Biên bản trả đơn',
      trangThaiHoSo: '✓ KẾT THÚC XỬ LÝ ĐƠN – Đã trả lại đơn & hướng dẫn',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày nhận đơn',
      chiTietKetQua: 'Hướng dẫn cụ thể cơ quan, tổ chức có thẩm quyền để người tố cáo làm lại đơn theo đúng quy định pháp luật; hoàn trả lại hồ sơ tài liệu gốc và đóng việc xử lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ tiếp nhận & xử lý đơn',
        donVi: 'Bộ phận Tiếp nhận & Một cửa',
        hanhDongCuThe: 'Soạn thảo văn bản hướng dẫn gửi công dân nêu rõ cơ quan có thẩm quyền tiếp nhận; liên hệ công dân nhận lại tài liệu hoặc gửi trả qua bưu điện có bảo đảm.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Ký duyệt văn bản hướng dẫn công dân và phê duyệt lệnh kết thúc xử lý đơn trên hệ thống.',
      },
      donViPhoiHop: 'Văn thư: Gửi phát kèm biên nhận báo phát của bưu điện.',
    },
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
    legalBasis: 'Điều 29 Luật Tố cáo 2018 (4 Điều kiện thụ lý)',
    description: 'Hồ sơ thỏa mãn đầy đủ 4/4 điều kiện thụ lý luật định. Kích hoạt chuyển tiếp sang Giai đoạn 2: Lập Tờ trình đề xuất thụ lý.',
    draftDocument: 'Biên bản đối chiếu 4 điều kiện thụ lý tố cáo.pdf',
    suggestedAction: 'Chuyển trạng thái hồ sơ sang Giai đoạn 2 và tiến hành lập Tờ trình.',
    ketQuaCuoiCung: {
      tieuDe: 'Xác nhận hồ sơ đủ 4/4 điều kiện thụ lý – Chuyển Giai đoạn 2',
      vanBanDauRa: 'Biên bản thẩm định điều kiện thụ lý & Phiếu chuyển hồ sơ sang GĐ 2',
      trangThaiHoSo: 'Đạt điều kiện thụ lý – Chuyển sang Giai đoạn 2: Lập Tờ trình',
      thoiHanThucHien: 'Trong 07 ngày làm việc kể từ ngày nhận đơn',
      chiTietKetQua: 'Đơn có họ tên, địa chỉ người tố cáo rõ ràng; nội dung thuộc thẩm quyền của cơ quan; có cơ sở chứng cứ ban đầu về hành vi vi phạm và người tố cáo có năng lực hành vi. Đủ điều kiện chuyển Lãnh đạo xem xét thụ lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý hồ sơ',
        donVi: 'Tổ Xác minh & Xử lý đơn',
        hanhDongCuThe: 'Ký xác nhận đạt 4/4 tiêu chí thẩm tra theo Điều 29 Luật Tố cáo, kích hoạt chế độ bảo vệ bí mật thông tin người tố cáo và chuyển hồ sơ sang GĐ 2.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo phụ trách',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Ghi nhận báo cáo kiểm tra sơ bộ, phê duyệt chủ trương thụ lý và giao cán bộ lập Tờ trình chính thức.',
      },
      donViPhoiHop: 'Tổ Công nghệ thông tin: Kích hoạt chế độ bảo mật danh tính người tố cáo.',
    },
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
    legalBasis: 'Điều 29 Luật Tố cáo 2018',
    description: 'Lập Báo cáo / Tờ trình đề xuất thụ lý giải quyết tố cáo gửi Lãnh đạo có thẩm quyền phê duyệt.',
    draftDocument: 'Tờ trình đề xuất thụ lý giải quyết tố cáo.pdf',
    suggestedAction: 'Dự thảo Quyết định thụ lý theo Mẫu số 01 và dự thảo Thông báo thụ lý.',
    ketQuaCuoiCung: {
      tieuDe: 'Hoàn thiện Tờ trình đề xuất thụ lý & Dự thảo Quyết định Mẫu số 01',
      vanBanDauRa: 'Tờ trình đề xuất thụ lý tố cáo + Dự thảo QĐ Thụ lý (Mẫu 01) + Kế hoạch xác minh',
      trangThaiHoSo: 'Đã hoàn tất hồ sơ đề xuất – Sẵn sàng chuyển trình Lãnh đạo ký duyệt',
      thoiHanThucHien: 'Trong 03 ngày làm việc kể từ khi xác định đủ điều kiện',
      chiTietKetQua: 'Xây dựng hoàn chỉnh hồ sơ đề xuất thụ lý: xác định rõ nội dung thụ lý, phạm vi xác minh, dự kiến nhân sự Tổ/Đoàn xác minh và các tài liệu chứng cứ chứng minh.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý chính',
        donVi: 'Tổ Xử lý đơn chuyên môn',
        hanhDongCuThe: 'Lập Tờ trình đề xuất thụ lý giải quyết tố cáo; soạn thảo Dự thảo Quyết định thụ lý (Mẫu số 01) và Dự thảo Kế hoạch xác minh chi tiết.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Trung tá Lê Hồng Hải',
        chucVu: 'Đội trưởng / Chỉ huy Đội phụ trách',
        donVi: 'Lãnh đạo cấp phòng/đội',
        hanhDongCuThe: 'Rà soát chuyên môn, ký nháy vào Tờ trình và dự thảo Quyết định trước khi gửi lên Lãnh đạo cơ quan.',
      },
      donViPhoiHop: 'Tổ chuyên môn: Họp thống nhất đường lối và danh sách thành viên Tổ xác minh.',
    },
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
    legalBasis: 'Quy chế làm việc & phân cấp thẩm quyền ký duyệt',
    description: 'Chuyển hồ sơ và tờ trình thụ lý vào danh sách Trình ký của Lãnh đạo qua hệ thống Quản lý công việc điện tử.',
    draftDocument: 'Hồ sơ trình ký thụ lý đơn tố cáo số 88/TK-TLTC.pdf',
    suggestedAction: 'Theo dõi ý kiến phản hồi hoặc yêu cầu chỉnh sửa từ Lãnh đạo.',
    ketQuaCuoiCung: {
      tieuDe: 'Hồ sơ thụ lý được gửi đến mục "Văn bản chờ ký" của Lãnh đạo',
      vanBanDauRa: 'Phiếu trình ký điện tử số 88/TK-TLTC kèm hồ sơ tài liệu số hóa',
      trangThaiHoSo: 'Đang trình Lãnh đạo – Chờ phê duyệt & ký số',
      thoiHanThucHien: 'Trong 24 giờ sau khi hoàn tất tờ trình',
      chiTietKetQua: 'Chuyển hồ sơ lên phân hệ Trình ký điện tử, thông báo tự động tới tài khoản Lãnh đạo phụ trách để xem xét và cho ý kiến chỉ đạo phê duyệt.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Tải toàn bộ file tài liệu số hóa lên hệ thống Trình ký, chọn người ký là Thượng tá Trần Tuấn Nghĩa, nhập tóm tắt nội dung đề xuất và gửi lệnh trình ký.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo có thẩm quyền',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Tiếp nhận thông báo hồ sơ trình ký mới trong hòm thư công vụ và danh mục "Văn bản chờ ký".',
      },
      donViPhoiHop: 'Hệ thống Quản lý văn bản điện tử: Tự động ghi vết thời gian trình ký.',
    },
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
    legalBasis: 'Điều 29, Điều 30 Luật Tố cáo 2018',
    description: 'Lãnh đạo xem xét hồ sơ: Phê duyệt thụ lý hoặc yêu cầu cán bộ chuyên môn chỉnh sửa, làm rõ thêm.',
    draftDocument: 'Ý kiến phê duyệt của Lãnh đạo.pdf',
    suggestedAction: 'Lãnh đạo ký số phê duyệt hoặc phản hồi yêu cầu chỉnh sửa.',
    ketQuaCuoiCung: {
      tieuDe: 'Lãnh đạo ký số phê duyệt Tờ trình & Ký ban hành Quyết định thụ lý',
      vanBanDauRa: 'Quyết định thụ lý giải quyết tố cáo (Chữ ký số điện tử CA hợp lệ)',
      trangThaiHoSo: 'Đã phê duyệt thụ lý – Chuyển hệ thống cấp số chính thức',
      thoiHanThucHien: 'Trong 02 ngày làm việc kể từ ngày nhận tờ trình',
      chiTietKetQua: 'Lãnh đạo có thẩm quyền xem xét toàn diện hồ sơ, ký số phê duyệt Tờ trình và ký ban hành Quyết định thụ lý giải quyết tố cáo theo Điều 29, 30 Luật Tố cáo 2018.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Trực tiếp báo cáo, giải trình các nội dung nghiệp vụ hoặc cập nhật chỉnh sửa theo ý kiến chỉ đạo của Lãnh đạo nếu có.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan CSĐT / Người có thẩm quyền',
        donVi: 'Thủ trưởng / Người đứng đầu cơ quan',
        hanhDongCuThe: 'Sử dụng Token chữ ký số chuyên dùng ký phê duyệt Tờ trình và ký ban hành Quyết định thụ lý giải quyết tố cáo (hoặc gửi ý kiến yêu cầu chỉnh sửa lại).',
      },
      donViPhoiHop: 'Ban Cơ yếu / Đơn vị cung cấp dịch vụ chứng thực chữ ký số.',
    },
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
    legalBasis: 'Điều 29, Điều 30 Luật Tố cáo 2018',
    description: 'Nút quyết định rẽ nhánh: Lãnh đạo đồng ý ký duyệt thụ lý (chuyển cấp số) HOẶC yêu cầu cán bộ chỉnh sửa, hoàn thiện bổ sung chứng cứ.',
    draftDocument: 'Lệnh phê duyệt ký số hoặc Phiếu yêu cầu chỉnh sửa.pdf',
    suggestedAction: 'Phê duyệt hoặc chuyển trả yêu cầu hoàn thiện.',
    ketQuaCuoiCung: {
      tieuDe: 'Quyết định phê duyệt: Chấp thuận thụ lý HOẶC Yêu cầu chỉnh sửa',
      vanBanDauRa: 'Lệnh phê duyệt ký số (Chấp thuận) HOẶC Phiếu yêu cầu hoàn thiện hồ sơ',
      trangThaiHoSo: 'Nếu duyệt: Chuyển cấp số thụ lý; Nếu trả: Cán bộ hoàn thiện lại',
      thoiHanThucHien: 'Quyết định trong ngày làm việc',
      chiTietKetQua: 'Xác định đường lối xử lý: Nếu hồ sơ đầy đủ -> Ký duyệt và chuyển cấp số chính thức; nếu chưa đạt -> Trả hồ sơ kèm lý do cụ thể để cán bộ thụ lý bổ sung.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Tiếp nhận kết quả ký duyệt của Lãnh đạo. Nếu có yêu cầu chỉnh sửa thì lập tức hoàn thiện lại hồ sơ theo chỉ đạo trong 24 giờ.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo có thẩm quyền',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Nhấn phê duyệt ký số để phát hành văn bản hoặc nhấn trả lại và nhập ý kiến chỉ đạo cụ thể.',
      },
      donViPhoiHop: 'Hệ thống Quản lý văn bản điều hành.',
    },
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
    legalBasis: 'Quy chuẩn số hóa & CSDL đơn thư điện tử',
    description: 'Sau khi Lãnh đạo phê duyệt, Hệ thống tự động cấp số thụ lý chính thức (TLTC-2026/...) vào sổ thụ lý điện tử.',
    draftDocument: 'Sổ theo dõi thụ lý điện tử.pdf',
    suggestedAction: 'Tự động cập nhật trạng thái hồ sơ trên toàn hệ thống.',
    ketQuaCuoiCung: {
      tieuDe: 'Hệ thống tự động cấp số thụ lý chính thức và cập nhật Sổ điện tử',
      vanBanDauRa: 'Số thụ lý chính thức: Số 26/QĐ-TLTC ghi nhận vào Sổ theo dõi thụ lý',
      trangThaiHoSo: 'Đã cấp số thụ lý chính thức – Khóa dữ liệu vào sổ',
      thoiHanThucHien: 'Tự động tức thời (ngay sau khi Lãnh đạo hoàn tất ký số)',
      chiTietKetQua: 'Hệ thống tự động phát sinh số hiệu thụ lý kế tiếp, cập nhật tem thời gian điện tử (timestamp) và tự động điền số vào Quyết định thụ lý.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Kiểm tra số hiệu thụ lý được gắn trên văn bản điện tử và chuẩn bị phát hành thông báo gửi các bên liên quan.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Hệ thống CSDL & Văn thư điện tử',
        chucVu: 'Tác nhân tự động hóa hệ thống',
        donVi: 'Phân hệ Quản trị hệ thống',
        hanhDongCuThe: 'Tự động kiểm tra chứng thư số của Lãnh đạo, giải mã và gắn số thụ lý chính thức theo quy chuẩn quản lý văn bản.',
      },
      donViPhoiHop: 'Văn thư đơn vị: Cập nhật sổ công văn đi điện tử.',
    },
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
    legalBasis: 'Điều 30 Luật Tố cáo 2018',
    description: 'Ban hành Quyết định thụ lý và Thông báo thụ lý tố cáo gửi người tố cáo và người bị tố cáo. Hoàn tất quy trình xử lý đơn tố cáo.',
    draftDocument: 'Thông báo thụ lý giải quyết tố cáo số 26/TB-TLTC.pdf',
    suggestedAction: 'Hoàn tất đóng Task xử lý đơn tố cáo trên hệ thống.',
    ketQuaCuoiCung: {
      tieuDe: 'Ban hành Thông báo thụ lý gửi người tố cáo (HOÀN TẤT XỬ LÝ ĐƠN)',
      vanBanDauRa: 'Thông báo thụ lý tố cáo số 26/TB-TLTC & Quyết định thụ lý (Mẫu số 01)',
      trangThaiHoSo: '✓ HOÀN TẤT XỬ LÝ ĐƠN – Chuyển sang giai đoạn Giải quyết tố cáo',
      thoiHanThucHien: 'Trong 05 ngày làm việc kể từ ngày ban hành Quyết định thụ lý',
      chiTietKetQua: 'Gửi Thông báo việc thụ lý cho người tố cáo và thông báo cho người bị tố cáo về nội dung được thụ lý theo Điều 30 Luật Tố cáo 2018. Hoàn thành toàn diện quy trình xử lý đơn ban đầu!',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Lập danh sách gửi văn bản, phối hợp với Văn thư gửi Thông báo cho người tố cáo, người bị tố cáo và cơ quan cấp trên; cập nhật mã bưu chính lên hệ thống.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan CSĐT',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Ký ban hành Thông báo việc thụ lý gửi người tố cáo và ký Quyết định thành lập Tổ xác minh nội dung tố cáo.',
      },
      donViPhoiHop: 'Văn thư: Đóng dấu phát hành văn bản, gửi chuyển phát bảo đảm và lưu hồ sơ lưu chiểu.',
    },
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
    legalBasis: 'Điều 30 Luật Tố cáo 2018 & Quy chế văn thư điện tử',
    description: 'Hệ thống đồng bộ văn bản thụ lý vào CSDL đơn thư, khóa hồ sơ xử lý đơn và lưu trữ kết quả tiếp nhận, thụ lý.',
    draftDocument: 'Hồ sơ lưu trữ điện tử xử lý đơn tố cáo.pdf',
    suggestedAction: 'Đóng quy trình xử lý đơn tố cáo.',
    ketQuaCuoiCung: {
      tieuDe: 'Đóng hồ sơ xử lý tiếp nhận đơn & Lưu trữ điện tử vĩnh viễn (HOÀN TẤT 100%)',
      vanBanDauRa: 'Mã lưu trữ điện tử: HS-TLTC-2026-00125.zip & Biên bản đóng hồ sơ',
      trangThaiHoSo: '✓ HOÀN THÀNH 100% XỬ LÝ ĐƠN – Kết chuyển Tổ xác minh giải quyết',
      thoiHanThucHien: 'Hoàn tất ngay sau khi phát hành thông báo thụ lý',
      chiTietKetQua: 'Khóa quyền chỉnh sửa hồ sơ xử lý ban đầu, xuất gói dữ liệu số hóa lưu trữ điện tử vĩnh viễn và kết chuyển toàn bộ tài liệu sang Tổ/Đoàn xác minh giải quyết tố cáo.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ thụ lý hồ sơ',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Kiểm tra đối soát toàn bộ thành phần hồ sơ số, ký chốt biên mục tài liệu số và xác nhận hoàn tất nhiệm vụ xử lý đơn trên hệ thống.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Hệ thống CSDL & Văn thư Lưu trữ',
        chucVu: 'Tác nhân tự động hóa',
        donVi: 'Bộ phận Lưu trữ & CNTT',
        hanhDongCuThe: 'Tự động phân quyền lưu trữ, cập nhật trạng thái "Đã giải quyết giai đoạn xử lý đơn" trên báo cáo thống kê định kỳ.',
      },
      donViPhoiHop: 'Tổ xác minh nội dung tố cáo: Tiếp nhận bàn giao hồ sơ để tiến hành xác minh thực tế.',
    },
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
    legalBasis: 'Điều 33 Luật Tố cáo 2018: Rút tố cáo',
    description: 'Người tố cáo có văn bản xin rút toàn bộ hoặc một phần đơn tố cáo trước thời điểm ban hành quyết định giải quyết.',
    draftDocument: 'Đơn xin rút nội dung tố cáo / Quyết định đình chỉ.pdf',
    suggestedAction: 'Cán bộ kiểm tra xem việc rút đơn có bị ép buộc hay có dấu hiệu vi phạm để quyết định đình chỉ hoặc tiếp tục xử lý.',
    ketQuaCuoiCung: {
      tieuDe: 'Quyết định đình chỉ giải quyết HOẶC Tiếp tục xử lý nếu có dấu hiệu phạm tội',
      vanBanDauRa: 'Quyết định đình chỉ giải quyết tố cáo (hoặc Báo cáo tiếp tục xác minh)',
      trangThaiHoSo: 'Đình chỉ giải quyết tố cáo (hoặc chuyển luồng xác minh độc lập)',
      thoiHanThucHien: 'Trong 03 ngày làm việc kể từ khi nhận đơn xin rút',
      chiTietKetQua: 'Xác minh làm rõ việc rút đơn có hoàn toàn tự nguyện không. Nếu tự nguyện và không có dấu hiệu lợi dụng/đe dọa -> ban hành Quyết định đình chỉ; nếu phát hiện hành vi vi phạm pháp luật nghiêm trọng -> tiếp tục giải quyết theo thẩm quyền.',
    },
    nguoiHanhDong: {
      canBoThucHien: {
        hoTen: 'Nguyễn Minh Anh',
        chucVu: 'Cán bộ chuyên môn thụ lý',
        donVi: 'Tổ Xử lý đơn',
        hanhDongCuThe: 'Trực tiếp làm việc với người có đơn xin rút để ghi nhận lý do, lập biên bản làm việc và dự thảo Quyết định đình chỉ giải quyết.',
      },
      lanhDaoKyDuyet: {
        hoTen: 'Thượng tá Trần Tuấn Nghĩa',
        chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo đơn vị',
        donVi: 'Lãnh đạo đơn vị',
        hanhDongCuThe: 'Xem xét biên bản làm việc và ký ban hành Quyết định đình chỉ giải quyết tố cáo theo Điều 33 Luật Tố cáo.',
      },
      donViPhoiHop: 'Văn thư: Gửi Quyết định đình chỉ cho các bên liên quan.',
    },
  },
};

export default function GovexToCaoWorkflowDiagram({
  donCode = 'Đ-2026-00125',
  donTitle = 'Tố giác sai phạm trật tự xây dựng & lấn chiếm lối đi chung tại ngõ 128 Đội Cấn',
  nguoiNop = 'Đại diện cư dân TDP số 3',
  onViewDocument,
}: {
  donCode?: string;
  donTitle?: string;
  nguoiNop?: string;
  onViewDocument?: (docInfo: {
    tenVanBan: string;
    soHieu?: string;
    loai?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
  }) => void;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tn-2');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  const selectedNode: GovexNodeDetail = NODES_DATA[selectedNodeId] || NODES_DATA['tn-2'];

  const handleViewDoc = () => {
    const tenVb = selectedNode.ketQuaCuoiCung.vanBanDauRa;
    const loai = tenVb.toLowerCase().includes('quyết định')
      ? 'quyet_dinh'
      : tenVb.toLowerCase().includes('thông báo')
        ? 'thong_bao'
        : tenVb.toLowerCase().includes('tờ trình')
          ? 'cong_van'
          : tenVb.toLowerCase().includes('biên bản')
            ? 'bien_ban'
            : 'thong_bao';

    const soHieuMatch = tenVb.match(/(?:Số|số|Mẫu số|Mẫu)\s*([\d\w\-\/]+)/);
    const soHieu = soHieuMatch ? soHieuMatch[1] : '01/VB-TC';

    if (onViewDocument) {
      onViewDocument({
        tenVanBan: tenVb,
        soHieu,
        loai,
        trichYeu: selectedNode.ketQuaCuoiCung.tieuDe || tenVb,
        noiDungChiTiet: `${selectedNode.ketQuaCuoiCung.tieuDe}\n\n${selectedNode.ketQuaCuoiCung.chiTietKetQua}\n\nCăn cứ pháp lý: ${selectedNode.legalBasis}\nThời hạn thực hiện: ${selectedNode.ketQuaCuoiCung.thoiHanThucHien}`,
      });
    } else {
      showToast(`✓ Chuyển sang tab Hồ sơ & Văn bản: ${tenVb}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold animate-fade-in border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Tiêu đề - Chuẩn hóa Quy trình xử lý đơn */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#0047AB] tracking-tight uppercase font-headline-md">
                QUY TRÌNH XỬ LÝ ĐƠN
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0047AB] border border-blue-200">
                Nhấp bước hoặc điều kiện để xem Kết quả &amp; Người thực hiện
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hồ sơ: <strong className="text-slate-800">{donCode}</strong> • {donTitle} • Người nộp: <strong>{nguoiNop}</strong>
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.75))}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="text-[11px] font-bold text-slate-700 px-2 font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Phóng to"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 rounded-lg hover:bg-white text-slate-600 text-[10px] font-bold transition-colors cursor-pointer"
            title="Khôi phục kích thước 100%"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VÙNG 1: SƠ ĐỒ LÀN BƠI QUY TRÌNH (CÓ SCROLL & ZOOM RIÊNG)                  */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-auto p-4 bg-slate-50">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', minWidth: '920px' }}
          className="transition-transform duration-150"
        >
          {/* ========================================================================= */}
          {/* PHẦN 1: BẢNG LÀN BƠI CHÍNH – QUY TRÌNH XỬ LÝ ĐƠN                          */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            {/* Header 2 Giai đoạn chuẩn của Xử lý đơn */}
            <div className="grid grid-cols-12 bg-sky-100/70 border-b border-slate-300 text-center font-bold text-xs text-slate-800">
              <div className="col-span-2 p-2.5 border-r border-slate-300 flex items-center justify-center bg-slate-100 text-slate-700 uppercase tracking-tight text-[11px]">
                TÁC NHÂN
              </div>
              <div className="col-span-5 p-2.5 border-r border-slate-300 text-[11px] uppercase bg-sky-50 text-blue-900 flex items-center justify-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white inline-flex items-center justify-center text-[10px]">1</span>
                <span>GĐ 1 – TIẾP NHẬN &amp; XÁC ĐỊNH HƯỚNG XỬ LÝ ĐƠN</span>
              </div>
              <div className="col-span-5 p-2.5 text-[11px] uppercase bg-sky-50 text-blue-900 flex items-center justify-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white inline-flex items-center justify-center text-[10px]">2</span>
                <span>GĐ 2 – PHÊ DUYỆT &amp; THỤ LÝ ĐƠN (HOÀN TẤT XỬ LÝ ĐƠN)</span>
              </div>
            </div>

            {/* 1. LÀN BƠI 1: CÁN BỘ CHUYÊN MÔN */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-sky-50/20 min-h-[220px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-sky-100/40">
                <span className="material-symbols-outlined text-blue-700 text-2xl">person</span>
                <span className="text-xs font-bold text-blue-950 mt-1 uppercase tracking-tight">
                  CÁN BỘ CHUYÊN MÔN
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Tiếp nhận &amp; Đề xuất xử lý</span>
              </div>

              {/* GĐ 1: Tiếp nhận -> Kiểm tra/Xác minh -> 4 nhánh kết quả */}
              <div className="col-span-5 p-3 border-r border-slate-300 flex flex-col justify-between gap-2.5">
                {/* 2 Bước đầu: Tiếp nhận -> Kiểm tra ban đầu */}
                <div className="flex items-center gap-2">
                  {/* Node 1: Tiếp nhận đơn */}
                  <div
                    onClick={() => {
                      setSelectedNodeId('tn-1');
                      showToast('● Đã chọn: Bước 1. Tiếp nhận đơn');
                    }}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tn-1'
                      ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-600 font-bold shadow-md scale-[1.02]'
                      : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-800 font-bold">Bước 1</span>
                      {selectedNodeId === 'tn-1' && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-blue-900 font-bold block leading-tight">1. Tiếp nhận đơn</span>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5">Vào sổ điện tử &amp; Phiếu nhận</span>
                  </div>

                  <span className="material-symbols-outlined text-blue-600 text-base shrink-0">arrow_forward</span>

                  {/* Node 2: Kiểm tra ban đầu & Xác minh */}
                  <div
                    onClick={() => {
                      setSelectedNodeId('tn-2');
                      showToast('● Đã chọn: Bước 2. Kiểm tra & Xác minh');
                    }}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tn-2'
                      ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-600 font-bold shadow-md scale-[1.02]'
                      : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-800 font-bold">Bước 2</span>
                      {selectedNodeId === 'tn-2' && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-blue-900 font-bold block leading-tight">2. Kiểm tra &amp; Xác minh</span>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5">Điều kiện thụ lý / Thẩm quyền</span>
                  </div>
                </div>

                {/* Khối quyết định Kết quả xử lý? & 4 nhánh kết quả */}
                <div className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 px-1">
                    <span className="uppercase tracking-tight text-slate-500">Kết quả kiểm tra &amp; xác minh:</span>
                    <span className="text-blue-700">4 Hướng xử lý</span>
                  </div>

                  {/* 4 Nhánh kết quả: Không thụ lý, Yêu cầu bổ sung, Bàn giao, Trả lại */}
                  <div className="grid grid-cols-4 gap-1.5 text-[9px]">
                    {/* Nhánh 1: Không thụ lý */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNodeId('tn-kt-khong-thu-ly');
                        showToast('● Đã chọn điều kiện: Không thụ lý giải quyết');
                      }}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-khong-thu-ly'
                        ? 'ring-2 ring-rose-600 bg-rose-100 border-rose-500 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="font-bold text-slate-800 leading-tight">Không thụ lý</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                        KẾT THÚC ĐƠN
                      </span>
                    </button>

                    {/* Nhánh 2: Yêu cầu bổ sung */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNodeId('tn-kt-yeu-cau-bo-sung');
                        showToast('● Đã chọn điều kiện: Yêu cầu bổ sung tài liệu (Hạn 10 ngày)');
                      }}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-yeu-cau-bo-sung'
                        ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="font-bold text-blue-900 leading-tight">Y/C Bổ sung</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-800 font-bold text-[8px]">
                        HẠN 10 NGÀY
                      </span>
                    </button>

                    {/* Nhánh 3: Bàn giao */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNodeId('tn-kt-ban-giao');
                        showToast('● Đã chọn điều kiện: Bàn giao / Chuyển cơ quan khác');
                      }}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-ban-giao'
                        ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="font-bold text-slate-800 leading-tight">Bàn giao</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                        KẾT THÚC ĐƠN
                      </span>
                    </button>

                    {/* Nhánh 4: Trả lại đơn */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNodeId('tn-kt-tra-lai');
                        showToast('● Đã chọn điều kiện: Trả lại đơn & Hướng dẫn');
                      }}
                      className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-tra-lai'
                        ? 'ring-2 ring-rose-600 bg-rose-100 border-rose-500 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="font-bold text-slate-800 leading-tight">Trả lại đơn</span>
                      <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                        KẾT THÚC ĐƠN
                      </span>
                    </button>
                  </div>

                  {/* Nhánh 5: Đủ điều kiện thụ lý -> Chuyển sang GĐ 2 */}
                  <div
                    onClick={() => {
                      setSelectedNodeId('tn-du-dieu-kien');
                      showToast('● Đã chọn: Đủ điều kiện thụ lý (Chuyển GĐ 2)');
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${selectedNodeId === 'tn-du-dieu-kien'
                      ? 'ring-2 ring-blue-600 bg-blue-200 border-blue-600 font-bold shadow-md'
                      : 'bg-blue-100/70 border-blue-200 hover:bg-blue-200/80 text-blue-900 font-bold'
                      } text-[10px]`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-blue-700">check_circle</span>
                      <span>Đủ điều kiện thụ lý:</span>
                    </span>
                    <span className="flex items-center gap-1 text-[9.5px] text-blue-800 font-bold">
                      Chuyển GĐ 2 (Đề xuất thụ lý)
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* GĐ 2: Đề xuất thụ lý -> Trình lãnh đạo + Cán bộ thụ lý tố cáo -> KẾT THÚC ĐƠN */}
              <div className="col-span-5 p-3 flex flex-col justify-between gap-2.5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => {
                        setSelectedNodeId('tl-1');
                        showToast('● Đã chọn: Đề xuất thụ lý');
                      }}
                      className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-1'
                        ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-blue-300 hover:border-blue-500'
                        }`}
                    >
                      <span className="text-[11px] text-blue-900 font-bold block leading-tight">Đề xuất thụ lý</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Lập Báo cáo / Tờ trình Mẫu 01</span>
                    </div>

                    <span className="material-symbols-outlined text-blue-600 text-base shrink-0">arrow_forward</span>

                    <div
                      onClick={() => {
                        setSelectedNodeId('tl-2');
                        showToast('● Đã chọn: Trình Lãnh đạo');
                      }}
                      className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-2'
                        ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-blue-300 hover:border-blue-500'
                        }`}
                    >
                      <span className="text-[11px] text-blue-900 font-bold block leading-tight">Trình Lãnh đạo</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Gửi hồ sơ vào mục Trình ký</span>
                    </div>
                  </div>

                  <div className="text-[9.5px] text-rose-600 font-semibold bg-rose-50/90 p-1.5 rounded-lg border border-rose-200 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">undo</span>
                    <span>Nhận lại nếu có yêu cầu chỉnh sửa, hoàn thiện từ Lãnh đạo</span>
                  </div>
                </div>

                {/* Kết quả sau duyệt: Cán bộ chuyên môn ban hành thông báo thụ lý tố cáo -> KẾT THÚC QUY TRÌNH XỬ LÝ ĐƠN */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div
                    onClick={() => {
                      setSelectedNodeId('tl-5');
                      showToast('● Đã chọn: Ban hành Quyết định & Thông báo thụ lý');
                    }}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-5'
                      ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                      : 'bg-white border-blue-300 hover:border-blue-500'
                      }`}
                  >
                    <span className="text-[10.5px] text-blue-950 font-bold block leading-tight">
                      Ban hành Quyết định &amp; Thông báo thụ lý tố cáo
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Mẫu số 01 / Gửi người tố cáo</span>
                  </div>

                  <div className="px-2.5 py-2 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-800 font-black text-[10px] shrink-0 text-center leading-tight">
                    <div>✓ HOÀN TẤT</div>
                    <div className="text-[8.5px] font-bold text-emerald-700">XỬ LÝ ĐƠN</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LÀN BƠI 2: LÃNH ĐẠO */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-amber-50/25 min-h-[110px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-amber-100/50">
                <span className="material-symbols-outlined text-amber-700 text-2xl">shield_person</span>
                <span className="text-xs font-bold text-amber-950 mt-1 uppercase tracking-tight">
                  LÃNH ĐẠO
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Người có thẩm quyền</span>
              </div>

              {/* GĐ 1: Theo dõi chỉ đạo chung */}
              <div className="col-span-5 p-3 border-r border-slate-300 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50/30">
                (Theo dõi tiến độ tiếp nhận &amp; phân loại đơn)
              </div>

              {/* GĐ 2: Lãnh đạo xem xét / phê duyệt đề xuất thụ lý */}
              <div className="col-span-5 p-3 flex items-center justify-between gap-3">
                <div
                  onClick={() => {
                    setSelectedNodeId('tl-3');
                    showToast('● Đã chọn: Lãnh đạo xem xét & phê duyệt đề xuất');
                  }}
                  className={`flex-1 p-2.5 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-3'
                    ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold shadow-md scale-[1.02]'
                    : 'bg-white border-amber-300 hover:border-amber-400'
                    }`}
                >
                  <span className="text-[11px] text-amber-950 font-bold block leading-tight">
                    Lãnh đạo xem xét &amp; phê duyệt đề xuất thụ lý
                  </span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">
                    Ký số phê duyệt Tờ trình &amp; Dự thảo Quyết định thụ lý
                  </span>
                </div>

                {/* Khối hình thoi quyết định: Ký duyệt thụ lý? */}
                <div
                  onClick={() => {
                    setSelectedNodeId('tl-duyet');
                    showToast('● Đã chọn quyết định: Ký duyệt thụ lý?');
                  }}
                  className={`w-20 h-16 rotate-45 flex items-center justify-center shrink-0 cursor-pointer transition-all ${selectedNodeId === 'tl-duyet'
                    ? 'ring-2 ring-purple-600 bg-purple-100 border-2 border-purple-600 shadow-md scale-105'
                    : 'bg-purple-50 border border-purple-300 hover:bg-purple-100 shadow-2xs'
                    }`}
                >
                  <span className="-rotate-45 text-[9.5px] font-bold text-purple-900 text-center leading-tight">
                    Ký duyệt<br />thụ lý?
                  </span>
                </div>
              </div>
            </div>

            {/* 3. LÀN BƠI 3: HỆ THỐNG / VĂN THƯ */}
            <div className="grid grid-cols-12 border-b border-slate-300 bg-slate-50 min-h-[95px]">
              <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-slate-200/60">
                <span className="material-symbols-outlined text-slate-700 text-2xl">database</span>
                <span className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">
                  HỆ THỐNG / VĂN THƯ
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Tự động hóa tác vụ</span>
              </div>

              {/* GĐ 1: Tự động cấp mã đơn & vào sổ điện tử */}
              <div className="col-span-5 p-3 border-r border-slate-300 flex items-center justify-center text-slate-500 text-xs font-medium">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-300 text-[10.5px]">
                  <span className="material-symbols-outlined text-blue-600 text-base">pin</span>
                  <span>Tự động cấp mã đơn điện tử &amp; đồng bộ CSDL tiếp nhận</span>
                </div>
              </div>

              {/* GĐ 2: Tự động cấp số thụ lý -> Hoàn tất đóng hồ sơ xử lý đơn */}
              <div className="col-span-5 p-3 flex items-center gap-2">
                <div
                  onClick={() => {
                    setSelectedNodeId('tl-4');
                    showToast('● Đã chọn: Tự động cấp số thụ lý');
                  }}
                  className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-4'
                    ? 'ring-2 ring-slate-600 bg-slate-200 border-slate-500 font-bold shadow-md scale-[1.02]'
                    : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                >
                  <span className="text-[10.5px] text-slate-800 font-bold block leading-tight">
                    Tự động cấp số thụ lý
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Số TLTC-2026/... vào sổ điện tử</span>
                </div>

                <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>

                <div
                  onClick={() => {
                    setSelectedNodeId('tl-6');
                    showToast('● Đã chọn: Hoàn tất đóng hồ sơ xử lý đơn');
                  }}
                  className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-6'
                    ? 'ring-2 ring-slate-600 bg-slate-200 border-slate-500 font-bold shadow-md scale-[1.02]'
                    : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                >
                  <span className="text-[10.5px] text-slate-800 font-bold block leading-tight">
                    Hoàn tất đóng hồ sơ xử lý đơn
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Lưu trữ kết quả xử lý đơn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 2: THÔNG TIN HIỂN THỊ (TÁCH RA BÊN NGOÀI QUY TRÌNH - DOCKED BOTTOM)   */}
      {/* ========================================================================= */}
      <div className="bg-white border-t border-slate-200 px-5 py-3 shrink-0 shadow-lg space-y-2.5 z-10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${selectedNode.role === 'lanh_dao'
                ? 'bg-amber-600 ring-2 ring-amber-200'
                : selectedNode.role === 'he_thong'
                  ? 'bg-slate-700 ring-2 ring-slate-300'
                  : 'bg-blue-600 ring-2 ring-blue-200'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {selectedNode.role === 'lanh_dao'
                  ? 'shield_person'
                  : selectedNode.role === 'he_thong'
                    ? 'database'
                    : 'person'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-label-technical">
                Bước đang chọn:
              </span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-headline-md">
                {selectedNode.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedNode.role === 'lanh_dao'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : selectedNode.role === 'he_thong'
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
              >
                {selectedNode.roleName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 italic hidden sm:inline">
              Nhấp bước hoặc điều kiện trên sơ đồ để xem thông tin
            </span>
            <button
              type="button"
              onClick={() => setIsDetailExpanded(!isDetailExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isDetailExpanded ? 'expand_more' : 'expand_less'}
              </span>
              <span>{isDetailExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
            </button>
          </div>
        </div>

        {isDetailExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 animate-fade-in">
            {/* CỘT TRÁI (7/12): KẾT QUẢ CUỐI CÙNG CỦA STEP */}
            <div className="lg:col-span-7 bg-gradient-to-br from-blue-50/40 via-sky-50/20 to-white rounded-xl border border-blue-200/80 p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider font-label-technical">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">task_alt</span>
                  <span>1. KẾT QUẢ CUỐI CÙNG CỦA STEP NÀY</span>
                </div>
                <span className="text-[9.5px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  Sản phẩm đầu ra
                </span>
              </div>

              {/* Văn bản / Biểu mẫu đầu ra ban hành */}
              <div
                onClick={handleViewDoc}
                className="p-2.5 bg-white rounded-xl border border-blue-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                title="Nhấn để đưa về tab Hồ sơ & Văn bản để xem"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10.5px] font-semibold text-slate-500 uppercase">
                        Văn bản / Biểu mẫu đầu ra:
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold text-[9.5px] border border-rose-200">
                        Văn bản chính thức
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-0.5 group-hover:text-blue-700 transition-colors">
                      {selectedNode.ketQuaCuoiCung.vanBanDauRa}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDoc();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer shrink-0"
                  title="Nhấn để đưa về tab Hồ sơ & Văn bản để xem"
                >
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                </button>
              </div>
            </div>

            {/* CỘT PHẢI (5/12): NGƯỜI HÀNH ĐỘNG & THẨM QUYỀN KÝ */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/30 via-slate-50 to-white rounded-xl border border-slate-200 p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider font-label-technical">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">group</span>
                  <span>2. NGƯỜI HÀNH ĐỘNG &amp; THẨM QUYỀN KÝ</span>
                </div>
                <span className="text-[9.5px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                  Phân vai trách nhiệm
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Thẻ 1: Cán bộ thực hiện */}
                <div className="p-2 bg-white rounded-xl border border-blue-200 shadow-2xs flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[15px]">person</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-bold text-blue-800 block truncate">
                      CÁN BỘ THỰC HIỆN
                    </span>
                    <span className="text-[11px] font-bold text-slate-900 block truncate" title={selectedNode.nguoiHanhDong.canBoThucHien.hoTen}>
                      {selectedNode.nguoiHanhDong.canBoThucHien.hoTen}
                    </span>
                  </div>
                </div>

                {selectedNode.nguoiHanhDong.lanhDaoKyDuyet ? (
                  <div className="p-2 bg-white rounded-xl border border-amber-200 shadow-2xs flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[15px]">draw</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-amber-800 block truncate">
                        LÃNH ĐẠO KÝ DUYỆT
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 block truncate" title={selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen}>
                        {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 flex items-center gap-2 text-slate-400">
                    <span className="material-symbols-outlined text-[15px]">remove</span>
                    <span className="text-[10px] italic">Không yêu cầu Lãnh đạo ký</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
