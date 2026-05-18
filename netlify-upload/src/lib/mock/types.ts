export type OfferRow = {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number | null;
  banner_image_url: string | null;
  is_active: boolean;
};

export type AdPosition = "hero" | "sidebar" | "banner";

export type AdvertisementRow = {
  id: string;
  title: string;
  position: AdPosition;
  image_url: string | null;
  is_active: boolean;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  image_url: string | null;
  /** Shipping / handling estimate (kg). */
  weight_kg: number;
  stock_quantity: number;
  is_active: boolean;
};

export type OrderStatus = "Pending" | "Accepted" | "In-Transit" | "Delivered" | "Cancelled";

export type StoredOrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
};

export type StoredOrder = {
  id: string;
  order_number: number;
  user_id: string;
  created_at: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string | null;
  shipping_phone: string | null;
  payment_method?: "cod" | "bank";
  order_items: StoredOrderItem[];
  shipments?: {
    tracking_number: string | null;
    estimated_delivery: string | null;
    delivery_partners: { name: string | null };
  }[];
};
