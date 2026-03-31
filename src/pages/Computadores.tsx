import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Play, Square, Clock, User, CreditCard, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { ProductGrid } from "@/components/ProductGrid";
import { OrderItemsList } from "@/components/OrderItemsList";
import { Product, Order, TIME_OPTIONS, COMPUTER_PRICE_PER_HOUR } from "@/types/order";

const NUM_COMPUTERS = 2;

const Computadores = () => {
  const [selectedPc, setSelectedPc] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const { toast } = useToast();
  const orders = useOrders();

  // Tick every 30s to update elapsed time
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const getPcOrder = (pcId: number): Order | undefined => {
    return orders.getBySource("computador", pcId);
  };

  const getPcStatus = (pcId: number): "livre" | "em_uso" | "aguardando_pagamento" => {
    const order = getPcOrder(pcId);
    if (!order) return "livre";
    if (order.status === "aguardando_pagamento") return "aguardando_pagamento";
    return "em_uso";
  };

  const getElapsedMinutes = (order: Order): number => {
    if (!order.sessionStartedAt) return 0;
    return Math.floor((now - new Date(order.sessionStartedAt).getTime()) / 60000);
  };

  const getSessionCost = (order: Order): number => {
    if (order.sessionMinutes && order.sessionPricePerHour) {
      return (order.sessionMinutes / 60) * order.sessionPricePerHour;
    }
    // Free mode: calculate by elapsed
    if (order.sessionMinutes === 0 && order.sessionStartedAt) {
      const elapsed = getElapsedMinutes(order);
      return (elapsed / 60) * COMPUTER_PRICE_PER_HOUR;
    }
    return 0;
  };

  const startSession = () => {
    if (!selectedPc || !userName || !selectedTime) return;
    const mins = parseInt(selectedTime);
    const option = TIME_OPTIONS.find((t) => t.value === mins);

    orders.create({
      source: "computador",
      sourceId: selectedPc,
      sourceLabel: `PC-0${selectedPc} (${userName})`,
      sessionMinutes: mins,
      sessionPricePerHour: option?.price ? (option.price / (mins / 60)) : COMPUTER_PRICE_PER_HOUR,
    });

    toast({
      title: "Sessão iniciada",
      description: `${userName} no PC-0${selectedPc} — ${mins > 0 ? `${mins}min` : "Livre"}`,
    });
    setUserName("");
    setSelectedTime("");
    setDialogOpen(false);
    setSelectedPc(null);
  };

  const handleAddProduct = (product: Product) => {
    if (selectedPc === null) return;
    const order = getPcOrder(selectedPc);
    if (!order) return;
    orders.addItem(order.id, {
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      category: product.category,
    });
  };

  const handleSendToPayment = (pcId: number) => {
    const order = getPcOrder(pcId);
    if (!order) return;
    orders.sendToPayment(order.id);
    toast({
      title: `PC-0${pcId} enviado para pagamento`,
      description: `Sessão encerrada — Aguardando no PDV`,
    });
    setSelectedPc(null);
    setShowProducts(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Computadores</h1>
        <p className="text-sm text-muted-foreground">Gerencie sessões e consumo por estação</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: NUM_COMPUTERS }, (_, i) => i + 1).map((pcId) => {
          const status = getPcStatus(pcId);
          const order = getPcOrder(pcId);
          const elapsed = order ? getElapsedMinutes(order) : 0;
          const progress = order?.sessionMinutes && order.sessionMinutes > 0
            ? Math.min((elapsed / order.sessionMinutes) * 100, 100)
            : 0;

          return (
            <Card key={pcId} className={status === "em_uso" ? "border-primary/30" : status === "aguardando_pagamento" ? "border-yellow-400" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      status === "em_uso" ? "bg-primary/10" : status === "livre" ? "bg-accent/10" : "bg-warning/10"
                    }`}>
                      <Monitor className={`h-6 w-6 ${
                        status === "em_uso" ? "text-primary" : status === "livre" ? "text-accent" : "text-warning"
                      }`} />
                    </div>
                    <span className="font-heading text-xl">PC-0{pcId}</span>
                  </div>
                  <Badge
                    className={
                      status === "livre" ? "bg-accent text-accent-foreground" :
                      status === "aguardando_pagamento" ? "bg-warning text-warning-foreground" : ""
                    }
                  >
                    {status === "em_uso" ? "Em uso" : status === "livre" ? "Livre" : "Aguardando"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {status === "em_uso" && order && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{order.sourceLabel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {elapsed}min {order.sessionMinutes && order.sessionMinutes > 0 ? `/ ${order.sessionMinutes}min` : "(livre)"}
                          {" — "}Sessão: R$ {getSessionCost(order).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {order.sessionMinutes && order.sessionMinutes > 0 && (
                      <Progress value={progress} className="h-2" />
                    )}
                    {order.items.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        + {order.items.length} produto(s) consumido(s) — R$ {order.items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedPc(pcId); setShowProducts(true); }}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Consumo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedPc(pcId); setShowProducts(false); }}
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendToPayment(pcId)}
                        className="gap-1"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pagar
                      </Button>
                    </div>
                  </>
                )}
                {status === "livre" && (
                  <Dialog open={dialogOpen && selectedPc === pcId} onOpenChange={(open) => { setDialogOpen(open); if (open) setSelectedPc(pcId); }}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar Sessão
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Iniciar Sessão — PC-0{pcId}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nome do Cliente</Label>
                          <Input placeholder="Nome do cliente" value={userName} onChange={(e) => setUserName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Tempo</Label>
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger><SelectValue placeholder="Selecione o tempo" /></SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t.value} value={t.value.toString()}>
                                  {t.label} {t.price > 0 ? `— R$ ${t.price.toFixed(2)}` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={startSession}>Confirmar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Product panel for adding consumption */}
      {selectedPc !== null && showProducts && getPcStatus(selectedPc) === "em_uso" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProductGrid onAddProduct={handleAddProduct} />
          </div>
          <Card className="h-fit sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Consumo PC-0{selectedPc}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const order = getPcOrder(selectedPc);
                if (!order) return null;
                return (
                  <>
                    <OrderItemsList
                      items={order.items}
                      total={order.total}
                      sessionCostLabel={`Sessão: R$ ${getSessionCost(order).toFixed(2)}`}
                      onUpdateQty={(pid, d) => orders.updateItemQty(order.id, pid, d)}
                      onRemoveItem={(pid) => orders.removeItem(order.id, pid)}
                    />
                    <Button variant="outline" className="w-full mt-3" onClick={() => setShowProducts(false)}>
                      Fechar
                    </Button>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* View order details */}
      {selectedPc !== null && !showProducts && getPcOrder(selectedPc) && (
        <Card className="max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Detalhes PC-0{selectedPc}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const order = getPcOrder(selectedPc);
              if (!order) return null;
              return (
                <>
                  <OrderItemsList
                    items={order.items}
                    total={order.total}
                    sessionCostLabel={`Sessão: R$ ${getSessionCost(order).toFixed(2)}`}
                    readOnly
                  />
                  <Button variant="outline" className="w-full mt-3" onClick={() => setSelectedPc(null)}>
                    Fechar
                  </Button>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Computadores;
