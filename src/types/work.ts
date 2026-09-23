export type WorkItemPriority = 'urgent' | 'high' | 'normal';

export type WorkItemDeadlineType = 'overdue' | 'today' | 'upcoming' | 'normal';

// 4 Cột Kanban chính trên màn hình + completed cho tab lịch sử riêng
export type WorkItemColumn = 'action_required' | 'processing' | 'waiting' | 'handed_over' | 'completed';

// Phân biệt 3 nguồn phát sinh công việc
export type WorkItemSourceType = 'luot_nhan' | 'don' | 'vu_viec';

// Trạng thái AI độc lập (hiển thị dưới dạng badge)
export type AIProcessingStatus = 'completed' | 'processing' | 'failed' | 'needs_review' | 'none';

// Trạng thái nghiệp vụ phụ (hiển thị dưới dạng badge/tag trên card)
export type WorkItemSubStatus =
  | 'moi_giao'
  | 'chua_xu_ly'
  | 'can_kiem_tra_ai'
  | 'can_bo_sung'
  | 'bi_tra_lai'
  | 'can_xac_nhan'
  | 'cho_ky'
  | 'cho_phe_duyet'
  | 'cho_phoi_hop'
  | 'cho_he_thong'
  | 'dang_xu_ly'
  | 'da_ban_giao'
  | 'da_hoan_thanh';

// TASK READINESS
export type TaskReadiness = 'waiting_system' | 'action_required' | 'needs_review' | 'manual_required' | 'completed';

export interface WorkItemHolder {
  role: 'Đang xử lý' | 'Đang chờ' | 'Đã bàn giao cho' | 'Đã hoàn thành';
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
  sourceType?: WorkItemSourceType; // [Lượt nhận] | [Đơn] | [Vụ việc]
  actionTitle?: string; // Việc cần xử lý ngắn gọn (VD: Phân loại và xác định hướng xử lý)
  subStatus?: WorkItemSubStatus; // Badge nghiệp vụ phụ
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

  // Lọc theo phòng ban và phân công
  departmentId?: string;
  departmentName?: string;
  nguoiGiao?: string;
  ngayDuocGiao?: string;

  // Thuộc tính AI Processing (hiển thị dạng badge phụ)
  aiStatus?: AIProcessingStatus;
  aiProgress?: number; // 0..100
  aiFailureReason?: string;
  aiReviewNote?: string;
  taskReadiness?: TaskReadiness;
  nguonXuLy?: 'file_ocr' | 'ghi_chu_thu_cong';
  lyDoTraLai?: string;
  lyDoBanGiao?: string;
}
