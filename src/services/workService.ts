import { apiClient, ApiResponse } from './apiClient';
import type { WorkItem } from '../types/work';

export const workService = {
  // Lấy danh sách công việc của tôi
  async getWorkItems(params?: { column?: string; departmentId?: string; search?: string }) {
    const res = await apiClient.get<ApiResponse<WorkItem[]>>('/work-items', params);
    return res.data;
  },

  // Lấy chi tiết công việc
  async getWorkItemById(id: string) {
    const res = await apiClient.get<ApiResponse<WorkItem>>(`/work-items/${id}`);
    return res.data;
  },

  // Cập nhật tiến độ công việc
  async updateWorkItem(id: string, updates: Partial<WorkItem>) {
    const res = await apiClient.put<ApiResponse<WorkItem>>(`/work-items/${id}`, updates);
    return res.data;
  },

  // Tạo công việc mới
  async createWorkItem(item: WorkItem) {
    const res = await apiClient.post<ApiResponse<WorkItem>>('/work-items', item);
    return res.data;
  },
};
