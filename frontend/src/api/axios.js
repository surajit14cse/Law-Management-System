import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Use relative path for Vite proxy
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure we don't double up 'Bearer ' if it's already in the stored string
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers['Authorization'] = formattedToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
