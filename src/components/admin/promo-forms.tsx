"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { upsertAdvertisement, upsertOffer, cloneCategories, cloneProductsActive } from "@/lib/mock/catalog-store";
import type { AdvertisementRow, OfferRow } from "@/lib/mock/types";
import { parseDayEnd, parseDayStart } from "@/lib/mock/promo-schedule";
import { ChevronRight, Search, Check } from "lucide-react";

function defaultPromoDates() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 14);
  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return { startsAt: iso(start), endsAt: iso(end) };
}

function RedirectSelector({
  selectedCategoryIds,
  selectedProductIds,
  onSelect,
}: {
  selectedCategoryIds: string[];
  selectedProductIds: string[];
  onSelect: (cats: string[], prods: string[]) => void;
}) {
  const [catSearch, setCatSearch] = useState("");
  const categories = useMemo(() => cloneCategories(), []);
  
  // We show products from ALL selected categories
  const activeProducts = useMemo(() => {
    if (selectedCategoryIds.length === 0) return [];
    // Potentially filter products by any of the selected categories
    const all = selectedCategoryIds.flatMap(catId => cloneProductsActive({ categoryId: catId }));
    // Unique by ID
    return Array.from(new Map(all.map(p => [p.id, p])).values());
  }, [selectedCategoryIds]);

  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  const toggleCategory = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      const next = selectedCategoryIds.filter(x => x !== id);
      // Also filter out products that are specifically in ONLY this category if we want, 
      // but simpler to just keep selected products as is for now or filter them?
      // User might want to keep some products selected even if cat is removed.
      onSelect(next, selectedProductIds);
    } else {
      onSelect([...selectedCategoryIds, id], selectedProductIds);
    }
  };

  const toggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      onSelect(selectedCategoryIds, selectedProductIds.filter(x => x !== id));
    } else {
      onSelect(selectedCategoryIds, [...selectedProductIds, id]);
    }
  };

  const clearAll = () => onSelect([], []);

  return (
    <div className="space-y-4 rounded-xl border-2 border-dashed border-muted/50 p-6 bg-muted/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <ChevronRight className="size-4 text-primary" />
          <h3 className="text-sm uppercase tracking-wider">Redirection Target</h3>
        </div>
        {(selectedCategoryIds.length > 0 || selectedProductIds.length > 0) && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive">
            Clear All
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <Label className="text-[11px] font-bold text-muted-foreground mb-3 block uppercase tracking-tight">1. Target Categories (Multiple)</Label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Filter categories..."
              className="pl-9 h-9 text-xs rounded-full border-muted-foreground/20 focus-visible:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-40 p-1 custom-scrollbar">
            {filteredCats.map((c) => {
              const active = selectedCategoryIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`flex items-center justify-between px-3 py-2 text-[11px] font-bold rounded-xl border transition-all truncate text-left ${
                    active ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border/60 bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {active && <Check className="size-3 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Selection */}
        {selectedCategoryIds.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t pt-4 border-dashed border-border">
            <Label className="text-[11px] font-bold text-muted-foreground mb-3 block uppercase tracking-tight">2. Target Specific Products (Multiple)</Label>
            {activeProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-2 bg-muted/30 py-3 rounded-lg text-center">No products found in these categories</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar p-1">
                {activeProducts.map((p) => {
                  const active = selectedProductIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                        active ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border/60 hover:bg-muted/50"
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleProduct(p.id)}
                          className="peer size-4 appearance-none rounded border-2 border-muted-foreground/30 checked:border-primary checked:bg-primary transition-all cursor-pointer"
                        />
                        <Check className="absolute size-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {p.image_url && (
                          <img src={p.image_url} className="size-8 rounded-lg object-cover border bg-white" alt="" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold truncate leading-tight">{p.name}</span>
                          <span className="text-[9px] text-muted-foreground font-medium truncate uppercase tracking-tighter">
                            {categories.find(c => c.id === p.category_id)?.name || "N/A"}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function OfferForm({
  onSuccess,
  initialData,
}: {
  onSuccess: () => void;
  initialData?: OfferRow;
}) {
  const defaults = defaultPromoDates();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [discount, setDiscount] = useState(initialData?.discount_percentage?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.banner_image_url ?? "");
  const [startsAt, setStartsAt] = useState(initialData?.starts_at ?? defaults.startsAt);
  const [endsAt, setEndsAt] = useState(initialData?.ends_at ?? defaults.endsAt);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [targetCatIds, setTargetCatIds] = useState(initialData?.target_category_ids ?? []);
  const [targetProdIds, setTargetProdIds] = useState(initialData?.target_product_ids ?? []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !discount) {
      toast.error("Please fill in required fields");
      return;
    }
    if (!startsAt || !endsAt) {
      toast.error("Start and end dates are required");
      return;
    }
    if (parseDayEnd(endsAt) < parseDayStart(startsAt)) {
      toast.error("End date must be on or after the start date");
      return;
    }
    setLoading(true);
    upsertOffer({
      id: initialData?.id,
      title,
      description,
      discount_percentage: Number(discount),
      banner_image_url: imageUrl || null,
      is_active: isActive,
      starts_at: startsAt,
      ends_at: endsAt,
      target_category_ids: targetCatIds,
      target_product_ids: targetProdIds,
    });
    setLoading(false);
    toast.success(initialData ? "Offer updated successfully" : "Offer added successfully");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border bg-card p-4">
      <div>
        <Label>Offer Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Summer Sale"
          required
        />
      </div>
      <div>
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Offer details"
        />
      </div>
      <div>
        <Label>Discount %</Label>
        <Input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="50"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Start date</Label>
          <Input
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>End date</Label>
          <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>Banner Image URL</Label>
        <div className="flex gap-2">
          <Input
            value={imageUrl}
            onChange={(e) => {
              let val = e.target.value.trim();
              if (val && !val.startsWith("http") && !val.startsWith("/") && val.includes(".")) {
                val = `https://${val}`;
              }
              setImageUrl(val);
            }}
            placeholder="https://..."
          />
          {imageUrl && (
            <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
              <img
                src={imageUrl}
                alt="Preview"
                className="size-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/40?text=Error";
                }}
              />
            </div>
          )}
        </div>
      </div>

      <RedirectSelector
        selectedCategoryIds={targetCatIds}
        selectedProductIds={targetProdIds}
        onSelect={(cats, prods) => {
          setTargetCatIds(cats);
          setTargetProdIds(prods);
        }}
      />

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Active</span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading
          ? initialData
            ? "Updating..."
            : "Adding..."
          : initialData
            ? "Update Offer"
            : "Add Offer"}
      </Button>
    </form>
  );
}

