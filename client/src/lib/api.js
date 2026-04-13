import axios from 'axios';

/**
 * Centralized Axios instance.
 * - Base URL defaults to localhost:5000 for dev.
 * - Automatically attaches JWT token from localStorage to every request.
 * - Intercepts 401 responses to clear stale tokens.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- Request Interceptor: Attach JWT token ---
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- Response Interceptor: Handle 401 (expired/invalid token) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored auth
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
