import React, { useState, useRef, useEffect } from 'react';
import { Screen } from '../types';

interface TroChuyenScreenProps {
  onNav?: (s: Screen) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
  citations?: { title: string; law: string; linkText?: string }[];
  steps?: string[];
  templateSnippet?: string;
  isError?: boolean;
  errorType?: 'network' | 'timeout' | 'server';
  errorTitle?: string;
  errorMessage?: string;
  retryPrompt?: string;
  failedUserMsgId?: string;
  replyToUserMsgId?: string;
  status?: 'sending' | 'success' | 'error';
}

export default function TroChuyenScreen({ onNav }: TroChuyenScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedLegalBase, setSelectedLegalBase] = useState<string>('Luật Đất đai 2024 & NĐ liên quan');
  const [showLegalPicker, setShowLegalPicker] = useState<boolean>(false);
  const [showAllWorkflowsModal, setShowAllWorkflowsModal] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Lắng nghe sự kiện kết nối mạng trình duyệt
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('🟢 Đã khôi phục kết nối mạng Internet.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('🔴 Đã mất kết nối mạng Internet.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  // 4 QUY TRÌNH TÁC VỤ NHANH
  const quickWorkflows = [
    {
      id: 'wf-dat-dai',
      title: 'Thẩm định điều kiện hồ sơ Đất đai',
      badge: 'Luật Đất đai 2024 • NĐ 101/2024/NĐ-CP',
      desc: 'Tự động đối soát Giấy tờ pháp lý, diện tích hạn mức, nguồn gốc và nghĩa vụ tài chính theo quy định mới nhất.',
      icon: 'fact_check',
      iconBg: 'bg-blue-50 text-[#004ac6] border-blue-200',
      samplePrompt: 'Thẩm định điều kiện cấp GCN QSDĐ và nghĩa vụ tài chính cho hồ sơ đất đai có nguồn gốc sử dụng trước 01/07/2014 theo Luật Đất đai 2024.',
    },
    {
      id: 'wf-bo-sung',
      title: 'Soạn thảo văn bản yêu cầu bổ sung TTHC',
      badge: 'Mẫu chuẩn Nghị định 61/2018/NĐ-CP',
      desc: 'Tạo phiếu hướng dẫn hoàn thiện hồ sơ chuẩn thể thức văn bản công vụ, trích dẫn rõ lý do và căn cứ pháp lý.',
      icon: 'edit_document',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      samplePrompt: 'Soạn thảo Thông báo yêu cầu bổ sung, hoàn thiện hồ sơ TTHC theo mẫu số 02 ban hành kèm Nghị định 61/2018/NĐ-CP cho hồ sơ chuyển nhượng QSDĐ.',
    },
    {
      id: 'wf-quy-hoach',
      title: 'Tra cứu quy hoạch phân khu & chỉ giới xây dựng',
      badge: 'Bản đồ quy hoạch đô thị • QCVN 01:2021',
      desc: 'Tra cứu bản đồ chỉ giới đỏ, cốt xây dựng, mật độ cho phép phục vụ thẩm định hồ sơ Cấp phép xây dựng nhà ở riêng lẻ.',
      icon: 'map',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      samplePrompt: 'Tra cứu chỉ giới đường đỏ, cốt xây dựng khống chế và mật độ xây dựng tối đa cho thửa đất nhà ở riêng lẻ tại phân khu đô thị H1-1.',
    },
    {
      id: 'wf-tien-do',
      title: 'Tổng hợp báo cáo tiến độ TTHC liên ngành',
      badge: 'Chi cục Thuế Ba Đình • Phòng TN&MT',
      desc: 'Rà soát các hồ sơ liên thông đang xin ý kiến xác nhận thuế và thẩm tra hồ sơ địa chính, cảnh báo chậm hạn.',
      icon: 'sync_alt',
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      samplePrompt: 'Tổng hợp danh sách các hồ sơ TTHC liên thông thuế - địa chính đang chờ xác định nghĩa vụ tài chính quá 03 ngày làm việc để phát hành văn bản đôn đốc.',
    },
  ];

  // GỢI Ý CÂU HỎI NGHIỆP VỤ
  const suggestedQuestions = [
    {
      type: 'question',
      icon: 'help',
      text: 'Hồ sơ ĐĐ-2025-0819 có đủ điều kiện miễn tiền sử dụng đất không?',
    },
    {
      type: 'question',
      icon: 'help',
      text: 'Thời hạn giải quyết trích lục hộ tịch bản điện tử quy định tối đa bao nhiêu giờ?',
    },
    {
      type: 'doc',
      icon: 'description',
      text: 'Tạo mẫu tờ trình phê duyệt cấp GCN QSDĐ lần đầu cho hộ gia đình cá nhân.',
    },
  ];

  // Danh mục 18 quy trình TTHC
  const all18Workflows = [
    { cat: 'Lĩnh vực Đất đai & Tài nguyên', items: ['Đăng ký cấp Giấy chứng nhận QSDĐ lần đầu', 'Đăng ký biến động quyền sử dụng đất, tài sản gắn liền với đất', 'Tách thửa, hợp thửa đất theo quy định mới', 'Gia hạn thời hạn sử dụng đất nông nghiệp', 'Chuyển mục đích sử dụng đất không phải xin phép'] },
    { cat: 'Lĩnh vực Xây dựng & Quy hoạch', items: ['Cấp giấy phép xây dựng nhà ở riêng lẻ đô thị', 'Cấp giấy phép cải tạo, sửa chữa công trình', 'Cung cấp thông tin quy hoạch xây dựng phân khu', 'Thẩm định hồ sơ thiết kế kỹ thuật công trình cấp III'] },
    { cat: 'Lĩnh vực Tư pháp & Hộ tịch', items: ['Trích lục bản sao hộ tịch điện tử liên thông', 'Chứng thực bản sao điện tử từ bản chính', 'Đăng ký kết hôn có yếu tố nước ngoài', 'Đăng ký khai sinh kết hợp cấp thẻ BHYT tự động'] },
    { cat: 'Giải quyết Đơn thư & Khiếu nại', items: ['Thụ lý xác minh giải quyết khiếu nại lần đầu', 'Quy trình giải quyết đơn tố giác tội phạm (Thông tư liên tịch 01)', 'Tổ chức đối thoại trực tiếp với công dân trong giải quyết đơn', 'Ban hành văn bản trả lời, hướng dẫn hoặc chuyển đơn công dân', 'Xử lý đơn thư trùng lặp, vượt cấp và lưu đơn'] },
  ];

  // Hàm sao chép nội dung văn bản vào Clipboard với cơ chế fallback
  const handleCopyText = async (text: string, successMsg = 'Đã sao chép'): Promise<boolean> => {
    if (!text) {
      showToast('⚠️ Không có nội dung để sao chép.');
      return false;
    }
    try {
      if (navigator?.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast(successMsg);
        return true;
      }
      // Fallback cho trình duyệt hoặc môi trường không có Clipboard API đầy đủ
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      if (successful) {
        showToast(successMsg);
        return true;
      } else {
        showToast('⚠️ Không thể sao chép. Vui lòng cấp quyền clipboard cho trình duyệt.');
        return false;
      }
    } catch (err) {
      console.error('Lỗi khi sao chép:', err);
      showToast('⚠️ Trình duyệt không hỗ trợ hoặc từ chối quyền truy cập bộ nhớ tạm.');
      return false;
    }
  };

  // Trích xuất văn bản thuần túy, sạch sẽ (loại bỏ nút UI, icon, nhãn giao diện)
  const getMessageCopyText = (m: ChatMessage): string => {
    if (m.sender === 'user') {
      return m.text.trim();
    }
    const parts: string[] = [];
    if (m.text) {
      parts.push(m.text.trim());
    }
    if (m.citations && m.citations.length > 0) {
      const citationsText = m.citations.map((c) => `• ${c.title}: ${c.law}`).join('\n');
      parts.push(`Căn cứ pháp lý trích dẫn:\n${citationsText}`);
    }
    if (m.steps && m.steps.length > 0) {
      const stepsText = m.steps.map((st, i) => `${i + 1}. ${st}`).join('\n');
      parts.push(`Kết quả phân tích & Hướng dẫn thực hiện:\n${stepsText}`);
    }
    if (m.templateSnippet) {
      parts.push(`--- Mẫu văn bản đính kèm ---\n${m.templateSnippet.trim()}`);
    }
    return parts.join('\n\n');
  };

  // Xử lý sao chép tin nhắn kèm phản hồi thị giác
  const handleCopyMessage = async (m: ChatMessage) => {
    const textToCopy = getMessageCopyText(m);
    const ok = await handleCopyText(textToCopy, 'Đã sao chép');
    if (ok) {
      setCopiedMsgId(m.id);
      setTimeout(() => {
        setCopiedMsgId((curr) => (curr === m.id ? null : curr));
      }, 2000);
    }
  };

  // Thực thi yêu cầu phân tích trợ lý AI với kiểm tra mạng, timeout, và xử lý lỗi
  const executeAiRequest = (
    prompt: string,
    userMsgId: string,
    errorMsgIdToRemove?: string,
    replaceAssistantMsgId?: string
  ) => {
    // Nếu là thao tác thử lại, gỡ bỏ thông báo lỗi cũ hoặc câu trả lời cũ cần tạo lại
    if (errorMsgIdToRemove || replaceAssistantMsgId) {
      setMessages((prev) =>
        prev.filter((m) => m.id !== errorMsgIdToRemove && m.id !== replaceAssistantMsgId)
      );
    }

    const effectiveOnline = isOnline && !simulatedOffline;

    // 1. Kiểm tra trạng thái ngoại tuyến / mất kết nối mạng
    if (!effectiveOnline) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, status: 'error' as const } : m))
        );

        const errMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Không thể kết nối đến máy chủ AI do mất kết nối mạng Internet. Vui lòng kiểm tra đường truyền và bấm "Thử lại".',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          errorType: 'network',
          errorTitle: 'Lỗi kết nối mạng (Ngoại tuyến)',
          retryPrompt: prompt,
          failedUserMsgId: userMsgId,
          status: 'error',
        };

        setMessages((prev) => [...prev, errMessage]);
        setIsGenerating(false);
        showToast('⚠️ Mất kết nối mạng. Vui lòng kiểm tra và thử lại.');
      }, 350);
      return;
    }

    // 2. Kiểm tra mô phỏng timeout nếu câu hỏi chứa [timeout]
    if (prompt.includes('[timeout]')) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, status: 'error' as const } : m))
        );

        const errMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Yêu cầu xử lý quá thời gian quy định (Timeout 504 Gateway Timeout). Máy chủ không phản hồi kịp thời. Vui lòng bấm "Thử lại".',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          errorType: 'timeout',
          errorTitle: 'Yêu cầu quá thời gian (Timeout)',
          retryPrompt: prompt.replace(/\[timeout\]/gi, '').trim() || prompt,
          failedUserMsgId: userMsgId,
          status: 'error',
        };

        setMessages((prev) => [...prev, errMessage]);
        setIsGenerating(false);
        showToast('⚠️ Yêu cầu quá thời gian (Timeout). Vui lòng thử lại.');
      }, 500);
      return;
    }

    // 3. Kiểm tra mô phỏng lỗi dịch vụ nếu câu hỏi chứa [lỗi] hoặc [error]
    if (prompt.includes('[lỗi]') || prompt.includes('[error]')) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, status: 'error' as const } : m))
        );

        const errMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Máy chủ AI phản hồi mã lỗi 500 (Internal Server Error): Quá tải cụm dịch vụ phân tích dữ liệu pháp luật. Vui lòng bấm "Thử lại".',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          errorType: 'server',
          errorTitle: 'Lỗi máy chủ dịch vụ AI (500)',
          retryPrompt: prompt.replace(/\[lỗi\]|\[error\]/gi, '').trim() || prompt,
          failedUserMsgId: userMsgId,
          status: 'error',
        };

        setMessages((prev) => [...prev, errMessage]);
        setIsGenerating(false);
        showToast('⚠️ Lỗi máy chủ AI. Vui lòng bấm Thử lại.');
      }, 500);
      return;
    }

    // 4. Xử lý phản hồi AI bình thường khi kết nối hợp lệ
    setTimeout(() => {
      let aiText = '';
      let citations: { title: string; law: string; linkText?: string }[] = [];
      let steps: string[] = [];
      let templateSnippet: string | undefined = undefined;

      const cleanPrompt = prompt.replace(/\[timeout\]|\[lỗi\]|\[error\]/gi, '').trim();

      if (cleanPrompt.includes('ĐĐ-2025-0819') || cleanPrompt.includes('miễn tiền sử dụng đất')) {
        aiText = 'Dựa trên đối soát dữ liệu hồ sơ ĐĐ-2025-0819 của công dân Nguyễn Văn A và quy định hiện hành:';
        citations = [
          { title: 'Điều 157 Luật Đất đai số 31/2024/QH15', law: 'Quy định các trường hợp được miễn, giảm tiền sử dụng đất, tiền thuê đất.' },
          { title: 'Nghị định số 103/2024/NĐ-CP', law: 'Quy định về tiền sử dụng đất, tiền thuê đất và thủ tục chứng minh điều kiện ưu đãi.' },
        ];
        steps = [
          'Hồ sơ ĐĐ-2025-0819 thuộc diện người có công với cách mạng (Thương binh 3/4 có giấy xác nhận của Sở LĐ-TB&XH).',
          'Hạn mức đất ở đề nghị công nhận là 160m² (nằm trong hạn mức đất ở quy định 180m² của khu vực Quận Cầu Giấy).',
          'Kết luận: Hồ sơ ĐỦ ĐIỀU KIỆN được giảm 70% tiền sử dụng đất theo quy định tại Khoản 2 Điều 19 Nghị định 103/2024/NĐ-CP.',
          'Đề xuất chuyên viên: Lập Phiếu chuyển thông tin địa chính sang Chi cục Thuế và đính kèm bản sao Quyết định trợ cấp người có công.',
        ];
      } else if (cleanPrompt.includes('hộ tịch bản điện tử') || cleanPrompt.includes('bao nhiêu giờ')) {
        aiText = 'Theo quy định tại Nghị định số 87/2020/NĐ-CP và Quyết định công bố TTHC liên thông của Bộ Tư pháp:';
        citations = [
          { title: 'Điều 14 Nghị định số 87/2020/NĐ-CP', law: 'Về cơ sở dữ liệu hộ tịch điện tử và đăng ký hộ tịch trực tuyến.' },
          { title: 'Quy trình TTHC một cửa điện tử', law: 'Chuẩn hóa xử lý trích lục tự động trên Cổng Dịch vụ công quốc gia.' },
        ];
        steps = [
          'Thời hạn giải quyết: Tối đa không quá 02 giờ làm việc kể từ thời điểm tiếp nhận hồ sơ hợp lệ trên hệ thống phần mềm Một cửa điện tử.',
          'Trường hợp tiếp nhận sau 15 giờ chiều: Được trả kết quả trong buổi sáng của ngày làm việc tiếp theo.',
          'Kết quả trả: Bản trích lục điện tử có ký số số hóa chuyên dùng, có giá trị pháp lý tương đương bản trích lục giấy.',
        ];
      } else if (cleanPrompt.includes('tờ trình') || cleanPrompt.includes('mẫu tờ trình')) {
        aiText = 'Dưới đây là mẫu chuẩn Tờ trình phê duyệt cấp Giấy chứng nhận QSDĐ lần đầu theo quy định tại Nghị định 101/2024/NĐ-CP:';
        citations = [
          { title: 'Nghị định 101/2024/NĐ-CP (Điều 31-35)', law: 'Trình tự, thủ tục đăng ký đất đai, tài sản gắn liền với đất và cấp GCN QSDĐ lần đầu.' },
          { title: 'Nghị định 30/2020/NĐ-CP', law: 'Quy định về thể thức và kỹ thuật trình bày văn bản hành chính công vụ.' },
        ];
        templateSnippet = `ỦY BAN NHÂN DÂN QUẬN/HUYỆN...
PHÒNG TÀI NGUYÊN VÀ MÔI TRƯỜNG
Số: .../TTr-TNMT

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
..., ngày ... tháng ... năm 2026

TỜ TRÌNH
Về việc cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản
gắn liền với đất lần đầu cho hộ gia đình, cá nhân

Kính gửi: Ủy ban nhân dân quận/huyện...

Căn cứ Luật Đất đai ngày 18 tháng 01 năm 2024;
Căn cứ Nghị định số 101/2024/NĐ-CP ngày 29 tháng 07 năm 2024 của Chính phủ;
Xét hồ sơ đề nghị cấp GCN QSDĐ của ông/bà: ...;
Phòng Tài nguyên và Môi trường kính trình UBND quận/huyện xem xét, quyết định:
1. Cấp Giấy chứng nhận QSDĐ cho Thửa đất số: ..., Tờ bản đồ số: ..., Diện tích: ...m².
2. Nghĩa vụ tài chính: Đã hoàn thành theo Thông báo nộp tiền của cơ quan Thuế.`;
      } else {
        aiText = `Trợ lý công vụ đã tiếp nhận yêu cầu: "${cleanPrompt}". Dựa trên CSDL văn bản quy phạm pháp luật và nghiệp vụ chuyên môn:`;
        citations = [
          { title: selectedLegalBase, law: 'Văn bản áp dụng đối soát nghiệp vụ chuyên môn liên quan.' },
          { title: 'Quy chuẩn thủ tục hành chính công vụ', law: 'Quy chuẩn hướng dẫn tiếp nhận, phân loại và xử lý hồ sơ một cửa.' },
        ];
        steps = [
          'Hệ thống đã phân tích các tiêu chí pháp lý và thẩm quyền thực thi đối với nội dung trên.',
          'Đối chiếu thời hạn giải quyết: Đảm bảo không quá thời hạn quy định tại bộ TTHC chuẩn.',
          'Chuyên viên có thể tải mẫu văn bản, lập phiếu chuyển hoặc áp dụng trực tiếp vào quy trình xử lý đơn đang mở.',
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        citations,
        steps,
        templateSnippet,
        status: 'success',
        retryPrompt: cleanPrompt,
        replyToUserMsgId: userMsgId,
      };

      setMessages((prev) => [
        ...prev.map((m) => (m.id === userMsgId ? { ...m, status: 'success' as const } : m)),
        aiMsg,
      ]);
      setIsGenerating(false);
    }, 600);
  };

  // Gửi câu hỏi mới từ ô nhập hoặc nút gợi ý
  const handleSendMessage = (textToSend?: string) => {
    if (isGenerating) return; // Ngăn chặn gửi trùng lặp khi đang xử lý

    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt && attachedFiles.length === 0) return;

    const finalPrompt = prompt || `Phân tích hồ sơ đính kèm: ${attachedFiles.join(', ')}`;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: finalPrompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    executeAiRequest(finalPrompt, userMsg.id);
  };

  // Thử lại khi nhấn nút Retry trên tin nhắn thông báo lỗi của Assistant
  const handleRetry = (errorMsg: ChatMessage) => {
    if (isGenerating) return; // Vô hiệu hóa và chặn gọi liên tiếp

    const retryPrompt = errorMsg.retryPrompt || '';
    if (!retryPrompt) return;

    setIsGenerating(true);

    if (errorMsg.failedUserMsgId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === errorMsg.failedUserMsgId ? { ...m, status: 'sending' as const } : m
        )
      );
    }

    executeAiRequest(
      retryPrompt,
      errorMsg.failedUserMsgId || `usr-${Date.now()}`,
      errorMsg.id
    );
  };

  // Thử lại trực tiếp từ tin nhắn của người dùng
  const handleRetryForUserMsg = (userMsg: ChatMessage) => {
    if (isGenerating) return;

    setIsGenerating(true);
    showToast('🔄 Đang gửi lại câu hỏi...');
    setMessages((prev) =>
      prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'sending' as const } : m))
    );

    const associatedErrorMsg = messages.find(
      (m) => m.isError && (m.failedUserMsgId === userMsg.id || m.retryPrompt === userMsg.text)
    );

    executeAiRequest(userMsg.text, userMsg.id, associatedErrorMsg?.id);
  };

  // Thử lại / Tạo lại câu trả lời cho phản hồi của Assistant
  const handleRetryAssistantMessage = (aiMsg: ChatMessage) => {
    if (isGenerating) return;

    let prompt = aiMsg.retryPrompt;
    let targetUserMsgId = aiMsg.replyToUserMsgId;

    if (!prompt) {
      const aiIdx = messages.findIndex((m) => m.id === aiMsg.id);
      for (let i = aiIdx - 1; i >= 0; i--) {
        if (messages[i].sender === 'user') {
          prompt = messages[i].text;
          targetUserMsgId = messages[i].id;
          break;
        }
      }
    }

    if (!prompt) {
      showToast('⚠️ Không tìm thấy nội dung câu hỏi để thử lại.');
      return;
    }

    setIsGenerating(true);
    showToast('🔄 Đang thử lại và tạo lại phản hồi mới...');

    if (targetUserMsgId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === targetUserMsgId ? { ...m, status: 'sending' as const } : m))
      );
    }

    executeAiRequest(prompt, targetUserMsgId || `usr-${Date.now()}`, undefined, aiMsg.id);
  };

  // Thử lại câu hỏi gần nhất từ thanh công cụ đầu trang
  const handleRetryLast = () => {
    if (isGenerating) return;

    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (!lastUserMsg) {
      showToast('⚠️ Chưa có câu hỏi nào để thử lại.');
      return;
    }

    const lastUserIdx = messages.findIndex((m) => m.id === lastUserMsg.id);
    const subsequentMsg = messages[lastUserIdx + 1];

    setIsGenerating(true);
    showToast('🔄 Đang thử lại câu hỏi gần nhất...');

    setMessages((prev) =>
      prev.map((m) => (m.id === lastUserMsg.id ? { ...m, status: 'sending' as const } : m))
    );

    const errorIdToRemove = subsequentMsg?.isError ? subsequentMsg.id : undefined;
    const assistantIdToRemove =
      subsequentMsg && subsequentMsg.sender === 'assistant' && !subsequentMsg.isError
        ? subsequentMsg.id
        : undefined;

    executeAiRequest(lastUserMsg.text, lastUserMsg.id, errorIdToRemove, assistantIdToRemove);
  };

  const handleApplyWorkflow = (wf: typeof quickWorkflows[0]) => {
    setInputPrompt(wf.samplePrompt);
    textareaRef.current?.focus();
    showToast(`✓ Đã áp dụng quy trình: "${wf.title}"`);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden font-body-md select-none relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6">
        {messages.length > 0 && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline && !simulatedOffline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                Phiên trò chuyện trợ lý công vụ
              </span>
              <span className="text-[11px] text-slate-400">({messages.length} tin nhắn)</span>
              {(!isOnline || simulatedOffline) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  <span className="material-symbols-outlined text-[12px]">wifi_off</span>
                  <span>Mất kết nối mạng</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {messages.some((m) => m.sender === 'user') && (
                <button
                  type="button"
                  onClick={handleRetryLast}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 hover:text-[#004ac6] border border-slate-200 transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Thử lại câu hỏi gần nhất"
                  aria-label="Thử lại câu hỏi gần nhất"
                >
                  <span className={`material-symbols-outlined text-[15px] ${isGenerating ? 'animate-spin text-[#004ac6]' : 'text-slate-600'}`}>
                    replay
                  </span>
                  <span>{isGenerating ? 'Đang gửi lại...' : 'Thử lại câu hỏi'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const next = !simulatedOffline;
                  setSimulatedOffline(next);
                  showToast(next ? '🔴 Đã bật mô phỏng Mất mạng (Thử gửi tin để kiểm tra nút Thử lại)' : '🟢 Đã khôi phục mạng Online bình thường');
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${simulatedOffline
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 font-bold'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                title="Bật/Tắt mô phỏng mất kết nối mạng để kiểm thử nút Thử lại"
                aria-label="Chuyển đổi mô phỏng kết nối mạng"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {simulatedOffline ? 'wifi_off' : 'wifi'}
                </span>
                <span className="hidden sm:inline">
                  {simulatedOffline ? 'Mô phỏng mất mạng: BẬT' : 'Mô phỏng mất mạng'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setInputPrompt('');
                  showToast('Đã bắt đầu cuộc trò chuyện mới.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#004ac6] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>Cuộc trò chuyện mới</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANDING VIEW (HIỂN THỊ KHI CHƯA CHAT HOẶC LUÔN HIỆN GỢI Ý ĐẦU PHIÊN)      */}
        {/* ========================================================================= */}
        {messages.length === 0 && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* 1. HEADER: QUY TRÌNH TÁC VỤ NHANH NGHIỆP VỤ */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-[20px] text-[#004ac6]">
                  quick_reference_all
                </span>
                <h2 className="text-xs font-extrabold text-slate-600 tracking-wider font-headline-md uppercase">
                  QUY TRÌNH TÁC VỤ NHANH NGHIỆP VỤ
                </h2>
                {(!isOnline || simulatedOffline) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    <span className="material-symbols-outlined text-[12px]">wifi_off</span>
                    <span>Mất kết nối</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !simulatedOffline;
                    setSimulatedOffline(next);
                    showToast(next ? '🔴 Đã bật mô phỏng Mất mạng (Thử gửi tin để kiểm tra nút Thử lại)' : '🟢 Đã khôi phục mạng Online bình thường');
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${simulatedOffline
                    ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  title="Mô phỏng mất mạng để kiểm tra nút Thử lại"
                  aria-label="Chuyển đổi mô phỏng kết nối mạng"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {simulatedOffline ? 'wifi_off' : 'wifi'}
                  </span>
                  <span>{simulatedOffline ? 'Mất mạng (Mô phỏng)' : 'Mạng: Trực tuyến'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllWorkflowsModal(true)}
                  className="text-xs font-semibold text-[#004ac6] hover:text-[#003da8] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Xem tất cả 18 quy trình TTHC</span>
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>

            {/* 2. GRID 4 THẺ TÁC VỤ NHANH (2 x 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => handleApplyWorkflow(wf)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md p-4 transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${wf.iconBg}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{wf.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13.5px] font-bold text-slate-900 group-hover:text-[#004ac6] transition-colors leading-tight">
                          {wf.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-label-technical">
                          {wf.badge}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#004ac6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0">
                      call_made
                    </span>
                  </div>

                  <p className="text-[12px] text-slate-600 leading-relaxed mt-2.5">
                    {wf.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* 3. GỢI Ý CÂU HỎI NGHIỆP VỤ CHUYÊN VIÊN THƯỜNG TRA CỨU */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="text-amber-500">💡</span>
                <span>Gợi ý câu hỏi nghiệp vụ chuyên viên thường tra cứu:</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.text)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200/90 hover:border-blue-300 text-xs font-medium text-slate-700 hover:text-[#004ac6] shadow-2xs transition-all cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">
                      {q.icon}
                    </span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MESSAGE STREAM (KHI ĐÃ CÓ HỎI ĐÁP)                                        */}
        {/* ========================================================================= */}
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 animate-fade-in ${m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {/* 1. HIỂN THỊ TIN NHẮN LỖI (KÈM NÚT THỬ LẠI & SAO CHÉP) */}
                {m.isError ? (
                  <div className="flex gap-3 animate-fade-in justify-start w-full">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">
                        {m.errorType === 'network' ? 'wifi_off' : m.errorType === 'timeout' ? 'timer_off' : 'error'}
                      </span>
                    </div>

                    <div className="max-w-2xl w-full rounded-2xl p-4 text-xs leading-relaxed space-y-3 bg-rose-50/90 text-slate-800 border border-rose-200 shadow-2xs rounded-tl-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-bold text-rose-900 text-[12.5px] flex items-center gap-1.5">
                            <span>{m.errorTitle || 'Lỗi gửi yêu cầu'}</span>
                          </div>
                          <p className="text-rose-700 text-[11.5px] leading-relaxed">{m.text}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-rose-200/70 mt-1 flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-[10.5px] text-rose-500">
                          <span>{m.timestamp}</span>
                          <span>•</span>
                          <span>Có thể thử lại</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-100/70 text-slate-700 border border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Sao chép thông báo lỗi"
                            aria-label="Sao chép nội dung thông báo lỗi"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedMsgId === m.id ? 'check' : 'content_copy'}
                            </span>
                            <span>{copiedMsgId === m.id ? 'Đã sao chép' : 'Sao chép'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRetry(m)}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                            title="Thử lại gửi câu hỏi ban đầu"
                            aria-label="Thử lại gửi câu hỏi ban đầu"
                          >
                            <span className={`material-symbols-outlined text-[15px] ${isGenerating ? 'animate-spin' : ''}`}>
                              replay
                            </span>
                            <span>{isGenerating ? 'Đang gửi lại...' : 'Thử lại'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 2. HIỂN THỊ TIN NHẮN BÌNH THƯỜNG (USER HOẶC ASSISTANT) */}
                    {m.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${m.sender === 'user'
                        ? 'bg-[#004ac6] text-white shadow-xs rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                        }`}
                    >
                      <p className="whitespace-pre-wrap font-medium leading-relaxed">{m.text}</p>

                      {/* Citations / Pháp lý */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 mt-2">
                          <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-tight flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">menu_book</span>
                            Căn cứ pháp lý trích dẫn:
                          </span>
                          {m.citations.map((c, i) => (
                            <div key={i} className="text-[11.5px] text-slate-700">
                              <strong className="text-slate-900">• {c.title}:</strong> {c.law}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Steps / Checklist */}
                      {m.steps && m.steps.length > 0 && (
                        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block">
                            Kết quả phân tích &amp; Hướng dẫn thực hiện:
                          </span>
                          {m.steps.map((st, i) => (
                            <div key={i} className="flex items-start gap-2 text-[12px] text-slate-700">
                              <span className="material-symbols-outlined text-[15px] text-emerald-600 shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Template snippet if available */}
                      {m.templateSnippet && (
                        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed relative group mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleCopyText(m.templateSnippet || '', '✓ Đã sao chép mẫu văn bản vào bộ nhớ tạm!');
                            }}
                            className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-blue-300 font-sans cursor-pointer transition-colors flex items-center gap-1"
                            title="Sao chép nội dung mẫu văn bản"
                          >
                            <span className="material-symbols-outlined text-[12px]">content_copy</span>
                            <span>Sao chép mẫu</span>
                          </button>
                          <pre className="whitespace-pre-wrap">{m.templateSnippet}</pre>
                        </div>
                      )}

                      {/* Footer tin nhắn: Thời gian, Trạng thái & Các nút chức năng Sao chép / Thử lại */}
                      {m.sender === 'assistant' ? (
                        <div className="pt-3 mt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="material-symbols-outlined text-[14px] text-blue-600">verified</span>
                            <span>Trợ lý AI Công vụ</span>
                            <span>•</span>
                            <span>{m.timestamp}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Nút Thử lại (Tạo lại câu trả lời này từ Trợ lý AI) */}
                            {/* <button
                              type="button"
                              onClick={() => handleRetryAssistantMessage(m)}
                              disabled={isGenerating}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-[#004ac6] border border-blue-200 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Thử lại / Tạo lại câu trả lời này"
                              aria-label="Thử lại tạo lại câu trả lời này"
                            >
                              <span className={`material-symbols-outlined text-[15px] ${isGenerating ? 'animate-spin' : ''}`}>
                                replay
                              </span>
                              <span>Thử lại</span>
                            </button> */}

                            {/* Nút Sao chép phản hồi */}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 active:scale-95 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                              title="Sao chép toàn bộ phản hồi"
                              aria-label="Sao chép toàn bộ nội dung phản hồi"
                            >
                              <span className="material-symbols-outlined text-[15px] text-slate-600">
                                {copiedMsgId === m.id ? 'check' : 'content_copy'}
                              </span>
                              {/* <span>{copiedMsgId === m.id ? 'Đã sao chép' : 'Sao chép'}</span> */}
                            </button>

                            {/* Nút Lưu sổ tay */}
                            <button
                              type="button"
                              onClick={() => showToast('✓ Đã lưu phản hồi vào Sổ tay nghiệp vụ của chuyên viên.')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
                              title="Lưu sổ tay nghiệp vụ"
                              aria-label="Lưu sổ tay nghiệp vụ"
                            >
                              <span className="material-symbols-outlined text-[15px]">bookmark</span>
                              <span>Lưu</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 mt-1 border-t border-blue-400/30 flex items-center justify-between flex-wrap gap-2 text-xs text-blue-100">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span>{m.timestamp}</span>
                            {m.status === 'error' && (
                              <span className="inline-flex items-center gap-0.5 text-rose-200 font-bold bg-rose-900/60 px-1.5 py-0.5 rounded">
                                <span className="material-symbols-outlined text-[11px]">error</span>
                                <span>Chưa gửi được</span>
                              </span>
                            )}
                            {m.status === 'sending' && (
                              <span className="inline-flex items-center gap-0.5 text-blue-200">
                                <span className="material-symbols-outlined text-[11px] animate-spin">sync</span>
                                <span>Đang gửi...</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Nút Thử lại gửi câu hỏi */}
                            <button
                              type="button"
                              onClick={() => handleRetryForUserMsg(m)}
                              disabled={isGenerating}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-700/80 hover:bg-blue-600 active:scale-95 text-white border border-blue-400/40 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Thử lại gửi câu hỏi này"
                              aria-label="Thử lại gửi câu hỏi này"
                            >
                              <span className={`material-symbols-outlined text-[13px] ${isGenerating ? 'animate-spin' : ''}`}>
                                replay
                              </span>
                              {/* <span>Thử lại</span> */}
                            </button>

                            {/* Nút Sao chép câu hỏi */}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-700/60 active:scale-95 text-blue-100 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                              title="Sao chép câu hỏi"
                              aria-label="Sao chép câu hỏi"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {copiedMsgId === m.id ? 'check' : 'content_copy'}
                              </span>
                              {/* <span>{copiedMsgId === m.id ? 'Đã sao chép' : 'Sao chép'}</span> */}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-xs">
                        MA
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>Trợ lý công vụ đang tra cứu CSDL văn bản quy phạm pháp luật và đối soát hồ sơ...</span>
                </div>
              </div>
            )}

            {/* Thanh tác vụ nhanh dưới câu trả lời gần nhất */}
            {!isGenerating && messages.length > 0 && messages[messages.length - 1].sender === 'assistant' && !messages[messages.length - 1].isError && (
              <div className="flex justify-center pt-2 pb-1">
                <button
                  type="button"
                  onClick={handleRetryLast}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-blue-50 active:scale-95 text-[#004ac6] border border-blue-200 hover:border-blue-300 shadow-2xs hover:shadow-xs text-xs font-bold transition-all cursor-pointer"
                  title="Thử lại và tạo lại câu trả lời gần nhất"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  <span>Thử lại câu trả lời gần nhất</span>
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM INPUT BAR (CARD HỎI TRỢ LÝ CÔNG VỤ)                                 */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-6 lg:px-12 pb-5 pt-2 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-3 focus-within:border-[#004ac6] focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all">
            {/* Input prompt text */}
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isGenerating) {
                    handleSendMessage();
                  }
                }
              }}
              placeholder="Hỏi Trợ lý công vụ hoặc dán trích yếu hồ sơ TTHC, mã hồ sơ Một cửa (ví dụ: ĐĐ-2025-0819)..."
              className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none px-1 leading-relaxed"
            />

            {/* Attached file badges if any */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-1 py-1 mb-1">
                {attachedFiles.map((fn, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-medium"
                  >
                    <span className="material-symbols-outlined text-[13px]">attach_file</span>
                    <span>{fn}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="hover:text-rose-600 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 flex-wrap gap-2">
              {/* Left Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Đính kèm hồ sơ */}
                <button
                  type="button"
                  onClick={() => {
                    const sampleName = `Ho_so_TTHC_${Date.now().toString().slice(-4)}.pdf`;
                    setAttachedFiles((prev) => [...prev, sampleName]);
                    showToast(`✓ Đã đính kèm: ${sampleName}`);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-500">attach_file</span>
                  <span>Đính kèm hồ sơ / Tài liệu TTHC (.pdf, scan)</span>
                </button>

                {/* Ghi âm lệnh / Biên bản họp */}
                <button
                  type="button"
                  onClick={() => {
                    setIsRecording(!isRecording);
                    if (!isRecording) {
                      showToast('🎙 Đang bắt đầu ghi âm giọng nói chỉ đạo / biên bản họp...');
                    } else {
                      showToast('✓ Đã dừng ghi âm và bóc tách thành văn bản.');
                      setInputPrompt((prev) => (prev ? prev + ' ' : '') + 'Ý kiến chỉ đạo: Yêu cầu khẩn trương rà soát nghĩa vụ tài chính đất đai.');
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-medium border transition-colors cursor-pointer ${isRecording
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse font-bold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                >
                  <span className={`material-symbols-outlined text-[15px] ${isRecording ? 'text-rose-600' : 'text-slate-500'}`}>
                    mic
                  </span>
                  <span>{isRecording ? 'Đang ghi âm...' : 'Ghi âm lệnh / Biên bản họp'}</span>
                </button>

                {/* Căn cứ pháp lý selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLegalPicker(!showLegalPicker)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <span className="text-[#004ac6] font-bold">@</span>
                    <span>Căn cứ pháp lý: <strong className="font-semibold">{selectedLegalBase}</strong></span>
                    <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                  </button>

                  {showLegalPicker && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1 animate-scale-up">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Chọn bộ văn bản căn cứ ưu tiên:
                      </div>
                      {[
                        'Luật Đất đai 2024 & NĐ liên quan',
                        'Nghị định 61/2018/NĐ-CP (Cơ chế một cửa)',
                        'Luật Xây dựng 2020 & QCVN 01:2021',
                        'Luật Tố tụng hình sự 2015 & TTLT 01/2017',
                        'Luật Hộ tịch & CSDL quốc gia dân cư',
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setSelectedLegalBase(item);
                            setShowLegalPicker(false);
                            showToast(`✓ Đã áp dụng bộ căn cứ: ${item}`);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11.5px] transition-colors cursor-pointer flex items-center justify-between ${selectedLegalBase === item
                            ? 'bg-blue-50 text-[#004ac6] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <span>{item}</span>
                          {selectedLegalBase === item && (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isGenerating || (!inputPrompt.trim() && attachedFiles.length === 0)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003da8] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                title={isGenerating ? 'Trợ lý đang xử lý...' : 'Gửi câu hỏi'}
                aria-label="Gửi câu hỏi"
              >
                <span>{isGenerating ? 'Đang gửi...' : 'Gửi'}</span>
                <span className={`material-symbols-outlined text-[15px] ${isGenerating ? 'animate-spin' : ''}`}>
                  {isGenerating ? 'sync' : 'arrow_upward'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: XEM TẤT CẢ 18 QUY TRÌNH TTHC                                       */}
      {/* ========================================================================= */}
      {showAllWorkflowsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#004ac6] border border-blue-200 flex items-center justify-center shadow-2xs">
                  <span className="material-symbols-outlined text-[20px]">account_tree</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh mục 18 quy trình thủ tục hành chính công vụ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ tự động hóa bóc tách, đối soát điều kiện và lập văn bản công vụ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllWorkflowsModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {all18Workflows.map((grp, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]"></span>
                    <span>{grp.cat}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {grp.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => {
                          setShowAllWorkflowsModal(false);
                          handleSendMessage(`Hướng dẫn quy trình và các căn cứ pháp lý để thực hiện thủ tục: ${item}`);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 text-left text-xs text-slate-700 hover:text-[#004ac6] transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                      >
                        <span className="font-medium">{item}</span>
                        <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-[#004ac6] transition-colors">
                          arrow_forward
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowAllWorkflowsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
