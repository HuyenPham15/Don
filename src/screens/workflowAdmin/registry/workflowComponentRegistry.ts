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

// ============================================================================
// THƯ VIỆN CẤU HÌNH CHUẨN (STANDARD STEP CONFIGURATION LIBRARY)
// ============================================================================
export interface StandardStepLibraryItem {
  id: string; // e.g. 'std-check', 'std-task', 'std-approval'
  name: string; // Tên mẫu cấu hình chuẩn
  nodeType: WorkflowNodeType;
  category: WorkflowComponentCategory;
  description: string;
  defaultConditions: string[];
  defaultStepForms: string[];
  defaultInputDocs: string[];
  defaultStoredDocs: string[];
  defaultStatusChangeDoc: string;
  defaultTimeLimitDays: number;
  defaultWorkHours: number;
  defaultWarningBeforeHours: number;
  defaultWorkSchedule: string;
  defaultActions: WorkflowAction[];
  defaultAiConfig?: any;
  defaultApprovalConfig?: any;
  defaultNotificationConfig?: any;
  defaultBranchConfig?: any;
  defaultIntegrationConfig?: any;
}

export const STANDARD_STEP_LIBRARY: StandardStepLibraryItem[] = [
  // 1. Bước kiểm tra điều kiện / Thẩm tra (CHECK)
  {
    id: 'std-check',
    name: 'Kiểm tra điều kiện thụ lý',
    nodeType: 'CHECK',
    category: 'PROCESSING',
    description: 'Đối chiếu tính hợp lệ, thẩm quyền thụ lý và các điều kiện pháp luật quy định.',
    defaultConditions: [
      'Người khiếu nại được xác định',
      'Có nội dung khiếu nại',
      'Có đối tượng bị khiếu nại',
      'Thuộc thẩm quyền',
    ],
    defaultStepForms: ['Phiếu kiểm tra điều kiện thụ lý'],
    defaultInputDocs: ['Đơn khiếu nại'],
    defaultStoredDocs: ['Phiếu tiếp nhận đơn khiếu nại'],
    defaultStatusChangeDoc: 'Thông báo thụ lý khiếu nại',
    defaultTimeLimitDays: 2,
    defaultWorkHours: 16,
    defaultWarningBeforeHours: 4,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultActions: [
      { id: 'act-std-chk-1', code: 'VALID', label: 'Đủ điều kiện thụ lý', type: 'COMPLETE' },
      { id: 'act-std-chk-2', code: 'INVALID', label: 'Không đủ điều kiện', type: 'REJECT' },
      { id: 'act-std-chk-3', code: 'TRANSFER', label: 'Chuyển đơn đúng thẩm quyền', type: 'TRANSFER' },
    ],
    defaultAiConfig: {
      enabled: true,
      capabilities: ['OCR', 'CHECK_CONDITION'],
      requireUserConfirmation: true,
      promptDescription: 'Tự động kiểm tra 4 điều kiện thụ lý từ tài liệu quét OCR',
    },
  },

  // 2. Bước xử lý nghiệp vụ (TASK)
  {
    id: 'std-task',
    name: 'Bước xử lý nghiệp vụ',
    nodeType: 'TASK',
    category: 'PROCESSING',
    description: 'Thực hiện công tác nghiệp vụ chuyên môn theo quy định pháp luật.',
    defaultConditions: [
      'Đã tiếp nhận hồ sơ hợp lệ từ bước trước',
      'Đúng phạm vi phân công chuyên môn',
      'Trong thời hạn thụ lý còn hiệu lực',
    ],
    defaultStepForms: ['Phiếu theo dõi tiến độ xử lý nghiệp vụ'],
    defaultInputDocs: ['Hồ sơ vụ việc đã thụ lý', 'Tài liệu chứng cứ ban đầu'],
    defaultStoredDocs: ['Báo cáo kết quả xử lý nghiệp vụ'],
    defaultStatusChangeDoc: 'Báo cáo xử lý nghiệp vụ',
    defaultTimeLimitDays: 5,
    defaultWorkHours: 40,
    defaultWarningBeforeHours: 8,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultActions: [
      { id: 'act-std-task-1', code: 'COMPLETE', label: 'Hoàn tất bước', type: 'COMPLETE' },
      { id: 'act-std-task-2', code: 'TRANSFER', label: 'Chuyển bước tiếp', type: 'TRANSFER' },
    ],
    defaultAiConfig: {
      enabled: false,
      capabilities: ['OCR', 'EXTRACT'],
      requireUserConfirmation: true,
    },
  },

  // 3. Bước xác minh thực tế (TASK - Xác minh)
  {
    id: 'std-verify',
    name: 'Bước xác minh thực tế',
    nodeType: 'TASK',
    category: 'PROCESSING',
    description: 'Khảo sát thực địa, làm việc với các bên và thu thập tài liệu chứng cứ.',
    defaultConditions: [
      'Đã ban hành kế hoạch xác minh nội dung',
      'Thông báo lịch làm việc cho các bên liên quan',
      'Đầy đủ thành phần tổ xác minh theo quyết định',
    ],
    defaultStepForms: ['Biên bản làm việc xác minh thực tế'],
    defaultInputDocs: ['Quyết định thành lập đoàn xác minh', 'Hồ sơ tài liệu ban đầu'],
    defaultStoredDocs: ['Biên bản xác minh', 'Hồ sơ tài liệu thu thập'],
    defaultStatusChangeDoc: 'Kế hoạch xác minh',
    defaultTimeLimitDays: 10,
    defaultWorkHours: 80,
    defaultWarningBeforeHours: 16,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultActions: [
      { id: 'act-std-vf-1', code: 'COMPLETE', label: 'Hoàn thành xác minh', type: 'COMPLETE' },
      { id: 'act-std-vf-2', code: 'REQ_MORE', label: 'Yêu cầu cung cấp thêm', type: 'REQUEST_INFO' },
    ],
    defaultAiConfig: {
      enabled: true,
      capabilities: ['SEARCH_RELATED', 'EXTRACT'],
      requireUserConfirmation: true,
    },
  },

  // 4. Bước yêu cầu bổ sung (TASK - Bổ sung)
  {
    id: 'std-request-info',
    name: 'Bước yêu cầu bổ sung',
    nodeType: 'TASK',
    category: 'PROCESSING',
    description: 'Phát hành thông báo tạm dừng hạn để chờ đương sự bổ sung tài liệu.',
    defaultConditions: [
      'Hồ sơ còn thiếu tài liệu quan trọng theo quy định',
      'Thời hiệu yêu cầu bổ sung còn hiệu lực',
    ],
    defaultStepForms: ['Phiếu hướng dẫn bổ sung hồ sơ'],
    defaultInputDocs: ['Danh mục tài liệu hiện có trong hồ sơ'],
    defaultStoredDocs: ['Thông báo yêu cầu bổ sung tài liệu'],
    defaultStatusChangeDoc: 'Thông báo yêu cầu bổ sung',
    defaultTimeLimitDays: 5,
    defaultWorkHours: 40,
    defaultWarningBeforeHours: 8,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultActions: [
      { id: 'act-std-req-1', code: 'RECEIVED', label: 'Đã nhận bổ sung', type: 'COMPLETE' },
      { id: 'act-std-req-2', code: 'EXPIRED', label: 'Quá hạn bổ sung', type: 'RETURN' },
    ],
  },

  // 5. Bước trình duyệt / Phê duyệt (APPROVAL)
  {
    id: 'std-approval',
    name: 'Bước trình duyệt / Phê duyệt',
    nodeType: 'APPROVAL',
    category: 'APPROVAL',
    description: 'Lãnh đạo thẩm định hồ sơ, ký số phê duyệt hoặc yêu cầu chỉnh sửa.',
    defaultConditions: [
      'Cán bộ chuyên môn đã trình đủ hồ sơ và dự thảo văn bản',
      'Dự thảo văn bản tuân thủ đúng thể thức và thẩm quyền',
      'Đã kiểm tra căn cứ pháp lý trước khi ký ban hành',
    ],
    defaultStepForms: ['Phiếu trình duyệt hồ sơ'],
    defaultInputDocs: ['Tờ trình đề xuất phê duyệt', 'Dự thảo văn bản quyết định'],
    defaultStoredDocs: ['Phiếu trình duyệt có ý kiến', 'Văn bản quyết định chính thức đã ký số'],
    defaultStatusChangeDoc: 'Quyết định phê duyệt ban hành',
    defaultTimeLimitDays: 3,
    defaultWorkHours: 24,
    defaultWarningBeforeHours: 4,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultApprovalConfig: {
      approvalStyle: 'SINGLE',
      authorityRole: 'Lãnh đạo cơ quan / Trưởng đơn vị',
    },
    defaultActions: [
      { id: 'act-std-app-1', code: 'APPROVE', label: 'Phê duyệt ban hành', type: 'APPROVE' },
      { id: 'act-std-app-2', code: 'REVISE', label: 'Yêu cầu chỉnh sửa', type: 'REVISE' },
      { id: 'act-std-app-3', code: 'REJECT', label: 'Từ chối phê duyệt', type: 'REJECT' },
    ],
    defaultAiConfig: {
      enabled: true,
      capabilities: ['SUGGEST', 'CHECK_CONDITION'],
      requireUserConfirmation: true,
      promptDescription: 'Tóm tắt nội dung thẩm định và rà soát các điều kiện trước khi phê duyệt',
    },
  },

  // 6. Điểm bắt đầu (START)
  {
    id: 'std-start',
    name: 'Điểm bắt đầu tiếp nhận',
    nodeType: 'START',
    category: 'FLOW_CONTROL',
    description: 'Khởi tạo tiếp nhận và bắt đầu vòng đời xử lý hồ sơ.',
    defaultConditions: [
      'Hồ sơ/đơn thư được gửi đến cơ quan hợp lệ',
      'Thông tin người gửi có số điện thoại hoặc địa chỉ liên lạc',
    ],
    defaultStepForms: ['Phiếu tiếp nhận ban đầu'],
    defaultInputDocs: ['Đơn thư / Văn bản đề nghị', 'Giấy tờ tùy thân hoặc ủy quyền'],
    defaultStoredDocs: ['Giấy biên nhận / Tiếp nhận hồ sơ'],
    defaultStatusChangeDoc: 'Tiếp nhận thành công',
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
    defaultWarningBeforeHours: 2,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultActions: [
      { id: 'act-std-st-1', code: 'TRANSFER', label: 'Chuyển phân công thụ lý', type: 'COMPLETE' },
    ],
  },

  // 7. Điểm kết thúc (END)
  {
    id: 'std-end',
    name: 'Kết thúc và lưu trữ',
    nodeType: 'END',
    category: 'FLOW_CONTROL',
    description: 'Hoàn tất mọi thủ tục, bàn giao kết quả và lưu trữ hồ sơ vụ việc.',
    defaultConditions: [
      'Kết quả giải quyết đã được bàn giao/công khai đầy đủ',
      'Hồ sơ giấy và điện tử đã được kiểm kê và đóng gói',
    ],
    defaultStepForms: ['Biên bản bàn giao lưu trữ hồ sơ'],
    defaultInputDocs: ['Toàn bộ hồ sơ vụ việc đã kết luận'],
    defaultStoredDocs: ['Mục lục lưu trữ hồ sơ'],
    defaultStatusChangeDoc: 'Quyết định đóng hồ sơ',
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
    defaultWarningBeforeHours: 2,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultActions: [],
  },

  // 8. Thông báo / Gửi phản hồi (NOTIFICATION)
  {
    id: 'std-notification',
    name: 'Thông báo / Gửi phản hồi',
    nodeType: 'NOTIFICATION',
    category: 'COMMUNICATION',
    description: 'Tự động gửi tin nhắn SMS, Email hoặc thông báo Cổng DVC.',
    defaultConditions: [
      'Đã có văn bản kết quả chính thức được ký duyệt',
      'Thông tin nhận thông báo của công dân chính xác',
    ],
    defaultStepForms: ['Mẫu thông báo kết quả qua Cổng DVC / SMS'],
    defaultInputDocs: ['Văn bản kết quả xử lý đã ký số'],
    defaultStoredDocs: ['Báo cáo gửi tin nhắn / Thông báo'],
    defaultStatusChangeDoc: '',
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
    defaultWarningBeforeHours: 2,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultNotificationConfig: {
      recipientType: 'CITIZEN',
      channels: ['SMS', 'PORTAL'],
      triggerEvent: 'ON_ENTER',
      templateTitle: 'Mẫu thông báo tiến độ xử lý hồ sơ',
    },
    defaultActions: [
      { id: 'act-std-notif-1', code: 'SENT', label: 'Đã gửi thông báo', type: 'COMPLETE' },
    ],
  },

  // 9. Rẽ nhánh điều kiện (BRANCH)
  {
    id: 'std-branch',
    name: 'Rẽ nhánh điều kiện',
    nodeType: 'BRANCH',
    category: 'FLOW_CONTROL',
    description: 'Phân luồng xử lý theo điều kiện logic (IF/THEN).',
    defaultConditions: [
      'Điều kiện phân luồng được đánh giá rõ ràng',
      'Đã xác định các đường rẽ tương ứng',
    ],
    defaultStepForms: [],
    defaultInputDocs: [],
    defaultStoredDocs: [],
    defaultStatusChangeDoc: '',
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
    defaultWarningBeforeHours: 2,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultBranchConfig: {
      branchMode: 'EXCLUSIVE_CONDITION',
    },
    defaultActions: [],
  },

  // 10. Gộp nhánh xử lý (MERGE)
  {
    id: 'std-merge',
    name: 'Gộp nhánh xử lý',
    nodeType: 'MERGE',
    category: 'FLOW_CONTROL',
    description: 'Hội tụ các luồng xử lý song song về một bước chung.',
    defaultConditions: [
      'Tất cả các nhánh song song đã hoàn tất',
    ],
    defaultStepForms: [],
    defaultInputDocs: [],
    defaultStoredDocs: [],
    defaultStatusChangeDoc: '',
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
    defaultWarningBeforeHours: 2,
    defaultWorkSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    defaultActions: [],
  },

  // 11. Tích hợp hệ thống (INTEGRATION)
  {
    id: 'std-integration',
    name: 'Đồng bộ CSDL Quốc gia / VNeID',
    nodeType: 'INTEGRATION',
    category: 'INTEGRATION',
    description: 'Tra cứu xác thực định danh cá nhân và liên thông tài liệu liên ngành.',
    defaultConditions: [
      'Hệ thống CSDL Quốc gia hoạt động bình thường',
      'Thông tin xác thực có định dạng chuẩn',
    ],
    defaultStepForms: [],
    defaultInputDocs: ['Số định danh CCCD / Mã hồ sơ'],
    defaultStoredDocs: ['Nhật ký đồng bộ dữ liệu'],
    defaultStatusChangeDoc: '',
    defaultTimeLimitDays: 1,
    defaultWorkHours: 8,
    defaultWarningBeforeHours: 2,
    defaultWorkSchedule: 'Hệ thống tự động (24/7)',
    defaultIntegrationConfig: {
      systemCode: 'VNEID_DAN_CU',
      systemName: 'Hệ thống định danh CSDL Dân cư Quốc gia',
      actionEndpoint: '/api/v1/citizen/verify',
      method: 'POST',
      timeoutSeconds: 30,
      retryCount: 3,
    },
    defaultActions: [
      { id: 'act-std-int-1', code: 'SYNC_SUCCESS', label: 'Đồng bộ thành công', type: 'COMPLETE' },
      { id: 'act-std-int-2', code: 'SYNC_ERROR', label: 'Lỗi kết nối', type: 'RETURN' },
    ],
  },
];

