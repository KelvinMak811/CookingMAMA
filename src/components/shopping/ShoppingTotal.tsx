"use client";

import { useMemo } from "react";
import Card from "react-bootstrap/Card";
import type { ShoppingItem } from "@/types";
import { useShoppingStore } from "@/stores/shoppingStore";
import { formatCurrency } from "@/lib/utils";
import { migrateShoppingItem } from "@/lib/shoppingUtils";

interface ShoppingTotalProps {
  items?: ShoppingItem[];
}

export function ShoppingTotal({ items: itemsProp }: ShoppingTotalProps) {
  const storeItems = useShoppingStore((s) => s.items);
  const items = useMemo(
    () => (itemsProp ?? storeItems).map(migrateShoppingItem),
    [itemsProp, storeItems]
  );
  const boughtCount = items.filter((i) => i.isBought).length;
  const total = items
    .filter((i) => i.isBought)
    .reduce((sum, item) => sum + item.price, 0);

  if (boughtCount === 0) return null;

  return (
    <Card className="border-0 bg-primary text-white shadow position-sticky" style={{ bottom: "5.5rem" }}>
      <Card.Body className="d-flex justify-content-between align-items-center py-3">
        <div>
          <div className="small opacity-75">已買項目總花費</div>
          <div className="small opacity-75">{boughtCount} 項已購買</div>
        </div>
        <div className="fs-4 fw-bold">{formatCurrency(total)}</div>
      </Card.Body>
    </Card>
  );
}
