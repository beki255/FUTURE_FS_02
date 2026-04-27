import axios from 'axios';

// Create an axios instance with base URL
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions for authentication
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  getUser: (id) => api.get(`/auth/users/${id}`),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  approveUser: (id, isApproved) => api.put(`/auth/users/${id}/approve`, { isApproved }),
  getAgentStats: () => api.get('/auth/agent-stats'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  enable2FA: () => api.post('/auth/enable-2fa'),
  verify2FA: (email, password, code) => api.post('/auth/verify-2fa', { email, password, code }),
  confirm2FA: (code) => api.post('/auth/confirm-2fa', { code }),
  disable2FA: (code) => api.post('/auth/disable-2fa', { code }),
  get2FAStatus: () => api.get('/auth/2fa-status'),
};

// API functions for leads
export const leadsAPI = {
  // Get all leads with optional filters
  getAll: (params = {}) => api.get('/leads', { params }),
  
  // Get single lead by ID
  getById: (id) => api.get(`/leads/${id}`),
  
  // Create new lead
  create: (data) => api.post('/leads', data),
  
  // Update lead
  update: (id, data) => api.put(`/leads/${id}`, data),
  
  // Delete lead
  delete: (id) => api.delete(`/leads/${id}`),
  
  // Add note to lead
  addNote: (id, content) => api.post(`/leads/${id}/notes`, { content }),
  
  // Assign lead to agent (admin)
  assignToAgent: (id, userId, username) => api.put(`/leads/${id}/assign`, { userId, username }),
  
  // Agent accept/reject lead
  respondToLead: (id, action) => api.put(`/leads/${id}/respond`, { action }),
  
  // Get leads by agent (admin)
  getByAgent: (userId) => api.get(`/leads/by-agent/${userId}`),
};

// Public API - without authentication token
export const publicAPI = axios.create({
  baseURL: API_URL,
});

export const publicLeadAPI = {
  // Submit lead from public website form (no auth required)
  submit: (data) => publicAPI.post('/leads/public', data),
};

// API functions for notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;