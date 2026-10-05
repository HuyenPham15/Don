// src/screens/workflowAdmin/registry/workflowComponentRegistry.ts
import {
  WorkflowNodeType,
  WorkflowComponentCategory,
  ProcessStep,
  WorkflowAction,
} from '../../../types/workflowConfig';

export interface ComponentRegistryItem {
  id: string;
  type: WorkflowNodeType;
  category: WorkflowComponentCategory;
  label: string;
  description: string;
  icon: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    ring: string;
  };
  createDefaultNode: (index: number, laneId: string, stageId: string) => Partial<ProcessStep>;
}

export interface ComponentCategoryDefinition {
  id: WorkflowComponentCategory;
  title: string;
  description: string;
  icon: string;
}

export const WORKFLOW_COMPONENT_CATEGORIES: ComponentCategoryDefinition[] = [
  {
    id: 'FLOW_CONTROL',
    title: 'Điều khiển luồng',
    description: 'Khởi đầu, kết thúc, rẽ nhánh và điều phối tiến trình',
    icon: 'alt_route',
  },
  {
    id: 'PROCESSING',
    title: 'Xử lý nghiệp vụ',
    description: 'Thực thi nhiệm vụ chuyên môn, xác minh và thẩm định',
    icon: 'task',
  },
  {
    id: 'APPROVAL',
    title: 'Phê duyệt & Quyết định',
    description: 'Trình duyệt cấp có thẩm quyền, phê chuẩn hoặc từ chối',
    icon: 'verified',
  },
  {
    id: 'COMMUNICATION',
    title: 'Giao tiếp & Thông báo',
    description: 'Gửi thông báo công dân, văn bản kết quả và phản hồi',
    icon: 'mark_email_read',
  },
  {
    id: 'INTEGRATION',
    title: 'Tích hợp hệ thống',
    description: 'Gọi dịch vụ ngoài, xác thực CSDL Dân cư, Cổng DVC',
    icon: 'hub',
  },
];

