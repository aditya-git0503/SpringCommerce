/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import { clearGuestCart } from "../utils/guestCart.js";

const AuthContext = createContext(null);

function getStoredUser() {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }
  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => getStoredUser());

  function login(payload) {
    const nextToken = payload.token;
    const nextUser = {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
    };
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearGuestCart();
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
