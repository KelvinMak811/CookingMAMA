import { recipes, getRecipeById } from "@/data/recipes";
import { RecipePageClient } from "@/components/recipes/RecipePageClient";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return recipes.map((recipe) => ({ id: recipe.id }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = getRecipeById(id) ?? null;

  return <RecipePageClient recipeId={id} initialRecipe={recipe} />;
}
