"use client";

import ListGroup from "react-bootstrap/ListGroup";
import type { ShoppingItem } from "@/types";
import { useShoppingStore } from "@/stores/shoppingStore";
import { ShoppingListItem } from "./ShoppingListItem";

interface ShoppingListProps {
  items?: ShoppingItem[];
  readOnly?: boolean;
}

export function ShoppingList({ items: itemsProp, readOnly = false }: ShoppingListProps) {
  const storeItems = useShoppingStore((s) => s.items);
  const items = itemsProp ?? storeItems;
  const unbought = items.filter((i) => !i.isBought);
  const bought = items.filter((i) => i.isBought);

  if (items.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="fs-1 mb-3">🛒</div>
        <h5>買餸清單係空嘅</h5>
        <p className="text-secondary small">去菜式庫揀啲餸，或者手動加日常用品</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {unbought.length > 0 && (
        <section>
          <h6 className="text-secondary text-uppercase small fw-semibold mb-2">
            未買 ({unbought.length})
          </h6>
          <ListGroup variant="flush">
            {unbought.map((item) => (
              <ShoppingListItem key={item.id} item={item} readOnly={readOnly} />
            ))}
          </ListGroup>
        </section>
      )}
      {bought.length > 0 && (
        <section>
          <h6 className="text-secondary text-uppercase small fw-semibold mb-2">
            已買 ({bought.length})
          </h6>
          <ListGroup variant="flush">
            {bought.map((item) => (
              <ShoppingListItem key={item.id} item={item} readOnly={readOnly} />
            ))}
          </ListGroup>
        </section>
      )}
    </div>
  );
}
