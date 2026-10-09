import { apiClient, ApiResponse } from './apiClient';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: string;
  department: string;
  avatar?: string;
}

export const authService = {
  // Lấy thông tin phiên đăng nhập hiện tại
  async getCurrentUser() {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
    return res.data;
  },

  // Đăng nhập
  async login(username: string, password: string) {
    const res = await apiClient.post<ApiResponse<{ user: UserProfile; token: string }>>('/auth/login', {
      username,
      password,
    });
    return res.data;
  },

  // Đăng xuất
  async logout() {
    const res = await apiClient.post<ApiResponse<any>>('/auth/logout');
    return res.data;
  },
};
