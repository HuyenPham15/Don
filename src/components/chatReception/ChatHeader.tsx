// src/components/chatReception/ChatHeader.tsx
import React from 'react';
import { ReceptionDraft } from '../../types/receptionChat';

interface ChatHeaderProps {
  draft: ReceptionDraft | null;
  onResetDemo: () => void;
  onClearChat: () => void;
}

export default function ChatHeader({
  draft,
  onResetDemo,
  onClearChat,
}: ChatHeaderProps) {
  const isReceived = draft?.status === 'RECEIVED';
  const hasDraft = draft && draft.status !== 'RECEIVED';

  return (
    <header className="px-5 py-3.5 bg-white border-b border-slate-200/90 shadow-2xs flex items-center justify-between shrink-0 select-none z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              AI Assistant Tiếp nhận đơn qua Chat
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#004ac6] border border-blue-200 uppercase tracking-wider">
              Nghiệp vụ số
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Trực tuyến
            </span>
            <span>•</span>
            <span className="truncate max-w-[340px]">
              Tự động bóc tách, lập bản nháp tiếp nhận & cấp số chính thức
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasDraft && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 font-medium animate-fade-in">
            <span className="material-symbols-outlined text-[16px] text-amber-600">hourglass_top</span>
            <span>Hồ sơ đang xử lý dở: <strong className="font-mono text-slate-800">{draft.fileMeta.name}</strong></span>
          </div>
        )}

        {isReceived && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 font-medium animate-fade-in">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>Đã tiếp nhận: <strong className="font-mono text-slate-900">{draft?.receptionCode}</strong></span>
          </div>
        )}

        <button
          type="button"
          onClick={onResetDemo}
          title="Tải lại hội thoại kịch bản chuẩn mẫu"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-[#004ac6]">restart_alt</span>
          <span className="hidden sm:inline">Kịch bản mẫu</span>
        </button>

        <button
          type="button"
          onClick={onClearChat}
          title="Làm mới để bắt đầu tiếp nhận file mới"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span className="hidden sm:inline">Phiên mới</span>
        </button>
      </div>
    </header>
  );
}
