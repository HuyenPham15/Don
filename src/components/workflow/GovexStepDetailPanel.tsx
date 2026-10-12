import React, { useState } from 'react';
import {
  GovexNodeDetail,
  DocumentInfo,
  SubmissionRound,
} from './govexWorkflowData';

export type StepExecutionStatus =
  | 'chua_thuc_hien' // Chưa thực hiện
  | 'dang_thuc_hien' // Đang thực hiện
  | 'cho_phe_duyet'  // Chờ phê duyệt
  | 'da_hoan_thanh'  // Đã hoàn thành
  | 'bi_tra_lai';    // Bị trả lại

export interface StepTimelineEvent {
  id: string;
  thoiGian: string;
  nguoiThucHien: {
    hoTen: string;
    chucVu: string;
    donVi?: string;
  };
  hanhDong: string;
  hanhDongType: 'tiep_nhan' | 'lap_ho_so' | 'trinh_ky' | 'phe_duyet' | 'tra_lai' | 'ban_hanh' | 'tu_dong';
  noiDung: string;
  ketQua: string;
  yKienChiDao?: string;
}

export interface StepTransitionCondition {
  buocTiepTheo: string;
  buocTiepTheoId?: string;
  dieuKienChuyen: string;
  canCuPhapLy: string;
  daDatDieuKien: boolean;
  lyDoChuaChuyen?: string;
}

export interface OverallCaseStatus {
  type: 'dang_xu_ly' | 'thu_ly' | 'khong_thu_ly' | 'chuyen_xu_ly' | 'da_tra_lai';
  label: string;
  subLabel: string;
  badgeClass: string;
  icon: string;
}

interface GovexStepDetailPanelProps {
  selectedNode: GovexNodeDetail;
  donCode?: string;
  donTitle?: string;
  nguoiNop?: string;
  onClose: () => void;
  onSelectStep?: (stepId: string) => void;
  onOpenDocModal: (doc: DocumentInfo) => void;
  onViewDocument?: (docInfo: {
    tenVanBan: string;
    soHieu?: string;
    loai?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
  }) => void;
  onOpenQuanLyTrinhKy?: (luotTrinhId?: string) => void;
  showToast: (msg: string) => void;
}

// =========================================================================
// HELPER: TÍNH TOÁN TRẠNG THÁI BƯỚC CHUẨN HÓA (5 TRẠNG THÁI)
// =========================================================================
function getStepExecutionStatus(node: GovexNodeDetail): {
  status: StepExecutionStatus;
  label: string;
  badgeClass: string;
  dotColor: string;
  icon: string;
} {
  // 1. Kiểm tra nếu có lượt trình bị trả lại
  const hasReturnedRound = node.lichSuTrinhKy?.some((r) => r.ketQuaStatus === 'tra_lai');
  if (hasReturnedRound && node.status === 'active') {
    return {
      status: 'bi_tra_lai',
      label: 'Bị trả lại (Yêu cầu bổ sung)',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300/60',
      dotColor: 'bg-rose-600',
      icon: 'replay',
    };
  }

  // 2. Kiểm tra nếu bước đang ở trạng thái chờ lãnh đạo phê duyệt
  if (node.status === 'active' && (node.trangThaiText.includes('Chờ') || node.id === 'tl-3' || node.taiLieuVanBan?.trangThaiVanBan === 'da_trinh')) {
    return {
      status: 'cho_phe_duyet',
      label: 'Chờ phê duyệt',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300/60',
      dotColor: 'bg-amber-500',
      icon: 'hourglass_top',
    };
  }

  // 3. Đã hoàn thành
  if (node.status === 'completed') {
    return {
      status: 'da_hoan_thanh',
      label: 'Đã hoàn thành',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300/60',
      dotColor: 'bg-emerald-600',
      icon: 'check_circle',
    };
  }

  // 4. Đang thực hiện
  if (node.status === 'active') {
    return {
      status: 'dang_thuc_hien',
      label: 'Đang thực hiện',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-300/60',
      dotColor: 'bg-blue-600 animate-ping',
      icon: 'sync',
    };
  }

  // 5. Chưa thực hiện
  return {
    status: 'chua_thuc_hien',
    label: 'Chưa thực hiện',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 ring-1 ring-slate-300/60',
    dotColor: 'bg-slate-400',
    icon: 'schedule',
  };
}

// =========================================================================
// HELPER: TÍNH TOÁN KẾT QUẢ XỬ LÝ CHUNG CỦA TOÀN BỘ ĐƠN (MỤC 4)
// =========================================================================
function getOverallCaseStatus(nodeId: string): OverallCaseStatus {
  if (nodeId === 'tn-kt-khong-thu-ly') {
    return {
      type: 'khong_thu_ly',
      label: 'Không thụ lý',
      subLabel: 'Không đủ điều kiện theo Điều 29 Luật Tố cáo • Đã ban hành thông báo',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: 'cancel',
    };
  }
  if (nodeId === 'tn-kt-ban-giao') {
    return {
      type: 'chuyen_xu_ly',
      label: 'Chuyển xử lý (Bàn giao)',
      subLabel: 'Không thuộc thẩm quyền • Đã chuyển cơ quan có thẩm quyền giải quyết',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: 'outbox',
    };
  }
  if (nodeId === 'tn-kt-tra-lai') {
    return {
      type: 'da_tra_lai',
      label: 'Đã trả lại đơn',
      subLabel: 'Trả lại đơn và kèm văn bản hướng dẫn công dân nộp đúng thẩm quyền',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: 'reply',
    };
  }
  if (nodeId === 'tl-5' || nodeId === 'tl-6') {
    return {
      type: 'thu_ly',
      label: 'Đã thụ lý giải quyết',
      subLabel: 'Đã ban hành Quyết định thụ lý & Thông báo người tố cáo • Chuyển Tổ xác minh',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: 'verified',
    };
  }

  // Mặc định quy trình đang tiến hành
  return {
    type: 'dang_xu_ly',
    label: 'Đang xử lý (Giai đoạn 1: Tiếp nhận & Thẩm tra)',
    subLabel: 'Hồ sơ đang trong quá trình rà soát điều kiện thụ lý và hoàn thiện thủ tục',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    icon: 'pending_actions',
  };
}

