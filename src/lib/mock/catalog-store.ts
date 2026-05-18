/**
 * Demo catalog for frontend-only builds. Holds mutable arrays (admin edits this session).
 */
import type { AdvertisementRow, CategoryRow, OfferRow, ProductRow } from "@/lib/mock/types";
import { isPromoActiveNow } from "@/lib/mock/promo-schedule";
import { SHOP_CATEGORY_BANNERS, unsplashPhoto } from "@/lib/mock/category-metadata";

const SEED_CATEGORIES: CategoryRow[] = SHOP_CATEGORY_BANNERS.map(({ id, name, slug }) => ({
  id,
  name,
  slug,
}));

const img = (photoPath: string) => unsplashPhoto(photoPath, 640);

const SEED_PRODUCTS: ProductRow[] = [
  // Women cloths
  {
    id: "p-wc-kurti",
    name: "Printed cotton kurta · Wine",
    description: "Breathable cotton, machine wash.",
    price: 649,
    original_price: 1199,
    category_id: "cat-women-cloths",
    image_url: img("photo-1490481651871-ab68de25d43d"),
    weight_kg: 0.45,
    stock_quantity: 28,
    is_active: true,
  },
  {
    id: "p-wc-saree",
    name: "Silk blend saree · Emerald",
    description: "Lightweight drape with contrast border.",
    price: 1899,
    original_price: 2899,
    category_id: "cat-women-cloths",
    image_url: img("photo-1445205170230-053b83016050"),
    weight_kg: 0.85,
    stock_quantity: 12,
    is_active: true,
  },
  {
    id: "p-wc-denim",
    name: "High-rise denim jacket · Blue",
    description: "Stretch denim, metal buttons.",
    price: 1199,
    original_price: 1799,
    category_id: "cat-women-cloths",
    image_url: img("photo-1541099649105-f69ad21f3246"),
    weight_kg: 0.95,
    stock_quantity: 20,
    is_active: true,
  },
  // Men cloths
  {
    id: "p-mc-shirt",
    name: "Oxford casual shirt · White",
    description: "Regular fit, easy iron.",
    price: 799,
    original_price: 1299,
    category_id: "cat-men-cloths",
    image_url: img("photo-1602810318383-e386cc2a3ccf"),
    weight_kg: 0.42,
    stock_quantity: 35,
    is_active: true,
  },
  {
    id: "p-mc-chinos",
    name: "Slim tapered chinos · Khaki",
    description: "Cotton blend, concealed pockets.",
    price: 999,
    original_price: 1499,
    category_id: "cat-men-cloths",
    image_url: img("photo-1503341504253-dff4815485f1"),
    weight_kg: 0.55,
    stock_quantity: 26,
    is_active: true,
  },
  {
    id: "p-mc-hoodie",
    name: "Fleece hoodie · Charcoal",
    description: "Brushed fleece, kangaroo pocket.",
    price: 1299,
    original_price: 1999,
    category_id: "cat-men-cloths",
    image_url: img("photo-1556821840-3a63f95609a7"),
    weight_kg: 0.72,
    stock_quantity: 40,
    is_active: true,
  },
  // Kids cloths
  {
    id: "p-kc-tee-set",
    name: "Kids cotton tee combo (pack of 3)",
    description: "Assorted prints, soft jersey.",
    price: 449,
    original_price: 699,
    category_id: "cat-kids-cloths",
    image_url: img("photo-1503454537195-1dcabb73ffb9"),
    weight_kg: 0.38,
    stock_quantity: 55,
    is_active: true,
  },
  {
    id: "p-kc-dungaree",
    name: "Denim dungaree set · Indigo",
    description: "Adjustable straps, front pocket.",
    price: 749,
    original_price: 1099,
    category_id: "cat-kids-cloths",
    image_url: img("photo-1519238263530-99bdd11df2ea"),
    weight_kg: 0.48,
    stock_quantity: 22,
    is_active: true,
  },
  {
    id: "p-kc-night",
    name: "Kids nightsuit · Stars print",
    description: "Cotton knit, snug cuffs.",
    price: 399,
    original_price: 599,
    category_id: "cat-kids-cloths",
    image_url: img("photo-1445205170230-053b83016050"),
    weight_kg: 0.32,
    stock_quantity: 38,
    is_active: true,
  },
  // Kids toys
  {
    id: "p-toy-blocks",
    name: "Wooden building blocks · 48 pcs",
    description: "Non-toxic paint, storage tray.",
    price: 899,
    original_price: 1399,
    category_id: "cat-kids-toys",
    image_url: img("photo-1544197150-b99a580bb7a8"),
    weight_kg: 1.15,
    stock_quantity: 30,
    is_active: true,
  },
  {
    id: "p-toy-rc",
    name: "Remote control racer car · 1:18",
    description: "2.4GHz controller, rechargeable.",
    price: 1299,
    original_price: 1899,
    category_id: "cat-kids-toys",
    image_url: img("photo-1511707171634-5f897ff02aa9"),
    weight_kg: 1.4,
    stock_quantity: 18,
    is_active: true,
  },
  {
    id: "p-toy-plush",
    name: "Plush teddy bear · Large",
    description: "Super-soft, safety tested.",
    price: 649,
    original_price: 999,
    category_id: "cat-kids-toys",
    image_url: img("photo-1566576912321-d58ddd7a6088"),
    weight_kg: 0.62,
    stock_quantity: 44,
    is_active: true,
  },
  // Computer parts
  {
    id: "p-cp-ram",
    name: "DDR4 RAM 16GB kit (2×8) · 3200MHz",
    description: "Low-profile heat spreader.",
    price: 4299,
    original_price: 5499,
    category_id: "cat-computer-parts",
    image_url: img("photo-1544197150-b99a580bb7a8"),
    weight_kg: 0.06,
    stock_quantity: 25,
    is_active: true,
  },
  {
    id: "p-cp-ssd",
    name: "NVMe SSD 1TB PCIe Gen4",
    description: "Up to 5000 MB/s read.",
    price: 6599,
    original_price: 7999,
    category_id: "cat-computer-parts",
    image_url: img("photo-1498049794561-7780e7231661"),
    weight_kg: 0.07,
    stock_quantity: 16,
    is_active: true,
  },
  {
    id: "p-cp-keyboard",
    name: "Mechanical RGB gaming keyboard",
    description: "Hot-swap sockets, tactile switches.",
    price: 4999,
    original_price: 6499,
    category_id: "cat-computer-parts",
    image_url: img("photo-1444703686981-a3abbc4d4fe3"),
    weight_kg: 1.05,
    stock_quantity: 14,
    is_active: true,
  },
  // Electrical things
  {
    id: "p-el-extension",
    name: "Heavy-duty extension reel · 15m",
    description: "Thermal cut-out, 4 sockets.",
    price: 1899,
    original_price: 2499,
    category_id: "cat-electrical-things",
    image_url: img("photo-1621905252507-b35492cc74b4"),
    weight_kg: 3.6,
    stock_quantity: 32,
    is_active: true,
  },
  {
    id: "p-el-wires",
    name: "Copper house wire roll · 90m",
    description: "ISI marked FR PVC.",
    price: 3499,
    original_price: 4199,
    category_id: "cat-electrical-things",
    image_url: img("photo-1621905251189-08b45d6a269e"),
    weight_kg: 8.2,
    stock_quantity: 20,
    is_active: true,
  },
  {
    id: "p-el-mcb",
    name: "Miniature circuit breaker set (6-way DB)",
    description: "For home distribution board upgrade.",
    price: 2799,
    original_price: 3499,
    category_id: "cat-electrical-things",
    image_url: img("photo-1621905252507-b35492cc74b4"),
    weight_kg: 4.1,
    stock_quantity: 11,
    is_active: true,
  },
  // Electronics (consumer gadgets)
  {
    id: "p-elc-phone",
    name: "5G smartphone · 128GB",
    description: "Demo SKU — OLED display.",
    price: 18999,
    original_price: 22999,
    category_id: "cat-electronics",
    image_url: img("photo-1511707171634-5f897ff02aa9"),
    weight_kg: 0.21,
    stock_quantity: 9,
    is_active: true,
  },
  {
    id: "p-elc-headphones",
    name: "Wireless over-ear headphones",
    description: "ANC, 40h playback.",
    price: 7499,
    original_price: 9999,
    category_id: "cat-electronics",
    image_url: img("photo-1523275335684-37898b6baf30"),
    weight_kg: 0.33,
    stock_quantity: 22,
    is_active: true,
  },
  {
    id: "p-elc-earbuds",
    name: "True wireless earbuds · Pro",
    description: "IPX4, low-latency mode.",
    price: 3499,
    original_price: 4999,
    category_id: "cat-electronics",
    image_url: img("photo-1523275335684-37898b6baf30"),
    weight_kg: 0.05,
    stock_quantity: 45,
    is_active: true,
  },
  // Furniture
  {
    id: "p-fur-sofa",
    name: "3-seater fabric sofa · Grey",
    description: "Removable cushions, walnut legs.",
    price: 24999,
    original_price: 32999,
    category_id: "cat-furniture",
    image_url: img("photo-1555041469-a586c61ea9bc"),
    weight_kg: 42,
    stock_quantity: 4,
    is_active: true,
  },
  {
    id: "p-fur-desk",
    name: "Solid wood study desk",
    description: "Cable grommet, drawer unit.",
    price: 8999,
    original_price: 11999,
    category_id: "cat-furniture",
    image_url: img("photo-1595428774223-ef52624120d2"),
    weight_kg: 28,
    stock_quantity: 7,
    is_active: true,
  },
  {
    id: "p-fur-chair",
    name: "Ergonomic mesh office chair",
    description: "Lumbar support, recline lock.",
    price: 7599,
    original_price: 9999,
    category_id: "cat-furniture",
    image_url: img("photo-1586023492125-27b2c045efd7"),
    weight_kg: 12,
    stock_quantity: 15,
    is_active: true,
  },
  // Home products — mixer, grinder, heater
  {
    id: "p-hp-mixer",
    name: "Stand mixer · 600W · 6 speeds",
    description: "Tilt-head, planetary mixing.",
    price: 6499,
    original_price: 8999,
    category_id: "cat-home-products",
    image_url: img("photo-1582719478250-c89cae4dc85b"),
    weight_kg: 6.4,
    stock_quantity: 12,
    is_active: true,
  },
  {
    id: "p-hp-grinder",
    name: "Mixer-grinder · 750W · 3 jars",
    description: "Dry/wet grinding for masala & chutney.",
    price: 5299,
    original_price: 6999,
    category_id: "cat-home-products",
    image_url: img("photo-1550009158-9ebf69173e03"),
    weight_kg: 5.3,
    stock_quantity: 10,
    is_active: true,
  },
  {
    id: "p-hp-heater",
    name: "Oil-filled room heater · 9 fins",
    description: "Tip-over switch, thermostat.",
    price: 6999,
    original_price: 8499,
    category_id: "cat-home-products",
    image_url: img("photo-1600585154340-be6161a56a0c"),
    weight_kg: 9.6,
    stock_quantity: 8,
    is_active: true,
  },
];

