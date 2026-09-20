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

export interface ProcessTransition {
  id: string;
  actionName: string;
  fromStepId: string;
  toStepId: string;
  type: TransitionType;
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
  stageId: string; // Giai đoạn
  description?: string;
  isStart?: boolean;
  isEnd?: boolean;
  timeLimitDays: number; // Hạn xử lý tại bước (ngày)
  workHours: number; // Số giờ làm việc
  warningBeforeHours: number; // Cảnh báo trước (giờ)
  workSchedule: string; // Lịch làm việc (Hành chính / 24/7 / Trực chiến)
  storedDocuments: string[]; // Văn bản lưu tại bước
  stepForms: string[]; // Biểu mẫu tại bước
  statusChangeDoc: string; // Văn bản đổi trạng thái tại bước
  customOrder?: number;
}

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
