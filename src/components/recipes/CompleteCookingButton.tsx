"use client";

import { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import type { Recipe } from "@/types";
import { useCookingLogStore } from "@/stores/cookingLogStore";
import { toDateInputValue, formatDayLabel } from "@/lib/dateNav";
import { parseDateInputValue } from "@/lib/dateNav";

interface CompleteCookingButtonProps {
  recipe: Recipe;
}

export function CompleteCookingButton({ recipe }: CompleteCookingButtonProps) {
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(5);
  const [cookedDate, setCookedDate] = useState(toDateInputValue(new Date()));
  const addRecord = useCookingLogStore((s) => s.addRecord);

  const handleComplete = () => {
    addRecord(recipe.id, recipe.name, rating, parseDateInputValue(cookedDate));
    setDone(true);
  };

  if (done) {
    return (
      <Card className="border-success bg-success-subtle text-center">
        <Card.Body>
          <p className="fw-bold text-success fs-5 mb-1">🎉 打卡成功！</p>
          <p className="small text-success mb-0">
            已記錄你{formatDayLabel(parseDateInputValue(cookedDate))}煮咗「{recipe.name}」
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-primary-subtle">
      <Card.Body className="d-flex flex-column gap-3">
        <Form.Group>
          <Form.Label className="small fw-semibold">幾時煮？</Form.Label>
          <Form.Control
            type="date"
            value={cookedDate}
            max={toDateInputValue(new Date())}
            onChange={(e) => setCookedDate(e.target.value)}
          />
          <Form.Text className="text-secondary">可以補登之前煮過嘅餸</Form.Text>
        </Form.Group>

        <div className="text-center">
          <p className="small text-secondary mb-2">幫自己評個分</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={star <= rating ? "active" : ""}
                onClick={() => setRating(star)}
                aria-label={`${star} 星`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" className="w-100" onClick={handleComplete}>
          ✅ 完成煮食 · 打卡
        </Button>
      </Card.Body>
    </Card>
  );
}
