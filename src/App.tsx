import { useState, useEffect, useCallback, useRef } from "react";
import Placeholder from "./components/Placeholder";
import Sidebar from "./components/Sidebar";
import BanPhanTich from "./screens/BanPhanTich";
import CongViecCuaToi from "./screens/CongViecCuaToi";
import DonTiepNhan from "./screens/DonTiepNhan";
import NhanDonList from "./screens/NhanDonList";
import NhanDonThem from "./screens/NhanDonThem";

// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Demo data ────────────────────────────────────────────────────────────────
// ─── Layout shell ─────────────────────────────────────────────────────────────
// ─── Screen 1: Kanban ─────────────────────────────────────────────────────────
// ─── Screen 2: Danh sách lượt nhận ───────────────────────────────────────────
// ─── Screen 3: Thêm mới tiếp nhận ───────────────────────────────────────────
// ─── Form micro-components ────────────────────────────────────────────────────
// ─── Side Drawer ──────────────────────────────────────────────────────────────
// ─── Screen 4: Bàn phân tích đơn (HERO SCREEN) ───────────────────────────────

// ── Hồ sơ trích xuất — field model ───────────────────────────────────────────
// ── Screen 4: Bàn phân tích đơn (redesigned right panel) ─────────────────────
// ── AI analyzing / done header ───────────────────────────────────────────────
// ── Collapsible panel section ────────────────────────────────────────────────
// ── S1: Thông tin đơn (read-only ↔ edit) ─────────────────────────────────────
// ── S2 (HỢP NHẤT BƯỚC 2 + 3 + 4): Tra cứu, Phân tích đơn liên quan & Đề xuất xử lý ──
// ── S3: Thông tin xử lý ──────────────────────────────────────────────────────
// ─── Section header ───────────────────────────────────────────────────────────
// ─── Kiểm tra & chỉnh sửa thông tin trước khi tiếp nhận ──────────────────────
// ─── S1: AI đã hiểu đơn ──────────────────────────────────────────────────────
// ─── S2: AI tìm thấy ─────────────────────────────────────────────────────────
// ─── S3: Thông tin cần xác minh ──────────────────────────────────────────────
// ─── S4: AI đề xuất hướng xử lý ──────────────────────────────────────────────
// ─── S5: Xác nhận của cán bộ ─────────────────────────────────────────────────
// ─── Post-confirm state ────────────────────────────────────────────────────────
// ─── AI Pipeline strip ────────────────────────────────────────────────────────
// ─── AI Tra cứu summary (center col) ─────────────────────────────────────────
// ─── AI Đề xuất hướng xử lý (right col hero) ─────────────────────────────────
// ─── Xác nhận của cán bộ card ─────────────────────────────────────────────────
// ─── Quy trình đang thực hiện (post-confirm) ──────────────────────────────────
// ─── Công việc hiện tại (post-confirm) ───────────────────────────────────────
// ─── Job cards ────────────────────────────────────────────────────────────────
// ─── PDF pane ─────────────────────────────────────────────────────────────────
// ─── Screen 5: Đơn tiếp nhận ─────────────────────────────────────────────────
// ─── Placeholder ─────────────────────────────────────────────────────────────
// ─── Icons ────────────────────────────────────────────────────────────────────
// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("cong-viec");
  const [selected, setSelected] = useState<LuotNhan>(LN19);
  const [extraCard, setExtraCard] = useState<LuotNhan | null>(null);

  const handleSubmit = useCallback(() => {
    setExtraCard({ id: "LN-20/2026-GOVEX_HC", ngayNhan: "16/09/2026", nguoiNop: "Người vừa nộp", hinhThuc: "Trực tiếp", noiDung: "Đơn vừa được chuyển tiếp, AI đang phân tích", donVi: "Phòng Hành chính - Tổng hợp", aiJob: 1 });
    setScreen("cong-viec");
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F5F6F8" }}>
      <Sidebar screen={screen} onNav={setScreen} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {screen === "cong-viec" && <CongViecCuaToi onSelect={setSelected} onNav={setScreen} extraCard={extraCard} />}
        {screen === "nhan-don-list" && <NhanDonList onNav={setScreen} onSelect={setSelected} />}
        {screen === "nhan-don-them" && <NhanDonThem onNav={setScreen} onSubmit={handleSubmit} />}
        {screen === "ban-phan-tich" && <BanPhanTich luotNhan={selected} onNav={setScreen} />}
        {screen === "don-tiep-nhan" && <DonTiepNhan onNav={setScreen} />}
        {screen === "thu-vien" && <Placeholder title="Thư viện pháp luật" />}
        {screen === "bao-cao" && <Placeholder title="Báo cáo thông minh" />}
      </main>
    </div>
  );
}
