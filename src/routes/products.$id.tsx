import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { inr, discountPct } from "@/lib/format";
import { toast } from "sonner";
import { ShoppingCart, Zap } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () =>
      (await supabase.from("products").select("*").eq("id", id).maybeSingle()).data,
  });
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  if (isLoading) return <div className="p-8">Loading…</div>;
  if (!p) return <div className="p-8">Not found.</div>;
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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto grid gap-8 px-4 py-8 md:grid-cols-2">
        <img
          src={p.image_url ?? ""}
          alt={p.name}
          className="aspect-square w-full rounded-lg border bg-secondary object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
          <div className="mt-4 flex items-baseline gap-3">
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
          <div className="mt-6 flex gap-3">
            <Button
              size="lg"
              variant="outline"
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
              <ShoppingCart className="size-4" /> Add to Cart
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (!requireLogin()) return;
                cart.add({
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  image_url: p.image_url,
                });
                nav({ to: "/dashboard/cart" });
              }}
            >
              <Zap className="size-4" /> Buy Now
            </Button>
          </div>
        </div>
      </main>
      <WhatsappFab />
    </div>
  );
}