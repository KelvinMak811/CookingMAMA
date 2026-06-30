import { AppShell } from "@/components/layout/AppShell";
import { AddShoppingItemForm } from "@/components/shopping/AddShoppingItemForm";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { ShoppingTotal } from "@/components/shopping/ShoppingTotal";
import { ReadUnboughtButton } from "@/components/shopping/ReadUnboughtButton";

export default function ShoppingListPage() {
  return (
    <AppShell title="買餸清單">
      <div className="d-flex flex-column gap-4">
        <AddShoppingItemForm />
        <ReadUnboughtButton />
        <ShoppingList />
        <ShoppingTotal />
      </div>
    </AppShell>
  );
}
