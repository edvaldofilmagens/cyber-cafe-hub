import { useState } from "react";
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
import { Package, Plus, Search, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockItem {
  id: number;
  name: string;
  category: string;
  qty: number;
  minQty: number;
  costPrice: number;
  sellPrice: number;
}

const initialStock: StockItem[] = [
  { id: 1, name: "Café em Pó 500g", category: "Insumos", qty: 8, minQty: 5, costPrice: 18.0, sellPrice: 0 },
  { id: 2, name: "Leite UHT 1L", category: "Insumos", qty: 12, minQty: 6, costPrice: 5.5, sellPrice: 0 },
  { id: 3, name: "Pão de Queijo Congelado (kg)", category: "Alimentos", qty: 3, minQty: 5, costPrice: 22.0, sellPrice: 4.5 },
  { id: 4, name: "Coxinha Congelada (un)", category: "Alimentos", qty: 25, minQty: 10, costPrice: 2.5, sellPrice: 6.0 },
  { id: 5, name: "Água Mineral 500ml (un)", category: "Bebidas", qty: 48, minQty: 24, costPrice: 1.2, sellPrice: 4.0 },
  { id: 6, name: "Suco Polpa 1L", category: "Bebidas", qty: 6, minQty: 4, costPrice: 7.0, sellPrice: 9.0 },
  { id: 7, name: "Açúcar 1kg", category: "Insumos", qty: 4, minQty: 3, costPrice: 5.0, sellPrice: 0 },
  { id: 8, name: "Copo Descartável 200ml (100un)", category: "Descartáveis", qty: 2, minQty: 3, costPrice: 8.0, sellPrice: 0 },
];

const Estoque = () => {
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState({ name: "", category: "", qty: 0, minQty: 0, costPrice: 0, sellPrice: 0 });
  const { toast } = useToast();

  const filtered = stock.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = stock.filter((i) => i.qty <= i.minQty);

  const addItem = () => {
    if (!newItem.name) return;
    setStock((prev) => [
      ...prev,
      { ...newItem, id: Date.now() },
    ]);
    setNewItem({ name: "", category: "", qty: 0, minQty: 0, costPrice: 0, sellPrice: 0 });
    toast({ title: "Produto adicionado ao estoque" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Estoque</h1>
          <p className="text-sm text-muted-foreground">Controle de inventário</p>
        </div>
        <Dialog>
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
                  <Label>Quantidade</Label>
                  <Input type="number" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: +e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Qtd Mínima</Label>
                  <Input type="number" value={newItem.minQty} onChange={(e) => setNewItem({ ...newItem, minQty: +e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Preço Custo</Label>
                  <Input type="number" step="0.01" value={newItem.costPrice} onChange={(e) => setNewItem({ ...newItem, costPrice: +e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Preço Venda</Label>
                  <Input type="number" step="0.01" value={newItem.sellPrice} onChange={(e) => setNewItem({ ...newItem, sellPrice: +e.target.value })} />
                </div>
              </div>
              <Button className="w-full" onClick={addItem}>Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  <TableCell className="text-center">{item.qty}</TableCell>
                  <TableCell className="text-right">R$ {item.costPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {item.sellPrice > 0 ? `R$ ${item.sellPrice.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.qty <= item.minQty ? (
                      <Badge variant="destructive" className="text-xs">Baixo</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Estoque;
