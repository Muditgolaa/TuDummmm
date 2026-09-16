const BASE_URL = import.meta.env.VITE_API_URL;

// Central fetch wrapper: adds base URL, JSON headers, and the JWT if present.
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Parse JSON if there's a body (some responses are empty).
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  // A 401 on an *authenticated* request means our stored session is dead (expired or invalid token). Clear it and send the user back to login.
  // Note: login/register send no token, so their 401 (bad credentials) is untouched.
  if (res.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (!window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
    throw new Error("Session expired — please log in again");
  }

  // Turn HTTP errors into thrown Errors so callers can try/catch.
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }

  return data;
}

// Convenience helpers so pages write api.get("/...") / api.post("/...", body).
export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: (path) => apiFetch(path, { method: "DELETE" }),
};