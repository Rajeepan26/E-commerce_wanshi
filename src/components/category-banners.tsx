import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  { name: "Women", slug: "womens-clothing", img: "https://picsum.photos/seed/cat-women/600/400" },
  { name: "Men", slug: "mens-clothing", img: "https://picsum.photos/seed/cat-men/600/400" },
  { name: "Kids", slug: "kids-clothing", img: "https://picsum.photos/seed/cat-kids/600/400" },
  { name: "Footwear", slug: "footwear", img: "https://picsum.photos/seed/cat-footwear/600/400" },
  { name: "Beauty", slug: "beauty", img: "https://picsum.photos/seed/cat-beauty/600/400" },
  { name: "Accessories", slug: "accessories", img: "https://picsum.photos/seed/cat-acc/600/400" },
  { name: "Home & Decor", slug: "home-decor", img: "https://picsum.photos/seed/cat-home/600/400" },
  { name: "Kitchen", slug: "kitchen", img: "https://picsum.photos/seed/cat-kitchen/600/400" },
  { name: "Electronics", slug: "electronics", img: "https://picsum.photos/seed/cat-elec/600/400" },
];

export function CategoryBanners() {
  return (
    <section className="my-8">
      <h2 className="mb-3 text-xl font-bold text-foreground">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/products"
            search={{ category: c.slug }}
            className="group relative aspect-[3/2] overflow-hidden rounded-lg border bg-card transition hover:shadow-lg"
          >
            <img
              src={c.img}
              alt={c.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-base font-bold text-white">{c.name}</p>
              <p className="text-xs text-white/80">Shop now →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}