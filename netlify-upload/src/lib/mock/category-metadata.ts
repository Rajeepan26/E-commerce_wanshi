/** Shop categories: banners, slugs, and seed IDs (`catalog-store` imports ids / names / slugs). */

export type ShopCategoryBanner = {
  id: string;
  name: string;
  slug: string;
  bannerUrl: string;
};

const host = "https://images.unsplash.com";

/** Width-only resize — some `fit=crop` variants 404 on Imgix for certain photos. */
export function unsplashPhoto(photoPath: string, w: number): string {
  return `${host}/${photoPath}?auto=format&w=${w}&q=80`;
}

export const SHOP_CATEGORY_BANNERS: ShopCategoryBanner[] = [
  {
    id: "cat-women-cloths",
    name: "Women cloths",
    slug: "women-cloths",
    bannerUrl: unsplashPhoto("photo-1490481651871-ab68de25d43d", 720),
  },
  {
    id: "cat-men-cloths",
    name: "Men cloths",
    slug: "men-cloths",
    bannerUrl: unsplashPhoto("photo-1503341504253-dff4815485f1", 720),
  },
  {
    id: "cat-kids-cloths",
    name: "Kids cloths",
    slug: "kids-cloths",
    bannerUrl: unsplashPhoto("photo-1503454537195-1dcabb73ffb9", 720),
  },
  {
    id: "cat-kids-toys",
    name: "Kids Items",
    slug: "kids-toys",
    bannerUrl: unsplashPhoto("photo-1566576912321-d58ddd7a6088", 720),
  },
  {
    id: "cat-computer-parts",
    name: "Computer parts",
    slug: "computer-parts",
    bannerUrl: unsplashPhoto("photo-1544197150-b99a580bb7a8", 720),
  },
  {
    id: "cat-electrical-things",
    name: "Electrical things",
    slug: "electrical-things",
    bannerUrl: unsplashPhoto("photo-1621905252507-b35492cc74b4", 720),
  },
  {
    id: "cat-electronics",
    name: "Electronics",
    slug: "electronics",
    bannerUrl: unsplashPhoto("photo-1498049794561-7780e7231661", 720),
  },
  {
    id: "cat-furniture",
    name: "Furniture",
    slug: "furniture",
    bannerUrl: unsplashPhoto("photo-1586023492125-27b2c045efd7", 720),
  },
  {
    id: "cat-home-products",
    name: "Home products · mixer, grinder, heater",
    slug: "home-products",
    bannerUrl: unsplashPhoto("photo-1582719478250-c89cae4dc85b", 720),
  },
];
