import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use relative path or current domain
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // Development fallback
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 دقائق للطلبات الكبيرة
  maxContentLength: 100 * 1024 * 1024, // 100MB
  maxBodyLength: 100 * 1024 * 1024, // 100MB
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة أخطاء مختلفة
    if (error.response) {
      // الخادم رد بخطأ
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 413:
          // Request Entity Too Large
          console.error('حجم الطلب كبير جداً:', data?.message || error.message);
          break;
        case 429:
          // Too Many Requests
          console.error('طلبات كثيرة جداً:', data?.message || error.message);
          break;
        case 500:
          console.error('خطأ في الخادم:', data?.message || error.message);
          break;
        default:
          console.error(`خطأ ${status}:`, data?.message || error.message);
      }
    } else if (error.request) {
      // الطلب تم إرساله لكن لم يتم الرد
      console.error('لا يوجد رد من الخادم:', error.message);
    } else {
      // خطأ في إعداد الطلب
      console.error('خطأ في الطلب:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API Methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => {
    // إذا كان البيانات تحتوي على ملفات، استخدم FormData
    const config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
      config.timeout = 600000; // 10 دقائق للملفات الكبيرة
    }
    return api.post('/products', data, config);
  },
  update: (id, data) => {
    // إذا كان البيانات تحتوي على ملفات، استخدم FormData
    const config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
      config.timeout = 600000; // 10 دقائق للملفات الكبيرة
    }
    return api.put(`/products/${id}`, data, config);
  },
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getUserOrders: () => api.get('/orders/user/me'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const shippingAPI = {
  getCompanies: () => api.get('/shipping/companies'),
  calculateCost: (data) => api.post('/shipping/calculate', data),
};
