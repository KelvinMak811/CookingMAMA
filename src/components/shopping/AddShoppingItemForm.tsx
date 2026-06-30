"use client";

import { useState, FormEvent } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { useShoppingStore } from "@/stores/shoppingStore";

export function AddShoppingItemForm() {
  const [name, setName] = useState("");
  const addItem = useShoppingStore((s) => s.addItem);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addItem(name);
    setName("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.Control
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="加啲嘢食，例如：牛奶、廁紙..."
          aria-label="新食材名稱"
        />
        <Button type="submit" variant="primary">
          加入
        </Button>
      </InputGroup>
    </Form>
  );
}
