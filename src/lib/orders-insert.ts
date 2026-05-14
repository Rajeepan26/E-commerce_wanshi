import type { SupabaseClient } from "@supabase/supabase-js";

/** When payment columns aren't on `orders` yet, pack metadata into shipping_address. */
export const LEGACY_ORDER_META_MARKER = "[WANSI_ORDER_PAYMENT_META:v1]";

const RECEIPT_CHARS_SAFE_MAX = 250_000;

function paymentColumnsProbablyMissing(errorMessage: string) {
  const m = errorMessage.toLowerCase();
  return (
    m.includes("bank_details") ||
    m.includes("payment_method") ||
    m.includes("receipt_url") ||
    (m.includes("schema cache") && m.includes("orders"))
  );
}

function buildLegacyShippingAddress(params: {
  paymentMethod: "cod" | "bank";
  bankSnapshot: string;
  receiptDataUrl: string | null;
}) {
  if (params.paymentMethod === "cod") {
    return `${LEGACY_ORDER_META_MARKER}\nPayment method: cod`;
  }

  let receiptPart = "";
  let truncated = false;
  if (params.receiptDataUrl) {
    if (params.receiptDataUrl.length > RECEIPT_CHARS_SAFE_MAX) {
      truncated = true;
      receiptPart = params.receiptDataUrl.slice(0, RECEIPT_CHARS_SAFE_MAX);
    } else {
      receiptPart = params.receiptDataUrl;
    }
  }

  const lines = [
    LEGACY_ORDER_META_MARKER,
    "Payment method: bank_transfer",
    "",
    "--- Bank details (customer selected) ---",
    params.bankSnapshot,
    "",
    "--- Receipt (uploaded image, data URL) ---",
    receiptPart || "(no receipt file uploaded)",
    truncated ? "\n[WANSI_RECEIPT_DATA_TRUNCATED=yes]\n(original length exceeds safe limit)" : "",
  ].filter(Boolean);

  return lines.join("\n");
}

export type InsertOrderFlexibleResult = {
  data: { id: string; order_number: number } | null;
  error: { message: string } | null;
  usedLegacyPaymentFallback: boolean;
};

export async function insertOrderFlexible(
  supabase: SupabaseClient,
  args: {
    userId: string;
    total: number;
    paymentMethod: "cod" | "bank";
    bankSnapshot: string;
    receiptDataUrl: string | null;
  },
): Promise<InsertOrderFlexibleResult> {
  const modernPayload = {
    user_id: args.userId,
    total_amount: args.total,
    status: "Pending" as const,
    shipping_address: null as string | null,
    shipping_phone: null as string | null,
    payment_method: args.paymentMethod,
    bank_details: args.paymentMethod === "bank" ? args.bankSnapshot : null,
    receipt_url: args.paymentMethod === "bank" ? args.receiptDataUrl : null,
  };

  let { data, error } = await supabase
    .from("orders")
    .insert(modernPayload)
    .select("id, order_number")
    .single();

  if (!error && data) return { data, error: null, usedLegacyPaymentFallback: false };

  const errMsg = error?.message ?? "";
  if (!paymentColumnsProbablyMissing(errMsg))
    return { data: null, error, usedLegacyPaymentFallback: false };

  const fallbackAddress = buildLegacyShippingAddress({
    paymentMethod: args.paymentMethod,
    bankSnapshot: args.bankSnapshot,
    receiptDataUrl: args.paymentMethod === "bank" ? args.receiptDataUrl : null,
  });

  const legacyPayload = {
    user_id: args.userId,
    total_amount: args.total,
    status: "Pending" as const,
    shipping_address: fallbackAddress,
    shipping_phone: null as string | null,
  };

  ({ data, error } = await supabase
    .from("orders")
    .insert(legacyPayload)
    .select("id, order_number")
    .single());
  return { data, error, usedLegacyPaymentFallback: !error };
}
