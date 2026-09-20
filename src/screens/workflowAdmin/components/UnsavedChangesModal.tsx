// src/screens/workflowAdmin/components/UnsavedChangesModal.tsx
import React from 'react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onCancel: () => void; // Ở lại tiếp tục chỉnh sửa
  onDiscardAndLeave: () => void; // Rời khỏi trang và hủy thay đổi
  onSaveAndLeave: () => void; // Lưu nháp và rời khỏi trang
}

export default function UnsavedChangesModal({
  isOpen,
  onCancel,
  onDiscardAndLeave,
  onSaveAndLeave,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1.5">
            Thay đổi chưa được lưu
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Bạn có các chỉnh sửa trên quy trình xử lý chưa được lưu lại. Bạn có muốn lưu bản nháp trước khi rời khỏi trang không?
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onSaveAndLeave}
              className="w-full py-2.5 px-4 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Lưu bản nháp &amp; Rời trang</span>
            </button>

            <button
              type="button"
              onClick={onDiscardAndLeave}
              className="w-full py-2.5 px-4 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
              <span>Hủy thay đổi &amp; Rời trang</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 px-4 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              Tiếp tục chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
