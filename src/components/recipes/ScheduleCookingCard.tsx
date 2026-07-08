"use client";

import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import { AppLink } from "@/components/layout/AppLink";
import type { Recipe } from "@/types";
import { useMealPlanStore } from "@/stores/mealPlanStore";
import { useMounted } from "@/hooks/useMounted";
import { toDateInputValue, formatDayLabel } from "@/lib/dateNav";
import { parseDateInputValue } from "@/lib/dateNav";

interface ScheduleCookingCardProps {
  recipe: Recipe;
  servings: number;
  mealBatches: number;
}

export function ScheduleCookingCard({
  recipe,
  servings,
  mealBatches,
}: ScheduleCookingCardProps) {
  const mounted = useMounted();
  const [plannedDate, setPlannedDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const addPlan = useMealPlanStore((s) => s.addPlan);
  const removePlan = useMealPlanStore((s) => s.removePlan);
  const hasPlanOnDate = useMealPlanStore((s) => s.hasPlanOnDate);
  const existingPlans = useMealPlanStore((s) => s.getPlansByRecipe(recipe.id));

  useEffect(() => {
    if (mounted && !plannedDate) {
      setPlannedDate(toDateInputValue(new Date()));
    }
  }, [mounted, plannedDate]);

  const handleSchedule = () => {
    if (!plannedDate) return;
    const date = parseDateInputValue(plannedDate);
    if (hasPlanOnDate(recipe.id, date)) {
      setMessage("呢個日子已經預定咗呢道菜");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    addPlan(recipe.id, recipe.name, date, servings, mealBatches);
    setMessage(
      `已預定 ${formatDayLabel(date)} 煮「${recipe.name}」（${servings}人×${mealBatches}餐）`
    );
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <Card className="border-0 shadow-sm bg-info-subtle">
      <Card.Body className="d-flex flex-column gap-3">
        <div>
          <h6 className="fw-bold mb-1">📅 預定煮食日子</h6>
          <p className="small text-secondary mb-0">
            揀定幾時煮，會顯示喺煮食紀錄日曆，方便你提前買餸
          </p>
        </div>

        <Form.Group>
          <Form.Label className="small fw-semibold">幾時煮？</Form.Label>
          {mounted ? (
            <Form.Control
              type="date"
              value={plannedDate}
              min={toDateInputValue(new Date())}
              onChange={(e) => setPlannedDate(e.target.value)}
            />
          ) : (
            <Form.Control type="date" disabled />
          )}
          <Form.Text className="text-secondary">
            會用上面份量設定（{servings}人 × {mealBatches}餐）
          </Form.Text>
        </Form.Group>

        <Button variant="primary" className="w-100" onClick={handleSchedule}>
          加入煮食日程
        </Button>

        {message && (
          <Alert variant="success" className="py-2 mb-0 small text-center">
            {message}
          </Alert>
        )}

        {existingPlans.length > 0 && (
          <div>
            <p className="small fw-semibold text-secondary mb-2">已預定日程</p>
            <div className="d-flex flex-column gap-2">
              {existingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="d-flex align-items-center justify-content-between bg-white rounded-3 p-2 small"
                >
                  <div>
                    <span className="fw-medium">
                      {formatDayLabel(new Date(plan.plannedDate))}
                    </span>
                    <Badge bg="light" text="secondary" className="ms-2">
                      {plan.servings}人×{plan.mealBatches}餐
                    </Badge>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0"
                    onClick={() => removePlan(plan.id)}
                  >
                    取消
                  </Button>
                </div>
              ))}
            </div>
            <AppLink href="/history" className="btn btn-sm btn-outline-primary w-100 mt-2">
              去日曆睇 →
            </AppLink>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
