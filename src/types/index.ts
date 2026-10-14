
export type Screen = 
  | "cong-viec" 
  | "nhan-don-list" 
  | "nhan-don-them" 
  | "tao-don-moi"
  | "chi-tiet-luot-nhan"
  | "ban-phan-tich" 
  | "don-tiep-nhan" 
  | "quy-trinh-xu-ly" 
  | "quan-tri-quy-trinh"
  | "quan-tri-loai-don"
  | "quan-tri-lich-lam-viec"
  | "quan-tri-bieu-mau"
  | "trinh-ky"
  | "van-ban-cho-ky"
  | "quan-ly-trinh-ky"
  | "thu-vien" 
  | "bao-cao" 
  | "tiep-nhan-xu-ly"
  | "ai-tiep-nhan-chat"
  | "login";

export * from './signing';
export * from './quanLyTrinhKy';

export type AIJob = 0 | 1 | 2 | 3 | 4 | 5;

export type DrawerType = "nguoi-gui" | "don-lien-quan" | "so-sanh" | "vu-viec" | "trung-don" | "mau-thuan" | "xem-nguon" | "rule" | "knowledge" | "can-cu";

export type LoaiNghiepVuTiepNhan = 
  | 'tiep_nhan_don' 
  | 'tin_bao_toi_pham' 
  | 'to_giac_toi_pham' 
  | 'nguoi_tu_thu' 
  | 'nguoi_dau_thu' 
  | 'bat_qua_tang' 
  | 'can_bo_phat_hien' 
  | 'tai_lieu_bo_sung' 
  | 'tin_bao_to_giac'; // Tương thích ngược

export type TruongHopTrinhDien = 'tu_thu' | 'dau_thu' | 'chua_xac_dinh' | 'can_can_bo_xac_nhan';

// ─── CƠ CHẾ AI PHÂN TÍCH ĐA NGUỒN DỮ LIỆU (KHÔNG PHỤ THUỘC BẮT BUỘC VÀO OCR) ───
export type AIAnalysisState = 
  | 'chua_du_du_lieu'      // Chưa có dữ liệu / Chưa đủ dữ liệu để phân tích
  | 'dang_phan_tich'       // Đang phân tích...
  | 'phan_tich_so_bo'      // Đã có phân tích sơ bộ (dựa trên mô tả ban đầu / lời khai)
  | 'can_bo_sung'          // Cần bổ sung thông tin
  | 'da_cap_nhat'          // Đã cập nhật phân tích (sau khi có tài liệu / xác minh)
  | 'loi_phan_tich';       // Lỗi phân tích

export type AIDataSourceType = 
  | 'can_bo_ghi_nhan'      // 1. Nội dung do cán bộ ghi nhận trực tiếp trên giao diện
  | 'nguoi_lien_quan'      // 2. Lời trình bày/thông tin do người liên quan cung cấp
  | 'csdl_govex'           // 3. Dữ liệu có liên quan trong GOVEX được cấp quyền
  | 'can_cu_phap_luat'     // 4. Quy định pháp luật, quy tắc nghiệp vụ và workflow
  | 'tai_lieu_dinh_kem';   // 5. Biên bản, hình ảnh, tài liệu, OCR bổ sung sau

export interface AIAnalysisVersion {
  id: string;
  version: number;
  timestamp: string;
  state: AIAnalysisState;
  sources: AIDataSourceType[];
  tomTat: string;
  duKienDaCungCap: { tieuDe: string; chiTiet: string; nguon: string }[];
  thongTinChuaXacMinh: string[];
  nhanDinhAiDeXuat: string[];
  thongTinConThieu: string[];
  cauHoiCanLamRo: string[];
  canCuPhapLy: { dieuKhoan: string; noiDung: string }[];
  viecCanKiemTra: string[];
  officerConfirmed?: boolean;
  officerConfirmedTime?: string;
  officerNote?: string;
}

export interface DrawerState { type: DrawerType; field?: string; }

