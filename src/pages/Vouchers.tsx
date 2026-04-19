import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket, Plus, Copy, Wifi, Clock, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

const plans = [
  { label: "1 hora — R$ 5,00", hours: 1, price: 5 },
  { label: "2 horas — R$ 10,00", hours: 2, price: 10 },
  { label: "5 horas — R$ 20,00", hours: 5, price: 20 },
  { label: "10 horas — R$ 35,00", hours: 10, price: 35 },
];

const Vouchers = () => {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["vouchers"],
    queryFn: () => api.getVouchers(),
  });

  const generateMut = useMutation({
    mutationFn: api.createVouchers,
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      toast({ title: `${created.length} voucher(s) gerado(s)` });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const generate = () => {
    const plan = plans.find((p) => p.hours.toString() === selectedPlan);
    if (!plan) {
      toast({ title: "Selecione um plano", variant: "destructive" });
      return;
    }
    generateMut.mutate({ hours: plan.hours, price: plan.price, qty });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!", description: code });
  };

  const filtered = useMemo(
    () =>
      vouchers.filter(
        (v) =>
          v.code.toLowerCase().includes(search.toLowerCase()) ||
          (v.client && v.client.toLowerCase().includes(search.toLowerCase()))
      ),
    [vouchers, search]
  );

  const totalActive = vouchers.filter((v) => v.status === "ativo").length;
  const totalAvailable = vouchers.filter((v) => v.status === "disponivel").length;
  const totalHoursRemaining = vouchers
    .filter((v) => v.status === "ativo" || v.status === "disponivel")
    .reduce((s, v) => s + (v.hours - v.hoursUsed), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Vouchers</h1>
        <p className="text-sm text-muted-foreground">
          Geração e gerenciamento de vouchers Wi-Fi / PC
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="font-heading text-xl font-bold">{totalActive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Ticket className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
              <p className="font-heading text-xl font-bold">{totalAvailable}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horas Restantes</p>
              <p className="font-heading text-xl font-bold">{totalHoursRemaining}h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Gerar Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1 min-w-[200px]">
              <Label>Plano</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.hours} value={p.hours.toString()}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-24">
              <Label>Quantidade</Label>
              <Input type="number" min={1} max={50} value={qty} onChange={(e) => setQty(+e.target.value)} />
            </div>
            <Button onClick={generate} disabled={generateMut.isPending}>
              {generateMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Gerar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por código ou cliente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Tempo</TableHead>
                  <TableHead className="text-center">Usado em</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">{v.code}</TableCell>
                    <TableCell>{v.client || "—"}</TableCell>
                    <TableCell className="text-center">
                      {v.hoursUsed}h / {v.hours}h
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        {v.usedOn.length > 0
                          ? v.usedOn.map((u) => (
                              <Badge key={u} variant="outline" className="text-xs">
                                {u}
                              </Badge>
                            ))
                          : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">R$ {v.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          v.status === "ativo"
                            ? "bg-primary/10 text-primary"
                            : v.status === "disponivel"
                            ? "bg-success/10 text-success"
                            : v.status === "esgotado"
                            ? "bg-muted text-muted-foreground"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        {v.status === "ativo" ? "Ativo" : v.status === "disponivel" ? "Disponível" : v.status === "esgotado" ? "Esgotado" : "Expirado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(v.code)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Vouchers;
