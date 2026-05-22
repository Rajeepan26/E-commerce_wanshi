"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DemoAuthUser } from "@/lib/mock/types-shared";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loadPersistedSession,
  persistSession,
  tryChangeDemoPassword,
} from "@/lib/mock/auth-session";

const PROFILE_KEY = "wanshi.demo_profiles";

type StoredProfileShape = {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number?: string;
};

type ProfileForm = {
  first_name: string;
  last_name: string;
  phone_number: string;
  residence_address: string;
};

function parseProfile(row: StoredProfileShape | undefined, seedUser: DemoAuthUser): ProfileForm {
  let first_name = row?.first_name?.trim() ?? "";
  let last_name = row?.last_name?.trim() ?? "";
  if (!first_name && !last_name && row?.full_name?.trim()) {
    const parts = row.full_name.trim().split(/\s+/);
    first_name = parts[0] ?? "";
    last_name = parts.slice(1).join(" ");
  }
  if (!first_name && !last_name) {
    const seed =
      typeof seedUser.app_metadata?.full_name === "string"
        ? seedUser.app_metadata.full_name.trim()
        : (seedUser.email?.split("@")[0] ?? "");
    const parts = seed.split(/\s+/);
    first_name = parts[0] ?? "";
    last_name = parts.slice(1).join(" ");
  }
  return {
    first_name,
    last_name,
    phone_number: row?.phone_number ?? "",
    residence_address: (row as any)?.residence_address ?? "",
  };
}

function normalizeCompare(f: ProfileForm) {
  return {
    first_name: f.first_name.trim(),
    last_name: f.last_name.trim(),
    phone_number: f.phone_number.replace(/\D/g, ""),
    residence_address: f.residence_address.trim(),
  };
}

