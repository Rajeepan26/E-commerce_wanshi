"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { upsertAdvertisement, upsertOffer } from "@/lib/mock/catalog-store";
import type { AdvertisementRow, OfferRow } from "@/lib/mock/types";
import { parseDayEnd, parseDayStart } from "@/lib/mock/promo-schedule";

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

export function OfferForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: OfferRow }) {
  const defaults = defaultPromoDates();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [discount, setDiscount] = useState(initialData?.discount_percentage?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.banner_image_url ?? "");
  const [startsAt, setStartsAt] = useState(initialData?.starts_at ?? defaults.startsAt);
  const [endsAt, setEndsAt] = useState(initialData?.ends_at ?? defaults.endsAt);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
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
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Active</span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Offer" : "Add Offer")}
      </Button>
    </form>
  );
}

export function AdForm({ onSuccess, initialData }: { onSuccess: () => void; initialData?: AdvertisementRow }) {
  const defaults = defaultPromoDates();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [position, setPosition] = useState<AdvertisementRow["position"]>(initialData?.position ?? "hero");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [startsAt, setStartsAt] = useState(initialData?.starts_at ?? defaults.startsAt);
  const [endsAt, setEndsAt] = useState(initialData?.ends_at ?? defaults.endsAt);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
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
    });
    setLoading(false);
    toast.success(initialData ? "Advertisement updated successfully" : "Advertisement added successfully");
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
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className="text-sm">Active</span>
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Advertisement" : "Add Advertisement")}
      </Button>
    </form>
  );
}
