"use client";

import Card from "react-bootstrap/Card";
import { useShoppingStore } from "@/stores/shoppingStore";
import { formatCurrency } from "@/lib/utils";

export function ShoppingTotal() {
  const getBoughtTotal = useShoppingStore((s) => s.getBoughtTotal);
  const boughtCount = useShoppingStore((s) => s.items.filter((i) => i.isBought).length);
  const total = getBoughtTotal();

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
