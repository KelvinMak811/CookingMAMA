"use client";

import { AppLink } from "@/components/layout/AppLink";
import { usePathname } from "next/navigation";
import Nav from "react-bootstrap/Nav";

const navItems = [
  { href: "/recipes", label: "菜式", icon: "📖" },
  { href: "/shopping-list", label: "買餸", icon: "🛒" },
  { href: "/history", label: "日曆", icon: "📅" },
  { href: "/expenses", label: "開支", icon: "💰" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <Nav
      className="fixed-bottom bg-white border-top d-md-none justify-content-around safe-area-bottom"
      style={{ zIndex: 1030 }}
      aria-label="主要導航"
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Nav.Item key={item.href} className="flex-fill text-center">
            <AppLink
              href={item.href}
              className={`d-flex flex-column align-items-center py-2 text-decoration-none ${isActive ? "text-primary fw-semibold" : "text-secondary"}`}
            >
              <span className="fs-5">{item.icon}</span>
              <small style={{ fontSize: "0.7rem" }}>{item.label}</small>
            </AppLink>
          </Nav.Item>
        );
      })}
    </Nav>
  );
}
