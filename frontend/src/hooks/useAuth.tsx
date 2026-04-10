'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        connectSocket(storedToken);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    connectSocket(newToken);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
