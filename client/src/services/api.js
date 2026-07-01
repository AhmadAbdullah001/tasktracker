import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }

  return 'https://tasktracker-myq4.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tasktracker_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tasktracker_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  signup: (payload) => api.post('/auth/signup', payload),
  login: (payload) => api.post('/auth/login', payload),
  generateOtp: (payload) => api.post('/auth/generate-otp', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
  resendOtp: (payload) => api.post('/auth/resend-OTP', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
};

export const taskApi = {
  getAll: () => api.get('/tasks/'),
  getById: (taskId) => api.get(`/tasks/${taskId}`),
  create: (payload) => api.post('/tasks/', payload),
  update: (taskId, payload) => api.put(`/tasks/${taskId}`, payload),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
  complete: (taskId) => api.put(`/tasks/complete/${taskId}`),
  getByStatus: (status) => api.get(`/tasks/status/${status}`),
  search: (query) => api.get(`/tasks/search?query=${encodeURIComponent(query)}`),
  sort: (sortBy) => api.get(`/tasks/sort?sortBy=${sortBy}`),
  getDashboard: () => api.get('/tasks/dashboard'),
};

export default api;