// =========================================================================
// HELPER: DỮ LIỆU TIMELINE SỰ KIỆN NỘI BỘ THEO TỪNG BƯỚC (MỤC 2.D)
// =========================================================================
function getTimelineEventsForNode(node: GovexNodeDetail): StepTimelineEvent[] {
  // 1. Bước 1: Tiếp nhận đơn
  if (node.id === 'tn-1') {
    return [
      {
        id: 'ev-tn1-1',
        thoiGian: '08:15 - 12/03/2026',
        nguoiThucHien: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ Một cửa / Tiếp nhận',
          donVi: 'Bộ phận Tiếp nhận & Xử lý đơn',
        },
        hanhDong: 'Tiếp nhận đơn trực tiếp',
        hanhDongType: 'tiep_nhan',
        noiDung: 'Tiếp nhận đơn tố cáo từ Đại diện cư dân TDP số 3 tại Bộ phận Một cửa. Đối chiếu căn cước công dân gắn chip qua VNeID; kiểm tra 06 tệp chứng cứ kèm theo.',
        ketQua: 'Hồ sơ đầy đủ thành phần ban đầu; xác thực danh tính công dân thành công.',
      },
      {
        id: 'ev-tn1-2',
        thoiGian: '09:30 - 12/03/2026',
        nguoiThucHien: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ Một cửa / Tiếp nhận',
        },
        hanhDong: 'Số hóa hồ sơ',
        hanhDongType: 'lap_ho_so',
        noiDung: 'Quét số hóa 100% tài liệu giấy, gắn chữ ký số cán bộ tiếp nhận và tải lên Cơ sở dữ liệu Tiếp công dân điện tử.',
        ketQua: 'Đã tải lên 06 tệp PDF số hóa đạt chuẩn độ phân giải 300 DPI.',
      },
      {
        id: 'ev-tn1-3',
        thoiGian: '10:45 - 12/03/2026',
        nguoiThucHien: {
          hoTen: 'Hệ thống Quản lý đơn thư',
          chucVu: 'Tác nhân tự động hóa',
          donVi: 'Trung tâm Dữ liệu điện tử',
        },
        hanhDong: 'Vào sổ điện tử & Cấp mã',
        hanhDongType: 'tu_dong',
        noiDung: 'Khóa tem thời gian điện tử (timestamp), cấp mã hồ sơ duy nhất Đ-2026-00125 và đồng bộ vào Sổ tiếp nhận điện tử.',
        ketQua: 'Cấp mã hồ sơ điện tử: Đ-2026-00125.',
      },
      {
        id: 'ev-tn1-4',
        thoiGian: '11:30 - 12/03/2026',
        nguoiThucHien: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ Một cửa / Tiếp nhận',
        },
        hanhDong: 'Ban hành Giấy biên nhận',
        hanhDongType: 'ban_hanh',
        noiDung: 'In và bàn giao Giấy biên nhận số 01/BN cho công dân; kết chuyển toàn bộ dữ liệu sang Bước 2 để kiểm tra điều kiện thụ lý.',
        ketQua: 'Đã bàn giao Giấy biên nhận cho người nộp đơn; chuyển Bước 2 đúng hạn.',
      },
    ];
  }

  // 2. Bước 2: Kiểm tra & Xác minh điều kiện thụ lý
  if (node.id === 'tn-2') {
    return [
      {
        id: 'ev-tn2-1',
        thoiGian: '13:30 - 12/03/2026',
        nguoiThucHien: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ chuyên môn thụ lý',
          donVi: 'Tổ Xác minh & Xử lý đơn',
        },
        hanhDong: 'Rà soát 4 điều kiện thụ lý',
        hanhDongType: 'tiep_nhan',
        noiDung: 'Rà soát tính thẩm quyền và 4 tiêu chuẩn luật định theo Điều 29 Luật Tố cáo 2018. Tra cứu cơ sở dữ liệu quốc gia: không trùng lặp đơn.',
        ketQua: 'Xác định đủ thẩm quyền; cần bổ sung trích lục bản đồ hiện trạng ngõ 128 Đội Cấn.',
      },
      {
        id: 'ev-tn2-2',
        thoiGian: '14:00 - 12/03/2026',
        nguoiThucHien: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ chuyên môn thụ lý',
        },
        hanhDong: 'Lập Báo cáo v1.0 & Trình duyệt',
        hanhDongType: 'trinh_ky',
        noiDung: 'Soạn thảo Báo cáo kết quả kiểm tra xác minh ban đầu (v1.0), trình Phó Thủ trưởng Cơ quan xem xét cho ý kiến.',
        ketQua: 'Đã gửi hồ sơ trình ký lên Lãnh đạo đơn vị.',
      },
      {
        id: 'ev-tn2-3',
        thoiGian: '17:30 - 12/03/2026',
        nguoiThucHien: {
          hoTen: 'Thượng tá Trần Tuấn Nghĩa',
          chucVu: 'Phó Thủ trưởng Cơ quan / Lãnh đạo phụ trách',
          donVi: 'Lãnh đạo đơn vị',
        },
        hanhDong: 'Yêu cầu chỉnh sửa, bổ sung',
        hanhDongType: 'tra_lai',
        noiDung: 'Xem xét Báo cáo v1.0 và phát hành ý kiến chỉ đạo: "Yêu cầu cán bộ thụ lý phối hợp địa chính phường rút trích lục bản đồ và lập biên bản kiểm tra hiện trường trước khi kết luận đủ điều kiện thụ lý."',
        ketQua: 'Bị trả lại để bổ sung tài liệu thực địa.',
        yKienChiDao: 'Cần bổ sung trích lục bản đồ địa chính và biên bản ghi nhận hiện trường ngày 13/03/2026.',
      },
      {
        id: 'ev-tn2-4',
        thoiGian: '09:00 - 13/03/2026',
        nguoiThucHien: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ chuyên môn thụ lý',
        },
        hanhDong: 'Bổ sung tài liệu & Hoàn thiện v1.2',
        hanhDongType: 'lap_ho_so',
        noiDung: 'Tiếp nhận trích lục bản đồ số 42/TL-ĐC từ UBND phường; lập biên bản kiểm tra thực địa lối đi chung; cập nhật hoàn thiện Báo cáo kiểm tra xác minh v1.2.',
        ketQua: 'Hồ sơ đã bổ sung đầy đủ chứng cứ xác thực (Đạt 4/4 điều kiện thụ lý).',
      },
      {
        id: 'ev-tn2-5',
        thoiGian: '09:10 - 13/03/2026',
        nguoiThucHien: {
          hoTen: 'Nguyễn Minh Anh',
          chucVu: 'Cán bộ chuyên môn thụ lý',
        },
        hanhDong: 'Ký số & Trình lại Lãnh đạo',
        hanhDongType: 'trinh_ky',
        noiDung: 'Ký số cá nhân chuyên dùng Chính phủ vào Báo cáo v1.2, gửi lại hòm thư Lãnh đạo phê duyệt kết luận đủ điều kiện thụ lý.',
        ketQua: 'Đang chờ Thượng tá Trần Tuấn Nghĩa ký số phê duyệt kết quả.',
      },
    ];
  }

  // 3. Nhánh Không thụ lý
  if (node.id === 'tn-kt-khong-thu-ly') {
    return [
      {
        id: 'ev-kt-ktl-1',
        thoiGian: '14:00 - 13/03/2026',
        nguoiThucHien: { hoTen: 'Nguyễn Minh Anh', chucVu: 'Cán bộ thụ lý' },
        hanhDong: 'Xác định căn cứ không thụ lý',
        hanhDongType: 'lap_ho_so',
        noiDung: 'Đối chiếu Khoản 2 Điều 29 Luật Tố cáo 2018: đơn không đủ điều kiện (nặc danh, không có chứng cứ hoặc đã giải quyết đúng thẩm quyền không có tình tiết mới).',
        ketQua: 'Lập phiếu đề xuất không thụ lý giải quyết.',
      },
      {
        id: 'ev-kt-ktl-2',
        thoiGian: '15:30 - 13/03/2026',
        nguoiThucHien: { hoTen: 'Thượng tá Trần Tuấn Nghĩa', chucVu: 'Phó Thủ trưởng Cơ quan' },
        hanhDong: 'Ký số Thông báo không thụ lý',
        hanhDongType: 'phe_duyet',
        noiDung: 'Phê duyệt Thông báo số 03/TB-KTL nêu rõ lý do không thụ lý gửi người gửi đơn.',
        ketQua: 'Ban hành Thông báo không thụ lý.',
      },
      {
        id: 'ev-kt-ktl-3',
        thoiGian: '16:00 - 13/03/2026',
        nguoiThucHien: { hoTen: 'Văn thư cơ quan', chucVu: 'Văn thư Lưu trữ' },
        hanhDong: 'Phát hành & Đóng hồ sơ',
        hanhDongType: 'ban_hanh',
        noiDung: 'Gửi thông báo qua dịch vụ bưu chính bảo đảm; khóa lưu trữ hồ sơ trên hệ thống.',
        ketQua: 'Kết thúc xử lý đơn, lưu hồ sơ vĩnh viễn.',
      },
    ];
  }

  // 4. Nhánh Đề xuất thụ lý (tl-1)
  if (node.id === 'tl-1') {
    return [
      {
        id: 'ev-tl1-1',
        thoiGian: '08:00 - 17/03/2026',
        nguoiThucHien: { hoTen: 'Nguyễn Minh Anh', chucVu: 'Cán bộ thụ lý chính' },
        hanhDong: 'Khởi thảo Tờ trình thụ lý',
        hanhDongType: 'lap_ho_so',
        noiDung: 'Căn cứ kết quả kiểm tra đủ điều kiện, lập Tờ trình số 88/TTr-TLTC đề xuất người đứng đầu cơ quan ban hành Quyết định thụ lý tố cáo.',
        ketQua: 'Bản thảo Tờ trình hoàn tất.',
      },
      {
        id: 'ev-tl1-2',
        thoiGian: '10:00 - 17/03/2026',
        nguoiThucHien: { hoTen: 'Nguyễn Minh Anh', chucVu: 'Cán bộ thụ lý chính' },
        hanhDong: 'Dự thảo Kế hoạch xác minh',
        hanhDongType: 'lap_ho_so',
        noiDung: 'Xây dựng dự thảo Quyết định thụ lý Mẫu số 01 kèm Kế hoạch xác minh chi tiết (thời hạn 30 ngày) và dự kiến nhân sự 03 thành viên Tổ xác minh.',
        ketQua: 'Hoàn thiện bộ hồ sơ đề xuất thụ lý.',
      },
      {
        id: 'ev-tl1-3',
        thoiGian: '11:00 - 17/03/2026',
        nguoiThucHien: { hoTen: 'Trung tá Lê Hồng Hải', chucVu: 'Đội trưởng / Lãnh đạo cấp đội' },
        hanhDong: 'Ký nháy chuyên môn',
        hanhDongType: 'phe_duyet',
        noiDung: 'Rà soát đường lối pháp lý và ký nháy xác nhận hồ sơ trước khi chuyển trình Thủ trưởng cơ quan.',
        ketQua: 'Đã ký nháy chuyên môn, sẵn sàng trình ký.',
      },
    ];
  }

  // 5. Bước tl-3: Lãnh đạo xem xét & phê duyệt
  if (node.id === 'tl-3') {
    return [
      {
        id: 'ev-tl3-1',
        thoiGian: '08:30 - 21/03/2026',
        nguoiThucHien: { hoTen: 'Thượng tá Trần Tuấn Nghĩa', chucVu: 'Phó Thủ trưởng Cơ quan CSĐT' },
        hanhDong: 'Nghiên cứu hồ sơ trình ký',
        hanhDongType: 'tiep_nhan',
        noiDung: 'Đọc báo cáo xác minh, rà soát chứng cứ và kiểm tra tính hợp pháp của dự thảo Quyết định thụ lý Mẫu số 01.',
        ketQua: 'Hồ sơ chuẩn bị chu đáo, đúng căn cứ luật định.',
      },
      {
        id: 'ev-tl3-2',
        thoiGian: '10:00 - 21/03/2026',
        nguoiThucHien: { hoTen: 'Thượng tá Trần Tuấn Nghĩa', chucVu: 'Phó Thủ trưởng Cơ quan CSĐT' },
        hanhDong: 'Ký số phê duyệt Tờ trình & Quyết định',
        hanhDongType: 'phe_duyet',
        noiDung: 'Ký số Ban Cơ yếu Chính phủ phê duyệt Tờ trình số 88/TTr và ký ban hành Quyết định thụ lý giải quyết tố cáo.',
        ketQua: 'Đã phê duyệt thụ lý giải quyết tố cáo.',
        yKienChiDao: 'Đồng ý thụ lý. Giao Tổ xác minh tiến hành đúng trình tự trong 30 ngày.',
      },
    ];
  }

  // 6. Bước tl-5: Ban hành kết quả
  if (node.id === 'tl-5') {
    return [
      {
        id: 'ev-tl5-1',
        thoiGian: '14:00 - 22/03/2026',
        nguoiThucHien: { hoTen: 'Nguyễn Minh Anh', chucVu: 'Cán bộ thụ lý' },
        hanhDong: 'Lập Thông báo gửi các bên',
        hanhDongType: 'lap_ho_so',
        noiDung: 'Soạn thảo Thông báo thụ lý Mẫu số 02/TB-TLTC gửi người tố cáo và thông báo cho người bị tố cáo theo Điều 30 Luật Tố cáo.',
        ketQua: 'Hoàn thành dự thảo Thông báo số 26/TB-TLTC.',
      },
      {
        id: 'ev-tl5-2',
        thoiGian: '15:30 - 22/03/2026',
        nguoiThucHien: { hoTen: 'Thượng tá Trần Tuấn Nghĩa', chucVu: 'Phó Thủ trưởng Cơ quan' },
        hanhDong: 'Ký ban hành Thông báo',
        hanhDongType: 'phe_duyet',
        noiDung: 'Ký duyệt phát hành Thông báo thụ lý cho người dân.',
        ketQua: 'Văn bản được cấp số chính thức.',
      },
      {
        id: 'ev-tl5-3',
        thoiGian: '16:00 - 22/03/2026',
        nguoiThucHien: { hoTen: 'Văn thư cơ quan', chucVu: 'Văn thư Lưu trữ' },
        hanhDong: 'Gửi chuyển phát bảo đảm',
        hanhDongType: 'ban_hanh',
        noiDung: 'Phát hành văn bản qua dịch vụ bưu chính bảo đảm, cập nhật mã bưu gửi VNPost lên hệ thống.',
        ketQua: 'Hoàn tất ban hành kết quả thụ lý cho người dân.',
      },
    ];
  }

  // Fallback tổng quát cho các bước khác
  return [
    {
      id: `ev-${node.id}-1`,
      thoiGian: node.thoiGianBatDau,
      nguoiThucHien: {
        hoTen: node.nguoiHanhDong?.canBoThucHien?.hoTen || 'Nguyễn Minh Anh',
        chucVu: node.nguoiHanhDong?.canBoThucHien?.chucVu || 'Cán bộ thụ lý',
        donVi: node.nguoiHanhDong?.canBoThucHien?.donVi,
      },
      hanhDong: 'Ghi nhận thao tác nghiệp vụ',
      hanhDongType: 'tiep_nhan',
      noiDung: node.noiDungCongViec || node.description || 'Thực hiện các thao tác nghiệp vụ theo quy chuẩn.',
      ketQua: node.ketQuaCuoiCung?.tieuDe || 'Ghi nhận thành công vào hồ sơ điện tử.',
    },
  ];
}

