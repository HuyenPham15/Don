// src/screens/workflowAdmin/components/StepPropertiesPanel.tsx
import React, { useState } from 'react';
import { ProcessStep, ProcessLane, ProcessStage } from '../../../types/workflowConfig';

interface StepPropertiesPanelProps {
  step: ProcessStep;
  lanes: ProcessLane[];
  stages: ProcessStage[];
  onUpdateStep: (updated: ProcessStep) => void;
  onDeleteStep: (stepId: string) => void;
  onClose: () => void;
}

export default function StepPropertiesPanel({
  step,
  lanes,
  stages,
  onUpdateStep,
  onDeleteStep,
  onClose,
}: StepPropertiesPanelProps) {
  const [newDocText, setNewDocText] = useState('');
  const [newFormText, setNewFormText] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(step.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddDoc = () => {
    if (!newDocText.trim()) return;
    onUpdateStep({
      ...step,
      storedDocuments: [...step.storedDocuments, newDocText.trim()],
    });
    setNewDocText('');
  };

  const handleRemoveDoc = (index: number) => {
    onUpdateStep({
      ...step,
      storedDocuments: step.storedDocuments.filter((_, i) => i !== index),
    });
  };

  const handleAddForm = () => {
    if (!newFormText.trim()) return;
    onUpdateStep({
      ...step,
      stepForms: [...step.stepForms, newFormText.trim()],
    });
    setNewFormText('');
  };

  const handleRemoveForm = (index: number) => {
    onUpdateStep({
      ...step,
      stepForms: step.stepForms.filter((_, i) => i !== index),
    });
  };

  return (
    <aside className="w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 shadow-lg select-none z-20 animate-in slide-in-from-right duration-150">
      {/* 1. Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
            Thuộc tính bước xử lý
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDeleteStep(step.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa bước này"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Đóng panel"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Tên bước */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Tên bước <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onUpdateStep({ ...step, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Mã bước do hệ thống sinh */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-bold text-slate-800">
              Mã bước <span className="text-slate-400 font-normal">(Hệ thống tự sinh)</span>
            </label>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">
                {copiedCode ? 'check' : 'content_copy'}
              </span>
              {copiedCode ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
          <input
            type="text"
            readOnly
            value={step.code}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-800 focus:outline-none cursor-not-allowed"
          />
        </div>

        {/* Nhóm chịu trách nhiệm (Lane) & Giai đoạn (Stage) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Nhóm trách nhiệm
            </label>
            <select
              value={step.laneId}
              onChange={(e) => onUpdateStep({ ...step, laneId: e.target.value })}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {lanes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Giai đoạn
            </label>
            <select
              value={step.stageId}
              onChange={(e) => onUpdateStep({ ...step, stageId: e.target.value })}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Diễn giải */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Diễn giải nghiệp vụ
          </label>
          <textarea
            rows={2}
            value={step.description || ''}
            onChange={(e) => onUpdateStep({ ...step, description: e.target.value })}
            placeholder="Nêu rõ nội dung công việc và căn cứ nghiệp vụ tại bước này..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Đánh dấu Bước bắt đầu / Bước kết thúc */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="font-bold text-slate-800 block text-[11.5px]">Phân loại bước</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!step.isStart}
                onChange={(e) => onUpdateStep({ ...step, isStart: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-slate-800 font-medium">Bước bắt đầu</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!step.isEnd}
                onChange={(e) => onUpdateStep({ ...step, isEnd: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span className="text-slate-800 font-medium">Bước kết thúc</span>
            </label>
          </div>
        </div>

        {/* Hạn xử lý tại bước, Số giờ làm việc, Cảnh báo trước */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-[11.5px]">Thời hạn &amp; Định mức</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Hạn xử lý (ngày)
              </label>
              <input
                type="number"
                min={0}
                value={step.timeLimitDays}
                onChange={(e) => onUpdateStep({ ...step, timeLimitDays: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Số giờ làm việc
              </label>
              <input
                type="number"
                min={0}
                value={step.workHours}
                onChange={(e) => onUpdateStep({ ...step, workHours: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Cảnh báo trước
              </label>
              <input
                type="number"
                min={0}
                value={step.warningBeforeHours}
                onChange={(e) => onUpdateStep({ ...step, warningBeforeHours: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-amber-700"
              />
            </div>
          </div>

          {/* Lịch làm việc */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Lịch làm việc áp dụng
            </label>
            <select
              value={step.workSchedule}
              onChange={(e) => onUpdateStep({ ...step, workSchedule: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)">Giờ hành chính (8h - 17h, Thứ 2 - Thứ 6)</option>
              <option value="Cả ngày 24/7 (Bao gồm Thứ 7 & CN)">Cả ngày 24/7 (Bao gồm Thứ 7 &amp; CN)</option>
              <option value="Trực chiến khẩn cấp">Trực chiến khẩn cấp</option>
            </select>
          </div>
        </div>

        {/* Biểu mẫu tại bước */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-800">
            Biểu mẫu tại bước ({step.stepForms.length})
          </label>
          <div className="space-y-1.5">
            {step.stepForms.map((form, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0">
                    assignment
                  </span>
                  <span className="truncate text-xs">{form}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveForm(idx)}
                  className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newFormText}
              onChange={(e) => setNewFormText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddForm())}
              placeholder="Thêm biểu mẫu (vd: BM-01/XM...)"
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <button
              type="button"
              onClick={handleAddForm}
              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg text-xs"
            >
              + Thêm
            </button>
          </div>
        </div>

        {/* Văn bản lưu tại bước */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-800">
            Văn bản lưu tại bước ({step.storedDocuments.length})
          </label>
          <div className="space-y-1.5">
            {step.storedDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[15px] text-slate-500 shrink-0">
                    description
                  </span>
                  <span className="truncate text-xs">{doc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(idx)}
                  className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newDocText}
              onChange={(e) => setNewDocText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDoc())}
              placeholder="Thêm văn bản lưu trữ..."
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <button
              type="button"
              onClick={handleAddDoc}
              className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg text-xs"
            >
              + Thêm
            </button>
          </div>
        </div>

        {/* Văn bản đổi trạng thái tại bước */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-800 mb-1">
            Văn bản đổi trạng thái tại bước
          </label>
          <input
            type="text"
            value={step.statusChangeDoc || ''}
            onChange={(e) => onUpdateStep({ ...step, statusChangeDoc: e.target.value })}
            placeholder="Vd: Quyết định thụ lý, Thông báo giải quyết..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </aside>
  );
}
