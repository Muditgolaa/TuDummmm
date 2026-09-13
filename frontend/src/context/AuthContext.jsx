import { createContext, useContext, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialise from localStorage so login survives a page refresh.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })

  // Save auth data to both state and localStorage.
  function saveAuth(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await api.post("/api/auth/login", { email, password });
    saveAuth(data);
  }

  async function register(name, email, password) {
    const data = await api.post("/api/auth/register", { name, email, password });
    saveAuth(data);
  }

  async function loginWithGoogle(credential) {
    const data = await api.post("/api/auth/google", { credential });
    saveAuth(data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const value = { token, user, isAuthenticated: !!token, login, register, loginWithGoogle, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Pages call useAuth() instead of useContext(AuthContext) directly.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}