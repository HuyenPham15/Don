export type WorkItemPriority = 'urgent' | 'high' | 'normal';

export type WorkItemDeadlineType = 'overdue' | 'today' | 'upcoming' | 'normal';

export type WorkItemColumn = 'action_required' | 'processing' | 'waiting' | 'handed_over';

// ─── Tách riêng 3 khái niệm theo nghiệp vụ: ─────────────────────────────────
// 1. WORKFLOW STATUS: column (action_required | processing | waiting | handed_over)
// 2. AI STATUS: aiStatus
export type AIProcessingStatus = 'completed' | 'processing' | 'failed' | 'needs_review' | 'none';

// 3. TASK READINESS: taskReadiness
export type TaskReadiness = 'waiting_system' | 'action_required' | 'needs_review' | 'manual_required' | 'completed';

export interface WorkItemHolder {
  role: 'Đang xử lý' | 'Đang chờ' | 'Đã bàn giao cho';
  name: string;
  department?: string;
}

export interface WorkItemProgress {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  steps: string[];
}

export interface WorkItemCTA {
  label: string;
  actionType:
    | 'handle_now'
    | 'accept'
    | 'process'
    | 'continue'
    | 'supplement'
    | 'view_progress'
    | 'view_doc'
    | 'manual_process'
    | 'retry_ai'
    | 'review_ai';
  variant: 'urgent' | 'primary' | 'outline' | 'neutral' | 'warning';
}

export interface WorkItem {
  id: string;
  code: string;
  title: string;
  sender: string;
  source: string;
  timeReceived: string;
  priority: WorkItemPriority;
  deadlineType: WorkItemDeadlineType;
  deadlineText: string;
  deadlineFull?: string;
  column: WorkItemColumn;
  nextAction: string;
  holder: WorkItemHolder;
  progress: WorkItemProgress;
  docCount: number;
  cta: WorkItemCTA;
  category: string;
  tags?: string[];
  luotNhanId?: string;
  loaiDon?: string;

  // Thuộc tính Phân công nhiệm vụ (BR-04)
  nguoiGiao?: string;
  ngayDuocGiao?: string;

  // Thuộc tính AI Processing
  aiStatus?: AIProcessingStatus;
  aiProgress?: number; // 0..100
  aiFailureReason?: string;
  aiReviewNote?: string;
  taskReadiness?: TaskReadiness;
  nguonXuLy?: 'file_ocr' | 'ghi_chu_thu_cong';
  lyDoTraLai?: string;
  lyDoBanGiao?: string;
}
