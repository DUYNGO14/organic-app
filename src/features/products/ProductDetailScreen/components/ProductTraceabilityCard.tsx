import { PrimaryBtn } from "@/components/common";
import type { ProductDetailSpec } from "@/features/products/product-detail.data";
import type { AppColors } from "@/hooks/use-app-colors";
import { Alert, Text, View } from "react-native";
import { ArrowRight, QrCode } from "lucide-react-native";

export function ProductTraceabilityCard({ spec, colors }: { spec: ProductDetailSpec; colors: AppColors }) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-4">
      <View className="h-14 w-14 items-center justify-center rounded-xl bg-surface-container-lowest"><QrCode color={colors.primary} size={34} /></View>
      <View className="min-w-0 flex-1">
        <Text className="font-vietnam text-label-sm uppercase text-secondary">Minh bạch nguồn gốc</Text>
        <Text className="mt-1 font-vietnam text-body-emphasis text-ink">Lô hái #KL-2408</Text>
        <Text className="font-vietnam text-body-sm text-muted">{spec.location} · {spec.harvestTime}</Text>
      </View>
      <PrimaryBtn title="Xem ký sự" variant="secondary" className="min-h-10 px-3 py-2" labelClassName="text-label-sm" trailingIcon={<ArrowRight color={colors.primary} size={15} />} onPress={() => Alert.alert("Nhật ký nông trại", "Thông tin nhật ký sẽ được cập nhật cùng dữ liệu sản phẩm.")} />
    </View>
  );
}
