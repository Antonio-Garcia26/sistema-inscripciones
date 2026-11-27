const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json")
    ? response.json()
    : response.text();
}