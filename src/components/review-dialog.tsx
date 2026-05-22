"use client";

import { useState } from "react";
import { Star, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export type ReviewData = {
  orderId: string;
  productName: string;
  rating: number;
  comment: string;
};

export function ReviewDialog({
  orderId,
  productName,
  open,
  onClose,
  onSubmit,
}: {
  orderId: string;
  productName: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewData) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    setSubmitting(true);
    try {
      onSubmit({
        orderId,
        productName,
        rating,
        comment: comment.trim(),
      });
      setRating(0);
      setComment("");
      onClose();
      toast.success("Review submitted successfully");
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Write a Review</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <Label className="mb-3 block text-sm font-bold text-foreground">Rating</Label>
            <div className="flex gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-110 active:scale-95 group"
                >
                  <Star
                    className={`size-9 transition-colors ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                        : "text-muted-foreground/40 group-hover:text-amber-400/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="mb-3 block text-sm font-bold text-foreground">
              Your Review
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] rounded-xl border-border bg-muted/20 focus:ring-primary/20 resize-none text-sm"
              maxLength={500}
            />
            <p className="mt-1.5 text-[10px] font-medium text-muted-foreground text-right uppercase tracking-wider">
              {comment.length} / 500 characters
            </p>
          </div>

        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
