import type { DemoRole } from "@/lib/mock/types-shared";

export type PresetCred = { password: string; role: Exclude<DemoRole, null> };

/** Static demo emails + passwords for storefront preview builds. */
export const PRESET_CREDENTIALS: Record<string, PresetCred> = {
  "admin@wanshi.com": { password: "admin123", role: "admin" },
  "user@wanshi.com": { password: "user123", role: "customer" },
  "priya@wanshi.com": { password: "priya123", role: "customer" },
};

/** Default display labels when profile has no name yet — matches seeded demo intent. */
export const PRESET_DEFAULT_FULL_NAMES: Record<string, string> = {
  "admin@wanshi.com": "Wanshi Admin",
  "user@wanshi.com": "Rajesh Patel",
  "priya@wanshi.com": "Priya Sharma",
};

/** Canonical session user ids for preset accounts (matches `tryDemoSignIn`). */
export function getPresetCredentialSessionUserId(
  email: string,
  role: Exclude<DemoRole, null>,
): string {
  const key = email.trim().toLowerCase();
  return role === "admin" ? "demo-user-admin" : `demo-user-${key.replace(/[^a-z0-9]/gi, "")}`;
}

export function isPresetCredentialEmail(email: string): boolean {
  const key = email.trim().toLowerCase();
  return Boolean(PRESET_CREDENTIALS[key]);
}
