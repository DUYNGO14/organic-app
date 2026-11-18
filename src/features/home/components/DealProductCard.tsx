import { IconButton } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import type { HomeProduct } from "@/features/home/home.data";
import { Image } from "expo-image";
import { Clock3, Plus } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

type DealProductCardProps = {
  product: HomeProduct;
  onPress?: (product: HomeProduct) => void;
  onAdd?: (product: HomeProduct) => void;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

export function DealProductCard({ product, onPress, onAdd }: DealProductCardProps) {
  const colors = useAppColors();
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <View className="mr-3 w-[200px] rounded-2xl border border-[#F0F4EC] bg-surface-container-lowest p-3 shadow-sm dark:border-[#00E676]/[0.12]">
      <Pressable accessibilityRole="button" onPress={() => onPress?.(product)}>
      <View className="relative h-36 overflow-hidden rounded-xl bg-surface-container-low">
        <Image
          accessibilityLabel={product.name}
          cachePolicy="disk"
          contentFit="cover"
          source={product.image}
          style={{ width: "100%", height: "100%" }}
          transition={200}
        />
        <View className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-1">
          <Text className="font-vietnam text-[10px] text-on-primary">
            {product.badge}
          </Text>
        </View>
        {discount > 0 ? (
          <View className="absolute bottom-2 left-2 rounded-md bg-danger px-2 py-1">
            <Text className="font-vietnam text-label-sm text-on-danger">
              -{discount}%
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        className="mt-3 font-vietnam text-label-md text-secondary"
        numberOfLines={1}
      >
        {product.origin}
      </Text>
      <Text
        className="mt-1 font-vietnam text-body-emphasis text-ink"
        numberOfLines={1}
      >
        {product.name}
      </Text>
      <Text
        className="mt-1 font-vietnam text-body-sm text-muted"
        numberOfLines={1}
      >
        {product.subtitle}
      </Text>
      </Pressable>

      <View className="mt-4 flex-row items-end justify-between">
        <Pressable accessibilityRole="button" className="flex-1" onPress={() => onPress?.(product)}>
        <View>
          <Text className="font-vietnam text-headline-sm text-primary">
            {formatPrice(product.price)}
          </Text>
          {product.oldPrice ? (
            <Text className="mt-0.5 font-vietnam text-body-sm text-muted line-through">
              {formatPrice(product.oldPrice)}
            </Text>
          ) : null}
        </View>
        </Pressable>
        <IconButton
          label={`Thêm ${product.name} vào giỏ`}
          size="sm"
          variant="filled"
          className="shadow"
          disabled={!onAdd}
          onPress={() => onAdd?.(product)}
          icon={<Plus color={colors.onPrimary} size={21} />}
        />
      </View>

      {product.soldPercent !== undefined ? (
        <>
          <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-low">
            <View
              className="h-full rounded-full bg-secondary"
              style={{ width: `${product.soldPercent}%` }}
            />
          </View>
          <Text className="mt-1 text-right font-vietnam text-[10px] text-muted">
            Đã bán {product.soldPercent}%
          </Text>
        </>
      ) : null}
    </View>
  );
}

type DealSectionProps = {
  products: HomeProduct[];
  onProductPress?: (product: HomeProduct) => void;
  onAddProduct?: (product: HomeProduct) => void;
};

export function DealSection({ products, onProductPress, onAddProduct }: DealSectionProps) {
  const colors = useAppColors();

  return (
    <View className="mt-8">
      <View className="mb-3 flex-row items-end justify-between px-4">
        <View className="flex-1">
          <Text className="mb-1 font-vietnam text-label-sm font-bold uppercase tracking-wider text-primary">
            ⚡ Mở bán sớm
          </Text>
          <Text className="font-vietnam text-headline-sm text-ink">
            Thu hoạch sáng nay
          </Text>
        </View>
        <View className="mb-1 flex-row items-center gap-1 rounded-xl bg-surface-container-lowest px-2.5 py-2 shadow-sm">
          <Clock3 color={colors.muted} size={14} />
          <Text className="font-vietnam text-label-sm text-danger">
            02:45:18
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 28,
          paddingBottom: 8,
        }}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
      >
        {products.map((product) => (
          <DealProductCard
            key={product.id}
            onPress={onProductPress}
            onAdd={onAddProduct}
            product={product}
          />
        ))}
      </ScrollView>
    </View>
  );
}
