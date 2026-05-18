"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { AdvertisementRow } from "@/lib/mock/types";
import { AdForm } from "@/components/admin/promo-forms";
import { cloneAdsAdmin, deleteAdvertisement } from "@/lib/mock/catalog-store";

export default function AdminAdvertisementPage() {
  const [showAdForm, setShowAdForm] = useState(false);
  const queryClient = useQueryClient();

  const invalidateAds = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    queryClient.invalidateQueries({ queryKey: ["demo-ads"] });
  };

  const { data: ads } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async (): Promise<AdvertisementRow[]> => cloneAdsAdmin(),
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteAdvertisement(id);
    },
    onSuccess: () => {
      invalidateAds();
      toast.success("Advertisement deleted");
    },
    onError: () => toast.error("Failed to delete ad"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Advertisement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage hero, sidebar, and banner placements on the storefront.
        </p>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Active placements</span>
          <Button onClick={() => setShowAdForm(!showAdForm)} size="sm">
            {showAdForm ? "Cancel" : "Add Advertisement"}
          </Button>
        </div>

        {showAdForm && (
          <AdForm
            onSuccess={() => {
              setShowAdForm(false);
              invalidateAds();
            }}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {ads?.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-3">
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground">
                Position: {a.position} · {a.is_active ? "Active" : "Inactive"}
              </p>
              {a.image_url && (
                <img
                  src={a.image_url}
                  alt={a.title}
                  className="mt-2 h-20 w-full rounded object-cover"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-destructive hover:bg-destructive/10"
                onClick={() => deleteAdMutation.mutate(a.id)}
                disabled={deleteAdMutation.isPending}
              >
                <Trash2 className="mr-1 size-3" /> Delete
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
