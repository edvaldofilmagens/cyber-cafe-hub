import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/hooks/useProducts";
import { api, ApiProduct } from "@/services/api";

const Estoque = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    minStock: 0,
    costPrice: 0,
    icon: "Package",
  });
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: products = [], isLoading, error } = useProducts();

  const createMut = useMutation({
    mutationFn: (data: Partial<ApiProduct>) => api.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setNewItem({ name: "", category: "", price: 0, stock: 0, minStock: 0, costPrice: 0, icon: "Package" });
      setOpen(false);
      toast({ title: "Produto adicionado ao estoque" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const filtered = useMemo(
    () => products.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const lowStock = useMemo(() => products.filter((i) => i.stock <= i.minStock), [products]);

  const addItem = () => {
    if (!newItem.name || !newItem.category) {
      toast({ title: "Preencha nome e categoria", variant: "destructive" });
      return;
    }
    createMut.mutate(newItem);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Estoque</h1>
          <p className="text-sm text-muted-foreground">Controle de inventário</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Estoque</Label>
                  <Input type="number" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: +e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Estoque Mínimo</Label>
                  <Input type="number" value={newItem.minStock} onChange={(e) => setNewItem({ ...newItem, minStock: +e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Preço Custo</Label>
                  <Input type="number" step="0.01" value={newItem.costPrice} onChange={(e) => setNewItem({ ...newItem, costPrice: +e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Preço Venda</Label>
                  <Input type="number" step="0.01" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: +e.target.value })} />
                </div>
              </div>
              <Button className="w-full" onClick={addItem} disabled={createMut.isPending}>
                {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            Erro ao carregar produtos do servidor.
          </CardContent>
        </Card>
      )}

      {lowStock.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <p className="text-sm">
              <strong>{lowStock.length} produto(s)</strong> com estoque baixo:{" "}
              {lowStock.map((i) => i.name).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar produto..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-center">{item.stock}</TableCell>
                    <TableCell className="text-right">R$ {item.costPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      {item.stock <= item.minStock ? (
                        <Badge variant="destructive" className="text-xs">Baixo</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-success/10 text-success text-xs">OK</Badge>
                      )}
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

export default Estoque;
