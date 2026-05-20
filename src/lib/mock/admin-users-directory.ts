import { listAdminCreatedUsers } from "@/lib/mock/admin-user-registry";
import { listPresetCredentials } from "@/lib/mock/auth-session";
import { profileFullName, readDemoProfilesMap } from "@/lib/mock/demo-profiles";
import {
  getPresetCredentialSessionUserId,
  PRESET_DEFAULT_FULL_NAMES,
} from "@/lib/mock/preset-demo-credentials";

export type AdminDirectoryUserRow = {
  id: string;
  source: "preset" | "registry";
  full_name: string;
  email: string;
  role: "admin" | "customer";
  phone_display: string;
  status: "Active" | "Deleted";
  deletable: boolean;
};

function formatPhone(phone: string | undefined | null): string {
  const t = (phone ?? "").trim();
  return t.length > 0 ? t : "—";
}

/** All known users: built-in presets plus admin-created registry entries. */
export function listAdminUserDirectory(): AdminDirectoryUserRow[] {
  const profiles = readDemoProfilesMap();
  const presets = listPresetCredentials();
  const registry = listAdminCreatedUsers();

  const presetRows: AdminDirectoryUserRow[] = presets.map((p) => {
    const id = getPresetCredentialSessionUserId(p.email, p.role);
    const prof = profiles[id];
    const fromProfile = profileFullName(prof);
    const fullName =
      fromProfile ||
      PRESET_DEFAULT_FULL_NAMES[p.email.trim().toLowerCase()] ||
      p.email.split("@")[0] ||
      p.email;
    return {
      id,
      source: "preset",
      full_name: fullName,
      email: p.email,
      role: p.role,
      phone_display: formatPhone(prof?.phone_number),
      status: "Active",
      deletable: false,
    };
  });

  const registryRows: AdminDirectoryUserRow[] = registry.map((u) => {
    const prof = profiles[u.id];
    const fromProfile = profileFullName(prof);
    const fullName = fromProfile || u.full_name;
    return {
      id: u.id,
      source: "registry",
      full_name: fullName,
      email: u.email,
      role: u.role,
      phone_display: formatPhone(prof?.phone_number),
      status: u.is_deleted ? "Deleted" : "Active",
      deletable: !u.is_deleted,
    };
  });

  return [...presetRows, ...registryRows].sort((a, b) => a.email.localeCompare(b.email));
}
