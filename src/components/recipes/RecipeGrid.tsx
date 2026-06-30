import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import type { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";

interface RecipeGridProps {
  recipes: Recipe[];
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <Row xs={1} sm={2} lg={3} className="g-3">
      {recipes.map((recipe) => (
        <Col key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </Col>
      ))}
    </Row>
  );
}
