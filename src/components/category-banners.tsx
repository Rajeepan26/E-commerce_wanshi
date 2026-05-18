import Link from "next/link";
import { SHOP_CATEGORY_BANNERS } from "@/lib/mock/category-metadata";
import { cn } from "@/lib/utils";

export function CategoryBanners() {
  return (
    <section className="my-12">
      <div className="flex flex-col items-center text-center mb-6">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Shop by Category
        </h2>
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
          Curated collections for your premium wardrobe
        </p>
        <div className="h-0.5 w-8 bg-primary/30 mt-2 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {SHOP_CATEGORY_BANNERS.map((c, i) => (
          <Link
            key={c.slug}
            href={`/products?category=${encodeURIComponent(c.slug)}`}
            className={cn(
              "group relative aspect-[3/2] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-500",
              "hover:-translate-y-1 hover:shadow-xl hover:border-primary/20 motion-safe:active:scale-[0.99]",
              i === 0 ? "animate-in fade-in-50 slide-in-from-bottom-2 duration-500" :
              i === 1 ? "animate-in fade-in-50 slide-in-from-bottom-3 duration-600" :
              i === 2 ? "animate-in fade-in-50 slide-in-from-bottom-4 duration-700" :
              "animate-in fade-in-50 slide-in-from-bottom-5 duration-800"
            )}
          >
            <img
              src={c.bannerUrl}
              alt={c.name}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-left">
              <p className="text-sm font-extrabold leading-snug text-white sm:text-base tracking-tight">{c.name}</p>
              <p className="mt-0.5 text-[10px] text-white/90 font-medium inline-flex items-center gap-1">
                Shop now
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