const SEED_OFFERS: OfferRow[] = [
  {
    id: "off-monsoon",
    title: "Fresh fits for everyone",
    description: "Women, men & kids cloths — extra savings this week.",
    discount_percentage: 45,
    banner_image_url: unsplashPhoto("photo-1441986300917-64674bd600d8", 1280),
    is_active: true,
    /** Demo: “New” badge within ~1 week */
    starts_at: "2026-05-17",
    ends_at: "2026-08-31",
  },
  {
    id: "off-home-tech",
    title: "Electronics & home appliances",
    description: "Gadgets, parts, and mixers — deals under ₹8k.",
    discount_percentage: 35,
    banner_image_url: unsplashPhoto("photo-1550009158-9ebf69173e03", 1280),
    is_active: true,
    starts_at: "2026-03-01",
    /** Demo: “Closing soon” (~1 week ending May 24) */
    ends_at: "2026-05-24",
  },
];

const SEED_ADS: AdvertisementRow[] = [
  {
    id: "ad-hero",
    title: "Easy Returns | Fast dispatch | COD available",
    position: "hero",
    image_url: null,
    is_active: true,
    starts_at: null,
    ends_at: null,
  },
];

const categoriesState = [...SEED_CATEGORIES];
let productsState = [...SEED_PRODUCTS];
let offersState = [...SEED_OFFERS];
let adsState = [...SEED_ADS];

