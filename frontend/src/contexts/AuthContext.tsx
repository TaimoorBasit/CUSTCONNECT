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

// ---------------------------------------------------------------------------
// Persistent storage helpers
// localStorage is persisted across Capacitor app restarts automatically.
// We also cache the user object so the app shows content immediately
// while the network call to verify the token is in-flight.
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'cc_token';
const USER_KEY = 'cc_user';

function saveToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { }
}
function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch { }
}
function saveUser(user: User) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { }
}
function loadCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start from cached user so the app shows content immediately — no flicker
  const [user, setUser] = useState<User | null>(loadCachedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Validate token against the server
      const userData = await authService.getCurrentUser();
      setUser(userData);
      saveUser(userData);           // keep cache fresh
    } catch (error: any) {
      const isNetworkError =
        !error.response ||
        error.message?.includes('Network') ||
        error.message?.includes('Unable to connect') ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED';

      if (isNetworkError) {
        // Offline / server cold-starting — trust the cached user so the
        // user stays logged in and the app remains usable.
        console.warn('[Auth] Network error during checkAuth — keeping cached session');
        // user state already set from loadCachedUser, leave it
      } else if (error.response?.status === 401) {
        // Token is genuinely invalid/expired — force re-login
        console.warn('[Auth] Token rejected (401) — logging out');
        clearToken();
        setUser(null);
      } else {
        // Other server error (5xx etc.) — keep cached session
        console.warn('[Auth] Server error during checkAuth — keeping cached session');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    clearToken(); // Clear stale token first
    const response = await authService.login(email, password);

    if (!response.token?.trim()) throw new Error('Invalid token received from server');
    if (!response.user?.id) throw new Error('Invalid user data received from server');

    saveToken(response.token.trim());
    saveUser(response.user);
    setUser(response.user);
  };

  const register = async (userData: RegisterData) => {
    await authService.register(userData);
    // Don't auto-login — user must verify email first
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  const verifyEmail = async (email: string, otp: string) => {
    await authService.verifyEmail(email, otp);
  };

  const resendOTP = async (email: string) => {
    await authService.resendOTP(email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, verifyEmail, resendOTP }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
