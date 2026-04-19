import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Plus, Wallet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiAccount } from "@/services/api";

const Financeiro = () => {
  const [open, setOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({
    description: "",
    value: 0,
    dueDate: "",
    type: "pagar" as "pagar" | "receber",
  });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.getAccounts(),
  });

  const createMut = useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setNewAcc({ description: "", value: 0, dueDate: "", type: "pagar" });
      setOpen(false);
      toast({ title: "Conta adicionada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "pendente" | "pago" }) =>
      api.updateAccount(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });

  const pagar = useMemo(() => accounts.filter((a) => a.type === "pagar"), [accounts]);
  const receber = useMemo(() => accounts.filter((a) => a.type === "receber"), [accounts]);
  const totalPagar = pagar.filter((a) => a.status === "pendente").reduce((s, a) => s + a.value, 0);
  const totalReceber = receber.filter((a) => a.status === "pendente").reduce((s, a) => s + a.value, 0);

  const addAccount = () => {
    if (!newAcc.description || !newAcc.value || !newAcc.dueDate) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createMut.mutate(newAcc);
  };

  const renderTable = (items: ApiAccount[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((acc) => (
          <TableRow key={acc.id}>
            <TableCell className="font-medium">{acc.description}</TableCell>
            <TableCell className="text-right">R$ {acc.value.toFixed(2)}</TableCell>
            <TableCell>{new Date(acc.dueDate).toLocaleDateString("pt-BR")}</TableCell>
            <TableCell className="text-center">
              <Badge
                variant={acc.status === "pago" ? "secondary" : "destructive"}
                className={acc.status === "pago" ? "bg-success/10 text-success" : ""}
              >
                {acc.status === "pago" ? "Pago" : "Pendente"}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant="ghost"
                size="sm"
                disabled={toggleMut.isPending}
                onClick={() =>
                  toggleMut.mutate({ id: acc.id, status: acc.status === "pendente" ? "pago" : "pendente" })
                }
              >
                {acc.status === "pendente" ? "Marcar Pago" : "Reabrir"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Contas a pagar e receber</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Conta</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={newAcc.type} onValueChange={(v) => setNewAcc({ ...newAcc, type: v as "pagar" | "receber" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pagar">A Pagar</SelectItem>
                    <SelectItem value="receber">A Receber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Descrição</Label>
                <Input value={newAcc.description} onChange={(e) => setNewAcc({ ...newAcc, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Valor</Label>
                  <Input type="number" step="0.01" value={newAcc.value} onChange={(e) => setNewAcc({ ...newAcc, value: +e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Vencimento</Label>
                  <Input type="date" value={newAcc.dueDate} onChange={(e) => setNewAcc({ ...newAcc, dueDate: e.target.value })} />
                </div>
              </div>
              <Button className="w-full" onClick={addAccount} disabled={createMut.isPending}>
                {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">A Pagar</p>
              <p className="font-heading text-xl font-bold">R$ {totalPagar.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">A Receber</p>
              <p className="font-heading text-xl font-bold">R$ {totalReceber.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Previsto</p>
              <p className="font-heading text-xl font-bold">R$ {(totalReceber - totalPagar).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando...
            </div>
          ) : (
            <Tabs defaultValue="pagar" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 pt-2">
                <TabsTrigger value="pagar">A Pagar ({pagar.length})</TabsTrigger>
                <TabsTrigger value="receber">A Receber ({receber.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pagar" className="mt-0">{renderTable(pagar)}</TabsContent>
              <TabsContent value="receber" className="mt-0">{renderTable(receber)}</TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;
