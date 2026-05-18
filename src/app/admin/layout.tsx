"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, isAdminNavActive } from "@/lib/admin-nav";

import { LoadingSpinner } from "@/components/loading-spinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (role !== "admin") router.replace("/dashboard");
  }, [user, role, loading, router]);

  if (loading || !user || role !== "admin") {
    return <LoadingSpinner message="Verifying Admin Access..." className="py-24" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Admin Console
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Manage products, users, categories, orders, discount offers, and advertisements.
              </p>
            </div>
          </div>
          <nav
            className="flex flex-row items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:gap-2"
            aria-label="Admin sub navigation"
          >
            {ADMIN_NAV.map((n) => {
              const active = isAdminNavActive(path || "", n);
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
        <div className="min-w-0">{children}</div>
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
