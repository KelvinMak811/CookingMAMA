"use client";

import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import type { ShoppingItem } from "@/types";
import { useShoppingStore } from "@/stores/shoppingStore";
import { ShoppingItemDetails } from "./ShoppingItemDetails";

interface ShoppingListItemProps {
  item: ShoppingItem;
}

export function ShoppingListItem({ item }: ShoppingListItemProps) {
  const toggleBought = useShoppingStore((s) => s.toggleBought);
  const updatePrice = useShoppingStore((s) => s.updatePrice);
  const removeItem = useShoppingStore((s) => s.removeItem);

  return (
    <ListGroup.Item
      className={`d-flex align-items-start gap-2 rounded-3 mb-2 border py-3 ${item.isBought ? "bg-light opacity-75" : ""}`}
    >
      <Form.Check
        type="checkbox"
        checked={item.isBought}
        onChange={() => toggleBought(item.id)}
        className="mt-1"
        aria-label={`標記 ${item.ingredientName} 為已購買`}
      />
      <ShoppingItemDetails item={item} strikethrough={item.isBought} />
      <InputGroup size="sm" style={{ width: "5.5rem" }} className="flex-shrink-0">
        <InputGroup.Text className="px-1" title="材料價錢">$</InputGroup.Text>
        <Form.Control
          type="number"
          min="0"
          step="0.1"
          value={item.price || ""}
          onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
          placeholder="價錢"
          aria-label={`${item.ingredientName} 價錢`}
        />
      </InputGroup>
      <Button variant="link" className="text-secondary p-0 flex-shrink-0" onClick={() => removeItem(item.id)}>
        ✕
      </Button>
    </ListGroup.Item>
  );
}
