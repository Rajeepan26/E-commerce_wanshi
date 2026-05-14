"use client";

import { createContext, useContext } from "react";

export type ProductQuickViewContextValue = {
  openProduct: (id: string) => void;
};

export const ProductQuickViewContext = createContext<ProductQuickViewContextValue | null>(null);

export function useProductQuickView() {
  const ctx = useContext(ProductQuickViewContext);
  if (!ctx) throw new Error("useProductQuickView must be used within ProductQuickViewProvider");
  return ctx;
}