export function cloneCategories(): CategoryRow[] {
  return categoriesState.map((c) => ({ ...c }));
}

export function getCategoryBySlug(slug: string): CategoryRow | undefined {
  return categoriesState.find((c) => c.slug === slug);
}

export function getCategoryById(id: string | null | undefined): CategoryRow | undefined {
  if (id == null || id === "") return undefined;
  return categoriesState.find((c) => c.id === id);
}

export function getCategoryIdBySlug(slug: string): string | undefined {
  return getCategoryBySlug(slug)?.id;
}

export function cloneActiveOffers(): OfferRow[] {
  return offersState.filter((o) => isPromoActiveNow(o));
}

export function cloneActiveAds(): AdvertisementRow[] {
  return adsState.filter((a) => isPromoActiveNow(a));
}

export function cloneProductsActive(options?: {
  q?: string;
  categorySlug?: string;
  categoryId?: string | null;
  limit?: number;
}): ProductRow[] {
  let rows = productsState.filter((p) => p.is_active);
  const catId =
    options?.categoryId ??
    (options?.categorySlug ? getCategoryIdBySlug(options.categorySlug) : undefined);
  if (catId) rows = rows.filter((p) => p.category_id === catId);
  if (options?.q?.trim()) {
    const t = options.q.trim().toLowerCase();
    rows = rows.filter((p) => p.name.toLowerCase().includes(t));
  }
  if (options?.limit != null) rows = rows.slice(0, options.limit);
  return rows.map((p) => ({ ...p }));
}