function validateProfile(f: ProfileForm): string | null {
  if (f.first_name.trim().length < 1) {
    return "Please enter your first name.";
  }
  if (f.last_name.trim().length < 1) {
    return "Please enter your last name.";
  }
  const digits = f.phone_number.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return "Enter a valid phone number (10–15 digits).";
  }
  if (f.residence_address.trim().length < 5) {
    return "Please enter a valid residence address (min 5 characters).";
  }
  return null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    phone_number: "",
    residence_address: "",
  });
  const [baseline, setBaseline] = useState<ProfileForm | null>(null);
  const [busy, setBusy] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwEditing, setPwEditing] = useState(false);

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, StoredProfileShape>) : {};
      const row = map[user.id];
      const next = parseProfile(row, user);
      setForm(next);
      setBaseline(next);
      setEditing(false);
      setPwEditing(false);
    } catch {
      /* ignore */
    }
  }, [user]);

  const cancelPasswordEdit = () => {
    setPw({ current: "", next: "", confirm: "" });
    setPwEditing(false);
  };

  const cancelEdit = () => {
    if (baseline) setForm(baseline);
    setEditing(false);
  };

  const saveProfile = () => {
    if (!user?.id || typeof window === "undefined") return;
    const err = validateProfile(form);
    if (err) {
      toast.error(err);
      return;
    }
    const normalized = normalizeCompare(form);
    const prior = baseline == null ? null : normalizeCompare(baseline);
    if (
      prior &&
      prior.first_name === normalized.first_name &&
      prior.last_name === normalized.last_name &&
      prior.phone_number === normalized.phone_number &&
      (prior as any).residence_address === normalized.residence_address
    ) {
      toast.message("Nothing to save — profile already matches these details.");
      setEditing(false);
      return;
    }

    setBusy(true);
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, StoredProfileShape>) : {};
      const row = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim(),
        residence_address: form.residence_address.trim(),
      };
      map[user.id] = row;
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(map));

      const displayName = `${row.first_name} ${row.last_name}`.trim();
      const session = loadPersistedSession();
      if (session?.id === user.id) {
        persistSession({
          ...session,
          app_metadata: { ...session.app_metadata, full_name: displayName },
        });
      }

      const saved: ProfileForm = {
        first_name: row.first_name ?? "",
        last_name: row.last_name ?? "",
        phone_number: row.phone_number ?? "",
        residence_address: (row as any).residence_address ?? "",
      };
      setBaseline(saved);
      setForm(saved);
      setEditing(false);
      toast.success("Profile saved");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  const savePassword = () => {
    if (!user?.email) return;
    if (!pw.current || !pw.next || !pw.confirm) {
      toast.error("Fill in all password fields.");
      return;
    }
    if (pw.next !== pw.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setPwBusy(true);
    const result = tryChangeDemoPassword({
      email: user.email,
      currentPassword: pw.current,
      newPassword: pw.next,
    });
    setPwBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPw({ current: "", next: "", confirm: "" });
    toast.success("Password updated — use your new password next time you sign in.");
    setPwEditing(false);
  };

  if (!user) return null;

  const inactiveField = "bg-muted/55 text-foreground";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-6 lg:max-w-none">
        <Card className="shadow-sm overflow-hidden border-border/80">
          <CardHeader className="space-y-1 bg-muted/30 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">My profile</CardTitle>
            <CardDescription className="text-xs font-medium">
              Name and contact details for safe deliveries and WhatsApp order updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 pb-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First name</Label>
                <Input
                  id="first_name"
                  className={!editing ? inactiveField : "rounded-xl border-border/60 focus:ring-primary/20"}
                  readOnly={!editing}
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last name</Label>
                <Input
                  id="last_name"
                  className={!editing ? inactiveField : "rounded-xl border-border/60 focus:ring-primary/20"}
                  readOnly={!editing}
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="profile_email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <Input
                id="profile_email"
                type="email"
                className={`${inactiveField} cursor-not-allowed opacity-80`}
                value={user.email ?? ""}
                readOnly
                disabled
                tabIndex={-1}
                aria-readonly="true"
              />
              <p className="text-xs text-muted-foreground/60 leading-none">Locked — email cannot be changed here.</p>
            </div>
  
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone number</Label>
                <Input
                  id="phone_number"
                  className={!editing ? inactiveField : "rounded-xl border-border/60 focus:ring-primary/20"}
                  readOnly={!editing}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+91 …"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground font-medium">10–15 digits (country code counts).</p>
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="residence_address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Residence address</Label>
                <Input
                  id="residence_address"
                  className={!editing ? inactiveField : "rounded-xl border-border/60 focus:ring-primary/20"}
                  readOnly={!editing}
                  placeholder="Street, City, Province"
                  value={form.residence_address}
                  onChange={(e) => setForm({ ...form, residence_address: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground font-medium">Full address for deliveries.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 border-t pt-5 pb-5 bg-muted/5">
            {!editing ? (
              <Button
                type="button"
                variant="default"
                className="rounded-xl px-8 font-bold text-xs"
                onClick={() => {
                  cancelPasswordEdit();
                  setEditing(true);
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" className="rounded-xl px-6 font-bold text-xs" onClick={cancelEdit} disabled={busy}>
                  Cancel
                </Button>
                <Button type="button" variant="default" className="rounded-xl px-8 font-bold text-xs" onClick={saveProfile} disabled={busy}>
                  {busy ? "Saving…" : "Save Changes"}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm overflow-hidden border-border/80">
          <CardHeader className="space-y-1 bg-muted/30 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">Security</CardTitle>
            <CardDescription className="text-xs font-medium">
              Update your account password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 pb-2">
            {!pwEditing ? (
              <div className="rounded-xl border border-dashed border-muted-foreground/30 p-3 bg-muted/10">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  For safety, password fields are hidden until you choose to update. Choice <strong>&quot;Change Password&quot;</strong> below to start.
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="current_pw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current password</Label>
                  <Input
                    id="current_pw"
                    type="password"
                    autoComplete="current-password"
                    className="rounded-xl border-border/60 focus:ring-primary/20"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_pw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New password</Label>
                  <Input
                    id="new_pw"
                    type="password"
                    autoComplete="new-password"
                    className="rounded-xl border-border/60 focus:ring-primary/20"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_pw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm new password</Label>
                  <Input
                    id="confirm_pw"
                    type="password"
                    autoComplete="new-password"
                    className="rounded-xl border-border/60 focus:ring-primary/20"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 border-t pt-5 pb-5 bg-muted/5">
            {!pwEditing ? (
              <Button
                type="button"
                variant="default"
                className="rounded-xl px-8 font-bold text-xs"
                onClick={() => {
                  cancelEdit();
                  setPwEditing(true);
                }}
              >
                Change password
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-6 font-bold text-xs"
                  onClick={cancelPasswordEdit}
                  disabled={pwBusy}
                >
                  Cancel
                </Button>
                <Button type="button" variant="default" className="rounded-xl px-8 font-bold text-xs" onClick={savePassword} disabled={pwBusy}>
                  {pwBusy ? "Updating…" : "Update Password"}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
