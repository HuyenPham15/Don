import { DEPARTMENTS, OFFICERS, Department, Officer } from '../constants/departments';
import { CurrentUserAccount } from '../types/signing';

// ============================================================================
// 1. KIỂU DỮ LIỆU NGHIỆP VỤ PHÂN CÔNG & XÁC MINH ĐƠN (GOVEX)
// ============================================================================

/** Trạng thái công việc được giao (Độc lập với trạng thái hồ sơ đơn - Mục 5) */
export type AssignmentTaskStatus =
  | 'cho_xu_ly'                // Chờ xử lý
  | 'dang_xu_ly'               // Đang xử lý
  | 'cho_hoan_thien_bao_cao'   // Chờ hoàn thiện báo cáo
  | 'cho_phe_duyet'            // Chờ phê duyệt
  | 'hoan_thanh';              // Hoàn thành

export const ASSIGNMENT_TASK_STATUS_CONFIG: Record<
  AssignmentTaskStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  cho_xu_ly: {
    label: 'Chờ xử lý',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  dang_xu_ly: {
    label: 'Đang xử lý',
    badgeClass: 'bg-blue-50 text-[#004ac6] border-blue-200',
    dotClass: 'bg-[#004ac6]',
  },
  cho_hoan_thien_bao_cao: {
    label: 'Chờ hoàn thiện báo cáo',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-600',
  },
  cho_phe_duyet: {
    label: 'Chờ phê duyệt',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dotClass: 'bg-indigo-600',
  },
  hoan_thanh: {
    label: 'Hoàn thành',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600',
  },
};

/** Trạng thái từng nội dung xác minh (Mục 4.C) */
export type VerificationItemStatus =
  | 'chua_thuc_hien'      // Chưa thực hiện
  | 'dang_thuc_hien'      // Đang thực hiện
  | 'da_hoan_thanh'       // Đã hoàn thành
  | 'chua_the_thuc_hien'; // Chưa thể thực hiện

export const VERIFICATION_ITEM_STATUS_CONFIG: Record<
  VerificationItemStatus,
  { label: string; badgeClass: string; icon: string }
> = {
  chua_thuc_hien: {
    label: 'Chưa thực hiện',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: 'radio_button_unchecked',
  },
  dang_thuc_hien: {
    label: 'Đang thực hiện',
    badgeClass: 'bg-blue-50 text-[#004ac6] border-blue-200',
    icon: 'pending',
  },
  da_hoan_thanh: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: 'check_circle',
  },
  chua_the_thuc_hien: {
    label: 'Chưa thể thực hiện',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: 'error',
  },
};

export interface VerificationAttachment {
  id: string;
  name: string;
  size: string;
  docType: 'bien_ban' | 'hinh_anh' | 'tai_lieu' | 'video' | 'khac';
  uploadedAt: string;
  uploadedBy: string;
}

export interface VerificationResultVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
  updatedByRole: string;
  status: VerificationItemStatus;
  resultText: string;
  unverifiedContentAndReason?: string;
  attachmentsCount: number;
  isDraft?: boolean;
}

export interface AssignedVerificationTask {
  id: string;
  order: number;
  title: string;
  description: string;
  aiSuggested: boolean;
  status: VerificationItemStatus;
  resultText: string;
  unverifiedContentAndReason: string;
  attachments: VerificationAttachment[];
  isDraft?: boolean;
  updatedAt?: string;
  updatedBy?: string;
  versionHistory: VerificationResultVersion[];
}

export interface CoordiOfficerAssignment {
  officerId: string;
  officerName: string;
  officerRole: string;
  departmentId: string;
  departmentName: string;
  assignedRoleInTask: string; // Vai trò cụ thể trong vụ việc (VD: Cán bộ điều tra phối hợp, Chuyên viên giám định...)
}

export interface AssignmentHistoryEntry {
  id: string;
  timestamp: string;
  actionType: 'phan_cong_moi' | 'thay_doi_can_bo' | 'cap_nhat_ket_qua' | 'luu_nhap' | 'tao_bao_cao' | 'trinh_lanh_dao';
  title: string;
  actorName: string;
  actorRole: string;
  leadOfficerName: string;
  leadOfficerRole: string;
  previousLeadOfficerName?: string;
  changeReason?: string;
  coordinatingOfficers: string[];
  deadline: string;
  summary: string;
}

export interface BaoCaoDeXuatTongHopDraft {
  id: string;
  soKyHieu: string;
  ngayLap: string;
  nguoiLap: string;
  donViLap: string;
  noiDungDonBanDau: string;
  noiDungDuocPhanCong: string;
  quaTrinhXacMinh: string;
  ketQuaTungNoiDung: string;
  taiLieuDaThuThap: string;
  noiDungChuaLamRo: string;
  nhanDinhVaKienNghi: string;
  status: 'nhap' | 'da_hoan_thien' | 'da_trinh_lanh_dao';
  updatedAt: string;
}

export interface PhanCongRecord {
  id: string;
  donCode: string;
  luotNhanId?: string;
  loaiDon: string;
  nguoiGuiDon: string;
  ngayTiepNhan: string;
  noiDungTomTat: string;
  donViTiepNhan: string;
  taiLieuDinhKem: { name: string; size: string }[];
  // Thông tin người bị tố giác / bị tố cáo để hiển thị tại màn Cán bộ điều tra
  nguoiBiToGiac?: string;