export const WORKFLOW_COMPONENT_REGISTRY: ComponentRegistryItem[] = [
  // ── A. FLOW CONTROL ──
  {
    id: 'comp-start',
    type: 'START',
    category: 'FLOW_CONTROL',
    label: 'Điểm bắt đầu',
    description: 'Khởi tạo tiếp nhận và bắt đầu vòng đời xử lý',
    icon: 'play_circle',
    color: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-600',
      ring: 'ring-blue-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-START`,
      name: 'Điểm bắt đầu tiếp nhận',
      nodeType: 'START',
      isStart: true,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 1,
      workHours: 8,
      warningBeforeHours: 2,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Giấy biên nhận / Tiếp nhận'],
      stepForms: [],
      statusChangeDoc: 'Tiếp nhận thành công',
      description: 'Điểm khởi đầu tiếp nhận hồ sơ / văn bản vào hệ thống.',
    }),
  },
  {
    id: 'comp-end',
    type: 'END',
    category: 'FLOW_CONTROL',
    label: 'Điểm kết thúc',
    description: 'Hoàn tất quy trình, trả kết quả và lưu trữ hồ sơ',
    icon: 'flag',
    color: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-600',
      ring: 'ring-emerald-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-END`,
      name: 'Kết thúc và lưu trữ',
      nodeType: 'END',
      isStart: false,
      isEnd: true,
      laneId,
      stageId,
      timeLimitDays: 1,
      workHours: 8,
      warningBeforeHours: 2,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Mục lục lưu trữ hồ sơ'],
      stepForms: [],
      statusChangeDoc: 'Quyết định đóng hồ sơ',
      description: 'Điểm hoàn thành toàn bộ các nghĩa vụ và lưu trữ dữ liệu.',
    }),
  },
  {
    id: 'comp-branch',
    type: 'BRANCH',
    category: 'FLOW_CONTROL',
    label: 'Rẽ nhánh điều kiện',
    description: 'Phân luồng xử lý dựa trên điều kiện dữ liệu',
    icon: 'call_split',
    color: {
      bg: 'bg-orange-50/70',
      text: 'text-orange-700',
      border: 'border-orange-200',
      badgeBg: 'bg-orange-600',
      ring: 'ring-orange-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-BR-${String(index).padStart(2, '0')}`,
      name: 'Rẽ nhánh phân luồng',
      nodeType: 'BRANCH',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 1,
      workHours: 8,
      warningBeforeHours: 2,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: [],
      stepForms: [],
      statusChangeDoc: '',
      description: 'Phân luồng nghiệp vụ dựa theo điều kiện logic (IF/THEN).',
      branchConfig: {
        branchMode: 'EXCLUSIVE_CONDITION',
      },
    }),
  },
  {
    id: 'comp-merge',
    type: 'MERGE',
    category: 'FLOW_CONTROL',
    label: 'Gộp nhánh xử lý',
    description: 'Hội tụ các luồng xử lý song song về một bước chung',
    icon: 'call_merge',
    color: {
      bg: 'bg-teal-50/70',
      text: 'text-teal-700',
      border: 'border-teal-200',
      badgeBg: 'bg-teal-600',
      ring: 'ring-teal-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-MG-${String(index).padStart(2, '0')}`,
      name: 'Gộp các luồng xử lý',
      nodeType: 'MERGE',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 1,
      workHours: 8,
      warningBeforeHours: 2,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: [],
      stepForms: [],
      statusChangeDoc: '',
      description: 'Điểm hội tụ đồng bộ khi các bước nhánh hoàn tất.',
    }),
  },

  // ── B. PROCESSING ──
  {
    id: 'comp-task',
    type: 'TASK',
    category: 'PROCESSING',
    label: 'Bước xử lý nghiệp vụ',
    description: 'Thực hiện thao tác thụ lý, soạn thảo hoặc xử lý chuyên môn',
    icon: 'edit_document',
    color: {
      bg: 'bg-blue-50/60',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-600',
      ring: 'ring-blue-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-${String(index).padStart(2, '0')}`,
      name: 'Bước xử lý nghiệp vụ',
      nodeType: 'TASK',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 5,
      workHours: 40,
      warningBeforeHours: 8,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Văn bản kết quả xử lý'],
      stepForms: [],
      statusChangeDoc: '',
      description: 'Thực hiện công tác nghiệp vụ theo quy chuẩn.',
      actions: [
        { id: `act-${Date.now()}-1`, code: 'COMPLETE', label: 'Hoàn tất bước', type: 'COMPLETE' },
        { id: `act-${Date.now()}-2`, code: 'TRANSFER', label: 'Chuyển bước tiếp', type: 'TRANSFER' },
      ],
      aiConfig: {
        enabled: false,
        capabilities: ['OCR', 'EXTRACT'],
        requireUserConfirmation: true,
      },
    }),
  },
  {
    id: 'comp-check',
    type: 'CHECK',
    category: 'PROCESSING',
    label: 'Bước kiểm tra / Thẩm tra',
    description: 'Đối chiếu tính hợp lệ, hồ sơ pháp lý và điều kiện ban đầu',
    icon: 'fact_check',
    color: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-600',
      ring: 'ring-indigo-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-CHK-${String(index).padStart(2, '0')}`,
      name: 'Kiểm tra tính hợp lệ',
      nodeType: 'CHECK',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 2,
      workHours: 16,
      warningBeforeHours: 4,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Phiếu kiểm tra hồ sơ'],
      stepForms: [],
      statusChangeDoc: '',
      description: 'Kiểm tra tính pháp lý, thông tin người nộp và tài liệu đính kèm.',
      actions: [
        { id: `act-${Date.now()}-1`, code: 'VALID', label: 'Hồ sơ hợp lệ', type: 'COMPLETE' },
        { id: `act-${Date.now()}-2`, code: 'INVALID', label: 'Không đủ điều kiện', type: 'REJECT' },
      ],
      aiConfig: {
        enabled: true,
        capabilities: ['OCR', 'CHECK_CONDITION'],
        requireUserConfirmation: true,
      },
    }),
  },
  {
    id: 'comp-verify',
    type: 'TASK',
    category: 'PROCESSING',
    label: 'Bước xác minh thực tế',
    description: 'Thu thập chứng cứ, khảo sát hiện trường, đối thoại các bên',
    icon: 'troubleshoot',
    color: {
      bg: 'bg-cyan-50/70',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      badgeBg: 'bg-cyan-600',
      ring: 'ring-cyan-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-XM-${String(index).padStart(2, '0')}`,
      name: 'Xác minh và thu thập hồ sơ',
      nodeType: 'TASK',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 10,
      workHours: 80,
      warningBeforeHours: 16,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Biên bản xác minh', 'Hồ sơ tài liệu thu thập'],
      stepForms: [],
      statusChangeDoc: 'Kế hoạch xác minh',
      description: 'Xác minh thực địa, làm việc với các bên liên quan và thu thập tài liệu.',
      actions: [
        { id: `act-${Date.now()}-1`, code: 'COMPLETE', label: 'Hoàn thành xác minh', type: 'COMPLETE' },
        { id: `act-${Date.now()}-2`, code: 'REQ_MORE', label: 'Yêu cầu cung cấp thêm', type: 'REQUEST_INFO' },
      ],
      aiConfig: {
        enabled: true,
        capabilities: ['SEARCH_RELATED', 'EXTRACT'],
        requireUserConfirmation: true,
      },
    }),
  },
  {
    id: 'comp-request-info',
    type: 'TASK',
    category: 'PROCESSING',
    label: 'Bước yêu cầu bổ sung',
    description: 'Yêu cầu đương sự/cơ quan phối hợp cung cấp tài liệu bổ sung',
    icon: 'assignment_late',
    color: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-600',
      ring: 'ring-amber-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-BS-${String(index).padStart(2, '0')}`,
      name: 'Yêu cầu bổ sung tài liệu',
      nodeType: 'TASK',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 5,
      workHours: 40,
      warningBeforeHours: 8,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Thông báo bổ sung hồ sơ'],
      stepForms: [],
      statusChangeDoc: 'Thông báo yêu cầu bổ sung',
      description: 'Phát hành thông báo tạm dừng hạn để chờ đương sự bổ sung tài liệu.',
      actions: [
        { id: `act-${Date.now()}-1`, code: 'RECEIVED', label: 'Đã nhận bổ sung', type: 'COMPLETE' },
        { id: `act-${Date.now()}-2`, code: 'EXPIRED', label: 'Quá hạn bổ sung', type: 'RETURN' },
      ],
    }),
  },

  // ── C. APPROVAL ──
  {
    id: 'comp-approval',
    type: 'APPROVAL',
    category: 'APPROVAL',
    label: 'Bước trình duyệt / Phê duyệt',
    description: 'Dành cho Lãnh đạo thẩm quyền xem xét, ký duyệt hoặc trả lại',
    icon: 'verified',
    color: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-600',
      ring: 'ring-purple-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-PD-${String(index).padStart(2, '0')}`,
      name: 'Trình duyệt và ký phê duyệt',
      nodeType: 'APPROVAL',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 3,
      workHours: 24,
      warningBeforeHours: 4,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Phiếu trình duyệt', 'Văn bản đã ký duyệt'],
      stepForms: [],
      statusChangeDoc: 'Quyết định phê duyệt',
      description: 'Lãnh đạo thẩm định hồ sơ, ký số phê duyệt hoặc yêu cầu chỉnh sửa.',
      approvalConfig: {
        approvalStyle: 'SINGLE',
        authorityRole: 'Lãnh đạo cơ quan / Trưởng đơn vị',
      },
      actions: [
        { id: `act-${Date.now()}-1`, code: 'APPROVE', label: 'Phê duyệt ban hành', type: 'APPROVE' },
        { id: `act-${Date.now()}-2`, code: 'REVISE', label: 'Yêu cầu chỉnh sửa', type: 'REVISE' },
        { id: `act-${Date.now()}-3`, code: 'REJECT', label: 'Từ chối phê duyệt', type: 'REJECT' },
      ],
      aiConfig: {
        enabled: true,
        capabilities: ['SUGGEST', 'CHECK_CONDITION'],
        requireUserConfirmation: true,
        promptDescription: 'Tóm tắt nội dung thẩm định và rà soát các điều kiện trước khi phê duyệt',
      },
    }),
  },

  // ── D. COMMUNICATION ──
  {
    id: 'comp-notification',
    type: 'NOTIFICATION',
    category: 'COMMUNICATION',
    label: 'Thông báo / Gửi phản hồi',
    description: 'Tự động gửi tin nhắn SMS, Email hoặc thông báo Cổng DVC',
    icon: 'notifications_active',
    color: {
      bg: 'bg-sky-50/70',
      text: 'text-sky-700',
      border: 'border-sky-200',
      badgeBg: 'bg-sky-600',
      ring: 'ring-sky-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-NOTIF-${String(index).padStart(2, '0')}`,
      name: 'Gửi thông báo kết quả',
      nodeType: 'NOTIFICATION',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 1,
      workHours: 8,
      warningBeforeHours: 2,
      workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
      storedDocuments: ['Báo cáo gửi tin nhắn / Thông báo'],
      stepForms: [],
      statusChangeDoc: '',
      description: 'Gửi tin nhắn SMS / Email / Cổng DVC thông báo tiến độ cho công dân.',
      notificationConfig: {
        recipientType: 'CITIZEN',
        channels: ['SMS', 'PORTAL'],
        triggerEvent: 'ON_ENTER',
        templateTitle: 'Mẫu thông báo tiến độ xử lý hồ sơ',
      },
      actions: [
        { id: `act-${Date.now()}-1`, code: 'SENT', label: 'Đã gửi thông báo', type: 'COMPLETE' },
      ],
    }),
  },

  // ── E. INTEGRATION ──
  {
    id: 'comp-integration',
    type: 'INTEGRATION',
    category: 'INTEGRATION',
    label: 'Gọi hệ thống khác / API',
    description: 'Tự động tra cứu CSDL Quốc gia, VNeID hoặc liên thông văn bản',
    icon: 'cloud_sync',
    color: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-600',
      ring: 'ring-emerald-100',
    },
    createDefaultNode: (index, laneId, stageId) => ({
      code: `STEP-INT-${String(index).padStart(2, '0')}`,
      name: 'Đồng bộ CSDL Quốc gia / VNeID',
      nodeType: 'INTEGRATION',
      isStart: false,
      isEnd: false,
      laneId,
      stageId,
      timeLimitDays: 1,
      workHours: 8,
      warningBeforeHours: 2,
      workSchedule: 'Hệ thống tự động (24/7)',
      storedDocuments: ['Nhật ký đồng bộ dữ liệu'],
      stepForms: [],
      statusChangeDoc: '',
      description: 'Tra cứu xác thực định danh cá nhân và liên thông tài liệu liên ngành.',
      integrationConfig: {
        systemCode: 'VNEID_DAN_CU',
        systemName: 'Hệ thống định danh CSDL Dân cư Quốc gia',
        actionEndpoint: '/api/v1/citizen/verify',
        method: 'POST',
        timeoutSeconds: 30,
        retryCount: 3,
      },
      actions: [
        { id: `act-${Date.now()}-1`, code: 'SYNC_SUCCESS', label: 'Đồng bộ thành công', type: 'COMPLETE' },
        { id: `act-${Date.now()}-2`, code: 'SYNC_ERROR', label: 'Lỗi kết nối', type: 'RETURN' },
      ],
    }),
  },
];

