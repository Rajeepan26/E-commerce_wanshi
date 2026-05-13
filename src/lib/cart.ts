import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
};

const KEY = "wanshi.cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("wanshi:cart"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener("wanshi:cart", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("wanshi:cart", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    const cur = read();
    const idx = cur.findIndex((i) => i.id === item.id);
    if (idx >= 0) cur[idx].quantity += qty;
    else cur.push({ ...item, quantity: qty });
    write(cur);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, q: number) => {
    const cur = read();
    const idx = cur.findIndex((i) => i.id === id);
    if (idx >= 0) {
      cur[idx].quantity = Math.max(1, q);
      write(cur);
    }
  }, []);

  const clear = useCallback(() => write([]), []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, add, remove, setQty, clear, total, count };
}