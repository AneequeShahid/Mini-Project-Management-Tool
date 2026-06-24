const API = (() => {
  const base = "/api";

  async function request(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(text || `Request failed: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    return response.json();
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
})();

export default API;
