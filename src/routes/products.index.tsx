import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";

type Search = { q?: string; category?: string };

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: ProductsIndexPage,
  head: () => ({ meta: [{ title: "All products — Wanshi" }] }),
});

function ProductsIndexPage() {
  const { q, category } = Route.useSearch();
  const { data: cats } = useQuery({
    queryKey: ["cat-by-slug", category],
    enabled: !!category,
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category!)
        .maybeSingle();
      return data;
    },
  });
  const catId = cats?.id;
  const { data: products } = useQuery({
    queryKey: ["products", q, catId],
    queryFn: async () => {
      let qry = supabase.from("products").select("*").eq("is_active", true);
      if (q) qry = qry.ilike("name", `%${q}%`);
      if (catId) qry = qry.eq("category_id", catId);
      const { data } = await qry.order("created_at", { ascending: false }).limit(60);
      return data ?? [];
    },
  });

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">
        {q ? `Results for "${q}"` : category ? `Category: ${category}` : "All products"}
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products?.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
      {products?.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No products found.</p>
      )}
    </>
  );
}
