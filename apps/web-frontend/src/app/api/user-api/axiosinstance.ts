import axios from 'axios';
import { USER_API_CONFIG } from './Config';

const axiosInstance = axios.create({
  baseURL: USER_API_CONFIG.BASE_URL,
  timeout: USER_API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': USER_API_CONFIG.API_KEY,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
