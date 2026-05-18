"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { ProductCard } from "@/components/product-card";
import { CategoryBanners } from "@/components/category-banners";
import { SiteFooter } from "@/components/site-footer";
import { TrustBar } from "@/components/trust-bar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cloneActiveAds, cloneActiveOffers, cloneProductsActive } from "@/lib/mock/catalog-store";
import { promoScheduleBadges } from "@/lib/mock/promo-schedule";

export default function HomePage() {
  const { data: ads } = useQuery({
    queryKey: ["demo-ads", "hero"],
    queryFn: async () => cloneActiveAds(),
  });
  const { data: offers } = useQuery({
    queryKey: ["demo-offers"],
    queryFn: async () => cloneActiveOffers(),
  });
  const { data: products } = useQuery({
    queryKey: ["demo-products", "home"],
    queryFn: async () => cloneProductsActive({ limit: 12 }),
  });

  const heroAd = ads?.find((a) => a.position === "hero");
  const easyReturns = heroAd?.title?.split("|")[0]?.trim() || "Easy Returns";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex-1 min-w-0 px-4 py-6 md:py-8">
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-foreground sm:text-xl">
            Today&apos;s Top Offers
          </h2>
          <Carousel opts={{ loop: true, align: "start" }} className="w-full">
            <CarouselContent>
              {offers?.map((o) => (
                <CarouselItem key={o.id} className="basis-full">
                  <Link
                    href="/products"
                    className="group relative block overflow-hidden rounded-xl border bg-card transition hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full overflow-hidden sm:h-72 md:h-80">
                      <img
                        src={o.banner_image_url ?? ""}
                        alt={o.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-4 sm:p-10">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="inline-block w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                            Up to {o.discount_percentage}% OFF
                          </p>
                          {promoScheduleBadges(o).map((label) => (
                            <span
                              key={label}
                              className={
                                label === "New"
                                  ? "rounded-full bg-amber-400/95 px-3 py-1 text-xs font-bold text-black shadow-sm"
                                  : "rounded-full bg-orange-500/95 px-3 py-1 text-xs font-bold text-white shadow-sm"
                              }
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                        <h3 className="mt-2 text-xl font-extrabold text-white sm:mt-3 sm:text-3xl">
                          {o.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs text-white/90 sm:text-base">
                          {o.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 sm:flex sm:left-3" />
            <CarouselNext className="right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 sm:flex sm:right-3" />
          </Carousel>
        </section>

        <TrustBar easyReturnsLabel={easyReturns} className="mb-8" />

        <CategoryBanners />

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground sm:text-xl">Super Dhamaka Deals</h2>
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
                  weight_kg: p.weight_kg,
                }}
              />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/products" className="text-sm font-medium text-primary hover:underline">
              View all products →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
