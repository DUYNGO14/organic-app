import type { HomeBanner } from "@/features/home/home.data";
import { PrimaryBtn } from "@/components/common";
import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { ArrowRight, BadgeCheck } from "lucide-react-native";

type NewsCarouselProps = {
  banners: HomeBanner[];
  onBannerPress?: (banner: HomeBanner) => void;
  autoPlayInterval?: number;
};

export function NewsCarousel({
  banners,
  onBannerPress,
  autoPlayInterval = 5_500,
}: NewsCarouselProps) {
  const colors = useAppColors();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<HomeBanner>>(null);
  const activeIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;

    const timer = setInterval(() => {
      if (isDraggingRef.current) return;
      const nextIndex = (activeIndexRef.current + 1) % banners.length;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      listRef.current?.scrollToOffset({ offset: width * nextIndex, animated: true });
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlayInterval, banners.length, width]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.max(
        0,
        Math.min(
          banners.length - 1,
          Math.round(event.nativeEvent.contentOffset.x / width),
        ),
      );
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      isDraggingRef.current = false;
    },
    [banners.length, width],
  );

  const renderBanner = useCallback(
    ({ item }: { item: HomeBanner }) => (
      <View style={{ width }} className="px-4">
        <View className="h-[244px] overflow-hidden rounded-[26px] bg-primary shadow-md">
          <Image
            accessibilityLabel={item.title}
            cachePolicy="disk"
            contentFit="cover"
            source={item.image}
            style={{ position: "absolute", width: "100%", height: "100%" }}
            transition={200}
          />
          <View className="absolute inset-0 bg-[#00391b]/75" />
          <View className="flex-1 justify-between p-5">
            <View className="self-start flex-row items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-2">
              <BadgeCheck color={colors.secondary} size={16} />
              <Text className="font-vietnam text-label-sm text-primary">
                {item.eyebrow}
              </Text>
            </View>
            <View className="max-w-[92%]">
              <Text className="font-vietnam text-headline-sm text-white">
                {item.title}
              </Text>
              <Text className="mt-2 font-vietnam text-body-md text-white/85">
                {item.description}
              </Text>
            </View>
            <View className="flex-row items-end justify-between">
              <PrimaryBtn
                title={item.actionLabel}
                variant="secondary"
                className="min-h-0 rounded-xl border-0 bg-white px-4 py-2.5"
                labelClassName="text-primary"
                trailingIcon={<ArrowRight color={colors.primary} size={18} />}
                onPress={() => onBannerPress?.(item)}
              />
              <View className="mb-1 flex-row items-center gap-1.5">
                {banners.map((banner, index) => (
                  <Pressable
                    accessibilityLabel={`Tin ${index + 1}`}
                    accessibilityRole="button"
                    key={banner.id}
                    onPress={() => {
                      activeIndexRef.current = index;
                      setActiveIndex(index);
                      listRef.current?.scrollToOffset({
                        offset: width * index,
                        animated: true,
                      });
                    }}
                    style={{
                      width: activeIndex === index ? 23 : 9,
                      backgroundColor:
                        activeIndex === index
                          ? "#ffffff"
                          : "rgba(255,255,255,0.45)",
                    }}
                    className="h-2 rounded-full"
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    ),
    [activeIndex, banners, colors.primary, colors.secondary, onBannerPress, width],
  );

  if (banners.length === 0) return null;

  return (
    <FlatList
      ref={listRef}
      data={banners}
      horizontal
      initialNumToRender={1}
      keyExtractor={(item) => item.id}
      onMomentumScrollEnd={handleMomentumEnd}
      onScrollBeginDrag={() => {
        isDraggingRef.current = true;
      }}
      pagingEnabled
      renderItem={renderBanner}
      showsHorizontalScrollIndicator={false}
      getItemLayout={(_, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
    />
  );
}
