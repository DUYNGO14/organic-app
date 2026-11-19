import type { ProductDetailSpec } from "@/features/products/product-detail.data";
import type { AppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { Leaf, MapPin } from "lucide-react-native";
import { Text, View } from "react-native";
import { DetailCard } from "./DetailCard";

const originMapImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBfJ0MOy9CiuHFVFVd6CXouohaphR4djLSFb99NK36YBQRktB8m2pewAaywCeDCyPO2KeDrAA-YOkgh6yMUoRizAsbzN4A9ZmjPW44aRmzkSXUTn3io_DiSESObha-yuObno--Kp85foHdRqFbIEQjHQjJDbf9BKX2dHEm8YHVuafyhVjFk4EbmW4H8_BrdyWe5tKCGCMmw0m5I7Xxm-k6d7KRpJtcAJmnbTOVcKL0";

export function ProductOriginCard({ spec, colors }: { spec: ProductDetailSpec; colors: AppColors }) {
  return (
    <DetailCard>
      <View className="mb-3 flex-row items-center gap-2"><MapPin color={colors.primary} size={21} /><Text className="font-vietnam text-title-md text-ink">Vùng trồng & xuất xứ</Text></View>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary-container"><Leaf color={colors.primary} size={23} /></View>
        <View className="min-w-0 flex-1"><Text className="font-vietnam text-body-emphasis text-ink">{spec.farmName}</Text><Text className="font-vietnam text-body-md text-muted">{spec.location}</Text></View>
      </View>
      <View className="relative mt-3 h-32 overflow-hidden rounded-xl bg-surface-container-low">
        <Image accessibilityLabel={`Vùng trồng ${spec.location}`} contentFit="cover" source={originMapImage} style={{ width: "100%", height: "100%" }} />
        <View className="absolute bottom-2 left-2 flex-row items-center gap-1 rounded-lg bg-surface-container-lowest/95 px-2.5 py-1.5"><MapPin color={colors.primary} size={14} /><Text className="font-vietnam text-label-sm text-ink">Nhà màng công nghệ cao</Text></View>
      </View>
      <Text className="mt-3 font-vietnam text-body-md text-muted">Sản phẩm được chăm sóc tại vùng trồng đối tác, thu hoạch theo mùa và kiểm tra trước khi đóng gói.</Text>
    </DetailCard>
  );
}
