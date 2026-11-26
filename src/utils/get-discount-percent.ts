export function getDiscountPercent(price: number, oldPrice?: number) {
  if (
    oldPrice === undefined ||
    !Number.isFinite(oldPrice) ||
    !Number.isFinite(price) ||
    price < 0 ||
    price >= oldPrice
  ) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
