import { useState, useCallback } from "react";
import { orderService } from "@/services/orderService";
import { Order, OrderSource, PaymentMethod } from "@/types/order";

export function useOrders() {
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((r) => r + 1), []);

  const getAll = useCallback(() => orderService.getAll(), [revision]);
  const getOpenOrders = useCallback(() => orderService.getOpenOrders(), [revision]);
  const getReadyForPayment = useCallback(() => orderService.getReadyForPayment(), [revision]);
  const getBySource = useCallback(
    (source: OrderSource, sourceId: number) => orderService.getBySource(source, sourceId),
    [revision]
  );
  const getClosedToday = useCallback(() => orderService.getClosedToday(), [revision]);

  const create = useCallback(
    (data: Parameters<typeof orderService.create>[0]) => {
      const order = orderService.create(data);
      refresh();
      return order;
    },
    [refresh]
  );

  const addItem = useCallback(
    (orderId: string, item: Parameters<typeof orderService.addItem>[1]) => {
      const order = orderService.addItem(orderId, item);
      refresh();
      return order;
    },
    [refresh]
  );

  const updateItemQty = useCallback(
    (orderId: string, productId: number, delta: number) => {
      const order = orderService.updateItemQty(orderId, productId, delta);
      refresh();
      return order;
    },
    [refresh]
  );

  const removeItem = useCallback(
    (orderId: string, productId: number) => {
      const order = orderService.removeItem(orderId, productId);
      refresh();
      return order;
    },
    [refresh]
  );

  const sendToPayment = useCallback(
    (orderId: string) => {
      const order = orderService.sendToPayment(orderId);
      refresh();
      return order;
    },
    [refresh]
  );

  const finalize = useCallback(
    (orderId: string, paymentMethod: PaymentMethod) => {
      const order = orderService.finalize(orderId, paymentMethod);
      refresh();
      return order;
    },
    [refresh]
  );

  const cancel = useCallback(
    (orderId: string) => {
      const order = orderService.cancel(orderId);
      refresh();
      return order;
    },
    [refresh]
  );

  return {
    getAll,
    getOpenOrders,
    getReadyForPayment,
    getBySource,
    getClosedToday,
    create,
    addItem,
    updateItemQty,
    removeItem,
    sendToPayment,
    finalize,
    cancel,
    refresh,
  };
}
