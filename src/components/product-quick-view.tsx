"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProductQuickViewContext } from "@/components/product-quick-view-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { inr, discountPct } from "@/lib/format";
import { toast } from "sonner";
import { ExternalLink, ShoppingCart } from "lucide-react";

export function ProductQuickViewProvider({ children }: { children: ReactNode }) {
  const [productId, setProductId] = useState<string | null>(null);
  const openProduct = useCallback((id: string) => setProductId(id), []);

  return (
    <ProductQuickViewContext.Provider value={{ openProduct }}>
      {children}
      {productId ? (
        <ProductQuickViewDialog productId={productId} onClose={() => setProductId(null)} />
      ) : null}
    </ProductQuickViewContext.Provider>
  );
}

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  original_price?: number | string | null;
  image_url?: string | null;
  stock_quantity?: number | null;
};

function ProductQuickViewDialog({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const mobile = useIsMobile();
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();
      return data as ProductRow | null;
    },
  });

  const title = p?.name ?? "Product";

  if (mobile) {
    return (
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="bottom"
          className="flex max-h-[92vh] flex-col gap-0 rounded-t-xl px-4 pb-6 pt-4"
        >
          <SheetHeader className="shrink-0 space-y-2 text-left">
            <SheetTitle className="line-clamp-2 pr-8 text-left text-base">{title}</SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-3 min-h-0 max-h-[58vh] flex-1 pr-3">
            <QuickBody productId={productId} isLoading={isLoading} product={p} />
          </ScrollArea>
          <SheetFooter className="mt-3 shrink-0 gap-2 border-t pt-3">
            <Button variant="secondary" className="w-full" type="button" onClick={onClose}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-0 border-b px-6 pb-4 pt-6">
          <DialogTitle className="line-clamp-2 pr-8 text-left text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-6 pb-4 pt-4">
          <QuickBody productId={productId} isLoading={isLoading} product={p} />
        </div>
        <DialogFooter className="gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground" type="button" asChild>
            <Link to="/products/$id" params={{ id: productId }} onClick={onClose}>
              Full product page <ExternalLink className="ml-1 inline size-3 opacity-70" />
            </Link>
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuickBody({
  productId,
  isLoading,
  product,
}: {
  productId: string;
  isLoading: boolean;
  product: ProductRow | null | undefined;
}) {
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>;
  }
  if (!product) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Product not found.</p>;
  }

  const stock = Number(product.stock_quantity ?? 0);
  const out = stock <= 0;
  const price = Number(product.price);
  const off = discountPct(price, Number(product.original_price));

  const requireLogin = () => {
    if (!user) {
      toast("Please log in to continue");
      nav({ to: "/login" });
      return false;
    }
    return true;
  };

  const addToCart = () => {
    if (!requireLogin() || out) return;
    cart.add({
      id: product.id,
      name: product.name,
      price,
      image_url: product.image_url,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_minmax(0,1fr)] sm:gap-8 sm:items-start">
      <div className="overflow-hidden rounded-xl border bg-secondary/30">
        <img
          src={product.image_url ?? "https://placehold.co/400"}
          alt={product.name}
          className="aspect-[4/3] w-full object-cover object-center sm:aspect-[6/7]"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        {product.description?.trim() && (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            <Separator />
          </>
        )}

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-3xl font-bold tracking-tight text-primary">{inr(price)}</span>
            {product.original_price && (
              <span className="text-base text-muted-foreground line-through">
                {inr(product.original_price)}
              </span>
            )}
          </div>
          {off > 0 && (
            <span className="mt-2 inline-flex rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
              {off}% off
            </span>
          )}
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">
            Stock:{" "}
            {out ? (
              <span className="font-medium text-destructive">Out of stock</span>
            ) : (
              <>{stock}</>
            )}
          </p>
          <Button
            className="mt-5 w-full gap-2 sm:mt-6"
            type="button"
            size="lg"
            disabled={out}
            onClick={addToCart}
          >
            <ShoppingCart className="size-4 shrink-0" /> Add to cart
          </Button>
        </div>

        {/* Mobile-only link; desktop has footer link */}
        <Button
          variant="link"
          size="sm"
          className="h-auto justify-start px-0 text-muted-foreground sm:hidden"
          asChild
        >
          <Link to="/products/$id" params={{ id: productId }}>
            View full page <ExternalLink className="ml-1 inline size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
