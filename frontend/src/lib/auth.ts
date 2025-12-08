import { api, ensureCsrfCookie } from './api';

export const login = async (email: string, password: string) => {
  await ensureCsrfCookie();
  const res = await api.post('/login', { email, password });
  return res.data;
};

export const register = async (name: string, email: string, password: string) => {
  await ensureCsrfCookie();
  const res = await api.post('/register', { name, email, password });
  return res.data;
};

export const logout = async () => {
  await api.post('/logout');
};

