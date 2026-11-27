import { getFormattingLocale } from "@/localization";

export function formatPoints(value: number) {
  return new Intl.NumberFormat(getFormattingLocale()).format(value);
}
