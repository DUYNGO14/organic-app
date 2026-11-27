import { useTranslation } from "react-i18next";
import { PrimaryBtn } from "@/components/common";
import { addToCart } from "@/features/cart/add-to-cart";
import type { PackageOption, Product } from "@/types/product";
import type { AppColors } from "@/hooks/use-app-colors";
import { MessageCircle, Plus, Zap } from "lucide-react-native";
import { Alert, Pressable, View } from "react-native";

type ProductPurchaseBarProps = {
  product: Product;
  selectedPackage: PackageOption;
  quantity: number;
  colors: AppColors;
  onBuyNow: () => void;
};

export function ProductPurchaseBar({ product, selectedPackage, quantity, colors, onBuyNow }: ProductPurchaseBarProps) {
  const { t } = useTranslation();
  function handleAddToCart() {
    addToCart(product, selectedPackage, quantity);
  }

  return (
    <View className="flex-row items-center gap-2 border-t border-border bg-surface-container-lowest px-4 py-3 dark:border-primary/20">
      <Pressable accessibilityRole="button" accessibilityLabel={t("products.productSupport")} onPress={() => Alert.alert(t("products.productSupport"), t("products.theAdigoTeamWillHelpYou"))} className="h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-surface-container-low">
        <MessageCircle color={colors.primary} size={20} />
      </Pressable>
      <PrimaryBtn title={t("products.addToCart")} variant="secondary" className="min-h-12 flex-1 rounded-xl px-2" leadingIcon={<Plus color={colors.primary} size={18} />} labelClassName="text-label-md" onPress={handleAddToCart} />
      <PrimaryBtn title="Mua ngay" variant="primary" className="min-h-12 flex-1 rounded-xl px-2" leadingIcon={<Zap color={colors.onPrimary} size={18} />} labelClassName="text-label-md" onPress={onBuyNow} />
    </View>
  );
}
