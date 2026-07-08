import { Suspense } from "react";
import { AddRecipePageClient } from "@/components/recipes/AddRecipePageClient";

export default function AddRecipePage() {
  return (
    <Suspense fallback={<div className="container py-4 text-secondary">載入中…</div>}>
      <AddRecipePageClient />
    </Suspense>
  );
}
