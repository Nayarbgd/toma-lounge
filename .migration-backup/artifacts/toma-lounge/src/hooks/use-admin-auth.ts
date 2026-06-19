import { useState, useCallback } from "react";
import { useLocation } from "wouter";

const TOKEN_KEY = "toma_admin_token";

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const setToken = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
    setLocation("/admin/login");
  }, [setLocation]);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  const isAuthenticated = !!token;

  return { token, setToken, clearToken, getToken, isAuthenticated };
}
