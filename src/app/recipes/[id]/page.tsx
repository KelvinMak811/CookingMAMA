import Image from "next/image";
import { notFound } from "next/navigation";
import Badge from "react-bootstrap/Badge";
import { AppShell } from "@/components/layout/AppShell";
import { DifficultyStars } from "@/components/recipes/DifficultyStars";
import { StepList } from "@/components/recipes/StepList";
import { CompleteCookingButton } from "@/components/recipes/CompleteCookingButton";
import { RecipeDetailClient } from "@/components/recipes/RecipeDetailClient";
import { getRecipeById } from "@/data/recipes";
import { CUISINE_LABELS } from "@/types";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params;
  const recipe = getRecipeById(id);
  if (!recipe) notFound();

  return (
    <AppShell
      title={recipe.name}
      showBack
      backHref={`/recipes/cuisine/${recipe.cuisine}`}
    >
      <article className="d-flex flex-column gap-4">
        <div className="position-relative rounded-3 overflow-hidden shadow ratio ratio-16x9">
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-fit-cover"
            priority
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <DifficultyStars difficulty={recipe.difficulty} />
            <Badge bg="warning" text="dark">{CUISINE_LABELS[recipe.cuisine]}</Badge>
          </div>
          <span className="text-secondary small">⏱ 約 {recipe.prepTime} 分鐘 · 易潔鑊</span>
        </div>

        <section>
          <h2 className="h5 fw-bold">簡介</h2>
          <p className="text-secondary">{recipe.description}</p>
        </section>

        <RecipeDetailClient recipe={recipe} />

        <section>
          <h2 className="h5 fw-bold mb-2">煮食步驟</h2>
          <p className="text-secondary small mb-3">每個步驟都可以撳「朗讀步驟」用語音播放</p>
          <StepList steps={recipe.steps} />
        </section>

        <CompleteCookingButton recipe={recipe} />
      </article>
    </AppShell>
  );
}
