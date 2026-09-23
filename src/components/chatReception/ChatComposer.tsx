// src/components/chatReception/ChatComposer.tsx
import React, { useState, useRef } from 'react';
import { AttachedFileMeta } from '../../types/receptionChat';

interface ChatComposerProps {
  onSendMessage: (text: string, attachedFile?: AttachedFileMeta) => void;
  isProcessing?: boolean;
}

const SAMPLE_FILES: AttachedFileMeta[] = [
  {
    id: 'SAMPLE-1',
    name: 'Don_khieu_nai_dat_dai_Cau_Giay.pdf',
    size: '2.4 MB',
    type: 'application/pdf',
    uploadTime: 'Vừa xong',
    pageCount: 3,
  },
  {
    id: 'SAMPLE-2',
    name: 'Don_to_cao_sai_pham_xay_dung.docx',
    size: '1.8 MB',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadTime: 'Vừa xong',
    pageCount: 2,
  },
  {
    id: 'SAMPLE-3',
    name: 'Don_kien_nghi_moi_truong_khu_dan_cu.pdf',
    size: '950 KB',
    type: 'application/pdf',
    uploadTime: 'Vừa xong',
    pageCount: 1,
  },
];

export default function ChatComposer({
  onSendMessage,
  isProcessing = false,
}: ChatComposerProps) {
  const [inputText, setInputText] = useState('');
  const [pendingFile, setPendingFile] = useState<AttachedFileMeta | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!inputText.trim() && !pendingFile) return;
    onSendMessage(inputText.trim(), pendingFile || undefined);
    setInputText('');
    setPendingFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileMeta: AttachedFileMeta = {
      id: `FILE-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type || 'application/pdf',
      uploadTime: 'Vừa xong',
      pageCount: file.type.includes('pdf') ? 2 : 1,
    };

    setPendingFile(fileMeta);
    if (!inputText.trim()) {
      setInputText('Tôi muốn tiếp nhận đơn này');
    }
  };

  const handleSelectSampleFile = (f: AttachedFileMeta) => {
    setPendingFile(f);
    setShowFilePicker(false);
    if (!inputText.trim()) {
      setInputText('Tôi muốn tiếp nhận đơn này');
    }
  };

  const quickPrompts = [
    'Tôi muốn tiếp nhận đơn này',
    'Bổ sung số CCCD: 001085012345',
    'Chuyển loại đơn thành Đơn tố cáo',
    'Đổi số điện thoại người nộp thành 0988776655',
  ];

  return (
    <footer className="p-4 bg-white border-t border-slate-200/90 shadow-lg shrink-0">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick prompt pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Gợi ý:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(p);
              }}
              className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-full text-slate-600 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Khối File đã chọn đính kèm (nếu có) */}
        {pendingFile && (
          <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 animate-fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">attach_file</span>
              <span className="font-semibold truncate">{pendingFile.name}</span>
              <span className="text-slate-500 font-mono text-[11px]">({pendingFile.size})</span>
            </div>
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
              title="Gỡ file đính kèm"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Chat input box */}
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-300/80 focus-within:border-[#004ac6] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-2 transition-all shadow-2xs relative">
          {/* File upload hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRealFileUpload}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
          />

          {/* Button upload file */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilePicker(!showFilePicker)}
              className="p-2 text-slate-500 hover:text-[#004ac6] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Đính kèm file đơn (PDF/DOC/Ảnh)"
            >
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
            </button>

            {/* Dropdown chọn file tải lên hoặc file demo */}
            {showFilePicker && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-fade-in space-y-1">
                <div className="px-2.5 py-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Chọn nguồn tài liệu đơn
                </div>

                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowFilePicker(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-600">upload_file</span>
                  <span>Tải file từ máy tính (PDF, Word, Ảnh)</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>
                <div className="px-2.5 py-1 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  File mẫu kịch bản nghiệp vụ
                </div>

                {SAMPLE_FILES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSampleFile(sample)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="truncate pr-2 font-medium">{sample.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{sample.size}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text input */}
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingFile
                ? 'Nhập yêu cầu: "Tôi muốn tiếp nhận đơn này"...'
                : 'Nhập yêu cầu hoặc bấm icon đính kèm để tải file đơn lên...'
            }
            className="flex-1 max-h-32 min-h-[38px] p-2 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isProcessing || (!inputText.trim() && !pendingFile)}
            className="p-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ba0] active:scale-95 text-white transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
            title="Gửi yêu cầu"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[18px]">send</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>AI Assistant tiếp nhận đơn tự động theo tiêu chuẩn Nghị định 61/2018/NĐ-CP</span>
          <span>Shift + Enter để xuống dòng</span>
        </div>
      </div>
    </footer>
  );
}
