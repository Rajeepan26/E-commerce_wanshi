import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { User, ShoppingCart, Package, Truck, Bell, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

const NAV = [
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/orders", label: "My Orders", icon: Package },
  { to: "/dashboard/track", label: "Track Order", icon: Truck },
  { to: "/dashboard/notifications", label: "Notification", icon: Bell },
] as const;

function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  const handleLogout = async () => {
    await signOut();
    nav({ to: "/" });
  };

  if (loading || !user) return <div className="p-8">Loading…</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="flex-1 container mx-auto grid gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-lg border bg-card p-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                path === n.to
                  ? "bg-primary-soft font-medium text-primary"
                  : "hover:bg-accent",
              )}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent text-destructive hover:text-destructive"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </aside>
        <main><Outlet /></main>
      </div>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}