export interface LuotNhan {
  id: string;
  ngayNhan: string;
  gioNhan?: string;
  nguoiNop: string;
  hinhThuc: string;
  noiDung: string;
  donVi: string;
  aiJob: AIJob;
  cccd?: string;
  sdt?: string;
  diaChi?: string;
  loaiDon?: string;
  status?: 'cho_chuyen' | 'da_chuyen' | 'da_ban_giao' | 'da_tra_lai' | 'da_ghep' | 'da_thu_ly' | 'khong_thu_ly' | 'cho_bo_sung' | 'da_tiep_nhan';
  ghepVaoDonCode?: string;
  ngayChuyenXuLy?: string;
  nguoiThaoTacGanNhat?: string;
  hasFile?: boolean;
  fileCount?: number;
  files?: UploadedFile[];
  ghiChu?: string;
  sourceType?: 'file' | 'ghi_chu' | 'both';
  isOfficialData?: boolean;
  officerEdits?: Record<string, string>;
  historyLogs?: { time: string; action: string; actor: string; note?: string }[];
  // Bổ sung phân biệt nghiệp vụ theo yêu cầu GovEx
  loaiNghiepVu?: LoaiNghiepVuTiepNhan;
  nguonTin?: string;
  yeuCauBaoMat?: boolean;
  tuCachNguoiBao?: string;
  thoiGianSuViec?: string;
  diaDiemSuViec?: string;
  doiTuongLienQuan?: string;
  dienBienSuViec?: string;
  hauQuaThietHai?: string;
  hoSoLienKetId?: string;
  canBoNhan?: string;
  // Bổ sung chuyên biệt cho Tiếp nhận Người tự thú / Đầu thú (Mục 12)
  quocTich?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  noiOChinh?: string;
  nhanDangDacBiet?: string;
  tinhTrangXacMinhDanhTinh?: 'da_xac_minh' | 'chua_xac_minh' | 'cho_tra_cuu_c06' | string;
  hinhThucTrinhDien?: string;
  truongHopTrinhDien?: TruongHopTrinhDien;
  lyDoPhanLoai?: string;
  lichSuDieuChinhPhanLoai?: { time: string; actor: string; from: string; to: string; reason: string }[];
  nguoiDiCung?: string | { hoTen?: string; cccd?: string; quanHe?: string; sdt?: string };
  doVatGiaoNop?: string;
  canhBaoAnToan?: {
    canHoTroYTe?: boolean;
    lyDoYTe?: string;
    nguyCoMatAnToan?: boolean;
    canBaoVeNguoiTaiSan?: boolean;
    canBaoQuanDoVat?: boolean;
    ghiChu?: string;
  };
  // Cơ chế AI phân tích đa nguồn dữ liệu (không bắt buộc OCR)
  aiAnalysisState?: AIAnalysisState;
  aiAnalysisHistory?: AIAnalysisVersion[];
  activeAiVersion?: number;
  ngheNghiep?: string;
  // Bổ sung chuyên biệt cho Bắt quả tang & Cán bộ phát hiện
  tangVatThuGiu?: string;
  nguoiLamChung?: string;
  lucLuongPhatHien?: string;
  bienPhapPhatHien?: string;
}

export interface DonDetail {
  id: string;
  code: string;
  title: string;
  luotNhanId?: string;
  nguoiNop: string;
  ngayNhan?: string;
  gioNhan?: string;
  loaiDon?: string;
  type?: 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN' | 'LƯỢT NHẬN' | 'TỰ THÚ / ĐẦU THÚ' | 'BẮT QUẢ TANG' | 'CÁN BỘ PHÁT HIỆN';
  statusBadge?: string;
  currentStep?: number;
  stepName?: string;
  canBoTiepNhan?: string;
  chucVuCanBo?: string;
  donViXuLy?: string;
  donViTiepNhan?: string;
  canBoXuLy?: string;
  cccd?: string;
  sdt?: string;
  diaChi?: string;
  noiDung?: string;
  progress?: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    steps?: string[];
  };
  isAwaitingAcceptance?: boolean;
  isNoFileTransfer?: boolean;
  hasFile?: boolean;
  isNew?: boolean;
}

export interface UploadedFile { name: string; size: string; category: "main" | "attach" | "extra"; }

export type FieldType = "text" | "textarea" | "date" | "select" | "search";

export interface DonField { key: string; label: string; ai: string | null; type: FieldType; options?: string[]; needsCheck?: boolean; full?: boolean; hlKey?: string; }

export interface Acks { info: boolean; traCuu: boolean }

// ─── Workflow types ───────────────────────────────────────────────────────────

export interface WorkflowStep {
  id: string;
  name: string;
  responsible: string;
  status: "done" | "active" | "pending";
}

export interface WorkflowConfig {
  id: string;
  name: string;
  version: string;
  loaiDonId: string;
  effectiveDate: string;
  status: "active" | "inactive";
  scope: string;
  steps: Omit<WorkflowStep, "status">[];
}

export interface LoaiDon {
  id: string;
  name: string;
}

export type AcceptanceState = "idle" | "confirming" | "summary" | "success";
