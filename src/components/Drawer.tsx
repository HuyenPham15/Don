import React from 'react';
import AiBadge from "./AiBadge";
import DrawerField from "./DrawerField";
import DrawerSection from "./DrawerSection";
import MatchFactor from "./MatchFactor";
function Drawer({ drawer, onClose, onOpenDrawer }: {
  drawer: DrawerState;
  onClose: () => void;
  onOpenDrawer: (d: DrawerState) => void;
}) {
  const titles: Record<DrawerType, string> = {
    "nguoi-gui": "Chi tiết người gửi",
    "don-lien-quan": "Chi tiết đơn liên quan",
    "so-sanh": "So sánh với đơn D-2026-00341",
    "vu-viec": "Chi tiết vụ việc liên quan",
    "trung-don": "Khả năng trùng đơn",
    "mau-thuan": "Thông tin cần kiểm tra",
    "xem-nguon": "Nguồn dữ liệu trong tài liệu",
    "rule": "Quy tắc nghiệp vụ được kích hoạt",
    "knowledge": "Căn cứ & hướng dẫn liên quan",
    "can-cu": "Căn cứ phát hiện",
  };

  const sourceMap: Record<string, { field: string; excerpt: string; page: string; extract: string }> = {
    "nguoi-gui": { field: "NGƯỜI GỬI", excerpt: "Tôi là: Nguyễn Văn A, CCCD: 079075012345, thường trú 45 Đường Lê Lợi, Phường 3, TP. XYZ.", page: "Trang 1 – Đơn khiếu nại", extract: "Người gửi: Nguyễn Văn A · CCCD: 079075012345" },
    "to-chuc": { field: "TỔ CHỨC BỊ PHẢN ÁNH", excerpt: "...quyết định bồi thường GPMB của Công ty TNHH Xây dựng ABC tại Dự án Khu dân cư X.", page: "Trang 1 – Đơn khiếu nại", extract: "Tổ chức: Công ty TNHH Xây dựng ABC" },
    "co-quan": { field: "CƠ QUAN LIÊN QUAN", excerpt: "Kính gửi: UBND tỉnh XYZ", page: "Trang 1 – Đầu đơn", extract: "Cơ quan nhận đơn: UBND tỉnh XYZ" },
    "du-an": { field: "DỰ ÁN", excerpt: "...bồi thường GPMB của Công ty TNHH Xây dựng ABC tại Dự án Khu dân cư X.", page: "Trang 1 – Đơn khiếu nại", extract: "Dự án: Khu dân cư X" },
    "thoi-gian": { field: "THỜI GIAN", excerpt: "XYZ, ngày 10 tháng 9 năm 2026", page: "Trang 2 – Phần ký tên", extract: "Ngày làm đơn: 10/09/2026" },
    "su-viec": { field: "SỰ VIỆC", excerpt: "Mức bồi thường 850.000đ/m² không đúng với giá đất thực tế 2.200.000đ/m² theo Quyết định 45/2024/QĐ-UBND.", page: "Trang 2 – Nội dung khiếu nại", extract: "Sự việc: Tranh chấp mức bồi thường GPMB" },
    "yeu-cau": { field: "YÊU CẦU", excerpt: "Yêu cầu: Xem xét lại mức bồi thường, đảm bảo quyền lợi hợp pháp theo Luật Đất đai 2024.", page: "Trang 2 – Phần yêu cầu", extract: "Yêu cầu: Xem xét lại mức bồi thường" },
    "tai-lieu": { field: "TÀI LIỆU", excerpt: "Kèm theo: Quyết định bồi thường số 45/QĐ-ABC, Bảng giá đất tham chiếu.", page: "Trang 2 – Danh sách tài liệu", extract: "02 tài liệu kèm theo" },
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col shadow-2xl slide-in"
        style={{ width: 480, background: "#fff", borderLeft: "1px solid #E2E8F0" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94A3B8" }}>Chi tiết kết quả AI</div>
            <h3 className="font-bold text-base">{titles[drawer.type]}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-lg"
            style={{ color: "#64748B", background: "#F8FAFC" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F1F5F9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}>✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* nguoi-gui */}
          {drawer.type === "nguoi-gui" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AiBadge type="AI ĐỐI CHIẾU" />
                <span className="text-xs" style={{ color: "#64748B" }}>Nguồn: DỮ LIỆU HỆ THỐNG</span>
              </div>
              <DrawerSection title="Thông tin AI xác định">
                <DrawerField label="Họ và tên" value="Nguyễn Văn A" />
                <DrawerField label="CCCD" value="079075012345" mono />
                <DrawerField label="Ngày sinh" value="1975" />
                <DrawerField label="Địa chỉ" value="45 Đường Lê Lợi, P.3, TP. XYZ" />
                <DrawerField label="Số điện thoại" value="09xx xxx xxx" />
                <DrawerField label="Độ tin cậy" value="92%" />
              </DrawerSection>
              <DrawerSection title="AI đã đối chiếu">
                <MatchFactor label="Họ tên khớp" />
                <MatchFactor label="CCCD khớp" />
                <MatchFactor label="Địa chỉ khớp" />
                <MatchFactor label="Số điện thoại khớp" />
              </DrawerSection>
              <DrawerSection title="Lịch sử trong hệ thống">
                <div className="text-sm mb-3" style={{ color: "#64748B" }}>2 lượt nhận trước đây</div>
                {[
                  { id: "LN-08/2026", date: "12/03/2026", nd: "Khiếu nại về bồi thường GPMB" },
                  { id: "LN-03/2024", date: "05/01/2024", nd: "Phản ánh liên quan Dự án X" },
                ].map((h) => (
                  <button key={h.id} onClick={() => onOpenDrawer({ type: "don-lien-quan" })}
                    className="w-full text-left rounded-xl border p-3 mb-2 transition-all"
                    style={{ borderColor: "#E2E8F0" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#C62828"; (e.currentTarget as HTMLElement).style.background = "#FFF5F5"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="mono text-sm font-bold" style={{ color: "#C62828" }}>{h.id}</span>
                      <span className="text-xs" style={{ color: "#94A3B8" }}>{h.date}</span>
                    </div>
                    <div className="text-xs" style={{ color: "#64748B" }}>{h.nd}</div>
                    <div className="text-xs mt-1" style={{ color: "#C62828" }}>Xem chi tiết đơn →</div>
                  </button>
                ))}
              </DrawerSection>
            </>
          )}

          {/* don-lien-quan */}
          {drawer.type === "don-lien-quan" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AiBadge type="AI TÌM KIẾM" />
                <span className="text-xs" style={{ color: "#64748B" }}>Nguồn: HỒ SƠ LIÊN QUAN</span>
              </div>
              <DrawerSection title="Thông tin đơn">
                <DrawerField label="Mã đơn" value="LN-08/2026" mono />
                <DrawerField label="Ngày nhận" value="12/03/2026" />
                <DrawerField label="Người gửi" value="Nguyễn Văn A" />
                <DrawerField label="Đối tượng" value="Công ty TNHH Xây dựng ABC" />
                <DrawerField label="Dự án" value="Khu dân cư X" />
                <DrawerField label="Nội dung chính" value="Khiếu nại mức bồi thường GPMB thấp hơn giá thị trường" />
                <DrawerField label="Yêu cầu" value="Xem xét lại giá bồi thường theo quyết định UBND" />
                <DrawerField label="Trạng thái" value="Đã giải quyết" />
                <DrawerField label="Đơn vị xử lý" value="Phòng Hành chính - Tổng hợp" />
              </DrawerSection>
              <DrawerSection title="AI phát hiện tương đồng">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl font-bold" style={{ color: "#C62828" }}>84%</div>
                  <div className="text-sm" style={{ color: "#64748B" }}>mức độ tương đồng với đơn hiện tại</div>
                </div>
                <MatchFactor label="Cùng người gửi" />
                <MatchFactor label="Cùng công ty bị khiếu nại" />
                <MatchFactor label="Cùng dự án" />
                <MatchFactor label="Cùng sự việc (GPMB)" />
                <MatchFactor label="Nội dung yêu cầu tương tự" />
                <button onClick={() => onOpenDrawer({ type: "so-sanh" })}
                  className="mt-3 w-full py-2.5 rounded-lg border text-sm font-medium transition-colors"
                  style={{ borderColor: "#C62828", color: "#C62828" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF5F5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  Xem nội dung so sánh →
                </button>
              </DrawerSection>
            </>
          )}

          {/* so-sanh */}
          {drawer.type === "so-sanh" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AiBadge type="AI PHÂN TÍCH" />
                <span className="text-xs" style={{ color: "#64748B" }}>Nguồn: HỒ SƠ HIỆN TẠI + D-2026-00341</span>
              </div>
              <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: "#E5E7EB" }}>
                <div className="grid grid-cols-[110px_1fr_1fr_64px] text-xs font-bold" style={{ background: "#F8FAFC", color: "#64748B" }}>
                  <div className="px-3 py-2">Trường</div>
                  <div className="px-3 py-2" style={{ borderLeft: "1px solid #F1F5F9" }}>Hồ sơ hiện tại</div>
                  <div className="px-3 py-2" style={{ borderLeft: "1px solid #F1F5F9" }}>D-2026-00341</div>
                  <div className="px-2 py-2 text-center" style={{ borderLeft: "1px solid #F1F5F9" }}></div>
                </div>
                {[
                  { field: "Người gửi", a: "Nguyễn Văn A", b: "Nguyễn Văn A", cmp: "match" },
                  { field: "Đối tượng", a: "Công ty ABC", b: "Công ty ABC", cmp: "match" },
                  { field: "Dự án", a: "Khu dân cư X", b: "Khu dân cư X", cmp: "match" },
                  { field: "Nội dung", a: "Bồi thường GPMB", b: "Bồi thường GPMB", cmp: "similar" },
                  { field: "Ngày làm đơn", a: "10/09/2026", b: "15/08/2026", cmp: "diff" },
                ].map((r, i, arr) => {
                  const mark = r.cmp === "match" ? { icon: "✓", label: "Trùng", color: "#15803D", bg: "#F0FDF4" }
                    : r.cmp === "similar" ? { icon: "≈", label: "Tương đồng", color: "#B45309", bg: "#FFFBEB" }
                      : { icon: "≠", label: "Khác", color: "#64748B", bg: "#F1F5F9" };
                  return (
                    <div key={r.field} className="grid grid-cols-[110px_1fr_1fr_64px] text-xs" style={{ borderTop: "1px solid #F1F5F9", background: i % 2 ? "#FCFDFE" : "#fff" }}>
                      <div className="px-3 py-2.5 font-medium" style={{ color: "#94A3B8" }}>{r.field}</div>
                      <div className="px-3 py-2.5" style={{ borderLeft: "1px solid #F1F5F9", color: "#0F172A" }}>{r.a}</div>
                      <div className="px-3 py-2.5" style={{ borderLeft: "1px solid #F1F5F9", color: "#0F172A" }}>{r.b}</div>
                      <div className="px-2 py-2.5 flex items-center justify-center" style={{ borderLeft: "1px solid #F1F5F9" }} title={mark.label}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{ background: mark.bg, color: mark.color }}>{mark.icon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl px-4 py-3 mb-2 flex items-center justify-between" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <span className="text-sm font-semibold" style={{ color: "#92400E" }}>Mức tương đồng nội dung</span>
                <span className="text-lg font-bold" style={{ color: "#B45309" }}>89%</span>
              </div>
              <p className="text-xs" style={{ color: "#94A3B8" }}>Kết quả so sánh mang tính tham khảo; cán bộ xác nhận hướng xử lý cuối cùng.</p>
            </>
          )}

          {/* rule */}
          {drawer.type === "rule" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide" style={{ background: "#FEE2E2", color: "#C62828" }}>RULE KIỂM TRA</span>
                <span className="mono text-xs font-bold" style={{ color: "#64748B" }}>R-CHECK-04</span>
              </div>
              <DrawerSection title="Điều kiện kích hoạt">
                <div className="rounded-xl border p-3 text-sm" style={{ borderColor: "#E5E7EB", background: "#F8FAFC", color: "#0F172A" }}>
                  Mức tương đồng nội dung <strong>&ge; 85%</strong> so với một đơn đã tiếp nhận.
                </div>
              </DrawerSection>
              <DrawerSection title="Dữ liệu thực tế">
                <DrawerField label="Đơn đối chiếu" value="D-2026-00341" mono />
                <DrawerField label="Mức tương đồng" value="89%" />
                <DrawerField label="Kết quả" value="Vượt ngưỡng kích hoạt" />
              </DrawerSection>
              <DrawerSection title="Kết quả quy tắc">
                <div className="rounded-xl p-3 text-sm" style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>
                  Yêu cầu kiểm tra kết quả xử lý đơn D-2026-00341 trước khi xác định hướng xử lý.
                </div>
              </DrawerSection>
              <p className="text-xs" style={{ color: "#94A3B8" }}>Quy tắc chỉ đưa ra cảnh báo kiểm tra, không tự quyết định hướng xử lý.</p>
            </>
          )}

          {/* knowledge */}
          {drawer.type === "knowledge" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{drawer.field || "Hướng dẫn nghiệp vụ"}</span>
              </div>
              <DrawerSection title="Nội dung căn cứ">
                <div className="rounded-xl border p-3 text-sm leading-relaxed" style={{ borderColor: "#E5E7EB", color: "#374151" }}>
                  Kiểm tra kết quả xử lý đơn trước khi xác định hướng xử lý đối với đơn có nội dung liên quan hoặc trùng lặp. Trường hợp cùng người gửi, cùng đối tượng và cùng vụ việc cần đối chiếu lịch sử xử lý để bảo đảm tính nhất quán.
                </div>
              </DrawerSection>
              <DrawerSection title="Nguồn">
                <DrawerField label="Tài liệu" value="Hướng dẫn nghiệp vụ tiếp nhận đơn" />
                <DrawerField label="Phạm vi" value="Đơn có nội dung liên quan / trùng lặp" />
              </DrawerSection>
            </>
          )}

          {/* vu-viec */}
          {drawer.type === "vu-viec" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AiBadge type="AI TÌM KIẾM" />
                <span className="text-xs" style={{ color: "#64748B" }}>Nguồn: DỮ LIỆU HỆ THỐNG</span>
              </div>
              <DrawerSection title="Thông tin vụ việc">
                <DrawerField label="Mã vụ việc" value="VV-04/2026" mono />
                <DrawerField label="Tên vụ việc" value="Tranh chấp GPMB Dự án Khu dân cư X" />
                <DrawerField label="Đơn vị xử lý" value="Đơn vị Y – Sở TN&MT" />
                <DrawerField label="Trạng thái" value="Đang xử lý" />
                <DrawerField label="Đối tượng" value="Công ty TNHH Xây dựng ABC" />
                <DrawerField label="Người liên quan" value="Nhiều hộ dân, trong đó có Nguyễn Văn A" />
                <DrawerField label="Ngày mở" value="01/04/2026" />
              </DrawerSection>
              <DrawerSection title="Vì sao AI xác định liên quan?">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl font-bold" style={{ color: "#6D28D9" }}>86%</div>
                  <div className="text-sm" style={{ color: "#64748B" }}>mức độ tương đồng</div>
                </div>
                <MatchFactor label="Cùng đối tượng (Công ty ABC)" />
                <MatchFactor label="Cùng dự án (KDC X)" />
                <MatchFactor label="Cùng địa điểm" />
                <MatchFactor label="Cùng sự việc (GPMB)" />
                <MatchFactor label="Nội dung tương đồng về ngữ nghĩa" />
              </DrawerSection>
            </>
          )}

          {/* trung-don */}
          {drawer.type === "trung-don" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AiBadge type="AI PHÂN TÍCH" />
                <span className="text-xs" style={{ color: "#64748B" }}>Nguồn: HỒ SƠ LIÊN QUAN</span>
              </div>
              <div className="rounded-xl p-4 mb-4 text-center" style={{ background: "#FFF5F5", border: "1px solid #FECACA" }}>
                <div className="text-4xl font-bold mb-1" style={{ color: "#C62828" }}>84%</div>
                <div className="text-sm font-semibold" style={{ color: "#C62828" }}>Khả năng trùng đơn</div>
                <div className="text-xs mt-1" style={{ color: "#94A3B8" }}>Với đơn LN-08/2026</div>
              </div>
              <DrawerSection title="AI phát hiện 4 yếu tố trùng">
                <MatchFactor label="Người gửi" />
                <MatchFactor label="Đối tượng bị khiếu nại" />
                <MatchFactor label="Sự việc" />
                <MatchFactor label="Nội dung yêu cầu" />
              </DrawerSection>
              <DrawerSection title="So sánh">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3" style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}>
                    <div className="text-xs font-bold mb-2" style={{ color: "#1E40AF" }}>ĐƠN HIỆN TẠI</div>
                    <div className="text-xs space-y-1" style={{ color: "#374151" }}>
                      <div>Nguyễn Văn A</div>
                      <div>Công ty TNHH XD ABC</div>
                      <div>Dự án KDC X</div>
                      <div>Bồi thường GPMB</div>
                    </div>
                  </div>
                  <div className="rounded-xl border p-3" style={{ borderColor: "#FECACA", background: "#FFF5F5" }}>
                    <div className="text-xs font-bold mb-2" style={{ color: "#C62828" }}>LN-08/2026</div>
                    <div className="text-xs space-y-1" style={{ color: "#374151" }}>
                      <div>Nguyễn Văn A</div>
                      <div>Công ty TNHH XD ABC</div>
                      <div>Dự án KDC X</div>
                      <div>Bồi thường GPMB</div>
                    </div>
                  </div>
                </div>
              </DrawerSection>
              <div className="rounded-xl p-3 mb-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <div className="text-sm font-semibold mb-1" style={{ color: "#92400E" }}>Kết luận của AI:</div>
                <div className="text-sm" style={{ color: "#92400E" }}>Có khả năng trùng với LN-08/2026.</div>
              </div>
            </>
          )}

          {/* mau-thuan */}
          {drawer.type === "mau-thuan" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AiBadge type="AI ĐỐI CHIẾU" />
                <span className="text-xs" style={{ color: "#64748B" }}>Nguồn: TÀI LIỆU ĐƠN + DỮ LIỆU HỆ THỐNG</span>
              </div>
              <DrawerSection title="Thông tin trong đơn">
                <div className="rounded-xl border p-3" style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}>
                  <div className="text-xs font-bold mb-1" style={{ color: "#1E40AF" }}>TÀI LIỆU ĐƠN · Trang 1</div>
                  <div className="text-sm">45 Đường Lê Lợi, Phường 3, TP. XYZ</div>
                </div>
              </DrawerSection>
              <DrawerSection title="Thông tin trong hồ sơ cũ">
                <div className="rounded-xl border p-3" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
                  <div className="text-xs font-bold mb-1" style={{ color: "#B45309" }}>HỒ SƠ LN-08/2026 · 12/03/2026</div>
                  <div className="text-sm">12 Đường Trần Phú, Phường 7, TP. XYZ</div>
                </div>
              </DrawerSection>
              <DrawerSection title="AI phát hiện">
                <div className="rounded-xl p-3" style={{ background: "#FFF5F5", border: "1px solid #FECACA" }}>
                  <div className="text-sm font-semibold mb-1" style={{ color: "#C62828" }}>Địa chỉ không trùng khớp</div>
                  <div className="text-sm mb-2" style={{ color: "#64748B" }}>Độ tin cậy phát hiện: <strong>91%</strong></div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* xem-nguon */}
          {drawer.type === "xem-nguon" && (() => {
            const field = drawer.field || "nguoi-gui";
            const src = sourceMap[field] || sourceMap["nguoi-gui"];
            return (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <AiBadge type="AI PHÂN TÍCH" />
                  <span className="text-xs" style={{ color: "#64748B" }}>Nguồn: TÀI LIỆU ĐƠN</span>
                </div>
                <DrawerSection title="Trường dữ liệu">
                  <div className="text-sm font-semibold">{src.field}</div>
                </DrawerSection>
                <DrawerSection title="Đoạn trích trong tài liệu">
                  <div className="rounded-xl border p-4" style={{ borderColor: "#BFDBFE", background: "#EFF6FF", fontFamily: "Georgia, serif", lineHeight: 1.8 }}>
                    <div className="text-sm italic" style={{ color: "#374151" }}>
                      "…{src.excerpt}…"
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "#94A3B8" }}>
                    <span>📄</span>
                    <span>{src.page}</span>
                  </div>
                </DrawerSection>
                <DrawerSection title="AI trích xuất">
                  <div className="rounded-xl border p-3" style={{ borderColor: "#D1FAE5", background: "#F0FDF4" }}>
                    <div className="text-sm font-medium" style={{ color: "#15803D" }}>{src.extract}</div>
                  </div>
                </DrawerSection>
              </>
            );
          })()}

        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={onClose} className="text-sm" style={{ color: "#64748B" }}>← Đóng</button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#C62828" }}>
            Xem hồ sơ đầy đủ ↗
          </button>
        </div>
      </div>
    </>
  );
}
export default Drawer;