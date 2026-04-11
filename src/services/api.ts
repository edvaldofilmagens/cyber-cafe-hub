// API client for Conecta Remígio backend
// When running with backend: set VITE_API_URL in .env
// Without backend: falls back to localStorage via orderService

const API_URL = import.meta.env.VITE_API_URL || "";

function getToken(): string | null {
  return localStorage.getItem("conecta_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  me: () =>
    request<{ id: string; name: string; email: string; role: string }>("/api/auth/me"),

  // Users
  getUsers: () =>
    request<Array<{ id: string; name: string; email: string; role: string; active: boolean; createdAt: string }>>(
      "/api/users"
    ),

  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    request("/api/users", { method: "POST", body: JSON.stringify(data) }),

  updateUser: (id: string, data: Record<string, unknown>) =>
    request(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteUser: (id: string) =>
    request(`/api/users/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: (params?: { status?: string; source?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/api/orders${qs ? `?${qs}` : ""}`);
  },

  getOrderBySource: (source: string, sourceId: number) =>
    request<any>(`/api/orders/source/${source}/${sourceId}`),

  createOrder: (data: Record<string, unknown>) =>
    request<any>("/api/orders", { method: "POST", body: JSON.stringify(data) }),

  addOrderItem: (orderId: string, item: Record<string, unknown>) =>
    request<any>(`/api/orders/${orderId}/items`, { method: "POST", body: JSON.stringify(item) }),

  updateOrderItemQty: (orderId: string, productId: number, delta: number) =>
    request<any>(`/api/orders/${orderId}/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ delta }),
    }),

  removeOrderItem: (orderId: string, productId: number) =>
    request<any>(`/api/orders/${orderId}/items/${productId}`, { method: "DELETE" }),

  sendToPayment: (orderId: string) =>
    request<any>(`/api/orders/${orderId}/send-to-payment`, { method: "PUT" }),

  finalizeOrder: (orderId: string, paymentMethod: string) =>
    request<any>(`/api/orders/${orderId}/finalize`, {
      method: "PUT",
      body: JSON.stringify({ paymentMethod }),
    }),

  cancelOrder: (orderId: string) =>
    request<any>(`/api/orders/${orderId}/cancel`, { method: "PUT" }),

  // Products
  getProducts: () => request<any[]>("/api/products"),

  // Reports
  getDailyReport: (date?: string) => {
    const qs = date ? `?date=${date}` : "";
    return request<{
      date: string;
      totalVendas: number;
      totalOrders: number;
      totalCancelled: number;
      byPaymentMethod: Record<string, number>;
      bySource: Record<string, number>;
      topProducts: Array<{ name: string; qty: number; total: number }>;
      orders: any[];
    }>(`/api/reports/daily${qs}`);
  },

  // Helpers
  isConnected: () => !!API_URL,
  setToken: (token: string) => localStorage.setItem("conecta_token", token),
  clearToken: () => localStorage.removeItem("conecta_token"),
};
