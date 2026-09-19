// src/types/businessAdmin.ts

export type BusinessAdminTab = 'quy-trinh' | 'loai-don' | 'lich-lam-viec' | 'bieu-mau';

export interface LoaiDonItem {
  id: string;
  code: string;
  name: string;
  description: string;
  standardProcessingDays: number; // Thời hạn chuẩn (ngày)
  activeWorkflowId?: string;
  activeWorkflowCode?: string;
  activeWorkflowName?: string;
  activeWorkflowVersion?: string;
  status: 'active' | 'inactive';
  updatedAt: string;
  updatedBy: string;
}

export interface LichLamViecItem {
  id: string;
  code: string;
  name: string;
  description: string;
  workingDays: string[]; // ['Thứ 2', 'Thứ 3', ...]
  morningHours: string; // '08:00 - 12:00'
  afternoonHours: string; // '13:30 - 17:30'
  isDefault: boolean;
  applicableDepartments: string[];
  updatedAt: string;
}

export interface BieuMauItem {
  id: string;
  code: string; // Vd: BM-01/TN
  name: string;
  loaiDonId: string; // Gắn với loại đơn nào
  loaiDonName: string;
  applicableStepName: string; // Bước áp dụng
  fileFormat: 'DOCX' | 'PDF' | 'XLSX';
  fileSize: string;
  status: 'active' | 'draft' | 'deprecated';
  version: string;
  updatedAt: string;
  updatedBy: string;
}
