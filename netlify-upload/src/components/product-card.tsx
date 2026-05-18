"use client";

import { useRouter } from "next/navigation";
import { inr, discountPct } from "@/lib/format";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductQuickView } from "@/components/product-quick-view-context";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export type ProductCardData = {
  id: string;
  name: string;
  price: number | string;
  original_price?: number | string | null;
  image_url?: string | null;
  stock_quantity?: number | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const { openProduct } = useProductQuickView();
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const price = Number(p.price);
  const orig = p.original_price ? Number(p.original_price) : undefined;
  const off = discountPct(price, orig);
  const rating = (3.5 + (price % 1.5)).toFixed(1);
  const stock = Number(p.stock_quantity ?? 0);
  const out = stock <= 0;

  const requireLogin = () => {
    if (!user) {
      toast("Please log in to continue");
      router.push("/login");
      return false;
    }
    return true;
  };

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireLogin() || out) return;
    cart.add({ id: p.id, name: p.name, price, image_url: p.image_url });
    toast.success("Added to cart");
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:shadow-md">
      <button
        type="button"
        className="flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => openProduct(p.id)}
      >
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={p.image_url ?? "https://placehold.co/400"}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3 pb-2">
          <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground sm:text-[1.0625rem]">
            {p.name}
          </h3>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-bold text-primary">{inr(price)}</span>
            {orig && (
              <span className="text-xs text-muted-foreground line-through">{inr(orig)}</span>
            )}
            {off > 0 && (
              <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                {off}% OFF
              </span>
            )}
          </div>
          <div className="inline-flex w-fit items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">
            {rating} <Star className="size-3 fill-current" />
          </div>
        </div>
      </button>
      <div className="border-t px-2 pb-2 pt-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-full gap-2 text-xs"
          disabled={out}
          onClick={addToCart}
        >
          <ShoppingCart className="size-3.5 shrink-0" />
          Add to cart
        </Button>
      </div>
    </div>
  );
}
