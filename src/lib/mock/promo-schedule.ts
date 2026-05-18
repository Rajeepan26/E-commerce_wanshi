/** YYYY-MM-DD interpreted in local TZ (start/end of calendar day). */
export function parseDayStart(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d).setHours(0, 0, 0, 0);
}

export function parseDayEnd(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d).setHours(23, 59, 59, 999);
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function isPromoActiveNow(row: {
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}): boolean {
  if (!row.is_active) return false;
  const now = Date.now();
  if (row.starts_at && now < parseDayStart(row.starts_at)) return false;
  if (row.ends_at && now > parseDayEnd(row.ends_at)) return false;
  return true;
}

export function promoScheduleBadges(row: {
  starts_at: string | null;
  ends_at: string | null;
}): ("New" | "Closing soon")[] {
  const now = Date.now();
  const out: ("New" | "Closing soon")[] = [];
  let started = true;
  if (row.starts_at) {
    const s = parseDayStart(row.starts_at);
    started = now >= s;
    if (started && now - s <= WEEK_MS) out.push("New");
  }
  if (row.ends_at) {
    const e = parseDayEnd(row.ends_at);
    if (started && now <= e && e - now <= WEEK_MS) out.push("Closing soon");
  }
  return out;
}
