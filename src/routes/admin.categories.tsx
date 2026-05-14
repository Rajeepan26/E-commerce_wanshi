import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  const { data: cats } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Categories</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats?.map((c) => (
          <div key={c.id} className="rounded-lg border bg-card p-4">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-muted-foreground">/{c.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}