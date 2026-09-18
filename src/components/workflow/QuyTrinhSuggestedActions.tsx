import React, { useState } from 'react';
import { matchWorkflowByLoaiDon } from '../../constants/workflows';
import { WorkflowDefinition } from '../../types/workflow';

export interface SuggestedAction {
  id: string;
  stepId: string;
  stepNumber: number;
  title: string;
  shortTitle: string;
  category: 'primary' | 'secondary' | 'alternative';
  icon: string;
  color: 'blue' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';
  canCuPhapLy: string;
  responsibleRole: string;
  responsibleUnit: string;
  deadlineDays: number;
  deadlineText: string;
  description: string;
  defaultDocTitle: string;
  defaultAssignee: string;
  badgeLabel: string;
}

export function getSuggestedActionsForWorkflow(loaiDon: string): {
  workflow: WorkflowDefinition;
  actions: SuggestedAction[];
} {
  const workflow = matchWorkflowByLoaiDon(loaiDon);

  let actions: SuggestedAction[] = [];

  if (workflow.id === 'to-giac') {
    actions = [
      {
        id: 'act-tg-1',
        stepId: 'step-3',
        stepNumber: 3,
        title: 'Lập phiếu phân công Điều tra viên thụ lý chính',
        shortTitle: 'Phân công Điều tra viên',
        category: 'primary',
        icon: 'assignment_ind',
        color: 'blue',
        canCuPhapLy: 'Điều 145, 146 Bộ luật Tố tụng hình sự 2015 & TTLT 01/2017/TTLT-BCA-BQP-BTC-BNN&PTNT-VKSNDTC',
        responsibleRole: 'Thủ trưởng / Phó Thủ trưởng Cơ quan CSĐT',
        responsibleUnit: 'Cơ quan CSĐT Công an TP. Hà Nội',
        deadlineDays: 3,
        deadlineText: '03 ngày kể từ khi tiếp nhận',
        description: 'Ban hành Quyết định phân công Điều tra viên có chuyên môn thuộc Đội Cảnh sát Kinh tế (PC03) thụ lý xác minh nguồn tin tội phạm lừa đảo.',
        defaultDocTitle: 'Quyết định phân công Điều tra viên thụ lý nguồn tin tội phạm',
        defaultAssignee: 'Trung tá Lê Văn Nam (ĐTV Đội Điều tra Kinh tế - PC03)',
        badgeLabel: 'Gợi ý ưu tiên số 1',
      },
      {
        id: 'act-tg-2',
        stepId: 'step-4',
        stepNumber: 4,
        title: 'Đề xuất xác minh thực tế & Tra soát sao kê dòng tiền',
        shortTitle: 'Tra soát dòng tiền ngân hàng',
        category: 'secondary',
        icon: 'account_balance',
        color: 'indigo',
        canCuPhapLy: 'Điều 174 Bộ luật Hình sự 2015 & Quy chế phối hợp liên ngành Công an - Ngân hàng Nhà nước',
        responsibleRole: 'Điều tra viên thụ lý chính',
        responsibleUnit: 'Đội Điều tra Kinh tế (PC03)',
        deadlineDays: 15,
        deadlineText: '15 ngày làm việc',
        description: 'Gửi công văn đến Ngân hàng (VCB, BIDV, TCB) yêu cầu sao kê lịch sử tài khoản của Công ty CP Đô thị X để phục vụ giám định tài chính thiệt hại 3,5 tỷ VNĐ.',
        defaultDocTitle: 'Văn bản yêu cầu các tổ chức tín dụng cung cấp sao kê giao dịch tài khoản',
        defaultAssignee: 'Đ/c Nguyễn Minh Anh & Trung tá Lê Văn Nam',
        badgeLabel: 'Nghiệp vụ xác minh',
      },
      {
        id: 'act-tg-3',
        stepId: 'step-2',
        stepNumber: 2,
        title: 'Đề xuất chuyển nhập hồ sơ vào Vụ việc liên quan (VV-2026-0042)',
        shortTitle: 'Nhập vào vụ án PC03',
        category: 'secondary',
        icon: 'folder_shared',
        color: 'purple',
        canCuPhapLy: 'Điều 170 BLTTHS 2015 về nhập hoặc tách vụ án hình sự',
        responsibleRole: 'Cán bộ thụ lý / Thủ trưởng CQĐT',
        responsibleUnit: 'Phòng Cảnh sát Kinh tế (PC03)',
        deadlineDays: 1,
        deadlineText: 'Trong 24h làm việc',
        description: 'Gộp hồ sơ đơn Đ-2026-00125 vào Vụ án VV-2026-0042 đang thụ lý điều tra hành vi lừa đảo dự án KĐT Y (Trùng khớp nội dung 86%).',
        defaultDocTitle: 'Báo cáo đề xuất nhập nguồn tin vào Vụ án VV-2026-0042',
        defaultAssignee: 'Phòng PC03 - Đội Điều tra 3',
        badgeLabel: 'Trùng khớp CSDL 86%',
      },
      {
        id: 'act-tg-4',
        stepId: 'step-2',
        stepNumber: 2,
        title: 'Ban hành Phiếu hướng dẫn bổ sung tài liệu, chứng cứ gốc',
        shortTitle: 'Yêu cầu bổ sung chứng cứ',
        category: 'alternative',
        icon: 'help_outline',
        color: 'amber',
        canCuPhapLy: 'Khoản 3 Điều 145 Bộ luật Tố tụng hình sự 2015',
        responsibleRole: 'Cán bộ thụ lý hồ sơ (Nguyễn Minh Anh)',
        responsibleUnit: 'Bộ phận Tiếp nhận & Xử lý đơn',
        deadlineDays: 7,
        deadlineText: '07 ngày làm việc',
        description: 'Yêu cầu người nộp (Nguyễn Văn A) và Luật sư Lê Quang Đ nộp bản sao kê có mộc đỏ ngân hàng và Giấy ủy quyền công chứng hợp lệ.',
        defaultDocTitle: 'Phiếu hướng dẫn bổ sung bản gốc chứng cứ và hợp đồng ủy quyền công chứng',
        defaultAssignee: 'Người làm đơn: Nguyễn Văn A',
        badgeLabel: 'Thiếu chứng cứ gốc',
      },
    ];
  } else if (workflow.id === 'khieu-nai') {
    actions = [
      {
        id: 'act-kn-1',
        stepId: 'step-2',
        stepNumber: 2,
        title: 'Ban hành Thông báo thụ lý giải quyết khiếu nại (Lần 1)',
        shortTitle: 'Ban hành Thông báo thụ lý',
        category: 'primary',
        icon: 'mark_email_read',
        color: 'blue',
        canCuPhapLy: 'Điều 27 Luật Khiếu nại 2011; Điều 74, 75, 83 Luật Đất đai 2024',
        responsibleRole: 'Chủ tịch UBND / Thủ trưởng cơ quan có thẩm quyền',
        responsibleUnit: 'UBND quận/huyện',
        deadlineDays: 10,
        deadlineText: '10 ngày kể từ ngày tiếp nhận',
        description: 'Lập và ban hành Thông báo thụ lý giải quyết khiếu nại đối với đơn giá bồi thường đất Thửa 45 gửi người khiếu nại.',
        defaultDocTitle: 'Thông báo thụ lý giải quyết khiếu nại về bồi thường, hỗ trợ đất',
        defaultAssignee: 'Chủ tịch UBND quận',
        badgeLabel: 'Gợi ý ưu tiên số 1',
      },
      {
        id: 'act-kn-2',
        stepId: 'step-3',
        stepNumber: 3,
        title: 'Lập Quyết định thành lập Tổ xác minh thực địa',
        shortTitle: 'Thành lập Tổ xác minh',
        category: 'secondary',
        icon: 'groups',
        color: 'indigo',
        canCuPhapLy: 'Điều 29 Luật Khiếu nại 2011; Nghị định số 124/2020/NĐ-CP',
        responsibleRole: 'Trưởng phòng TN&MT / Chánh Thanh tra',
        responsibleUnit: 'Phòng Tài nguyên và Môi trường',
        deadlineDays: 5,
        deadlineText: '05 ngày làm việc',
        description: 'Thành lập Tổ công tác liên ngành tiến hành thẩm tra, đo đạc lại hiện trạng thực địa và đối chiếu phương án áp giá bồi thường 18,5 triệu/m².',
        defaultDocTitle: 'Quyết định thành lập Tổ xác minh hiện trạng Thửa đất số 45',
        defaultAssignee: 'Tổ trưởng: Đ/c Hoàng Minh Tuấn (Phó Trưởng phòng TN&MT)',
        badgeLabel: 'Đo đạc thực địa',
      },
      {
        id: 'act-kn-3',
        stepId: 'step-4',
        stepNumber: 4,
        title: 'Lên lịch tổ chức Đối thoại trực tiếp với công dân',
        shortTitle: 'Đặt lịch đối thoại',
        category: 'secondary',
        icon: 'record_voice_over',
        color: 'emerald',
        canCuPhapLy: 'Điều 30 Luật Khiếu nại 2011 (Thủ tục bắt buộc trong giải quyết khiếu nại lần 1)',
        responsibleRole: 'Chủ tịch UBND / Người giải quyết khiếu nại',
        responsibleUnit: 'Bộ phận Tiếp dân & Văn phòng HĐND-UBND',
        deadlineDays: 15,
        deadlineText: 'Trước khi kết luận khiếu nại',
        description: 'Mời hộ công dân cùng các đơn vị chuyên môn đối thoại trực tiếp để làm rõ các yêu cầu nâng đơn giá và bố trí nền tái định cư.',
        defaultDocTitle: 'Giấy mời tham dự hội nghị đối thoại giải quyết khiếu nại đất đai',
        defaultAssignee: 'Chủ trì: Chủ tịch UBND quận',
        badgeLabel: 'Bắt buộc luật định',
      },
      {
        id: 'act-kn-4',
        stepId: 'step-2',
        stepNumber: 2,
        title: 'Ban hành Thông báo không đủ điều kiện thụ lý / Chuyển trả đơn',
        shortTitle: 'Từ chối / Chuyển đơn',
        category: 'alternative',
        icon: 'cancel',
        color: 'rose',
        canCuPhapLy: 'Điều 11 Luật Khiếu nại 2011',
        responsibleRole: 'Cán bộ thụ lý hồ sơ',
        responsibleUnit: 'Ban Tiếp công dân',
        deadlineDays: 10,
        deadlineText: '10 ngày làm việc',
        description: 'Trong trường hợp đơn không đủ điều kiện (hết thời hiệu 90 ngày hoặc đã có bản án của Tòa án), ban hành văn bản trả lời và hướng dẫn.',
        defaultDocTitle: 'Thông báo không đủ điều kiện thụ lý giải quyết khiếu nại',
        defaultAssignee: 'Ban Tiếp công dân',
        badgeLabel: 'Từ chối / Hướng dẫn',
      },
    ];
  } else if (workflow.id === 'to-cao') {
    actions = [
      {
        id: 'act-tc-1',
        stepId: 'step-2',
        stepNumber: 2,
        title: 'Kích hoạt Bảo mật thông tin & Ban hành QĐ Thụ lý tố cáo',
        shortTitle: 'Bảo mật & Thụ lý',
        category: 'primary',
        icon: 'lock',
        color: 'rose',
        canCuPhapLy: 'Điều 9, Điều 29, Điều 30 Luật Tố cáo 2018 & Nghị định 31/2019/NĐ-CP',
        responsibleRole: 'Người đứng đầu cơ quan, tổ chức có thẩm quyền',
        responsibleUnit: 'Cơ quan có thẩm quyền quản lý cán bộ bị tố cáo',
        deadlineDays: 7,
        deadlineText: '07 ngày làm việc',
        description: 'Vào sổ mật, mã hóa bảo vệ danh tính người tố cáo và ban hành Quyết định thụ lý tố cáo hành vi vi phạm thực thi công vụ.',
        defaultDocTitle: 'Quyết định thụ lý tố cáo hành vi vi phạm pháp luật trong thực thi công vụ (Chế độ MẬT)',
        defaultAssignee: 'Thủ trưởng cơ quan giải quyết',
        badgeLabel: 'Chế độ MẬT',
      },
      {
        id: 'act-tc-2',
        stepId: 'step-3',
        stepNumber: 3,
        title: 'Ban hành QĐ thành lập Đoàn thanh tra / Xác minh nội dung tố cáo',
        shortTitle: 'Thành lập Đoàn thanh tra',
        category: 'secondary',
        icon: 'badge',
        color: 'indigo',
        canCuPhapLy: 'Điều 31 Luật Tố cáo 2018',
        responsibleRole: 'Chánh Thanh tra / Thủ trưởng cơ quan',
        responsibleUnit: 'Cơ quan Thanh tra nhà nước cùng cấp',
        deadlineDays: 10,
        deadlineText: '10 ngày làm việc',
        description: 'Thành lập đoàn xác minh độc lập để thu thập hồ sơ, làm việc với người bị tố cáo và cơ quan liên quan.',
        defaultDocTitle: 'Quyết định thành lập Đoàn xác minh nội dung tố cáo',
        defaultAssignee: 'Đoàn trưởng: Đ/c Chánh thanh tra',
        badgeLabel: 'Đoàn xác minh',
      },
      {
        id: 'act-tc-3',
        stepId: 'step-5',
        stepNumber: 5,
        title: 'Dự thảo Báo cáo kết luận nội dung tố cáo & Đề xuất xử lý',
        shortTitle: 'Dự thảo Kết luận',
        category: 'secondary',
        icon: 'description',
        color: 'blue',
        canCuPhapLy: 'Điều 35 Luật Tố cáo 2018',
        responsibleRole: 'Trưởng đoàn xác minh',
        responsibleUnit: 'Thanh tra',
        deadlineDays: 30,
        deadlineText: '30 ngày làm việc',
        description: 'Tổng hợp kết quả xác minh, lập dự thảo Kết luận báo cáo người đứng đầu để xem xét xử lý kỷ luật cán bộ hoặc chuyển cơ quan điều tra.',
        defaultDocTitle: 'Báo cáo kết luận nội dung xác minh tố cáo',
        defaultAssignee: 'Đoàn thanh tra xác minh',
        badgeLabel: 'Dự thảo kết luận',
      },
    ];
  } else {
    actions = [
      {
        id: 'act-knpa-1',
        stepId: 'step-2',
        stepNumber: 2,
        title: 'Ban hành Phiếu chuyển đơn đến cơ quan có thẩm quyền trực tiếp',
        shortTitle: 'Chuyển đơn vị chuyên môn',
        category: 'primary',
        icon: 'forward_to_inbox',
        color: 'blue',
        canCuPhapLy: 'Điều 28 Thông tư 05/2021/TT-TTCP; Luật Tiếp công dân 2013',
        responsibleRole: 'Cán bộ thụ lý tiếp nhận',
        responsibleUnit: 'Bộ phận Tiếp nhận & Xử lý đơn',
        deadlineDays: 5,
        deadlineText: '05 ngày làm việc',
        description: 'Lập phiếu chuyển nội dung kiến nghị đến đúng cơ quan, đơn vị có thẩm quyền chuyên môn giải quyết và trả lời công dân.',
        defaultDocTitle: 'Phiếu chuyển đơn phản ánh, kiến nghị đến cơ quan có thẩm quyền',
        defaultAssignee: 'Sở/Phòng chuyên môn phụ trách',
        badgeLabel: 'Gợi ý ưu tiên số 1',
      },
      {
        id: 'act-knpa-2',
        stepId: 'step-3',
        stepNumber: 3,
        title: 'Dự thảo Văn bản trả lời / Hướng dẫn công dân',
        shortTitle: 'Văn bản trả lời công dân',
        category: 'secondary',
        icon: 'reply',
        color: 'emerald',
        canCuPhapLy: 'Điều 29 Thông tư 05/2021/TT-TTCP',
        responsibleRole: 'Cán bộ thụ lý',
        responsibleUnit: 'Cơ quan hành chính nhà nước',
        deadlineDays: 15,
        deadlineText: '15 ngày làm việc',
        description: 'Soạn thảo văn bản thông báo kết quả giải quyết kiến nghị hoặc hướng dẫn công dân đến cơ quan đúng chức năng.',
        defaultDocTitle: 'Văn bản trả lời phản ánh, kiến nghị của công dân',
        defaultAssignee: 'Cán bộ thụ lý: Nguyễn Minh Anh',
        badgeLabel: 'Trả lời công dân',
      },
      {
        id: 'act-knpa-3',
        stepId: 'step-4',
        stepNumber: 4,
        title: 'Vào sổ theo dõi & Đóng hồ sơ kiến nghị',
        shortTitle: 'Hoàn tất & Đóng hồ sơ',
        category: 'secondary',
        icon: 'task_alt',
        color: 'slate',
        canCuPhapLy: 'Quy chế tiếp nhận và giải quyết phản ánh kiến nghị',
        responsibleRole: 'Văn thư / Cán bộ tiếp nhận',
        responsibleUnit: 'Bộ phận Một cửa',
        deadlineDays: 1,
        deadlineText: 'Trong ngày',
        description: 'Cập nhật trạng thái đã giải quyết xong vào hệ thống quản lý đơn thư, kết thúc quy trình tiếp nhận kiến nghị.',
        defaultDocTitle: 'Biên bản lưu trữ và hoàn tất giải quyết kiến nghị',
        defaultAssignee: 'Bộ phận Tiếp nhận',
        badgeLabel: 'Kết thúc xử lý',
      },
    ];
  }

  return { workflow, actions };
}

