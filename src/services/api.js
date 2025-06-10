import axios from 'axios';
import { toast } from 'react-toastify';

// ✅ Use VITE_API_URL or fallback to production backend
const baseURL =
  import.meta.env.VITE_API_URL?.trim() || 'https://estore-backend-if2a.onrender.com';

console.log('✅ API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true, // Always send cookies!
  headers: {
    'Content-Type': 'application/json',
  },
});

// ❌ REMOVE JWT HEADER ATTACHER! (Cookie sessions only.)
// No api.interceptors.request for token needed.

// ✅ Global error handling for all API calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isAnalytics = url.includes('/api/admin/analytics');
    const isAuthEndpoint =
      url.includes('/api/users/login') ||
      url.includes('/api/users/register') ||
      url.includes('/api/users/signup');

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
