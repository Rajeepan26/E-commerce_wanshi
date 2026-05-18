import type { DemoRole } from "@/lib/mock/types-shared";
import {
  readPasswordOverrides,
  setDemoPasswordOverride,
  writePasswordOverrides,
} from "@/lib/mock/demo-password-overrides";
import { isPresetCredentialEmail } from "@/lib/mock/preset-demo-credentials";
import { DEMO_PROFILES_KEY } from "@/lib/mock/demo-profiles";

const REGISTRY_KEY = "wanshi.demo_admin_registry_users";

export type AdminRegistryUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: Exclude<DemoRole, null>;
};

function readRegistry(): AdminRegistryUserRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY);
    const parsed = raw ? (JSON.parse(raw) as AdminRegistryUserRow[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRegistry(rows: AdminRegistryUserRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(rows));
}

export function listAdminCreatedUsers(): AdminRegistryUserRow[] {
  return readRegistry().map((r) => ({ ...r }));
}

export function findAdminCreatedUserByEmail(email: string): AdminRegistryUserRow | undefined {
  const key = email.trim().toLowerCase();
  return readRegistry().find((u) => u.email.trim().toLowerCase() === key);
}

export function addAdminCreatedUser(params: {
  email: string;
  password: string;
  full_name: string;
  role: Exclude<DemoRole, null>;
}): { ok: true; user: AdminRegistryUserRow } | { ok: false; error: string } {
  const key = params.email.trim().toLowerCase();
  if (!key || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const fullName = params.full_name.trim();
  if (!fullName) return { ok: false, error: "Name is required." };
  const password = params.password.trim();
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  if (isPresetCredentialEmail(key)) {
    return { ok: false, error: "That email is reserved for preset demo accounts." };
  }

  const existing = readRegistry();
  if (existing.some((u) => u.email.trim().toLowerCase() === key)) {
    return { ok: false, error: "A user with that email already exists." };
  }

  /** Password already stored via sign-up overrides for this email. */
  const overrides = readPasswordOverrides();
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return { ok: false, error: "That email already has demo credentials stored in this browser." };
  }

  const id = `demo-reg-${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;
  const row: AdminRegistryUserRow = {
    id,
    email: key,
    full_name: fullName,
    role: params.role === "admin" ? "admin" : "customer",
  };
  writeRegistry([...existing, row]);
  setDemoPasswordOverride(key, password);

  const profilesRaw = localStorage.getItem(DEMO_PROFILES_KEY) ?? "{}";
  try {
    const map = JSON.parse(profilesRaw) as Record<
      string,
      { first_name?: string; last_name?: string; phone_number?: string }
    >;
    const parts = fullName.split(/\s+/);
    map[id] = {
      first_name: parts[0] ?? "",
      last_name: parts.slice(1).join(" ") ?? "",
      phone_number: "",
    };
    localStorage.setItem(DEMO_PROFILES_KEY, JSON.stringify(map));
  } catch {
    localStorage.setItem(
      DEMO_PROFILES_KEY,
      JSON.stringify({
        [id]: { first_name: fullName.split(/\s+/)[0] ?? "", last_name: "", phone_number: "" },
      }),
    );
  }

  return { ok: true, user: row };
}

export function deleteAdminCreatedUser(
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (typeof window === "undefined") {
    return { ok: false, error: "Not available server-side." };
  }
  const rows = readRegistry();
  const row = rows.find((r) => r.id === userId);
  if (!row) return { ok: false, error: "User not found." };

  writeRegistry(rows.filter((r) => r.id !== userId));

  const o = readPasswordOverrides();
  const emailKey = row.email.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(o, emailKey)) {
    delete o[emailKey];
    writePasswordOverrides(o);
  }

  window.localStorage.removeItem(`wanshi.demo_role.${userId}`);

  try {
    const raw = window.localStorage.getItem(DEMO_PROFILES_KEY) ?? "{}";
    const map = JSON.parse(raw) as Record<string, unknown>;
    if (map && typeof map === "object" && userId in map) {
      delete map[userId];
      window.localStorage.setItem(DEMO_PROFILES_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore malformed profile blob
  }

  return { ok: true };
}
