import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// log base URL for debugging (will show in browser console)
console.log('API_BASE_URL =', API_BASE_URL);
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Check for admin token first, then regular user token
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  const token = adminToken || userToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const isAdmin = localStorage.getItem('adminToken');
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Payment API
export const paymentAPI = {
  initiatePayment: (hours) => api.post('/payments/initiate', { hours }),
  getPaymentHistory: (page = 1, limit = 10) =>
    api.get('/payments/history', { params: { page, limit } }),
  checkPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),
};

// Session API
export const sessionAPI = {
  getCurrentSession: () => api.get('/sessions/current'),
  extendSession: (hours) => api.post('/sessions/extend', { hours }),
  endSession: () => api.post('/sessions/end'),
  getSessionSummary: () => api.get('/sessions/summary'),
};

// Admin API
export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (page = 1, limit = 20, search = '') =>
    api.get('/admin/users', { params: { page, limit, search } }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  getAllPayments: (page = 1, limit = 50, status = '', startDate = '', endDate = '') =>
    api.get('/admin/payments', { params: { page, limit, status, startDate, endDate } }),
  getActiveSessions: (page = 1, limit = 50) =>
    api.get('/admin/sessions', { params: { page, limit } }),
  deactivateUser: (userId, reason = '') =>
    api.post(`/admin/users/${userId}/deactivate`, { reason }),
  reactivateUser: (userId) => api.post(`/admin/users/${userId}/reactivate`),
};

// Portal API
export const portalAPI = {
  verifySession: (phoneNumber) => api.post('/portal/verify-session', { phoneNumber }),
  captivePortalCheck: (usermac) => api.get('/portal/check', { params: { usermac } }),
};

export default api;
