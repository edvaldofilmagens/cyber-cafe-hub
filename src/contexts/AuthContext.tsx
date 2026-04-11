import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";

export type UserRole = "admin" | "funcionario";

interface User {
  id?: string;
  name: string;
  email?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrName: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Fallback mock users when no API is available
const MOCK_USERS = [
  { name: "Admin", email: "admin@conectaremigio.com", password: "admin123", role: "admin" as UserRole },
  { name: "Funcionário", email: "funcionario@conectaremigio.com", password: "func123", role: "funcionario" as UserRole },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("conecta_token");
    const savedUser = localStorage.getItem("conecta_user");

    if (token && api.isConnected()) {
      api.me()
        .then((u) => setUser({ id: u.id, name: u.name, email: u.email, role: u.role as UserRole }))
        .catch(() => { api.clearToken(); localStorage.removeItem("conecta_user"); })
        .finally(() => setLoading(false));
    } else if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrName: string, password: string): Promise<boolean> => {
    // Try API first
    if (api.isConnected()) {
      try {
        const result = await api.login(emailOrName, password);
        api.setToken(result.token);
        const u: User = { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role as UserRole };
        setUser(u);
        localStorage.setItem("conecta_user", JSON.stringify(u));
        return true;
      } catch {
        return false;
      }
    }

    // Fallback to mock
    const found = MOCK_USERS.find(
      (u) =>
        (u.name.toLowerCase() === emailOrName.toLowerCase() ||
          u.email.toLowerCase() === emailOrName.toLowerCase()) &&
        u.password === password
    );
    if (found) {
      const u: User = { name: found.name, email: found.email, role: found.role };
      setUser(u);
      localStorage.setItem("conecta_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    api.clearToken();
    localStorage.removeItem("conecta_user");
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
