import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const AUTH_STORAGE_KEY = 'auth_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

// Har bir so'rov oldidan tokenni qo'shib boramiz (agar mavjud bo'lsa)
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: config.headers?.Authorization || `Bearer ${token}`,
      };
    }
  }
  return config;
});

// Xatolarni global tutish
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });

      if (error.response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        delete api.defaults.headers.common['Authorization'];
      }
    } else if (error.request) {
      console.error('API Error Request:', error.request);
    } else {
      console.error('API Error Message:', error.message);
    }
    throw error;
  }
);


