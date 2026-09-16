
export type Screen = "cong-viec" | "nhan-don-list" | "nhan-don-them" | "ban-phan-tich" | "don-tiep-nhan" | "thu-vien" | "bao-cao";

export type AIJob = 0 | 1 | 2 | 3 | 4 | 5;

export type DrawerType = "nguoi-gui" | "don-lien-quan" | "so-sanh" | "vu-viec" | "trung-don" | "mau-thuan" | "xem-nguon" | "rule" | "knowledge" | "can-cu";

export interface DrawerState { type: DrawerType; field?: string; }

export interface LuotNhan {
  id: string;
  ngayNhan: string;
  nguoiNop: string;
  hinhThuc: string;
  noiDung: string;
  donVi: string;
  aiJob: AIJob;
}

export interface UploadedFile { name: string; size: string; category: "main" | "attach" | "extra"; }

export type FieldType = "text" | "textarea" | "date" | "select" | "search";

export interface DonField { key: string; label: string; ai: string | null; type: FieldType; options?: string[]; needsCheck?: boolean; full?: boolean; hlKey?: string; }

export interface Acks { info: boolean; traCuu: boolean }

// ─── Workflow types ───────────────────────────────────────────────────────────

export interface WorkflowStep {
  id: string;
  name: string;
  responsible: string;
  status: "done" | "active" | "pending";
}

export interface WorkflowConfig {
  id: string;
  name: string;
  version: string;
  loaiDonId: string;
  effectiveDate: string;
  status: "active" | "inactive";
  scope: string;
  steps: Omit<WorkflowStep, "status">[];
}

export interface LoaiDon {
  id: string;
  name: string;
}

export type AcceptanceState = "idle" | "confirming" | "summary" | "success";