export function getStandardStepTemplate(
  type: WorkflowNodeType,
  compId?: string,
  inheritedFromId?: string
): StandardStepLibraryItem {
  if (inheritedFromId) {
    const found = STANDARD_STEP_LIBRARY.find((s) => s.id === inheritedFromId);
    if (found) return found;
  }
  if (compId) {
    const stdId = compId.startsWith('comp-') ? compId.replace('comp-', 'std-') : compId;
    const found = STANDARD_STEP_LIBRARY.find((s) => s.id === stdId || s.id === compId);
    if (found) return found;
  }
  const byType = STANDARD_STEP_LIBRARY.find((s) => s.nodeType === type);
  return byType || STANDARD_STEP_LIBRARY[0];
}

export function resetStepToStandard(step: ProcessStep): ProcessStep {
  const tpl = getStandardStepTemplate(
    step.nodeType || 'TASK',
    undefined,
    step.inheritedFromId
  );

  return {
    ...step,
    inheritedFromId: tpl.id,
    inheritedFromName: tpl.name,
    isCustomized: false,

    conditions: [...tpl.defaultConditions],
    conditionsOverride: false,

    stepForms: [...tpl.defaultStepForms],
    formsOverride: false,

    usedDocuments: [...tpl.defaultInputDocs],
    inputDocuments: [...tpl.defaultInputDocs],
    usedDocsOverride: false,
    inputDocsOverride: false,

    storedDocuments: [...tpl.defaultStoredDocs],
    outputDocsOverride: false,

    statusChangeDoc: tpl.defaultStatusChangeDoc,

    timeLimitDays: tpl.defaultTimeLimitDays,
    workHours: tpl.defaultWorkHours,
    warningBeforeHours: tpl.defaultWarningBeforeHours,
    workSchedule: tpl.defaultWorkSchedule,
    slaOverride: false,

    actions: [...tpl.defaultActions],
    actionsOverride: false,

    aiConfig: tpl.defaultAiConfig ? { ...tpl.defaultAiConfig } : step.aiConfig,
    approvalConfig: tpl.defaultApprovalConfig ? { ...tpl.defaultApprovalConfig } : step.approvalConfig,
    notificationConfig: tpl.defaultNotificationConfig ? { ...tpl.defaultNotificationConfig } : step.notificationConfig,
    branchConfig: tpl.defaultBranchConfig ? { ...tpl.defaultBranchConfig } : step.branchConfig,
    integrationConfig: tpl.defaultIntegrationConfig ? { ...tpl.defaultIntegrationConfig } : step.integrationConfig,
  };
}

