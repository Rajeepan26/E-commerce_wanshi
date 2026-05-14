import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/offers")({ component: AdminOffers });

function AdminOffers() {
  const { data: offers } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => (await supabase.from("offers").select("*")).data ?? [],
  });
  const { data: ads } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => (await supabase.from("advertisements").select("*")).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-3 text-xl font-bold">Offers</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {offers?.map((o) => (
            <div key={o.id} className="overflow-hidden rounded-lg border bg-card">
              <img src={o.banner_image_url ?? ""} alt="" className="h-32 w-full object-cover" />
              <div className="p-3">
                <p className="font-semibold">{o.title}</p>
                <p className="text-xs text-muted-foreground">
                  {o.discount_percentage}% OFF · {o.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-xl font-bold">Advertisements</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ads?.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-3">
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground">
                Position: {a.position} · {a.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}