"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import { inr } from "@/lib/format";
import { listOrders, subscribeOrders } from "@/lib/mock/orders-store";
import { Package } from "lucide-react";

export default function OrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(
    () => subscribeOrders(() => qc.invalidateQueries({ queryKey: ["demo-my-orders"] })),
    [qc],
  );

  const { data: orders, isLoading } = useQuery({
    queryKey: ["demo-my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => listOrders(user!.id),
  });

  if (isLoading) return <div className="rounded-lg border bg-card p-6">Loading…</div>;

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
      <h1 className="text-xl font-bold">My Orders</h1>
      {orders.map((o) => (
        <div key={o.id} className="rounded-lg border bg-card p-4">
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
                <span className="shrink-0">{inr(Number(it.price_at_purchase) * it.quantity)}</span>
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
  );
}
