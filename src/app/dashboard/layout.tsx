"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, Package, Truck, Bell, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/track", label: "Track Order", icon: Truck },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  if (loading || !user) return <div className="p-8">Loading…</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="container mx-auto grid min-w-0 flex-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:flex md:h-fit md:flex-col md:gap-1 md:rounded-lg md:border md:bg-card md:p-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition md:w-full",
                path === n.href ? "bg-primary-soft font-medium text-primary" : "hover:bg-accent",
              )}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition hover:bg-accent hover:text-destructive md:w-full"
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
