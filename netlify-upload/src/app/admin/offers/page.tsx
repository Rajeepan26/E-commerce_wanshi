"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { OfferRow } from "@/lib/mock/types";
import { OfferForm } from "@/components/admin/promo-forms";
import { cloneOffersAdmin, deleteOffer } from "@/lib/mock/catalog-store";

export default function AdminOffersPage() {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const queryClient = useQueryClient();

  const invalidateOffers = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    queryClient.invalidateQueries({ queryKey: ["demo-offers"] });
  };

  const { data: offers } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async (): Promise<OfferRow[]> => cloneOffersAdmin(),
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      deleteOffer(id);
    },
    onSuccess: () => {
      invalidateOffers();
      toast.success("Offer deleted");
    },
    onError: () => toast.error("Failed to delete offer"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Offer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discount banners and promotions shown across the storefront.
        </p>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Active offers</span>
          <Button onClick={() => setShowOfferForm(!showOfferForm)} size="sm">
            {showOfferForm ? "Cancel" : "Add Offer"}
          </Button>
        </div>

        {showOfferForm && (
          <OfferForm
            onSuccess={() => {
              setShowOfferForm(false);
              invalidateOffers();
            }}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {offers?.map((o) => (
            <div key={o.id} className="overflow-hidden rounded-lg border bg-card">
              <img
                src={o.banner_image_url ?? ""}
                alt={o.title}
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <p className="font-semibold">{o.title}</p>
                <p className="text-xs text-muted-foreground">
                  {o.discount_percentage}% OFF · {o.is_active ? "Active" : "Inactive"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-destructive hover:bg-destructive/10"
                  onClick={() => deleteOfferMutation.mutate(o.id)}
                  disabled={deleteOfferMutation.isPending}
                >
                  <Trash2 className="mr-1 size-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
