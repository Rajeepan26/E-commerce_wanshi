"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cloneProduct } from "@/lib/mock/catalog-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  ProductPricingColumn,
  ProductShippingInfoPanel,
} from "@/components/product-order-estimate-card";
import { ProductQuickViewContext } from "@/components/product-quick-view-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { titleCaseCategoryLabel } from "@/lib/category-display";
import { discountPct } from "@/lib/format";
import { getCategoryById } from "@/lib/mock/catalog-store";
import { cn } from "@/lib/utils";
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

type ProductShape = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  original_price?: number | string | null;
  image_url?: string | null;
  stock_quantity?: number | null;
  weight_kg?: number | string | null;
  category_id?: string | null;
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
    queryKey: ["demo-product", productId],
    queryFn: async () => cloneProduct(productId) ?? null,
  });

  const catRow = p ? getCategoryById(p.category_id) : undefined;
  const heading = catRow?.name ? titleCaseCategoryLabel(catRow.name) : (p?.name ?? "Product");

  if (mobile) {
    return (
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="bottom"
          className="flex h-[min(92vh,44rem)] max-h-[92vh] w-full flex-col gap-0 overflow-hidden rounded-t-2xl p-0 px-4 pb-5 pt-3"
        >
          <SheetHeader className="shrink-0 space-y-1 text-left">
            <SheetTitle className="line-clamp-2 pr-9 text-left text-sm font-semibold leading-snug">
              {heading}
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col pt-2">
            <QuickBody
              compact
              mobileStacked
              productId={productId}
              isLoading={isLoading}
              product={p}
              onDismiss={onClose}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[min(94vh,46rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[42rem]">
        <DialogHeader className="shrink-0 space-y-0 border-b px-4 pb-2 pt-3">
          <DialogTitle className="line-clamp-2 pr-8 text-left text-sm font-semibold leading-snug sm:text-base">
            {heading}
          </DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
          <QuickBody
            compact
            productId={productId}
            isLoading={isLoading}
            product={p}
            onDismiss={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickBody({
  productId,
  isLoading,
  product,
  compact = false,
  mobileStacked = false,
  onDismiss,
}: {
  productId: string;
  isLoading: boolean;
  product: ProductShape | null | undefined;
  compact?: boolean;
  /** Bottom sheet only: image on top (~half height), then shipping, then price. */
  mobileStacked?: boolean;
  onDismiss?: () => void;
}) {
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <p
        className={cn(
          "text-center text-muted-foreground",
          compact ? "py-6 text-xs" : "py-12 text-sm",
        )}
      >
        Loading…
      </p>
    );
  }
  if (!product) {
    return (
      <p
        className={cn(
          "text-center text-muted-foreground",
          compact ? "py-6 text-xs" : "py-12 text-sm",
        )}
      >
        Product not found.
      </p>
    );
  }

  const stock = Number(product.stock_quantity ?? 0);
  const out = stock <= 0;
  const price = Number(product.price);
  const off = discountPct(price, Number(product.original_price));
  const weightKg = Number(product.weight_kg ?? 1);

  const requireLogin = () => {
    if (!user) {
      toast("Please log in to continue");
      router.push("/login");
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

  const descriptionBlock = product.description?.trim() ? (
    <>
      <p
        className={cn(
          "leading-snug text-muted-foreground",
          mobileStacked
            ? "line-clamp-3 text-xs leading-relaxed"
            : compact
              ? "line-clamp-2 text-[11px]"
              : "text-sm leading-relaxed",
        )}
      >
        {product.description}
      </p>
      <Separator className={compact ? "!my-0" : undefined} />
    </>
  ) : null;

  const pricingColumn = (mobileHero: boolean) => (
    <ProductPricingColumn
      compact={compact}
      priceInr={price}
      originalPriceInr={product.original_price}
      discountPct={off}
      weightKg={weightKg}
      addToCartSlot={
        <Button
          className={cn(
            "w-full",
            compact ? (mobileHero ? "h-10 gap-2 text-sm" : "h-9 gap-1.5 text-sm") : "gap-2",
          )}
          type="button"
          size={compact ? "default" : "lg"}
          disabled={out}
          onClick={addToCart}
        >
          <ShoppingCart
            className={cn("shrink-0", compact && !mobileHero ? "size-3.5" : "size-4")}
          />
          Add to cart
        </Button>
      }
    />
  );

  const fullPageLink = (
    <Button
      variant="link"
      size="sm"
      className={cn(
        "h-auto justify-start px-0 text-muted-foreground",
        mobileStacked ? "text-xs" : compact && "text-[11px] md:mt-0.5 md:text-xs",
      )}
      asChild
    >
      <Link href={`/products/${productId}`} onClick={() => onDismiss?.()}>
        Full product page <ExternalLink className="ml-1 inline size-3" />
      </Link>
    </Button>
  );

  if (compact && mobileStacked) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div className="relative h-[42vh] min-h-[13rem] max-h-[48vh] w-full shrink-0 overflow-hidden rounded-xl border bg-secondary/30">
          <img
            src={product.image_url ?? "https://placehold.co/400"}
            alt={product.name}
            className="size-full object-cover object-center"
          />
        </div>
        <ProductShippingInfoPanel
          compact={compact}
          weightKg={weightKg}
          stock={stock}
          outOfStock={out}
        />
        <div className="flex flex-col gap-3">
          {descriptionBlock}
          {pricingColumn(true)}
          {fullPageLink}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid",
        compact
          ? "min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-stretch gap-2 md:gap-4"
          : "gap-6 sm:grid-cols-[1fr_minmax(0,1fr)] sm:gap-8 sm:items-start",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-col",
          compact ? "h-full gap-1.5 md:gap-2" : "gap-4",
        )}
      >
        <div
          className={cn(
            "overflow-hidden rounded-lg border bg-secondary/30",
            compact && "flex min-h-0 w-full min-h-[6rem] flex-1 flex-col",
          )}
        >
          <img
            src={product.image_url ?? "https://placehold.co/400"}
            alt={product.name}
            className={cn(
              "w-full object-cover object-center",
              compact
                ? "h-full min-h-0 w-full flex-1 object-cover"
                : "aspect-[4/3] sm:aspect-[6/7]",
            )}
          />
        </div>
        <div className={cn(compact && "shrink-0")}>
          <ProductShippingInfoPanel
            compact={compact}
            weightKg={weightKg}
            stock={stock}
            outOfStock={out}
          />
        </div>
      </div>

      <div className={cn("flex min-w-0 flex-col", compact ? "min-h-0 gap-2" : "gap-4")}>
        {descriptionBlock}

        {pricingColumn(false)}

        {fullPageLink}
      </div>
    </div>
  );
}
