"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "react-bootstrap/Nav";

const navItems = [
  { href: "/recipes", label: "菜式庫", icon: "📖" },
  { href: "/shopping-list", label: "買餸清單", icon: "🛒" },
  { href: "/history", label: "煮食紀錄", icon: "📅" },
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
            <Link
              href={item.href}
              className={`d-flex flex-column align-items-center py-2 text-decoration-none ${isActive ? "text-primary fw-semibold" : "text-secondary"}`}
            >
              <span className="fs-5">{item.icon}</span>
              <small>{item.label}</small>
            </Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
}
