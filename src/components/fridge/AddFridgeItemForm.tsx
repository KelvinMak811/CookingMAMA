"use client";

import { useState, FormEvent } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { useFridgeStore } from "@/stores/fridgeStore";

export function AddFridgeItemForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const addManual = useFridgeStore((s) => s.addManual);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addManual(name, amount.trim() || "適量");
    setName("");
    setAmount("");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup className="mb-2">
        <Form.Control
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="食材名稱，例如：雞蛋、牛奶..."
          aria-label="食材名稱"
        />
        <Form.Control
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="數量，例如：6隻"
          aria-label="數量"
          style={{ maxWidth: "8rem" }}
        />
        <Button type="submit" variant="primary">
          加入雪櫃
        </Button>
      </InputGroup>
      <p className="small text-secondary mb-0">
        買餸清單標記已購買後，材料會自動加入雪櫃；亦可手動新增或修改。
      </p>
    </Form>
  );
}
