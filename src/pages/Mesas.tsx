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
import { Input } from "@/components/ui/input";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  Coffee,
  Sandwich,
  Wifi,
  Printer,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { printReceipt } from "@/utils/printReceipt";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: React.ElementType;
}

interface OrderItem extends Product {
  qty: number;
}

interface Mesa {
  id: number;
  status: "livre" | "ocupada";
  items: OrderItem[];
  openedAt: Date | null;
}

const products: Product[] = [
  { id: 1, name: "Café Expresso", price: 7.0, category: "Bebidas", icon: Coffee },
  { id: 2, name: "Café com Leite", price: 8.5, category: "Bebidas", icon: Coffee },
  { id: 3, name: "Cappuccino", price: 10.0, category: "Bebidas", icon: Coffee },
  { id: 4, name: "Suco Natural", price: 9.0, category: "Bebidas", icon: Coffee },
  { id: 5, name: "Água Mineral", price: 4.0, category: "Bebidas", icon: Coffee },
  { id: 6, name: "Pão de Queijo", price: 4.5, category: "Lanches", icon: Sandwich },
  { id: 7, name: "Coxinha", price: 6.0, category: "Lanches", icon: Sandwich },
  { id: 8, name: "Misto Quente", price: 8.0, category: "Lanches", icon: Sandwich },
  { id: 9, name: "Bolo Fatia", price: 7.5, category: "Lanches", icon: Sandwich },
  { id: 10, name: "Voucher 1h Wi-Fi", price: 5.0, category: "Internet", icon: Wifi },
  { id: 11, name: "Voucher 2h Wi-Fi", price: 10.0, category: "Internet", icon: Wifi },
];

const categories = ["Todos", "Bebidas", "Lanches", "Internet"];

const initialMesas: Mesa[] = [
  { id: 1, status: "livre", items: [], openedAt: null },
  { id: 2, status: "livre", items: [], openedAt: null },
  { id: 3, status: "livre", items: [], openedAt: null },
  { id: 4, status: "livre", items: [], openedAt: null },
];

const Mesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>(initialMesas);
  const [selectedMesa, setSelectedMesa] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const { toast } = useToast();

  const mesa = selectedMesa !== null ? mesas.find((m) => m.id === selectedMesa) : null;

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const updateMesa = (id: number, updater: (m: Mesa) => Mesa) => {
    setMesas((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  };

  const openMesa = (id: number) => {
    updateMesa(id, (m) => ({ ...m, status: "ocupada", openedAt: new Date() }));
    setSelectedMesa(id);
  };

  const addItem = (product: Product) => {
    if (selectedMesa === null) return;
    updateMesa(selectedMesa, (m) => {
      const existing = m.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          ...m,
          status: "ocupada",
          openedAt: m.openedAt ?? new Date(),
          items: m.items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)),
        };
      }
      return {
        ...m,
        status: "ocupada",
        openedAt: m.openedAt ?? new Date(),
        items: [...m.items, { ...product, qty: 1 }],
      };
    });
  };

  const updateQty = (productId: number, delta: number) => {
    if (selectedMesa === null) return;
    updateMesa(selectedMesa, (m) => ({
      ...m,
      items: m.items
        .map((i) => (i.id === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    }));
  };

  const mesaTotal = (m: Mesa) => m.items.reduce((s, i) => s + i.price * i.qty, 0);

  const closeMesa = (id: number) => {
    const m = mesas.find((x) => x.id === id);
    if (!m || m.items.length === 0) return;

    const total = mesaTotal(m);
    toast({
      title: `Mesa ${id} encerrada!`,
      description: `Total: R$ ${total.toFixed(2)}`,
    });

    updateMesa(id, () => ({ id, status: "livre", items: [], openedAt: null }));
    setSelectedMesa(null);
  };

  const handlePrint = (id: number) => {
    const m = mesas.find((x) => x.id === id);
    if (!m || m.items.length === 0) return;
    printReceipt({ items: m.items, total: mesaTotal(m), mesa: id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mesas</h1>
        <p className="text-sm text-muted-foreground">Gerencie comandas por mesa</p>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {mesas.map((m) => (
          <Card
            key={m.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMesa === m.id ? "ring-2 ring-primary" : ""
            } ${m.status === "ocupada" ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : ""}`}
            onClick={() => {
              if (m.status === "livre") openMesa(m.id);
              else setSelectedMesa(m.id);
            }}
          >
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                  m.status === "ocupada"
                    ? "bg-orange-100 dark:bg-orange-900/30"
                    : "bg-primary/10"
                }`}
              >
                <UtensilsCrossed
                  className={`h-7 w-7 ${
                    m.status === "ocupada" ? "text-orange-600" : "text-primary"
                  }`}
                />
              </div>
              <span className="font-heading font-bold text-lg">Mesa {m.id}</span>
              <Badge variant={m.status === "ocupada" ? "default" : "secondary"}>
                {m.status === "ocupada" ? "Ocupada" : "Livre"}
              </Badge>
              {m.status === "ocupada" && (
                <span className="text-sm font-medium text-primary">
                  R$ {mesaTotal(m).toFixed(2)}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comanda da mesa selecionada */}
      {mesa && mesa.status === "ocupada" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Produtos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-card-foreground transition-all hover:border-primary hover:shadow-md active:scale-95"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <p.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{p.name}</span>
                  <span className="font-heading font-bold text-primary">
                    R$ {p.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comanda */}
          <Card className="h-fit sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Mesa {mesa.id}
                </span>
                <Badge>{mesa.items.reduce((s, i) => s + i.qty, 0)} itens</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mesa.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum item adicionado
                </p>
              ) : (
                <>
                  {mesa.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {item.price.toFixed(2)} × {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => updateQty(item.id, -item.qty)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="font-heading font-bold text-lg">Total</span>
                    <span className="font-heading font-bold text-lg text-primary">
                      R$ {mesaTotal(mesa).toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePrint(mesa.id)}
                      className="gap-1"
                    >
                      <Printer className="h-4 w-4" />
                      Cupom
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedMesa(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => closeMesa(mesa.id)}>
                      Fechar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Mesas;
