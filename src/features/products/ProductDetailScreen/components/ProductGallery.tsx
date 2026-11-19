import type { HomeProduct } from "@/features/home/home.data";
import type { ProductDetailSpec } from "@/features/products/product-detail.data";
import type { AppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { Activity, Clock3, Leaf } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

type ProductGalleryProps = {
  product: HomeProduct;
  spec: ProductDetailSpec;
  imageIndex: number;
  onImageSelect: (index: number) => void;
  colors: AppColors;
};

export function ProductGallery({ product, spec, imageIndex, onImageSelect, colors }: ProductGalleryProps) {
  const currentImage = spec.gallery[imageIndex] ?? product.image;

  return (
    <View className="overflow-hidden rounded-2xl border border-[#F0F4EC] bg-surface-container-lowest shadow-sm dark:border-[#00E676]/[0.12]">
      <View className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
        <Image accessibilityLabel={product.name} cachePolicy="disk" contentFit="cover" source={currentImage} style={{ width: "100%", height: "100%" }} transition={200} />
        <View className="absolute left-3 top-3 gap-2">
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-surface-container-lowest/95 px-3 py-2">
            <Leaf color={colors.secondary} fill={colors.secondary} size={15} />
            <Text className="font-vietnam text-label-md text-primary">{product.origin}</Text>
          </View>
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-secondary px-3 py-2">
            <Clock3 color={colors.onPrimary} size={15} />
            <Text className="font-vietnam text-label-md text-on-primary">Thu hoạch sáng nay {spec.harvestTime}</Text>
          </View>
        </View>
        <View className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5">
          <Text className="font-vietnam text-label-sm text-white">{imageIndex + 1} / {spec.gallery.length}</Text>
        </View>
      </View>
      <ScrollView horizontal contentContainerStyle={{ padding: 10, gap: 8 }} showsHorizontalScrollIndicator={false}>
        {spec.gallery.map((image, index) => (
          <Pressable key={`${product.id}-gallery-${index}`} accessibilityRole="button" accessibilityLabel={`Xem ảnh ${index + 1}`} onPress={() => onImageSelect(index)} className="h-16 w-16 overflow-hidden rounded-xl border-2" style={{ borderColor: imageIndex === index ? colors.primary : "transparent" }}>
            <Image contentFit="cover" source={image} style={{ width: "100%", height: "100%" }} />
          </Pressable>
        ))}
        <View className="h-16 w-16 items-center justify-center rounded-xl bg-surface-container-low">
          <Activity color={colors.primary} size={22} />
        </View>
      </ScrollView>
    </View>
  );
}
