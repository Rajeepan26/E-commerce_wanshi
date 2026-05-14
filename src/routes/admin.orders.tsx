import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_WHATSAPP, waLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const STATUSES = ["Pending", "Accepted", "In-Transit", "Delivered", "Cancelled"];

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Order updated to ${status}`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Orders</h1>
      <div className="space-y-3">
        {orders?.map((o: any) => (
          <div key={o.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Order #{o.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()} · {inr(Number(o.total_amount))}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  📍 {o.shipping_address} · 📞 {o.shipping_phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={waLink(
                      o.shipping_phone || ADMIN_WHATSAPP,
                      `Hi! Update for your Wanshi order #${o.order_number}: status is now ${o.status}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" /> Notify
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t pt-3 text-sm">
              {o.order_items?.map((it: any) => (
                <div key={it.id} className="flex justify-between text-muted-foreground">
                  <span>{it.product_name} × {it.quantity}</span>
                  <span>{inr(Number(it.price_at_purchase) * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}