import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { ShoppingBubble } from "@/components/shopping/ShoppingBubble";
import { CuisineNavSlot } from "@/components/recipes/CuisineNavSlot";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function AppShell({
  children,
  title,
  showBack,
  backHref,
}: AppShellProps) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header title={title} showBack={showBack} backHref={backHref} />
      <div className="container app-main px-3">
        <CuisineNavSlot />
      </div>
      <main className="container app-main flex-grow-1 px-3 py-3">
        {children}
      </main>
      <BottomNav />
      <ShoppingBubble />
    </div>
  );
}
