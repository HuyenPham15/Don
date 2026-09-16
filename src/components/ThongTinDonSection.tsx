import React, { useState } from 'react';
import DonFieldRow from "./DonFieldRow";
import PanelSection from "./PanelSection";
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
    <PanelSection index={1} title="Thông tin trích xuất từ hồ sơ" right={
      !editing ? (
        <button onClick={startEdit} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex-shrink-0" style={{ borderColor: "#DBEAFE", color: "#1D4ED8", background: "#EFF6FF" }}>Chỉnh sửa</button>
      ) : undefined
    }>
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

      {/* Tóm tắt AI */}
      <div className="mt-5 rounded-xl p-3.5" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <SparkleIcon color="#1D4ED8" />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#1D4ED8" }}>Tóm tắt của AI</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{AI_SUMMARY}</p>
      </div>

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