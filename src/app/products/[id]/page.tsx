import { cloneProductsActive } from "@/lib/mock/catalog-store";
import { ProductDetailClient } from "./product-detail-client";

export const dynamicParams = true;

export function generateStaticParams() {
  return cloneProductsActive({ limit: 50 }).map((product) => ({
    id: product.id,
  }));
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
