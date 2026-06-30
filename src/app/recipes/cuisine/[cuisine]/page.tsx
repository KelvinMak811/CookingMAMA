import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeCatalog } from "@/components/recipes/RecipeCatalog";
import { isValidCuisine } from "@/lib/cuisineNav";
import { CUISINE_LABELS } from "@/types";
import type { CuisineType } from "@/types";

interface CuisinePageProps {
  params: Promise<{ cuisine: string }>;
}

export function generateStaticParams() {
  return (
    ["chinese", "western", "japanese", "italian"] as CuisineType[]
  ).map((cuisine) => ({ cuisine }));
}

export default async function CuisineRecipesPage({ params }: CuisinePageProps) {
  const { cuisine } = await params;

  if (!isValidCuisine(cuisine)) {
    notFound();
  }

  return (
    <AppShell title={CUISINE_LABELS[cuisine]}>
      <RecipeCatalog cuisine={cuisine} />
    </AppShell>
  );
}
