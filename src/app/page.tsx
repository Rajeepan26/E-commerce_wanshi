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
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  cloneActiveAds,
  cloneActiveOffers,
  cloneProductsActive,
  getPromoUrl,
} from "@/lib/mock/catalog-store";
import { promoScheduleBadges } from "@/lib/mock/promo-schedule";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();

  const heroAd = ads?.find((a) => a.position === "hero");
  const easyReturns = heroAd?.title?.split("|")[0]?.trim() || "Easy Returns";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      {heroAd && heroAd.is_active && (
        <div className="bg-primary/95 text-primary-foreground py-2 px-4 text-center text-xs font-semibold tracking-wide shadow-sm border-b border-primary/25 relative overflow-hidden backdrop-blur-sm animate-fade-in flex items-center justify-center gap-1.5">
          <span className="font-bold tracking-normal">{heroAd.title}</span>
        </div>
      )}
      <main className="mx-auto w-full max-w-7xl flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Curated Luxury Brand Banner Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 mt-4 space-y-2 animate-in fade-in-50 slide-in-from-bottom-3 duration-1000">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Discover Sri Lankan Elegance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-semibold max-w-lg mx-auto">
            Premium Wear • Crafted for Comfort • Lean Pricing
          </p>
          <div className="h-0.5 w-12 bg-primary/45 mx-auto mt-3 rounded-full" />
        </div>

        {/* Dynamic Top Offers Carousel Banner */}
        <section className="mb-12">
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Today's Top Offers
            </h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
              Handpicked seasonal discount campaigns and promotions
            </p>
            <div className="h-0.5 w-8 bg-primary/30 mt-2 rounded-full" />
          </div>

          <Carousel
            opts={{ loop: true, align: "start" }}
            plugins={[Autoplay({ delay: 2000 })]}
            className="w-full relative group"
          >
            <CarouselContent>
              {/* Combine Offers and Hero Ads in Carousel */}
              {[
                ...(offers?.map((o) => ({ ...o, type: "offer" as const })) ?? []),
                ...(ads
                  ?.filter((a) => a.position === "hero" && a.image_url && a.is_active)
                  .map((a) => ({ ...a, type: "ad" as const })) ?? []),
              ].map((item) => (
                <CarouselItem key={item.id} className="basis-full">
                  <Link
                    href={getPromoUrl(item as any)}
                    className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-500 shadow-sm hover:shadow-xl hover:border-primary/20"
                  >
                    <div className="relative h-56 w-full overflow-hidden sm:h-80 md:h-[400px]">
                      <img
                        src={(item as any).banner_image_url || (item as any).image_url || ""}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/800?text=Promo+Image";
                        }}
                        className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 sm:p-12 text-left z-10 animate-in fade-in-50 slide-in-from-left-6 duration-1000">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.type === "offer" ? (
                            <p className="inline-block w-fit rounded-full bg-primary/95 px-3.5 py-1 text-[10px] font-extrabold text-primary-foreground uppercase tracking-widest shadow-md">
                              Up to {(item as any).discount_percentage}% OFF
                            </p>
                          ) : (
                            <p className="inline-block w-fit rounded-full bg-primary/95 px-3.5 py-1 text-[10px] font-extrabold text-primary-foreground uppercase tracking-widest shadow-md">
                              Featured Selection
                            </p>
                          )}
                          {promoScheduleBadges(item as any).map((label) => (
                            <span
                              key={label}
                              className={
                                label === "New"
                                  ? "rounded-full bg-amber-400 px-3.5 py-1 text-[10px] font-extrabold text-black shadow-md uppercase tracking-wider"
                                  : "rounded-full bg-orange-500 px-3.5 py-1 text-[10px] font-extrabold text-white shadow-md uppercase tracking-wider"
                              }
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                        <h3 className="mt-3 text-2xl font-extrabold text-white sm:mt-4 sm:text-4xl md:text-5xl leading-tight tracking-tight drop-shadow-md">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs text-white/80 sm:text-base max-w-md font-medium leading-relaxed">
                          {(item as any).description || "Exclusive limited time collection."}
                        </p>
                        <div className="mt-5 sm:mt-6">
                          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black shadow-lg transition-all duration-300 hover:bg-primary hover:text-white motion-safe:active:scale-95 group-hover:shadow-primary/10">
                            Explore Collection
                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                              →
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full border-border/80 bg-background/80 backdrop-blur-sm sm:flex sm:left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CarouselNext className="right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full border-border/80 bg-background/80 backdrop-blur-sm sm:flex sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <CarouselDots />
            </div>
          </Carousel>
        </section>

        {/* New Banner Section (Task 2 & 3) */}
        <section className="mb-12 animate-in fade-in-50 slide-in-from-bottom-3 duration-1000">
          <div className="bg-[#f5f5f5] rounded-[2.5rem] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm border border-border/40">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Shopping made easy
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-md">
                Enjoy reliability, secure deliveries and hassle-free returns.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-black text-white px-10 py-7 text-sm font-bold hover:bg-black/90 shadow-lg transform transition-transform hover:scale-105 active:scale-95"
            >
              <Link href={user ? "/products" : "/login?redirect=/products"}>Start now</Link>
            </Button>
          </div>
        </section>

        <CategoryBanners />

        {/* Active Banner Advertisements */}
        {ads && ads.filter((a) => a.position === "banner" && a.is_active).length > 0 && (
          <section className="my-12">
            <div className="flex flex-col items-center text-center mb-6">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Featured Promotions
              </h2>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                Special limited period campaigns and brand announcements
              </p>
              <div className="h-0.5 w-8 bg-primary/30 mt-2 rounded-full" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {ads
                .filter((a) => (a.position === "banner" || a.position === "sidebar") && a.is_active)
                .map((ad, i) => (
                  <Link
                    href={getPromoUrl(ad)}
                    key={ad.id}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm group hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/25 transition-all duration-500",
                      i === 0
                        ? "animate-in fade-in-50 slide-in-from-left-4 duration-700"
                        : "animate-in fade-in-50 slide-in-from-right-4 duration-700",
                    )}
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      {ad.image_url ? (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/600?text=Ad+Banner";
                          }}
                          className="h-full w-full object-cover group-hover:scale-[1.025] transition-transform duration-[1000ms]"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-soft/30 via-primary-soft/10 to-background flex items-center justify-center p-6 border-b border-border/40">
                          <span className="text-xs font-extrabold text-primary tracking-widest uppercase">
                            Wanshi Promotion
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-left flex flex-col gap-1 z-10">
                        <span className="text-[9px] w-fit font-extrabold bg-primary/95 text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Special Offer
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-sm truncate">
                          {ad.title}
                        </h3>
                        {ad.ends_at ? (
                          <p className="text-[9px] text-white/80 font-medium">
                            Ends soon • Valid until:{" "}
                            {new Date(ad.ends_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        ) : (
                          <p className="text-[9px] text-white/80 font-medium">
                            Exclusive Limited Edition
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Bestsellers Section */}
        <section className="my-12">
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Super Dhamaka Deals
            </h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
              Handpicked premium cotton wear at lean prices
            </p>
            <div className="h-0.5 w-8 bg-primary/30 mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products?.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "animate-in fade-in-50 slide-in-from-bottom-3 duration-500",
                  i === 0
                    ? "delay-75"
                    : i === 1
                      ? "delay-100"
                      : i === 2
                        ? "delay-150"
                        : "delay-200",
                )}
              >
                <ProductCard
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
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full px-6 py-5.5 text-xs font-bold uppercase tracking-widest gap-2 border-border/80 bg-card hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg"
            >
              <Link href="/products">
                View all products
                <span>→</span>
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
