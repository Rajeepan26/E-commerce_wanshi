export const inr = (n: number | string) =>
  `LKR ${Number(n).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

export const discountPct = (price: number, original?: number | null) => {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};
