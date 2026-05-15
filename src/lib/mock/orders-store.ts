import type { OrderStatus, StoredOrder, StoredOrderItem } from "@/lib/mock/types";

const STORAGE_KEY = "wanshi.demo_orders";

function readAll(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(orders: StoredOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("wanshi:orders"));
}

function nextOrderNumber(): number {
  const orders = readAll();
  const max =
    orders.length === 0 ? 999 : Math.max(...orders.map((o) => Number(o.order_number) || 0));
  return max + 1;
}

function makeItemId(): string {
  return `oi-${crypto.randomUUID()}`;
}

export function subscribeOrders(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener("storage", handler);
  window.addEventListener("wanshi:orders", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("wanshi:orders", handler);
  };
}

export function listOrders(userId?: string): StoredOrder[] {
  const all = readAll();
  if (!userId) return [...all];
  return all.filter((o) => o.user_id === userId);
}

export function appendDemoOrder(payload: {
  userId: string;
  total: number;
  paymentMethod: "cod" | "bank";
  items: Omit<StoredOrderItem, "id">[];
}): StoredOrder | null {
  if (typeof window === "undefined") return null;

  const id = crypto.randomUUID();
  const num = nextOrderNumber();
  const items: StoredOrderItem[] = payload.items.map((i) => ({
    ...i,
    id: makeItemId(),
  }));

  const order: StoredOrder = {
    id,
    order_number: num,
    user_id: payload.userId,
    created_at: new Date().toISOString(),
    status: "Pending",
    total_amount: payload.total,
    shipping_address: "Demo storefront — address captured at checkout in production.",
    shipping_phone: "+919999999999",
    payment_method: payload.paymentMethod,
    order_items: items,
    shipments: [
      {
        tracking_number: `DEMO${String(num).padStart(7, "0")}`,
        estimated_delivery: new Date(Date.now() + 2 * 86400000).toLocaleDateString(),
        delivery_partners: { name: "Demo Logistics" },
      },
    ],
  };

  writeAll([...readAll(), order]);
  return order;
}

export function aggregateOrderStats(): { count: number; revenue: number } {
  const all = readAll();
  return {
    count: all.length,
    revenue: all.reduce((s, o) => s + Number(o.total_amount ?? 0), 0),
  };
}

export function updateOrderStatus(orderId: string, status: OrderStatus): boolean {
  const all = readAll();
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx < 0) return false;
  const next = [...all];
  next[idx] = { ...next[idx], status };
  if (status === "Delivered") {
    next[idx] = { ...next[idx], shipments: [] };
  }
  writeAll(next);
  return true;
}
