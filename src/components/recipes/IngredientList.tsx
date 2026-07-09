import ListGroup from "react-bootstrap/ListGroup";
import type { Ingredient, IngredientAvailability } from "@/types";

interface IngredientListProps {
  ingredients: Ingredient[];
  availability?: IngredientAvailability[];
  useFridgeCalc?: boolean;
}

export function IngredientList({
  ingredients,
  availability,
  useFridgeCalc = false,
}: IngredientListProps) {
  const availabilityMap = new Map(
    availability?.map((entry) => [entry.ingredient.id, entry]) ?? []
  );

  return (
    <ListGroup>
      {ingredients.map((ing) => {
        const entry = availabilityMap.get(ing.id);
        const needToBuy = useFridgeCalc && entry?.needToBuy;
        const displayAmount = useFridgeCalc && entry ? entry.displayAmount : ing.amount;

        return (
          <ListGroup.Item
            key={ing.id}
            className={`d-flex justify-content-between align-items-center border-0 mb-2 rounded-3 ${
              needToBuy ? "bg-danger-subtle" : "bg-warning-subtle"
            }`}
          >
            <span className={`fw-medium ${needToBuy ? "text-danger" : ""}`}>
              {ing.name}
              {useFridgeCalc && entry?.inFridge && entry.fridgeAmount && (
                <small className="text-secondary fw-normal ms-2">
                  雪櫃：{entry.fridgeAmount}
                </small>
              )}
            </span>
            <span className={`small ${needToBuy ? "text-danger fw-semibold" : "text-secondary"}`}>
              {needToBuy && entry?.needAmount ? `需買 ${entry.needAmount}` : displayAmount}
            </span>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
