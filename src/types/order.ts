// Tipos de domínio compartilhados (espelham o backend Prisma)

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
  sourceId: number;
  sourceLabel: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  closedAt: string | null;
  paymentMethod: PaymentMethod | null;
  sessionMinutes: number | null;
  sessionStartedAt: string | null;
  sessionPricePerHour: number | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
}

export const PRODUCT_CATEGORIES = ["Todos", "Bebidas", "Lanches", "Internet"];

export const COMPUTER_PRICE_PER_HOUR = 6.0;

export const TIME_OPTIONS = [
  { label: "1 hora", value: 60, price: 6.0 },
  { label: "2 horas", value: 120, price: 12.0 },
  { label: "3 horas", value: 180, price: 15.0 },
  { label: "Livre", value: 0, price: 0 },
];
