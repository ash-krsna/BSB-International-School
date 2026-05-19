const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:4000/api";
const TOKEN_KEY = "bsb-desktop-token";
const SESSION_KEY = "bsb-desktop-session";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredSession() {
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function storeSession(session) {
  if (!session) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function apiRequest(path, options = {}) {
  const token = options.token || getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "API request failed.");
  }

  return data;
}

export { API_BASE_URL };
