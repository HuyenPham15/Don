import { apiClient, ApiResponse } from './apiClient';
import type { LuotNhan } from '../types';

export interface GhepDonPayload {
  targetDonCode: string;
  lyDo?: string;
  ghiChu?: string;
}

export interface BanGiaoDonPayload {
  donViNhan?: string;
  canBoNhan?: string;
  lyDoBanGiao?: string;
}

export const donService = {
  // Lấy danh sách lượt nhận đơn
  async getDonList(params?: { status?: string; search?: string }) {
    const res = await apiClient.get<ApiResponse<LuotNhan[]>>('/don', params);
    return res.data;
  },

  // Lấy chi tiết đơn theo ID
  async getDonById(id: string) {
    const res = await apiClient.get<ApiResponse<LuotNhan>>(`/don/${id}`);
    return res.data;
  },

  // Tiếp nhận đơn mới
  async createDon(payload: Partial<LuotNhan>) {
    const res = await apiClient.post<ApiResponse<LuotNhan>>('/don', payload);
    return res.data;
  },

  // Cập nhật thông tin đơn
  async updateDon(id: string, updates: Partial<LuotNhan>) {
    const res = await apiClient.put<ApiResponse<LuotNhan>>(`/don/${id}`, updates);
    return res.data;
  },

  // Ghép lượt nhận vào hồ sơ đơn đã có
  async ghepDon(id: string, payload: GhepDonPayload) {
    const res = await apiClient.post<ApiResponse<any>>(`/don/${id}/ghep`, payload);
    return res.data;
  },

  // Bàn giao đơn sang đơn vị / cán bộ khác
  async banGiaoDon(id: string, payload: BanGiaoDonPayload) {
    const res = await apiClient.post<ApiResponse<LuotNhan>>(`/don/${id}/ban-giao`, payload);
    return res.data;
  },

  // Lấy danh sách các đơn trùng / tương đồng để đối soát
  async getDonTrungList() {
    const res = await apiClient.get<ApiResponse<any[]>>('/don/trung-lap');
    return res.data;
  },
};
