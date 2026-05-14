import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { Package, ShoppingBag, IndianRupee, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, customers] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount,status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const totalRevenue = (orders.data ?? []).reduce(
        (s, o) => s + Number(o.total_amount ?? 0),
        0,
      );
      return {
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        revenue: totalRevenue,
        customers: customers.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Total Revenue", value: inr(stats?.revenue ?? 0), icon: IndianRupee },
    { label: "Orders", value: stats?.orders ?? 0, icon: ShoppingBag },
    { label: "Products", value: stats?.products ?? 0, icon: Package },
    { label: "Customers", value: stats?.customers ?? 0, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="size-5 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Use the side menu to manage products, categories, orders, and promotional banners.
        </p>
      </div>
    </div>
  );
}