// =========================================================================
// HELPER: ĐIỀU KIỆN CHUYỂN BƯỚC CHO TỪNG NODE (MỤC 2.F)
// =========================================================================
function getTransitionConditionForNode(node: GovexNodeDetail): StepTransitionCondition {
  if (node.id === 'tn-1') {
    return {
      buocTiepTheo: 'Bước 2. Kiểm tra & Xác minh điều kiện thụ lý',
      buocTiepTheoId: 'tn-2',
      dieuKienChuyen: 'Đã vào sổ tiếp nhận điện tử, cấp mã hồ sơ Đ-2026-00125 và bàn giao Giấy biên nhận cho người nộp đơn.',
      canCuPhapLy: 'Điều 23 Luật Tố cáo 2018; Thông tư 05/2021/TT-TTCP',
      daDatDieuKien: true,
    };
  }

  if (node.id === 'tn-2') {
    return {
      buocTiepTheo: 'Đề xuất thụ lý (GĐ 2) hoặc 1 trong 4 nhánh phân loại',
      buocTiepTheoId: 'tl-1',
      dieuKienChuyen: 'Báo cáo kiểm tra xác minh ban đầu được Lãnh đạo có thẩm quyền xem xét, ký số phê duyệt kết luận đủ 4/4 điều kiện thụ lý.',
      canCuPhapLy: 'Khoản 1 Điều 24 & Điều 29 Luật Tố cáo 2018',
      daDatDieuKien: false,
      lyDoChuaChuyen: 'Đang chờ Thượng tá Trần Tuấn Nghĩa ký số phê duyệt Báo cáo kết quả kiểm tra v1.2 sau khi đã bổ sung trích lục bản đồ.',
    };
  }

  if (node.id === 'tn-kt-khong-thu-ly') {
    return {
      buocTiepTheo: 'Kết thúc xử lý đơn (Lưu trữ điện tử)',
      dieuKienChuyen: 'Đã ban hành Thông báo không thụ lý giải quyết tố cáo gửi người gửi đơn.',
      canCuPhapLy: 'Khoản 2 Điều 29 Luật Tố cáo 2018',
      daDatDieuKien: true,
    };
  }

  if (node.id === 'tn-kt-yeu-cau-bo-sung') {
    return {
      buocTiepTheo: 'Chờ công dân nộp bổ sung tài liệu (Hạn 10 ngày)',
      dieuKienChuyen: 'Công dân nộp bổ sung đủ tài liệu trong thời hạn 10 ngày làm việc để tiếp tục quy trình thẩm tra.',
      canCuPhapLy: 'Điều 24 Luật Tố cáo 2018',
      daDatDieuKien: false,
      lyDoChuaChuyen: 'Đang trong thời hạn chờ người tố cáo bổ sung tài liệu, chứng cứ.',
    };
  }

  if (node.id === 'tl-1') {
    return {
      buocTiepTheo: 'Bước 2 (GĐ 2). Trình Lãnh đạo',
      buocTiepTheoId: 'tl-2',
      dieuKienChuyen: 'Hoàn thiện Tờ trình đề xuất thụ lý, dự thảo Quyết định Mẫu số 01, Kế hoạch xác minh và được Đội trưởng ký nháy chuyên môn.',
      canCuPhapLy: 'Điều 29 Luật Tố cáo 2018',
      daDatDieuKien: false,
      lyDoChuaChuyen: 'Chờ Giai đoạn 1 hoàn tất phê duyệt điều kiện thụ lý.',
    };
  }

  if (node.id === 'tl-2') {
    return {
      buocTiepTheo: 'Bước 3 (GĐ 2). Lãnh đạo xem xét & phê duyệt',
      buocTiepTheoId: 'tl-3',
      dieuKienChuyen: 'Hồ sơ đã được gửi thành công vào mục "Văn bản chờ ký" của Lãnh đạo trên phân hệ Trình ký điện tử.',
      canCuPhapLy: 'Quy chế văn thư điện tử & Quản lý trình ký',
      daDatDieuKien: false,
      lyDoChuaChuyen: 'Chưa khởi tạo lượt trình ký do bước trước chưa hoàn thành.',
    };
  }

  if (node.id === 'tl-3') {
    return {
      buocTiepTheo: 'Bước 4 (GĐ 2). Tự động cấp số thụ lý',
      buocTiepTheoId: 'tl-4',
      dieuKienChuyen: 'Thủ trưởng / Phó Thủ trưởng Cơ quan ký số chứng thư CA phê duyệt Tờ trình và ký ban hành Quyết định thụ lý.',
      canCuPhapLy: 'Điều 29, 30 Luật Tố cáo 2018',
      daDatDieuKien: false,
      lyDoChuaChuyen: 'Cần Lãnh đạo đơn vị hoàn tất ký số điện tử trên văn bản.',
    };
  }

  if (node.id === 'tl-4') {
    return {
      buocTiepTheo: 'Bước 5 (GĐ 2). Ban hành Quyết định & Thông báo thụ lý',
      buocTiepTheoId: 'tl-5',
      dieuKienChuyen: 'Hệ thống tự động phát sinh số hiệu thụ lý, đóng dấu thời gian (timestamp) vào Sổ theo dõi điện tử.',
      canCuPhapLy: 'Quy chuẩn CSDL quốc gia về tố cáo',
      daDatDieuKien: false,
      lyDoChuaChuyen: 'Hệ thống tự động kích hoạt ngay sau khi có chữ ký số của Lãnh đạo.',
    };
  }

  if (node.id === 'tl-5') {
    return {
      buocTiepTheo: 'Bước 6 (GĐ 2). Hoàn tất đóng hồ sơ xử lý đơn',
      buocTiepTheoId: 'tl-6',
      dieuKienChuyen: 'Đã phát hành Thông báo thụ lý cho người tố cáo và người bị tố cáo qua bưu chính bảo đảm (có mã vận đơn).',
      canCuPhapLy: 'Điều 30 Luật Tố cáo 2018',
      daDatDieuKien: false,
      lyDoChuaChuyen: 'Cần hoàn tất phát hành văn bản và cập nhật mã bưu gửi VNPost.',
    };
  }

  return {
    buocTiepTheo: 'Bước kế tiếp trong quy trình',
    dieuKienChuyen: 'Hoàn tất toàn bộ các thao tác nghiệp vụ và văn bản được phê duyệt hợp lệ.',
    canCuPhapLy: node.legalBasis || 'Luật Tố cáo 2018',
    daDatDieuKien: node.status === 'completed',
    lyDoChuaChuyen: node.status !== 'completed' ? 'Đang thực hiện các thủ tục theo quy định.' : undefined,
  };
}

