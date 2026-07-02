import { recipes } from "@/data/recipes";
import { RecipeLegacyRedirect } from "./RecipeLegacyRedirect";

interface LegacyRecipePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return recipes.map((recipe) => ({ id: recipe.id }));
}

export default async function LegacyRecipePage({ params }: LegacyRecipePageProps) {
  const { id } = await params;
  return <RecipeLegacyRedirect recipeId={id} />;
}
