const PASSWORD_OVERRIDES_KEY = "wanshi.demo_password_overrides";

export function readPasswordOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PASSWORD_OVERRIDES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function writePasswordOverrides(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(map));
}

export function setDemoPasswordOverride(email: string, password: string) {
  const key = email.trim().toLowerCase();
  const overrides = readPasswordOverrides();
  overrides[key] = password;
  writePasswordOverrides(overrides);
}
