import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiOrder } from "@/services/api";
import { OrderSource, PaymentMethod } from "@/types/order";

const ORDERS_KEY = ["orders"];

export function useOrders() {
  const qc = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ORDERS_KEY,
    queryFn: () => api.getOrders(),
    refetchInterval: 5000, // poll a cada 5s para sincronizar entre abas
    refetchOnWindowFocus: true,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ORDERS_KEY });

  // ---- Selectors (síncronos sobre cache) ----
  const getOpenOrders = () =>
    orders.filter((o) => o.status === "aberta" || o.status === "aguardando_pagamento");
  const getReadyForPayment = () => orders.filter((o) => o.status === "aguardando_pagamento");
  const getBySource = (source: OrderSource, sourceId: number): ApiOrder | undefined =>
    orders.find(
      (o) =>
        o.source === source &&
        o.sourceId === sourceId &&
        (o.status === "aberta" || o.status === "aguardando_pagamento")
    );
  const getClosedToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    return orders.filter(
      (o) => o.status === "paga" && o.closedAt && o.closedAt.slice(0, 10) === today
    );
  };

  // ---- Mutations ----
  const createMutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: invalidate,
  });
  const addItemMutation = useMutation({
    mutationFn: ({ orderId, item }: { orderId: string; item: Parameters<typeof api.addOrderItem>[1] }) =>
      api.addOrderItem(orderId, item),
    onSuccess: invalidate,
  });
  const updateQtyMutation = useMutation({
    mutationFn: ({ orderId, productId, delta }: { orderId: string; productId: number; delta: number }) =>
      api.updateOrderItemQty(orderId, productId, delta),
    onSuccess: invalidate,
  });
  const removeItemMutation = useMutation({
    mutationFn: ({ orderId, productId }: { orderId: string; productId: number }) =>
      api.removeOrderItem(orderId, productId),
    onSuccess: invalidate,
  });
  const sendToPaymentMutation = useMutation({
    mutationFn: (orderId: string) => api.sendToPayment(orderId),
    onSuccess: invalidate,
  });
  const finalizeMutation = useMutation({
    mutationFn: ({ orderId, paymentMethod }: { orderId: string; paymentMethod: PaymentMethod }) =>
      api.finalizeOrder(orderId, paymentMethod),
    onSuccess: invalidate,
  });
  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => api.cancelOrder(orderId),
    onSuccess: invalidate,
  });

  return {
    orders,
    isLoading,
    error,
    getOpenOrders,
    getReadyForPayment,
    getBySource,
    getClosedToday,
    create: (data: Parameters<typeof api.createOrder>[0]) => createMutation.mutateAsync(data),
    addItem: (orderId: string, item: Parameters<typeof api.addOrderItem>[1]) =>
      addItemMutation.mutateAsync({ orderId, item }),
    updateItemQty: (orderId: string, productId: number, delta: number) =>
      updateQtyMutation.mutateAsync({ orderId, productId, delta }),
    removeItem: (orderId: string, productId: number) =>
      removeItemMutation.mutateAsync({ orderId, productId }),
    sendToPayment: (orderId: string) => sendToPaymentMutation.mutateAsync(orderId),
    finalize: (orderId: string, paymentMethod: PaymentMethod) =>
      finalizeMutation.mutateAsync({ orderId, paymentMethod }),
    cancel: (orderId: string) => cancelMutation.mutateAsync(orderId),
    refresh: invalidate,
  };
}