// =========================================================================
// COMPONENT CHÍNH: GOVEX STEP DETAIL PANEL
// =========================================================================
export default function GovexStepDetailPanel({
  selectedNode,
  donCode = 'Đ-2026-00125',
  donTitle = 'Tố giác sai phạm trật tự xây dựng & lấn chiếm lối đi chung tại ngõ 128 Đội Cấn',
  nguoiNop = 'Đại diện cư dân TDP số 3',
  onClose,
  onSelectStep,
  onOpenDocModal,
  onViewDocument,
  onOpenQuanLyTrinhKy,
  showToast,
}: GovexStepDetailPanelProps) {
  const [selectedEventModal, setSelectedEventModal] = useState<StepTimelineEvent | null>(null);

  // Tính toán các dữ liệu nghiệp vụ
  const stepStatus = getStepExecutionStatus(selectedNode);
  const overallCaseStatus = getOverallCaseStatus(selectedNode.id);
  const timelineEvents = getTimelineEventsForNode(selectedNode);
  const transitionCondition = getTransitionConditionForNode(selectedNode);

  // Danh sách tài liệu của bước
  const hasDocument = Boolean(selectedNode.taiLieuVanBan || selectedNode.ketQuaCuoiCung?.vanBanDauRa);
  const doc = selectedNode.taiLieuVanBan;

  return (
    <>
      <aside className="absolute top-0 right-0 bottom-0 w-[450px] lg:w-[480px] xl:w-[500px] border-l border-slate-200 bg-white shadow-2xl z-30 flex flex-col overflow-hidden animate-drawer-slide-in select-none">
        {/* ========================================================================= */}
        {/* PHẦN A. TIÊU ĐỀ POPUP / PANEL                                             */}
        {/* ========================================================================= */}
        <div className="p-4 bg-white border-b border-slate-200/90 shrink-0 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center border border-blue-200/70 shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[19px]">account_tree</span>
              </div>

              <div className="min-w-0 flex-1">
                {/* Tên bước đang được chọn */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2" title={selectedNode.name}>
                  {selectedNode.name}
                </h3>

                {/* Thông tin phụ: Mã hồ sơ • Tên đơn • Người nộp */}
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium flex-wrap">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                    {donCode}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600 truncate max-w-[150px]" title={donTitle}>
                    {donTitle}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[120px]" title={nguoiNop}>
                    Nộp: <strong>{nguoiNop}</strong>
                  </span>
                </div>

                {/* Badge trạng thái bước (5 trạng thái chuẩn) */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all ${stepStatus.badgeClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${stepStatus.dotColor}`}></span>
                    <span>{stepStatus.label}</span>
                  </span>

                  {selectedNode.code && (
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      {selectedNode.code}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Nút thao tác Header: Sao chép & Đóng */}
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`${selectedNode.name} - ${donCode}`);
                  showToast(`✓ Đã sao chép: ${selectedNode.name}`);
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Sao chép tên bước"
              >
                <span className="material-symbols-outlined text-[17px]">content_copy</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng bảng chi tiết"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BODY PANEL (CUỘN ĐỘC LẬP - OVERFLOW-Y-AUTO)                               */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 font-body-md text-slate-800">

          {/* ======================================================================= */}
          {/* PHẦN B. KẾT QUẢ XỬ LÝ (ĐẶT Ở VỊ TRÍ DỄ NHÌN NGAY DƯỚI TIÊU ĐỀ)          */}
          {/* ======================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
            {/* 1. Trạng thái kết quả chung của toàn bộ đơn (Mục 4) */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  KẾT QUẢ XỬ LÝ CHUNG CỦA ĐƠN:
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${overallCaseStatus.badgeClass}`}>
                    <span className="material-symbols-outlined text-[13px]">{overallCaseStatus.icon}</span>
                    <span>{overallCaseStatus.label}</span>
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 text-right max-w-[160px] line-clamp-2">
                {overallCaseStatus.subLabel}
              </span>
            </div>

            {/* 2. Kết quả xử lý riêng biệt của bước đang xem */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#004ac6]">fact_check</span>
                  <span>KẾT QUẢ XỬ LÝ BƯỚC NÀY</span>
                </span>
                {selectedNode.status === 'completed' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Đã có kết quả
                  </span>
                )}
              </div>

              {/* Nếu bước đã hoàn thành */}
              {selectedNode.status === 'completed' ? (
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-200/90 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                      task_alt
                    </span>
                    <div>
                      <h4 className="font-bold text-emerald-950 text-xs leading-snug">
                        {selectedNode.ketQuaCuoiCung?.tieuDe || 'Đã hoàn thành các nội dung theo quy định'}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {selectedNode.ketQuaCuoiCung?.chiTietKetQua || selectedNode.noiDungCongViec}
                      </p>
                    </div>
                  </div>

                  {selectedNode.ketQuaCuoiCung?.vanBanDauRa && (
                    <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-500 font-medium">Sản phẩm đầu ra:</span>
                      <strong className="text-emerald-900 truncate max-w-[240px]">
                        {selectedNode.ketQuaCuoiCung.vanBanDauRa}
                      </strong>
                    </div>
                  )}
                </div>
              ) : selectedNode.status === 'active' ? (
                // Nếu bước đang thực hiện / chờ duyệt: hiển thị trạng thái hiện tại (không giả định kết quả cuối cùng)
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/60 to-white border border-blue-200/90 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#004ac6] text-[18px] shrink-0 mt-0.5 animate-spin">
                      sync
                    </span>
                    <div>
                      <h4 className="font-bold text-blue-950 text-xs leading-snug">
                        {stepStatus.status === 'bi_tra_lai'
                          ? 'Bị trả lại — Đang hoàn thiện lại hồ sơ theo chỉ đạo'
                          : stepStatus.status === 'cho_phe_duyet'
                            ? 'Đang chờ Lãnh đạo ký số phê duyệt'
                            : 'Đang trong quá trình thực hiện nghiệp vụ'}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {selectedNode.noiDungCongViec}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white/90 border border-blue-100 text-[10.5px] text-blue-900 flex items-center justify-between">
                    <span>Trạng thái ghi nhận:</span>
                    <strong className="font-semibold text-blue-800">
                      {selectedNode.ketQuaCuoiCung?.trangThaiHoSo || 'Đang xử lý, chưa có kết luận cuối cùng'}
                    </strong>
                  </div>
                </div>
              ) : (
                // Nếu bước chưa thực hiện
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">hourglass_empty</span>
                    <span>Chưa thực hiện bước này</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {selectedNode.description || 'Bước sẽ được kích hoạt sau khi bước trước hoàn thành và đáp ứng đủ điều kiện chuyển bước.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ======================================================================= */}
          {/* PHẦN C. NGƯỜI THỰC HIỆN                                                 */}
          {/* ======================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">group</span>
                <span>NGƯỜI THỰC HIỆN &amp; THỜI GIAN</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedNode.roleName}
              </span>
            </div>

            {/* Danh sách người tham gia (Cán bộ + Lãnh đạo + Phối hợp) */}
            <div className="space-y-2">
              {/* 1. Cán bộ thực hiện chính */}
              {selectedNode.nguoiHanhDong?.canBoThucHien && (
                <div className="p-2.5 bg-gradient-to-r from-blue-50/50 to-white rounded-xl border border-blue-100 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {selectedNode.nguoiHanhDong.canBoThucHien.hoTen.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedNode.nguoiHanhDong.canBoThucHien.hoTen}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        Cán bộ thụ lý
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 truncate">
                      {selectedNode.nguoiHanhDong.canBoThucHien.chucVu} • {selectedNode.nguoiHanhDong.canBoThucHien.donVi}
                    </div>
                    {selectedNode.nguoiHanhDong.canBoThucHien.hanhDongCuThe && (
                      <p className="text-[10.5px] text-slate-700 bg-white/90 p-1.5 rounded-lg border border-blue-50 mt-1 leading-snug">
                        <strong className="text-slate-800">Thao tác: </strong>
                        {selectedNode.nguoiHanhDong.canBoThucHien.hanhDongCuThe}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Lãnh đạo phê duyệt (nếu có) */}
              {selectedNode.nguoiHanhDong?.lanhDaoKyDuyet && (
                <div className="p-2.5 bg-gradient-to-r from-amber-50/50 to-white rounded-xl border border-amber-100 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Lãnh đạo phê duyệt
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 truncate">
                      {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.chucVu} • {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.donVi}
                    </div>
                    {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hanhDongCuThe && (
                      <p className="text-[10.5px] text-slate-700 bg-white/90 p-1.5 rounded-lg border border-amber-50 mt-1 leading-snug">
                        <strong className="text-slate-800">Chỉ đạo: </strong>
                        {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hanhDongCuThe}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Đơn vị phối hợp / Văn thư (nếu có) */}
              {selectedNode.nguoiHanhDong?.donViPhoiHop && (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] text-slate-600 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-slate-500 shrink-0">handshake</span>
                  <span><strong>Đơn vị phối hợp: </strong>{selectedNode.nguoiHanhDong.donViPhoiHop}</span>
                </div>
              )}
            </div>

            {/* Khung thời gian thực hiện & Thời hạn thực tế */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Thời điểm bắt đầu:</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedNode.thoiGianBatDau}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9.5px] text-slate-400 block uppercase font-bold">
                  {selectedNode.status === 'completed' ? 'Thời điểm hoàn thành:' : 'Hạn hoàn thành:'}
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedNode.thoiGianHoanThanh}</span>
              </div>
            </div>

            {selectedNode.ketQuaCuoiCung?.thoiHanThucHien && (
              <div className="text-[10.5px] text-slate-500 bg-slate-50/60 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                <span>Thời hạn quy định luật định:</span>
                <strong className="text-slate-700 font-semibold">{selectedNode.ketQuaCuoiCung.thoiHanThucHien}</strong>
              </div>
            )}
          </section>

          {/* ======================================================================= */}
          {/* PHẦN D. NỘI DUNG VÀ THAO TÁC XỬ LÝ (TIMELINE SỰ KIỆN)                   */}
          {/* ======================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">history</span>
                <span>LỊCH SỬ THAO TÁC ({timelineEvents.length} sự kiện)</span>
              </span>
              <span className="text-[10px] text-slate-400">Theo thời gian thực</span>
            </div>

            {/* Danh sách Timeline dọc */}
            <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventModal(ev)}
                  className="relative group/ev cursor-pointer transition-all"
                >
                  {/* Dot icon trên đường kẻ timeline */}
                  <div
                    className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                      ev.hanhDongType === 'phe_duyet'
                        ? 'bg-emerald-500'
                        : ev.hanhDongType === 'tra_lai'
                          ? 'bg-rose-500'
                          : ev.hanhDongType === 'trinh_ky'
                            ? 'bg-amber-500'
                            : 'bg-[#004ac6]'
                    }`}
                  ></div>

                  {/* Nội dung sự kiện */}
                  <div className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-200 transition-all space-y-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap text-[10.5px]">
                      <span className="font-mono text-slate-500">{ev.thoiGian}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                          ev.hanhDongType === 'phe_duyet'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ev.hanhDongType === 'tra_lai'
                              ? 'bg-rose-100 text-rose-800'
                              : ev.hanhDongType === 'trinh_ky'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ev.hanhDong}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-800">
                      {ev.nguoiThucHien.hoTen}
                      <span className="text-[10px] font-normal text-slate-500 ml-1">
                        ({ev.nguoiThucHien.chucVu})
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {ev.noiDung}
                    </p>

                    {ev.yKienChiDao && (
                      <div className="text-[10.5px] italic text-rose-700 bg-rose-50/80 p-1.5 rounded-md border border-rose-100">
                        &ldquo;{ev.yKienChiDao}&rdquo;
                      </div>
                    )}

                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Kết quả:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">{ev.ketQua}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lịch sử trình ký nếu có */}
            {selectedNode.lichSuTrinhKy && selectedNode.lichSuTrinhKy.length > 0 && onOpenQuanLyTrinhKy && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10.5px] text-slate-500">
                  Có {selectedNode.lichSuTrinhKy.length} lượt trình ký trong phân hệ
                </span>
                <button
                  type="button"
                  onClick={() => onOpenQuanLyTrinhKy(selectedNode.lichSuTrinhKy?.[0]?.id)}
                  className="text-[#004ac6] hover:text-blue-800 text-[11px] font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Mở Quản lý trình ký</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            )}
          </section>

          {/* ======================================================================= */}
          {/* PHẦN E. TÀI LIỆU VÀ SẢN PHẨM ĐẦU RA (CHỈ HIỂN THỊ KHI CÓ TÀI LIỆU)       */}
          {/* ======================================================================= */}
          {hasDocument && (
            <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-rose-600">description</span>
                  <span>TÀI LIỆU &amp; SẢN PHẨM ĐẦU RA</span>
                </span>
                {doc && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {doc.trangThaiText || 'Văn bản nghiệp vụ'}
                  </span>
                )}
              </div>

              {doc ? (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-rose-500 text-2xl shrink-0 mt-0.5">
                      picture_as_pdf
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs leading-snug">
                        {doc.tenVanBan}
                      </h4>
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-1 flex-wrap">
                        <span className="font-mono font-bold text-slate-700">
                          {doc.soKyHieu || 'Chưa cấp số chính thức'}
                        </span>
                        <span>•</span>
                        <span>{doc.loaiVanBan}</span>
                        <span>•</span>
                        <span className="font-semibold text-blue-700">{doc.phienBan}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin người tạo & thời gian */}
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1.5 border-t border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block">Người lập:</span>
                      <strong className="text-slate-800">{doc.nguoiTao}</strong>
                      <span className="text-[10px] text-slate-500 block truncate">{doc.chucVuNguoiTao}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Thời gian tạo:</span>
                      <strong className="text-slate-800">{doc.thoiGianTao}</strong>
                    </div>
                  </div>

                  {/* Tệp đính kèm nếu có */}
                  {doc.fileDinhKem && (
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-slate-400 text-[15px]">attachment</span>
                        <span className="font-medium text-slate-700 truncate">{doc.fileDinhKem.tenFile}</span>
                        <span className="text-slate-400 text-[10px] shrink-0">({doc.fileDinhKem.dungLuong})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`✓ Đang tải: ${doc.fileDinhKem?.tenFile}`)}
                        className="text-[#004ac6] hover:text-blue-800 p-1 hover:bg-blue-50 rounded cursor-pointer"
                        title="Tải tệp đính kèm"
                      >
                        <span className="material-symbols-outlined text-[15px]">download</span>
                      </button>
                    </div>
                  )}

                  {/* Nút thao tác tài liệu */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenDocModal(doc)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>Xem chi tiết văn bản</span>
                    </button>

                    {onViewDocument && (
                      <button
                        type="button"
                        onClick={() => {
                          onViewDocument({
                            tenVanBan: doc.tenVanBan,
                            soHieu: doc.soKyHieu || 'Chưa cấp số',
                            loai: doc.loaiVanBan,
                            trichYeu: doc.noiDungTomTat,
                            noiDungChiTiet: doc.noiDungChiTiet,
                          });
                          showToast(`✓ Đang mở văn bản trong tab Hồ sơ: ${doc.tenVanBan}`);
                        }}
                        className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        title="Mở trong tab Hồ sơ & Văn bản"
                      >
                        <span className="material-symbols-outlined text-[15px]">folder_open</span>
                        <span>Mở tab Hồ sơ</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Nếu chưa có file DocumentInfo nhưng có văn bản đầu ra
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-[18px]">article</span>
                    <div>
                      <div className="font-bold text-slate-800">{selectedNode.ketQuaCuoiCung.vanBanDauRa}</div>
                      <div className="text-[10px] text-slate-500">Sản phẩm đầu ra quy chuẩn</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Mẫu chuẩn
                  </span>
                </div>
              )}
            </section>
          )}

          {/* ======================================================================= */}
          {/* PHẦN F. ĐIỀU KIỆN CHUYỂN BƯỚC                                           */}
          {/* ======================================================================= */}
          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">alt_route</span>
                <span>ĐIỀU KIỆN CHUYỂN BƯỚC</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  transitionCondition.daDatDieuKien
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {transitionCondition.daDatDieuKien ? '✓ Đã đạt điều kiện' : '⏳ Chưa đủ điều kiện'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Bước tiếp theo:
                </span>
                <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <span>{transitionCondition.buocTiepTheo}</span>
                  {transitionCondition.buocTiepTheoId && onSelectStep && (
                    <button
                      type="button"
                      onClick={() => onSelectStep(transitionCondition.buocTiepTheoId!)}
                      className="text-[#004ac6] hover:underline text-[10.5px] font-bold ml-1 cursor-pointer"
                    >
                      (Xem bước này)
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Điều kiện chuyển:
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                  {transitionCondition.dieuKienChuyen}
                </p>
              </div>

              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10.5px]">
                <span className="text-slate-400">Căn cứ pháp lý:</span>
                <strong className="text-slate-700 italic">{transitionCondition.canCuPhapLy}</strong>
              </div>

              {/* Lý do chưa thể chuyển bước nếu còn điều kiện chưa đáp ứng */}
              {!transitionCondition.daDatDieuKien && transitionCondition.lyDoChuaChuyen && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/80 text-[10.5px] text-amber-900 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[15px] shrink-0 mt-0.5">warning</span>
                  <div>
                    <strong>Lý do chưa thể chuyển bước: </strong>
                    <span>{transitionCondition.lyDoChuaChuyen}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MODAL CHI TIẾT SỰ KIỆN TIMELINE KHI NHẤP VÀO SỰ KIỆN                     */}
      {/* ========================================================================= */}
      {selectedEventModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedEventModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-xl">event_note</span>
                <h4 className="font-bold text-slate-900 text-sm">Chi tiết sự kiện thao tác</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Thời gian:</span>
                <strong className="font-mono text-slate-800">{selectedEventModal.thoiGian}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Người thực hiện:</span>
                <strong className="text-slate-800">{selectedEventModal.nguoiThucHien.hoTen}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Chức vụ:</span>
                <span className="text-slate-600">{selectedEventModal.nguoiThucHien.chucVu}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hành động:</span>
                <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {selectedEventModal.hanhDong}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Nội dung thao tác:
                </span>
                <p className="text-[11.5px] text-slate-700 leading-relaxed">
                  {selectedEventModal.noiDung}
                </p>
              </div>

              {selectedEventModal.yKienChiDao && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                    Ý kiến chỉ đạo / Yêu cầu:
                  </span>
                  <p className="text-[11.5px] italic text-rose-900 leading-relaxed">
                    &ldquo;{selectedEventModal.yKienChiDao}&rdquo;
                  </p>
                </div>
              )}

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <span>Kết quả ghi nhận:</span>
                <strong className="font-semibold">{selectedEventModal.ketQua}</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
