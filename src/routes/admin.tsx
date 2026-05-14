import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Tag, ShoppingBag, Megaphone, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/offers", label: "Offers & Ads", icon: Megaphone },
];

function AdminLayout() {
  const { user, role, loading, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (role !== "admin") nav({ to: "/dashboard/profile" });
  }, [user, role, loading, nav]);

  const handleLogout = async () => {
    await signOut();
    nav({ to: "/" });
  };

  if (loading || !user || role !== "admin") return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-lg border bg-card p-2">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as "/admin"}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                  active ? "bg-primary-soft font-medium text-primary" : "hover:bg-accent",
                )}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
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