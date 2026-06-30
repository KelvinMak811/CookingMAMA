import Badge from "react-bootstrap/Badge";
import type { ShoppingItem } from "@/types";
import { migrateShoppingItem } from "@/lib/shoppingUtils";

interface ShoppingItemDetailsProps {
  item: ShoppingItem;
  strikethrough?: boolean;
}

export function ShoppingItemDetails({ item, strikethrough }: ShoppingItemDetailsProps) {
  const normalized = migrateShoppingItem(item);

  return (
    <div className={`flex-grow-1 min-w-0 ${strikethrough ? "text-decoration-line-through text-secondary" : ""}`}>
      <div className="fw-medium small">{normalized.ingredientName}</div>
      <div className="d-flex flex-wrap gap-1 mt-1">
        {normalized.amount && (
          <Badge bg="warning" text="dark" className="fw-normal">
            {normalized.amount}
          </Badge>
        )}
        {normalized.recipeName && (
          <Badge bg="info" text="dark" className="fw-normal">
            🍳 {normalized.recipeName}
          </Badge>
        )}
        {!normalized.recipeName && !normalized.amount && (
          <span className="text-secondary" style={{ fontSize: "0.7rem" }}>
            手動加入
          </span>
        )}
      </div>
    </div>
  );
}
