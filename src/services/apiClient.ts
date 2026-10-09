/**
 * Core API Client Wrapper for Frontend
 * Đảm bảo mọi giao tiếp giữa Frontend và Backend đều thông qua chuẩn RESTful API.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
  count?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (_) {
          errorData = { message: response.statusText };
        }
        throw new Error(errorData.message || `Lỗi yêu cầu API (${response.status})`);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.warn(`[API Client Error] ${endpoint}:`, error.message);
      throw error;
    }
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let query = '';
    if (params) {
      const cleanParams: Record<string, string> = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          cleanParams[k] = String(v);
        }
      });
      if (Object.keys(cleanParams).length > 0) {
        query = `?${new URLSearchParams(cleanParams).toString()}`;
      }
    }
    return this.request<T>(`${endpoint}${query}`, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
