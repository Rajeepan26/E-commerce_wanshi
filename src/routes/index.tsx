import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { ProductCard } from "@/components/product-card";
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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-6">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers?.map((o) => (
              <Link
                key={o.id}
                to="/products"
                search={{}}
                className="group relative overflow-hidden rounded-lg border bg-card transition hover:shadow-md"
              >
                <img
                  src={o.banner_image_url ?? ""}
                  alt={o.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-semibold text-primary">
                    Up to {o.discount_percentage}% OFF
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground">{o.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {o.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

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

function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-secondary/40">
      <div className="container mx-auto grid gap-6 px-4 py-8 text-sm text-muted-foreground sm:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-primary">Wanshi</p>
          <p className="mt-1">India's lean shopping destination.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Help</p>
          <p>About</p>
          <p>Contact</p>
          <p>Returns Policy</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Sell</p>
          <p>Become a Seller</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Connect</p>
          <p>WhatsApp · Instagram · X</p>
        </div>
      </div>
    </footer>
  );
}