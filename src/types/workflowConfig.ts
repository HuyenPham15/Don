// src/types/workflowConfig.ts

export type ProcessStatus = 'draft' | 'published' | 'archived';

export type TransitionType = 'normal' | 'return';

export type ConditionOperator = 
  | '=' 
  | '≠' 
  | 'co_gia_tri' 
  | 'khong_co_gia_tri' 
  | 'thuoc_danh_sach' 
  | 'khong_thuoc_danh_sach';

export type ConditionFieldSource =
  | 'ho_so'
  | 'loai_don'
  | 'trang_thai'
  | 'tham_quyen'
  | 'van_ban'
  | 'bieu_mau'
  | 'ket_qua'
  | 'vai_tro';

export interface TransitionCondition {
  id: string;
  logicOp: 'AND' | 'OR';
  fieldSource: ConditionFieldSource;
  fieldName: string;
  operator: ConditionOperator;
  value: string;
}

// Component library and generic node types
export type WorkflowNodeType =
  | 'START'
  | 'END'
  | 'TASK'
  | 'CHECK'
  | 'APPROVAL'
  | 'NOTIFICATION'
  | 'BRANCH'
  | 'MERGE'
  | 'INTEGRATION';

export type WorkflowComponentCategory =
  | 'FLOW_CONTROL'
  | 'PROCESSING'
  | 'APPROVAL'
  | 'COMMUNICATION'
  | 'INTEGRATION';

export type WorkflowActionType =
  | 'COMPLETE'
  | 'RETURN'
  | 'REQUEST_INFO'
  | 'TRANSFER'
  | 'APPROVE'
  | 'REJECT'
  | 'REVISE'
  | 'ESCALATE';

export interface WorkflowAction {
  id: string;
  code: string;
  label: string;
  type: WorkflowActionType;
  targetNodeId?: string;
  conditionId?: string;
  description?: string;
  requireComment?: boolean;
}

export type AICapability =
  | 'OCR'
  | 'EXTRACT'
  | 'SEARCH_RELATED'
  | 'CHECK_CONDITION'
  | 'SUGGEST';

export interface AIConfig {
  enabled: boolean;
  capabilities: AICapability[];
  requireUserConfirmation: boolean;
  promptDescription?: string;
}

export interface ApprovalConfig {
  approvalStyle: 'SINGLE' | 'ONE_OF_MANY' | 'CONSENSUS'; // 1 người, 1 trong nhiều, hoặc tất cả
  authorityRole: string; // Chức danh / Vai trò có thẩm quyền
  approveTargetNodeId?: string;
  rejectTargetNodeId?: string;
  reviseTargetNodeId?: string;
}

export interface NotificationConfig {
  recipientType: 'OFFICER' | 'CITIZEN' | 'ALL_PARTIES' | 'CUSTOM_ROLE';
  recipientRole?: string;
  channels: ('SMS' | 'EMAIL' | 'PORTAL' | 'INTERNAL')[];
  templateId?: string;
  templateTitle?: string;
  triggerEvent: 'ON_ENTER' | 'ON_EXIT' | 'MANUAL';
}

export interface BranchConfig {
  branchMode: 'EXCLUSIVE_CONDITION' | 'PARALLEL' | 'INCLUSIVE';
  defaultTargetNodeId?: string;
}

export interface IntegrationConfig {
  systemCode: 'DVC_QUOC_GIA' | 'VNEID_DAN_CU' | 'VAN_BAN_DIEU_HANH' | 'CUSTOM_API';
  systemName: string;
  actionEndpoint: string;
  method: 'GET' | 'POST' | 'PUT';
  timeoutSeconds: number;
  retryCount: number;
}

export interface ProcessTransition {
  id: string;
  actionName: string;
  name?: string;
  fromStepId: string;
  fromStepName?: string;
  toStepId: string;
  toStepName?: string;
  type: TransitionType;
  connectorType?: 'NORMAL' | 'CONDITION' | 'RETURN' | 'APPROVE' | 'REJECT' | 'TIMEOUT';
  sourceNodeId?: string;
  targetNodeId?: string;
  label?: string;
  conditionId?: string;
  actionCode?: string;
  allowedRoles: string[];
  createNextTask: boolean;
  taskAssigneeRole: string;
  warningMessage?: string;
  conditions: TransitionCondition[];
}

export interface ProcessStep {
  id: string;
  code: string; // Tự sinh: STEP-xxx
  name: string;
  laneId: string; // Nhóm trách nhiệm
  stageId: string; // Giai đoạn / Phase
  nodeType?: WorkflowNodeType; // Generic type: START | END | TASK | CHECK | APPROVAL | NOTIFICATION | BRANCH | MERGE | INTEGRATION
  description?: string;
  isStart?: boolean;
  isEnd?: boolean;
  timeLimitDays: number; // Hạn xử lý tại bước (ngày)
  workHours: number; // Số giờ làm việc
  warningBeforeHours: number; // Cảnh báo trước (giờ)
  workSchedule: string; // Lịch làm việc (Hành chính / 24/7 / Trực chiến)
  storedDocuments: string[]; // Văn bản lưu tại bước / output documents
  inputDocuments?: string[]; // Văn bản đầu vào
  stepForms: string[]; // Biểu mẫu tại bước
  statusChangeDoc: string; // Văn bản đổi trạng thái tại bước
  customOrder?: number;
  // Thư viện cấu hình chuẩn, Kế thừa & Override:
  inheritedFromId?: string; // ID mẫu trong Thư viện cấu hình chuẩn
  inheritedFromName?: string; // Tên mẫu cấu hình đang kế thừa
  isCustomized?: boolean; // false = [ Mặc định ], true = [ Tùy chỉnh riêng ]

