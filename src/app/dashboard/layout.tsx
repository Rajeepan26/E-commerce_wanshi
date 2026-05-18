"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Truck, User } from "lucide-react";

import { LoadingSpinner } from "@/components/loading-spinner";

const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/track", label: "Track order", icon: Truck },
  { href: "/dashboard/profile", label: "Profile Setting", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const isCartRoute = path?.startsWith("/dashboard/cart") ?? false;

  useEffect(() => {
    if (!loading && !user && !isCartRoute) router.replace("/login");
  }, [user, loading, router, isCartRoute]);

  if (loading) {
    return <LoadingSpinner message="Checking Account..." className="py-24" />;
  }

  if (!user && isCartRoute) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
        <SiteFooter />
        <WhatsappFab />
      </div>
    );
  }

  if (!user) {
    return <LoadingSpinner message="Redirecting..." className="py-24" />;
  }

  const isActive = (href: string, exact = false) => {
    if (!path) return false;
    if (exact) return path === href;
    return path === href || path.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {!isCartRoute && (
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Account Dashboard
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Manage your orders, profile settings, and shipping status.
                </p>
              </div>
            </div>
            <nav className="flex flex-row items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:gap-2" aria-label="Dashboard sub navigation">
              {DASHBOARD_NAV.map((n) => {
                const active = isActive(n.href, n.exact);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-tight transition-all sm:text-sm",
                      "motion-safe:active:scale-[0.98]",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "border border-border/50 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <n.icon className="size-4" aria-hidden />
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
        {children}
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
