import React, { useState } from 'react';
function KiemTraThongTinSection({ onConfirm }: { onConfirm: () => void }) {
  type Field = { key: string; label: string; ai: string; type?: "select" | "text"; options?: string[] };
  const FIELDS: Field[] = [
    { key: "loai-don", label: "Loại đơn", ai: "Khiếu nại", type: "select", options: ["Khiếu nại", "Tố cáo", "Phản ánh kiến nghị", "Yêu cầu"] },
    { key: "nguoi-gui", label: "Người gửi", ai: "Nguyễn Văn A" },
    { key: "cccd", label: "CCCD / Mã định danh", ai: "079075012345" },
    { key: "doi-tuong", label: "Đối tượng bị khiếu nại", ai: "Công ty TNHH Xây dựng ABC" },
    { key: "co-quan", label: "Cơ quan liên quan", ai: "UBND tỉnh XYZ" },
    { key: "du-an", label: "Địa điểm / Dự án", ai: "Dự án Khu dân cư X" },
    { key: "su-viec", label: "Sự việc", ai: "Khiếu nại về mức bồi thường GPMB" },
    { key: "yeu-cau", label: "Yêu cầu", ai: "Xem xét lại mức bồi thường theo QĐ 45/2024/QĐ-UBND" },
    { key: "thoi-gian", label: "Ngày làm đơn", ai: "10/09/2026" },
  ];

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, f.ai]))
  );
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  const changed = (key: string) => values[key] !== FIELDS.find((f) => f.key === key)!.ai;

  return (
    <div className="rounded-xl border overflow-hidden slide-in" style={{ borderColor: "#BFDBFE" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#1E40AF" }}>KIỂM TRA THÔNG TIN TRƯỚC KHI TIẾP NHẬN</div>
          <div className="text-xs mt-0.5" style={{ color: "#3B82F6" }}>AI đã trích xuất thông tin bên dưới — xem lại và chỉnh sửa nếu cần trước khi tiếp nhận chính thức</div>
        </div>
      </div>

      {/* Field rows */}
      <div className="bg-white">
        {FIELDS.map((f, i) => {
          const isEditing = editing[f.key];
          const isChanged = changed(f.key);
          return (
            <div key={f.key} className="group px-4 py-3 flex items-start gap-3"
              style={{ borderBottom: i < FIELDS.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              {/* Label */}
              <span className="flex-shrink-0 text-xs pt-1.5" style={{ color: "#94A3B8", minWidth: 168 }}>{f.label}</span>

              {/* Value or input */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  f.type === "select" ? (
                    <select
                      autoFocus
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: "#BFDBFE", background: "#fff" }}
                      value={values[f.key]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}>
                      {f.options!.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      autoFocus
                      className="w-full px-2 py-1 rounded border text-sm"
                      style={{ borderColor: "#BFDBFE", background: "#fff" }}
                      value={values[f.key]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      onBlur={() => setEditing((s) => ({ ...s, [f.key]: false }))}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditing((s) => ({ ...s, [f.key]: false })); }}
                    />
                  )
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className="text-sm font-medium" style={{ color: isChanged ? "#1E40AF" : "#1A202C" }}>
                      {values[f.key]}
                    </span>
                    {isChanged && (
                      <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-semibold" style={{ background: "#DBEAFE", color: "#1E40AF" }}>Đã chỉnh sửa</span>
                    )}
                    {!isChanged && (
                      <span className="text-xs flex-shrink-0" style={{ color: "#CBD5E1" }}>AI · {f.key === "loai-don" ? "82%" : f.key === "nguoi-gui" ? "92%" : "–"}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Edit / Done button */}
              <div className="flex-shrink-0">
                {isEditing ? (
                  <button
                    className="text-xs px-2 py-1 rounded font-semibold"
                    style={{ background: "#1E40AF", color: "#fff" }}
                    onMouseDown={() => setEditing((s) => ({ ...s, [f.key]: false }))}>
                    Lưu
                  </button>
                ) : (
                  <button
                    className="text-xs px-2 py-1 rounded border opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: "#E2E8F0", color: "#64748B" }}
                    onClick={() => setEditing((s) => ({ ...s, [f.key]: true }))}>
                    Sửa
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex items-center justify-between gap-3" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
        <span className="text-xs" style={{ color: "#94A3B8" }}>
          {Object.keys(values).filter(changed).length > 0
            ? `${Object.keys(values).filter(changed).length} trường đã chỉnh sửa`
            : "Thông tin khớp với tài liệu gốc"}
        </span>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded text-sm font-bold text-white"
          style={{ background: "#1E40AF" }}>
          Xác nhận thông tin & xem đề xuất →
        </button>
      </div>
    </div>
  );
}
export default KiemTraThongTinSection;