'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useApi } from '@/hooks/(super-admin)/useApi';
import { useLocalStorage } from '@/hooks/(super-admin)/useLocalStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  avatarInitials: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  tenantId?: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useLocalStorage<string | null>('auth_token', null);
  const [storedRefreshToken, setStoredRefreshToken] = useLocalStorage<string | null>('auth_refresh_token', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { execute } = useApi();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
            setError(null);
          } else {
            // Token invalid - clear stored data
            setToken(null);
            setStoredRefreshToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Auth verification error:', err);
          setToken(null);
          setStoredRefreshToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, [token, setToken, setStoredRefreshToken]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.message || data.error || 'Login failed';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        const { user: userData, token: authToken, refreshToken: refToken } = data as LoginResponse;
        
        setUser(userData);
        setToken(authToken);
        if (refToken) setStoredRefreshToken(refToken);
        setIsAuthenticated(true);
        setError(null);
        
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setToken, setStoredRefreshToken]
  );

  const logout = useCallback(() => {
    // Call logout API
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }

    setUser(null);
    setToken(null);
    setStoredRefreshToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, [token, setToken, setStoredRefreshToken]);

  const register = useCallback(
    async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.message || data.error || 'Registration failed';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        // Auto-login after registration if token is returned
        if (data.token) {
          const { user: newUser, token: authToken, refreshToken: refToken } = data;
          setUser(newUser);
          setToken(authToken);
          if (refToken) setStoredRefreshToken(refToken);
          setIsAuthenticated(true);
        }

        setError(null);
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setToken, setStoredRefreshToken]
  );

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    // Optionally update stored user
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      } catch {
        // Silently fail
      }
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
        setStoredRefreshToken(null);
        return false;
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      setStoredRefreshToken(null);
      return false;
    }
  }, [token, setToken, setStoredRefreshToken]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!storedRefreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        if (data.refreshToken) setStoredRefreshToken(data.refreshToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  }, [storedRefreshToken, setToken, setStoredRefreshToken, logout]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser,
    checkAuth,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ─── Auth Guard Component ───────────────────────────────────────────────────

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
}

export function AuthGuard({ 
  children, 
  fallback, 
  requireAuth = true,
  requiredRoles = [] 
}: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRole = requiredRoles.some(role => user.role === role);
    if (!hasRole) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Access Denied</h1>
            <p className="text-text-secondary mt-2">You don't have permission to view this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
