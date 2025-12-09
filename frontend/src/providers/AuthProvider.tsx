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
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ token?: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    const { user: userData } = response.data;
    setUser(userData);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const response = await api.post<{ token?: string; user: AuthUser }>('/auth/register', {
      name,
      username,
      email,
      password,
    });
    const { user: userData } = response.data;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      setUser(null);
    }
  };
  
  // 3. isAdmin qiymatini shu yerda, 'user.role'ga qarab hisoblaymiz
  const isAdmin = !!user && user.role === 'admin';
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