  // Section Điều kiện nghiệp vụ:
  conditions?: string[]; // Danh sách tiêu chí/điều kiện nghiệp vụ của bước
  conditionsOverride?: boolean; // true = [ Tùy chỉnh riêng ], false = [ Mặc định ]

  // Section Dữ liệu & Biểu mẫu:
  formsOverride?: boolean; // Tùy chỉnh riêng Biểu mẫu điện tử (stepForms)
  inputDocsOverride?: boolean; // Tùy chỉnh riêng Văn bản đầu vào (inputDocuments)
  outputDocsOverride?: boolean; // Tùy chỉnh riêng Văn bản lưu / đầu ra (storedDocuments)

  // Cờ override SLA & Actions:
  slaOverride?: boolean;
  actionsOverride?: boolean;

  // Generic architecture extensions:
  actions?: WorkflowAction[];
  aiConfig?: AIConfig;
  approvalConfig?: ApprovalConfig;
  notificationConfig?: NotificationConfig;
  branchConfig?: BranchConfig;
  integrationConfig?: IntegrationConfig;
  assigneeRole?: string;
  position?: { x: number; y: number };
}

// Aliases for clean generic workflow architecture
export type WorkflowNode = ProcessStep;
export type WorkflowLane = ProcessLane;
export type WorkflowPhase = ProcessStage;
export type WorkflowConnector = ProcessTransition;
export type Workflow = ProcessWorkflow;

export interface ProcessLane {
  id: string;
  name: string;
  code: string;
  order: number;
  description?: string;
}

export interface ProcessStage {
  id: string;
  name: string;
  order: number;
  description?: string;
}

export interface VersionChangeItem {
  type: 'add' | 'modify' | 'remove';
  title: string;
  description: string;
  target?: string;
}

export interface VersionHistoryItem {
  version: string;
  publishedAt: string;
  publishedBy: string;
  role?: string;
  notes: string;
  isCurrentActive: boolean;
  canCuPhapLy?: string;
  totalSteps?: number;
  slaDays?: number;
  lanesCount?: number;
  formsCount?: number;
  changes?: VersionChangeItem[];
  snapshotWorkflow?: {
    steps: ProcessStep[];
    transitions: ProcessTransition[];
    lanes?: ProcessLane[];
    stages?: ProcessStage[];
  };
}

export type WorkflowAuditActionType =
  | 'create_step'
  | 'delete_step'
  | 'edit_step'
  | 'move_step'
  | 'create_transition'
  | 'delete_transition'
  | 'edit_condition'
  | 'change_form'
  | 'change_sla'
  | 'change_lane'
  | 'change_stage'
  | 'save_draft'
  | 'publish'
  | 'create_version';

export interface WorkflowAuditLogItem {
  id: string;
  timestamp: string; // vd: 20/09/2026 14:35
  authorName: string;
  authorRole: string;
  actionType: WorkflowAuditActionType;
  actionLabel: string;
  targetName: string; // Tên bước + mã bước (node) hoặc Bước nguồn -> Bước đích (connector)
  targetId: string;
  targetType: 'step' | 'transition' | 'lane' | 'stage' | 'workflow';
  beforeValue?: any;
  afterValue?: any;
  notes?: string;
  snapshotId?: string;
  snapshot?: ProcessWorkflowSnapshot;
}

export interface ProcessWorkflowSnapshot {
  id: string;
  timestamp: string;
  author: string;
  label: string;
  workflowState: {
    lanes: ProcessLane[];
    stages: ProcessStage[];
    steps: ProcessStep[];
    transitions: ProcessTransition[];
  };
}

export interface ProcessWorkflow {
  id: string;
  code: string; // Mã quy trình tự sinh
  name: string;
  loaiDonId: string; // ID loại đơn gắn với quy trình
  loaiDonName: string; // Tên loại đơn hiển thị
  version: string; // vd: v1.0
  status: ProcessStatus; // draft, published, archived
  description?: string;
  updatedAt: string;
  updatedBy: string;
  effectiveDate?: string;
  lanes: ProcessLane[];
  stages: ProcessStage[];
  steps: ProcessStep[];
  transitions: ProcessTransition[];
  versionHistory: VersionHistoryItem[];
  isLatestForLoaiDon?: boolean; // Đang là phiên bản mới nhất áp dụng cho Loại đơn này
  auditLogs?: WorkflowAuditLogItem[];
  activeDonsCount?: number; // Số hồ sơ đang chạy theo phiên bản này
  snapshots?: ProcessWorkflowSnapshot[];
}

export interface LoaiDonBinding {
  loaiDonId: string;
  loaiDonName: string;
  activeWorkflowId?: string;
  activeWorkflowCode?: string;
  activeWorkflowName?: string;
  activeVersion?: string;
  effectiveDate?: string;
  isDraftOnly?: boolean;
}

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  targetType: 'step' | 'transition' | 'general';
  targetId?: string;
  message: string;
  hint?: string;
}

export interface VersionComparisonDiff {
  addedSteps: ProcessStep[];
  removedSteps: ProcessStep[];
  modifiedSteps: {
    before: ProcessStep;
    after: ProcessStep;
    changedFields: string[];
  }[];
  unchangedSteps: ProcessStep[];
  addedTransitions: ProcessTransition[];
  removedTransitions: ProcessTransition[];
  modifiedTransitions: {
    before: ProcessTransition;
    after: ProcessTransition;
    changedFields: string[];
  }[];
  unchangedTransitions: ProcessTransition[];
  slaDiffDays: number;
}
