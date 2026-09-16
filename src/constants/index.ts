import { LuotNhan, DonField, LoaiDon, WorkflowConfig } from "../types";

export const LN19: LuotNhan = {
  id: "LN-19/2026-GOVEX_HC",
  ngayNhan: "15/09/2026",
  nguoiNop: "Nguyễn Văn A",
  hinhThuc: "Trực tiếp",
  noiDung: "Khiếu nại về mức bồi thường giải phóng mặt bằng Dự án Khu dân cư X",
  donVi: "Phòng Hành chính - Tổng hợp",
  aiJob: 3,
};

export const ALL_LUOT_NHAN: LuotNhan[] = [
  LN19,
  { id: "LN-18/2026-GOVEX_HC", ngayNhan: "14/09/2026", nguoiNop: "Trần Thị B", hinhThuc: "Bưu điện", noiDung: "Tố cáo vi phạm đất đai tại thửa 45, tờ bản đồ 12", donVi: "Thanh tra tỉnh", aiJob: 5 },
  { id: "LN-17/2026-GOVEX_HC", ngayNhan: "13/09/2026", nguoiNop: "Cty TNHH Nam Phương", hinhThuc: "Trực tuyến", noiDung: "Phản ánh về chậm cấp phép xây dựng", donVi: "Sở Xây dựng", aiJob: 5 },
  { id: "LN-16/2026-GOVEX_HC", ngayNhan: "12/09/2026", nguoiNop: "Lê Văn C", hinhThuc: "Trực tiếp", noiDung: "Khiếu nại quyết định xử phạt vi phạm hành chính", donVi: "Phòng Hành chính - Tổng hợp", aiJob: 0 },
];

export const JOB_LABELS = ["", "Đọc đơn", "Hiểu & Bóc tách", "Tìm Người / Tổ chức", "Tìm Đơn & Vụ việc", "Đối chiếu điều kiện", "Đề xuất hướng xử lý"];

export const PIPELINE_STEPS = ["Đọc đơn", "Hiểu & Bóc tách", "Tìm Người / Tổ chức", "Tìm Đơn & Vụ việc", "Đối chiếu điều kiện", "Đề xuất hướng xử lý"];

export const DON_VI_OPTIONS = ["Phòng Tiếp công dân", "Thanh tra tỉnh", "Công an tỉnh", "Sở Kế hoạch & Đầu tư", "UBND tỉnh"];

export const DON_FIELDS: DonField[] = [
  { key: "loai-don-du-kien", label: "Loại đơn dự kiến", ai: "Khiếu nại", type: "text" },
  { key: "nguoi-gui", label: "Người gửi", ai: "Nguyễn Văn A", type: "text", hlKey: "nguoi-gui" },
  { key: "cccd", label: "CCCD / MST", ai: "079075012345", type: "text" },
  { key: "ngay-sinh", label: "Ngày sinh", ai: "12/05/1980", type: "text" },
  { key: "sdt", label: "Số điện thoại", ai: "0901234567", type: "text" },
  { key: "email", label: "Email", ai: "nguyenvana@example.com", type: "text" },
  { key: "dia-chi", label: "Địa chỉ", ai: "45 Đường Lê Lợi, P.3, TP. XYZ", type: "text", full: true },
  
  { key: "doi-tuong", label: "Người/Tổ chức bị phản ánh/khiếu nại/tố cáo", ai: "Công ty TNHH Xây dựng ABC", type: "text", needsCheck: true, hlKey: "doi-tuong", full: true },
  { key: "co-quan", label: "Cơ quan liên quan", ai: "UBND tỉnh XYZ", type: "text", hlKey: "co-quan", full: true },
  
  { key: "noi-dung", label: "Nội dung chính", ai: "Khiếu nại về mức bồi thường giải phóng mặt bằng", type: "textarea", full: true, hlKey: "noi-dung" },
  { key: "su-viec", label: "Sự việc", ai: "Đền bù đất đai không thỏa đáng", type: "text", full: true },
  { key: "dia-diem", label: "Địa điểm sự việc", ai: "Khu vực dự án X, P.3, TP. XYZ", type: "text", full: true },
  { key: "thoi-gian", label: "Thời gian sự việc", ai: "Tháng 08/2026", type: "text" },
  { key: "du-an", label: "Dự án/Vụ việc liên quan", ai: "Dự án Khu dân cư X", type: "text", hlKey: "du-an" },
  { key: "so-tien", label: "Số tiền (nếu có)", ai: "500,000,000 VNĐ", type: "text" },
  { key: "yeu-cau", label: "Yêu cầu của người gửi", ai: "Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND", type: "textarea", full: true, hlKey: "yeu-cau" },
  { key: "van-ban", label: "Văn bản/quyết định đề cập", ai: "Quyết định 45/2024/QĐ-UBND", type: "text", full: true },
  { key: "tai-lieu", label: "Tài liệu kèm theo", ai: "1. Bản sao sổ đỏ\n2. Thông báo thu hồi đất", type: "textarea", full: true },
];

