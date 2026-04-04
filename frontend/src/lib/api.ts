import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token and request ID to every request
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = crypto.randomUUID();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Parse standardized error envelope and handle 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const requestId = error.response?.headers?.['x-request-id'] || data?.request_id;
    if (data?.error_code) {
      error.errorCode = data.error_code;
      error.userMessage = data.message;
      error.fieldErrors = data.details?.field_errors;
    }
    if (requestId) {
      error.requestId = requestId;
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
