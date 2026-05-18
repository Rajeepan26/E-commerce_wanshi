export const DEMO_PROFILES_KEY = "wanshi.demo_profiles";

export type DemoProfileStored = {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
};

/** Profile fields keyed by demo user id (preset or registry). */
export function readDemoProfilesMap(): Record<string, DemoProfileStored> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, DemoProfileStored>) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function profileFullName(p: DemoProfileStored | undefined): string {
  if (!p) return "";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
}
