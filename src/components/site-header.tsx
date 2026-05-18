"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Search,
  Home,
  Menu,
  X,
  Package,
  Truck,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Suspense, useState } from "react";
import { ADMIN_NAV, isAdminNavActive } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { ShopSearchBar, isCustomerShopBrowsePath } from "@/components/shop-search-bar";

/** Logged-in customer: nav in main bar; shop search row on home, products, and category pages (md+). */
const CUSTOMER_APP_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/track", label: "Track order", icon: Truck },
];

export function isCustomerNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const path = usePathname();
  const { user, role, signOut } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    setMobileMenuOpen(false);
  };

  const mobileMenuTitle = !user ? "Menu" : role === "admin" ? "Admin" : "Menu";

  const showCustomerNavRail = Boolean(user && role !== "admin");
  const customerShopSearchBar = showCustomerNavRail && isCustomerShopBrowsePath(path);

  return (
    <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
      <div className="container mx-auto flex min-w-0 items-center gap-2 px-4 py-2 sm:gap-3 sm:py-3">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-primary sm:text-2xl"
        >
          Wanshi
        </Link>
        {!showCustomerNavRail ? (
          <Suspense
            fallback={
              <div className="hidden min-w-0 flex-1 animate-pulse md:block" aria-hidden>
                <div className="mx-auto h-10 max-w-2xl rounded-full bg-muted/70" />
              </div>
            }
          >
            <ShopSearchBar variant="inline" />
          </Suspense>
        ) : (
          <nav
            className="hidden min-w-0 flex-1 items-center justify-center md:flex"
            aria-label="Dashboard and shop"
          >
            <div className="flex max-w-full flex-wrap justify-center gap-1.5 sm:gap-2">
              {CUSTOMER_APP_NAV.map((n) => {
                const active = isCustomerNavActive(path, n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <n.icon className="size-3.5 sm:size-4" aria-hidden />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        <div className="ms-auto flex shrink-0 items-center gap-1">
          {user ? (
            <>
              <div className="hidden items-center gap-1 md:flex md:gap-2">
                {role === "admin" ? (
                  <>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/admin">
                        <LayoutDashboard className="size-4" /> Admin
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="px-2.5">
                      <Link href="/dashboard/notifications" aria-label="Notifications">
                        <Bell className="size-4" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="relative shrink-0 rounded-xl"
                    >
                      <Link href="/dashboard/cart" aria-label="Cart">
                        <ShoppingCart className="size-4" />
                        {count > 0 && (
                          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="shrink-0 rounded-xl">
                      <Link href="/dashboard/notifications" aria-label="Notifications">
                        <Bell className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="shrink-0 rounded-xl">
                      <Link href="/dashboard/profile" aria-label="Profile">
                        <UserIcon className="size-4" />
                      </Link>
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl"
                  onClick={() => void handleSignOut()}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href="/login">
                <UserIcon className="size-4" /> Login
              </Link>
            </Button>
          )}

          <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "size-11 shrink-0 rounded-2xl border-border/70 bg-background shadow-sm md:hidden",
                "text-primary hover:bg-primary-soft hover:text-primary",
              )}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <span className="relative grid size-5 shrink-0 place-items-center [&_svg]:col-start-1 [&_svg]:row-start-1 [&_svg]:size-5">
                <Menu
                  className={cn(
                    "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                    mobileMenuOpen ? "pointer-events-none scale-95 opacity-0" : "opacity-100",
                  )}
                  aria-hidden
                  strokeWidth={2.25}
                />
                <X
                  className={cn(
                    "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                    mobileMenuOpen ? "opacity-100" : "pointer-events-none scale-95 opacity-0",
                  )}
                  aria-hidden
                  strokeWidth={2.25}
                />
              </span>
            </Button>
            <DialogContent
              showCloseButton={false}
              overlayClassName={cn(
                "z-[60] bg-black/45 backdrop-blur-[2px]",
                "fixed inset-x-0 bottom-0 data-[state=open]:animate-in data-[state=closed]:animate-out",
                "top-[61px] sm:top-[69px]",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300 ease-out",
              )}
              className={cn(
                "fixed z-[61] flex max-h-[min(32rem,calc(100dvh-5rem))] w-[min(22rem,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden",
                "left-1/2 -translate-x-1/2 translate-y-0 rounded-[2rem] border-0 bg-card p-0",
                "top-[61px] sm:top-[69px]",
                "origin-top shadow-[0_20px_60px_-24px_rgba(79,70,229,0.5)] duration-300 ease-out",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]",
                "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
              )}
            >
              <DialogHeader className="space-y-1 border-b border-border/70 px-6 pb-5 pt-6 text-center">
                <DialogTitle className="text-center text-xl font-bold tracking-tight text-foreground">
                  {mobileMenuTitle}
                </DialogTitle>
                {user ? (
                  <p className="text-center text-sm text-muted-foreground">
                    {user.app_metadata?.full_name ?? user.email ?? "Signed in"}
                  </p>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Sign in to manage orders and your cart
                  </p>
                )}
              </DialogHeader>
              <nav
                className={cn(
                  "flex max-h-[min(22rem,calc(100dvh-14rem))] flex-col gap-1.5 overflow-y-auto overscroll-contain px-5 py-6",
                  "text-[15px] tracking-tight",
                  role === "admin" ? "font-sans" : "font-serif",
                )}
              >
                {user && role === "admin" ? (
                  <>
                    {ADMIN_NAV.map((n) => {
                      const active = isAdminNavActive(path, n);
                      return (
                        <Link
                          key={n.href}
                          href={n.href}
                          className={cn(
                            "flex items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 font-medium transition-all duration-200 ease-out",
                            "motion-safe:active:scale-[0.99]",
                            active
                              ? "border-primary text-primary"
                              : "border-transparent text-foreground hover:border-primary/25 hover:bg-primary-soft/35",
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <n.icon
                            className="size-[1.2rem] shrink-0"
                            strokeWidth={active ? 2.25 : 2}
                            aria-hidden
                          />
                          {n.label}
                        </Link>
                      );
                    })}
                    <Link
                      href="/dashboard/notifications"
                      className={cn(
                        "flex items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 font-medium transition-all duration-200 ease-out",
                        "motion-safe:active:scale-[0.99]",
                        path === "/dashboard/notifications"
                          ? "border-primary text-primary"
                          : "border-transparent text-foreground hover:border-primary/25 hover:bg-primary-soft/35",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Bell
                        className="size-[1.2rem] shrink-0"
                        strokeWidth={path === "/dashboard/notifications" ? 2.25 : 2}
                        aria-hidden
                      />
                      Notifications
                    </Link>
                  </>
                ) : user ? (
                  <>
                    {CUSTOMER_APP_NAV.map((n) => {
                      const active = isCustomerNavActive(path, n.href);
                      return (
                        <Link
                          key={n.href}
                          href={n.href}
                          className={cn(
                            "flex items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 font-medium transition-all duration-200 ease-out",
                            "motion-safe:active:scale-[0.99]",
                            active
                              ? "border-primary text-primary"
                              : "border-transparent text-foreground hover:border-primary/25 hover:bg-primary-soft/35",
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <n.icon
                            className="size-[1.2rem] shrink-0"
                            strokeWidth={active ? 2.25 : 2}
                            aria-hidden
                          />
                          {n.label}
                        </Link>
                      );
                    })}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className={cn(
                      "flex items-center justify-center gap-2.5 rounded-full border border-primary bg-primary px-5 py-3.5 font-medium text-primary-foreground",
                      "shadow-[0_2px_14px_-4px_rgba(79,70,229,0.55)] transition-all hover:bg-primary/90 motion-safe:active:scale-[0.99]",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="size-[1.2rem] shrink-0" strokeWidth={2.25} aria-hidden />
                    Log in
                  </Link>
                )}
                {user && (
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-center gap-2.5 rounded-full border border-transparent px-5 py-3.5 font-medium text-foreground transition-all duration-200 ease-out md:hidden",
                      "hover:border-destructive/25 hover:bg-destructive/5 hover:text-destructive motion-safe:active:scale-[0.99]",
                    )}
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut className="size-[1.2rem] shrink-0" strokeWidth={2} aria-hidden />
                    Sign out
                  </button>
                )}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {customerShopSearchBar && (
        <div className="hidden border-t border-border/40 bg-muted/15 md:block">
          <div className="container mx-auto px-4 pb-3 pt-2">
            <Suspense
              fallback={
                <div
                  className="mx-auto h-10 max-w-3xl animate-pulse rounded-full bg-muted/70"
                  aria-hidden
                />
              }
            >
              <ShopSearchBar variant="belowHome" />
            </Suspense>
          </div>
        </div>
      )}
    </header>
  );
}
