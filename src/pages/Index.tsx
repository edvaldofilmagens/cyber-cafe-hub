import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, ShoppingCart, UtensilsCrossed, Wifi, TrendingUp, Clock, CreditCard } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";

const Index = () => {
  const orders = useOrders();

  const openOrders = orders.getOpenOrders();
  const closedToday = orders.getClosedToday();
  const totalToday = closedToday.reduce((s, o) => s + o.total, 0);

  const mesasOcupadas = openOrders.filter((o) => o.source === "mesa").length;
  const pcsEmUso = openOrders.filter((o) => o.source === "computador").length;
  const aguardandoPagamento = openOrders.filter((o) => o.status === "aguardando_pagamento").length;

  const stats = [
    { label: "Vendas Hoje", value: `R$ ${totalToday.toFixed(2)}`, icon: TrendingUp, change: `${closedToday.length} vendas` },
    { label: "Mesas Ocupadas", value: String(mesasOcupadas), icon: UtensilsCrossed, change: "de 4" },
    { label: "PCs em Uso", value: String(pcsEmUso), icon: Monitor, change: "de 2" },
    { label: "Aguardando Pagamento", value: String(aguardandoPagamento), icon: CreditCard, change: "comandas" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do Conecta Remígio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="font-heading text-xl font-bold">{s.value}</p>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs">
                {s.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Open orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Comandas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma comanda aberta</p>
            ) : (
              openOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{order.sourceLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} itens • {order.status === "aguardando_pagamento" ? "Aguardando pgto" : "Aberta"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-heading font-semibold text-sm">R$ {order.total.toFixed(2)}</span>
                    <Badge
                      variant="secondary"
                      className={`ml-2 text-xs ${order.status === "aguardando_pagamento" ? "bg-warning/20 text-warning" : ""}`}
                    >
                      {order.source}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent closed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Vendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {closedToday.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda registrada hoje</p>
            ) : (
              closedToday.slice(-5).reverse().map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{order.sourceLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.paymentMethod} • {order.closedAt ? new Date(order.closedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <span className="font-heading font-semibold text-sm text-accent">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