  // B. Thông tin phân công
  donViXuLyId: string;
  donViXuLyName: string;
  canBoPhuTrachId: string;
  canBoPhuTrachName: string;
  canBoPhuTrachChucVu: string;
  vaiTroCanBoPhuTrach: string;
  canBoPhoiHop: CoordiOfficerAssignment[];
  nguoiPhanCongName: string;
  nguoiPhanCongChucVu: string;
  ngayPhanCong: string;
  thoiHanBaoCao: string;
  quyDinhThoiHanText: string;
  mucDoUuTien: 'thuong' | 'khan' | 'hoa_toc';
  chiDaoRieng: string;

  // C. Danh sách nội dung xác minh được giao
  verificationTasks: AssignedVerificationTask[];

  // Trạng thái công việc (Độc lập với trạng thái đơn)
  taskStatus: AssignmentTaskStatus;
  isDraft: boolean;
  acceptedByInvestigatorAt?: string;

  // D. Báo cáo đề xuất tổng hợp
  baoCaoDeXuatDraft?: BaoCaoDeXuatTongHopDraft;

  // 6. Lịch sử phân công & cập nhật kết quả
  history: AssignmentHistoryEntry[];
}

// ============================================================================
// 2. CẤU HÌNH NỘI DUNG GỢI Ý AI & THỜI HẠN THEO LOẠI ĐƠN (MỤC 3.C & MỤC 7)
// ============================================================================

export interface SuggestedVerificationTemplate {
  id: string;
  title: string;
  description: string;
  defaultSelected: boolean;
}

export function isToGiacTinBaoLoaiDon(loaiDon?: string, title?: string): boolean {
  const text = `${loaiDon || ''} ${title || ''}`.toLowerCase();
  return (
    text.includes('tố giác') ||
    text.includes('tin báo') ||
    text.includes('tội phạm') ||
    text.includes('khởi tố') ||
    text.includes('lừa đảo') ||
    text.includes('chiếm đoạt')
  );
}

/**
 * Lấy danh sách nội dung xác minh do AI đề xuất theo đúng loại đơn (Mục 3.C):
 * - Đối với đơn tố giác, tin báo về tội phạm: trả về đúng 8 nội dung xác minh chuẩn.
 * - Đối với các loại đơn khác (tố cáo hành chính, khiếu nại, kiến nghị phản ánh): trả về bộ nội dung theo nghiệp vụ tương ứng.
 */
