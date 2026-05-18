"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { categoryHeadingFromSlug } from "@/lib/category-display";
import { cloneProductsActive, getCategoryBySlug } from "@/lib/mock/catalog-store";

export function CategoryClient() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: category } = useQuery({
    queryKey: ["demo-category", slug],
    queryFn: async () => getCategoryBySlug(slug) ?? null,
  });

  const { data: products } = useQuery({
    queryKey: ["demo-products-category", category?.id],
    enabled: !!category?.id,
    queryFn: async () =>
      cloneProductsActive({
        categoryId: category!.id,
        limit: 120,
      }),
  });

  if (!category)
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container mx-auto flex-1 min-w-0 px-4 py-6 text-center">
          <p className="text-muted-foreground">Category not found.</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            Browse products
          </Link>
        </main>
        <SiteFooter />
        <WhatsappFab />
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex-1 min-w-0 px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
          {categoryHeadingFromSlug(slug)}
        </h1>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                p={{
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  original_price: p.original_price,
                  image_url: p.image_url,
                  stock_quantity: p.stock_quantity,
                  weight_kg: p.weight_kg,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No products found in this category.
          </p>
        )}
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
