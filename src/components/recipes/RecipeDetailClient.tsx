"use client";

import { useState, useMemo } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import type { Recipe } from "@/types";
import { scaleIngredients } from "@/lib/scaleIngredients";
import { IngredientList } from "./IngredientList";
import { AddToShoppingButton } from "./AddToShoppingButton";
import { ScheduleCookingCard } from "./ScheduleCookingCard";

interface ServingScalerProps {
  servings: number;
  mealBatches: number;
  baseServings: number;
  onServingsChange: (n: number) => void;
  onMealBatchesChange: (n: number) => void;
}

export function ServingScaler({
  servings,
  mealBatches,
  baseServings,
  onServingsChange,
  onMealBatchesChange,
}: ServingScalerProps) {
  const totalFactor = (servings / baseServings) * mealBatches;

  return (
    <Card className="border-0 shadow-sm mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">份量設定</h6>
          <span className="badge bg-primary-subtle text-primary">
            材料 × {totalFactor % 1 === 0 ? totalFactor : totalFactor.toFixed(1)}
          </span>
        </div>
        <Row className="g-3">
          <Col xs={6}>
            <label className="form-label small text-secondary">煮幾多人食？</label>
            <div className="d-flex align-items-center gap-2">
              <Button variant="light" size="sm" onClick={() => onServingsChange(Math.max(1, servings - 1))}>−</Button>
              <span className="fw-bold flex-grow-1 text-center">{servings} 人</span>
              <Button variant="light" size="sm" onClick={() => onServingsChange(Math.min(12, servings + 1))}>+</Button>
            </div>
          </Col>
          <Col xs={6}>
            <label className="form-label small text-secondary">一次煮幾多餐？</label>
            <div className="d-flex align-items-center gap-2">
              <Button variant="light" size="sm" onClick={() => onMealBatchesChange(Math.max(1, mealBatches - 1))}>−</Button>
              <span className="fw-bold flex-grow-1 text-center">{mealBatches} 餐</span>
              <Button variant="light" size="sm" onClick={() => onMealBatchesChange(Math.min(7, mealBatches + 1))}>+</Button>
            </div>
          </Col>
        </Row>
        <p className="small text-secondary mt-3 mb-0">
          菜式預設 {baseServings} 人份量，調整後材料自動按比例計算。
        </p>
      </Card.Body>
    </Card>
  );
}

interface RecipeDetailClientProps {
  recipe: Recipe;
}

export function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const [servings, setServings] = useState(recipe.baseServings);
  const [mealBatches, setMealBatches] = useState(1);

  const scaledIngredients = useMemo(
    () => scaleIngredients(recipe.ingredients, recipe.baseServings, servings, mealBatches),
    [recipe, servings, mealBatches]
  );

  return (
    <>
      <ServingScaler
        servings={servings}
        mealBatches={mealBatches}
        baseServings={recipe.baseServings}
        onServingsChange={setServings}
        onMealBatchesChange={setMealBatches}
      />
      <h5 className="fw-bold mb-3">
        材料 <small className="text-secondary fw-normal">({servings}人 × {mealBatches}餐)</small>
      </h5>
      <IngredientList ingredients={scaledIngredients} />
      <div className="my-4">
        <AddToShoppingButton
          recipe={recipe}
          scaledIngredients={scaledIngredients}
          servings={servings}
          mealBatches={mealBatches}
        />
      </div>
      <ScheduleCookingCard
        recipe={recipe}
        servings={servings}
        mealBatches={mealBatches}
      />
    </>
  );
}
