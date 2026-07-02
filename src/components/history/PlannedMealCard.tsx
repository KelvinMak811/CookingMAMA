"use client";

import { HardLink } from "@/components/layout/HardLink";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import type { MealPlan } from "@/types";
import { formatDate } from "@/lib/utils";

interface PlannedMealCardProps {
  plan: MealPlan;
  onRemove?: (id: string) => void;
  showDate?: boolean;
}

export function PlannedMealCard({ plan, onRemove, showDate }: PlannedMealCardProps) {
  return (
    <Card className="border-0 shadow-sm border-start border-info border-3">
      <Card.Body className="d-flex align-items-start gap-3 py-3">
        <div
          className="rounded-circle bg-info-subtle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40 }}
        >
          📋
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <h6 className="mb-0 fw-semibold">{plan.recipeName}</h6>
            <Badge bg="info" className="fw-normal">
              預定
            </Badge>
          </div>
          {showDate && (
            <p className="mb-1 small text-secondary">{formatDate(plan.plannedDate)}</p>
          )}
          <p className="mb-2 small text-secondary">
            {plan.servings} 人份量 × {plan.mealBatches} 餐
          </p>
          <HardLink href={`/recipes/${plan.recipeId}`} className="btn btn-sm btn-outline-primary">
            睇菜式
          </HardLink>
        </div>
        {onRemove && (
          <Button
            variant="link"
            className="text-secondary p-0 flex-shrink-0"
            onClick={() => onRemove(plan.id)}
            aria-label="取消預定"
          >
            ✕
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
