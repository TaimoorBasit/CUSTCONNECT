'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId?: string;
  departmentId?: string;
  year?: number;
  studentId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Only remove token if it's a 401 (unauthorized) - means token is invalid/expired
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        // Handle network errors gracefully
        if (error.message?.includes('Unable to connect') || error.message?.includes('Network error') || !error.response) {
          console.error('Auth check failed - network error:', error.message);
          // Don't clear token on network errors - user might just be offline or server is down
          // Set user to null temporarily but keep token
          setUser(null);
          return; // Exit early, don't clear token
        }

        // Only clear token if it's an authentication error (401)
        if (error.response?.status === 401 || error.message?.includes('Authentication') || error.message?.includes('Session expired')) {
          console.error('Auth check failed - invalid token:', error);
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // For other errors, log but don't clear token
          console.error('Auth check failed - unknown error:', error);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing invalid token
      localStorage.removeItem('token');

      const response = await authService.login(email, password);

      // Validate token before storing
      if (!response.token || response.token.trim().length === 0) {
        throw new Error('Invalid token received from server');
      }

      // Store token securely
      localStorage.setItem('token', response.token.trim());

      // Validate user data
      if (!response.user || !response.user.id) {
        throw new Error('Invalid user data received from server');
      }

      setUser(response.user);
    } catch (error: any) {
      // Clear token on any error
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      // Don't auto-login after registration, user needs to verify email
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      await authService.verifyEmail(email, otp);
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    try {
      await authService.resendOTP(email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
    resendOTP
  };

  return (
    <AuthContext.Provider value={value}>
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









