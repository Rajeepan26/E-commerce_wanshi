import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Megaphone,
  Package,
  Percent,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, only `path === href` counts as active. */
  exact?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/offers", label: "Offer", icon: Percent },
  { href: "/admin/advertisement", label: "Advertisement", icon: Megaphone },
  { href: "/", label: "Frontend", icon: Store, exact: true },
];

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}
