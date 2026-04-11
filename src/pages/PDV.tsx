import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShoppingCart,
  UtensilsCrossed,
  Monitor,
  Smartphone,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Check,
  X,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { OrderItemsList } from "@/components/OrderItemsList";
import { Order, PaymentMethod } from "@/types/order";
import { printReceipt } from "@/utils/printReceipt";

const sourceIcons: Record<string, React.ElementType> = {
  mesa: UtensilsCrossed,
  computador: Monitor,
  balcao: ShoppingCart,
  mobile: Smartphone,
};

const sourceLabels: Record<string, string> = {
  mesa: "Mesa",
  computador: "Computador",
  balcao: "Balcão",
  mobile: "Pedido Móvel",
};

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "cartao_credito", label: "Crédito", icon: CreditCard },
  { value: "cartao_debito", label: "Débito", icon: CreditCard },
];

const paymentLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Crédito",
  cartao_debito: "Débito",
};

const PDV = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [showReport, setShowReport] = useState(false);
  const { toast } = useToast();
  const orderHook = useOrders();

  const readyOrders = orderHook.getReadyForPayment();
  const openOrders = orderHook.getOpenOrders().filter((o) => o.status === "aberta");
  const closedToday = orderHook.getClosedToday();
  const totalToday = closedToday.reduce((s, o) => s + o.total, 0);

  // Daily report data
  const byPaymentMethod: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const productMap: Record<string, { name: string; qty: number; total: number }> = {};

  closedToday.forEach((o) => {
    const pm = o.paymentMethod || "outros";
    byPaymentMethod[pm] = (byPaymentMethod[pm] || 0) + o.total;
    bySource[o.source] = (bySource[o.source] || 0) + o.total;
    o.items.forEach((i) => {
      const key = String(i.productId);
      if (!productMap[key]) productMap[key] = { name: i.name, qty: 0, total: 0 };
      productMap[key].qty += i.qty;
      productMap[key].total += i.price * i.qty;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const selectedOrder = selectedOrderId
    ? [...readyOrders, ...openOrders].find((o) => o.id === selectedOrderId) ?? null
    : null;

  const handleFinalize = () => {
    if (!selectedOrder || !paymentMethod) return;
    const pm = paymentMethod as PaymentMethod;
    orderHook.finalize(selectedOrder.id, pm);
    printReceipt({
      items: selectedOrder.items,
      total: selectedOrder.total,
      mesa: selectedOrder.source === "mesa" ? selectedOrder.sourceId : undefined,
    });
    toast({
      title: "Venda finalizada!",
      description: `${selectedOrder.sourceLabel} — R$ ${selectedOrder.total.toFixed(2)} (${paymentLabels[pm]})`,
    });
    setSelectedOrderId(null);
    setPaymentMethod("");
  };

  const handleCancel = () => {
    if (!selectedOrder) return;
    orderHook.cancel(selectedOrder.id);
    toast({ title: "Comanda cancelada", description: selectedOrder.sourceLabel });
    setSelectedOrderId(null);
  };

  const handlePrint = () => {
    if (!selectedOrder) return;
    printReceipt({
      items: selectedOrder.items,
      total: selectedOrder.total,
      mesa: selectedOrder.source === "mesa" ? selectedOrder.sourceId : undefined,
    });
  };

  const SourceIcon = selectedOrder ? sourceIcons[selectedOrder.source] || ShoppingCart : ShoppingCart;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Ponto de Venda</h1>
          <p className="text-sm text-muted-foreground">Fechamento de comandas e pagamentos</p>
        </div>
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatório do Dia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Relatório de Vendas — {new Date().toLocaleDateString("pt-BR")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Total Vendas</p>
                    <p className="font-heading text-xl font-bold text-primary">R$ {totalToday.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Nº de Vendas</p>
                    <p className="font-heading text-xl font-bold">{closedToday.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                    <p className="font-heading text-xl font-bold">
                      R$ {closedToday.length > 0 ? (totalToday / closedToday.length).toFixed(2) : "0.00"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* By payment method */}
              <div>
                <h3 className="font-heading font-semibold mb-3">Por Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(byPaymentMethod).map(([method, total]) => (
                    <div key={method} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">{paymentLabels[method] || method}</span>
                      <span className="font-heading font-semibold">R$ {total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By source */}
              <div>
                <h3 className="font-heading font-semibold mb-3">Por Origem</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(bySource).map(([source, total]) => (
                    <div key={source} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">{sourceLabels[source] || source}</span>
                      <span className="font-heading font-semibold">R$ {total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top products */}
              {topProducts.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold mb-3">Produtos Mais Vendidos</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-center">{p.qty}</TableCell>
                          <TableCell className="text-right">R$ {p.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Detailed orders */}
              {closedToday.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold mb-3">Vendas Detalhadas</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Origem</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Pgto</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closedToday.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.sourceLabel}</TableCell>
                          <TableCell>
                            {order.closedAt
                              ? new Date(order.closedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {paymentLabels[order.paymentMethod || ""] || order.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.items.length}</TableCell>
                          <TableCell className="text-right font-semibold">R$ {order.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <ShoppingCart className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Pagamento</p>
              <p className="font-heading text-2xl font-bold">{readyOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comandas Abertas</p>
              <p className="font-heading text-2xl font-bold">{openOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Check className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendas Hoje</p>
              <p className="font-heading text-2xl font-bold">R$ {totalToday.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Orders list */}
        <div className="lg:col-span-2 space-y-4">
          {readyOrders.length > 0 && (
            <>
              <h2 className="font-heading text-lg font-semibold">Aguardando Pagamento</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {readyOrders.map((order) => {
                  const Icon = sourceIcons[order.source] || ShoppingCart;
                  return (
                    <Card
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrderId === order.id ? "ring-2 ring-primary" : ""
                      } border-yellow-400`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                          <Icon className="h-6 w-6 text-warning" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{order.sourceLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {sourceLabels[order.source]} — {order.items.length} itens
                          </p>
                        </div>
                        <span className="font-heading font-bold text-primary">
                          R$ {order.total.toFixed(2)}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {openOrders.length > 0 && (
            <>
              <h2 className="font-heading text-lg font-semibold mt-6">Comandas Abertas</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {openOrders.map((order) => {
                  const Icon = sourceIcons[order.source] || ShoppingCart;
                  return (
                    <Card
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrderId === order.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{order.sourceLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {sourceLabels[order.source]} — {order.items.length} itens
                          </p>
                        </div>
                        <span className="font-heading font-bold text-muted-foreground">
                          R$ {order.total.toFixed(2)}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {readyOrders.length === 0 && openOrders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="font-heading text-lg font-semibold text-muted-foreground">Nenhuma comanda pendente</p>
                <p className="text-sm text-muted-foreground">Comandas abertas nas Mesas e Computadores aparecerão aqui.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment panel */}
        <Card className="h-fit sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedOrder ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Selecione uma comanda para pagamento
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <SourceIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{selectedOrder.sourceLabel}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {sourceLabels[selectedOrder.source]}
                  </Badge>
                </div>

                <OrderItemsList
                  items={selectedOrder.items}
                  total={selectedOrder.total}
                  readOnly
                />

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Forma de Pagamento</p>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((pm) => (
                      <Button
                        key={pm.value}
                        variant={paymentMethod === pm.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPaymentMethod(pm.value)}
                        className="gap-1"
                      >
                        <pm.icon className="h-4 w-4" />
                        {pm.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel} className="text-destructive gap-1">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
                    <Printer className="h-4 w-4" />
                    Cupom
                  </Button>
                  <Button
                    size="sm"
                    disabled={!paymentMethod}
                    onClick={handleFinalize}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Pagar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDV;
