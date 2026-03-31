import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2 } from "lucide-react";
import { OrderItem } from "@/types/order";

interface OrderItemsListProps {
  items: OrderItem[];
  total: number;
  sessionCostLabel?: string | null;
  onUpdateQty?: (productId: number, delta: number) => void;
  onRemoveItem?: (productId: number) => void;
  readOnly?: boolean;
}

export const OrderItemsList = ({
  items,
  total,
  sessionCostLabel,
  onUpdateQty,
  onRemoveItem,
  readOnly = false,
}: OrderItemsListProps) => {
  if (items.length === 0 && !sessionCostLabel) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum item adicionado
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.productId} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              R$ {item.price.toFixed(2)} × {item.qty}
            </p>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onUpdateQty?.(item.productId, -1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onUpdateQty?.(item.productId, 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onRemoveItem?.(item.productId)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
          {readOnly && (
            <span className="text-sm font-medium text-muted-foreground">
              ×{item.qty} = R$ {(item.price * item.qty).toFixed(2)}
            </span>
          )}
        </div>
      ))}
      {sessionCostLabel && (
        <>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{sessionCostLabel}</span>
          </div>
        </>
      )}
      <Separator />
      <div className="flex items-center justify-between py-2">
        <span className="font-heading font-bold text-lg">Total</span>
        <span className="font-heading font-bold text-lg text-primary">
          R$ {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
