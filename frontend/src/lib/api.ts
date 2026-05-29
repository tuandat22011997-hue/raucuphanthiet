/**
 * API client cho toàn bộ frontend
 * Dùng axios với interceptor để tự động thêm JWT token
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - tự động thêm JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - xử lý lỗi 401
apiClient.interceptors.response.use(
  (response) => response.data, // Tự unwrap data
  async (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/reset-password');
      // Token hết hạn - xóa và redirect login (ngoại trừ request đăng nhập)
      if (!isAuthRequest && typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/dang-nhap';
      }
    }
    return Promise.reject(error.response?.data || error);
  },
);

// ============ Auth API ============
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; address: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  resetPassword: (data: any) => apiClient.post('/auth/reset-password', data),
  getMe: () => apiClient.get('/auth/me'),
};

// ============ Products API ============
export const productsApi = {
  getAll: (params?: {
    search?: string;
    categoryId?: string;
    categorySlug?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
    inStock?: boolean;
    featured?: boolean;
  }) => apiClient.get('/products', { params }),
  search: (q: string, limit = 10) =>
    apiClient.get('/products/search', { params: { q, limit } }),
  getBySlug: (slug: string) => apiClient.get(`/products/${slug}`),
  getTopSelling: (limit = 10) =>
    apiClient.get('/products/top-selling', { params: { limit } }),
  create: (data: FormData) =>
    apiClient.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    apiClient.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

// ============ Categories API ============
export const categoriesApi = {
  getAll: (activeOnly = false) =>
    apiClient.get('/categories', { params: { activeOnly } }),
  create: (data: any) => apiClient.post('/categories', data),
  update: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

// ============ Orders API ============
export const ordersApi = {
  create: (data: any) => apiClient.post('/orders', data),
  getMyOrders: (page = 1, limit = 10) =>
    apiClient.get('/orders/my', { params: { page, limit } }),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  // Admin
  getAll: (params?: any) => apiClient.get('/orders', { params }),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/orders/${id}/status`, { status }),
  delete: (id: string) => apiClient.delete(`/orders/${id}`),
  getDashboardStats: () => apiClient.get('/orders/dashboard-stats'),
  exportSingle: (id: string) =>
    axios.get(`${API_URL}/orders/${id}/export`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      responseType: 'blob',
    }),
  exportBulk: (ids: string[]) =>
    axios.post(`${API_URL}/orders/export-bulk`, { ids }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      responseType: 'blob',
    }),
};

// ============ Addresses API ============
export const addressesApi = {
  getAll: () => apiClient.get('/addresses'),
  create: (data: any) => apiClient.post('/addresses', data),
  update: (id: string, data: any) => apiClient.put(`/addresses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/addresses/${id}`),
};

// ============ Users API (Admin) ============
export const usersApi = {
  getCustomers: (params?: any) => apiClient.get('/users/customers', { params }),
  updateProfile: (data: any) => apiClient.patch('/users/profile', data),
  updateCustomer: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// ============ Settings API ============
export const settingsApi = {
  getAll: () => apiClient.get('/settings'),
  update: (data: Record<string, string>) => apiClient.put('/settings', data),
};
