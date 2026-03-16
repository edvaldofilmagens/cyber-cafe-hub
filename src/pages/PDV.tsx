import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Search, Coffee, Sandwich, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: React.ElementType;
}

interface CartItem extends Product {
  qty: number;
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
  { id: 12, name: "Voucher 5h Wi-Fi", price: 20.0, category: "Internet", icon: Wifi },
  { id: 13, name: "Voucher 10h Wi-Fi", price: 35.0, category: "Internet", icon: Wifi },
];

const categories = ["Todos", "Bebidas", "Lanches", "Internet"];

const PDV = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const { toast } = useToast();

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const finalize = () => {
    if (cart.length === 0) return;
    toast({
      title: "Venda Finalizada!",
      description: `Total: R$ ${total.toFixed(2)} — ${cart.length} item(ns)`,
    });
    setCart([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Ponto de Venda</h1>
        <p className="text-sm text-muted-foreground">Registre vendas de café, lanches e vouchers</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Products */}
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
                onClick={() => addToCart(p)}
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

        {/* Cart */}
        <Card className="h-fit sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Carrinho
              {cart.length > 0 && (
                <Badge className="ml-auto">{cart.reduce((s, i) => s + i.qty, 0)}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Carrinho vazio
              </p>
            ) : (
              <>
                {cart.map((item) => (
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
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setCart([])}>
                    Limpar
                  </Button>
                  <Button onClick={finalize}>Finalizar</Button>
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
