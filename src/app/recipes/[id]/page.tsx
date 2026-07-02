import { recipes } from "@/data/recipes";
import { RecipeDetailView } from "@/components/recipes/RecipeDetailView";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return recipes.map((recipe) => ({ id: recipe.id }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  return <RecipeDetailView recipeId={id} />;
}
