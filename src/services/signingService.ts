import { apiClient, ApiResponse } from './apiClient';
import type { SigningDocument } from '../types/signing';

export const signingService = {
  // Lấy danh sách văn bản trình ký
  async getSigningDocuments(status?: string) {
    const res = await apiClient.get<ApiResponse<SigningDocument[]>>('/signing', { status });
    return res.data;
  },

  // Chi tiết văn bản trình ký
  async getSigningDocumentById(id: string) {
    const res = await apiClient.get<ApiResponse<SigningDocument>>(`/signing/${id}`);
    return res.data;
  },

  // Ký số chứng thư số VGCA
  async signDocument(id: string, payload: { signerName?: string; note?: string }) {
    const res = await apiClient.post<ApiResponse<SigningDocument>>(`/signing/${id}/sign`, payload);
    return res.data;
  },
};
