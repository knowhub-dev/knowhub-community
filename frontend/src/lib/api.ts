import axios from 'axios';
import { getApiBaseUrl } from './api-base-url';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Xatolarni global tutish
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error Response:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });

      if (error.response.status === 401) {
        // Unauthorized responses are handled by the calling code.
      }

      if ([404, 500].includes(error.response.status)) {
        console.error('API critical error', {
          status: error.response.status,
          payload: error.response.data,
        });
      }
    } else if (error.request) {
      console.error('API Error Request:', error.request);
    } else {
      console.error('API Error Message:', error.message);
    }
    throw error;
  }
);


