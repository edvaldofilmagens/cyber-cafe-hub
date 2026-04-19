import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Printer, X, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { ProductGrid } from "@/components/ProductGrid";
import { OrderItemsList } from "@/components/OrderItemsList";
import { Product } from "@/types/order";
import { ApiOrder } from "@/services/api";
import { printReceipt } from "@/utils/printReceipt";

const NUM_MESAS = 4;

const Mesas = () => {
  const [selectedMesa, setSelectedMesa] = useState<number | null>(null);
  const { toast } = useToast();
  const orders = useOrders();

  const getMesaOrder = (mesaId: number): ApiOrder | undefined =>
    orders.getBySource("mesa", mesaId);

  const getMesaStatus = (mesaId: number): "livre" | "ocupada" | "aguardando_pagamento" => {
    const order = getMesaOrder(mesaId);
    if (!order) return "livre";
    if (order.status === "aguardando_pagamento") return "aguardando_pagamento";
    return "ocupada";
  };

  const handleSelectMesa = async (mesaId: number) => {
    const status = getMesaStatus(mesaId);
    if (status === "livre") {
      try {
        await orders.create({
          source: "mesa",
          sourceId: mesaId,
          sourceLabel: `Mesa ${mesaId}`,
        });
        toast({ title: `Mesa ${mesaId} aberta`, description: "Comanda criada. Adicione produtos." });
      } catch (e) {
        toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
        return;
      }
    }
    setSelectedMesa(mesaId);
  };

  const handleAddProduct = async (product: Product) => {
    if (selectedMesa === null) return;
    const order = getMesaOrder(selectedMesa);
    if (!order) return;
    try {
      await orders.addItem(order.id, {
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        category: product.category,
      });
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleUpdateQty = async (productId: number, delta: number) => {
    if (selectedMesa === null) return;
    const order = getMesaOrder(selectedMesa);
    if (!order) return;
    await orders.updateItemQty(order.id, productId, delta);
  };

  const handleRemoveItem = async (productId: number) => {
    if (selectedMesa === null) return;
    const order = getMesaOrder(selectedMesa);
    if (!order) return;
    await orders.removeItem(order.id, productId);
  };

  const handleSendToPayment = async (mesaId: number) => {
    const order = getMesaOrder(mesaId);
    if (!order || order.items.length === 0) return;
    try {
      await orders.sendToPayment(order.id);
      toast({
        title: `Mesa ${mesaId} enviada para pagamento`,
        description: `Total: R$ ${order.total.toFixed(2)} — Aguardando no PDV`,
      });
      setSelectedMesa(null);
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handlePrint = (mesaId: number) => {
    const order = getMesaOrder(mesaId);
    if (!order || order.items.length === 0) return;
    printReceipt({ items: order.items, total: order.total, mesa: mesaId });
  };

  const selectedOrder = selectedMesa !== null ? getMesaOrder(selectedMesa) : null;
  const selectedStatus = selectedMesa !== null ? getMesaStatus(selectedMesa) : "livre";

  const statusColor = (status: string) => {
    switch (status) {
      case "ocupada": return "border-orange-400 bg-orange-50 dark:bg-orange-950/20";
      case "aguardando_pagamento": return "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20";
      default: return "";
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ocupada": return <Badge>Ocupada</Badge>;
      case "aguardando_pagamento": return <Badge className="bg-warning text-warning-foreground">Aguardando</Badge>;
      default: return <Badge variant="secondary">Livre</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mesas</h1>
          <p className="text-sm text-muted-foreground">Gerencie comandas por mesa — Centro de consumo principal</p>
        </div>
        {orders.isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: NUM_MESAS }, (_, i) => i + 1).map((mesaId) => {
          const status = getMesaStatus(mesaId);
          const order = getMesaOrder(mesaId);
          return (
            <Card
              key={mesaId}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedMesa === mesaId ? "ring-2 ring-primary" : ""
              } ${statusColor(status)}`}
              onClick={() => handleSelectMesa(mesaId)}
            >
              <CardContent className="flex flex-col items-center gap-2 p-6">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    status === "ocupada"
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : status === "aguardando_pagamento"
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-primary/10"
                  }`}
                >
                  <UtensilsCrossed
                    className={`h-7 w-7 ${
                      status === "ocupada"
                        ? "text-orange-600"
                        : status === "aguardando_pagamento"
                        ? "text-yellow-600"
                        : "text-primary"
                    }`}
                  />
                </div>
                <span className="font-heading font-bold text-lg">Mesa {mesaId}</span>
                {statusBadge(status)}
                {order && order.items.length > 0 && (
                  <span className="text-sm font-medium text-primary">
                    R$ {order.total.toFixed(2)}
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedOrder && selectedStatus !== "livre" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {selectedStatus === "ocupada" && (
            <div className="lg:col-span-2">
              <ProductGrid onAddProduct={handleAddProduct} />
            </div>
          )}

          <Card className={`h-fit sticky top-6 ${selectedStatus !== "ocupada" ? "lg:col-span-3 max-w-md" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Mesa {selectedMesa}
                </span>
                <Badge>{selectedOrder.items.reduce((s, i) => s + i.qty, 0)} itens</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <OrderItemsList
                items={selectedOrder.items}
                total={selectedOrder.total}
                onUpdateQty={selectedStatus === "ocupada" ? handleUpdateQty : undefined}
                onRemoveItem={selectedStatus === "ocupada" ? handleRemoveItem : undefined}
                readOnly={selectedStatus !== "ocupada"}
              />
              {selectedOrder.items.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => handlePrint(selectedMesa!)} className="gap-1">
                    <Printer className="h-4 w-4" />
                    Cupom
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedMesa(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleSendToPayment(selectedMesa!)} className="gap-1">
                    <CreditCard className="h-4 w-4" />
                    Pagar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Mesas;
