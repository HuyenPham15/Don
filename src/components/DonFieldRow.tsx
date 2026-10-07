import React from 'react';
import { DonField } from "../types";
function DonFieldRow({ field, editing, value, changed, onChange, onHighlight }: {
  field: DonField; editing: boolean; value: string; changed: boolean; onChange: (v: string) => void; onHighlight: (k: string) => void;
}) {
  const empty = value.trim() === "";
  const inputStyle = { borderColor: "#CBD5E1" } as React.CSSProperties;
  const inputCls = "w-full px-3 py-1.5 rounded-lg border text-[13.5px] font-normal text-slate-800 placeholder:text-slate-400 placeholder:text-[12.5px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[12.5px] font-semibold text-slate-700">{field.label}</span>
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
        <div className="text-[13px] italic px-2.5 py-1.5 rounded-lg" style={{ color: "#94A3B8", background: "#F8FAFC", border: "1px dashed #E2E8F0" }}>Chưa xác định</div>
      ) : (
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-[13.5px] font-medium text-slate-900">{value}</span>
          {changed ? (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 bg-blue-50 text-blue-700 border border-blue-200" title={`Giá trị AI ban đầu: ${field.ai}`}>Đã chỉnh sửa</span>
          ) : field.needsCheck ? (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 bg-amber-50 text-amber-800 border border-amber-200">Cần kiểm tra</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
export default DonFieldRow;