export function AdForm({
  onSuccess,
  initialData,
}: {
  onSuccess: () => void;
  initialData?: AdvertisementRow;
}) {
  const defaults = defaultPromoDates();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [position, setPosition] = useState<AdvertisementRow["position"]>(
    initialData?.position ?? "hero",
  );
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [startsAt, setStartsAt] = useState(initialData?.starts_at ?? defaults.startsAt);
  const [endsAt, setEndsAt] = useState(initialData?.ends_at ?? defaults.endsAt);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [targetCatIds, setTargetCatIds] = useState(initialData?.target_category_ids ?? []);
  const [targetProdIds, setTargetProdIds] = useState(initialData?.target_product_ids ?? []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Please fill in required fields");
      return;
    }
    if (!startsAt || !endsAt) {
      toast.error("Start and end dates are required");
      return;
    }
    if (parseDayEnd(endsAt) < parseDayStart(startsAt)) {
      toast.error("End date must be on or after the start date");
      return;
    }
    setLoading(true);
    upsertAdvertisement({
      id: initialData?.id,
      title,
      position,
      image_url: imageUrl || null,
      is_active: isActive,
      starts_at: startsAt,
      ends_at: endsAt,
      target_category_ids: targetCatIds,
      target_product_ids: targetProdIds,
    });
    setLoading(false);
    toast.success(
      initialData ? "Advertisement updated successfully" : "Advertisement added successfully",
    );
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border bg-card p-4">
      <div>
        <Label>Ad Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Advertisement title"
          required
        />
      </div>
      <div>
        <Label>Position</Label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value as AdvertisementRow["position"])}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="hero">Hero Banner</option>
          <option value="sidebar">Sidebar</option>
          <option value="banner">Banner</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Start date</Label>
          <Input
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>End date</Label>
          <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>Image URL</Label>
        <div className="flex gap-2">
          <Input
            value={imageUrl}
            onChange={(e) => {
              let val = e.target.value.trim();
              if (val && !val.startsWith("http") && !val.startsWith("/") && val.includes(".")) {
                val = `https://${val}`;
              }
              setImageUrl(val);
            }}
            placeholder="https://..."
          />
          {imageUrl && (
            <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
              <img
                src={imageUrl}
                alt="Preview"
                className="size-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/40?text=Error";
                }}
              />
            </div>
          )}
        </div>
      </div>

      <RedirectSelector
        selectedCategoryIds={targetCatIds}
        selectedProductIds={targetProdIds}
        onSelect={(cats, prods) => {
          setTargetCatIds(cats);
          setTargetProdIds(prods);
        }}
      />

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Active</span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading
          ? initialData
            ? "Updating..."
            : "Adding..."
          : initialData
            ? "Update Advertisement"
            : "Add Advertisement"}
      </Button>
    </form>
  );
}
