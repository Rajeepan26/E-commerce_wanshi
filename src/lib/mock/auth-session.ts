import type { DemoAuthUser, DemoRole } from "@/lib/mock/types-shared";
import { readPasswordOverrides, writePasswordOverrides } from "@/lib/mock/demo-password-overrides";
import {
  PRESET_CREDENTIALS,
  getPresetCredentialSessionUserId,
} from "@/lib/mock/preset-demo-credentials";
import { findAdminCreatedUserByEmail } from "@/lib/mock/admin-user-registry";

const SESSION_KEY = "wanshi.demo_session";

/** Effective demo password — user-changed password overrides static presets. */
function resolvePasswordForEmail(email: string): string | undefined {
  const key = email.trim().toLowerCase();
  const o = readPasswordOverrides()[key];
  if (o !== undefined && o !== "") return o;
  return PRESET_CREDENTIALS[key]?.password;
}

export function listPresetCredentials(): ReadonlyArray<{
  email: string;
  role: Exclude<DemoRole, null>;
}> {
  return Object.entries(PRESET_CREDENTIALS).map(([email, meta]) => ({
    email,
    role: meta.role,
  }));
}

function readStoredSession(): DemoAuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoAuthUser;
  } catch {
    return null;
  }
}

function emitAuthChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("wanshi:auth"));
}

export function persistSession(user: DemoAuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  emitAuthChanged();
}

export function loadPersistedSession(): DemoAuthUser | null {
  return readStoredSession();
}

export function tryDemoSignIn(
  email: string,
  password: string,
): { ok: true; user: DemoAuthUser; role: Exclude<DemoRole, null> } | { ok: false; error: string } {
  const key = email.trim().toLowerCase();
  const expectedPassword = resolvePasswordForEmail(key);

  const presetEntry = PRESET_CREDENTIALS[key];
  const registryEntry = findAdminCreatedUserByEmail(key);

  if (!expectedPassword || expectedPassword !== password) {
    return { ok: false, error: "Invalid email or password" };
  }

  if (presetEntry) {
    const user: DemoAuthUser = {
      id: getPresetCredentialSessionUserId(key, presetEntry.role),
      email: key,
    };
    localStorage.setItem(`wanshi.demo_role.${user.id}`, presetEntry.role);
    persistSession(user);
    return { ok: true, user, role: presetEntry.role };
  }

  if (!registryEntry) {
    return { ok: false, error: "Invalid email or password" };
  }

  const row = registryEntry;
  const user: DemoAuthUser = {
    id: row.id,
    email: key,
    app_metadata: { full_name: row.full_name },
  };
  localStorage.setItem(`wanshi.demo_role.${row.id}`, row.role);
  persistSession(user);
  return { ok: true, user, role: row.role };
}

export function tryChangeDemoPassword(params: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): { ok: true } | { ok: false; error: string } {
  const key = params.email.trim().toLowerCase();
  const presetAllowed = PRESET_CREDENTIALS[key];
  const registryAllowed = Boolean(findAdminCreatedUserByEmail(key));
  if (!presetAllowed && !registryAllowed) {
    return {
      ok: false,
      error:
        "Password change is only wired for preset demo accounts and admin-created users in this preview.",
    };
  }

  const expected = resolvePasswordForEmail(key);
  if (!expected || expected !== params.currentPassword) {
    return { ok: false, error: "Current password is incorrect." };
  }
  const next = params.newPassword.trim();
  if (next.length < 6) {
    return { ok: false, error: "New password must be at least 6 characters." };
  }

  const overrides = readPasswordOverrides();
  overrides[key] = next;
  writePasswordOverrides(overrides);
  return { ok: true };
}

export function demoSignUp(email: string, password: string, fullName: string) {
  const key = email.trim().toLowerCase();
  const id = `demo-u-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const user: DemoAuthUser = {
    id,
    email: key,
    app_metadata: { full_name: fullName.trim() },
  };
  localStorage.setItem(`wanshi.demo_role.${id}`, "customer");
  const parts = fullName.trim().split(/\s+/);
  const first_name = parts[0] ?? "";
  const last_name = parts.slice(1).join(" ") ?? "";

  const o = readPasswordOverrides();
  o[key] = password;
  writePasswordOverrides(o);

  const profilesRaw = localStorage.getItem("wanshi.demo_profiles") ?? "{}";
  try {
    const map = JSON.parse(profilesRaw) as Record<
      string,
      { first_name?: string; last_name?: string; phone_number?: string }
    >;
    map[id] = { first_name, last_name, phone_number: "" };
    localStorage.setItem("wanshi.demo_profiles", JSON.stringify(map));
  } catch {
    localStorage.setItem(
      "wanshi.demo_profiles",
      JSON.stringify({
        [id]: { first_name, last_name, phone_number: "" },
      }),
    );
  }
  persistSession(user);
  return { user };
}

export function readRole(userId: string): Exclude<DemoRole, null> | null {
  if (typeof window === "undefined") return null;
  const r = localStorage.getItem(`wanshi.demo_role.${userId}`);
  return r === "admin" ? "admin" : r === "customer" ? "customer" : null;
}
