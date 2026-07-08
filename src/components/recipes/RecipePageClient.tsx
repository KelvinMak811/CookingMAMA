"use client";

import { useEffect, useMemo, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import type { Recipe } from "@/types";
import { CUISINE_LABELS } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { AppLink } from "@/components/layout/AppLink";
import { DifficultyStars } from "@/components/recipes/DifficultyStars";
import { StepList } from "@/components/recipes/StepList";
import { CompleteCookingButton } from "@/components/recipes/CompleteCookingButton";
import { RecipeDetailClient } from "@/components/recipes/RecipeDetailClient";
import { deleteCustomRecipe, getCustomRecipeById } from "@/lib/customRecipes";
import { useAccountStore } from "@/stores/accountStore";

interface RecipePageClientProps {
  recipeId: string;
  initialRecipe: Recipe | null;
}

export function RecipePageClient({ recipeId, initialRecipe }: RecipePageClientProps) {
  const currentUserId = useAccountStore((state) => state.currentUserId);
  const [customRecipe, setCustomRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (initialRecipe) return;
    setCustomRecipe(getCustomRecipeById(recipeId));
  }, [initialRecipe, recipeId]);

  const recipe = initialRecipe ?? customRecipe;

  const canEditCustom = useMemo(() => {
    return Boolean(
      recipe?.isCustom &&
        recipe.createdBy &&
        currentUserId &&
        recipe.createdBy === currentUserId
    );
  }, [recipe, currentUserId]);

  if (!recipe) {
    return (
      <AppShell title="搵唔到" showBack backHref="/recipes/">
        <div className="text-center py-5">
          <div className="fs-1 mb-3">😕</div>
          <h2 className="h5">呢個頁面唔存在</h2>
          <p className="text-secondary mb-4">可能個菜式已經刪除或者連結有誤</p>
          <AppLink href="/recipes/" className="btn btn-primary">
            返回菜式庫
          </AppLink>
        </div>
      </AppShell>
    );
  }

  const handleDelete = () => {
    if (!currentUserId || !canEditCustom) return;
    const ok = window.confirm(`確定要刪除「${recipe.name}」？`);
    if (!ok) return;
    const deleted = deleteCustomRecipe(recipe.id, currentUserId);
    if (deleted) {
      window.location.assign("/recipes/");
    }
  };

  const hasPrepTime = recipe.prepTime > 0;
  const backHref = `/recipes/cuisine/${recipe.cuisine}/`;

  return (
    <AppShell title={recipe.name} showBack backHref={backHref}>
      <article className="d-flex flex-column gap-4">
        {recipe.isCustom && (
          <Alert variant="primary" className="border-0 py-2 mb-0 small">
            <span className="badge bg-primary me-1">自訂菜式</span>
            由 <strong>{recipe.createdByName ?? "用戶"}</strong> 加入
          </Alert>
        )}

        {canEditCustom && (
          <div className="d-flex gap-2">
            <AppLink href={`/add-recipe/?id=${encodeURIComponent(recipe.id)}`} className="btn btn-outline-primary btn-sm">
              ✏️ 編輯菜式
            </AppLink>
            <Button variant="outline-danger" size="sm" onClick={handleDelete}>
              🗑 刪除菜式
            </Button>
          </div>
        )}

        <div className="position-relative rounded-3 overflow-hidden shadow ratio ratio-16x9">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="object-fit-cover w-100 h-100"
          />
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <DifficultyStars difficulty={recipe.difficulty} />
            <Badge bg="warning" text="dark">
              {CUISINE_LABELS[recipe.cuisine]}
            </Badge>
          </div>
          <span className="text-secondary small">
            {hasPrepTime ? `⏱ 約 ${recipe.prepTime} 分鐘` : "⏱ 時間自訂"} · 易潔鑊
          </span>
        </div>

        <section>
          <h2 className="h5 fw-bold">簡介</h2>
          <p className="text-secondary">{recipe.description || "（未有簡介）"}</p>
        </section>

        <RecipeDetailClient recipe={recipe} />

        <section>
          <h2 className="h5 fw-bold mb-2">煮食步驟</h2>
          <p className="text-secondary small mb-3">
            每個步驟都可以撳「朗讀步驟」用語音播放
          </p>
          <StepList
            steps={recipe.steps.length > 0 ? recipe.steps : ["（未有步驟說明）"]}
          />
        </section>

        <CompleteCookingButton recipe={recipe} />
      </article>
    </AppShell>
  );
}
