import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { emailOrUsername: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  becomeCreator: () => api.post('/auth/become-creator'),

  logout: () => api.post('/auth/logout'),
};

// Content API
export const contentAPI = {
  list: (params?: any) => api.get('/content', { params }),

  get: (id: string) => api.get(`/content/${id}`),

  create: (data: any) => api.post('/content', data),

  update: (id: string, data: any) => api.patch(`/content/${id}`, data),

  delete: (id: string) => api.delete(`/content/${id}`),

  like: (id: string) => api.post(`/content/${id}/like`),

  getStreamUrl: (id: string) => api.get(`/content/${id}/stream`),
};

// Payment API
export const paymentAPI = {
  createPurchase: (data: any) => api.post('/payments/purchase', data),

  createSubscription: (data: any) => api.post('/payments/subscribe', data),

  cancelSubscription: (id: string) => api.post(`/payments/subscriptions/${id}/cancel`),

  renewSubscription: (id: string, data: any) =>
    api.post(`/payments/subscriptions/${id}/renew`, data),
};

// User API
export const userAPI = {
  getProfile: (username: string) => api.get(`/users/${username}`),

  updateProfile: (data: any) => api.patch('/users/me', data),

  getLibrary: () => api.get('/users/me/library'),

  getPurchaseHistory: () => api.get('/users/me/purchases'),

  getSubscriptions: () => api.get('/users/me/subscriptions'),
};

// Creator API
export const creatorAPI = {
  getDashboard: () => api.get('/creator/dashboard'),

  getAnalytics: (params?: any) => api.get('/creator/analytics', { params }),

  getEarnings: () => api.get('/creator/earnings'),

  requestPayout: (data: any) => api.post('/creator/payout', data),

  getSubscribers: () => api.get('/creator/subscribers'),
};
