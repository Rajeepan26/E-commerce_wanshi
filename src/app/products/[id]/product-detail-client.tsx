"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ProductPricingColumn,
  ProductShippingInfoPanel,
} from "@/components/product-order-estimate-card";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { cloneProduct, cloneProductsActive } from "@/lib/mock/catalog-store";
import { ProductCard } from "@/components/product-card";
import { discountPct } from "@/lib/format";
import { toast } from "sonner";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export function ProductDetailClient() {
  const params = useParams();
  const id = params.id as string;

  const { data: p, isLoading } = useQuery({
    queryKey: ["demo-product", id],
    queryFn: async () => cloneProduct(id) ?? null,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["demo-related-products", p?.category_id, id],
    queryFn: async () => {
      if (!p?.category_id) return [];
      const active = cloneProductsActive({ categoryId: p.category_id });
      return active.filter((x) => x.id !== id).slice(0, 4);
    },
    enabled: !!p?.category_id,
  });

  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative flex items-center justify-center">
          {/* Animated Ambient Glow */}
          <div className="absolute size-12 rounded-full bg-primary/10 blur-xl animate-pulse" />
          {/* Outer Rotating Premium Spinner Ring */}
          <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase animate-pulse">
          Loading Details...
        </p>
      </div>
    );
  }

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
    <div className="space-y-12">
      {/* Breadcrumbs & Dynamic Back Button */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-foreground/90 font-semibold line-clamp-1 max-w-[200px] sm:max-w-[300px]">
            {p.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="group flex items-center justify-center size-8 rounded-full border border-border/80 bg-card text-muted-foreground hover:text-primary hover:border-primary/20 hover:shadow-sm transition-all duration-300 active:scale-95"
            title="Back to Catalog"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            Back to Catalog
          </span>
        </div>
      </div>

      {/* Main Product Layout Details */}
      <div className="grid gap-6 py-2 sm:gap-8 sm:py-4 md:grid-cols-2 md:gap-10 md:items-start">
        {/* Left Column: Product Image Only */}
        <div className="flex flex-col gap-4">
          <img
            src={p.image_url ?? ""}
            alt={p.name}
            className="aspect-square w-full max-w-xl rounded-2xl border border-border/60 bg-muted/20 object-cover md:max-w-none shadow-sm"
          />
        </div>
        
        {/* Right Column: Title, Description, Price Card, and Shipping Details */}
        <div className="min-w-0 space-y-6">
          <div>
            <h1 className="text-xl font-bold leading-tight sm:text-2xl text-foreground">{p.name}</h1>
            {p.description?.trim() && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            )}
          </div>
          <div>
            <ProductPricingColumn
              priceInr={Number(p.price)}
              originalPriceInr={p.original_price}
              discountPct={off}
              weightKg={weightKg}
              showTotal={false}
              addToCartSlot={
                <Button
                  size="lg"
                  className="w-full gap-2 sm:w-auto rounded-xl"
                  type="button"
                  disabled={stock <= 0}
                  onClick={addToCart}
                >
                  <ShoppingCart className="size-4" /> Add to cart
                </Button>
              }
            />
          </div>
          
          {/* Shipping Panel moved to the right side of the image */}
          <ProductShippingInfoPanel weightKg={weightKg} stock={stock} outOfStock={stock <= 0} />
        </div>
      </div>

      {/* Related Products Recommendation Shelf */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t pt-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Related Products
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Explore other popular picks in the same category
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} p={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