export function getComponentRegistryItem(type: WorkflowNodeType): ComponentRegistryItem | undefined {
  return WORKFLOW_COMPONENT_REGISTRY.find((c) => c.type === type);
}

export function createDefaultStepFromRegistry(
  type: WorkflowNodeType,
  index: number,
  laneId: string,
  stageId: string,
  customConfig?: Partial<ProcessStep>
): ProcessStep {
  const item = getComponentRegistryItem(type);
  const baseConfig = item ? item.createDefaultNode(index, laneId, stageId) : {};

  const id = customConfig?.id || `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const code = customConfig?.code || baseConfig.code || `STEP-${String(index).padStart(2, '0')}`;
  const name = customConfig?.name || baseConfig.name || item?.label || 'Bước xử lý';

  const step: ProcessStep = {
    id,
    code,
    name,
    laneId: customConfig?.laneId || laneId,
    stageId: customConfig?.stageId || stageId,
    nodeType: type,
    isStart: type === 'START' || Boolean(baseConfig.isStart),
    isEnd: type === 'END' || Boolean(baseConfig.isEnd),
    timeLimitDays: customConfig?.timeLimitDays ?? baseConfig.timeLimitDays ?? 3,
    workHours: customConfig?.workHours ?? baseConfig.workHours ?? 24,
    warningBeforeHours: customConfig?.warningBeforeHours ?? baseConfig.warningBeforeHours ?? 4,
    workSchedule: customConfig?.workSchedule || baseConfig.workSchedule || 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    storedDocuments: customConfig?.storedDocuments || baseConfig.storedDocuments || [],
    stepForms: customConfig?.stepForms || baseConfig.stepForms || [],
    statusChangeDoc: customConfig?.statusChangeDoc || baseConfig.statusChangeDoc || '',
    description: customConfig?.description || baseConfig.description || '',
    actions: customConfig?.actions || baseConfig.actions || [],
    aiConfig: customConfig?.aiConfig || baseConfig.aiConfig,
    approvalConfig: customConfig?.approvalConfig || baseConfig.approvalConfig,
    notificationConfig: customConfig?.notificationConfig || baseConfig.notificationConfig,
    branchConfig: customConfig?.branchConfig || baseConfig.branchConfig,
    integrationConfig: customConfig?.integrationConfig || baseConfig.integrationConfig,
  };

  return step;
}

