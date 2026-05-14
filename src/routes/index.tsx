import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { ProductCard } from "@/components/product-card";
import { CategoryBanners } from "@/components/category-banners";
import { SiteFooter } from "@/components/site-footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Truck, ShieldCheck, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Wanshi — India's lean shopping destination" },
      {
        name: "description",
        content:
          "Browse trending products in fashion, electronics, kitchen, beauty and more at unbeatable prices.",
      },
    ],
  }),
});

function HomePage() {
  const { data: ads } = useQuery({
    queryKey: ["ads", "hero"],
    queryFn: async () =>
      (await supabase.from("advertisements").select("*").eq("is_active", true)).data ?? [],
  });
  const { data: offers } = useQuery({
    queryKey: ["offers"],
    queryFn: async () =>
      (await supabase.from("offers").select("*").eq("is_active", true)).data ?? [],
  });
  const { data: products } = useQuery({
    queryKey: ["products", "home"],
    queryFn: async () =>
      (
        await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(12)
      ).data ?? [],
  });

  const heroAd = ads?.find((a) => a.position === "hero");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Trust strip */}
        <div className="mb-6 grid grid-cols-3 gap-3 rounded-lg border bg-primary-soft p-4 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Truck className="size-4 text-primary" /> {heroAd?.title?.split("|")[0]?.trim() ?? "Easy Returns"}
          </div>
          <div className="flex items-center justify-center gap-2 text-foreground">
            <ShieldCheck className="size-4 text-primary" /> Top Rated Products
          </div>
          <div className="flex items-center justify-end gap-2 text-foreground">
            <Wallet className="size-4 text-primary" /> Cash on Delivery
          </div>
        </div>

        {/* Offers carousel */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-foreground">Today's Top Offers</h2>
          <Carousel opts={{ loop: true, align: "start" }} className="w-full">
            <CarouselContent>
              {offers?.map((o) => (
                <CarouselItem key={o.id} className="basis-full">
                  <Link
                    to="/products"
                    search={{}}
                    className="group relative block overflow-hidden rounded-xl border bg-card transition hover:shadow-lg"
                  >
                    <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
                      <img
                        src={o.banner_image_url ?? ""}
                        alt={o.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 sm:p-10">
                        <p className="inline-block w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                          Up to {o.discount_percentage}% OFF
                        </p>
                        <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                          {o.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-white/90 sm:text-base">
                          {o.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3" />
            <CarouselNext className="right-3" />
          </Carousel>
        </section>

        {/* Category banners 3x3 */}
        <CategoryBanners />

        {/* Product grid */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">Super Dhamaka Deals</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          <div className="mt-6 text-center">
            <Link to="/products" className="text-sm font-medium text-primary hover:underline">
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
