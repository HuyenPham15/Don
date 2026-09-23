// src/screens/AITiepNhanChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Screen, LuotNhan, DonDetail } from '../types';
import {
  ReceptionDraft,
  ChatMessage,
  AttachedFileMeta,
  ReceptionData,
} from '../types/receptionChat';
import {
  createDemoConversation,
  DEFAULT_PROCESS_STEPS,
  saveDraftToStorage,
  loadDraftFromStorage,
  saveMessagesToStorage,
  loadMessagesFromStorage,
  generateReceptionCode,
} from '../utils/receptionDraftStorage';
import ChatHeader from '../components/chatReception/ChatHeader';
import FileAttachmentCard from '../components/chatReception/FileAttachmentCard';
import AIProcessCard from '../components/chatReception/AIProcessCard';
import ReceptionSuccessCard from '../components/chatReception/ReceptionSuccessCard';
import ChatComposer from '../components/chatReception/ChatComposer';
import ReceptionExtractedFormPane from '../components/chatReception/ReceptionExtractedFormPane';

interface AITiepNhanChatScreenProps {
  onNav?: (s: Screen) => void;
  onReceptionCreated?: (newLuotNhan: LuotNhan, newDon: DonDetail) => void;
  onSaveDraftToWorkItems?: (draftLuotNhan: LuotNhan, draftDon: DonDetail) => void;
}

