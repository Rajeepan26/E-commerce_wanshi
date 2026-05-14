import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

function AdminProducts() {
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Products</h1>
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="flex items-center gap-3 p-3">
                  <img src={p.image_url ?? ""} alt="" className="size-10 rounded object-cover" />
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="p-3 text-muted-foreground">{p.categories?.name ?? "-"}</td>
                <td className="p-3">{inr(Number(p.price))}</td>
                <td className="p-3">{p.stock_quantity ?? "-"}</td>
                <td className="p-3">
                  <span className={p.is_active ? "text-success" : "text-destructive"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}