interface QuyTrinhSuggestedActionsProps {
  loaiDon: string;
  donCode?: string;
  currentNguoiGui?: string;
  onActionSuccess?: (actionTitle: string) => void;
  onOpenWorkflowDrawer?: () => void;
  compact?: boolean;
}

export default function QuyTrinhSuggestedActions({
  loaiDon,
  donCode = 'Đ-2026-00125',
  currentNguoiGui = 'Nguyễn Văn A',
  onActionSuccess,
  onOpenWorkflowDrawer,
  compact = false,
}: QuyTrinhSuggestedActionsProps) {
  const { workflow, actions } = getSuggestedActionsForWorkflow(loaiDon);

  // Track which actions have been executed in this session
  const [completedActions, setCompletedActions] = useState<Record<string, { time: string; assignee: string }>>({});
  const [selectedActionModal, setSelectedActionModal] = useState<SuggestedAction | null>(null);

  // Form state inside action execution modal
  const [modalForm, setModalForm] = useState({
    docTitle: '',
    assignee: '',
    notes: '',
    soHieu: '01/QĐ-PC03',
  });

  const handleOpenActionModal = (action: SuggestedAction) => {
    setSelectedActionModal(action);
    setModalForm({
      docTitle: action.defaultDocTitle,
      assignee: action.defaultAssignee,
      notes: `Thực hiện theo quy trình ${workflow.name} đối với đơn ${donCode} của công dân ${currentNguoiGui}.`,
      soHieu: `${Math.floor(Math.random() * 89 + 10)}/VB-${workflow.id === 'to-giac' ? 'PC03' : 'UBND'}`,
    });
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionModal) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setCompletedActions((prev) => ({
      ...prev,
      [selectedActionModal.id]: {
        time: timeStr,
        assignee: modalForm.assignee,
      },
    }));

    const actionTitle = selectedActionModal.title;
    setSelectedActionModal(null);
    onActionSuccess?.(actionTitle);
  };

  const getColorClasses = (color: SuggestedAction['color']) => {
    switch (color) {
      case 'blue':
        return {
          cardBg: 'bg-blue-50/40 hover:bg-blue-50/70 border-blue-200/90',
          badge: 'bg-blue-100 text-[#004ac6] border-blue-200',
          btn: 'bg-[#004ac6] hover:bg-[#003da8] text-white shadow-xs',
          iconBg: 'bg-[#004ac6] text-white',
        };
      case 'indigo':
        return {
          cardBg: 'bg-indigo-50/40 hover:bg-indigo-50/70 border-indigo-200/90',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          btn: 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs',
          iconBg: 'bg-indigo-600 text-white',
        };
      case 'purple':
        return {
          cardBg: 'bg-purple-50/40 hover:bg-purple-50/70 border-purple-200/90',
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          btn: 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs',
          iconBg: 'bg-purple-600 text-white',
        };
      case 'emerald':
        return {
          cardBg: 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-200/90',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          btn: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs',
          iconBg: 'bg-emerald-600 text-white',
        };
      case 'amber':
        return {
          cardBg: 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-200/90',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
          iconBg: 'bg-amber-500 text-white',
        };
      case 'rose':
        return {
          cardBg: 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-200/90',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          btn: 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs',
          iconBg: 'bg-rose-600 text-white',
        };
      default:
        return {
          cardBg: 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          btn: 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs',
          iconBg: 'bg-slate-700 text-white',
        };
    }
  };

  if (compact) {
    // Render compact bar with suggested buttons
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {actions.slice(0, 3).map((act) => {
          const colors = getColorClasses(act.color);
          const isDone = !!completedActions[act.id];

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => handleOpenActionModal(act)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-95 ${isDone
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : act.category === 'primary'
                  ? 'bg-[#004ac6] text-white hover:bg-[#003da8] border-[#004ac6] shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
              title={act.title}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isDone ? 'check_circle' : act.icon}
              </span>
              <span>{act.shortTitle}</span>
              {isDone && <span className="text-[10px] font-mono text-emerald-700 font-normal">({completedActions[act.id].time})</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 shadow-2xs overflow-hidden transition-all">


      {/* ========================================================================= */}
      {/* 4. MODAL THỰC HIỆN THAO TÁC / BAN HÀNH VĂN BẢN QUY TRÌNH                   */}
      {/* ========================================================================= */}
      {selectedActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[18px]">{selectedActionModal.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedActionModal.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Bước {selectedActionModal.stepNumber} trong quy trình • {selectedActionModal.responsibleUnit}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form thực hiện */}
            <form onSubmit={handleConfirmAction} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-950 space-y-1">
                <p className="font-bold">Căn cứ pháp lý áp dụng:</p>
                <p className="text-[11.5px] leading-relaxed text-blue-900">
                  {selectedActionModal.canCuPhapLy}
                </p>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-blue-700 font-medium">
                  <span>Hạn hoàn thành: <strong>{selectedActionModal.deadlineText}</strong></span>
                  <span>•</span>
                  <span>Đơn vị thực hiện: <strong>{selectedActionModal.responsibleRole}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tiêu đề văn bản / Quyết định tố tụng ban hành <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.docTitle}
                  onChange={(e) => setModalForm({ ...modalForm, docTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Số hiệu văn bản dự thảo
                  </label>
                  <input
                    type="text"
                    value={modalForm.soHieu}
                    onChange={(e) => setModalForm({ ...modalForm, soHieu: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Cán bộ / Đơn vị được giao thực hiện <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.assignee}
                    onChange={(e) => setModalForm({ ...modalForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nội dung chỉ đạo &amp; Yêu cầu nghiệp vụ
                </label>
                <textarea
                  rows={3}
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Hồ sơ liên quan: <strong className="text-slate-700 font-mono">{donCode}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedActionModal(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Xác nhận &amp; Ban hành thao tác</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
