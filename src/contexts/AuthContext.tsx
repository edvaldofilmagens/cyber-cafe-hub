import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "funcionario";

interface User {
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users - in production this would hit your PHP API
const MOCK_USERS = [
  { name: "Admin", password: "admin123", role: "admin" as UserRole },
  { name: "Funcionário", password: "func123", role: "funcionario" as UserRole },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: string, password: string) => {
    const found = MOCK_USERS.find(
      (u) => u.name.toLowerCase() === name.toLowerCase() && u.password === password
    );
    if (found) {
      setUser({ name: found.name, role: found.role });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

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
