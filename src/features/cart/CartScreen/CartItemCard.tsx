import {
  Checkbox,
  IconButton,
  StatusChip,
  StepperBtn,
} from "@/components/common";
import { useCartStore, type CartLine } from "@/features/cart/cart.store";
import { formatPrice } from "@/features/products/ProductDetailScreen/components/format-price";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { Text, View } from "react-native";

type CartItemCardProps = {
  line: CartLine;
  variant?: "cart" | "checkout";
};

export function CartItemCard({ line, variant = "cart" }: CartItemCardProps) {
  const { id, pack, product, quantity, selected } = line;
  const colors = useAppColors();
  const setSelected = useCartStore((state) => state.setSelected);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const productLabel = `${product.name}, ${pack.label}`;
  const isCheckout = variant === "checkout";

  return (
    <View className="rounded-lg border border-card-border bg-surface p-2">
      <View className="flex-row items-start">
        {!isCheckout ? (
          <Checkbox
            accessibilityLabel={`Chọn ${productLabel}`}
            checked={selected}
            className="min-w-12 justify-center"
            onCheckedChange={(checked) => setSelected(id, checked)}
          />
        ) : null}
        <View className="mt-2 h-20 w-20 overflow-hidden rounded bg-surface-container">
          <Image
            source={product.image}
            contentFit="cover"
            recyclingKey={product.id}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <View className="min-w-0 flex-1 gap-1 pb-1 pl-3 pt-2">
          <Text className="font-vietnam text-body-emphasis text-ink">
            {product.name}
          </Text>
          <Text className="font-vietnam text-body-sm text-muted">
            {pack.label}
          </Text>
          <StatusChip label={product.badge} tone="success" />
        </View>
        {!isCheckout ? (
          <IconButton
            label={`Xóa ${productLabel} khỏi giỏ`}
            size="lg"
            icon={<X color={colors.muted} size={20} />}
            onPress={() => remove(id)}
          />
        ) : null}
      </View>
      <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2 px-2 pb-1">
        <View className="flex-row flex-wrap items-center gap-x-2">
          <Text className="font-vietnam text-body-emphasis tabular-nums text-primary">
            {formatPrice(pack.price * quantity)}
          </Text>
          {pack.oldPrice !== undefined && pack.oldPrice > pack.price ? (
            <Text className="font-vietnam text-body-sm tabular-nums text-muted line-through">
              {formatPrice(pack.oldPrice * quantity)}
            </Text>
          ) : null}
        </View>
        <StepperBtn
          className="ml-auto"
          label={`Số lượng ${productLabel}`}
          value={quantity}
          min={1}
          onValueChange={(value) => setQuantity(id, value)}
        />
      </View>
    </View>
  );
}
