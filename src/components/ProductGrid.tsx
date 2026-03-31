import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Coffee, Sandwich, Wifi } from "lucide-react";
import { Product, PRODUCTS, PRODUCT_CATEGORIES } from "@/types/order";

const iconMap: Record<string, React.ElementType> = {
  Coffee,
  Sandwich,
  Wifi,
};

interface ProductGridProps {
  onAddProduct: (product: Product) => void;
}

export const ProductGrid = ({ onAddProduct }: ProductGridProps) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4">
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
          {PRODUCT_CATEGORIES.map((cat) => (
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
        {filtered.map((p) => {
          const Icon = iconMap[p.icon] || Coffee;
          return (
            <button
              key={p.id}
              onClick={() => onAddProduct(p)}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-card-foreground transition-all hover:border-primary hover:shadow-md active:scale-95"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-center leading-tight">{p.name}</span>
              <span className="font-heading font-bold text-primary">
                R$ {p.price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