export default function AITiepNhanChatScreen({
  onNav,
  onReceptionCreated,
  onSaveDraftToWorkItems,
}: AITiepNhanChatScreenProps) {
  const [draft, setDraft] = useState<ReceptionDraft | null>(() => {
    const saved = loadDraftFromStorage();
    if (saved) return saved;
    const demo = createDemoConversation();
    return demo.draft;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadMessagesFromStorage();
    if (saved && saved.length > 0) return saved;
    const demo = createDemoConversation();
    return demo.messages;
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDraftBanner, setShowDraftBanner] = useState<boolean>(() => {
    const saved = loadDraftFromStorage();
    return Boolean(saved && saved.status === 'WAITING_CONFIRMATION');
  });
  const [toastMsg, setToastMsg] = useState<{ text: string; actionText?: string; onAction?: () => void } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, actionText?: string, onAction?: () => void) => {
    setToastMsg({ text, actionText, onAction });
    setTimeout(() => {
      setToastMsg((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // Cuộn xuống tin nhắn mới nhất trong khung chat bên trái
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Đồng bộ storage khi draft thay đổi
  useEffect(() => {
    saveDraftToStorage(draft);
  }, [draft]);

  // Đồng bộ storage khi messages thay đổi
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  // 1. TẢI LẠI KỊCH BẢN DEMO MẪU
  const handleResetDemo = () => {
    const demo = createDemoConversation();
    setDraft(demo.draft);
    setMessages(demo.messages);
    setShowDraftBanner(false);
    showToast('✓ Đã tải lại kịch bản tiếp nhận đơn mẫu chuẩn!');
  };

  // 2. TẠO PHIÊN MỚI
  const handleClearChat = () => {
    setDraft(null);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        text: 'Xin chào! Tôi là **AI Assistant tiếp nhận đơn**. Vui lòng đính kèm file đơn (PDF, Word, Ảnh) và nhập yêu cầu để tôi tự động bóc tách vào biểu mẫu bên phải.',
      },
    ]);
    setShowDraftBanner(false);
    showToast('✓ Bắt đầu phiên tiếp nhận đơn mới!');
  };

  // 3. XỬ LÝ KHI NGƯỜI DÙNG GỬI FILE HOẶC PROMPT BÊN KHUNG CHAT
  const handleSendMessage = async (text: string, attachedFile?: AttachedFileMeta) => {
    if (!text.trim() && !attachedFile) return;

    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Trường hợp 1: Có đính kèm file mới (Kịch bản bóc tách & tạo Draft)
    if (attachedFile) {
      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        timestamp: timeNow,
        type: 'user_file',
        text: text || 'Tôi muốn tiếp nhận đơn này.',
        file: attachedFile,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      setShowDraftBanner(false);

      // Khởi tạo draft mới
      const newDraftId = `DRAFT-2026-${Date.now().toString().slice(-6)}`;
      const initialSteps = DEFAULT_PROCESS_STEPS.map((s, idx) => {
        if (idx === 0) return { ...s, status: 'processing' as const };
        return { ...s, status: 'pending' as const };
      });

      // Tạo extracted data ban đầu dựa trên file
      const isToCao = attachedFile.name.toLowerCase().includes('to_cao');
      const isKienNghi = attachedFile.name.toLowerCase().includes('kien_nghi');
      const loaiDonName = isToCao ? 'Tố cáo' : isKienNghi ? 'Kiến nghị - Phản ánh' : 'Khiếu nại';

      const initialData: ReceptionData = {
        loaiDon: { label: 'Loại đơn', value: loaiDonName, confidence: 96, status: 'ok' },
        nguoiDungDon: {
          label: 'Người đứng đơn',
          value: isToCao ? 'Trần Văn Bình' : 'Nguyễn Văn A',
          confidence: 94,
          status: 'ok',
        },
        nguoiNop: {
          label: 'Người nộp đơn',
          value: isToCao ? 'Trần Văn Bình (trực tiếp)' : 'Nguyễn Văn A (trực tiếp)',
          confidence: 93,
          status: 'ok',
        },
        cccd: {
          label: 'Số CCCD / Mã định danh',
          value: '001085012345',
          confidence: 68,
          status: 'needs_review',
        },
        soDienThoai: { label: 'Số điện thoại', value: '0912345678', confidence: 91, status: 'ok' },
        email: { label: 'Thư điện tử (Email)', value: 'nguyenvana.hanoi@gmail.com', confidence: 88, status: 'ok' },
        diaChi: {
          label: 'Địa chỉ cư trú',
          value: 'Số 15 Phố Nguyễn Du, Phường Hàng Bài, Quận Hoàn Kiếm, TP. Hà Nội',
          confidence: 92,
          status: 'ok',
        },
        ngayLamDon: {
          label: 'Ngày làm đơn',
          value: new Date().toLocaleDateString('vi-VN'),
          confidence: 95,
          status: 'ok',
        },
        ngayNhan: {
          label: 'Ngày tiếp nhận',
          value: new Date().toLocaleDateString('vi-VN'),
          confidence: 99,
          status: 'ok',
        },
        doiTuongBiKhieuNai: {
          label: 'Cơ quan / Cá nhân bị khiếu nại hoặc tố cáo',
          value: isToCao
            ? 'UBND Phường Y và Đội Quản lý trật tự xây dựng đô thị'
            : 'UBND Quận Cầu Giấy (Quyết định số 425/QĐ-UBND)',
          confidence: 90,
          status: 'ok',
        },
        noiDungTomTat: {
          label: 'Nội dung tóm tắt',
          value: isToCao
            ? `Tố cáo hành vi bao che vi phạm trật tự xây dựng tại công trình liền kề, xây dựng vượt tầng phá vỡ quy hoạch đã được phản ánh nhiều lần nhưng chưa xử lý dứt điểm.`
            : `Khiếu nại Quyết định thu hồi đất và phương án bồi thường, hỗ trợ tái định cư tại Dự án mở rộng đường, cho rằng giá bồi thường chưa thỏa đáng so với thực tế.`,
          confidence: 93,
          status: 'ok',
        },
        taiLieuDinhKem: {
          label: 'Tài liệu đính kèm',
          value: [attachedFile.name, 'Giấy tờ pháp lý kèm theo.pdf'],
          confidence: 90,
          status: 'ok',
        },
      };

      const newDraft: ReceptionDraft = {
        id: newDraftId,
        sourceFileId: attachedFile.id,
        fileMeta: attachedFile,
        chatSessionId: `SESSION-${Date.now()}`,
        status: 'ANALYZING',
        extractedData: initialData,
        createdBy: 'Nguyễn Minh Anh (Cán bộ tiếp dân)',
        createdAt: timeNow,
        updatedAt: timeNow,
        stepsProgress: initialSteps,
        missingCount: 1,
      };

      setDraft(newDraft);

      // AI phản hồi mở đầu
      const aiWelcomeMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeNow,
        type: 'text',
        text: `Đã nhận được tài liệu **${attachedFile.name}** (${attachedFile.size}). Tôi đang tự động phân tích và trích xuất dữ liệu sang biểu mẫu bên phải.`,
      };
      setMessages((prev) => [...prev, aiWelcomeMsg]);

      // Thẻ Process card trong luồng chat
      const processMsg: ChatMessage = {
        id: `msg-proc-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeNow,
        type: 'process_card',
        draftId: newDraftId,
      };
      setMessages((prev) => [...prev, processMsg]);

      // Chạy 7 bước nghiệp vụ lần lượt
      for (let i = 0; i < 7; i++) {
        await new Promise((res) => setTimeout(res, 600));
        setDraft((curr) => {
          if (!curr) return null;
          const updatedSteps = curr.stepsProgress.map((s, idx) => {
            if (idx < i) return { ...s, status: 'completed' as const };
            if (idx === i) return { ...s, status: 'completed' as const };
            if (idx === i + 1) {
              return idx === 6
                ? { ...s, status: 'processing' as const, description: 'Chờ cán bộ rà soát biểu mẫu và tiếp nhận' }
                : { ...s, status: 'processing' as const };
            }
            return { ...s, status: 'pending' as const };
          });
          return { ...curr, stepsProgress: updatedSteps };
        });
      }

      // Hoàn tất bóc tách -> Chuyển status draft sang WAITING_CONFIRMATION
      setDraft((curr) => {
        if (!curr) return null;
        return {
          ...curr,
          status: 'WAITING_CONFIRMATION',
        };
      });

      // AI thông báo kết quả
      const aiSummaryMsg: ChatMessage = {
        id: `msg-ai-summary-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeNow,
        type: 'text',
        text: `Tôi đã hoàn thành bóc tách 10/11 thông tin từ tài liệu. Toàn bộ dữ liệu đã được điền vào **Biểu mẫu Tiếp nhận hồ sơ ở khung bên phải**. Bạn có thể chỉnh sửa trực tiếp trên biểu mẫu, sau đó bấm **Tiếp nhận đơn** hoặc bấm **Lưu nháp / Cần xử lý** để đưa vào màn Công việc của tôi.`,
      };

      setMessages((prev) => [...prev, aiSummaryMsg]);
      setIsProcessing(false);
      showToast('✓ Bóc tách hồ sơ thành công! Dữ liệu đã sẵn sàng trên biểu mẫu bên phải.');
      return;
    }

    // Trường hợp 2: Người dùng nhập tin nhắn chat thông thường (bổ sung / điều chỉnh qua prompt)
    const userChatMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: timeNow,
      type: 'text',
      text,
    };
    setMessages((prev) => [...prev, userChatMsg]);

    const lower = text.toLowerCase();

    // AI nhận diện bổ sung số CCCD
    if (lower.includes('cccd') || lower.includes('căn cước') || /^\d{9,12}$/.test(text.trim())) {
      const match = text.match(/\d{9,12}/);
      const newCccd = match ? match[0] : text.trim();

      if (draft) {
        setDraft((curr) => {
          if (!curr) return null;
          return {
            ...curr,
            extractedData: {
              ...curr.extractedData,
              cccd: {
                ...curr.extractedData.cccd,
                value: newCccd,
                status: 'ok',
                userEdited: true,
              },
            },
            updatedAt: timeNow,
          };
        });

        const aiReply: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: timeNow,
          type: 'text',
          text: `✓ Đã cập nhật số CCCD: **${newCccd}** vào biểu mẫu bên phải. Dữ liệu đã đầy đủ và hợp lệ, bạn có thể kiểm tra và bấm **Tiếp nhận đơn** hoặc **Lưu nháp vào Công việc của tôi**.`,
        };
        setMessages((prev) => [...prev, aiReply]);
        showToast(`✓ Đã cập nhật số CCCD: ${newCccd} vào biểu mẫu bên phải`);
      } else {
        const aiReply: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: timeNow,
          type: 'text',
          text: `Đã ghi nhận số CCCD: **${newCccd}**. Vui lòng đính kèm file đơn để tôi hoàn tất hồ sơ tiếp nhận.`,
        };
        setMessages((prev) => [...prev, aiReply]);
      }
      return;
    }

    // AI nhận diện đổi loại đơn
    if (lower.includes('tố cáo') || lower.includes('khiếu nại') || lower.includes('kiến nghị')) {
      let targetType = 'Khiếu nại';
      if (lower.includes('tố cáo')) targetType = 'Tố cáo';
      if (lower.includes('kiến nghị') || lower.includes('phản ánh')) targetType = 'Kiến nghị - Phản ánh';

      if (draft) {
        setDraft((curr) => {
          if (!curr) return null;
          return {
            ...curr,
            extractedData: {
              ...curr.extractedData,
              loaiDon: {
                ...curr.extractedData.loaiDon,
                value: targetType,
                userEdited: true,
                status: 'ok',
              },
            },
            updatedAt: timeNow,
          };
        });

        const aiReply: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: timeNow,
          type: 'text',
          text: `✓ Đã cập nhật loại đơn thành: **Đơn ${targetType}** trên biểu mẫu bên phải.`,
        };
        setMessages((prev) => [...prev, aiReply]);
        showToast(`✓ Đã đổi loại đơn thành: ${targetType}`);
      }
      return;
    }

    // AI nhận diện yêu cầu tiếp nhận
    if (lower.includes('tiếp nhận') || lower.includes('xác nhận')) {
      if (draft && draft.status === 'WAITING_CONFIRMATION') {
        handleConfirmReception(draft);
        return;
      }
    }

    // Tin nhắn hướng dẫn chung
    const aiDefaultReply: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: timeNow,
      type: 'text',
      text: `Tôi đã ghi nhận yêu cầu: "${text}". Bạn có thể chỉnh sửa trực tiếp các ô nhập ở biểu mẫu bên phải, sau đó bấm **Tiếp nhận đơn** hoặc **Lưu nháp / Cần xử lý**.`,
    };
    setMessages((prev) => [...prev, aiDefaultReply]);
  };

  // 4. LƯU THAY ĐỔI TRỰC TIẾP TỪ FORM BÊN PHẢI
  const handleUpdateDraft = (updatedFields: Partial<ReceptionData>) => {
    if (!draft) return;
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    setDraft((curr) => {
      if (!curr) return null;
      return {
        ...curr,
        extractedData: {
          ...curr.extractedData,
          ...updatedFields,
        },
        updatedAt: timeNow,
      };
    });
  };

  // 5. LƯU NHÁP / CHUYỂN VÀO MÀN CÔNG VIỆC CỦA TÔI (CHO ĐƠN CHƯA THỂ TIẾP NHẬN NGAY)
  const handleSaveDraftToWork = (targetDraft: ReceptionDraft, reason?: string) => {
    const data = targetDraft.extractedData;
    const timeNow = new Date().toLocaleString('vi-VN');

    // Tạo bản ghi lượt nhận nháp & DonDetail
    const draftLuotNhan: LuotNhan = {
      id: `LN-NHAP-${targetDraft.id.replace('DRAFT-', '')}`,
      ngayNhan: timeNow,
      nguoiNop: data.nguoiNop.value || data.nguoiDungDon.value || 'Người nộp chưa rõ',
      hinhThuc: 'Bản nháp AI Chat',
      noiDung: data.noiDungTomTat.value || 'Bản nháp tiếp nhận đơn đang chờ xử lý',
      donVi: 'Phòng Tiếp công dân & Xử lý đơn',
      aiJob: 5,
      status: 'cho_chuyen',
      hasFile: true,
      sourceType: 'file',
      loaiDon: data.loaiDon.value,
      ghiChu: reason || 'Chờ bổ sung giấy tờ và xác minh',
    };

    const draftDon: DonDetail = {
      id: `Đ-NHAP-${targetDraft.id.replace('DRAFT-', '')}`,
      code: `Đ-NHAP-${targetDraft.id.replace('DRAFT-', '')}`,
      title: data.noiDungTomTat.value.slice(0, 90) + '...',
      luotNhanId: draftLuotNhan.id,
      nguoiNop: data.nguoiNop.value || data.nguoiDungDon.value,
      ngayNhan: timeNow,
      loaiDon: data.loaiDon.value,
      type: 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Chờ tiếp nhận', // CongViecCuaToi map statusBadge 'Chờ tiếp nhận' vào Cột 1 'action_required' (Cần xử lý)
    };

    // Gọi callback để App.tsx cập nhật vào work items
    if (onSaveDraftToWorkItems) {
      onSaveDraftToWorkItems(draftLuotNhan, draftDon);
    }

    // AI thêm tin nhắn xác nhận trong luồng chat bên trái
    const aiLogMsg: ChatMessage = {
      id: `msg-save-work-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: `✓ **Đã lưu bản nháp vào danh sách "Cần xử lý" trên màn Công việc của tôi**.\n- Mã hồ sơ: \`${draftDon.code}\`\n- Trạng thái: Chờ tiếp nhận\n- Lý do/Ghi chú: ${reason || 'Chờ xử lý tiếp'}\n\nBạn có thể sang màn hình **Công việc của tôi** bất cứ lúc nào để tiếp tục xử lý.`,
    };
    setMessages((prev) => [...prev, aiLogMsg]);

    showToast(
      `✓ Đã lưu hồ sơ vào 'Việc cần xử lý' trên màn Công việc của tôi!`,
      'Xem ngay',
      () => onNav?.('cong-viec')
    );
  };

  // 6. XÁC NHẬN TIẾP NHẬN ĐƠN CHÍNH THỨC
  const handleConfirmReception = async (targetDraft: ReceptionDraft) => {
    const data = targetDraft.extractedData;

    // Validate dữ liệu bắt buộc
    if (!data.loaiDon.value || !data.nguoiDungDon.value || !data.noiDungTomTat.value) {
      showToast('⚠️ Vui lòng điền đủ: Loại đơn, Người đứng đơn và Nội dung tóm tắt!');
      return;
    }

    setIsProcessing(true);
    const receptionCode = generateReceptionCode();
    const timeNow = new Date().toLocaleString('vi-VN');

    await new Promise((res) => setTimeout(res, 600));

    // Cập nhật trạng thái Draft -> RECEIVED
    const updatedDraft: ReceptionDraft = {
      ...targetDraft,
      status: 'RECEIVED',
      receptionCode,
      receptionTime: timeNow,
      stepsProgress: targetDraft.stepsProgress.map((s) => ({
        ...s,
        status: 'completed' as const,
      })),
    };

    setDraft(updatedDraft);
    setIsProcessing(false);
    setShowDraftBanner(false);

    // Thêm tin nhắn xác nhận & Success Card vào dòng chat bên trái
    const successMsg: ChatMessage = {
      id: `msg-success-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: 'success_card',
      draftId: targetDraft.id,
    };

    setMessages((prev) => [...prev, successMsg]);
    showToast(`✓ Tiếp nhận thành công! Số hồ sơ: ${receptionCode}`, 'Đến công việc', () => onNav?.('cong-viec'));

    // Đồng bộ vào hệ thống chung qua onReceptionCreated
    if (onReceptionCreated) {
      const newLuotNhan: LuotNhan = {
        id: `LN-${receptionCode.replace('TN-', '')}`,
        ngayNhan: timeNow,
        nguoiNop: data.nguoiNop.value || data.nguoiDungDon.value,
        hinhThuc: 'Trực tuyến qua Chat AI',
        noiDung: data.noiDungTomTat.value,
        donVi: 'Phòng Tiếp công dân & Xử lý đơn',
        aiJob: 5,
        status: 'da_chuyen',
        hasFile: true,
        sourceType: 'file',
        loaiDon: data.loaiDon.value,
      };

      const newDon: DonDetail = {
        id: `Đ-${receptionCode.replace('TN-', '')}`,
        code: `Đ-${receptionCode.replace('TN-', '')}`,
        title: data.noiDungTomTat.value.slice(0, 90) + '...',
        luotNhanId: newLuotNhan.id,
        nguoiNop: data.nguoiNop.value || data.nguoiDungDon.value,
        ngayNhan: timeNow,
        loaiDon: data.loaiDon.value,
        type: 'ĐƠN TIẾP NHẬN',
        statusBadge: 'Đang xử lý',
      };

      onReceptionCreated(newLuotNhan, newDon);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] overflow-hidden">
      {/* 1. Header trên cùng */}
      <ChatHeader
        draft={draft}
        onResetDemo={handleResetDemo}
        onClearChat={handleClearChat}
      />

      {/* 2. Top Banner thông báo Draft chưa hoàn tất khi reload */}
      {showDraftBanner && draft && draft.status === 'WAITING_CONFIRMATION' && (
        <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in slide-in-from-top duration-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700 animate-pulse">
              notification_important
            </span>
            <span>
              <strong>Bạn có 1 hồ sơ tiếp nhận đang xử lý dở:</strong>{' '}
              <span className="font-mono">{draft.fileMeta.name}</span> (Mã nháp:{' '}
              <strong className="font-mono">{draft.id}</strong>) - Dữ liệu đã mở sẵn trên biểu mẫu bên phải để bạn tiếp tục tiếp nhận hoặc lưu nháp.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDraftBanner(false)}
              className="p-1 text-amber-700 hover:text-amber-950 rounded cursor-pointer"
              title="Đóng thông báo"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. KHU VỰC CHIA ĐÔI: BÊN TRÁI (QUÁ TRÌNH XỬ LÝ & CHAT) - BÊN PHẢI (BIỂU MẪU DỮ LIỆU) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ==================== BÊN TRÁI: QUÁ TRÌNH XỬ LÝ & HỘI THOẠI AI ==================== */}
        <section className="w-full lg:w-[46%] xl:w-[44%] flex flex-col h-full bg-white border-r border-slate-200/90 overflow-hidden shrink-0">
          {/* Header nhỏ cột bên trái */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">chat_bubble</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Quá trình xử lý &amp; Hội thoại AI
              </span>
            </div>
            <span className="text-[10.5px] text-slate-500 font-mono">
              {messages.length} tương tác
            </span>
          </div>

          {/* Dòng chat cuộn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc]">
            {messages.map((msg) => {
              // Tin nhắn đính kèm file từ User
              if (msg.type === 'user_file' && msg.file) {
                return (
                  <FileAttachmentCard
                    key={msg.id}
                    file={msg.file}
                    promptText={msg.text}
                    timestamp={msg.timestamp}
                  />
                );
              }

              // Tin nhắn User thông thường
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex flex-col items-end gap-1 max-w-sm ml-auto animate-fade-in">
                    <div className="px-3.5 py-2 bg-gradient-to-r from-[#004ac6] to-[#1e5cd8] text-white rounded-2xl rounded-tr-xs shadow-2xs text-xs font-medium leading-relaxed">
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 pr-1">{msg.timestamp}</span>
                  </div>
                );
              }

              // Tin nhắn từ AI
              return (
                <div key={msg.id} className="flex items-start gap-2.5 max-w-full animate-fade-in">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Text AI */}
                    {msg.text && (
                      <div className="px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-2xs text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    )}

                    {/* Thẻ Process Card (7 bước) */}
                    {msg.type === 'process_card' && draft && (
                      <AIProcessCard steps={draft.stepsProgress} />
                    )}

                    {/* Thẻ Success Card khi đã tiếp nhận */}
                    {msg.type === 'success_card' && draft && (
                      <ReceptionSuccessCard
                        draft={draft}
                        onNav={onNav}
                        onNewSession={handleClearChat}
                      />
                    )}

                    <span className="text-[10px] text-slate-400 pl-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Composer ở dưới cùng cột trái */}
          <ChatComposer
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        </section>

        {/* ==================== BÊN PHẢI: FORM DỮ LIỆU BÓC TÁCH VÀ CHỈNH SỬA ==================== */}
        <section className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <ReceptionExtractedFormPane
            draft={draft}
            onUpdateDraft={handleUpdateDraft}
            onConfirmReception={handleConfirmReception}
            onSaveDraftToWork={handleSaveDraftToWork}
            isProcessing={isProcessing}
            onNav={onNav}
            onSelectSampleFile={handleResetDemo}
          />
        </section>
      </div>

      {/* Toast thông báo góc dưới */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
          <span>{toastMsg.text}</span>
          {toastMsg.actionText && (
            <button
              type="button"
              onClick={toastMsg.onAction}
              className="ml-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
            >
              {toastMsg.actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
