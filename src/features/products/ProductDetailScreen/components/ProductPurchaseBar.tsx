import { PrimaryBtn } from "@/components/common";
import type { HomeProduct } from "@/features/home/home.data";
import type { PackageOption } from "@/features/products/product-detail.data";
import type { AppColors } from "@/hooks/use-app-colors";
import { MessageCircle, Plus, Zap } from "lucide-react-native";
import { Alert, Pressable, View } from "react-native";

type ProductPurchaseBarProps = {
  product: HomeProduct;
  selectedPackage: PackageOption;
  quantity: number;
  colors: AppColors;
};

export function ProductPurchaseBar({ product, selectedPackage, quantity, colors }: ProductPurchaseBarProps) {
  function handleAddToCart() {
    Alert.alert("Đã thêm vào giỏ", `${quantity} × ${product.name} (${selectedPackage.label})`);
  }

  return (
    <View className="flex-row items-center gap-2 border-t border-border bg-surface-container-lowest px-4 py-3 dark:border-primary/20">
      <Pressable accessibilityRole="button" accessibilityLabel="Tư vấn sản phẩm" onPress={() => Alert.alert("Tư vấn sản phẩm", "Đội ngũ Organic Việt Nam sẽ sớm hỗ trợ bạn.")} className="h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-surface-container-low">
        <MessageCircle color={colors.primary} size={20} />
      </Pressable>
      <PrimaryBtn title="Thêm vào giỏ" variant="secondary" className="min-h-12 flex-1 rounded-xl px-2" leadingIcon={<Plus color={colors.primary} size={18} />} labelClassName="text-label-md" onPress={handleAddToCart} />
      <PrimaryBtn title="Mua ngay" variant="primary" className="min-h-12 flex-1 rounded-xl px-2" leadingIcon={<Zap color={colors.onPrimary} size={18} />} labelClassName="text-label-md" onPress={() => Alert.alert("Mua ngay", "Đơn hàng sẽ được tạo khi tích hợp thanh toán.")} />
    </View>
  );
}
