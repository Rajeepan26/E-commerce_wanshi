import { cloneProductsActive } from "@/lib/mock/catalog-store";
import { ProductDetailClient } from "./product-detail-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return cloneProductsActive({ limit: 500 }).map((product) => ({
    id: product.id,
  }));
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
