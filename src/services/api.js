import axios from 'axios';
import { toast } from 'react-toastify';

// ✅ Safely use fallback if VITE_API_URL is missing or empty
const baseURL =
  import.meta.env.VITE_API_URL?.trim() || 'https://estore-backend-if2a.onrender.com';

console.log('✅ API Base URL:', baseURL); // optional debug log

const api = axios.create({
  baseURL,
  withCredentials: true, // needed if using cookies/session
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Attach token to every request if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isAnalytics = url.includes('/api/admin/analytics');
    const isAuthEndpoint = url.includes('/api/users/login') || url.includes('/api/users/signup');

    if (status === 401 && !isAnalytics && !isAuthEndpoint) {
      toast.error('Authentication required. Please log in.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (status === 400 && error.response?.data?.error) {
      toast.error(error.response.data.error);
    }

    return Promise.reject(error);
  }
);

export default api;
