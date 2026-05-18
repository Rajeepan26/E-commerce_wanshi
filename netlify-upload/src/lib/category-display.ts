import { getCategoryBySlug } from "@/lib/mock/catalog-store";

/** Title-case each word (e.g. "Men cloths" → "Men Cloths"). */
export function titleCaseCategoryLabel(name: string): string {
  return name.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function headingFromSlugFallback(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Display label for a category slug (no "Category:" prefix). */
export function categoryHeadingFromSlug(slug: string): string {
  const c = getCategoryBySlug(slug);
  if (c?.name) return titleCaseCategoryLabel(c.name);
  return headingFromSlugFallback(slug);
}
