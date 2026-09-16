import React from 'react';
function DonFieldRow({ field, editing, value, changed, onChange, onHighlight }: {
  field: DonField; editing: boolean; value: string; changed: boolean; onChange: (v: string) => void; onHighlight: (k: string) => void;
}) {
  const empty = value.trim() === "";
  const inputStyle = { borderColor: "#D1D9E3" } as React.CSSProperties;
  const inputCls = "w-full px-2.5 py-1.5 rounded-lg border text-sm";

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>{field.label}</span>
        {field.hlKey && !editing && !empty && (
          <button onClick={() => onHighlight(field.hlKey!)} className="text-xs flex items-center gap-0.5" style={{ color: "#1D4ED8" }} title="Xem nguồn trong tài liệu">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>
          </button>
        )}
      </div>

      {editing ? (
        field.type === "textarea" ? (
          <textarea rows={2} className={inputCls + " resize-none"} style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : field.type === "select" ? (
          <select className={inputCls} style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
            {field.options!.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input className={inputCls} style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Nhập thông tin" />
        )
      ) : empty ? (
        <div className="text-sm italic px-2.5 py-1.5 rounded-lg" style={{ color: "#94A3B8", background: "#F8FAFC", border: "1px dashed #E2E8F0" }}>Chưa xác định</div>
      ) : (
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-sm font-medium" style={{ color: "#0F172A" }}>{value}</span>
          {changed ? (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "#DBEAFE", color: "#1D4ED8" }} title={`Giá trị AI ban đầu: ${field.ai}`}>Đã chỉnh sửa</span>
          ) : field.needsCheck ? (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "#FFFBEB", color: "#B45309" }}>Cần kiểm tra</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
export default DonFieldRow;