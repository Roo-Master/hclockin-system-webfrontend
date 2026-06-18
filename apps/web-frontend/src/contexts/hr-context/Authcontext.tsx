import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authService } from "../../app/api/hr-api/services";
import type { AuthUser, LoginPayload } from "../../types/hr-types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("hr_access_token");
    if (!token) { setLoading(false); return; }

    authService
      .me()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem("hr_access_token");
        localStorage.removeItem("hr_refresh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    const { user: authUser, tokens } = res.data.data;
    localStorage.setItem("hr_access_token",  tokens.access_token);
    localStorage.setItem("hr_refresh_token", tokens.refresh_token);
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem("hr_access_token");
    localStorage.removeItem("hr_refresh_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};