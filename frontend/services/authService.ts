const API_URL = ((import.meta as any)?.env?.VITE_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
console.log("API_URL being used:", API_URL); // Add this log to debug

export const register = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("userName", data.name);
  return data;
};

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("userName", data.name);
  return data;
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: { 
      "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
  return data;
};
