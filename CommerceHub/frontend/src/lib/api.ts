import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  // Try to get token from localStorage (assuming we store it there upon login)
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('minikart_user');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }
  return config;
});

export default api;
