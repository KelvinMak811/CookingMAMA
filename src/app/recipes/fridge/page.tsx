import { AppShell } from "@/components/layout/AppShell";
import { FridgeRecipeCatalog } from "@/components/recipes/FridgeRecipeCatalog";

export default function FridgeRecipesPage() {
  return (
    <AppShell title="雪櫃推薦">
      <FridgeRecipeCatalog />
    </AppShell>
  );
}
