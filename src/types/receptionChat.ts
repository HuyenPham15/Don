// src/types/receptionChat.ts

export type ReceptionDraftStatus =
  | 'ANALYZING'
  | 'DRAFT'
  | 'WAITING_CONFIRMATION'
  | 'RECEIVED'
  | 'FAILED';

export type FieldStatus = 'ok' | 'needs_review' | 'missing';

export interface ExtractedField<T = string> {
  label: string;
  value: T;
  confidence?: number; // 0..100
  status?: FieldStatus;
  userEdited?: boolean;
}

export interface ReceptionData {
  loaiDon: ExtractedField<string>;
  nguoiDungDon: ExtractedField<string>;
  nguoiNop: ExtractedField<string>;
  cccd: ExtractedField<string>;
  soDienThoai: ExtractedField<string>;
  email: ExtractedField<string>;
  diaChi: ExtractedField<string>;
  ngayLamDon: ExtractedField<string>;
  ngayNhan: ExtractedField<string>;
  doiTuongBiKhieuNai: ExtractedField<string>;
  noiDungTomTat: ExtractedField<string>;
  taiLieuDinhKem: ExtractedField<string[]>;
}

export type StepStatus = 'completed' | 'processing' | 'pending' | 'error';

export interface ProcessStepItem {
  id: string;
  code: string;
  name: string;
  status: StepStatus;
  description?: string;
  errorMsg?: string;
  durationMs?: number;
}

export interface AttachedFileMeta {
  id: string;
  name: string;
  size: string;
  type: string;
  rawType?: string;
  uploadTime: string;
  pageCount?: number;
}

export interface ReceptionDraft {
  id: string; // DRAFT-2026-xxxx
  sourceFileId: string;
  fileMeta: AttachedFileMeta;
  chatSessionId: string;
  status: ReceptionDraftStatus;
  extractedData: ReceptionData;
  userEditedData?: Partial<Record<keyof ReceptionData, any>>;
  receptionCode?: string; // TN-2026-xxxxxx
  receptionTime?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  stepsProgress: ProcessStepItem[];
  missingCount: number;
}

export type MessageType =
  | 'text'
  | 'user_file'
  | 'process_card'
  | 'draft_card'
  | 'success_card'
  | 'system_notice';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  type: MessageType;
  text?: string;
  file?: AttachedFileMeta;
  draftId?: string;
  isStreaming?: boolean;
}
