import { cloneCategories } from "@/lib/mock/catalog-store";
import { CategoryClient } from "./category-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return cloneCategories().map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage() {
  return <CategoryClient />;
}
