import React, { useState } from 'react';
import EntityAvatar from "./EntityAvatar";
import SectionTitle from "./SectionTitle";
import { AIJob } from "../types";

function HieuDonSection({ job }: { job: AIJob }) {
  const visible = job >= 1;
  if (!visible) return null;
  const loading = job === 1;

  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const initialRows = [
    { key: "nguoiGui", label: "Người gửi", value: "Nguyễn Văn A", conf: "92%", confColor: "#15803D" },
    { key: "doiTuong", label: "Đối tượng bị khiếu nại", value: "Công ty TNHH Xây dựng ABC" },
    { key: "coQuan", label: "Cơ quan liên quan", value: "UBND tỉnh XYZ" },
    { key: "diaDiem", label: "Địa điểm / Dự án", value: "Dự án Khu dân cư X" },
    { key: "suViec", label: "Sự việc", value: "Khiếu nại về mức bồi thường GPMB" },
    { key: "yeuCau", label: "Yêu cầu", value: "Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND" },
    { key: "ngayLamDon", label: "Ngày làm đơn", value: "10/09/2026" },
  ];

  const [savedRows, setSavedRows] = useState(initialRows);
  const [rows, setRows] = useState(initialRows);
  const [savedLoaiDon, setSavedLoaiDon] = useState("Khiếu nại");
  const [loaiDon, setLoaiDon] = useState("Khiếu nại");
  const [savedCanCu, setSavedCanCu] = useState("Căn cứ Luật Khiếu nại 2011");
  const [canCu, setCanCu] = useState("Căn cứ Luật Khiếu nại 2011");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = () => {
    setSavedRows([...rows]);
    setSavedLoaiDon(loaiDon);
    setSavedCanCu(canCu);
    setIsEditing(false);
    showToast("✓ Đã lưu thay đổi thông tin trích xuất!");
  };

  const handleCancel = () => {
    setRows([...savedRows]);
    setLoaiDon(savedLoaiDon);
    setCanCu(savedCanCu);
    setIsEditing(false);
  };

  const handleUpdateValue = (key: string, newVal: string) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, value: newVal } : r))
    );
  };

  const currentNguoiGui = rows.find((r) => r.key === "nguoiGui")?.value || "Nguyễn Văn A";
  const currentDoiTuong = rows.find((r) => r.key === "doiTuong")?.value || "Cty TNHH Xây dựng ABC";
  const currentDiaDiem = rows.find((r) => r.key === "diaDiem")?.value || "Dự án Khu dân cư X";
  const currentCoQuan = rows.find((r) => r.key === "coQuan")?.value || "UBND tỉnh XYZ";

  return (
    <div className="space-y-4 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-medium border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SECTION TITLE & BADGE & CHỨC NĂNG CHỈNH SỬA */}
      <SectionTitle
        num={1}
        badge={
          loading ? (
            <span className="text-xs ai-pulse" style={{ color: "#B45309" }}>
              Đang đọc tài liệu…
            </span>
          ) : isEditing ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                Chỉnh sửa trực tiếp (Nhấp vào chữ để sửa)
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#004ac6] hover:bg-[#003ea8] text-white transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>Lưu</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
              >
                <span>Hủy</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: "#15803D" }}>
                ✓ Hoàn thành
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-[#004ac6] hover:text-[#003ea8] hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer shadow-2xs"
                title="Chỉnh sửa trực tiếp nội dung văn bản"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Chỉnh sửa</span>
              </button>
            </div>
          )
        }
      >
        Thông tin trích xuất từ đơn (AI)
      </SectionTitle>

      {loading ? (
        <div className="space-y-2">
          {["Đang nhận diện nội dung…", "Đang trích xuất thông tin…"].map((t) => (
            <div key={t} className="text-sm ai-pulse" style={{ color: "#B45309" }}>
              ● {t}
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 2-column layout: info rows + Loại đơn card */}
          <div className="flex gap-3">
            {/* Left: info rows - DẠNG TEXT CHỈNH SỬA TRỰC TIẾP KHÔNG DÙNG FORM */}
            <div
              className="flex-1 min-w-0 rounded-xl border overflow-hidden"
              style={{ borderColor: isEditing ? "#93C5FD" : "#E2E8F0" }}
            >
              {rows.map((f, i) => (
                <div
                  key={f.key}
                  className="flex items-start gap-2 px-3 py-2.5 transition-colors"
                  style={{
                    borderBottom: i < rows.length - 1 ? "1px solid #F1F5F9" : "none",
                    background: isEditing ? "#F8FAFC" : "#fff",
                  }}
                >
                  <span
                    className="text-xs flex-shrink-0 pt-0.5 select-none"
                    style={{ color: "#94A3B8", minWidth: 112 }}
                  >
                    {f.label}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                    {/* Hiển thị dạng text thuần - nhấp trực tiếp vào text để sửa nếu isEditing */}
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleUpdateValue(f.key, e.currentTarget.textContent || "")
                      }
                      className={`text-xs font-medium outline-none transition-all ${
                        isEditing
                          ? "bg-white text-slate-900 border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:bg-white focus:border-solid focus:border-[#004ac6] focus:ring-1 focus:ring-blue-300"
                          : "text-[#1A202C]"
                      }`}
                      title={isEditing ? "Nhấp vào chữ để sửa trực tiếp" : undefined}
                    >
                      {f.value}
                    </span>

                    {f.conf && (
                      <span
                        className="text-xs font-bold flex-shrink-0 px-1 py-0.5 rounded select-none"
                        style={{ background: "#F0FDF4", color: f.confColor }}
                      >
                        {f.conf}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Loại đơn card */}
            <div
              className="flex-shrink-0 w-36 rounded-xl border overflow-hidden flex flex-col"
              style={{ borderColor: "#BFDBFE" }}
            >
              <div
                className="px-3 py-2 border-b"
                style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: "#1E40AF", fontSize: 9 }}
                >
                  LOẠI ĐƠN
                </div>
              </div>
              <div className="flex-1 p-3 bg-white flex flex-col gap-2">
                <div
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => setLoaiDon(e.currentTarget.textContent || "")}
                  className={`text-base font-bold outline-none transition-all ${
                    isEditing
                      ? "border-b border-dashed border-[#004ac6] bg-blue-50/50 px-1 rounded cursor-text focus:bg-white"
                      : ""
                  }`}
                  style={{ color: "#1E40AF" }}
                  title={isEditing ? "Nhấp vào chữ để sửa loại đơn" : undefined}
                >
                  {loaiDon}
                </div>
                <div
                  className="text-xs px-1.5 py-0.5 rounded font-bold self-start select-none"
                  style={{ background: "#DBEAFE", color: "#1E40AF" }}
                >
                  82%
                </div>
                <div
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => setCanCu(e.currentTarget.textContent || "")}
                  className={`text-xs mt-auto outline-none transition-all ${
                    isEditing
                      ? "border-b border-dashed border-blue-400 bg-blue-50/50 px-1 rounded cursor-text focus:bg-white"
                      : ""
                  }`}
                  style={{ color: "#64748B", lineHeight: 1.4 }}
                  title={isEditing ? "Nhấp vào chữ để sửa căn cứ pháp lý" : undefined}
                >
                  {canCu}
                </div>
              </div>
            </div>
          </div>

          {/* Entity cards - Tự động cập nhật theo text đã sửa */}
          <div className="grid grid-cols-2 gap-3">
            {/* Người gửi */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div
                className="px-3 py-2 border-b flex items-center gap-1.5"
                style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: "#64748B", fontSize: 9 }}
                >
                  NGƯỜI GỬI ĐƠN
                </span>
                <span
                  className="ml-auto text-xs px-1 py-0.5 rounded font-bold"
                  style={{ background: "#F0FDF4", color: "#15803D" }}
                >
                  92%
                </span>
              </div>
              <div className="p-3 flex gap-2.5 bg-white">
                <EntityAvatar initials="NA" color="#1E40AF" />
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-bold" style={{ color: "#1A202C" }}>
                    {currentNguoiGui}
                  </div>
                  <div className="text-xs" style={{ color: "#64748B" }}>
                    CCCD: 079075012345
                  </div>
                  <div className="text-xs" style={{ color: "#64748B" }}>
                    45 Lê Lợi, P.3, TP. XYZ
                  </div>
                  <div className="text-xs" style={{ color: "#94A3B8" }}>
                    SĐT: chưa xác định
                  </div>
                </div>
              </div>
            </div>

            {/* Đối tượng bị khiếu nại */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div
                className="px-3 py-2 border-b flex items-center gap-1.5"
                style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: "#64748B", fontSize: 9 }}
                >
                  ĐỐI TƯỢNG BỊ KHIẾU NẠI
                </span>
              </div>
              <div className="p-3 flex gap-2.5 bg-white">
                <EntityAvatar initials="CT" color="#6D28D9" />
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-bold" style={{ color: "#1A202C" }}>
                    {currentDoiTuong}
                  </div>
                  <div className="text-xs" style={{ color: "#64748B" }}>
                    MST: 0123456789
                  </div>
                  <div className="text-xs" style={{ color: "#64748B" }}>
                    {currentDiaDiem}
                  </div>
                  <div className="text-xs" style={{ color: "#94A3B8" }}>
                    Cơ quan: {currentCoQuan}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HieuDonSection;