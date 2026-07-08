"use client";

import { useState, useEffect } from "react";
import { AppLink } from "@/components/layout/AppLink";
import { usePathname } from "next/navigation";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import Badge from "react-bootstrap/Badge";
import { useShoppingStore } from "@/stores/shoppingStore";
import { AddShoppingItemForm } from "./AddShoppingItemForm";
import { ShoppingItemDetails } from "./ShoppingItemDetails";
import { formatCurrency } from "@/lib/utils";
import { migrateShoppingItem } from "@/lib/shoppingUtils";

export function ShoppingBubble() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const items = useShoppingStore((s) => s.items);
  const toggleBought = useShoppingStore((s) => s.toggleBought);
  const getBoughtTotal = useShoppingStore((s) => s.getBoughtTotal);

  useEffect(() => setMounted(true), []);

  if (!mounted || pathname === "/shopping-list" || pathname === "/shopping-list/") return null;

  const normalized = items.map(migrateShoppingItem);
  const unbought = normalized.filter((i) => !i.isBought);
  const count = unbought.length;
  const preview = unbought.slice(0, 6);
  const boughtTotal = getBoughtTotal();

  return (
    <>
      <Button
        variant="primary"
        className="shopping-fab shadow d-flex align-items-center justify-content-center fs-4 p-0"
        onClick={() => setShow(true)}
        aria-label="打開買餸清單"
      >
        🛒
        {count > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
          >
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </Button>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            買餸清單
            <div className="small text-secondary fw-normal">
              {count > 0 ? `仲有 ${count} 樣未買` : "清單係空嘅"}
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column gap-3">
          {preview.length === 0 ? (
            <p className="text-center text-secondary small py-3">去菜式庫揀餸，或者下面手動加</p>
          ) : (
            preview.map((item) => (
              <label
                key={item.id}
                className="d-flex align-items-start gap-2 p-2 bg-light rounded-3"
              >
                <input
                  type="checkbox"
                  checked={item.isBought}
                  onChange={() => toggleBought(item.id)}
                  className="form-check-input mt-1"
                />
                <ShoppingItemDetails item={item} strikethrough={item.isBought} />
              </label>
            ))
          )}
          {count > 6 && <p className="text-center text-secondary small">仲有 {count - 6} 樣…</p>}
          {boughtTotal > 0 && (
            <p className="small mb-0">
              已買總花費：<strong className="text-primary">{formatCurrency(boughtTotal)}</strong>
            </p>
          )}
          <AddShoppingItemForm />
          <AppLink href="/shopping-list" className="btn btn-primary w-100" onClick={() => setShow(false)}>
            打開完整買餸清單 →
          </AppLink>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