export function getAiSuggestedVerificationTemplates(
  loaiDon?: string,
  donTitle?: string,
  nguoiGui?: string
): {
  loaiNghiepVuLabel: string;
  canCuPhapLyThoiHan: string;
  soNgayQuyDinh: number;
  templates: SuggestedVerificationTemplate[];
} {
  if (isToGiacTinBaoLoaiDon(loaiDon, donTitle)) {
    return {
      loaiNghiepVuLabel: 'Đơn tố giác, tin báo về tội phạm (Theo Điều 147 BLTTHS & TTLT 01/2017)',
      canCuPhapLyThoiHan: 'Điều 147 Bộ luật Tố tụng hình sự 2015: Thời hạn giải quyết tố giác, tin báo về tội phạm là 20 ngày (phức tạp không quá 02 tháng).',
      soNgayQuyDinh: 20,
      templates: [
        {
          id: 'tg-1',
          title: '1. Xác minh người tố giác và nguồn tin',
          description: `Xác minh nhân thân, CCCD, địa chỉ cư trú của người tố giác (${nguoiGui || 'người gửi đơn'}) và tính xác thực của nguồn tin ban đầu.`,
          defaultSelected: true,
        },
        {
          id: 'tg-2',
          title: '2. Xác minh thời gian, địa điểm xảy ra sự việc',
          description: 'Kiểm tra, đối chiếu mốc thời gian và địa điểm cụ thể nơi xảy ra hành vi có dấu hiệu tội phạm nêu trong đơn.',
          defaultSelected: true,
        },
        {
          id: 'tg-3',
          title: '3. Làm rõ diễn biến và nội dung sự việc',
          description: 'Thu thập lời khai, tài liệu để dựng lại toàn bộ diễn biến hành vi, phương thức, thủ đoạn thực hiện sự việc.',
          defaultSelected: true,
        },
        {
          id: 'tg-4',
          title: '4. Xác minh người bị tố giác và những người liên quan',
          description: 'Xác minh lý lịch, chức vụ, tư cách pháp nhân của người bị tố giác và các cá nhân, tổ chức có liên quan trực tiếp.',
          defaultSelected: true,
        },
        {
          id: 'tg-5',
          title: '5. Xác minh người bị hại và hậu quả xảy ra',
          description: 'Làm rõ thông tin người bị hại, thống kê sơ bộ thiệt hại về tài sản, thể chất hoặc hậu quả phi vật chất đã xảy ra.',
          defaultSelected: true,
        },
        {
          id: 'tg-6',
          title: '6. Kiểm tra tài liệu, hình ảnh, video và các tài liệu kèm theo',
          description: 'Kiểm tra, đánh giá sơ bộ tính nguyên vẹn và nguồn gốc các chứng từ, hình ảnh, dữ liệu điện tử đính kèm đơn.',
          defaultSelected: true,
        },
        {
          id: 'tg-7',
          title: '7. Xác minh người làm chứng và các nguồn thông tin khác',
          description: 'Rà soát, lập danh sách và lấy lời khai người biết việc, người làm chứng hoặc dữ liệu trích xuất từ cơ quan quản lý.',
          defaultSelected: true,
        },
        {
          id: 'tg-8',
          title: '8. Kiểm tra tình trạng tiếp nhận, xử lý trước đó',
          description: 'Tra cứu CSDL nội ngành và liên ngành để xác định vụ việc đã từng được cơ quan tiến hành tố tụng nào thụ lý, giải quyết hay chưa.',
          defaultSelected: true,
        },
      ],
    };
  }

  const lower = (loaiDon || '').toLowerCase();
  if (lower.includes('lượt nhận') || lower.includes('luot nhan') || lower.startsWith('ln-') || lower.startsWith('lr-')) {
    return {
      loaiNghiepVuLabel: 'Lượt nhận hồ sơ tiếp nhận ban đầu (Kiểm tra, phân loại & đề xuất xử lý)',
      canCuPhapLyThoiHan: 'Quy chế tiếp nhận & xử lý hồ sơ GOVEX: Thời hạn kiểm tra, phân loại và xử lý lượt nhận là 03 - 05 ngày làm việc.',
      soNgayQuyDinh: 5,
      templates: [
        {
          id: 'ln-1',
          title: '1. Kiểm tra kết quả số hóa, OCR và tính đầy đủ của tài liệu trong lượt nhận',
          description: `Rà soát toàn bộ tệp đính kèm, đối chiếu thông tin người nộp (${nguoiGui || 'công dân/tổ chức'}) và chất lượng bản quét.`,
          defaultSelected: true,
        },
        {
          id: 'ln-2',
          title: '2. Phân loại nghiệp vụ (Xác định là Đơn hay Tài liệu không phải đơn / Nhiều đơn)',
          description: 'Xác định yếu tố khiếu nại, tố cáo, kiến nghị, phản ánh hoặc tài liệu nghiệp vụ để tách/ghép đúng quy định.',
          defaultSelected: true,
        },
        {
          id: 'ln-3',
          title: '3. Tra cứu trùng lặp và mối liên hệ với các đơn/vụ việc đang thụ lý trên hệ thống',
          description: 'Kiểm tra lịch sử gửi đơn của công dân và đối chiếu với các hồ sơ đơn/vụ việc có liên quan.',
          defaultSelected: true,
        },
        {
          id: 'ln-4',
          title: '4. Xác nhận tiếp nhận chính thức hoặc đề xuất chuyển/ghép hồ sơ',
          description: 'Hoàn tất phân loại lượt nhận, khởi tạo hồ sơ đơn chính thức hoặc ghép vào hồ sơ đơn đang xử lý.',
          defaultSelected: true,
        },
      ],
    };
  }
  if (lower.includes('tố cáo')) {
    return {
      loaiNghiepVuLabel: 'Đơn tố cáo hành chính / cán bộ công vụ (Theo Luật Tố cáo 2018)',
      canCuPhapLyThoiHan: 'Điều 30 Luật Tố cáo 2018: Thời hạn giải quyết tố cáo là không quá 30 ngày kể từ ngày thụ lý.',
      soNgayQuyDinh: 30,
      templates: [
        {
          id: 'tc-1',
          title: '1. Làm việc trực tiếp với người tố cáo và kiểm tra thông tin định danh',
          description: `Mời người tố cáo (${nguoiGui || 'người gửi đơn'}) làm việc để xác nhận nội dung tố cáo và cung cấp bản chính tài liệu, chứng cứ.`,
          defaultSelected: true,
        },
        {
          id: 'tc-2',
          title: '2. Xác minh hành vi vi phạm bị tố cáo và hồ sơ công vụ liên quan',
          description: 'Thu thập hồ sơ, quy trình giải quyết công việc và kiểm tra thực tế đối với hành vi bị tố cáo.',
          defaultSelected: true,
        },
        {
          id: 'tc-3',
          title: '3. Yêu cầu người bị tố cáo giải trình bằng văn bản',
          description: 'Tổ chức làm việc và yêu cầu cá nhân/tổ chức bị tố cáo giải trình kèm hồ sơ chứng minh.',
          defaultSelected: true,
        },
        {
          id: 'tc-4',
          title: '4. Xác minh thiệt hại, hậu quả và trách nhiệm của tổ chức/cá nhân liên quan',
          description: 'Đánh giá mức độ vi phạm, nguyên nhân và trách nhiệm quản lý của đơn vị có liên quan.',
          defaultSelected: true,
        },
        {
          id: 'tc-5',
          title: '5. Đối chiếu lịch sử giải quyết tố cáo trước đó trong hệ thống GOVEX',
          description: 'Kiểm tra xem nội dung tố cáo có phải là tố cáo tiếp hoặc trùng lặp với kết luận đã ban hành hay không.',
          defaultSelected: true,
        },
      ],
    };
  }

  if (lower.includes('khiếu nại')) {
    return {
      loaiNghiepVuLabel: 'Đơn khiếu nại quyết định / hành vi hành chính (Theo Luật Khiếu nại 2011)',
      canCuPhapLyThoiHan: 'Điều 28 Luật Khiếu nại 2011: Thời hạn giải quyết khiếu nại lần đầu không quá 30 ngày kể từ ngày thụ lý.',
      soNgayQuyDinh: 30,
      templates: [
        {
          id: 'kn-1',
          title: '1. Kiểm tra tính hợp pháp của Quyết định hành chính / Hành vi hành chính bị khiếu nại',
          description: 'Rà soát căn cứ pháp lý, trình tự, thủ tục và thẩm quyền ban hành quyết định bị khiếu nại.',
          defaultSelected: true,
        },
        {
          id: 'kn-2',
          title: '2. Kiểm tra hiện trạng thực tế và hồ sơ địa chính / nghiệp vụ gốc',
          description: 'Tổ chức kiểm tra thực địa, đo đạc hoặc đối chiếu hồ sơ lưu trữ tại cơ quan chuyên môn.',
          defaultSelected: true,
        },
        {
          id: 'kn-3',
          title: '3. Làm việc với người khiếu nại và bên bị khiếu nại',
          description: 'Thu thập bổ sung tài liệu từ người khiếu nại và văn bản báo cáo giải trình của đơn vị bị khiếu nại.',
          defaultSelected: true,
        },
        {
          id: 'kn-4',
          title: '4. Chuẩn bị phương án tổ chức đối thoại và dự thảo báo cáo kết quả xác minh',
          description: 'Tổng hợp điểm thống nhất và điểm còn khác biệt để phục vụ phiên đối thoại theo quy định.',
          defaultSelected: true,
        },
      ],
    };
  }

  // Mặc định cho Đơn kiến nghị, phản ánh
  return {
    loaiNghiepVuLabel: 'Đơn kiến nghị, phản ánh (Theo Thông tư 05/2021/TT-TTCP)',
    canCuPhapLyThoiHan: 'Nghị định 20/2008/NĐ-CP & Quy chế tiếp nhận: Thời hạn xử lý và trả lời kiến nghị, phản ánh là 15 ngày làm việc.',
    soNgayQuyDinh: 15,
    templates: [
      {
        id: 'pa-1',
        title: '1. Kiểm tra thực tế nội dung phản ánh, kiến nghị tại địa bàn',
        description: 'Phối hợp đơn vị chuyên môn kiểm tra hiện trạng sự việc công dân phản ánh.',
        defaultSelected: true,
      },
      {
        id: 'pa-2',
        title: '2. Làm rõ trách nhiệm quản lý nhà nước của bộ phận liên quan',
        description: 'Xác định nguyên nhân phát sinh vướng mắc và biện pháp khắc phục kịp thời.',
        defaultSelected: true,
      },
      {
        id: 'pa-3',
        title: '3. Tổng hợp kết quả kiểm tra và dự thảo văn bản trả lời công dân',
        description: 'Đề xuất hướng giải quyết và dự thảo công văn trả lời gửi người kiến nghị, phản ánh.',
        defaultSelected: true,
      },
    ],
  };
}

