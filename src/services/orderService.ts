import { Order, OrderItem, OrderSource, OrderStatus, PaymentMethod } from "@/types/order";

const STORAGE_KEY = "conecta_orders";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ---- Public API (structured for easy swap to HTTP calls) ----

export const orderService = {
  getAll(): Order[] {
    return loadOrders();
  },

  getByStatus(...statuses: OrderStatus[]): Order[] {
    return loadOrders().filter((o) => statuses.includes(o.status));
  },

  getBySource(source: OrderSource, sourceId: number): Order | undefined {
    return loadOrders().find(
      (o) => o.source === source && o.sourceId === sourceId && (o.status === "aberta" || o.status === "aguardando_pagamento")
    );
  },

  getOpenOrders(): Order[] {
    return loadOrders().filter((o) => o.status === "aberta" || o.status === "aguardando_pagamento");
  },

  getReadyForPayment(): Order[] {
    return loadOrders().filter((o) => o.status === "aguardando_pagamento");
  },

  create(data: {
    source: OrderSource;
    sourceId: number;
    sourceLabel: string;
    sessionMinutes?: number | null;
    sessionPricePerHour?: number | null;
  }): Order {
    const orders = loadOrders();
    const order: Order = {
      id: generateId(),
      source: data.source,
      sourceId: data.sourceId,
      sourceLabel: data.sourceLabel,
      status: "aberta",
      items: [],
      total: 0,
      createdAt: new Date().toISOString(),
      closedAt: null,
      paymentMethod: null,
      sessionMinutes: data.sessionMinutes ?? null,
      sessionStartedAt: data.sessionMinutes ? new Date().toISOString() : null,
      sessionPricePerHour: data.sessionPricePerHour ?? null,
    };
    orders.push(order);
    saveOrders(orders);
    return order;
  },

  addItem(orderId: string, item: Omit<OrderItem, "id">): Order {
    const orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const existing = order.items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.qty += item.qty;
    } else {
      order.items.push({ ...item, id: generateId() });
    }
    order.total = calcTotal(order);
    saveOrders(orders);
    return order;
  },

  updateItemQty(orderId: string, productId: number, delta: number): Order {
    const orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    order.items = order.items
      .map((i) => (i.productId === productId ? { ...i, qty: i.qty + delta } : i))
      .filter((i) => i.qty > 0);
    order.total = calcTotal(order);
    saveOrders(orders);
    return order;
  },

  removeItem(orderId: string, productId: number): Order {
    const orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    order.items = order.items.filter((i) => i.productId !== productId);
    order.total = calcTotal(order);
    saveOrders(orders);
    return order;
  },

  sendToPayment(orderId: string): Order {
    const orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    order.status = "aguardando_pagamento";
    order.total = calcTotal(order);
    saveOrders(orders);
    return order;
  },

  finalize(orderId: string, paymentMethod: PaymentMethod): Order {
    const orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    order.status = "paga";
    order.paymentMethod = paymentMethod;
    order.closedAt = new Date().toISOString();
    order.total = calcTotal(order);
    saveOrders(orders);
    return order;
  },

  cancel(orderId: string): Order {
    const orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    order.status = "cancelada";
    order.closedAt = new Date().toISOString();
    saveOrders(orders);
    return order;
  },

  getClosedToday(): Order[] {
    const today = new Date().toISOString().slice(0, 10);
    return loadOrders().filter(
      (o) => o.status === "paga" && o.closedAt && o.closedAt.slice(0, 10) === today
    );
  },
};

function calcTotal(order: Order): number {
  let itemsTotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  // Add session cost for computers
  if (order.source === "computador" && order.sessionMinutes && order.sessionPricePerHour) {
    itemsTotal += (order.sessionMinutes / 60) * order.sessionPricePerHour;
  }
  return itemsTotal;
}
