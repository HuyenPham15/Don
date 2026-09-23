// src/components/chatReception/FileAttachmentCard.tsx
import React from 'react';
import { AttachedFileMeta } from '../../types/receptionChat';

interface FileAttachmentCardProps {
  file: AttachedFileMeta;
  promptText?: string;
  timestamp: string;
}

export default function FileAttachmentCard({
  file,
  promptText,
  timestamp,
}: FileAttachmentCardProps) {
  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  const isWord = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');
  const isImage = file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');

  return (
    <div className="flex flex-col items-end gap-2 max-w-xl ml-auto animate-fade-in">
      {/* Khối File đính kèm */}
      <div className="p-3 bg-white border border-blue-200/90 rounded-2xl shadow-xs flex items-center gap-3 w-full">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isPdf
              ? 'bg-rose-50 text-rose-600 border border-rose-100'
              : isWord
              ? 'bg-blue-50 text-blue-600 border border-blue-100'
              : isImage
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isPdf ? 'picture_as_pdf' : isWord ? 'description' : isImage ? 'image' : 'draft'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 truncate" title={file.name}>
              {file.name}
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider shrink-0">
              {isPdf ? 'PDF' : isWord ? 'DOCX' : isImage ? 'ẢNH' : 'FILE'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <span>{file.size}</span>
            {file.pageCount && (
              <>
                <span>•</span>
                <span>{file.pageCount} trang</span>
              </>
            )}
            <span>•</span>
            <span className="text-emerald-700 font-medium">Đã tải lên</span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Xem trước tài liệu"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
        </div>
      </div>

      {/* Bubble tin nhắn của người dùng */}
      {promptText && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#004ac6] to-[#1e5cd8] text-white rounded-2xl rounded-tr-xs shadow-2xs text-xs font-medium leading-relaxed max-w-full">
          {promptText}
        </div>
      )}

      <span className="text-[10px] text-slate-400 pr-1">{timestamp}</span>
    </div>
  );
}
