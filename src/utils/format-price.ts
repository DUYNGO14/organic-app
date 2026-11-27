import { getFormattingLocale } from "@/localization";

const englishPrice = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "VND",
});
const vietnameseNumber = new Intl.NumberFormat("vi-VN");

export function formatPrice(price: number) {
  return getFormattingLocale() === "en-US"
    ? englishPrice.format(price)
    : `${vietnameseNumber.format(price)}đ`;
}
