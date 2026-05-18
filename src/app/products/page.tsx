import { Suspense } from "react";
import ProductsIndexContent from "./products-index-content";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading Products..." className="py-24" />}>
      <ProductsIndexContent />
    </Suspense>
  );
}
