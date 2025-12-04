import axios from 'axios';

import { clearAuthCookie } from './auth-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
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

      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          delete api.defaults.headers.common['Authorization'];
        }

        clearAuthCookie();
      }
    } else if (error.request) {
      console.error('API Error Request:', error.request);
    } else {
      console.error('API Error Message:', error.message);
    }
    throw error;
  }
);


