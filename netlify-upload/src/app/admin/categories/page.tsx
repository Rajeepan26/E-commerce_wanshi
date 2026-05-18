"use client";

import { useQuery } from "@tanstack/react-query";
import { cloneCategoriesForAdmin } from "@/lib/mock/catalog-store";

export default function AdminCategoriesPage() {
  const { data: cats } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => cloneCategoriesForAdmin(),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Categories</h1>
      <p className="text-sm text-muted-foreground">
        Frontend demo categories are static. Connect a CMS or API to edit them live.
      </p>
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
