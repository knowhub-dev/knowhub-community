'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User as BaseUser } from '@/types';

interface AuthUser extends BaseUser {
  role?: 'admin' | 'user';
}

// 2. Kontekstga 'isAdmin'ni qo'shamiz
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  isAdmin: boolean; // <-- BU HAM MUHIM
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Bu manzil to'g'ri (api.ts da /api/v1 prefiksi bor)
        const response = await api.get<{ data: AuthUser } | AuthUser>('/profile/me');
        const payload = response.data;
        const normalizedUser = 'data' in payload ? payload.data : payload;
        setUser(normalizedUser);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: AuthUser }>('/auth/email/login', {
      email,
      password,
    });
    const { token, user: userData } = response.data;
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const response = await api.post<{ token: string; user: AuthUser }>('/auth/email/register', {
      name,
      username,
      email,
      password,
    });
    const { token, user: userData } = response.data;
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/email/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };
  
  // 3. isAdmin qiymatini shu yerda, 'user.role'ga qarab hisoblaymiz
  const isAdmin = !!user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser, isAdmin }}>
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