export function cloneProduct(id: string): ProductRow | undefined {
  const p = productsState.find((x) => x.id === id);
  return p ? { ...p } : undefined;
}

export function cloneProductsForAdmin(): (ProductRow & { categories?: { name: string } | null })[] {
  return productsState.map((p) => ({
    ...p,
    categories: categoriesState.find((c) => c.id === p.category_id)
      ? { name: categoriesState.find((c) => c.id === p.category_id)!.name }
      : null,
  }));
}

export function cloneCategoriesForAdmin(): CategoryRow[] {
  return cloneCategories();
}

export function cloneOffersAdmin(): OfferRow[] {
  return offersState.map((o) => ({ ...o }));
}

export function cloneAdsAdmin(): AdvertisementRow[] {
  return adsState.map((a) => ({ ...a }));
}

export function deleteOffer(id: string) {
  offersState = offersState.filter((o) => o.id !== id);
}

export function deleteAdvertisement(id: string) {
  adsState = adsState.filter((a) => a.id !== id);
}

export function insertOffer(row: Omit<OfferRow, "id">): OfferRow {
  const id = `off-${crypto.randomUUID()}`;
  const r: OfferRow = { ...row, id };
  offersState = [...offersState, r];
  return r;
}

export function insertAdvertisement(row: Omit<AdvertisementRow, "id">): AdvertisementRow {
  const id = `ad-${crypto.randomUUID()}`;
  const r: AdvertisementRow = { ...row, id };
  adsState = [...adsState, r];
  return r;
}

export function deleteProduct(id: string) {
  productsState = productsState.filter((p) => p.id !== id);
}

export function upsertProduct(row: Omit<ProductRow, "id"> & { id?: string }) {
  let w = Number(row.weight_kg);
  if (!Number.isFinite(w) || w < 0) {
    w = row.id ? (productsState.find((p) => p.id === row.id)?.weight_kg ?? 1) : 1;
  }
  const normalized: Omit<ProductRow, "id"> & { id?: string } = { ...row, weight_kg: w };

  if (normalized.id) {
    productsState = productsState.map((p) =>
      p.id === normalized.id ? { ...p, ...normalized, id: normalized.id } : p,
    );
  } else {
    const id = `p-${crypto.randomUUID()}`;
    productsState.push({ ...(normalized as Omit<ProductRow, "id">), id });
  }
}

export function getCatalogCounts() {
  return {
    products: productsState.length,
    categories: categoriesState.length,
    offers: offersState.length,
    ads: adsState.length,
  };
}
