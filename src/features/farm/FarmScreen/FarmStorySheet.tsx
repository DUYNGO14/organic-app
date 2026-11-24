import { AppSheet, type AppSheetHandle } from "@/components/common/BottomSheet";
import { IconButton, PrimaryBtn } from "@/components/common";
import { catalogProducts } from "@/features/products/catalog.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { FarmStory } from "./farm.data";

const snapPoints = ["94%"];

export function FarmStorySheet({
  story,
  onClose,
}: {
  story: FarmStory;
  onClose: () => void;
}) {
  const sheet = useRef<AppSheetHandle>(null);
  const pendingProductId = useRef<string | null>(null);
  const colors = useAppColors();
  const backdropStyle = useMemo(() => ({ backgroundColor: colors.photoScrim }), [colors.photoScrim]);
  const { bottom, left, right } = useSafeAreaInsets();
  const relatedProducts = catalogProducts.filter((product) =>
    story.productIds?.includes(product.id),
  );

  const dismiss = useCallback(() => sheet.current?.dismiss(), []);

  const openProduct = useCallback(
    (productId: string) => {
      if (pendingProductId.current !== null) return;
      pendingProductId.current = productId;
      dismiss();
    },
    [dismiss],
  );

  const handleDismiss = useCallback(() => {
    const productId = pendingProductId.current;
    pendingProductId.current = null;
    onClose();
    if (productId) {
      router.push({
        pathname: "/(product)/product/[productId]",
        params: { productId },
      });
    }
  }, [onClose]);

  return (
    <AppSheet
      ref={sheet}
      fullWindowOnIOS
      backdropStyle={backdropStyle}
      contentStyle={{ paddingLeft: left, paddingRight: right }}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      onDismiss={handleDismiss}
    >
      <View className="flex-row items-center gap-2 border-b border-border px-4 pb-2">
        <Text className="min-w-0 flex-1 font-vietnam text-label-lg text-muted">
          Nhật ký mùa vụ
        </Text>
        <IconButton
          label="Đóng bài viết"
          size="lg"
          icon={<X color={colors.ink} size={22} />}
          onPress={dismiss}
        />
      </View>

      <BottomSheetScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
      >
        <View className="w-full max-w-2xl self-center gap-4 px-4 pt-4">
          <View className="gap-2">
            {story.label ? (
              <Text className="self-start rounded-full bg-secondary-container px-3 py-1 font-vietnam text-label-md text-on-secondary-container">
                {story.label}
              </Text>
            ) : null}
            <Text accessibilityRole="header" className="font-vietnam text-headline-lg-mobile text-ink">
              {story.title}
            </Text>
            <Text className="font-vietnam text-label-md text-muted">
              Bởi {story.author}{story.location ? ` · ${story.location}` : ""}
            </Text>
          </View>

          <View className="aspect-[4/3] overflow-hidden rounded-lg bg-surface-container">
            <Image source={story.image} contentFit="cover" style={StyleSheet.absoluteFill} />
          </View>

          <Text className="font-vietnam text-body-lg text-ink">{story.description}</Text>
          {story.sections.map(({ title, text }) => (
            <View key={title} className="gap-2">
              <Text accessibilityRole="header" className="font-vietnam text-headline-sm text-ink">
                {title}
              </Text>
              <Text className="font-vietnam text-body-lg text-ink">{text}</Text>
            </View>
          ))}

          {story.tags?.length ? (
            <Text className="font-vietnam text-label-md text-primary">{story.tags.join("  ")}</Text>
          ) : null}

          {relatedProducts.length > 0 ? (
            <View className="gap-2 border-t border-border pt-4">
              <Text accessibilityRole="header" className="font-vietnam text-title-md text-ink">
                Sản phẩm liên quan
              </Text>
              {relatedProducts.map((product) => (
                <PrimaryBtn
                  key={product.id}
                  fullWidth
                  variant="secondary"
                  title={product.name}
                  onPress={() => openProduct(product.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </BottomSheetScrollView>
    </AppSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, minHeight: 0 },
});
