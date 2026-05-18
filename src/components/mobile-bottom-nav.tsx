"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Search, ShoppingCart, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

function useMobileShopTabBarEligible() {
  const path = usePathname();
  if (!path) return false;
  if (path.startsWith("/admin")) {
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

/** Bottom tab bar — hidden on desktop and admin routes. */
export function MobileBottomNav() {
  const eligible = useMobileShopTabBarEligible();
  const path = usePathname();
  const { user } = useAuth();
  const { count } = useCart();

  if (!eligible || !path) return null;

  const searchActive =
    path === "/search" || path.startsWith("/products") || path.startsWith("/category/");

  const profileActive =
    path === "/login" ||
    path === "/register" ||
    (Boolean(user) &&
      path.startsWith("/dashboard") &&
      !path.startsWith("/dashboard/cart") &&
      !path.startsWith("/dashboard/notifications"));

  const tabClass = (active: boolean) =>
    cn(
      "relative flex w-full max-w-[5.5rem] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[45] border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <ul className={cn("mx-auto grid h-14 max-w-lg", user ? "grid-cols-5" : "grid-cols-3")}>
        <li className="flex min-w-0 justify-center">
          <Link href="/" className={tabClass(path === "/")}>
            <Home className="size-6" strokeWidth={path === "/" ? 2.25 : 2} />
            <span className="truncate">Home</span>
          </Link>
        </li>
        <li className="flex min-w-0 justify-center">
          <Link href="/search" className={tabClass(searchActive)}>
            <Search className="size-6" strokeWidth={searchActive ? 2.25 : 2} />
            <span className="truncate">Search</span>
          </Link>
        </li>
        {user ? (
          <>
            <li className="flex min-w-0 justify-center">
              <Link href="/dashboard/cart" className={tabClass(path.startsWith("/dashboard/cart"))}>
                <span className="relative">
                  <ShoppingCart
                    className="size-6"
                    strokeWidth={path.startsWith("/dashboard/cart") ? 2.25 : 2}
                  />
                  {count > 0 ? (
                    <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </span>
                <span className="truncate">Cart</span>
              </Link>
            </li>
            <li className="flex min-w-0 justify-center">
              <Link
                href="/dashboard/notifications"
                className={tabClass(path.startsWith("/dashboard/notifications"))}
              >
                <Bell
                  className="size-6"
                  strokeWidth={path.startsWith("/dashboard/notifications") ? 2.25 : 2}
                />
                <span className="truncate">Alerts</span>
              </Link>
            </li>
            <li className="flex min-w-0 justify-center">
              <Link href="/dashboard" className={tabClass(profileActive)}>
                <UserRound className="size-6" strokeWidth={profileActive ? 2.25 : 2} />
                <span className="truncate">Profile</span>
              </Link>
            </li>
          </>
        ) : (
          <li className="flex min-w-0 justify-center">
            <Link href="/login" className={tabClass(profileActive)}>
              <UserRound className="size-6" strokeWidth={profileActive ? 2.25 : 2} />
              <span className="truncate">Login</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
