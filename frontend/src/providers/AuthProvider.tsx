'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

// 1. Foydalanuvchi interfeysiga 'role' maydonini qo'shamiz
interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  avatar_url?: string;
  xp: number;
  bio?: string;
  website_url?: string;
  github_url?: string;
  linkedin_url?: string;
  resume?: string;
  stats?: any;
  created_at?: string;
  role?: 'admin' | 'user'; // <-- ENG MUHIM QO'SHIMCHA
}

// 2. Kontekstga 'isAdmin'ni qo'shamiz
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  isAdmin: boolean; // <-- BU HAM MUHIM
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Bu manzil to'g'ri (api.ts da /api/v1 prefiksi bor)
        const response = await api.get('/profile/me'); 
        
        // Bizda "data" o'rami yo'q, buni oldin to'g'irlagandik
        setUser(response.data.data); 
      } else {
        setUser(null);
      }
    } catch (error) {
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
    const response = await api.post('/auth/email/login', { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const response = await api.post('/auth/email/register', { name, username, email: string, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/email/logout');
    } catch (error) {
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