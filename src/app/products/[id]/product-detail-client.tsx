"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { cloneProduct, cloneProductsActive } from "@/lib/mock/catalog-store";
import { ProductCard } from "@/components/product-card";
import { discountPct } from "@/lib/format";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ShoppingCart, ArrowLeft, Truck, Coins, Plus, Minus, Check } from "lucide-react";

export function ProductDetailClient() {
  const params = useParams();
  const id = params.id as string;

  const { data: p, isLoading } = useQuery({
    queryKey: ["demo-product", id],
    queryFn: async () => cloneProduct(id) ?? null,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["demo-related-products", p?.category_id, id],
    queryFn: async () => {
      if (!p?.category_id) return [];
      const active = cloneProductsActive({ categoryId: p.category_id });
      return active.filter((x) => x.id !== id).slice(0, 4);
    },
    enabled: !!p?.category_id,
  });

  const cart = useCart();
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const router = useRouter();

  // Interactive Product States
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("M");
  const [activeTab, setActiveTab] = useState("spec");

  if (isLoading) {
    return <LoadingSpinner message="Loading Details..." className="py-24" />;
  }

  if (!p) return <div className="py-12 text-muted-foreground">Not found.</div>;
  const price = Number(p.price);
  const orig = p.original_price ? Number(p.original_price) : undefined;
  const off = discountPct(price, orig);
  const stock = Number(p.stock_quantity ?? 0);
  const weightKg = Number(p.weight_kg ?? 1);

  // Determine if category is clothing (only show size for clothes)
  const isClothing =
    p.category_id?.includes("cloths") ||
    p.category_id?.includes("wear") ||
    p.category_id?.includes("gents") ||
    p.category_id?.includes("ladies") ||
    p.name?.toLowerCase().includes("shirt") ||
    p.name?.toLowerCase().includes("saree") ||
    p.name?.toLowerCase().includes("kurti") ||
    p.name?.toLowerCase().includes("pants") ||
    p.name?.toLowerCase().includes("denim") ||
    p.name?.toLowerCase().includes("t-shirt") ||
    p.name?.toLowerCase().includes("hoodie");

  const requireLogin = () => {
    if (!user) {
      toast("Please log in to continue");
      router.push("/login");
      return false;
    }
    return true;
  };

  const addToCart = () => {
    if (!requireLogin() || stock <= 0) return;
    for (let i = 0; i < qty; i++) {
      cart.add({
        id: p.id,
        name: p.name,
        price,
        image_url: p.image_url,
        weight_kg: weightKg,
      });
    }
    toast.success(`Added ${qty} item(s) to cart`);
  };

  return (
    <div className="space-y-12">
      {/* Breadcrumbs & Back Option */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-foreground/90 font-semibold line-clamp-1 max-w-[200px] sm:max-w-[300px]">
            {p.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="group flex items-center justify-center size-8 rounded-full border border-border/80 bg-card text-muted-foreground hover:text-primary hover:border-primary/20 hover:shadow-sm transition-all duration-300 active:scale-95"
            title="Back to Catalog"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            Back to Catalog
          </span>
        </div>
      </div>

      {/* Main E-commerce Layout Grid */}
      <div className="grid gap-8 md:grid-cols-2 md:gap-12 md:items-start">
        {/* Left Side: Product Image & variant thumbnails */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/10 p-1 shadow-sm">
            <img
              src={p.image_url ?? ""}
              alt={p.name}
              referrerPolicy="no-referrer"
              className="aspect-square w-full max-w-xl rounded-xl object-cover md:max-w-none shadow-sm hover:scale-[1.01] transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600?text=No+Image";
              }}
            />
          </div>
          {/* Thumbnails row mimicking standard premium e-commerce details */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`size-16 overflow-hidden rounded-xl border-2 bg-muted/20 p-0.5 cursor-pointer transition-all duration-300 hover:border-primary ${
                  i === 1 ? "border-primary shadow-sm" : "border-border/60"
                }`}
              >
                <img
                  src={p.image_url ?? ""}
                  alt={`variant-${i}`}
                  referrerPolicy="no-referrer"
                  className={`size-full rounded-lg object-cover ${i !== 1 ? "opacity-70 hover:opacity-100" : ""}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Options */}
        <div className="min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {p.name}
            </h1>

            {/* Orders count and stock status */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <span className="font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {stock > 0 ? `In Stock (${stock} left)` : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Clean Flat Price Section */}
          <div className="flex items-baseline gap-2.5 border-b border-t border-border/80 py-4">
            <span className="text-3xl font-extrabold tracking-tight text-primary">
              {inr(price)}
            </span>
            {orig && (
              <span className="text-base text-muted-foreground line-through font-medium">
                {inr(orig)}
              </span>
            )}
            {off > 0 && (
              <span className="ml-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 text-xs font-bold px-2 py-0.5">
                {off}% off
              </span>
            )}
          </div>

          {/* Description */}
          {p.description?.trim() && (
            <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          )}

          {/* Key Product Attributes Table (Dynamic based on Category & Admin Inputs) */}
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2">
            <div className="grid grid-cols-3 text-xs border-b border-border/40 pb-2">
              <span className="font-bold text-muted-foreground">Type:</span>
              <span className="col-span-2 text-foreground font-semibold">
                {p.product_type ||
                  (isClothing
                    ? "Casual clothing"
                    : p.category_id?.includes("electronics")
                      ? "Smart Device"
                      : "Home & Collection")}
              </span>
            </div>
            <div className="grid grid-cols-3 text-xs border-b border-border/40 pb-2">
              <span className="font-bold text-muted-foreground">
                {p.category_id?.includes("electronics") && !p.material
                  ? "Connectivity:"
                  : "Material:"}
              </span>
              <span className="col-span-2 text-foreground font-semibold">
                {p.material ||
                  (isClothing
                    ? "100% Premium Cotton"
                    : p.category_id?.includes("electronics")
                      ? "High-Speed Connection"
                      : "Certified Grade A")}
              </span>
            </div>
            <div className="grid grid-cols-3 text-xs">
              <span className="font-bold text-muted-foreground">Brand:</span>
              <span className="col-span-2 text-foreground font-semibold">
                {p.brand || "Wanshi Originals"}
              </span>
            </div>
          </div>

          {/* Size & Quantity Selectors */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            {/* Size Dropdown - ONLY shown for clothing categories */}
            {isClothing && (
              <div className="flex flex-col gap-1.5 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Select Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">X-Large (XL)</option>
                </select>
              </div>
            )}

            {/* Quantity Selector Counter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Quantity
              </label>
              <div className="flex items-center h-10 border border-border/80 rounded-xl bg-background overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="flex items-center justify-center size-10 text-muted-foreground hover:text-primary active:scale-95 transition-all"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-bold text-foreground select-none">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.min(stock, prev + 1))}
                  className="flex items-center justify-center size-10 text-muted-foreground hover:text-primary active:scale-95 transition-all"
                  disabled={qty >= stock}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid (Buy Now and Like buttons removed as requested) */}
          <div className="pt-3">
            <Button
              size="lg"
              className="w-full gap-2 rounded-xl h-12 text-sm font-semibold active:scale-95 transition-transform"
              type="button"
              disabled={stock <= 0 || isAdmin}
              onClick={addToCart}
            >
              <ShoppingCart className="size-4 shrink-0" />
              {stock <= 0 ? "Out of stock" : isAdmin ? "Admin View Only" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section & Similar Products Sidebar Grid */}
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start pt-10 border-t border-border/80">
        {/* Left: Tab Panel (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Header bar */}
          <div className="flex border-b border-border/80 gap-6">
            {[
              { id: "spec", label: "Specification" },
              { id: "shipping", label: "Shipping Info" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-bold tracking-wide uppercase transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          {activeTab === "spec" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Enjoy authentic products with Wanshi Originals. This product has been designed and
                  styled according to international quality guidelines to ensure maximum durability.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-foreground/80">
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" /> Dynamic build
                    specifications
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" /> Triple QC checked items
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" /> Full manufacturing
                    guarantees
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" /> Modern premium look &
                    feel
                  </div>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="border-b bg-muted/10">
                      <th className="px-4 py-3 font-bold text-muted-foreground w-1/3">Origin</th>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {(p as any).origin || "Sri Lanka"}
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold text-muted-foreground">Weight</th>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {weightKg.toFixed(2)} kg
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-muted/10 p-4">
                <Truck className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Express Delivery Island-wide
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Free shipping for orders over LKR 5,000. Flat rate LKR 500 for standard shipping
                    orders under the threshold. Colombo orders deliver within 1-2 business days,
                    outstation orders 2-4 days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-muted/10 p-4">
                <Coins className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paying on delivery option is fully supported. Check your items at delivery and
                    pay in cash cleanly.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
        {/* Right: Similar Items Column (col-span-1) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Similar Items
            </h3>
            <div className="space-y-3">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="group flex gap-3 rounded-xl border border-border/40 bg-muted/10 p-2.5 hover:bg-muted/20 hover:border-primary/20 transition-all duration-500 shadow-sm"
                  >
                    <div className="size-16 rounded-lg overflow-hidden bg-muted/40 shrink-0">
                      <img
                        src={item.image_url ?? "https://placehold.co/100"}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                      <h4 className="text-xs font-bold text-foreground/80 line-clamp-1 group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-xs font-extrabold text-primary">
                        {inr(Number(item.price))}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4">No matching products found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
