import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import { inr } from "@/lib/format";
import { Package } from "lucide-react";

export const Route = createFileRoute("/dashboard/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (isLoading) return <div className="rounded-lg border bg-card p-6">Loading…</div>;

  if (!orders || orders.length === 0)
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <Package className="mx-auto size-12 text-muted-foreground" />
        <p className="mt-3 font-medium">No orders yet</p>
        <Link to="/products" className="mt-3 inline-block text-sm text-primary hover:underline">
          Start shopping →
        </Link>
      </div>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Orders</h1>
      {orders.map((o: any) => (
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
            {o.order_items?.map((it: any) => (
              <div key={it.id} className="flex justify-between">
                <span>{it.product_name} × {it.quantity}</span>
                <span>{inr(Number(it.price_at_purchase) * it.quantity)}</span>
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