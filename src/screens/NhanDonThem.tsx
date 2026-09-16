import React, { useState } from 'react';
import FieldLabel from "../components/FieldLabel";
import OptTag from "../components/OptTag";
import ReadonlyField from "../components/ReadonlyField";
import SectionCard from "../components/SectionCard";
import { UploadedFile, Screen } from "../types";
import { IcoFilePdf, IcoArrowRight, IcoInfo, IcoScan } from "../components/icons";
function NhanDonThem({ onNav, onSubmit }: { onNav: (s: Screen) => void; onSubmit: () => void }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [tucach, setTucach] = useState<"ca-nhan" | "to-chuc" | "dai-dien">("ca-nhan");

  const addRawFiles = (list: FileList | null, cat: UploadedFile["category"] = "main") => {
    if (!list) return;
    Array.from(list).forEach((f) => {
      const kb = f.size / 1024;
      const size = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
      setFiles((p) => [...p, { name: f.name, size, category: p.length === 0 ? "main" : cat }]);
    });
  };

  const setCat = (i: number, cat: UploadedFile["category"]) =>
    setFiles((p) => p.map((f, j) => j === i ? { ...f, category: cat } : f));

  const handleForward = () => {
    setShowToast(true);
    setTimeout(() => { setShowToast(false); onSubmit(); }, 3000);
  };

  const catLabel: Record<UploadedFile["category"], string> = {
    main: "Tài liệu chính",
    attach: "Tài liệu kèm theo",
    extra: "Tài liệu bổ sung",
  };
  const catColor: Record<UploadedFile["category"], { bg: string; c: string }> = {
    main: { bg: "#EFF6FF", c: "#1E40AF" },
    attach: { bg: "#F5F3FF", c: "#6D28D9" },
    extra: { bg: "#F8FAFC", c: "#475569" },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 w-88 slide-in" style={{ maxWidth: 360 }}>
          <div className="rounded-xl shadow-xl p-4" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
            <div className="flex gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F0FDF4" }}>
                <span style={{ color: "#15803D", fontSize: 16 }}>✓</span>
              </div>
              <div>
                <div className="font-semibold text-sm">Đã chuyển lượt nhận LN-20/2026-GOVEX_HC.</div>
                <div className="text-sm mt-1" style={{ color: "#64748B" }}>AI đang tự động phân tích đơn. Bạn có thể theo dõi tiến trình tại <strong>Công việc của tôi</strong>.</div>
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
              <div className="h-full rounded-full" style={{ background: "#15803D", width: "100%", animation: "slide-in 3s linear" }} />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b px-6 py-5 flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>
        <button onClick={() => onNav("nhan-don-list")} className="flex items-center gap-1.5 text-sm mb-3 transition-colors" style={{ color: "#64748B" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C62828"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748B"; }}>
          ← Quay lại
        </button>
        <h1 className="text-xl font-bold tracking-tight">Thêm mới tiếp nhận</h1>
        <p className="text-sm mt-1" style={{ color: "#64748B", maxWidth: 560 }}>
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#F5F6F8" }}>
        <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">

          {/* 01 · Thông tin tiếp nhận */}
          <SectionCard num="01" title="Thông tin tiếp nhận">
            {/* Auto-filled fields — compact read-only row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ReadonlyField label="Mã lượt nhận" value="LN-20/2026-GOVEX_HC" mono />
              <ReadonlyField label="Người tiếp nhận" value="Nguyễn Minh Anh" />
              <ReadonlyField label="Đơn vị tiếp nhận" value="Phòng Hành chính - Tổng hợp" />
              <ReadonlyField label="Ngày nhận" value="16/09/2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Hình thức nhận</FieldLabel>
                <select className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option>Trực tiếp</option>
                  <option>Bưu điện</option>
                  <option>Trực tuyến</option>
                  <option>Fax</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* 02 · Người nộp đơn */}
          <SectionCard num="02" title="Người nộp đơn">
            {/* Tư cách */}
            <div className="mb-4">
              <FieldLabel>Tư cách người nộp</FieldLabel>
              <div className="flex gap-2">
                {([["ca-nhan", "Cá nhân"], ["to-chuc", "Tổ chức"], ["dai-dien", "Đại diện"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setTucach(v)}
                    className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                    style={{
                      borderColor: tucach === v ? "#C62828" : "#E2E8F0",
                      background: tucach === v ? "#FFF5F5" : "#fff",
                      color: tucach === v ? "#C62828" : "#475569",
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FieldLabel>{tucach === "to-chuc" ? "Tên tổ chức" : "Họ và tên"}</FieldLabel>
                <input className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }}
                  placeholder={tucach === "to-chuc" ? "Tên tổ chức / doanh nghiệp" : "Họ và tên người nộp đơn"} />
              </div>
              <div>
                <FieldLabel>CCCD / Mã định danh <OptTag /></FieldLabel>
                <input className="w-full px-3 py-2 rounded-lg border text-sm mono" style={{ borderColor: "#E2E8F0" }} placeholder="Nếu có" />
              </div>
              <div>
                <FieldLabel>Số điện thoại <OptTag /></FieldLabel>
                <input className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Nếu có" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Địa chỉ <OptTag /></FieldLabel>
                <input className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Thường trú hoặc địa chỉ liên hệ" />
              </div>
              {tucach === "ca-nhan" && (
                <div>
                  <FieldLabel>Ngày sinh <OptTag /></FieldLabel>
                  <input type="date" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }} />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <span className="flex-shrink-0 mt-0.5" style={{ color: "#94A3B8" }}><IcoInfo /></span>
              <p className="text-xs" style={{ color: "#64748B" }}>
                Thông tin chưa có sẽ được AI hỗ trợ xác định từ tài liệu và dữ liệu hiện có.
              </p>
            </div>
          </SectionCard>

          {/* 03 · Thông tin ban đầu */}
          <SectionCard num="03" title="Thông tin ban đầu">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FieldLabel>Tên đơn / Tiêu đề <OptTag /></FieldLabel>
                  <input className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }}
                    placeholder="VD: Đơn khiếu nại về bồi thường GPMB..." />
                </div>
                <div>
                  <FieldLabel>Ngày làm đơn <OptTag /></FieldLabel>
                  <input type="date" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }} />
                </div>
              </div>
              <div>
                <FieldLabel>Nội dung ban đầu <OptTag /></FieldLabel>
                <textarea className="w-full px-3 py-2.5 rounded-lg border text-sm resize-none" style={{ borderColor: "#E2E8F0" }} rows={4}
                  placeholder="Mô tả sơ bộ nội dung đơn nếu đã biết. AI sẽ đọc và phân tích chi tiết từ tài liệu đính kèm — không bắt buộc phải điền đầy đủ." />
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <span className="flex-shrink-0 mt-0.5" style={{ color: "#94A3B8" }}><IcoInfo /></span>
              <p className="text-xs" style={{ color: "#64748B" }}>
              </p>
            </div>
          </SectionCard>

          {/* 04 · Tài liệu gốc */}
          <SectionCard num="04" title="Tài liệu gốc">
            {/* Drop zone */}
            <div
              className="rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer mb-4"
              style={{ borderColor: dragging ? "#C62828" : "#CBD5E1", background: dragging ? "#FFF5F5" : "#FAFAFA" }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addRawFiles(e.dataTransfer.files); }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors"
                style={{ background: dragging ? "#FEE2E2" : "#F1F5F9" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#C62828" : "#94A3B8"} strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <div className="text-base font-semibold mb-1" style={{ color: dragging ? "#C62828" : "#1A202C" }}>
                {dragging ? "Thả tài liệu vào đây" : "Kéo thả tài liệu vào đây"}
              </div>
              <div className="text-sm mb-4" style={{ color: "#94A3B8" }}>hoặc</div>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer text-white transition-colors"
                style={{ background: "#C62828" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#B71C1C"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#C62828"; }}>
                <span>+</span> Chọn tài liệu
                <input type="file" className="hidden" multiple accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff"
                  onChange={(e) => addRawFiles(e.target.files)} />
              </label>
              <div className="flex items-center justify-center gap-3 mt-4">
                {["PDF", "DOCX", "JPG", "PNG"].map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded font-mono font-medium" style={{ background: "#F1F5F9", color: "#64748B" }}>{t}</span>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>Tối đa 20MB · Tài liệu scan sẽ được OCR tự động</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2 mb-4">
                {files.map((f, i) => {
                  const cc = catColor[f.category];
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: "#E2E8F0", background: "#fff" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
                        <IcoFilePdf />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">📄 {f.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{f.size} · <span style={{ color: "#15803D" }}>✓ Đã tải lên</span></div>
                      </div>
                      <select
                        value={f.category}
                        onChange={(e) => setCat(i, e.target.value as UploadedFile["category"])}
                        className="text-xs rounded-lg px-2 py-1.5 border font-medium"
                        style={{ borderColor: cc.c + "40", background: cc.bg, color: cc.c }}>
                        <option value="main">Tài liệu chính</option>
                        <option value="attach">Tài liệu kèm theo</option>
                        <option value="extra">Tài liệu bổ sung</option>
                      </select>
                      <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ color: "#94A3B8", background: "#F8FAFC" }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                <IcoScan /> Quét tài liệu
              </button>
              <span className="text-xs" style={{ color: "#94A3B8" }}>Sử dụng máy scan kết nối hệ thống</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "#64748B" }}>
              <IcoInfo />
              AI sẽ đọc và phân tích tài liệu sau khi bạn chuyển tiếp.
            </div>
          </SectionCard>


        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="bg-white border-t flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderColor: "#E2E8F0" }}>
        <div className="text-xs" style={{ color: "#94A3B8" }}>
          Không có trường bắt buộc — chỉ cần tài liệu là đủ để AI bắt đầu phân tích.
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNav("nhan-don-list")} className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Hủy</button>
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors" style={{ borderColor: "#E2E8F0", color: "#1A202C" }}>Lưu nháp</button>
          <button onClick={handleForward}
            className="px-7 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2 transition-colors"
            style={{ background: "#C62828" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#B71C1C"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#C62828"; }}>
            CHUYỂN TIẾP <IcoArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
export default NhanDonThem;