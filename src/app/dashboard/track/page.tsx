"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import { Truck, CheckCircle2, Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { listOrders, subscribeOrders } from "@/lib/mock/orders-store";

const STEPS = [
  { key: "Pending", label: "Order Placed", icon: Clock },
  { key: "Accepted", label: "Accepted", icon: Package },
  { key: "In-Transit", label: "In Transit", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

function stepIndex(status: string) {
  const i = STEPS.findIndex((s) => s.key === status);
  return i < 0 ? 0 : i;
}

export default function TrackPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => subscribeOrders(() => qc.invalidateQueries({ queryKey: ["demo-track"] })), [qc]);

  const { data: orders } = useQuery({
    queryKey: ["demo-track", user?.id],
    enabled: !!user,
    queryFn: async () => listOrders(user!.id).filter((o) => o.status !== "Delivered"),
  });

  if (!orders?.length)
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No active shipments.
      </div>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Track Order</h1>
      {orders.map((o) => {
        const idx = stepIndex(o.status);
        const ship = o.shipments?.[0];
        return (
          <div key={o.id} className="rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Order #{o.order_number}</p>
                {ship && (
                  <p className="text-xs text-muted-foreground">
                    {ship.delivery_partners?.name} · {ship.tracking_number}
                  </p>
                )}
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="mt-6 flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex flex-1 flex-col items-center">
                  <div
                    className={cn(
                      "grid size-10 place-items-center rounded-full border-2",
                      i <= idx
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-muted text-muted-foreground",
                    )}
                  >
                    <s.icon className="size-5" />
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-[11px]",
                      i <= idx ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            {ship?.estimated_delivery && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Estimated delivery:{" "}
                <span className="font-medium text-foreground">{ship.estimated_delivery}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
