"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ProductPricingColumn,
  ProductShippingInfoPanel,
} from "@/components/product-order-estimate-card";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { cloneProduct } from "@/lib/mock/catalog-store";
import { discountPct } from "@/lib/format";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

export function ProductDetailClient() {
  const params = useParams();
  const id = params.id as string;
  const { data: p, isLoading } = useQuery({
    queryKey: ["demo-product", id],
    queryFn: async () => cloneProduct(id) ?? null,
  });
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (isLoading) return <div className="py-12 text-muted-foreground">Loading...</div>;
  if (!p) return <div className="py-12 text-muted-foreground">Not found.</div>;
  const off = discountPct(Number(p.price), Number(p.original_price));
  const stock = Number(p.stock_quantity ?? 0);
  const weightKg = Number(p.weight_kg ?? 1);

  const requireLogin = () => {
    if (!user) {
      toast("Please log in to continue");
      router.push("/login");
      return false;
    }
    return true;
  };

  const addToCart = () => {
    if (!requireLogin() || stock <= 0) return;
    cart.add({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      image_url: p.image_url,
      weight_kg: weightKg,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="grid gap-6 py-2 sm:gap-8 sm:py-4 md:grid-cols-2 md:gap-10 md:items-start">
      <div className="flex flex-col gap-4">
        <img
          src={p.image_url ?? ""}
          alt={p.name}
          className="aspect-square w-full max-w-xl rounded-lg border bg-secondary object-cover md:max-w-none"
        />
        <ProductShippingInfoPanel weightKg={weightKg} stock={stock} outOfStock={stock <= 0} />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight sm:text-2xl">{p.name}</h1>
        {p.description?.trim() && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
        )}
        <div className="mt-6">
          <ProductPricingColumn
            priceInr={Number(p.price)}
            originalPriceInr={p.original_price}
            discountPct={off}
            weightKg={weightKg}
            addToCartSlot={
              <Button
                size="lg"
                className="w-full gap-2 sm:w-auto"
                type="button"
                disabled={stock <= 0}
                onClick={addToCart}
              >
                <ShoppingCart className="size-4" /> Add to cart
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
