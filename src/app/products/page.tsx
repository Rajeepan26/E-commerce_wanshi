import { Suspense } from "react";
import ProductsIndexContent from "./products-index-content";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-muted-foreground">Loading…</div>}>
      <ProductsIndexContent />
    </Suspense>
  );
}
