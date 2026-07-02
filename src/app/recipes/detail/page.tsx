import { Suspense } from "react";
import { RecipeDetailPageClient } from "./RecipeDetailPageClient";

export default function RecipeDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container app-main py-5 text-center text-secondary">
          載入菜式中…
        </div>
      }
    >
      <RecipeDetailPageClient />
    </Suspense>
  );
}
