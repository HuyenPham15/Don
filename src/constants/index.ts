const LN19: LuotNhan = {
  id: "LN-19/2026-GOVEX_HC",
  ngayNhan: "15/09/2026",
  nguoiNop: "Nguyễn Văn A",
  hinhThuc: "Trực tiếp",
  noiDung: "Khiếu nại về mức bồi thường giải phóng mặt bằng Dự án Khu dân cư X",
  donVi: "Phòng Hành chính - Tổng hợp",
  aiJob: 3,
};

const ALL_LUOT_NHAN: LuotNhan[] = [
  LN19,
  { id: "LN-18/2026-GOVEX_HC", ngayNhan: "14/09/2026", nguoiNop: "Trần Thị B", hinhThuc: "Bưu điện", noiDung: "Tố cáo vi phạm đất đai tại thửa 45, tờ bản đồ 12", donVi: "Thanh tra tỉnh", aiJob: 5 },
  { id: "LN-17/2026-GOVEX_HC", ngayNhan: "13/09/2026", nguoiNop: "Cty TNHH Nam Phương", hinhThuc: "Trực tuyến", noiDung: "Phản ánh về chậm cấp phép xây dựng", donVi: "Sở Xây dựng", aiJob: 5 },
  { id: "LN-16/2026-GOVEX_HC", ngayNhan: "12/09/2026", nguoiNop: "Lê Văn C", hinhThuc: "Trực tiếp", noiDung: "Khiếu nại quyết định xử phạt vi phạm hành chính", donVi: "Phòng Hành chính - Tổng hợp", aiJob: 0 },
];

const JOB_LABELS = ["", "Đọc đơn", "Hiểu & Bóc tách", "Tìm Người / Tổ chức", "Tìm Đơn & Vụ việc", "Đối chiếu điều kiện", "Đề xuất hướng xử lý"];

const PIPELINE_STEPS = ["Đọc đơn", "Hiểu & Bóc tách", "Tìm Người / Tổ chức", "Tìm Đơn & Vụ việc", "Đối chiếu điều kiện", "Đề xuất hướng xử lý"];

const DON_VI_OPTIONS = ["Phòng Tiếp công dân", "Thanh tra tỉnh", "Công an tỉnh", "Sở Kế hoạch & Đầu tư", "UBND tỉnh"];

const DON_FIELDS: DonField[] = [
  { key: "nguoi-gui", label: "Người gửi", ai: "Nguyễn Văn A", type: "text", hlKey: "nguoi-gui" },
  { key: "cccd", label: "CCCD", ai: "079075012345", type: "text" },
  { key: "dia-chi", label: "Địa chỉ", ai: "45 Đường Lê Lợi, P.3, TP. XYZ", type: "text", full: true },
  { key: "doi-tuong", label: "Đối tượng liên quan", ai: "Công ty TNHH Xây dựng ABC", type: "text", needsCheck: true, hlKey: "doi-tuong" },
  { key: "co-quan", label: "Cơ quan liên quan", ai: "UBND tỉnh XYZ", type: "text", hlKey: "co-quan" },
  { key: "du-an", label: "Dự án", ai: "Khu dân cư X", type: "text", hlKey: "du-an" },
  { key: "ngay-gui", label: "Ngày làm đơn", ai: "10/09/2026", type: "date" },
  { key: "noi-dung", label: "Nội dung chính", ai: "Khiếu nại về mức bồi thường giải phóng mặt bằng (GPMB)", type: "textarea", full: true, hlKey: "noi-dung" },
  { key: "yeu-cau", label: "Yêu cầu của người gửi", ai: "Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND", type: "textarea", full: true, hlKey: "yeu-cau" },
];

const AI_SUMMARY = "Ông Nguyễn Văn A khiếu nại về mức bồi thường giải phóng mặt bằng tại Dự án Khu dân cư X, đề nghị xem xét lại mức bồi thường theo Quyết định 45/2024/QĐ-UBND.";

