"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  cloneProductsActive,
  getCategoryIdBySlug,
  cloneCategories,
} from "@/lib/mock/catalog-store";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export function isCustomerShopBrowsePath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/" || pathname === "/products") return true;
  return pathname.startsWith("/category/");
}

export function ShopSearchBar({ variant = "inline" }: { variant?: "inline" | "belowHome" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["demo-categories-search"],
    queryFn: async () => cloneCategories(),
  });

  const catOptions = useMemo(() => {
    return categories.map((c) => ({
      name: c.name.split("·")[0]?.trim() ?? c.name,
      slug: c.slug,
    }));
  }, [categories]);

  useEffect(() => {
    if (pathname === "/products") {
      setQ(searchParams.get("q") ?? "");
      setCategorySlug(searchParams.get("category") ?? "");
      return;
    }
    if (pathname.startsWith("/category/")) {
      const slug = pathname.slice("/category/".length).split("/")[0] ?? "";
      setCategorySlug(slug);
      setQ("");
      return;
    }
    if (pathname === "/") {
      setQ("");
      setCategorySlug("");
      return;
    }
    setQ("");
    setCategorySlug("");
  }, [pathname, searchParams]);

  const term = q.trim();

  const productSuggestions = useMemo(() => {
    if (!term) return [];
    const catId = categorySlug ? getCategoryIdBySlug(categorySlug) : undefined;
    return cloneProductsActive({ q: term, categoryId: catId, limit: 8 });
  }, [term, categorySlug]);

  const buildProductsHref = (categoryOverride?: string) => {
    const slug = categoryOverride ?? categorySlug;
    if (slug && !term) return `/category/${slug}`;
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    if (slug) params.set("category", slug);
    return params.toString() ? `/products?${params}` : "/products";
  };

  const applyCategoryNavigate = (slug: string) => {
    setCategorySlug(slug);
    setSuggestionsOpen(false);
    router.push(buildProductsHref(slug));
    setCategoriesOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionsOpen(false);
    router.push(buildProductsHref());
  };

  const currentCategoryLabel =
    categorySlug !== ""
      ? (catOptions.find((c) => c.slug === categorySlug)?.name ?? "Category")
      : "All categories";

  const showSuggestions = suggestionsOpen && term.length > 0;

  return (
    <div
      className={cn(
        "relative hidden md:block",
        variant === "inline" && "min-w-0 flex-1",
        variant === "belowHome" && "mx-auto w-full max-w-3xl",
      )}
    >
      <form onSubmit={submitSearch} aria-label="Search and filter products">
        <div className="mx-auto flex h-10 w-full max-w-2xl flex-nowrap items-stretch rounded-full border border-input bg-background shadow-sm ring-offset-background transition-[box-shadow] focus-within:ring-2 focus-within:ring-ring">
          <div className="relative min-w-0 flex-[1_1_80%]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
              placeholder="Search products, brands and more"
              className="h-10 rounded-l-full rounded-r-none border-0 bg-transparent pl-9 pr-2 shadow-none focus-visible:ring-0"
              aria-label="Search products"
              aria-expanded={showSuggestions}
              aria-controls="header-search-suggestions"
            />
          </div>
          <div
            className="relative flex-[0_0_20%] min-w-[7.5rem] max-w-[30%]"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              type="button"
              className="flex h-full w-full items-center justify-center gap-1 rounded-r-full border-l border-input bg-muted/40 px-2 text-xs font-medium text-foreground outline-none transition hover:bg-muted/55 sm:gap-1.5 sm:px-3 sm:text-sm"
              aria-expanded={categoriesOpen}
              aria-haspopup="menu"
            >
              <span className="truncate text-left">{currentCategoryLabel}</span>
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 opacity-70 transition-transform sm:size-4",
                  categoriesOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {categoriesOpen ? (
              <div className="absolute right-0 top-full z-[110] min-w-[12.5rem] max-w-[min(18rem,calc(100vw-3rem))] rounded-xl border bg-popover p-1 pt-2 shadow-lg">
                <button
                  type="button"
                  className="flex w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-accent"
                  onClick={() => applyCategoryNavigate("")}
                >
                  All categories
                </button>
                {catOptions.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    className={cn(
                      "flex w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-accent",
                      categorySlug === c.slug && "bg-accent/60 font-medium",
                    )}
                    onClick={() => applyCategoryNavigate(c.slug)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </form>

      {showSuggestions ? (
        <div
          id="header-search-suggestions"
          className="absolute left-0 right-0 top-full z-[110] mt-1 max-h-80 overflow-y-auto rounded-xl border bg-background shadow-lg"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 border-b px-4 py-2.5 text-left text-sm transition hover:bg-muted/50"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => router.push(buildProductsHref())}
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <span>
              Search for <span className="font-medium">&ldquo;{term}&rdquo;</span>
            </span>
          </button>
          <ul className="divide-y divide-border/60">
            {productSuggestions.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-muted/50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSuggestionsOpen(false)}
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt=""
                      className="size-10 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-10 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{p.name}</p>
                    <p className="text-sm font-semibold text-primary">{inr(p.price)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {productSuggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No matching products</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
