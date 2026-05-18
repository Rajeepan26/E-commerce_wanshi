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
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { SHOP_CATEGORY_BANNERS } from "@/lib/mock/category-metadata";
import { ADMIN_NAV, isAdminNavActive } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

const CATS = SHOP_CATEGORY_BANNERS.map((c) => ({
  name: c.name.split("·")[0]?.trim() ?? c.name,
  slug: c.slug,
}));

const MOBILE_ACCOUNT_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/track", label: "Track Order", icon: Truck },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
] as const;

export function SiteHeader() {
  const path = usePathname();
  const { user, role, signOut } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    setMobileMenuOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`/products${qs}`);
  };

  const mobileMenuTitle = !user ? "Menu" : role === "admin" ? "Admin" : "Your account";

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto flex min-w-0 items-center gap-2 px-4 py-2 sm:gap-3 sm:py-3">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-primary sm:text-2xl"
        >
          Wanshi
        </Link>
        <form className="hidden min-w-0 flex-1 md:block" onSubmit={submitSearch}>
          <div className="relative mx-auto max-w-2xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands and more"
              className="pl-9"
              aria-label="Search products"
            />
          </div>
        </form>
        <div className="ml-auto hidden shrink-0 items-center gap-1 md:flex md:gap-2">
          {user ? (
            <>
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
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard">
                      <UserIcon className="size-4" /> Account
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="relative">
                    <Link href="/dashboard/cart">
                      <ShoppingCart className="size-4" />
                      <span className="hidden sm:inline">Cart</span>
                      {count > 0 && (
                        <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {count}
                        </span>
                      )}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="px-2.5">
                    <Link href="/dashboard/notifications" aria-label="Notifications">
                      <Bell className="size-4" />
                    </Link>
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <UserIcon className="size-4" /> Login
              </Link>
            </Button>
          )}
        </div>
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "ml-auto size-11 shrink-0 rounded-2xl border-border/70 bg-background shadow-sm md:hidden",
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
              "fixed inset-x-0 bottom-0 top-[61px] sm:top-[69px] data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300 ease-out",
            )}
            className={cn(
              "fixed z-[61] flex max-h-[min(32rem,calc(100dvh-5rem))] w-[min(22rem,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden",
              "left-1/2 top-[61px] sm:top-[69px] -translate-x-1/2 translate-y-0 rounded-[2rem] border-0 bg-card p-0",
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
                  Sign in to manage orders
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
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-center gap-2.5 rounded-full border border-destructive/40 px-5 py-3.5 font-medium text-destructive",
                      "transition-all duration-200 ease-out hover:bg-destructive/10 motion-safe:active:scale-[0.99]",
                    )}
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut className="size-[1.2rem] shrink-0" strokeWidth={2} aria-hidden />
                    Logout
                  </button>
                </>
              ) : user ? (
                <>
                  {MOBILE_ACCOUNT_NAV.map((n) => {
                    const active = path === n.href;
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
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-center gap-2.5 rounded-full border border-destructive/40 px-5 py-3.5 font-medium text-destructive",
                      "transition-all duration-200 ease-out hover:bg-destructive/10 motion-safe:active:scale-[0.99]",
                    )}
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut className="size-[1.2rem] shrink-0" strokeWidth={2} aria-hidden />
                    Logout
                  </button>
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
            </nav>
          </DialogContent>
        </Dialog>
      </div>
      <nav
        className={cn(
          "border-t bg-secondary/40",
          path?.startsWith("/admin") ? "hidden" : "hidden md:block",
        )}
      >
        <div className="container mx-auto flex min-w-0 gap-1 overflow-x-auto px-2 py-2 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            aria-label="Home"
          >
            <Home className="size-4" /> Home
          </Link>
          {CATS.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
