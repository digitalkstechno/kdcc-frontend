import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let token = null;
      
      const adminToken = localStorage.getItem('mkgroup_admin_token');
      const userToken = localStorage.getItem('mkgroup_user_token');
      
      const adminEndpoints = ['/user/update', '/user/create', '/user/all', '/user/delete', '/builder/all'];
      const isAdminEndpoint = adminEndpoints.some(endpoint => config.url?.includes(endpoint));

      // 1. If it's a known admin endpoint, prioritize admin token
      if (isAdminEndpoint && adminToken) {
        token = adminToken;
      } 
      // 2. Otherwise, use path-based selection
      else if (window.location.pathname.startsWith('/admin')) {
        token = adminToken;
      } else if (window.location.pathname.startsWith('/user')) {
        token = userToken;
      } 
      // 3. Last resort fallback
      else {
        token = adminToken || userToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
