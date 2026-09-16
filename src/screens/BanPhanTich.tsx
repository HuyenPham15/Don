import React, { useEffect, useRef, useState } from 'react';
import AiAnalyzingHeader from "../components/AiAnalyzingHeader";
import AIStatusBadge from "../components/AIStatusBadge";
import DaXacNhanSection from "../components/DaXacNhanSection";
import Drawer from "../components/Drawer";
import PdfPane from "../components/PdfPane";
import StepAnalyzingCard from "../components/StepAnalyzingCard";
import ThongTinDonSection from "../components/ThongTinDonSection";
import ThongTinXuLySection from "../components/ThongTinXuLySection";
import TraCuuVaPhanTichSection from "../components/TraCuuVaPhanTichSection";
function BanPhanTich({ luotNhan, onNav }: { luotNhan: LuotNhan; onNav: (s: Screen) => void }) {
  const [job, setJob] = useState<AIJob>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [acks, setAcks] = useState<Acks>({ info: false, traCuu: false });
  const [huong, setHuong] = useState<string>("");
  const [donViXL, setDonViXL] = useState<string>("");
  const [sourceHighlight, setSourceHighlight] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [splitPct, setSplitPct] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      if (pct >= 25 && pct <= 75) {
        setSplitPct(Math.round(pct));
      }
    };
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (job >= 3) return;
    const t = setInterval(() => setJob((p) => Math.min(3, p + 1) as AIJob), 1600);
    return () => clearInterval(t);
  }, [job]);

  const done = job >= 3;
  const openDrawer = (d: DrawerState) => setDrawer(d);
  const closeDrawer = () => setDrawer(null);
  const setAck = (k: keyof Acks, v: boolean) => setAcks((a) => ({ ...a, [k]: v }));

  const reviewCount = [acks.info, acks.traCuu, huong !== ""].filter(Boolean).length;
  const needsDonVi = ["chuyen-tiep-nhan", "chuyen-tham-quyen", "gan-hien-co"].includes(huong);
  const canProceed = done && huong !== "" && acks.traCuu && (!needsDonVi || donViXL !== "");

  const handleRerun = () => {
    setJob(1);
    setConfirmed(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b flex items-center justify-between px-5 py-3" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNav("nhan-don-list")} className="text-sm flex items-center gap-1" style={{ color: "#64748B" }}>← Quay lại</button>
          <div className="w-px h-4" style={{ background: "#E2E8F0" }} />
          <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#94A3B8" }}>AI HỖ TRỢ PHÂN TÍCH HỒ SƠ</span>
          <span className="mono text-sm font-bold" style={{ color: "#C62828" }}>{luotNhan.id}</span>
          <AIStatusBadge job={job} confirmed={confirmed} />
        </div>

        {/* Split screen ratio selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>Chia màn hình:</span>
          <div className="flex items-center rounded-lg border p-0.5" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
            <button
              onClick={() => setSplitPct(35)}
              className={`px-2 py-1 text-xs rounded font-medium transition-all ${splitPct === 35 ? "bg-white shadow-xs font-bold text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
              title="Tài liệu 35% · AI 65%">
              35 : 65
            </button>
            <button
              onClick={() => setSplitPct(50)}
              className={`px-2 py-1 text-xs rounded font-medium transition-all ${splitPct === 50 ? "bg-white shadow-xs font-bold text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
              title="Cân đối 50% · 50%">
              50 : 50 (Cân đối)
            </button>
            <button
              onClick={() => setSplitPct(65)}
              className={`px-2 py-1 text-xs rounded font-medium transition-all ${splitPct === 65 ? "bg-white shadow-xs font-bold text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
              title="Tài liệu 65% · AI 35%">
              65 : 35
            </button>
          </div>
        </div>
      </div>

      {/* 2-column workspace */}
      <div ref={containerRef} className="flex flex-1 min-h-0 relative overflow-hidden select-none">
        {/* LEFT: Tài liệu gốc */}
        <div style={{ width: `${splitPct}%` }} className="h-full flex flex-col flex-shrink-0 min-w-0 overflow-hidden">
          <PdfPane highlight={sourceHighlight} onClearHighlight={() => setSourceHighlight(null)} onHighlight={setSourceHighlight} />
        </div>

        {/* Thanh kéo điều chỉnh tỉ lệ giữa 2 màn hình */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className={`w-2 hover:w-2.5 transition-all cursor-col-resize flex items-center justify-center relative z-20 flex-shrink-0 ${isDragging ? "bg-blue-600 shadow-lg" : "bg-slate-200 hover:bg-blue-400"
            }`}
          title="Kéo sang trái hoặc phải để tùy chỉnh độ rộng màn hình tài liệu / AI">
          <div className="w-3.5 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center pointer-events-none" style={{ borderColor: "#CBD5E1" }}>
            <div className="flex flex-col gap-0.5">
              <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
              <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
              <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
            </div>
          </div>
        </div>

        {/* RIGHT: AI phân tích */}
        <div style={{ width: `${100 - splitPct}%` }} className="h-full flex-1 min-w-0 flex flex-col overflow-hidden" style={{ background: "#F8FAFC" }}>
          <div className="flex-1 overflow-y-auto">
            {confirmed ? (
              <div className="px-6 py-5"><DaXacNhanSection onNav={onNav} /></div>
            ) : (
              <>
                <AiAnalyzingHeader job={job} onSelectStep={setJob} onRerun={handleRerun} />
                <div className="px-6 py-6 space-y-6">
                  {/* Bước 1: Trích xuất thông tin hồ sơ */}
                  {job >= 1 && (
                    <div className="slide-in">
                      <ThongTinDonSection checked={acks.info} onToggle={(v) => setAck("info", v)} onHighlight={setSourceHighlight} />
                    </div>
                  )}

                  {/* Bước 2: GỘP BƯỚC 2, 3, 4 - Tra cứu hệ thống, Phân tích đơn liên quan & Đề xuất xử lý */}
                  {job >= 2 && (
                    <div className="slide-in">
                      <TraCuuVaPhanTichSection
                        onOpen={openDrawer}
                        checked={acks.traCuu}
                        onToggle={(v) => setAck("traCuu", v)}
                        onApplyHuong={(h) => setHuong(h)}
                      />
                    </div>
                  )}

                  {/* Bước 3: Xác định hướng xử lý */}
                  {job >= 3 && (
                    <div className="slide-in">
                      <ThongTinXuLySection huong={huong} setHuong={setHuong} donVi={donViXL} setDonVi={setDonViXL} />
                    </div>
                  )}

                  {/* Card thông báo bước đang xử lý tiếp theo */}
                  {!done && (
                    <StepAnalyzingCard nextJob={job + 1} />
                  )}
                </div>
              </>
            )}
          </div>


        </div>
      </div>

      {drawer && <Drawer drawer={drawer} onClose={closeDrawer} onOpenDrawer={openDrawer} />}
    </div>
  );
}
export default BanPhanTich;