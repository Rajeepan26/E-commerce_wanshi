/** Demo weight + delivery rules for product views (not applied in cart totals). */

export const DELIVERY_FLAT_INR = 500;
export const WEIGHT_FEE_UNDER_5KG_INR = 1500;
export const WEIGHT_FEE_5_TO_10KG_INR = 2000;

/**
 * 0–5 kg (inclusive) → ₹1,500. Above 5 kg through 10 kg → ₹2,000. Above 10 kg → ₹2,000 (capped tier).
 */
export function weightHandlingFeeInr(weightKg: number): number {
  const w = Math.max(0, Number(weightKg) || 0);
  if (w <= 5) return WEIGHT_FEE_UNDER_5KG_INR;
  if (w <= 10) return WEIGHT_FEE_5_TO_10KG_INR;
  return WEIGHT_FEE_5_TO_10KG_INR;
}

/** Row label in “Additional” breakdown. */
export function weightHandlingLineLabel(): string {
  return "Weight fee";
}

export function appliedWeightFeeBracketLabel(weightKg: number): string {
  const w = Math.max(0, Number(weightKg) || 0);
  if (w <= 5) return "0–5 kg bracket";
  if (w <= 10) return "6–10 kg bracket";
  return "Heavy (max tier)";
}

export function orderTotalWithShippingInr(itemPriceInr: number, weightKg: number): number {
  const price = Number(itemPriceInr) || 0;
  return price + weightHandlingFeeInr(weightKg) + DELIVERY_FLAT_INR;
}
