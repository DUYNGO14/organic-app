import { CertBadge, StatusChip } from "@/components/common";
import type { BaseProduct } from "@/types/product";
import { getDiscountPercent } from "@/utils/get-discount-percent";

type ProductCardLabels = {
  promotionLabel?: string;
  topLabel?: string;
  bottomLabel?: string;
};

export function getProductCardBadges(
  product: BaseProduct,
  { promotionLabel, topLabel, bottomLabel }: ProductCardLabels,
) {
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const label = promotionLabel || topLabel;

  return {
    topLeft: product.certification ? (
      <CertBadge label={product.certification} showIcon={false} />
    ) : label ? (
      <StatusChip label={label} tone={promotionLabel ? "info" : "neutral"} />
    ) : null,
    bottomLeft: discount > 0 ? (
      <StatusChip label={`-${discount}%`} tone="danger" />
    ) : bottomLabel ? (
      <StatusChip label={bottomLabel} />
    ) : null,
  };
}
