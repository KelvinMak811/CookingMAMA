import { AppShell } from "@/components/layout/AppShell";
import { RecipeCatalog } from "@/components/recipes/RecipeCatalog";

export default function Home() {
  return (
    <AppShell title="菜式庫">
      <RecipeCatalog cuisine="all" />
    </AppShell>
  );
}
