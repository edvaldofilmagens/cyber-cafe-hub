import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";

export type UserRole = "admin" | "funcionario";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("conecta_token");
    if (token) {
      api.me()
        .then((u) => setUser({ id: u.id, name: u.name, email: u.email, role: u.role as UserRole }))
        .catch(() => api.clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login(email, password);
      api.setToken(result.token);
      setUser({ id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role as UserRole });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    api.clearToken();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
