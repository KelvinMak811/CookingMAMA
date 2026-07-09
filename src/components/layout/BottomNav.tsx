"use client";

import { AppLink } from "@/components/layout/AppLink";
import { mainNavItems } from "@/components/layout/navItems";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="app-bottom-nav-shell" aria-label="主要導航">
      <nav className="app-bottom-nav">
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.href} className="app-bottom-nav-item">
              <AppLink
                href={item.href}
                className={`app-bottom-nav-link ${
                  isActive ? "text-primary fw-semibold" : "text-secondary"
                }`}
              >
                <span className="app-bottom-nav-icon" aria-hidden>
                  {item.icon}
                </span>
                <span className="app-bottom-nav-label">{item.label}</span>
              </AppLink>
            </div>
          );
        })}
      </nav>
    </footer>
  );
}
