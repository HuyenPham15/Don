// src/utils/receptionDraftStorage.ts
import {
  ReceptionDraft,
  ReceptionData,
  ProcessStepItem,
  ChatMessage,
  AttachedFileMeta,
} from '../types/receptionChat';

const STORAGE_KEY_DRAFT = 'GOVEX_RECEPTION_DRAFT_V1';
const STORAGE_KEY_MESSAGES = 'GOVEX_RECEPTION_MESSAGES_V1';

export const DEFAULT_PROCESS_STEPS: ProcessStepItem[] = [
  {
    id: 'step-1',
    code: 'RECEIVE',
    name: 'Nhận tài liệu',
    status: 'pending',
    description: 'Kiểm tra tính toàn vẹn file, định dạng và dung lượng',
  },
  {
    id: 'step-2',
    code: 'OCR',
    name: 'OCR / đọc nội dung',
    status: 'pending',
    description: 'Bóc tách văn bản đa tầng qua công nghệ OCR chuyên sâu',
  },
  {
    id: 'step-3',
    code: 'EXTRACT',
    name: 'Trích xuất thông tin',
    status: 'pending',
    description: 'Nhận diện thực thể: người nộp, đối tượng, thời gian, sự việc',
  },
  {
    id: 'step-4',
    code: 'CLASSIFY',
    name: 'Xác định loại đơn',
    status: 'pending',
    description: 'Phân loại theo thẩm quyền giải quyết (Khiếu nại / Tố cáo / PA-KN)',
  },
  {
    id: 'step-5',
    code: 'VALIDATE',
    name: 'Kiểm tra dữ liệu bắt buộc',
    status: 'pending',
    description: 'Đối soát các trường dữ liệu theo Nghị định 61/2018/NĐ-CP',
  },
  {
    id: 'step-6',
    code: 'DRAFT',
    name: 'Tạo bản nháp tiếp nhận',
    status: 'pending',
    description: 'Khởi tạo hồ sơ tiếp nhận điện tử và lập mã phiên',
  },
  {
    id: 'step-7',
    code: 'CONFIRM',
    name: 'Chờ xác nhận tiếp nhận',
    status: 'pending',
    description: 'Cán bộ kiểm tra, chỉnh sửa bổ sung và bấm Tiếp nhận đơn',
  },
];

export function createDemoDraft(): ReceptionDraft {
  const fileMeta: AttachedFileMeta = {
    id: 'FILE-DEMO-001',
    name: 'Don_khieu_nai.pdf',
    size: '2.4 MB',
    type: 'application/pdf',
    uploadTime: '20/09/2026 09:15',
    pageCount: 3,
  };

  const steps: ProcessStepItem[] = DEFAULT_PROCESS_STEPS.map((s, idx) => {
    if (idx < 6) {
      return { ...s, status: 'completed' as const };
    }
    return { ...s, status: 'processing' as const, description: 'Đang đợi cán bộ phê duyệt hoặc bổ sung thông tin' };
  });

  const extractedData: ReceptionData = {
    loaiDon: {
      label: 'Loại đơn',
      value: 'Khiếu nại',
      confidence: 96,
      status: 'ok',
    },
    nguoiDungDon: {
      label: 'Người đứng đơn',
      value: 'Nguyễn Văn A',
      confidence: 95,
      status: 'ok',
    },
    nguoiNop: {
      label: 'Người nộp đơn',
      value: 'Nguyễn Văn A (chính chủ)',
      confidence: 94,
      status: 'ok',
    },
    cccd: {
      label: 'Số CCCD / Mã định danh',
      value: '001085012345',
      confidence: 68,
      status: 'needs_review',
    },
    soDienThoai: {
      label: 'Số điện thoại',
      value: '0912345678',
      confidence: 92,
      status: 'ok',
    },
    email: {
      label: 'Thư điện tử (Email)',
      value: 'nguyenvana.hanoi@gmail.com',
      confidence: 88,
      status: 'ok',
    },
    diaChi: {
      label: 'Địa chỉ cư trú',
      value: 'Số 15 Phố Nguyễn Du, Phường Hàng Bài, Quận Hoàn Kiếm, TP. Hà Nội',
      confidence: 91,
      status: 'ok',
    },
    ngayLamDon: {
      label: 'Ngày làm đơn',
      value: '20/09/2026',
      confidence: 95,
      status: 'ok',
    },
    ngayNhan: {
      label: 'Ngày tiếp nhận',
      value: '23/09/2026',
      confidence: 99,
      status: 'ok',
    },
    doiTuongBiKhieuNai: {
      label: 'Cơ quan / Cá nhân bị khiếu nại',
      value: 'UBND Quận Cầu Giấy (Quyết định thu hồi đất số 425/QĐ-UBND)',
      confidence: 90,
      status: 'ok',
    },
    noiDungTomTat: {
      label: 'Nội dung tóm tắt',
      value:
        'Khiếu nại Quyết định số 425/QĐ-UBND về phương án bồi thường, hỗ trợ tái định cư khi Nhà nước thu hồi đất tại Dự án mở rộng đường Vành đai, cho rằng mức giá bồi thường chưa sát với giá thị trường và chưa giải quyết thỏa đáng quỹ đất dịch vụ.',
      confidence: 93,
      status: 'ok',
    },
    taiLieuDinhKem: {
      label: 'Tài liệu đính kèm',
      value: [
        'Don_khieu_nai.pdf (Bản chính có chữ ký)',
        'Quyet_dinh_425_UBND.pdf (Bản sao)',
        'Giay_CNQSD_dat.pdf (Bản sao công chứng)',
      ],
      confidence: 89,
      status: 'ok',
    },
  };

  return {
    id: 'DRAFT-2026-0920-001',
    sourceFileId: fileMeta.id,
    fileMeta,
    chatSessionId: 'SESSION-001',
    status: 'WAITING_CONFIRMATION',
    extractedData,
    createdBy: 'Nguyễn Minh Anh (Cán bộ tiếp dân)',
    createdAt: '20/09/2026 09:15',
    updatedAt: '20/09/2026 09:16',
    stepsProgress: steps,
    missingCount: 1,
  };
}

