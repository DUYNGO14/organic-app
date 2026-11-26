import { IconButton } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/utils/format-price";
import { Image, type ImageProps } from "expo-image";
import { ShoppingCartPlus } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

type ProductCardProps = {
  name: string;
  subtitle?: string;
  price: number;
  oldPrice?: number;
  image: ImageProps["source"];
  topLeft?: ReactNode;
  bottomLeft?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  className?: string;
  onPress?: () => void;
  onAdd?: () => void;
};

export function ProductCard({
  name,
  subtitle,
  price,
  oldPrice,
  image,
  topLeft,
  bottomLeft,
  meta,
  footer,
  className,
  onPress,
  onAdd,
}: ProductCardProps) {
  const { onPrimary } = useAppColors();
  const { width, fontScale } = useWindowDimensions();
  const stackCartButton = width < 360 || fontScale > 1.2;
  const hasOldPrice = oldPrice !== undefined && oldPrice > price;

  return (
    <View
      className={cn(
        "rounded-2xl border border-card-border bg-surface-container-lowest p-3",
        className,
      )}
    >
      <View className="relative">
        <Pressable
          accessibilityLabel={`Xem chi tiết ${name}`}
          accessibilityRole="button"
          className="active:opacity-80"
          disabled={!onPress}
          onPress={onPress}
        >
          <View className="relative aspect-square overflow-hidden rounded-xl bg-surface-container-low">
            <Image
              accessibilityLabel={name}
              cachePolicy="disk"
              contentFit="cover"
              source={image}
              style={{ width: "100%", height: "100%" }}
              transition={200}
            />
            {topLeft ? (
              <View className="absolute left-2 right-2 top-2">
                <View className="self-start rounded-full bg-surface-container-lowest">
                  {topLeft}
                </View>
              </View>
            ) : null}
            {bottomLeft ? (
              <View className="absolute bottom-2 left-2 right-2">
                <View className="self-start rounded-full bg-surface-container-lowest">
                  {bottomLeft}
                </View>
              </View>
            ) : null}
          </View>

          {meta ? <View className="mt-2.5">{meta}</View> : null}
          <Text
            className="mt-2 font-vietnam text-body-emphasis text-ink"
            numberOfLines={1}
          >
            {name}
          </Text>
          {subtitle ? (
            <Text
              className="mt-0.5 font-vietnam text-label-md text-muted"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}

          <View
            className={cn("mt-3", stackCartButton ? "pb-[48px]" : "pr-[52px]")}
          >
            <View className="min-h-[48px] justify-center">
              <Text
                className="font-vietnam text-title-md text-primary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatPrice(price)}
              </Text>
              <Text
                accessibilityElementsHidden={!hasOldPrice}
                importantForAccessibility={hasOldPrice ? "auto" : "no"}
                className="mt-0.5 font-vietnam text-body-sm text-muted line-through"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {hasOldPrice ? formatPrice(oldPrice) : "\u00a0"}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Keep the cart target separate from the detail press target and above the footer. */}
        <View
          className="absolute bottom-0 right-0 h-[48px] w-[48px] items-center justify-center"
          pointerEvents="box-none"
        >
          <IconButton
            label={`Thêm ${name} vào giỏ`}
            size="md"
            variant="filled"
            disabled={!onAdd}
            onPress={onAdd}
            icon={<ShoppingCartPlus color={onPrimary} size={16} />}
          />
        </View>
      </View>

      {footer ? <View className="mt-3">{footer}</View> : null}
    </View>
  );
}
