import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  avatarInitials: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [storedToken, setStoredToken] = useLocalStorage<string | null>('auth_token', null);
  const [storedUser, setStoredUser] = useLocalStorage<User | null>('auth_user', null);
  const { loading, error, execute } = useApi();

  useEffect(() => {
    if (storedToken && storedUser) {
      setAuthState({
        user: storedUser,
        token: storedToken,
        isAuthenticated: true,
      });
    }
  }, [storedToken, storedUser]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await execute(async () => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.message || 'Login failed',
            status: response.status,
            success: false,
          };
        }

        return {
          data: data,
          status: response.status,
          success: true,
        };
      });

      if (result.data) {
        const { user, token } = result.data;
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
        setStoredToken(token);
        setStoredUser(user);
      }

      return result;
    },
    [execute, setStoredToken, setStoredUser]
  );

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    setStoredToken(null);
    setStoredUser(null);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, [setStoredToken, setStoredUser]);

  const checkAuth = useCallback(async () => {
    if (!storedToken) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          token: storedToken,
          isAuthenticated: true,
        });
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  }, [storedToken, logout]);

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };
}
