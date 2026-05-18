export const inr = (n: number | string) =>
  `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const discountPct = (price: number, original?: number | null) => {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};
