export type AppNavMode = "home" | "cook" | "fitness";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

export function resolveNavMode(pathname: string): AppNavMode {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/fitness") || pathname.startsWith("/nutrition")) {
    return "fitness";
  }
  return "cook";
}

export const homeNavItems: NavItem[] = [
  { href: "/", label: "模式", icon: "🧭", exact: true },
  { href: "/recipes", label: "菜式", icon: "📖" },
  { href: "/fitness", label: "運動", icon: "🏃" },
];

export const cookNavItems: NavItem[] = [
  { href: "/", label: "模式", icon: "🧭", exact: true },
  { href: "/recipes", label: "菜式", icon: "📖" },
  { href: "/shopping-list", label: "買餸", icon: "🛒" },
  { href: "/fridge", label: "雪櫃", icon: "🧊" },
  { href: "/history", label: "日曆", icon: "📅" },
];

export const fitnessNavItems: NavItem[] = [
  { href: "/", label: "模式", icon: "🧭", exact: true },
  { href: "/fitness", label: "計劃", icon: "🏃", exact: true },
  { href: "/fitness/plan", label: "日程", icon: "🗓️" },
  { href: "/nutrition", label: "飲食", icon: "🍽️" },
];

export function navItemsForPath(pathname: string): NavItem[] {
  const mode = resolveNavMode(pathname);
  if (mode === "fitness") return fitnessNavItems;
  if (mode === "home") return homeNavItems;
  return cookNavItems;
}

/** @deprecated use navItemsForPath */
export const mainNavItems = cookNavItems;
