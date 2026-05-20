"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { categoryHeadingFromSlug } from "@/lib/category-display";
import {
  cloneProductsActive,
  getCategoryIdBySlug,
  cloneActiveAds,
  cloneCategories,
} from "@/lib/mock/catalog-store";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { Check, SlidersHorizontal, RefreshCw, X, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProductsIndexContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const catId = category ? getCategoryIdBySlug(category) : undefined;

  // Filters State
  const [priceRange, setPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const { data: ads } = useQuery({
    queryKey: ["demo-ads", "catalog"],
    queryFn: async () => cloneActiveAds(),
  });

  const { data: products } = useQuery({
    queryKey: ["demo-products", q, catId],
    queryFn: async () =>
      cloneProductsActive({
        q,
        categoryId: catId,
        limit: 60,
      }),
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let items = [...products];

    // Filter by Price Range
    if (priceRange === "under-500") {
      items = items.filter((p) => p.price < 500);
    } else if (priceRange === "500-1000") {
      items = items.filter((p) => p.price >= 500 && p.price <= 1000);
    } else if (priceRange === "1000-2000") {
      items = items.filter((p) => p.price >= 1000 && p.price <= 2000);
    } else if (priceRange === "over-2000") {
      items = items.filter((p) => p.price > 2000);
    }

    // Filter by Availability
    if (inStockOnly) {
      items = items.filter((p) => p.stock_quantity > 0);
    }

    // Sort by criteria
    if (sortBy === "price-asc") {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount-desc") {
      items.sort((a, b) => {
        const discA = (a.original_price ?? a.price) - a.price;
        const discB = (b.original_price ?? b.price) - b.price;
        return discB - discA;
      });
    }

    return items;
  }, [products, priceRange, inStockOnly, sortBy]);

  const handleCategorySelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    setPriceRange("all");
    setInStockOnly(false);
    setSortBy("relevance");
    handleCategorySelect(null);
  };

  const hasFilters = priceRange !== "all" || inStockOnly || sortBy !== "relevance" || category;

  const { data: categoriesData = [] } = useQuery({
    queryKey: ["demo-categories-list"],
    queryFn: async () => cloneCategories(),
  });

  const renderFiltersList = () => (
    <>
      {/* Category List Filter */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        <div className="flex flex-col gap-1 text-sm">
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={cn(
              "text-left px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-between",
              !category
                ? "bg-primary-soft/15 text-primary"
                : "text-foreground/80 hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <span>All Categories</span>
            {!category && <Check className="size-3.5" />}
          </button>
          {categoriesData.map((cat) => {
            const active = category === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={cn(
                  "text-left px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-between",
                  active
                    ? "bg-primary-soft/15 text-primary"
                    : "text-foreground/80 hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="truncate">{cat.name}</span>
                {active && <Check className="size-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Ranges Filter */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Price Range
        </h3>
        <div className="flex flex-col gap-1 text-sm">
          {[
            { label: "All Prices", value: "all" },
            { label: "Under LKR 500", value: "under-500" },
            { label: "LKR 500 - LKR 1,000", value: "500-1000" },
            { label: "LKR 1,000 - LKR 2,000", value: "1000-2000" },
            { label: "Over LKR 2,000", value: "over-2000" },
          ].map((range) => {
            const active = priceRange === range.value;
            return (
              <button
                key={range.value}
                type="button"
                onClick={() => setPriceRange(range.value)}
                className={cn(
                  "text-left px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-between",
                  active
                    ? "bg-primary-soft/15 text-primary"
                    : "text-foreground/80 hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span>{range.label}</span>
                {active && <Check className="size-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Switch */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 px-2 py-1 text-sm font-medium cursor-pointer text-foreground/80 hover:text-foreground">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Sort order options */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Sort By
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 px-3 text-sm placeholder-muted-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        >
          <option value="relevance">Popularity / Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="discount-desc">Biggest Discount</option>
        </select>
      </div>

      {/* Sidebar Active Promotional Ad */}
      {ads && ads.filter((a) => a.position === "sidebar" && a.is_active).length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sponsor
          </h3>
          {ads
            .filter((a) => a.position === "sidebar" && a.is_active)
            .slice(0, 1)
            .map((ad) => (
              <div
                key={ad.id}
                className="relative overflow-hidden rounded-xl border bg-card/60 shadow-sm p-3 group hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-28 w-full overflow-hidden rounded-lg">
                  {ad.image_url ? (
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400?text=Sponsor";
                      }}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary-soft/10 via-primary-soft/30 to-background flex items-center justify-center p-4">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                        Wanshi Promo
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2 text-left">
                    <h4 className="text-[11px] font-bold text-white leading-tight pr-2 drop-shadow-sm">
                      {ad.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </>
  );

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start relative">
      {/* Desktop Left Sidebar Filter Panel */}
      <aside className="hidden lg:block lg:col-span-3 rounded-2xl border bg-card p-5 shadow-sm space-y-6 lg:sticky lg:top-20">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>Filters</span>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="size-3" /> Clear all
            </button>
          )}
        </div>
        {renderFiltersList()}
      </aside>

      {/* Mobile Floating Sticky Filter Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2.5 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 backdrop-blur-sm transition active:scale-95 border border-primary-foreground/10"
        >
          <SlidersHorizontal className="size-4" />
          <span>Filters & Sort</span>
          {hasFilters && (
            <span className="flex size-4.5 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-extrabold text-primary px-1.5">
              •
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Drawer Panel */}
          <div className="relative flex h-full w-full max-w-xs flex-col border-l bg-card p-5 shadow-2xl animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <SlidersHorizontal className="size-4 text-primary" />
                <span>Filters & Sort</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6">{renderFiltersList()}</div>

            <div className="border-t pt-4 mt-auto flex gap-2">
              {hasFilters && (
                <Button
                  variant="outline"
                  className="w-1/3 text-xs"
                  onClick={() => {
                    handleClearAll();
                    setShowMobileFilters(false);
                  }}
                >
                  Reset
                </Button>
              )}
              <Button
                className={cn("text-xs flex-1", !hasFilters && "w-full")}
                onClick={() => setShowMobileFilters(false)}
              >
                Show {filteredProducts.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Right Product Grid */}
      <section className="lg:col-span-9 space-y-4">
        <div className="flex flex-col gap-2">
          {/* Back to Home & Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground/90 font-semibold">Catalog</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="group flex items-center justify-center size-8 rounded-full border border-border/80 bg-card text-muted-foreground hover:text-primary hover:border-primary/20 hover:shadow-sm transition-all duration-300 active:scale-95"
                title="Back to Home"
              >
                <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <h1 className="text-xl font-bold tracking-tight">
                {q
                  ? `Results for "${q}"`
                  : category
                    ? categoryHeadingFromSlug(category)
                    : "All products"}
              </h1>
            </div>

            <div className="flex flex-1 min-w-[200px] max-w-md items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search in catalog..."
                  defaultValue={q ?? ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      const params = new URLSearchParams(searchParams.toString());
                      if (val) params.set("q", val);
                      else params.delete("q");
                      router.push(`${pathname}?${params.toString()}`);
                    }
                  }}
                  className="pl-9 h-9 rounded-xl border-border/60 bg-muted/30 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-semibold bg-muted/60 px-3 py-1 rounded-full">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}{" "}
              found
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center animate-fade-in">
            <SlidersHorizontal className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-3 font-semibold text-foreground">No matching products found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try clearing your filters or category choice
            </p>
            <button
              type="button"
              onClick={handleClearAll}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/95"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
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
        )}
      </section>
    </div>
  );
}
