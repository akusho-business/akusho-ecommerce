"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  email: string;
  name: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem("akusho_admin");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.expiry > Date.now()) {
            setAdmin(parsed.user);
          } else {
            localStorage.removeItem("akusho_admin");
          }
        } catch {
          localStorage.removeItem("akusho_admin");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const adminData = {
          user: { email: data.email, name: data.name },
          expiry: Date.now() + 24 * 60 * 60 * 1000,
        };
        localStorage.setItem("akusho_admin", JSON.stringify(adminData));
        setAdmin(adminData.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("akusho_admin");
    setAdmin(null);
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}