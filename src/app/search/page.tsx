"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cloneProductsActive, cloneCategories } from "@/lib/mock/catalog-store";
import { inr } from "@/lib/format";

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  const { data: allCategories = [] } = useQuery({
    queryKey: ["demo-categories-mobile-search"],
    queryFn: async () => cloneCategories(),
  });

  const catOptions = useMemo(() => {
    return allCategories.map((c) => ({
      name: c.name.split("·")[0]?.trim() ?? c.name,
      slug: c.slug,
    }));
  }, [allCategories]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) router.replace("/products");
  }, [router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const term = q.trim();
  const termLower = term.toLowerCase();

  const products = useMemo(() => {
    if (!termLower) return [];
    return cloneProductsActive({ q: term, limit: 12 });
  }, [term, termLower]);

  const categories = useMemo(() => {
    if (!termLower) return [];
    return catOptions
      .filter(
        (c) =>
          c.name.toLowerCase().includes(termLower) || c.slug.replace(/-/g, " ").includes(termLower),
      )
      .slice(0, 6);
  }, [termLower, catOptions]);

  const goResults = (query?: string, categorySlug?: string) => {
    const params = new URLSearchParams();
    const value = (query ?? term).trim();
    if (value) params.set("q", value);
    if (categorySlug) params.set("category", categorySlug);
    router.push(params.toString() ? `/products?${params}` : "/products");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goResults();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background md:hidden">
      <header className="sticky top-0 z-10 border-b bg-background">
        <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="grid size-10 shrink-0 place-items-center rounded-full text-foreground transition hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands and more"
              className="h-11 w-full rounded-full border border-input bg-muted/30 py-2 pl-9 pr-9 text-base outline-none ring-offset-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Search products"
            />
            {q.length > 0 ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
      </header>

      <main className="flex-1 overflow-y-auto">
        {!term ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Search for products, brands, or categories
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            <li>
              <button
                type="button"
                onClick={() => goResults()}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
              >
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate text-sm">
                  Search for{" "}
                  <span className="font-medium text-foreground">&ldquo;{term}&rdquo;</span>
                </span>
              </button>
            </li>

            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/50"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{p.name}</p>
                    <p className="text-sm font-semibold text-primary">{inr(p.price)}</p>
                  </div>
                </Link>
              </li>
            ))}

            {categories.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => goResults(term, c.slug)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
                >
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-foreground">{c.name}</span>
                </button>
              </li>
            ))}

            {products.length === 0 && categories.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No matching products or categories
              </li>
            ) : null}
          </ul>
        )}
      </main>
    </div>
  );
}
