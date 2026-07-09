"use client";

import { useState, useMemo } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import type { Recipe } from "@/types";
import { scaleIngredients } from "@/lib/scaleIngredients";
import { computeFridgeAvailability } from "@/lib/fridgeRecipe";
import { useFridgeStore } from "@/stores/fridgeStore";
import { useFridgeCalcEnabled } from "@/hooks/useFridgeCalcEnabled";
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
  const fridgeItems = useFridgeStore((s) => s.items);
  const { enabled: useFridgeCalc, setEnabled: setUseFridgeCalc } = useFridgeCalcEnabled(true);

  const scaledIngredients = useMemo(
    () => scaleIngredients(recipe.ingredients, recipe.baseServings, servings, mealBatches),
    [recipe, servings, mealBatches]
  );

  const availability = useMemo(
    () => computeFridgeAvailability(scaledIngredients, fridgeItems),
    [scaledIngredients, fridgeItems]
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
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
        <h5 className="fw-bold mb-0">
          材料 <small className="text-secondary fw-normal">({servings}人 × {mealBatches}餐)</small>
        </h5>
        <Form.Check
          type="switch"
          id="fridge-calc-toggle"
          label="計算雪櫃庫存"
          checked={useFridgeCalc}
          onChange={(e) => setUseFridgeCalc(e.target.checked)}
          className="small text-secondary flex-shrink-0"
        />
      </div>
      {useFridgeCalc && (
        <p className="small text-secondary mb-3">
          紅色材料表示雪櫃庫存不足，需額外購買。
        </p>
      )}
      <IngredientList
        ingredients={scaledIngredients}
        availability={availability}
        useFridgeCalc={useFridgeCalc}
      />
      <div className="my-4">
        <AddToShoppingButton
          recipe={recipe}
          scaledIngredients={scaledIngredients}
          servings={servings}
          mealBatches={mealBatches}
          availability={availability}
          useFridgeCalc={useFridgeCalc}
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
