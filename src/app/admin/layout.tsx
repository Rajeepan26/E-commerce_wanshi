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
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (role !== "admin") router.replace("/dashboard/profile");
  }, [user, role, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  if (loading || !user || role !== "admin") return <div className="p-8">Loading…</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="container mx-auto grid min-w-0 flex-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:flex md:h-fit md:flex-col md:gap-1 md:rounded-lg md:border md:bg-card md:p-2">
          {ADMIN_NAV.map((n) => {
            const activeNav = isAdminNavActive(path, n);

            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition md:w-full",
                  activeNav ? "bg-primary-soft font-medium text-primary" : "hover:bg-accent",
                )}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition hover:bg-accent hover:text-destructive md:w-full"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
