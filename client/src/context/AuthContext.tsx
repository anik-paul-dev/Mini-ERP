import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiClient from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.roleName === 'Admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
