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
  };
}

function normalizeCompare(f: ProfileForm) {
  return {
    first_name: f.first_name.trim(),
    last_name: f.last_name.trim(),
    phone_number: f.phone_number.replace(/\D/g, ""),
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
  return null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    phone_number: "",
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
      prior.phone_number === normalized.phone_number
    ) {
      toast.message("Nothing to save — profile already matches these details.");
      setEditing(false);
      return;
    }

    setBusy(true);
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, StoredProfileShape>) : {};
      const row: StoredProfileShape = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim(),
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
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5">
          <CardTitle>My profile</CardTitle>
          <CardDescription>Name and phone for deliveries and WhatsApp updates.</CardDescription>
        </CardHeader>
        <CardContent className="grid max-w-lg gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                className={!editing ? inactiveField : undefined}
                readOnly={!editing}
                autoComplete="given-name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                className={!editing ? inactiveField : undefined}
                readOnly={!editing}
                autoComplete="family-name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_email">Email</Label>
            <Input
              id="profile_email"
              type="email"
              className={`${inactiveField} cursor-not-allowed`}
              value={user.email ?? ""}
              readOnly
              disabled
              tabIndex={-1}
              aria-readonly="true"
            />
            <p className="text-xs text-muted-foreground">Locked — email cannot be changed here.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone number</Label>
            <Input
              id="phone_number"
              className={!editing ? inactiveField : undefined}
              readOnly={!editing}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91 …"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">10–15 digits (country code counts).</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
          {!editing ? (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                cancelPasswordEdit();
                setEditing(true);
              }}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" variant="default" onClick={saveProfile} disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5">
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            {pwEditing
              ? "Enter your current password, then choose a new one."
              : "Choose Edit password when you're ready — your password stays hidden until then."}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-lg space-y-4">
          {!pwEditing ? (
            <p className="text-sm text-muted-foreground">
              For security we only show password fields while you&apos;re updating them.
            </p>
          ) : (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_pw">Current password</Label>
                <Input
                  id="current_pw"
                  type="password"
                  autoComplete="current-password"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_pw">New password</Label>
                <Input
                  id="new_pw"
                  type="password"
                  autoComplete="new-password"
                  value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_pw">Confirm new password</Label>
                <Input
                  id="confirm_pw"
                  type="password"
                  autoComplete="new-password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
          {!pwEditing ? (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                cancelEdit();
                setPwEditing(true);
              }}
            >
              Edit password
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={cancelPasswordEdit}
                disabled={pwBusy}
              >
                Cancel
              </Button>
              <Button type="button" variant="default" onClick={savePassword} disabled={pwBusy}>
                {pwBusy ? "Updating…" : "Update password"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
