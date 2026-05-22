"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { MessageCircle, CheckCircle2 } from "lucide-react";
import {
  listOrders,
  subscribeOrders,
  updateOrderStatus,
  acceptOrder,
} from "@/lib/mock/orders-store";
import { LogisticsDialog } from "@/components/admin/logistics-dialog";
import type { OrderStatus, StoredOrder } from "@/lib/mock/types";

const STATUSES = ["Pending", "Accepted", "In-Transit", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(
    () => subscribeOrders(() => qc.invalidateQueries({ queryKey: ["demo-admin-orders"] })),
    [qc],
  );

  const { data: orders } = useQuery({
    queryKey: ["demo-admin-orders"],
    queryFn: async () => listOrders(),
  });

  const [acceptingOrder, setAcceptingOrder] = useState<StoredOrder | null>(null);

  // Pagination
  const totalPages = Math.ceil((orders?.length ?? 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders?.slice(startIndex, endIndex);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    qc.invalidateQueries({ queryKey: ["demo-admin-orders"] });
    qc.invalidateQueries({ queryKey: ["demo-my-orders"] });
    qc.invalidateQueries({ queryKey: ["demo-track"] });
    toast.success(`Order updated to ${status}`);
  };

  const handleAccept = (method: "local" | "regional") => {
    if (!acceptingOrder) return;
    acceptOrder(acceptingOrder.id, method);

    const serviceName =
      method === "local" ? "3rd Party Dedicated Delivery" : "Parcel Courier Service";
    const waMessage = `Your order #${acceptingOrder.order_number} has been accepted and is being handled by ${serviceName}.`;

    qc.invalidateQueries({ queryKey: ["demo-admin-orders"] });
    toast.success("Order Accepted", {
      description: `Delivery via ${method === "local" ? "Local API" : "Regional Parcel"}.`,
    });

    // Automated notification prompt
    const link = waLink(acceptingOrder.shipping_phone || ADMIN_WHATSAPP, waMessage);
    window.open(link, "_blank");

    setAcceptingOrder(null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Orders</h1>
      <div className="space-y-3">
        {paginatedOrders?.map((o) => (
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
                {o.status === "Pending" ? (
                  <Button size="sm" className="h-8 gap-2" onClick={() => setAcceptingOrder(o)}>
                    <CheckCircle2 className="size-3.5" /> Accept Order
                  </Button>
                ) : (
                  <Select
                    value={o.status}
                    onValueChange={(v) => handleStatusChange(o.id, v as OrderStatus)}
                  >
                    <SelectTrigger className="h-8 w-full max-w-[11rem] sm:w-36">
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
                )}
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
            {o.delivery_method && (
              <div className="mt-2 text-[11px] font-medium text-primary uppercase tracking-wider">
                🚚 Fulfilled via:{" "}
                {o.delivery_method === "local" ? "Local Rider" : "Regional Courier"}
              </div>
            )}
            <div className="mt-3 space-y-1 border-t pt-3 text-sm">
              {o.order_items?.map((it) => (
                <div key={it.id} className="flex justify-between text-muted-foreground">
                  <span>
                    {it.product_name} × {it.quantity}
                  </span>
                  <span>{inr(Number(it.price_at_purchase) * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, orders?.length ?? 0)} of{" "}
            {orders?.length ?? 0} orders
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <LogisticsDialog
        open={!!acceptingOrder}
        onOpenChange={(o) => !o && setAcceptingOrder(null)}
        onSelect={handleAccept}
      />
    </div>
  );
}
