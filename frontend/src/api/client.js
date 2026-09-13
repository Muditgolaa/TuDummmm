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
  del: (path) => apiFetch(path, { method: "DELETE" }),
};