export interface Screen { /* TODO */ }
type Screen = "cong-viec" | "nhan-don-list" | "nhan-don-them" | "ban-phan-tich" | "don-tiep-nhan" | "thu-vien" | "bao-cao";

type AIJob = 0 | 1 | 2 | 3 | 4 | 5;

type DrawerType = "nguoi-gui" | "don-lien-quan" | "so-sanh" | "vu-viec" | "trung-don" | "mau-thuan" | "xem-nguon" | "rule" | "knowledge" | "can-cu";

interface DrawerState { type: DrawerType; field?: string; }

interface LuotNhan {
  id: string;
  ngayNhan: string;
  nguoiNop: string;
  hinhThuc: string;
  noiDung: string;
  donVi: string;
  aiJob: AIJob;
}

interface UploadedFile { name: string; size: string; category: "main" | "attach" | "extra"; }

type FieldType = "text" | "textarea" | "date" | "select" | "search";

interface DonField { key: string; label: string; ai: string | null; type: FieldType; options?: string[]; needsCheck?: boolean; full?: boolean; hlKey?: string; }

interface Acks { info: boolean; traCuu: boolean }