export function resetStepSectionToStandard(
  step: ProcessStep,
  section: 'conditions' | 'forms' | 'usedDocs' | 'inputDocs' | 'outputDocs' | 'sla' | 'actions'
): ProcessStep {
  const tpl = getStandardStepTemplate(
    step.nodeType || 'TASK',
    undefined,
    step.inheritedFromId
  );

  const updated: ProcessStep = { ...step };

  switch (section) {
    case 'conditions':
      updated.conditions = [...tpl.defaultConditions];
      updated.conditionsOverride = false;
      break;
    case 'forms':
      updated.stepForms = [...tpl.defaultStepForms];
      updated.formsOverride = false;
      break;
    case 'usedDocs':
    case 'inputDocs':
      updated.usedDocuments = [...tpl.defaultInputDocs];
      updated.inputDocuments = [...tpl.defaultInputDocs];
      updated.usedDocsOverride = false;
      updated.inputDocsOverride = false;
      break;
    case 'outputDocs':
      updated.storedDocuments = [...tpl.defaultStoredDocs];
      updated.outputDocsOverride = false;
      break;
    case 'sla':
      updated.timeLimitDays = tpl.defaultTimeLimitDays;
      updated.workHours = tpl.defaultWorkHours;
      updated.warningBeforeHours = tpl.defaultWarningBeforeHours;
      updated.workSchedule = tpl.defaultWorkSchedule;
      updated.slaOverride = false;
      break;
    case 'actions':
      updated.actions = [...tpl.defaultActions];
      updated.actionsOverride = false;
      break;
  }

  const hasRemainingOverrides = Boolean(
    updated.conditionsOverride ||
    updated.formsOverride ||
    updated.usedDocsOverride ||
    updated.inputDocsOverride ||
    updated.outputDocsOverride ||
    updated.slaOverride ||
    updated.actionsOverride
  );

  if (!hasRemainingOverrides) {
    updated.isCustomized = false;
  }

  return updated;
}

