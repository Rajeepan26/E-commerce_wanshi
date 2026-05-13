import { Link } from "@tanstack/react-router";
import { inr, discountPct } from "@/lib/format";
import { Star } from "lucide-react";

export type ProductCardData = {
  id: string;
  name: string;
  price: number | string;
  original_price?: number | string | null;
  image_url?: string | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const price = Number(p.price);
  const orig = p.original_price ? Number(p.original_price) : undefined;
  const off = discountPct(price, orig);
  const rating = (3.5 + (price % 1.5)).toFixed(1);
  return (
    <Link
      to="/products/$id"
      params={{ id: p.id }}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-secondary">
        <img
          src={p.image_url ?? "https://placehold.co/400"}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{p.name}</h3>
        <div className="flex items-baseline gap-2">
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
        <div className="mt-1 inline-flex w-fit items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">
          {rating} <Star className="size-3 fill-current" />
        </div>
      </div>
    </Link>
  );
}