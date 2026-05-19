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
  ChevronDown,
  Check,
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
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      created_at: string;
      read: boolean;
      targetRole?: "admin" | "customer" | "all";
    }>
  >([
    // Admin Notifications
    {
      id: "admin-1",
      title: "New Order Received! 🛍️",
      message:
        "Order #WN-90240 has been placed by a customer. Please verify and process ship-weight.",
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      read: false,
      targetRole: "admin",
    },
    {
      id: "admin-2",
      title: "Stock Alert: Low Inventory ⚠️",
      message: "Printed cotton kurta · Wine inventory is below 30 units. Restock suggested.",
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      targetRole: "admin",
    },
    {
      id: "admin-3",
      title: "Daily Revenue Target Met! 📈",
      message: "Store revenue has passed the LKR 50,000 threshold for today. Keep it up!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      targetRole: "admin",
    },
    {
      id: "admin-4",
      title: "System Performance 🟢",
      message:
        "All database instances, WhatsApp channels, and seeding microservices are operating fully.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
      targetRole: "admin",
    },

    // Customer Notifications
    {
      id: "user-1",
      title: "Welcome to Wanshi! 🛍️",
      message:
        "Experience modern, high-quality, lightweight shopping. Explore our latest catalog now!",
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: false,
      targetRole: "customer",
    },
    {
      id: "user-2",
      title: "Order Confirmed: #WN-90234 📦",
      message:
        "Your purchase of 'Printed cotton kurta · Wine' is being processed. Weight fee estimate verified.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read: false,
      targetRole: "customer",
    },
    {
      id: "user-3",
      title: "46% Off Discount Active 💸",
      message:
        "The seasonal discount has been applied to active product listings. Limited inventory remaining!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: false,
      targetRole: "customer",
    },
  ]);

  const currentRole = role === "admin" ? "admin" : "customer";
  const displayedNotifications = notifications.filter(
    (n) => n.targetRole === currentRole || n.targetRole === "all" || !n.targetRole,
  );

  const unreadCount = displayedNotifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.targetRole === currentRole || n.targetRole === "all" || !n.targetRole
          ? { ...n, read: true }
          : n,
      ),
    );
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const isDashboardActive = path?.startsWith("/dashboard");
  const filteredNav = isDashboardActive
    ? CUSTOMER_APP_NAV.filter((n) => n.href === "/")
    : CUSTOMER_APP_NAV;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    setMobileMenuOpen(false);
  };

  const mobileMenuTitle = !user ? "Menu" : role === "admin" ? "Admin" : "Menu";

  const showCustomerNavRail = Boolean(user && role !== "admin");
  const customerShopSearchBar = showCustomerNavRail && isCustomerShopBrowsePath(path);

  return (
    <header className="sticky top-0 z-40 border-b bg-background shadow-sm [--site-header-h:61px] sm:[--site-header-h:69px]">
      <div className="mx-auto w-full max-w-6xl flex min-w-0 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 text-xl font-extrabold tracking-tight text-primary sm:text-2xl"
          >
            Wanshi
          </Link>
          {isDashboardActive && (
            <>
              <div className="h-4 w-px bg-border md:block hidden" />
              <Link
                href="/"
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors md:flex hidden items-center gap-1.5 bg-muted/40 hover:bg-muted/70 px-3 py-1.5 rounded-full border animate-fade-in"
              >
                <Home className="size-3.5" aria-hidden />
                <span>Back to Shop</span>
              </Link>
            </>
          )}
        </div>
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
        ) : null}

        <div className="ms-auto flex shrink-0 items-center gap-1">
          {user ? (
            <>
              <div className="hidden items-center gap-1 md:flex md:gap-2">
                {role === "admin" ? (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2.5 relative">
                          <Bell className="size-4" />
                          {unreadCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground shadow-sm">
                              {unreadCount}
                            </span>
                          )}
                          <span className="sr-only">Notifications</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-80 p-0 sm:w-96 rounded-2xl shadow-xl border-border/80 overflow-hidden"
                      >
                        <div className="border-b p-4 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                <Bell className="size-4 text-primary" /> Notifications
                              </h3>
                              {unreadCount > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  You have {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={markAllAsRead}
                                  className="text-[10px] text-primary hover:text-primary-hover font-semibold px-2 py-1 h-auto rounded-md bg-primary-soft/45 hover:bg-primary-soft"
                                >
                                  Mark all read
                                </Button>
                              )}
                              <span className="text-[10px] bg-primary-soft text-primary font-bold px-2 py-0.5 rounded-full">
                                Admin Demo
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                          {displayedNotifications && displayedNotifications.length > 0 ? (
                            displayedNotifications.map((n) => (
                              <div
                                key={n.id}
                                className={cn(
                                  "rounded-xl border p-3 text-left transition-all relative group flex flex-col gap-1.5",
                                  n.read
                                    ? "bg-card border-border/60 hover:bg-muted/30"
                                    : "bg-primary-soft/10 border-primary/20 hover:bg-primary-soft/15",
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    {!n.read && (
                                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                                    )}
                                    <p
                                      className={cn(
                                        "text-xs font-bold",
                                        n.read ? "text-foreground" : "text-primary",
                                      )}
                                    >
                                      {n.title}
                                    </p>
                                  </div>
                                  {!n.read && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => markAsRead(n.id)}
                                      className="size-6 rounded-lg opacity-80 hover:opacity-100 hover:bg-primary-soft"
                                      title="Mark as read"
                                    >
                                      <Check className="size-3 text-primary" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed pr-6">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground/80">
                                  {new Date(n.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
                              <p className="font-medium text-foreground">All caught up! 🎉</p>
                              <p>No new admin notifications.</p>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="relative shrink-0 rounded-xl"
                          aria-label="Notifications"
                        >
                          <Bell className="size-4" />
                          {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground shadow-sm">
                              {unreadCount}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-80 p-0 sm:w-96 rounded-2xl shadow-xl border-border/80 overflow-hidden"
                      >
                        <div className="border-b p-4 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                <Bell className="size-4 text-primary" /> Notifications
                              </h3>
                              {unreadCount > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  You have {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={markAllAsRead}
                                  className="text-[10px] text-primary hover:text-primary-hover font-semibold px-2 py-1 h-auto rounded-md bg-primary-soft/45 hover:bg-primary-soft"
                                >
                                  Mark all read
                                </Button>
                              )}
                              <span className="text-[10px] bg-primary-soft text-primary font-bold px-2 py-0.5 rounded-full">
                                Demo Store
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                          {displayedNotifications && displayedNotifications.length > 0 ? (
                            displayedNotifications.map((n) => (
                              <div
                                key={n.id}
                                className={cn(
                                  "rounded-xl border p-3 text-left transition-all relative group flex flex-col gap-1.5",
                                  n.read
                                    ? "bg-card border-border/60 hover:bg-muted/30"
                                    : "bg-primary-soft/10 border-primary/20 hover:bg-primary-soft/15",
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    {!n.read && (
                                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                                    )}
                                    <p
                                      className={cn(
                                        "text-xs font-bold",
                                        n.read ? "text-foreground" : "text-primary",
                                      )}
                                    >
                                      {n.title}
                                    </p>
                                  </div>
                                  {!n.read && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => markAsRead(n.id)}
                                      className="size-6 rounded-lg opacity-80 hover:opacity-100 hover:bg-primary-soft"
                                      title="Mark as read"
                                    >
                                      <Check className="size-3 text-primary" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed pr-6">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground/80">
                                  {new Date(n.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
                              <p className="font-medium text-foreground">All caught up! 🎉</p>
                              <p>No new notifications at this time.</p>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                )}

                {/* Unified User Account Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 rounded-xl"
                      aria-label="Account Menu"
                    >
                      <UserIcon className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-56 p-2 rounded-2xl shadow-xl border-border/80 bg-background/95 backdrop-blur-md z-[55] animate-in fade-in-50 zoom-in-95"
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 border-b border-border/40 pb-2 mb-1.5 flex flex-col gap-0.5">
                      <span className="font-bold text-foreground truncate">
                        {user.app_metadata?.full_name || "Customer"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        className="justify-start h-9 w-full rounded-xl px-3 text-xs font-semibold gap-2 text-foreground hover:bg-muted/60"
                      >
                        <Link href={role === "admin" ? "/admin" : "/dashboard"}>
                          <LayoutDashboard className="size-3.5 text-primary" />
                          <span>{role === "admin" ? "Admin Panel" : "Dashboard"}</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start h-9 w-full rounded-xl px-3 text-xs font-semibold gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => void handleSignOut()}
                      >
                        <LogOut className="size-3.5" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href="/login">
                <UserIcon className="size-4" /> Login
              </Link>
            </Button>
          )}

          {user && role !== "admin" ? (
            <Button
              asChild
              variant="outline"
              size="icon"
              className={cn(
                "relative size-11 shrink-0 rounded-2xl border-border/70 bg-background shadow-sm md:hidden",
                "text-primary hover:bg-primary-soft hover:text-primary [&_svg]:size-5",
              )}
              aria-label="Cart"
            >
              <Link href="/dashboard/cart">
                <ShoppingCart strokeWidth={2.25} aria-hidden />
                {count > 0 && (
                  <span className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            </Button>
          ) : null}

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
                    <Collapsible
                      open={mobileNotificationsOpen}
                      onOpenChange={setMobileNotificationsOpen}
                      className="w-full animate-fade-in"
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 font-medium transition-all duration-200 ease-out",
                            "motion-safe:active:scale-[0.99]",
                            mobileNotificationsOpen
                              ? "border-primary text-primary"
                              : "border-transparent text-foreground hover:border-primary/25 hover:bg-primary-soft/35",
                          )}
                        >
                          <Bell className="size-[1.2rem] shrink-0" strokeWidth={2} aria-hidden />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="ml-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                              {unreadCount}
                            </span>
                          )}
                          <ChevronDown
                            className={cn(
                              "ml-1 size-4 transition-transform duration-200",
                              mobileNotificationsOpen && "rotate-180",
                            )}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2 px-2 pb-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllAsRead();
                            }}
                            className="w-full text-right text-xs font-bold text-primary hover:underline pb-2 px-1"
                          >
                            Mark all as read
                          </button>
                        )}
                        {displayedNotifications && displayedNotifications.length > 0 ? (
                          displayedNotifications.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                "rounded-xl border p-3 text-left transition-all relative flex flex-col gap-1.5",
                                n.read
                                  ? "bg-card border-border/60"
                                  : "bg-primary-soft/10 border-primary/20",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {!n.read && (
                                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                                  )}
                                  <p
                                    className={cn(
                                      "text-xs font-bold",
                                      n.read ? "text-foreground" : "text-primary",
                                    )}
                                  >
                                    {n.title}
                                  </p>
                                </div>
                                {!n.read && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(n.id);
                                    }}
                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                  >
                                    <Check className="size-3" /> Mark read
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border bg-card/30 p-4 text-center text-xs text-muted-foreground">
                            No notifications yet
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                ) : user ? (
                  <>
                    {filteredNav.map((n) => {
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
                    <Collapsible
                      open={mobileNotificationsOpen}
                      onOpenChange={setMobileNotificationsOpen}
                      className="w-full animate-fade-in"
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 font-medium transition-all duration-200 ease-out",
                            "motion-safe:active:scale-[0.99]",
                            mobileNotificationsOpen
                              ? "border-primary text-primary"
                              : "border-transparent text-foreground hover:border-primary/25 hover:bg-primary-soft/35",
                          )}
                        >
                          <Bell className="size-[1.2rem] shrink-0" strokeWidth={2} aria-hidden />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="ml-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                              {unreadCount}
                            </span>
                          )}
                          <ChevronDown
                            className={cn(
                              "ml-1 size-4 transition-transform duration-200",
                              mobileNotificationsOpen && "rotate-180",
                            )}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2 px-2 pb-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllAsRead();
                            }}
                            className="w-full text-right text-xs font-bold text-primary hover:underline pb-2 px-1"
                          >
                            Mark all as read
                          </button>
                        )}
                        {displayedNotifications && displayedNotifications.length > 0 ? (
                          displayedNotifications.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                "rounded-xl border p-3 text-left transition-all relative flex flex-col gap-1.5",
                                n.read
                                  ? "bg-card border-border/60"
                                  : "bg-primary-soft/10 border-primary/20",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {!n.read && (
                                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                                  )}
                                  <p
                                    className={cn(
                                      "text-xs font-bold",
                                      n.read ? "text-foreground" : "text-primary",
                                    )}
                                  >
                                    {n.title}
                                  </p>
                                </div>
                                {!n.read && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(n.id);
                                    }}
                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                  >
                                    <Check className="size-3" /> Mark read
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border bg-card/30 p-4 text-center text-xs text-muted-foreground">
                            No notifications yet
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
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
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-3 pt-2">
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
