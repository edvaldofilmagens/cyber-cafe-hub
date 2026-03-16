import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, ShoppingCart, Users, Wifi, TrendingUp, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Vendas Hoje", value: "R$ 347,50", icon: TrendingUp, change: "+12%" },
  { label: "Clientes Ativos", value: "8", icon: Users, change: "+3" },
  { label: "Vouchers Vendidos", value: "23", icon: Wifi, change: "hoje" },
  { label: "Pedidos PDV", value: "15", icon: ShoppingCart, change: "hoje" },
];

const computers = [
  { id: 1, name: "PC-01", status: "em_uso", user: "João Silva", timeUsed: 45, timeTotal: 120 },
  { id: 2, name: "PC-02", status: "livre", user: null, timeUsed: 0, timeTotal: 0 },
];

const recentSales = [
  { id: 1, item: "Café Expresso", qty: 2, total: "R$ 14,00", time: "14:32" },
  { id: 2, item: "Voucher 2h Wi-Fi", qty: 1, total: "R$ 10,00", time: "14:15" },
  { id: 3, item: "Pão de Queijo", qty: 3, total: "R$ 13,50", time: "13:48" },
  { id: 4, item: "Voucher 5h Wi-Fi", qty: 1, total: "R$ 20,00", time: "13:20" },
];

const Index = () => {
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
        {/* Computers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5 text-primary" />
              Computadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {computers.map((pc) => (
              <div
                key={pc.id}
                className="flex items-center gap-4 rounded-xl border p-4"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    pc.status === "em_uso" ? "bg-primary/10" : "bg-success/10"
                  }`}
                >
                  <Monitor
                    className={`h-5 w-5 ${
                      pc.status === "em_uso" ? "text-primary" : "text-success"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{pc.name}</span>
                    <Badge
                      variant={pc.status === "em_uso" ? "default" : "secondary"}
                      className={pc.status === "livre" ? "bg-success text-success-foreground" : ""}
                    >
                      {pc.status === "em_uso" ? "Em uso" : "Livre"}
                    </Badge>
                  </div>
                  {pc.status === "em_uso" ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pc.user} — {pc.timeUsed}min / {pc.timeTotal}min
                      </p>
                      <Progress value={(pc.timeUsed / pc.timeTotal) * 100} className="h-1.5" />
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Disponível para uso</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Vendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{sale.item}</p>
                    <p className="text-xs text-muted-foreground">
                      Qtd: {sale.qty} • {sale.time}
                    </p>
                  </div>
                  <span className="font-heading font-semibold text-sm">{sale.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
