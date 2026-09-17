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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

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

  const handleSendMessage = (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    // AI Simulated Response
    setTimeout(() => {
      let aiText = '';
      let citations: { title: string; law: string; linkText?: string }[] = [];
      let steps: string[] = [];
      let templateSnippet: string | undefined = undefined;

      if (prompt.includes('ĐĐ-2025-0819') || prompt.includes('miễn tiền sử dụng đất')) {
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
      } else if (prompt.includes('hộ tịch bản điện tử') || prompt.includes('bao nhiêu giờ')) {
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
      } else if (prompt.includes('tờ trình') || prompt.includes('mẫu tờ trình')) {
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
        aiText = `Trợ lý công vụ đã tiếp nhận yêu cầu: "${prompt}". Dựa trên CSDL văn bản quy phạm pháp luật và nghiệp vụ chuyên môn:`;
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
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 600);
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

      {/* Main Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6">
        {/* Top Breadcrumb / Reset button if in message view */}
        {messages.length > 0 && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                Phiên trò chuyện trợ lý công vụ
              </span>
              <span className="text-[11px] text-slate-400">({messages.length} tin nhắn)</span>
            </div>
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
        )}

        {/* ========================================================================= */}
        {/* LANDING VIEW (HIỂN THỊ KHI CHƯA CHAT HOẶC LUÔN HIỆN GỢI Ý ĐẦU PHIÊN)      */}
        {/* ========================================================================= */}
        {messages.length === 0 && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* 1. HEADER: QUY TRÌNH TÁC VỤ NHANH NGHIỆP VỤ */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#004ac6]">
                  quick_reference_all
                </span>
                <h2 className="text-xs font-extrabold text-slate-600 tracking-wider font-headline-md uppercase">
                  QUY TRÌNH TÁC VỤ NHANH NGHIỆP VỤ
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAllWorkflowsModal(true)}
                className="text-xs font-semibold text-[#004ac6] hover:text-[#003da8] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Xem tất cả 18 quy trình TTHC</span>
                <span className="text-sm">→</span>
              </button>
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
                className={`flex gap-3 animate-fade-in ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                    m.sender === 'user'
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
                          navigator.clipboard?.writeText(m.templateSnippet || '');
                          showToast('✓ Đã sao chép nội dung văn bản vào bộ nhớ tạm!');
                        }}
                        className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-blue-300 font-sans cursor-pointer transition-colors"
                      >
                        Sao chép mẫu
                      </button>
                      <pre className="whitespace-pre-wrap">{m.templateSnippet}</pre>
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {m.sender === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(m.text);
                            showToast('✓ Đã sao chép phản hồi của trợ lý!');
                          }}
                          className="hover:text-slate-700 cursor-pointer flex items-center gap-0.5"
                          title="Sao chép"
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('✓ Đã lưu phản hồi vào Sổ tay nghiệp vụ của chuyên viên.')}
                          className="hover:text-slate-700 cursor-pointer flex items-center gap-0.5"
                          title="Lưu sổ tay"
                        >
                          <span className="material-symbols-outlined text-[14px]">bookmark</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-xs">
                    MA
                  </div>
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
                  handleSendMessage();
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
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-medium border transition-colors cursor-pointer ${
                    isRecording
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
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11.5px] transition-colors cursor-pointer flex items-center justify-between ${
                            selectedLegalBase === item
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
                disabled={!inputPrompt.trim() && attachedFiles.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003da8] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Gửi</span>
                <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
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