export function createDefaultStepFromRegistry(
  type: WorkflowNodeType,
  index: number,
  laneId: string,
  stageId: string,
  customConfig?: Partial<ProcessStep>,
  compId?: string
): ProcessStep {
  const item = getComponentRegistryItem(type);
  const baseConfig = item ? item.createDefaultNode(index, laneId, stageId) : {};
  const standardTpl = getStandardStepTemplate(
    type,
    compId || (item ? item.id : undefined),
    customConfig?.inheritedFromId
  );

  const id = customConfig?.id || `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const code = customConfig?.code || baseConfig.code || `STEP-${String(index).padStart(2, '0')}`;
  const name = customConfig?.name || baseConfig.name || item?.label || standardTpl.name || 'Bước xử lý';

  const step: ProcessStep = {
    id,
    code,
    name,
    laneId: customConfig?.laneId || laneId,
    stageId: customConfig?.stageId || stageId,
    nodeType: type,
    isStart: type === 'START' || Boolean(baseConfig.isStart),
    isEnd: type === 'END' || Boolean(baseConfig.isEnd),
    description: customConfig?.description || baseConfig.description || standardTpl.description || '',

    // Thư viện cấu hình chuẩn & Kế thừa
    inheritedFromId: customConfig?.inheritedFromId || standardTpl.id,
    inheritedFromName: customConfig?.inheritedFromName || standardTpl.name,
    isCustomized: customConfig?.isCustomized ?? false,

    // Điều kiện nghiệp vụ (mặc định kế thừa từ thư viện)
    conditions: customConfig?.conditions || [...standardTpl.defaultConditions],
    conditionsOverride: customConfig?.conditionsOverride ?? false,

    // Biểu mẫu điện tử (mặc định kế thừa từ thư viện)
    stepForms: customConfig?.stepForms || [...standardTpl.defaultStepForms],
    formsOverride: customConfig?.formsOverride ?? false,

    // Tài liệu sử dụng tại bước (tham chiếu xem/nghiên cứu, KHÔNG là điều kiện chuyển bước)
    usedDocuments: customConfig?.usedDocuments || customConfig?.inputDocuments || [...standardTpl.defaultInputDocs],
    inputDocuments: customConfig?.usedDocuments || customConfig?.inputDocuments || [...standardTpl.defaultInputDocs],
    usedDocsOverride: customConfig?.usedDocsOverride ?? customConfig?.inputDocsOverride ?? false,
    inputDocsOverride: customConfig?.usedDocsOverride ?? customConfig?.inputDocsOverride ?? false,

    // Văn bản lưu / đầu ra (mặc định kế thừa từ thư viện)
    storedDocuments: customConfig?.storedDocuments || [...standardTpl.defaultStoredDocs],
    outputDocsOverride: customConfig?.outputDocsOverride ?? false,

    statusChangeDoc: customConfig?.statusChangeDoc || standardTpl.defaultStatusChangeDoc || baseConfig.statusChangeDoc || '',

    // SLA & Lịch làm việc
    timeLimitDays: customConfig?.timeLimitDays ?? standardTpl.defaultTimeLimitDays ?? baseConfig.timeLimitDays ?? 3,
    workHours: customConfig?.workHours ?? standardTpl.defaultWorkHours ?? baseConfig.workHours ?? 24,
    warningBeforeHours: customConfig?.warningBeforeHours ?? standardTpl.defaultWarningBeforeHours ?? baseConfig.warningBeforeHours ?? 4,
    workSchedule: customConfig?.workSchedule || standardTpl.defaultWorkSchedule || baseConfig.workSchedule || 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
    slaOverride: customConfig?.slaOverride ?? false,

    // Hành động xử lý
    actions: customConfig?.actions || (standardTpl.defaultActions.length > 0 ? [...standardTpl.defaultActions] : (baseConfig.actions || [])),
    actionsOverride: customConfig?.actionsOverride ?? false,

    // Cấu hình đặc thù từng nodeType
    aiConfig: customConfig?.aiConfig || standardTpl.defaultAiConfig || baseConfig.aiConfig,
    approvalConfig: customConfig?.approvalConfig || standardTpl.defaultApprovalConfig || baseConfig.approvalConfig,
    notificationConfig: customConfig?.notificationConfig || standardTpl.defaultNotificationConfig || baseConfig.notificationConfig,
    branchConfig: customConfig?.branchConfig || standardTpl.defaultBranchConfig || baseConfig.branchConfig,
    integrationConfig: customConfig?.integrationConfig || standardTpl.defaultIntegrationConfig || baseConfig.integrationConfig,
  };

  return step;
}

