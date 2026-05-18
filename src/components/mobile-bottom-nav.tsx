"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

function useMobileShopTabBarEligible() {
  const path = usePathname();
  if (!path) return false;
  if (path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/register")) {
    return false;
  }
  return true;
}

/** In-flow space so scrollable pages clear the fixed tab bar (mobile storefront only). */
export function MobileBottomSpacer() {
  const eligible = useMobileShopTabBarEligible();
  if (!eligible) return null;
  return (
    <div
      aria-hidden
      className="h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] shrink-0 md:hidden"
    />
  );
}

/** Bottom tab bar: Home, Search (/products), Cart, Profile — hidden on desktop and auth/admin routes. */
export function MobileBottomNav() {
  const eligible = useMobileShopTabBarEligible();
  const path = usePathname();
  const { user } = useAuth();
  const { count } = useCart();

  if (!eligible || !path) return null;

  const items = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: path === "/",
    },
    {
      href: "/products",
      label: "Search",
      icon: Search,
      active: path.startsWith("/products") || path.startsWith("/category/"),
    },
    {
      href: "/dashboard/cart",
      label: "Cart",
      icon: ShoppingCart,
      active: path.startsWith("/dashboard/cart"),
      badge: count,
    },
    {
      href: user ? "/dashboard" : "/login",
      label: "Profile",
      icon: UserRound,
      active:
        path.startsWith("/dashboard") &&
        path !== "/dashboard/cart" &&
        !path.startsWith("/dashboard/cart/"),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[45] border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-4">
        {items.map((item) => (
          <li key={item.label} className="flex min-w-0 justify-center">
            <Link
              href={item.href}
              className={cn(
                "relative flex w-full max-w-[5.5rem] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative">
                <item.icon className="size-6" strokeWidth={item.active ? 2.25 : 2} />
                {item.badge != null && item.badge > 0 ? (
                  <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
