import ListGroup from "react-bootstrap/ListGroup";
import type { Ingredient } from "@/types";

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <ListGroup>
      {ingredients.map((ing) => (
        <ListGroup.Item
          key={ing.id}
          className="d-flex justify-content-between align-items-center bg-warning-subtle border-0 mb-2 rounded-3"
        >
          <span className="fw-medium">{ing.name}</span>
          <span className="text-secondary small">{ing.amount}</span>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
