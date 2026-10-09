import { apiClient, ApiResponse } from './apiClient';

export interface AIAnalysisResult {
  isProcessed: boolean;
  confidence: number;
  loaiDonDuDoan: string;
  linhVuc: string;
  thamQuyen: string;
  deXuatHuongXuLy: {
    action: string;
    reason: string;
    targetDonCode?: string;
  };
  thucTheTrichXuat: {
    nguoiNop: string;
    doiTuongLienQuan: string;
    diaBan: string;
    yeuCauChinh: string;
  };
  aiPipelineSteps: Array<{ name: string; status: string; duration: string }>;
}

export const aiService = {
  // Gửi nội dung đơn để AI phân tích và đề xuất
  async analyzeDon(payload: { noiDung: string; loaiDon?: string; nguoiNop?: string }) {
    const res = await apiClient.post<ApiResponse<AIAnalysisResult>>('/ai/analyze', payload);
    return res.data;
  },

  // Tương tác với trợ lý AI tiếp nhận
  async chatAssistant(payload: { message: string; context?: any }) {
    const res = await apiClient.post<ApiResponse<{ reply: string; timestamp: string }>>('/ai/chat', payload);
    return res.data;
  },
};
