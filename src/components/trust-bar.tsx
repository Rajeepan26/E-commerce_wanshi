import { Truck, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type TrustBarProps = {
  /** First highlight (e.g. from hero ad copy); defaults to "Easy Returns". */
  easyReturnsLabel?: string;
  className?: string;
};

const boxStyles =
  "flex items-center justify-center gap-2 rounded-xl border border-border bg-primary-soft px-4 py-3.5 text-sm font-medium text-foreground shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary-soft/95 hover:shadow-md";

export function TrustBar({ easyReturnsLabel = "Easy Returns", className }: TrustBarProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3 sm:gap-4", className)}>
      <div className={boxStyles}>
        <span className="text-center">{easyReturnsLabel}</span>
      </div>
      <div className={boxStyles}>
        <span className="text-center">Top Rated Products</span>
      </div>
      <div className={boxStyles}>
        <span className="text-center">Cash on Delivery</span>
      </div>
    </div>
  );
}
