"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { categoryHeadingFromSlug } from "@/lib/category-display";
import { cloneProductsActive, getCategoryIdBySlug } from "@/lib/mock/catalog-store";
import { ProductCard } from "@/components/product-card";

export default function ProductsIndexContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const catId = category ? getCategoryIdBySlug(category) : undefined;

  const { data: products } = useQuery({
    queryKey: ["demo-products", q, catId],
    queryFn: async () =>
      cloneProductsActive({
        q,
        categoryId: catId,
        limit: 60,
      }),
  });

  return (
    <>
      <h1 className="mb-4 text-lg font-bold sm:text-xl">
        {q ? `Results for "${q}"` : category ? categoryHeadingFromSlug(category) : "All products"}
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products?.map((p) => (
          <ProductCard
            key={p.id}
            p={{
              id: p.id,
              name: p.name,
              price: p.price,
              original_price: p.original_price,
              image_url: p.image_url,
              stock_quantity: p.stock_quantity,
            }}
          />
        ))}
      </div>
      {products?.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No products found.</p>
      )}
    </>
  );
}
