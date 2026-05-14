import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { inr, discountPct } from "@/lib/format";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetailPage,
  head: () => ({
    meta: [{ title: "Product — Wanshi" }],
  }),
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () =>
      (await supabase.from("products").select("*").eq("id", id).maybeSingle()).data,
  });
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  if (isLoading) return <div className="py-12 text-muted-foreground">Loading…</div>;
  if (!p) return <div className="py-12 text-muted-foreground">Not found.</div>;
  const off = discountPct(Number(p.price), Number(p.original_price));

  const requireLogin = () => {
    if (!user) {
      toast("Please log in to continue");
      nav({ to: "/login" });
      return false;
    }
    return true;
  };

  return (
    <div className="grid gap-8 py-4 md:grid-cols-2 md:gap-10">
      <img
        src={p.image_url ?? ""}
        alt={p.name}
        className="aspect-square w-full rounded-lg border bg-secondary object-cover"
      />
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">{inr(p.price)}</span>
          {p.original_price && (
            <span className="text-base text-muted-foreground line-through">
              {inr(p.original_price)}
            </span>
          )}
          {off > 0 && (
            <span className="rounded bg-success/15 px-2 py-1 text-sm font-semibold text-success">
              {off}% OFF
            </span>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">In stock: {p.stock_quantity}</p>
        <div className="mt-6">
          <Button
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={() => {
              if (!requireLogin()) return;
              cart.add({
                id: p.id,
                name: p.name,
                price: Number(p.price),
                image_url: p.image_url,
              });
              toast.success("Added to cart");
            }}
          >
            <ShoppingCart className="size-4" /> Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
