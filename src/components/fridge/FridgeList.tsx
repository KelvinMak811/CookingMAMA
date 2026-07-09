"use client";

import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import type { FridgeItem } from "@/types";
import { useFridgeStore } from "@/stores/fridgeStore";

interface FridgeListItemProps {
  item: FridgeItem;
  readOnly?: boolean;
}

function FridgeListItem({ item, readOnly = false }: FridgeListItemProps) {
  const updateAmount = useFridgeStore((s) => s.updateAmount);
  const removeItem = useFridgeStore((s) => s.removeItem);

  if (readOnly) {
    return (
      <ListGroup.Item className="d-flex justify-content-between align-items-center rounded-3 mb-2 border py-3">
        <span className="fw-medium">{item.ingredientName}</span>
        <span className="text-secondary small">{item.amount}</span>
      </ListGroup.Item>
    );
  }

  return (
    <ListGroup.Item className="d-flex align-items-center gap-2 rounded-3 mb-2 border py-3">
      <div className="flex-grow-1 min-w-0">
        <div className="fw-medium text-truncate">{item.ingredientName}</div>
        {item.source === "shopping" && (
          <small className="text-secondary">來自買餸清單</small>
        )}
      </div>
      <Form.Control
        size="sm"
        value={item.amount}
        onChange={(e) => updateAmount(item.id, e.target.value)}
        aria-label={`${item.ingredientName} 數量`}
        style={{ maxWidth: "7rem" }}
      />
      <Button
        variant="link"
        className="text-secondary p-0 flex-shrink-0"
        onClick={() => removeItem(item.id)}
        aria-label={`刪除 ${item.ingredientName}`}
      >
        ✕
      </Button>
    </ListGroup.Item>
  );
}

interface FridgeListProps {
  items?: FridgeItem[];
  readOnly?: boolean;
}

export function FridgeList({ items: propItems, readOnly = false }: FridgeListProps) {
  const storeItems = useFridgeStore((s) => s.items);
  const items = propItems ?? storeItems;

  if (items.length === 0) {
    return (
      <p className="text-secondary text-center py-4 mb-0">
        雪櫃暫時未有紀錄。買餸後勾選已購買，或手動加入材料。
      </p>
    );
  }

  return (
    <ListGroup variant="flush">
      {items.map((item) => (
        <FridgeListItem key={item.id} item={item} readOnly={readOnly} />
      ))}
    </ListGroup>
  );
}
