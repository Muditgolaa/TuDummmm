// One fetch wrapper (base URL + JWT + JSON + 401 handling), used to build two clients: `api` for the Node core (auth + tracker) and `interviewApi` for the Java interview service. Both send the same token from localStorage.
function createClient(baseURL) {
  async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${baseURL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    // A 401 on an authenticated request means our stored session is dead.
    if (res.status === 401 && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
      throw new Error("Session expired — please log in again");
    }

    if (!res.ok) {
      throw new Error((data && data.error) || `Request failed (${res.status})`);
    }
    return data;
  }

  return {
    get: (path) => apiFetch(path),
    post: (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: (path, body) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: (path) => apiFetch(path, { method: "DELETE" }),
  };
}

// Node core service (auth + tracker).
export const api = createClient(import.meta.env.VITE_API_URL);

// Java interview service (falls back to the core URL if not configured).
export const interviewApi = createClient(
  import.meta.env.VITE_INTERVIEW_API_URL || import.meta.env.VITE_API_URL
);