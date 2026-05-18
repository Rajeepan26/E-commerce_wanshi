import Link from "next/link";
import { SHOP_CATEGORY_BANNERS } from "@/lib/mock/category-metadata";

export function CategoryBanners() {
  return (
    <section className="my-8">
      <h2 className="mb-3 text-lg font-bold text-foreground sm:text-xl">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {SHOP_CATEGORY_BANNERS.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${encodeURIComponent(c.slug)}`}
            className="group relative aspect-[3/2] overflow-hidden rounded-lg border bg-card transition hover:shadow-lg"
          >
            <img
              src={c.bannerUrl}
              alt={c.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
              <p className="text-sm font-bold leading-snug text-white sm:text-base">{c.name}</p>
              <p className="mt-0.5 text-xs text-white/80">Shop now →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
