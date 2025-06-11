import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';

// ✅ Use VITE_API_URL or fallback to production backend
const baseURL = import.meta.env.VITE_API_URL?.trim() || 'https://estore-backend-if2a.onrender.com';
console.log('✅ API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true, // Always send cookies!
  headers: {
    'Content-Type': 'application/json',
  },
});

// ❌ NO JWT HEADER: cookie-based sessions only

// 🔄 Silent refresh & retry on 401
api.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    const status = response?.status;
    const url = config?.url || '';

    const isAuthEndpoint =
      url.includes('/api/users/login') ||
      url.includes('/api/users/register') ||
      url.includes('/api/users/signup');
    const isAnalytics = url.includes('/api/admin/analytics');
    const isRefreshCall = url.includes('/api/users/refresh');

    // Try silent refresh once
    if (status === 401 && !config._retry && !isAuthEndpoint && !isAnalytics && !isRefreshCall) {
      config._retry = true;
      try {
        await api.post('/api/users/refresh');
        // retry original request
        return api(config);
      } catch (refreshError) {
        // on refresh failure, logout & redirect
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Global error handling
    if (error.message === 'Network Error') {
      toast.error('🌐 Network error: Check your connection.');
    } else if (status === 401 && !isAuthEndpoint && !isAnalytics) {
      toast.error('🔒 Login required. Please sign in first.');
    } else if (status >= 500) {
      toast.error('💥 Server error. Try again later.');
    } else if (status === 400 && response?.data?.error) {
      toast.error(response.data.error);
    }

    return Promise.reject(error);
  }
);

export default api;
