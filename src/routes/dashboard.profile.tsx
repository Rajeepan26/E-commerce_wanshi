import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone_number: "", default_address: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({
        full_name: data.full_name ?? "",
        phone_number: data.phone_number ?? "",
        default_address: data.default_address ?? "",
      });
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ user_id: user.id, ...form });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h1 className="mb-4 text-xl font-bold">My Profile</h1>
      <div className="space-y-4 max-w-md">
        <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
        <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
        <div><Label>Phone (WhatsApp)</Label><Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></div>
        <div><Label>Default address</Label><Input value={form.default_address} onChange={(e) => setForm({ ...form, default_address: e.target.value })} /></div>
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}