/**
 * Tính ngày hạn báo cáo dựa trên số ngày quy định theo cấu hình nghiệp vụ (không đặt cứng)
 */
export function calculateConfiguredDeadlineDate(daysToAdd: number, baseDateStr?: string): string {
  const now = new Date();
  if (baseDateStr) {
    const parts = baseDateStr.split('/');
    if (parts.length === 3) {
      const parsed = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(parsed.getTime())) {
        parsed.setDate(parsed.getDate() + daysToAdd);
        return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`;
      }
    }
  }
  now.setDate(now.getDate() + daysToAdd);
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
}

/**
 * Kiểm tra quyền phân công xử lý đơn (Mục 2 & Mục 7)
 */
export function canUserAssignDon(account?: CurrentUserAccount): boolean {
  if (!account) return true;
  // Lãnh đạo hoặc Cán bộ được phân quyền điều phối tại Phòng Tiếp công dân / Cơ quan điều tra
  return account.role === 'lanh_dao' || account.role === 'can_bo';
}

/**
 * Lấy danh sách đơn vị được phép nhận phân công từ dữ liệu hệ thống DEPARTMENTS
 */
export function getAuthorizedDepartmentsForDon(loaiDon?: string): Department[] {
  if (!loaiDon) return DEPARTMENTS;
  return DEPARTMENTS;
}

/**
 * Lấy danh sách cán bộ thuộc đúng đơn vị được chọn từ dữ liệu hệ thống OFFICERS (Mục 3.B & Mục 7)
 */
export function getOfficersByAuthorizedDepartment(departmentId: string): Officer[] {
  return OFFICERS.filter((o) => o.departmentId === departmentId);
}

// ============================================================================
// 3. KHO LƯU TRỮ MOCK SERVICE (PERSIST LOCALSTORAGE + INITIAL DATA)
// ============================================================================

const STORAGE_KEY = 'govex_phan_cong_records_v1';

const INITIAL_PHAN_CONG_RECORDS: Record<string, PhanCongRecord> = {
  'Đ-2025-0105': {
    id: 'PC-2026-0105',
    donCode: 'Đ-2025-0105',
    luotNhanId: 'LN-2025-0105',
    loaiDon: 'Đơn tố giác về tội phạm (Vi phạm quản lý đất đai & trật tự xây dựng)',
    nguoiGuiDon: 'Vũ Thị Thanh',
    ngayTiepNhan: '16/09/2026 09:30',
    noiDungTomTat:
      'Tố giác hành vi lợi dụng chức vụ quyền hạn lập khống hồ sơ bồi thường GPMB, cắt giảm 150m² đất đền bù và có dấu hiệu thông đồng trục lợi tại Dự án Khu đô thị mới Y, quận Hà Đông.',
    donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
    nguoiBiToGiac: 'Ông Lê Văn Sơn (Phó Giám đốc Ban QLDA ĐTXD quận Hà Đông) & Công ty CP ĐTPT Đô thị X',
    taiLieuDinhKem: [
      { name: 'Don_to_cao_ban_goc_VuThiThanh.pdf', size: '1.8 MB' },
      { name: 'Trich_luc_quy_hoach_1-500_thua_dat_48.pdf', size: '3.4 MB' },
      { name: 'Bien_ban_kiem_dem_ap_gia_sai_lech.pdf', size: '2.1 MB' },
      { name: 'Du_lieu_USB_ghi_am_anh_hien_truong.zip', size: '18.6 MB' },
    ],
    donViXuLyId: 'pc03',
    donViXuLyName: 'Phòng Cảnh sát điều tra tội phạm về tham nhũng, kinh tế, buôn lậu (PC03)',
    canBoPhuTrachId: 'OFF-PC-02',
    canBoPhuTrachName: 'Hoàng Đức Minh',
    canBoPhuTrachChucVu: 'Điều tra viên chính',
    vaiTroCanBoPhuTrach: 'Điều tra viên thụ lý chính (Chủ trì xác minh)',
    canBoPhoiHop: [
      {
        officerId: 'OFF-PC-03',
        officerName: 'Trần Quang Hà',
        officerRole: 'Cán bộ thụ lý đơn tố giác',
        departmentId: 'pc03',
        departmentName: 'Phòng Cảnh sát điều tra tội phạm về tham nhũng, kinh tế, buôn lậu (PC03)',
        assignedRoleInTask: 'Cán bộ điều tra phối hợp xác minh hiện trường & tài liệu',
      },
      {
        officerId: 'OFF-TD-02',
        officerName: 'Nguyễn Minh Anh',
        officerRole: 'Cán bộ thụ lý hồ sơ',
        departmentId: 'tiep-dan',
        departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
        assignedRoleInTask: 'Cán bộ phối hợp đối chiếu hồ sơ tiếp nhận ban đầu',
      },
    ],
    nguoiPhanCongName: 'Đỗ Văn Thắng',
    nguoiPhanCongChucVu: 'Phó Thủ trưởng CQĐT (Phó Trưởng phòng PC03)',
    ngayPhanCong: '16/09/2026',
    thoiHanBaoCao: '06/10/2026',
    quyDinhThoiHanText: '20 ngày theo Điều 147 Bộ luật Tố tụng hình sự 2015',
    mucDoUuTien: 'khan',
    chiDaoRieng:
      'Yêu cầu Điều tra viên Hoàng Đức Minh chủ trì phối hợp kiểm tra ngay hồ sơ kiểm đếm gốc tại thửa đất số 48, giám định tệp ghi âm trong USB và báo cáo tiến độ trước ngày 06/10/2026.',
    taskStatus: 'dang_xu_ly',
    isDraft: false,
    acceptedByInvestigatorAt: '16/09/2026 11:00',
    verificationTasks: [
      {
        id: 'vt-1',
        order: 1,
        title: '1. Xác minh người tố giác và nguồn tin',
        description: 'Xác minh nhân thân, CCCD, địa chỉ cư trú của người tố giác (Bà Vũ Thị Thanh) và tính xác thực của nguồn tin ban đầu.',
        aiSuggested: true,
        status: 'da_hoan_thanh',
        resultText:
          'Đã làm việc trực tiếp với bà Vũ Thị Thanh (CCCD: 001082019482, khớp CSDL quốc gia về dân cư). Bà Thanh xác nhận tự nguyện gửi đơn và cung cấp bản chính Giấy chứng nhận QSDĐ số CS-01928 thửa đất số 48 tờ bản đồ 09.',
        unverifiedContentAndReason: '',
        attachments: [
          {
            id: 'att-xm-1',
            name: 'Bien_ban_ghi_loi_khai_VuThiThanh_17092026.pdf',
            size: '640 KB',
            docType: 'bien_ban',
            uploadedAt: '17/09/2026 10:30',
            uploadedBy: 'Hoàng Đức Minh',
          },
        ],
        updatedAt: '17/09/2026 10:35',
        updatedBy: 'Hoàng Đức Minh',
        versionHistory: [
          {
            version: 1,
            updatedAt: '16/09/2026 16:00',
            updatedBy: 'Hoàng Đức Minh',
            updatedByRole: 'Điều tra viên chính',
            status: 'dang_thuc_hien',
            resultText: 'Đã gửi giấy mời làm việc cho bà Vũ Thị Thanh vào sáng 17/09/2026.',
            attachmentsCount: 0,
          },
          {
            version: 2,
            updatedAt: '17/09/2026 10:35',
            updatedBy: 'Hoàng Đức Minh',
            updatedByRole: 'Điều tra viên chính',
            status: 'da_hoan_thanh',
            resultText:
              'Đã làm việc trực tiếp với bà Vũ Thị Thanh (CCCD: 001082019482, khớp CSDL quốc gia về dân cư). Bà Thanh xác nhận tự nguyện gửi đơn và cung cấp bản chính Giấy chứng nhận QSDĐ số CS-01928 thửa đất số 48 tờ bản đồ 09.',
            attachmentsCount: 1,
          },
        ],
      },
      {
        id: 'vt-2',
        order: 2,
        title: '2. Xác minh thời gian, địa điểm xảy ra sự việc',
        description: 'Kiểm tra, đối chiếu mốc thời gian và địa điểm cụ thể tại thửa đất số 48, tờ bản đồ số 09, khu vực Dự án KĐT mới Y.',
        aiSuggested: true,
        status: 'da_hoan_thanh',
        resultText:
          'Đã phối hợp Phòng TN&MT kiểm tra hiện trường thửa đất số 48, tờ bản đồ số 09 phường Mộ Lao. Xác định việc kiểm đếm diễn ra ngày 18/05/2026 và cưỡng chế san lấp ngày 12/08/2026.',
        unverifiedContentAndReason: '',
        attachments: [
          {
            id: 'att-xm-2',
            name: 'Bien_ban_xem_xet_hien_truong_thua_48.pdf',
            size: '1.2 MB',
            docType: 'bien_ban',
            uploadedAt: '18/09/2026 09:20',
            uploadedBy: 'Trần Quang Hà',
          },
        ],
        updatedAt: '18/09/2026 09:20',
        updatedBy: 'Trần Quang Hà',
        versionHistory: [
          {
            version: 1,
            updatedAt: '18/09/2026 09:20',
            updatedBy: 'Trần Quang Hà',
            updatedByRole: 'Cán bộ điều tra phối hợp',
            status: 'da_hoan_thanh',
            resultText:
              'Đã phối hợp Phòng TN&MT kiểm tra hiện trường thửa đất số 48, tờ bản đồ số 09 phường Mộ Lao. Xác định việc kiểm đếm diễn ra ngày 18/05/2026 và cưỡng chế san lấp ngày 12/08/2026.',
            attachmentsCount: 1,
          },
        ],
      },
      {
        id: 'vt-3',
        order: 3,
        title: '3. Làm rõ diễn biến và nội dung sự việc',
        description: 'Thu thập hồ sơ bồi thường GPMB để làm rõ việc điều chỉnh diện tích từ 420m² xuống 270m² và áp giá đền bù.',
        aiSuggested: true,
        status: 'dang_thuc_hien',
        resultText:
          'Đã thu giữ bản sao Phiếu đo đạc hiện trạng ngày 10/05/2026 (ghi 420m² đất ở) và Bảng tổng hợp phương án bồi thường số 112/PA-BT (ghi 270m² đất ở, 150m² đất nông nghiệp xen kẹt). Đang đối chiếu chữ ký nháy trên phiếu điều chỉnh.',
        unverifiedContentAndReason: 'Chưa thu thập được bản gốc Sổ nhật ký đo đạc của Tổ công tác GPMB do cán bộ lưu trữ đang đi công tác.',
        attachments: [],
        updatedAt: '18/09/2026 15:10',
        updatedBy: 'Hoàng Đức Minh',
        versionHistory: [
          {
            version: 1,
            updatedAt: '18/09/2026 15:10',
            updatedBy: 'Hoàng Đức Minh',
            updatedByRole: 'Điều tra viên chính',
            status: 'dang_thuc_hien',
            resultText:
              'Đã thu giữ bản sao Phiếu đo đạc hiện trạng ngày 10/05/2026 (ghi 420m² đất ở) và Bảng tổng hợp phương án bồi thường số 112/PA-BT (ghi 270m² đất ở, 150m² đất nông nghiệp xen kẹt). Đang đối chiếu chữ ký nháy trên phiếu điều chỉnh.',
            unverifiedContentAndReason: 'Chưa thu thập được bản gốc Sổ nhật ký đo đạc của Tổ công tác GPMB do cán bộ lưu trữ đang đi công tác.',
            attachmentsCount: 0,
          },
        ],
      },
      {
        id: 'vt-4',
        order: 4,
        title: '4. Xác minh người bị tố giác và những người liên quan',
        description: 'Xác minh lý lịch, chức vụ, thẩm quyền của ông Lê Văn Sơn và đại diện Công ty CP ĐTPT Đô thị X.',
        aiSuggested: true,
        status: 'chua_thuc_hien',
        resultText: '',
        unverifiedContentAndReason: '',
        attachments: [],
        versionHistory: [],
      },
      {
        id: 'vt-5',
        order: 5,
        title: '5. Xác minh người bị hại và hậu quả xảy ra',
        description: 'Làm rõ thiệt hại tài sản thực tế của hộ bà Vũ Thị Thanh và chênh lệch tiền bồi thường GPMB.',
        aiSuggested: true,
        status: 'chua_thuc_hien',
        resultText: '',
        unverifiedContentAndReason: '',
        attachments: [],
        versionHistory: [],
      },
      {
        id: 'vt-6',
        order: 6,
        title: '6. Kiểm tra tài liệu, hình ảnh, video và các tài liệu kèm theo',
        description: 'Kiểm tra, trưng cầu giám định kỹ thuật số đối với tệp ghi âm và 12 ảnh chụp hiện trường trong USB.',
        aiSuggested: true,
        status: 'da_hoan_thanh',
        resultText:
          'Đã lập biên bản niêm phong và kiểm tra sơ bộ tệp ghi âm "Ghi_am_buoi_lam_viec_18052026.mp3" (thời lượng 18 phút 24 giây, âm thanh rõ, không có dấu hiệu cắt ghép cơ học).',
        unverifiedContentAndReason: '',
        attachments: [
          {
            id: 'att-xm-6',
            name: 'Bien_ban_niem_phong_va_kiem_tra_USB.pdf',
            size: '510 KB',
            docType: 'bien_ban',
            uploadedAt: '17/09/2026 14:45',
            uploadedBy: 'Hoàng Đức Minh',
          },
        ],
        updatedAt: '17/09/2026 14:45',
        updatedBy: 'Hoàng Đức Minh',
        versionHistory: [
          {
            version: 1,
            updatedAt: '17/09/2026 14:45',
            updatedBy: 'Hoàng Đức Minh',
            updatedByRole: 'Điều tra viên chính',
            status: 'da_hoan_thanh',
            resultText:
              'Đã lập biên bản niêm phong và kiểm tra sơ bộ tệp ghi âm "Ghi_am_buoi_lam_viec_18052026.mp3" (thời lượng 18 phút 24 giây, âm thanh rõ, không có dấu hiệu cắt ghép cơ học).',
            attachmentsCount: 1,
          },
        ],
      },
      {
        id: 'vt-7',
        order: 7,
        title: '7. Xác minh người làm chứng và các nguồn thông tin khác',
        description: 'Rà soát, lấy lời khai các hộ dân liền kề tại tổ dân phố số 7 và cán bộ địa chính phường chứng kiến buổi kiểm đếm.',
        aiSuggested: true,
        status: 'chua_thuc_hien',
        resultText: '',
        unverifiedContentAndReason: '',
        attachments: [],
        versionHistory: [],
      },
      {
        id: 'vt-8',
        order: 8,
        title: '8. Kiểm tra tình trạng tiếp nhận, xử lý trước đó',
        description: 'Tra cứu CSDL đơn thư và nguồn tin tội phạm để kiểm tra các đơn cùng vụ việc tại Dự án KĐT mới Y.',
        aiSuggested: true,
        status: 'da_hoan_thanh',
        resultText:
          'Qua tra cứu CSDL GOVEX, phát hiện 01 hồ sơ vụ việc liên quan mã VV-2026-0042 đang kiểm tra công tác GPMB tại Dự án Khu đô thị mới Y; chưa có Quyết định khởi tố hay Không khởi tố vụ án hình sự đối với nội dung tố giác này.',
        unverifiedContentAndReason: '',
        attachments: [],
        updatedAt: '16/09/2026 15:20',
        updatedBy: 'Nguyễn Minh Anh',
        versionHistory: [
          {
            version: 1,
            updatedAt: '16/09/2026 15:20',
            updatedBy: 'Nguyễn Minh Anh',
            updatedByRole: 'Cán bộ phối hợp',
            status: 'da_hoan_thanh',
            resultText:
              'Qua tra cứu CSDL GOVEX, phát hiện 01 hồ sơ vụ việc liên quan mã VV-2026-0042 đang kiểm tra công tác GPMB tại Dự án Khu đô thị mới Y; chưa có Quyết định khởi tố hay Không khởi tố vụ án hình sự đối với nội dung tố giác này.',
            attachmentsCount: 0,
          },
        ],
      },
    ],
    history: [
      {
        id: 'hist-pc-3',
        timestamp: '18/09/2026 15:10',
        actionType: 'cap_nhat_ket_qua',
        title: 'Cập nhật kết quả xác minh (04/08 nội dung hoàn thành, 01 nội dung đang thực hiện)',
        actorName: 'Hoàng Đức Minh',
        actorRole: 'Điều tra viên chính (PC03)',
        leadOfficerName: 'Hoàng Đức Minh',
        leadOfficerRole: 'Điều tra viên thụ lý chính',
        coordinatingOfficers: ['Trần Quang Hà (PC03)', 'Nguyễn Minh Anh (Phòng Tiếp dân)'],
        deadline: '06/10/2026',
        summary:
          'Đã hoàn thành xác minh nhân thân người tố giác, khám nghiệm hiện trường thửa đất số 48, kiểm tra USB ghi âm và đối soát lịch sử thụ lý. Đang làm rõ hồ sơ áp giá bồi thường số 112/PA-BT.',
      },
      {
        id: 'hist-pc-2',
        timestamp: '16/09/2026 10:45',
        actionType: 'thay_doi_can_bo',
        title: 'Thay đổi cán bộ điều tra phụ trách chính & bổ sung cán bộ phối hợp',
        actorName: 'Đỗ Văn Thắng',
        actorRole: 'Phó Thủ trưởng CQĐT (PC03)',
        leadOfficerName: 'Hoàng Đức Minh',
        leadOfficerRole: 'Điều tra viên chính',
        previousLeadOfficerName: 'Trần Quang Hà',
        changeReason:
          'Vụ việc có tình tiết phức tạp liên quan đến hồ sơ định giá đất và dữ liệu điện tử, cần phân công Điều tra viên chính Hoàng Đức Minh chủ trì và chuyển đ/c Trần Quang Hà sang vai trò cán bộ điều tra phối hợp (Giữ nguyên toàn bộ dữ liệu hồ sơ đã thu thập).',
        coordinatingOfficers: ['Trần Quang Hà (PC03)', 'Nguyễn Minh Anh (Phòng Tiếp dân)'],
        deadline: '06/10/2026',
        summary: 'Chuyển giao vai trò chủ trì từ đ/c Trần Quang Hà sang Điều tra viên chính Hoàng Đức Minh.',
      },
      {
        id: 'hist-pc-1',
        timestamp: '16/09/2026 10:15',
        actionType: 'phan_cong_moi',
        title: 'Phân công xử lý & xác minh nguồn tin về tội phạm lần đầu',
        actorName: 'Đỗ Văn Thắng',
        actorRole: 'Phó Thủ trưởng CQĐT (PC03)',
        leadOfficerName: 'Trần Quang Hà',
        leadOfficerRole: 'Cán bộ thụ lý đơn tố giác',
        coordinatingOfficers: ['Nguyễn Minh Anh (Phòng Tiếp dân)'],
        deadline: '06/10/2026',
        summary: 'Giao xác minh 08 nội dung theo đề xuất phân tích AI đối với đơn Đ-2025-0105 của bà Vũ Thị Thanh.',
      },
    ],
  },
};

export function loadAllPhanCongRecords(): Record<string, PhanCongRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_PHAN_CONG_RECORDS, ...parsed };
    }
  } catch (e) {
    console.error('Lỗi đọc dữ liệu phân công từ localStorage:', e);
  }
  return { ...INITIAL_PHAN_CONG_RECORDS };
}

export function saveAllPhanCongRecords(records: Record<string, PhanCongRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Lỗi lưu dữ liệu phân công vào localStorage:', e);
  }
}

export function getPhanCongRecordByDonCode(donCode?: string): PhanCongRecord | null {
  if (!donCode) return null;
  const all = loadAllPhanCongRecords();
  return all[donCode] || null;
}

export function savePhanCongRecord(record: PhanCongRecord): PhanCongRecord {
  const all = loadAllPhanCongRecords();
  all[record.donCode] = record;
  saveAllPhanCongRecords(all);
  return record;
}

/**
 * Tự động tổng hợp dự thảo Báo cáo đề xuất từ kết quả xác minh của các nội dung đã giao (Mục 4.D)
 */
export function generateAiBaoCaoDeXuatDraft(
  record: PhanCongRecord,
  actorName: string
): BaoCaoDeXuatTongHopDraft {
  const nowStr = new Date().toLocaleDateString('vi-VN');
  const completedTasks = record.verificationTasks.filter((t) => t.status === 'da_hoan_thanh');
  const pendingOrUnverified = record.verificationTasks.filter((t) => t.status !== 'da_hoan_thanh');
  const allAttachments = record.verificationTasks.flatMap((t) =>
    t.attachments.map((a) => `${a.name} (${a.size} - Đính kèm tại mục "${t.title}")`)
  );

  const ketQuaTungNoiDungText = record.verificationTasks
    .map((t, idx) => {
      const statusLabel = VERIFICATION_ITEM_STATUS_CONFIG[t.status].label;
      const kq = t.resultText?.trim()
        ? t.resultText.trim()
        : 'Chưa có kết quả xác minh chi tiết.';
      const reason = t.unverifiedContentAndReason?.trim()
        ? `\n   + Nội dung chưa xác minh được / Lý do: ${t.unverifiedContentAndReason.trim()}`
        : '';
      return `${idx + 1}. ${t.title} [${statusLabel}]:\n   + Kết quả: ${kq}${reason}`;
    })
    .join('\n\n');

  const chuaLamRoText =
    pendingOrUnverified.length > 0
      ? pendingOrUnverified
          .map(
            (t) =>
              `- ${t.title}: ${
                t.unverifiedContentAndReason?.trim() ||
                'Đang tiếp tục thu thập tài liệu và làm việc với các bên liên quan.'
              }`
          )
          .join('\n')
      : 'Toàn bộ các nội dung được phân công xác minh đã được làm rõ đầy đủ.';

  const taiLieuThuThapText = [
    ...record.taiLieuDinhKem.map((f) => `- Tài liệu gốc kèm theo đơn: ${f.name} (${f.size})`),
    ...allAttachments.map((a) => `- Tài liệu thu thập trong quá trình xác minh: ${a}`),
  ].join('\n');

  return {
    id: `BCDX-${record.donCode}-${Date.now().toString().slice(-4)}`,
    soKyHieu: `BC-XM/${record.donCode.replace(/[^0-9]/g, '') || '2026'}`,
    ngayLap: nowStr,
    nguoiLap: actorName || record.canBoPhuTrachName,
    donViLap: record.donViXuLyName,
    noiDungDonBanDau: `Người gửi đơn: ${record.nguoiGuiDon} (Ngày tiếp nhận: ${record.ngayTiepNhan}).\nLoại đơn: ${record.loaiDon}.\nNội dung tóm tắt: ${record.noiDungTomTat}`,
    noiDungDuocPhanCong: `Người phân công: ${record.nguoiPhanCongName} (${record.nguoiPhanCongChucVu}) ngày ${record.ngayPhanCong}.\nCán bộ phụ trách chính: ${record.canBoPhuTrachName} (${record.vaiTroCanBoPhuTrach}).\nCán bộ phối hợp: ${
      record.canBoPhoiHop.length > 0
        ? record.canBoPhoiHop.map((c) => `${c.officerName} (${c.assignedRoleInTask})`).join('; ')
        : 'Không có'
    }.\nTổng số nội dung giao xác minh: ${record.verificationTasks.length} nội dung (Hạn báo cáo: ${record.thoiHanBaoCao}).\nChỉ đạo riêng: ${record.chiDaoRieng || 'Thực hiện theo đúng quy định pháp luật.'}`,
    quaTrinhXacMinh: `Tổ xác minh đã tiếp nhận nhiệm vụ và triển khai xác minh thực tế từ ngày ${record.ngayPhanCong} đến ngày ${nowStr}. Đã hoàn thành ${completedTasks.length}/${record.verificationTasks.length} nội dung được giao, thu thập bổ sung ${allAttachments.length} biên bản/tài liệu xác minh.`,
    ketQuaTungNoiDung: ketQuaTungNoiDungText,
    taiLieuDaThuThap: taiLieuThuThapText,
    noiDungChuaLamRo: chuaLamRoText,
    nhanDinhVaKienNghi: `Qua kết quả xác minh bước đầu đối với đơn ${record.donCode} của ${record.nguoiGuiDon}, nhận thấy nguồn tin có căn cứ và tài liệu chứng cứ rõ ràng về sự chênh lệch diện tích kiểm đếm bồi thường (150m²) tại thửa đất số 48.\n\nKIẾN NGHỊ HƯỚNG XỬ LÝ:\n1. Đề nghị Thủ trưởng đơn vị xem xét ban hành Quyết định thụ lý giải quyết chính thức theo thẩm quyền.\n2. Tiếp tục trưng cầu giám định và yêu cầu cá nhân/tổ chức bị tố giác giải trình bằng văn bản đối với các nội dung đã xác minh.`,
    status: 'nhap',
    updatedAt: `${nowStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
  };
}

