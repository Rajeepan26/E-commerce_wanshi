"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import { inr } from "@/lib/format";
import { listOrders, subscribeOrders } from "@/lib/mock/orders-store";
import { Package, Search, X } from "lucide-react";

import { LoadingSpinner } from "@/components/loading-spinner";

export default function OrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  useEffect(
    () => subscribeOrders(() => qc.invalidateQueries({ queryKey: ["demo-my-orders"] })),
    [qc],
  );

  const { data: orders, isLoading } = useQuery({
    queryKey: ["demo-my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => listOrders(user!.id),
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter((o) => {
      const matchNum = String(o.order_number).toLowerCase().includes(q);
      const matchStatus = o.status.toLowerCase().includes(q);
      const matchItems = o.order_items?.some((it) => it.product_name.toLowerCase().includes(q));
      return matchNum || matchStatus || matchItems;
    });
  }, [orders, search]);

  if (isLoading) {
    return <LoadingSpinner message="Syncing Orders..." className="py-12" />;
  }

  if (!orders || orders.length === 0)
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <Package className="mx-auto size-12 text-muted-foreground" />
        <p className="mt-3 font-medium">No orders yet</p>
        <Link href="/products" className="mt-3 inline-block text-sm text-primary hover:underline">
          Start shopping →
        </Link>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
        <h1 className="text-xl font-bold tracking-tight">My Orders</h1>
        <div className="relative w-full sm:max-w-xs">
          <span
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"
            aria-hidden
          >
            <Search className="size-4" />
          </span>
          <input
            type="text"
            placeholder="Search by order #, items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-card/60 py-2 pl-9 pr-8 text-sm placeholder-muted-foreground outline-none transition focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center animate-fade-in">
          <Package className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-3 font-semibold text-foreground">No matching orders found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search keywords</p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 text-xs font-semibold text-primary hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {o.order_items?.map((it) => (
                  <div key={it.id} className="flex min-w-0 justify-between gap-3">
                    <span className="min-w-0 break-words">
                      {it.product_name} × {it.quantity}
                    </span>
                    <span className="shrink-0">
                      {inr(Number(it.price_at_purchase) * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">{inr(Number(o.total_amount))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
