import { createContext, useContext, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = window.localStorage.getItem("bsb-web-session");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async ({ identifier, password }) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password })
    });

    const nextSession = { token: data.token, user: data.user };
    setSession(nextSession);
    window.localStorage.setItem("bsb-web-session", JSON.stringify(nextSession));
    return nextSession;
  };

  const logout = () => {
    setSession(null);
    window.localStorage.removeItem("bsb-web-session");
  };

  const value = useMemo(
    () => ({
      session,
      login,
      logout
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
