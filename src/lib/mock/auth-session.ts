import type { DemoAuthUser, DemoRole } from "@/lib/mock/types-shared";

const SESSION_KEY = "wanshi.demo_session";

const CREDENTIALS: Record<string, { password: string; role: Exclude<DemoRole, null> }> = {
  "admin@wanshi.com": { password: "admin123", role: "admin" },
  "user@wanshi.com": { password: "user123", role: "customer" },
  "priya@wanshi.com": { password: "priya123", role: "customer" },
};

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
  const entry = CREDENTIALS[key];
  if (!entry || entry.password !== password) {
    return { ok: false, error: "Invalid email or password" };
  }
  const user: DemoAuthUser = {
    id: entry.role === "admin" ? "demo-user-admin" : `demo-user-${key.replace(/[^a-z0-9]/gi, "")}`,
    email: key,
  };
  localStorage.setItem(`wanshi.demo_role.${user.id}`, entry.role);
  persistSession(user);
  return { ok: true, user, role: entry.role };
}

export function demoSignUp(email: string, _password: string, fullName: string) {
  void _password;
  const id = `demo-u-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const user: DemoAuthUser = {
    id,
    email: email.trim().toLowerCase(),
    app_metadata: { full_name: fullName },
  };
  localStorage.setItem(`wanshi.demo_role.${id}`, "customer");
  const profilesRaw = localStorage.getItem("wanshi.demo_profiles") ?? "{}";
  try {
    const map = JSON.parse(profilesRaw) as Record<
      string,
      { full_name: string; phone_number: string; default_address: string }
    >;
    map[id] = { full_name: fullName, phone_number: "", default_address: "" };
    localStorage.setItem("wanshi.demo_profiles", JSON.stringify(map));
  } catch {
    localStorage.setItem(
      "wanshi.demo_profiles",
      JSON.stringify({
        [id]: { full_name: fullName, phone_number: "", default_address: "" },
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
