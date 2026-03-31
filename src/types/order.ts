export type OrderSource = "mesa" | "computador" | "balcao" | "mobile";
export type OrderStatus = "aberta" | "aguardando_pagamento" | "paga" | "cancelada";
export type PaymentMethod = "dinheiro" | "pix" | "cartao_credito" | "cartao_debito";

export interface OrderItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  qty: number;
  category: string;
}

export interface Order {
  id: string;
  source: OrderSource;
  sourceId: number; // mesa id, computador id, etc.
  sourceLabel: string; // "Mesa 1", "PC-01", etc.
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  closedAt: string | null;
  paymentMethod: PaymentMethod | null;
  // Computer session fields
  sessionMinutes: number | null; // total session time
  sessionStartedAt: string | null;
  sessionPricePerHour: number | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string; // icon name from lucide
}

export const PRODUCTS: Product[] = [
  { id: 1, name: "Café Expresso", price: 7.0, category: "Bebidas", icon: "Coffee" },
  { id: 2, name: "Café com Leite", price: 8.5, category: "Bebidas", icon: "Coffee" },
  { id: 3, name: "Cappuccino", price: 10.0, category: "Bebidas", icon: "Coffee" },
  { id: 4, name: "Suco Natural", price: 9.0, category: "Bebidas", icon: "Coffee" },
  { id: 5, name: "Água Mineral", price: 4.0, category: "Bebidas", icon: "Coffee" },
  { id: 6, name: "Pão de Queijo", price: 4.5, category: "Lanches", icon: "Sandwich" },
  { id: 7, name: "Coxinha", price: 6.0, category: "Lanches", icon: "Sandwich" },
  { id: 8, name: "Misto Quente", price: 8.0, category: "Lanches", icon: "Sandwich" },
  { id: 9, name: "Bolo Fatia", price: 7.5, category: "Lanches", icon: "Sandwich" },
  { id: 10, name: "Voucher 1h Wi-Fi", price: 5.0, category: "Internet", icon: "Wifi" },
  { id: 11, name: "Voucher 2h Wi-Fi", price: 10.0, category: "Internet", icon: "Wifi" },
  { id: 12, name: "Voucher 5h Wi-Fi", price: 20.0, category: "Internet", icon: "Wifi" },
];

export const PRODUCT_CATEGORIES = ["Todos", "Bebidas", "Lanches", "Internet"];

export const COMPUTER_PRICE_PER_HOUR = 6.0;

export const TIME_OPTIONS = [
  { label: "1 hora", value: 60, price: 6.0 },
  { label: "2 horas", value: 120, price: 12.0 },
  { label: "3 horas", value: 180, price: 15.0 },
  { label: "Livre", value: 0, price: 0 },
];
