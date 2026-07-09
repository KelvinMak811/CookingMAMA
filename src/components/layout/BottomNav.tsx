"use client";

import { AppLink } from "@/components/layout/AppLink";
import { mainNavItems } from "@/components/layout/navItems";
import { usePathname } from "next/navigation";
import Nav from "react-bootstrap/Nav";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <Nav
      className="app-bottom-nav fixed-bottom bg-white border-top justify-content-around"
      aria-label="主要導航"
    >
      {mainNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Nav.Item key={item.href} className="flex-fill text-center">
            <AppLink
              href={item.href}
              className={`app-bottom-nav-link d-flex flex-column align-items-center text-decoration-none ${
                isActive ? "text-primary fw-semibold" : "text-secondary"
              }`}
            >
              <span className="app-bottom-nav-icon">{item.icon}</span>
              <small className="app-bottom-nav-label">{item.label}</small>
            </AppLink>
          </Nav.Item>
        );
      })}
    </Nav>
  );
}
