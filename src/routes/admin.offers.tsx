import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/offers")({ component: AdminOffers });

function AdminOffers() {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: offers } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => (await supabase.from("offers").select("*")).data ?? [],
  });

  const { data: ads } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => (await supabase.from("advertisements").select("*")).data ?? [],
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("offers").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Offer deleted");
    },
    onError: () => toast.error("Failed to delete offer"),
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("advertisements").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Advertisement deleted");
    },
    onError: () => toast.error("Failed to delete ad"),
  });

  return (
    <div className="space-y-8">
      {/* Offers Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Offers</h1>
          <Button onClick={() => setShowOfferForm(!showOfferForm)} size="sm">
            {showOfferForm ? "Cancel" : "Add Offer"}
          </Button>
        </div>

        {showOfferForm && <OfferForm onSuccess={() => { setShowOfferForm(false); queryClient.invalidateQueries({ queryKey: ["admin-offers"] }); }} />}

        <div className="grid gap-3 sm:grid-cols-2">
          {offers?.map((o) => (
            <div key={o.id} className="overflow-hidden rounded-lg border bg-card">
              <img src={o.banner_image_url ?? ""} alt={o.title} className="h-32 w-full object-cover" />
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
                  <Trash2 className="size-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advertisements Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Advertisements</h2>
          <Button onClick={() => setShowAdForm(!showAdForm)} size="sm">
            {showAdForm ? "Cancel" : "Add Advertisement"}
          </Button>
        </div>

        {showAdForm && <AdForm onSuccess={() => { setShowAdForm(false); queryClient.invalidateQueries({ queryKey: ["admin-ads"] }); }} />}

        <div className="grid gap-3 sm:grid-cols-2">
          {ads?.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-3">
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground">
                Position: {a.position} · {a.is_active ? "Active" : "Inactive"}
              </p>
              {a.image_url && <img src={a.image_url} alt={a.title} className="mt-2 h-20 w-full object-cover rounded" />}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-destructive hover:bg-destructive/10"
                onClick={() => deleteAdMutation.mutate(a.id)}
                disabled={deleteAdMutation.isPending}
              >
                <Trash2 className="size-3 mr-1" /> Delete
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OfferForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !discount) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("offers").insert({
      title,
      description,
      discount_percentage: Number(discount),
      banner_image_url: imageUrl,
      is_active: isActive,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Offer added successfully");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border bg-card p-4">
      <div>
        <Label>Offer Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Summer Sale" required />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Offer details" />
      </div>
      <div>
        <Label>Discount %</Label>
        <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="50" required />
      </div>
      <div>
        <Label>Banner Image URL</Label>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Active</span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Offer"}
      </Button>
    </form>
  );
}

function AdForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("hero");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("advertisements").insert({
      title,
      position,
      image_url: imageUrl,
      is_active: isActive,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Advertisement added successfully");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border bg-card p-4">
      <div>
        <Label>Ad Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Advertisement title" required />
      </div>
      <div>
        <Label>Position</Label>
        <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
          <option value="hero">Hero Banner</option>
          <option value="sidebar">Sidebar</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>
      <div>
        <Label>Image URL</Label>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Active</span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Advertisement"}
      </Button>
    </form>
  );
}