export const AI_SUMMARY = "Ông Nguyễn Văn A khiếu nại về mức bồi thường giải phóng mặt bằng tại Dự án Khu dân cư X, đề nghị xem xét lại mức bồi thường theo Quyết định 45/2024/QĐ-UBND.";

// ─── Workflow configuration mock data ─────────────────────────────────────────

export const LOAI_DON_OPTIONS: LoaiDon[] = [
  { id: "khieu-nai", name: "Khiếu nại" },
  { id: "to-cao", name: "Tố cáo" },
  { id: "kien-nghi", name: "Kiến nghị / Phản ánh" },
  { id: "tranh-chap", name: "Tranh chấp đất đai" },
];

export const WORKFLOW_CONFIGS: WorkflowConfig[] = [
  {
    id: "WF-KN-03",
    name: "Quy trình xử lý đơn khiếu nại",
    version: "Version 3",
    loaiDonId: "khieu-nai",
    effectiveDate: "01/09/2026",
    status: "active",
    scope: "Toàn tỉnh",
    steps: [
      { id: "s1", name: "Tiếp nhận và kiểm tra thông tin", responsible: "Phòng Tiếp nhận đơn" },
      { id: "s2", name: "Phân loại / Đề xuất thụ lý", responsible: "Phòng Nghiệp vụ" },
      { id: "s3", name: "Phê duyệt", responsible: "Lãnh đạo đơn vị" },
      { id: "s4", name: "Phân công xử lý", responsible: "Phòng Nghiệp vụ" },
      { id: "s5", name: "Xử lý / Kết quả", responsible: "Cán bộ được phân công" },
    ],
  },
  {
    id: "WF-TC-02",
    name: "Quy trình xử lý đơn tố cáo",
    version: "Version 2",
    loaiDonId: "to-cao",
    effectiveDate: "01/06/2026",
    status: "active",
    scope: "Toàn tỉnh",
    steps: [
      { id: "s1", name: "Tiếp nhận và xác minh nguồn tố cáo", responsible: "Phòng Tiếp nhận đơn" },
      { id: "s2", name: "Xác minh nội dung tố cáo", responsible: "Tổ xác minh" },
      { id: "s3", name: "Kết luận nội dung tố cáo", responsible: "Lãnh đạo đơn vị" },
      { id: "s4", name: "Xử lý kết luận", responsible: "Phòng Nghiệp vụ" },
    ],
  },
  {
    id: "WF-TC-03",
    name: "Quy trình xử lý tố cáo phức tạp",
    version: "Version 1",
    loaiDonId: "to-cao",
    effectiveDate: "15/08/2026",
    status: "active",
    scope: "Vụ việc phức tạp, nhiều đối tượng",
    steps: [
      { id: "s1", name: "Tiếp nhận và phân loại mức độ", responsible: "Phòng Tiếp nhận đơn" },
      { id: "s2", name: "Thành lập tổ xác minh", responsible: "Lãnh đạo đơn vị" },
      { id: "s3", name: "Xác minh thực tế", responsible: "Tổ xác minh liên ngành" },
      { id: "s4", name: "Đối chất / Làm việc", responsible: "Tổ xác minh liên ngành" },
      { id: "s5", name: "Kết luận", responsible: "Lãnh đạo đơn vị" },
      { id: "s6", name: "Xử lý sau kết luận", responsible: "Phòng Nghiệp vụ" },
    ],
  },
  {
    id: "WF-KN-PA-01",
    name: "Quy trình tiếp nhận kiến nghị / phản ánh",
    version: "Version 1",
    loaiDonId: "kien-nghi",
    effectiveDate: "01/01/2026",
    status: "active",
    scope: "Toàn tỉnh",
    steps: [
      { id: "s1", name: "Tiếp nhận và phân loại", responsible: "Phòng Tiếp nhận đơn" },
      { id: "s2", name: "Chuyển cơ quan có thẩm quyền", responsible: "Phòng Nghiệp vụ" },
      { id: "s3", name: "Theo dõi xử lý", responsible: "Phòng Nghiệp vụ" },
    ],
  },
  // Tranh chấp đất đai — KHÔNG có quy trình (demo edge case BR-07)
];
