"use client";

import { useQuery } from "@tanstack/react-query";
import { inr } from "@/lib/format";
import { getCatalogCounts } from "@/lib/mock/catalog-store";
import { aggregateOrderStats } from "@/lib/mock/orders-store";
import { Package, ShoppingBag, IndianRupee, Users } from "lucide-react";

function demoCustomersEstimate(): number {
  if (typeof window === "undefined") return 3;
  try {
    const profiles = JSON.parse(window.localStorage.getItem("wanshi.demo_profiles") ?? "{}") as
      | Record<string, unknown>
      | undefined;
    return Math.max(3, profiles ? Object.keys(profiles).length : 3);
  } catch {
    return 3;
  }
}

export default function AdminOverviewPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-demo-stats"],
    queryFn: async () => {
      const catalog = getCatalogCounts();
      const orders = aggregateOrderStats();
      return {
        products: catalog.products,
        orders: orders.count,
        revenue: orders.revenue,
        customers: demoCustomersEstimate(),
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
      <h1 className="text-xl font-bold sm:text-2xl">Admin Overview</h1>
      <p className="text-sm text-muted-foreground">
        Frontend demo — stats use local catalog and orders stored in your browser.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-lg"
          >
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
          Use the side menu to manage products, categories, orders, offers, advertisements, and open
          the storefront with <span className="font-medium text-foreground">Frontend</span>.
        </p>
      </div>
    </div>
  );
}
