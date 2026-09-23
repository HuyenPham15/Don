// src/components/chatReception/ReceptionSuccessCard.tsx
import React from 'react';
import { ReceptionDraft } from '../../types/receptionChat';
import { Screen } from '../../types';

interface ReceptionSuccessCardProps {
  draft: ReceptionDraft;
  onNav?: (s: Screen) => void;
  onNewSession?: () => void;
}

export default function ReceptionSuccessCard({
  draft,
  onNav,
  onNewSession,
}: ReceptionSuccessCardProps) {
  const code = draft.receptionCode || 'TN-2026-000123';
  const data = draft.extractedData;

  return (
    <div className="max-w-2xl w-full bg-white border border-emerald-200 rounded-2xl shadow-xs overflow-hidden animate-fade-in my-2">
      {/* Success banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <span className="material-symbols-outlined text-[28px]">check_circle</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Chính thức
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {draft.receptionTime || new Date().toLocaleString('vi-VN')}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 mt-0.5 tracking-tight">
            Tiếp nhận hồ sơ thành công!
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Hồ sơ đã được cấp số tiếp nhận điện tử và chuyển tiếp vào quy trình xử lý của cơ quan.
          </p>
        </div>
      </div>

      {/* Thông tin số tiếp nhận & tóm tắt */}
      <div className="p-5 space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mã số tiếp nhận chính thức
            </span>
            <div className="text-xl font-extrabold font-mono text-[#004ac6] tracking-tight mt-0.5">
              {code}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
            <span className="material-symbols-outlined text-slate-400 text-[28px]">qr_code_2</span>
            <div className="text-[11px] text-slate-500">
              <div>Đã đồng bộ cơ sở dữ liệu</div>
              <div className="font-semibold text-emerald-700">Trạng thái: Đã tiếp nhận</div>
            </div>
          </div>
        </div>

        {/* Bảng chi tiết vắn tắt */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10.5px] font-semibold text-slate-400 block">Loại đơn</span>
            <span className="font-bold text-slate-800 truncate block mt-0.5">
              {data.loaiDon.value}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10.5px] font-semibold text-slate-400 block">Người đứng đơn</span>
            <span className="font-bold text-slate-800 truncate block mt-0.5">
              {data.nguoiDungDon.value}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10.5px] font-semibold text-slate-400 block">Số điện thoại</span>
            <span className="font-mono font-bold text-slate-800 truncate block mt-0.5">
              {data.soDienThoai.value || 'N/A'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <span className="text-[10.5px] font-semibold text-slate-400 block">Cán bộ tiếp nhận</span>
            <span className="font-medium text-slate-800 truncate block mt-0.5">
              {draft.createdBy}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 col-span-2">
            <span className="text-[10.5px] font-semibold text-slate-400 block">File văn bản nguồn</span>
            <span className="font-mono font-medium text-slate-700 truncate block mt-0.5">
              {draft.fileMeta.name} ({draft.fileMeta.size})
            </span>
          </div>
        </div>

        {/* Nút tác vụ tiếp nối */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
          {onNewSession && (
            <button
              type="button"
              onClick={onNewSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Tiếp nhận đơn khác</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onNav && (
              <>
                <button
                  type="button"
                  onClick={() => onNav('don-tiep-nhan')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#004ac6] text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Xem chi tiết đơn</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNav('cong-viec')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ba0] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Đến Công việc của tôi</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
