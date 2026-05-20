"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { inr, discountPct } from "@/lib/format";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  weight_kg?: number | string | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
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
    cart.add({
      id: p.id,
      name: p.name,
      price,
      image_url: p.image_url,
      weight_kg: Number(p.weight_kg ?? 1),
    });
    toast.success("Added to cart");
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-2 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/20">
      <Link
        href={`/products/${p.id}`}
        className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40">
          <img
            src={p.image_url ?? "https://placehold.co/400?text=No+Image"}
            alt={p.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/400?text=No+Image";
            }}
            className="h-full w-full object-cover transition-transform duration-[1000ms] group-hover:scale-105"
          />
          {off > 0 && (
            <span className="absolute top-2 left-2 z-10 rounded-lg bg-primary/95 text-[9px] font-extrabold uppercase tracking-wider text-primary-foreground px-2 py-0.5 shadow-sm">
              {off}% OFF
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2 pb-2 sm:p-2.5 sm:pb-2">
          <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-semibold leading-snug text-foreground/90 group-hover:text-primary transition-colors duration-300 sm:text-sm">
            {p.name}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <span className="text-[13px] font-extrabold leading-none text-primary sm:text-sm">
              {inr(price)}
            </span>
            {orig && (
              <span className="text-[10px] leading-none text-muted-foreground line-through sm:text-xs">
                {inr(orig)}
              </span>
            )}
          </div>
          <div className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] font-extrabold text-amber-600 border border-amber-400/15">
            {rating} <Star className="size-2.5 fill-current" />
          </div>
        </div>
      </Link>
      <div className="mt-auto px-1 pb-1 pt-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-full gap-1.5 rounded-xl px-2 text-xs border-border/80 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 active:scale-95 shadow-sm"
          disabled={out}
          onClick={addToCart}
        >
          <ShoppingCart className="size-3.5 shrink-0" />
          {out ? "Out of Stock" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
