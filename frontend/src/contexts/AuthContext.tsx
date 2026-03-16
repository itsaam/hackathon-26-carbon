import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch, setAuthToken } from "@/lib/api";

interface User {
  id: number;
  fullName: string;
  email: string;
  role?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("auth_user");
    const rawToken = localStorage.getItem("auth_token");
    if (!rawUser || !rawToken) return;
    try {
      setUser(JSON.parse(rawUser));
    } catch {
      // ignore
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ fullName: name, email, password }),
    });
    setAuthToken(res.token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
