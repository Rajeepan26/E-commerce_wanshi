"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { AdPosition } from "@/lib/mock/types";
import { insertAdvertisement, insertOffer } from "@/lib/mock/catalog-store";
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

export function OfferForm({ onSuccess }: { onSuccess: () => void }) {
  const defaults = defaultPromoDates();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startsAt, setStartsAt] = useState(defaults.startsAt);
  const [endsAt, setEndsAt] = useState(defaults.endsAt);
  const [isActive, setIsActive] = useState(true);
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
    insertOffer({
      title,
      description,
      discount_percentage: Number(discount),
      banner_image_url: imageUrl || null,
      is_active: isActive,
      starts_at: startsAt,
      ends_at: endsAt,
    });
    setLoading(false);
    toast.success("Offer added successfully");
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
        {loading ? "Adding..." : "Add Offer"}
      </Button>
    </form>
  );
}

export function AdForm({ onSuccess }: { onSuccess: () => void }) {
  const defaults = defaultPromoDates();
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<AdPosition>("hero");
  const [imageUrl, setImageUrl] = useState("");
  const [startsAt, setStartsAt] = useState(defaults.startsAt);
  const [endsAt, setEndsAt] = useState(defaults.endsAt);
  const [isActive, setIsActive] = useState(true);
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
    insertAdvertisement({
      title,
      position,
      image_url: imageUrl || null,
      is_active: isActive,
      starts_at: startsAt,
      ends_at: endsAt,
    });
    setLoading(false);
    toast.success("Advertisement added successfully");
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
          onChange={(e) => setPosition(e.target.value as AdPosition)}
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
        {loading ? "Adding..." : "Add Advertisement"}
      </Button>
    </form>
  );
}
