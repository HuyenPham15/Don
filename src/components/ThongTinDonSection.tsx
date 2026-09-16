import React, { useState } from 'react';
import DonFieldRow from "./DonFieldRow";
import PanelSection from "./PanelSection";
import { DON_FIELDS, AI_SUMMARY } from "../constants";
import { DonField } from "../types";
import { SparkleIcon } from "./icons";
function ThongTinDonSection({ checked, onToggle, onHighlight }: {
  checked: boolean; onToggle: (v: boolean) => void; onHighlight: (k: string) => void;
}) {
  const initial = Object.fromEntries(DON_FIELDS.map((f) => [f.key, f.ai ?? ""]));
  const [saved, setSaved] = useState<Record<string, string>>(initial);
  const [draft, setDraft] = useState<Record<string, string>>(initial);
  const [editing, setEditing] = useState(false);

  const startEdit = () => { setDraft(saved); setEditing(true); };
  const cancel = () => { setDraft(saved); setEditing(false); };
  const save = () => { setSaved(draft); setEditing(false); };
  const isChanged = (f: DonField) => saved[f.key] !== (f.ai ?? "");

  return (
    <PanelSection index={1} title="Thông tin trích xuất từ hồ sơ (AI)" right={
      !editing ? (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Đã hoàn thành
          </span>
          <button onClick={startEdit} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex-shrink-0 transition-colors hover:bg-blue-100" style={{ borderColor: "#DBEAFE", color: "#1D4ED8", background: "#EFF6FF" }}>Chỉnh sửa</button>
        </div>
      ) : undefined
    }>
      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-2 py-3">
          {/* Người gửi */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border flex items-center justify-center flex-shrink-0 text-blue-600" style={{ borderColor: "#DBEAFE" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Người gửi</div>
              <div className="text-sm font-bold text-slate-800">{saved["nguoi-gui"]}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed space-y-0.5">
                <div>Sinh năm: {saved["ngay-sinh"] || "---"} | CCCD: {saved["cccd"] || "---"}</div>
                <div>SĐT: {saved["sdt"] || "---"}</div>
                <div>Địa chỉ: {saved["dia-chi"] || "---"}</div>
              </div>
            </div>
          </div>

          {/* Loại nội dung */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border flex items-center justify-center flex-shrink-0 text-blue-600" style={{ borderColor: "#DBEAFE" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Loại nội dung</div>
              <div className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>
                {saved["loai-don-du-kien"]}
              </div>
              <div className="text-xs text-slate-600 mt-1 leading-relaxed">Có dấu hiệu: {saved["noi-dung"]}</div>
            </div>
          </div>

          {/* Đối tượng bị khiếu nại/tố cáo */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 border flex items-center justify-center flex-shrink-0 text-purple-600" style={{ borderColor: "#E9D5FF" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Đối tượng bị khiếu nại / tố cáo / liên quan</div>
              <div className="text-sm font-bold text-slate-800">{saved["doi-tuong"]}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed space-y-0.5">
                <div>Cơ quan liên quan: {saved["co-quan"] || "---"}</div>
              </div>
            </div>
          </div>

          {/* Thời gian sự việc */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border flex items-center justify-center flex-shrink-0 text-blue-600" style={{ borderColor: "#DBEAFE" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Thời gian sự việc</div>
              <div className="text-sm font-medium text-slate-700">{saved["thoi-gian"]}</div>
            </div>
          </div>

          {/* Địa điểm */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 border flex items-center justify-center flex-shrink-0 text-red-500" style={{ borderColor: "#FECACA" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Địa điểm, dự án, sự việc</div>
              <div className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>
                {saved["du-an"]}
              </div>
              <div className="text-xs text-slate-600 mt-1">{saved["dia-diem"]}</div>
            </div>
          </div>

          {/* Yêu cầu */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border flex items-center justify-center flex-shrink-0 text-emerald-600" style={{ borderColor: "#D1FAE5" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-0.5">Yêu cầu của người gửi</div>
              <ul className="text-sm text-slate-700 list-disc pl-4 space-y-1 mt-0.5 marker:text-emerald-500">
                {saved["yeu-cau"].split("\n").map((line, idx) => (
                  <li key={idx}>{line.replace(/^-\s*/, '')}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {DON_FIELDS.map((f) => (
            <div key={f.key} className={f.full ? "col-span-2" : ""}>
              <DonFieldRow
                field={f} editing={editing}
                value={editing ? draft[f.key] : saved[f.key]}
                changed={isChanged(f)}
                onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                onHighlight={onHighlight}
              />
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <div className="mt-5 pt-4 border-t flex items-center justify-end gap-2" style={{ borderColor: "#F1F5F9" }}>
          <button onClick={cancel} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Hủy</button>
          <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#1D4ED8" }}>Lưu thay đổi</button>
        </div>
      ) : null}
    </PanelSection>
  );
}
export default ThongTinDonSection;