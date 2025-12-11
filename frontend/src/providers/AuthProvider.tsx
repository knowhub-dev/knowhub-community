'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api, ensureCsrfCookie } from '@/lib/api';
import { clearAuthCookie } from '@/lib/auth-cookie';
import type { User as BaseUser } from '@/types';

interface AuthUser extends BaseUser {
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  isAdmin: boolean; // <-- BU HAM MUHIM
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const applyToken = (token?: string | null) => {
    if (typeof window === 'undefined') return;

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem('auth_token', token);
    } else {
      delete api.defaults.headers.common.Authorization;
      localStorage.removeItem('auth_token');
    }
  };

  const checkUser = async () => {
    setLoading(true);
    try {
      // Bu manzil to'g'ri (api.ts da /api/v1 prefiksi bor)
      const response = await api.get<{ data: AuthUser } | AuthUser>('/profile/me');
      const payload = response.data;
      const normalizedUser = 'data' in payload ? payload.data : payload;
      setUser(normalizedUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        api.defaults.headers.common.Authorization = `Bearer ${stored}`;
      }
    }

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    await ensureCsrfCookie();
    const response = await api.post<{ user: AuthUser } | AuthUser>('/auth/login', {
      email,
      password,
    });
    const payload = response.data as any;
    const userData = payload.user ?? payload.data ?? payload;
    applyToken(payload.token ?? null);
    setUser(userData);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    await ensureCsrfCookie();
    const response = await api.post<{ user: AuthUser } | AuthUser>('/auth/register', {
      name,
      username,
      email,
      password,
      password_confirmation: password,
    });
    const payload = response.data as any;
    const userData = payload.user ?? payload.data ?? payload;
    applyToken(payload.token ?? null);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      clearAuthCookie();
      applyToken(null);
      setUser(null);
    }
  };
  
  const isAdmin = !!user && (user.role === 'admin' || (user as any).is_admin);
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
