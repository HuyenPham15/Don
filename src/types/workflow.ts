export type QuyTrinhId = 'to-giac' | 'khieu-nai' | 'to-cao' | 'kien-nghi';

export interface WorkflowStepItem {
  id: string;
  stepNumber: number;
  name: string;
  responsibleRole: string;
  responsibleUnit?: string;
  status: 'completed' | 'active' | 'pending';
  description: string;
  transferCondition?: string;
  estimatedDays: number;
}

export interface TaskItem {
  id: string;
  title: string;
  stepId: string;
  stepName: string;
  assignedTo: string;
  assignedRole: string;
  isCurrentUser: boolean;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  relatedDocuments: string[];
  aiAssistance: {
    summary?: string;
    checkDocuments?: string[];
    verifyInformation?: string[];
    actionSuggestions?: string[];
    warningNotes?: string[];
    draftTemplates?: string[];
  };
}

export interface MissingInfoItem {
  id: string;
  title: string;
  impactLevel: 'medium' | 'high' | 'critical';
  description: string;
  suggestedAction: string;
  relatedDoc: string;
  aiSource: string;
  resolved?: boolean;
}

export interface WorkflowDefinition {
  id: QuyTrinhId;
  name: string;
  code: string;
  version: string;
  matchedLoaiDon: string[];
  description: string;
  selectionBasis: string;
  totalSteps: number;
  participatingRoles: string[];
  steps: WorkflowStepItem[];
  defaultTasks: TaskItem[];
  potentialMissingInfo: MissingInfoItem[];
}

export interface ActiveWorkflowState {
  donCode: string;
  donTitle: string;
  luotNhanId: string;
  nguoiNop: string;
  loaiDonConfirmed: string;
  workflow: WorkflowDefinition;
  activeStepId: string;
  tasks: TaskItem[];
  missingInfoList: MissingInfoItem[];
  status: 'dang_xu_ly' | 'tam_dung' | 'hoan_thanh';
  startedAt: string;
  assignedOfficer: string;
  historyLogs: WorkflowHistoryLog[];
}

export interface WorkflowHistoryLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}
