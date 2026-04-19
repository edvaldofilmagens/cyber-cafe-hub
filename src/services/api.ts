const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("VITE_API_URL is not set. Backend requests will fail.");
}

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

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
  stock: number;
  minStock: number;
  costPrice: number;
  active: boolean;
}

export interface ApiOrderItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  qty: number;
  category: string;
}

export interface ApiOrder {
  id: string;
  source: "mesa" | "computador" | "balcao" | "mobile";
  sourceId: number;
  sourceLabel: string;
  status: "aberta" | "aguardando_pagamento" | "paga" | "cancelada";
  total: number;
  createdAt: string;
  closedAt: string | null;
  paymentMethod: "dinheiro" | "pix" | "cartao_credito" | "cartao_debito" | null;
  sessionMinutes: number | null;
  sessionStartedAt: string | null;
  sessionPricePerHour: number | null;
  items: ApiOrderItem[];
}

export interface ApiAccount {
  id: number;
  description: string;
  value: number;
  dueDate: string;
  status: "pendente" | "pago" | "vencido";
  type: "pagar" | "receber";
}

export interface ApiVoucher {
  id: number;
  code: string;
  hours: number;
  hoursUsed: number;
  price: number;
  status: "disponivel" | "ativo" | "esgotado" | "expirado";
  client: string | null;
  usedOn: string[];
  createdAt: string;
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
  getUsers: () => request<ApiUser[]>("/api/users"),
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    request<ApiUser>("/api/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: Record<string, unknown>) =>
    request<ApiUser>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/api/users/${id}`, { method: "DELETE" }),

  // Products
  getProducts: () => request<ApiProduct[]>("/api/products"),
  createProduct: (data: Partial<ApiProduct>) =>
    request<ApiProduct>("/api/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<ApiProduct>) =>
    request<ApiProduct>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request(`/api/products/${id}`, { method: "DELETE" }),

  // Orders
  getOrders: (params?: { status?: string; source?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<ApiOrder[]>(`/api/orders${qs ? `?${qs}` : ""}`);
  },
  getOrderBySource: (source: string, sourceId: number) =>
    request<ApiOrder | null>(`/api/orders/source/${source}/${sourceId}`).catch(() => null),
  createOrder: (data: {
    source: string;
    sourceId: number;
    sourceLabel: string;
    sessionMinutes?: number | null;
    sessionPricePerHour?: number | null;
  }) => request<ApiOrder>("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  addOrderItem: (orderId: string, item: { productId: number; name: string; price: number; qty: number; category: string }) =>
    request<ApiOrder>(`/api/orders/${orderId}/items`, { method: "POST", body: JSON.stringify(item) }),
  updateOrderItemQty: (orderId: string, productId: number, delta: number) =>
    request<ApiOrder>(`/api/orders/${orderId}/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ delta }),
    }),
  removeOrderItem: (orderId: string, productId: number) =>
    request<ApiOrder>(`/api/orders/${orderId}/items/${productId}`, { method: "DELETE" }),
  sendToPayment: (orderId: string) =>
    request<ApiOrder>(`/api/orders/${orderId}/send-to-payment`, { method: "PUT" }),
  finalizeOrder: (orderId: string, paymentMethod: string) =>
    request<ApiOrder>(`/api/orders/${orderId}/finalize`, {
      method: "PUT",
      body: JSON.stringify({ paymentMethod }),
    }),
  cancelOrder: (orderId: string) =>
    request<ApiOrder>(`/api/orders/${orderId}/cancel`, { method: "PUT" }),

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
      orders: ApiOrder[];
    }>(`/api/reports/daily${qs}`);
  },

  // Accounts (Financeiro)
  getAccounts: () => request<ApiAccount[]>("/api/accounts"),
  createAccount: (data: { description: string; value: number; dueDate: string; type: "pagar" | "receber" }) =>
    request<ApiAccount>("/api/accounts", { method: "POST", body: JSON.stringify(data) }),
  updateAccount: (id: number, data: Partial<ApiAccount>) =>
    request<ApiAccount>(`/api/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAccount: (id: number) =>
    request(`/api/accounts/${id}`, { method: "DELETE" }),

  // Vouchers
  getVouchers: () => request<ApiVoucher[]>("/api/vouchers"),
  createVouchers: (data: { hours: number; price: number; qty: number }) =>
    request<ApiVoucher[]>("/api/vouchers", { method: "POST", body: JSON.stringify(data) }),
  updateVoucher: (id: number, data: Partial<ApiVoucher>) =>
    request<ApiVoucher>(`/api/vouchers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteVoucher: (id: number) =>
    request(`/api/vouchers/${id}`, { method: "DELETE" }),

  setToken: (token: string) => localStorage.setItem("conecta_token", token),
  clearToken: () => localStorage.removeItem("conecta_token"),
};
