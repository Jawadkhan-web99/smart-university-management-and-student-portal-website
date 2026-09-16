'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole, RegisterPayload, LoginPayload } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  isActive: boolean;
  login: (credentials: LoginPayload) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (data: RegisterPayload) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'smart_uni_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate and fetch user profile with token
  const fetchCurrentUser = useCallback(async (jwtToken: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (response.ok && json.success && json.data?.user) {
        return json.data.user as User;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }, []);

  // Initialize session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          const currentUser = await fetchCurrentUser(storedToken);
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token expired or invalid
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [fetchCurrentUser]);

  // Login handler
  const login = async (
    credentials: LoginPayload
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          message: json.message || 'Login failed. Please check your credentials.',
        };
      }

      const authToken = json.data.token;
      const authenticatedUser = json.data.user;

      localStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);
      setUser(authenticatedUser);

      return {
        success: true,
        message: 'Login successful.',
        user: authenticatedUser,
      };
    } catch {
      return {
        success: false,
        message: 'Unable to connect to university server. Please ensure the backend is running.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler (public registration as student)
  const register = async (
    data: RegisterPayload
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          message: json.message || 'Registration failed. Please try again.',
        };
      }

      const authToken = json.data.token;
      const registeredUser = json.data.user;

      localStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);
      setUser(registeredUser);

      return {
        success: true,
        message: 'Student registration completed successfully.',
        user: registeredUser,
      };
    } catch {
      return {
        success: false,
        message: 'Unable to connect to university server. Please try again later.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);

    // Call server logout endpoint asynchronously
    if (token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {
        // Silently catch server logout error
      });
    }
  };

  // Refresh user profile
  const refreshUser = async () => {
    if (!token) return;
    const refreshed = await fetchCurrentUser(token);
    if (refreshed) {
      setUser(refreshed);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    role: user?.role ?? null,
    isActive: user?.isActive ?? false,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
