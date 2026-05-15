"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PROFILE_KEY = "wanshi.demo_profiles";

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone_number: "", default_address: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, typeof form>) : {};
      const row = map[user.id];
      setForm({
        full_name:
          row?.full_name ?? user.app_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
        phone_number: row?.phone_number ?? "",
        default_address: row?.default_address ?? "",
      });
    } catch {
      /* ignore */
    }
  }, [user]);

  const save = () => {
    if (!user?.id || typeof window === "undefined") return;
    setBusy(true);
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, typeof form>) : {};
      map[user.id] = { ...form };
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(map));
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h1 className="mb-4 text-xl font-bold">My Profile</h1>
      <div className="max-w-md space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div>
          <Label>Full name</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Phone (WhatsApp)</Label>
          <Input
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          />
        </div>
        <div>
          <Label>Default address</Label>
          <Input
            value={form.default_address}
            onChange={(e) => setForm({ ...form, default_address: e.target.value })}
          />
        </div>
        <Button type="button" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
