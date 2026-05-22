"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerReviews, deleteCustomerReview } from "@/lib/mock/customer-reviews-store";
import { Trash2, Star, User, Calendar } from "lucide-react";
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

export default function AdminCustomerReviewsPage() {
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: reviews = [] } = useQuery({
    queryKey: ["customer-reviews"],
    queryFn: async () => getCustomerReviews(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => deleteCustomerReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted");
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["customer-reviews"] });
    },
    onError: () => toast.error("Failed to delete review"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Reviews</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage and view all customer reviews submitted for products.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card p-12 text-center">
          <Star className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-3 font-semibold">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Customer reviews will appear here once submitted
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{review.productName}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="size-4" />
                      <span>{review.customerName || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-400/10 px-3 py-1 rounded-full">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-600">{review.rating}</span>
                </div>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-lg">
                {review.comment}
              </p>

              {review.customerEmail && (
                <p className="text-xs text-muted-foreground">
                  Email: <span className="font-mono">{review.customerEmail}</span>
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteConfirm(review.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this customer review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm) {
                  deleteMutation.mutate(deleteConfirm);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
