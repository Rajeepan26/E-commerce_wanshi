"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import { inr } from "@/lib/format";
import { listOrders, subscribeOrders, updateOrderStatus } from "@/lib/mock/orders-store";
import { addCustomerReview } from "@/lib/mock/customer-reviews-store";
import { ReviewDialog, type ReviewData } from "@/components/review-dialog";
import { Package, Search, X, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { LoadingSpinner } from "@/components/loading-spinner";

export default function OrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    orderId: string;
    productName: string;
  } | null>(null);
  const [cancelOrderDialog, setCancelOrderDialog] = useState<{
    open: boolean;
    orderId: string;
  } | null>(null);

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

  const handleReviewSubmit = async (review: ReviewData) => {
    try {
      await addCustomerReview(
        review.orderId,
        user!.id,
        review.productName,
        review.rating,
        review.comment,
        user?.email,
        user?.app_metadata?.full_name,
      );
      setReviewDialog(null);
      qc.invalidateQueries({ queryKey: ["customer-reviews"] });
    } catch (error) {
      toast.error("Failed to submit review");
      throw error;
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderDialog) return;
    try {
      const ok = updateOrderStatus(cancelOrderDialog.orderId, "Cancelled");
      if (ok) {
        toast.success("Order cancelled successfully");
        qc.invalidateQueries({ queryKey: ["demo-my-orders"] });
      } else {
        toast.error("Could not cancel order");
      }
      setCancelOrderDialog(null);
    } catch (error) {
      toast.error("An error occurred while cancelling the order");
    }
  };

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
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  {o.status === "Pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      onClick={() => setCancelOrderDialog({ open: true, orderId: o.id })}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {o.order_items?.map((it) => (
                  <div key={it.id} className="space-y-1">
                    <div className="flex min-w-0 justify-between gap-3">
                      <span className="min-w-0 break-words">
                        {it.product_name} × {it.quantity}
                      </span>
                      <span className="shrink-0">
                        {inr(Number(it.price_at_purchase) * it.quantity)}
                      </span>
                    </div>
                    {o.status === "Delivered" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-[10px] h-7 px-3 text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        onClick={() =>
                          setReviewDialog({
                            open: true,
                            orderId: o.id,
                            productName: it.product_name,
                          })
                        }
                      >
                        <Star className="size-3 fill-current" />
                        Review
                      </Button>
                    )}
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

      {reviewDialog && (
        <ReviewDialog
          orderId={reviewDialog.orderId}
          productName={reviewDialog.productName}
          open={reviewDialog.open}
          onClose={() => setReviewDialog(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <AlertDialog
        open={Boolean(cancelOrderDialog?.open)}
        onOpenChange={(open) => !open && setCancelOrderDialog(null)}
      >
        <AlertDialogContent className="rounded-2xl border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              Cancel Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone and will
              return the items to stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
