"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  workspace_id: string | null;
  is_active: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  workspace_name: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/api/v1/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post("/api/v1/auth/login", {
        email,
        password,
      });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      await fetchUser();
      router.push("/dashboard");
    },
    [fetchUser, router]
  );

  const register = useCallback(
    async (payload: RegisterData) => {
      const { data } = await api.post("/api/v1/auth/register", payload);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      await fetchUser();
      router.push("/dashboard");
    },
    [fetchUser, router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };
}
