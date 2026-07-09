import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import type { Recipe } from "@/types";
import type { FridgeRecipeMatch } from "@/lib/fridgeRecommendations";
import { RecipeCard } from "./RecipeCard";

interface RecipeGridProps {
  recipes: Recipe[];
  fridgeMatches?: FridgeRecipeMatch[];
}

export function RecipeGrid({ recipes, fridgeMatches }: RecipeGridProps) {
  const matchMap = new Map(
    fridgeMatches?.map((match) => [match.recipe.id, match]) ?? []
  );

  return (
    <Row xs={1} sm={2} lg={3} className="g-3">
      {recipes.map((recipe) => (
        <Col key={recipe.id}>
          <RecipeCard recipe={recipe} fridgeMatch={matchMap.get(recipe.id)} />
        </Col>
      ))}
    </Row>
  );
}