export function createDemoConversation(): { draft: ReceptionDraft; messages: ChatMessage[] } {
  const draft = createDemoDraft();

  const messages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'user',
      timestamp: '09:15',
      type: 'user_file',
      text: 'Tôi muốn tiếp nhận đơn này.',
      file: draft.fileMeta,
      draftId: draft.id,
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      timestamp: '09:15',
      type: 'text',
      text: 'Đã nhận được tài liệu **Don_khieu_nai.pdf** (2.4 MB). Tôi đang tự động phân tích bóc tách và chuẩn bị hồ sơ tiếp nhận nghiệp vụ.',
      draftId: draft.id,
    },
    {
      id: 'msg-3',
      sender: 'assistant',
      timestamp: '09:15',
      type: 'process_card',
      draftId: draft.id,
    },
    {
      id: 'msg-4',
      sender: 'assistant',
      timestamp: '09:16',
      type: 'text',
      text: 'Tôi đã hoàn thành bóc tách dữ liệu từ tài liệu đính kèm. Dưới đây là **Bản nháp tiếp nhận** đã được đối soát theo quy định. Bạn có thể kiểm tra, chỉnh sửa thông tin hoặc bấm **Tiếp nhận đơn** để cấp số tiếp nhận chính thức.',
      draftId: draft.id,
    },
    {
      id: 'msg-5',
      sender: 'assistant',
      timestamp: '09:16',
      type: 'draft_card',
      draftId: draft.id,
    },
  ];

  return { draft, messages };
}

// ---------------- LOCAL STORAGE ----------------

export function saveDraftToStorage(draft: ReceptionDraft | null): void {
  try {
    if (!draft) {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } else {
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
    }
  } catch (e) {
    console.error('Error saving draft to localStorage:', e);
  }
}

export function loadDraftFromStorage(): ReceptionDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading draft from localStorage:', e);
    return null;
  }
}

export function saveMessagesToStorage(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving messages to localStorage:', e);
  }
}

export function loadMessagesFromStorage(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading messages from localStorage:', e);
    return null;
  }
}

export function clearReceptionStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
  } catch (e) {
    console.error('Error clearing reception storage:', e);
  }
}

// Helper sinh mã tiếp nhận
export function generateReceptionCode(): string {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `TN-2026-${randNum}`;
}
