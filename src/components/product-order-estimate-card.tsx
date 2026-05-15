"use client";

import { CheckCircle2, Info, Package, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/format";
import {
  DELIVERY_FLAT_INR,
  WEIGHT_FEE_5_TO_10KG_INR,
  WEIGHT_FEE_UNDER_5KG_INR,
  appliedWeightFeeBracketLabel,
  orderTotalWithShippingInr,
  weightHandlingFeeInr,
  weightHandlingLineLabel,
} from "@/lib/shipping-pricing";

function formatKg(w: number): string {
  if (!Number.isFinite(w) || w <= 0) return "—";
  if (w >= 10) return `${w.toFixed(0)} kg`;
  if (w >= 1) return `${w.toFixed(1)} kg`;
  return `${w.toFixed(2)} kg`;
}

/** Left column: under product image — availability, weight, published fee schedule (demo). */
export function ProductShippingInfoPanel({
  weightKg,
  stock,
  outOfStock,
  compact = false,
}: {
  weightKg: number;
  stock: number;
  outOfStock: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-gradient-to-br from-primary-soft/90 via-primary-soft/50 to-background shadow-sm ring-1 ring-primary/10",
        compact ? "p-2.5" : "rounded-2xl p-4",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {outOfStock ? (
          <span
            className={cn(
              "rounded-full bg-destructive/15 font-semibold text-destructive",
              compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
            )}
          >
            Out of stock
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-success/15 font-semibold text-success",
              compact ? "px-2 py-0.5 text-[10px]" : "gap-1.5 px-3 py-1 text-xs",
            )}
          >
            <CheckCircle2 className={cn("shrink-0", compact ? "size-3" : "size-3.5")} aria-hidden />
            In stock · {stock}
          </span>
        )}
      </div>

      <dl className={cn(compact ? "mt-2" : "mt-4", "space-y-1")}>
        <div
          className={cn(
            "flex items-baseline justify-between gap-2 border-b border-primary/20",
            compact ? "pb-2 text-[11px]" : "pb-3 text-sm",
          )}
        >
          <dt className="flex items-center gap-1.5 font-semibold text-foreground">
            <Package
              className={cn("shrink-0 text-primary", compact ? "size-3" : "size-4")}
              aria-hidden
            />
            Weight
          </dt>
          <dd className="tabular-nums text-muted-foreground">{formatKg(weightKg)}</dd>
        </div>
      </dl>

      <div className={compact ? "mt-2" : "mt-4"}>
        <p
          className={cn(
            "flex items-center gap-1.5 font-bold uppercase tracking-wide text-primary",
            compact ? "text-[9px]" : "text-xs",
          )}
        >
          <Truck className={compact ? "size-3" : "size-3.5"} aria-hidden />
          Estimate weight fee
        </p>
        <ul
          className={cn(
            "text-foreground",
            compact
              ? "mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]"
              : "mt-3 space-y-2.5 text-sm",
          )}
        >
          <li className={cn("flex gap-1.5", !compact && "gap-2.5")}>
            <span
              className={cn(
                "mt-1.5 shrink-0 rounded-full bg-primary ring-2 ring-primary/30",
                compact ? "size-1.5" : "mt-2 size-2 shadow-sm",
              )}
              aria-hidden
            />
            <span className="leading-tight">
              <span className="font-medium">0–5 kg</span>
              <span className="text-muted-foreground"> — </span>
              <span className="font-semibold tabular-nums text-primary">
                {inr(WEIGHT_FEE_UNDER_5KG_INR)}
              </span>
            </span>
          </li>
          <li className={cn("flex gap-1.5", !compact && "gap-2.5")}>
            <span
              className={cn(
                "mt-1.5 shrink-0 rounded-full bg-primary/70 ring-2 ring-primary/20",
                compact ? "size-1.5" : "mt-2 size-2 shadow-sm",
              )}
              aria-hidden
            />
            <span className="leading-tight">
              <span className="font-medium">6–10 kg</span>
              <span className="text-muted-foreground"> — </span>
              <span className="font-semibold tabular-nums text-primary">
                {inr(WEIGHT_FEE_5_TO_10KG_INR)}
              </span>
            </span>
          </li>
        </ul>
      </div>

      <div
        className={cn(
          "flex items-start gap-1.5 rounded-md border border-primary/15 bg-background/60 backdrop-blur-[2px]",
          compact ? "mt-2 px-2 py-1.5 text-[10px]" : "mt-4 px-3 py-2.5 text-sm",
        )}
      >
        <Info
          className={cn("shrink-0 text-primary", compact ? "mt-0.5 size-3" : "mt-0.5 size-4")}
          aria-hidden
        />
        <div>
          <p className="font-medium text-foreground">Delivery</p>
          <p className={cn("text-muted-foreground", compact ? "leading-tight" : "mt-0.5")}>
            Flat{" "}
            <span className="font-semibold tabular-nums text-primary">
              {inr(DELIVERY_FLAT_INR)}
            </span>
            {compact ? " all orders." : " on all orders (demo)."}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Right column: item price, extra charges, payable total. */
export function ProductPricingColumn({
  priceInr,
  originalPriceInr,
  discountPct,
  weightKg,
  addToCartSlot,
  compact = false,
}: {
  priceInr: number;
  originalPriceInr?: number | string | null;
  discountPct: number;
  weightKg: number;
  addToCartSlot?: React.ReactNode;
  compact?: boolean;
}) {
  const price = Number(priceInr);
  const orig =
    originalPriceInr != null && originalPriceInr !== "" ? Number(originalPriceInr) : null;
  const weightFee = weightHandlingFeeInr(weightKg);
  const bracket = appliedWeightFeeBracketLabel(weightKg);
  const overall = orderTotalWithShippingInr(price, weightKg);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        compact ? "p-2.5" : "p-4 sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
        <span
          className={cn("font-bold tracking-tight text-primary", compact ? "text-lg" : "text-3xl")}
        >
          {inr(price)}
        </span>
        {orig != null && orig > price && (
          <span
            className={cn("text-muted-foreground line-through", compact ? "text-xs" : "text-base")}
          >
            {inr(orig)}
          </span>
        )}
      </div>
      {discountPct > 0 && (
        <span
          className={cn(
            "mt-1 inline-flex rounded-full bg-success/15 font-semibold text-success",
            compact ? "px-2 py-0.5 text-[10px]" : "mt-2 px-2.5 py-0.5 text-xs",
          )}
        >
          {discountPct}% off
        </span>
      )}

      <div className={compact ? "mt-3" : "mt-5"}>
        <p
          className={cn(
            "font-bold uppercase tracking-wider text-muted-foreground",
            compact ? "text-[9px]" : "text-xs",
          )}
        >
          Additional
        </p>
        <div
          className={cn(
            "rounded-lg border border-border/80 bg-muted/25",
            compact ? "mt-1.5 p-2" : "mt-2 p-3 sm:p-4",
          )}
        >
          <dl className={cn(compact ? "space-y-1.5 text-[11px]" : "space-y-2.5 text-sm")}>
            <div className="flex justify-between gap-2">
              <dt className="min-w-0 text-muted-foreground">
                <span className="font-medium text-foreground">{weightHandlingLineLabel()}</span>
                <span
                  className={cn(
                    "block font-normal capitalize text-muted-foreground",
                    compact ? "text-[9px]" : "text-[11px]",
                  )}
                >
                  ({bracket})
                </span>
              </dt>
              <dd className="shrink-0 font-semibold tabular-nums text-foreground">
                {inr(weightFee)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="font-medium text-foreground">Delivery</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {inr(DELIVERY_FLAT_INR)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <Separator className={compact ? "my-2.5" : "my-4"} />
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg bg-primary-soft/70",
          compact ? "px-2 py-1.5" : "items-end px-3 py-2.5 sm:px-4",
        )}
      >
        <span className={cn("font-bold text-foreground", compact ? "text-xs" : "text-sm")}>
          Total
        </span>
        <span
          className={cn("font-bold tabular-nums text-primary", compact ? "text-base" : "text-xl")}
        >
          {inr(overall)}
        </span>
      </div>
      {!compact && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Item price + applicable weight handling + flat delivery (estimate for this product only).
        </p>
      )}
      {compact && (
        <p className="mt-1 text-[9px] leading-snug text-muted-foreground">
          Incl. handling + flat delivery (demo).
        </p>
      )}

      {addToCartSlot ? (
        <div className={compact ? "mt-2.5" : "mt-5 sm:mt-6"}>{addToCartSlot}</div>
      ) : null}
    </div>
  );
}
