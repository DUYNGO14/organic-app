import { useAppTranslation } from "@/localization/content";
import { ScreenSkeleton, type ScreenLoadingProps } from "@/components/common/Skeleton/ScreenSkeleton";
import { IconButton, PrimaryBtn } from "@/components/common";
import { catalogProducts } from "@/features/products/catalog.data";
import { useAppColors } from "@/hooks/use-app-colors";
import { cn } from "@/lib/cn";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  BookOpen,
  Compass,
  Snowflake,
  TreePine,
  UsersRound,
  X,
} from "lucide-react-native";
import { useCallback, useRef, useState, type ComponentRef } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { coldChain, greenhouse, type FarmDetail, type FarmStory } from "./farm.data";
import {
  FarmCommitments,
  FarmJournal,
  FarmOverview,
  FarmRegions,
} from "./FarmSections";
import { FarmStorySheet } from "./FarmStorySheet";

type Section = "journal" | "regions";

const shortcuts = [
  { label: "farm.harvestJournal", Icon: BookOpen, section: "journal" },
  { label: "farm.cooperative", Icon: UsersRound, section: "regions" },
  { label: "farm.coldChain", Icon: Snowflake, detail: coldChain },
  { label: "Tham quan", Icon: Compass, detail: greenhouse },
] as const;

export default function FarmScreen({ isLoading = false }: ScreenLoadingProps = {}) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const sectionOffsets = useRef<Record<Section, number>>({
    journal: 0,
    regions: 0,
  });
  const [section, setSection] = useState<Section>("journal");
  const [detail, setDetail] = useState<FarmDetail | null>(null);
  const [story, setStory] = useState<FarmStory | null>(null);
  const closeStory = useCallback(() => setStory(null), []);
  const mapQuery = detail?.mapQuery;
  const relatedProducts = detail?.productIds?.flatMap((id) => {
    const product = catalogProducts.find((item) => item.id === id);
    return product ? [product] : [];
  });

  function goToSection(next: Section) {
    setSection(next);
    scroll.current?.scrollTo({
      y: Math.max(0, sectionOffsets.current[next] - 12),
      animated: true,
    });
  }

  function openProduct(productId: string) {
    setDetail(null);
    router.push({
      pathname: "/(product)/product/[productId]",
      params: { productId },
    });
  }

  function openMap(query: string) {
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    ).catch(() => Alert.alert(t("farm.couldNotOpenMaps"), t("farm.pleaseTryAgain")));
  }

  if (isLoading) return <ScreenSkeleton variant="farm" />;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        ref={scroll}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        accessibilityElementsHidden={story !== null}
        importantForAccessibility={story ? "no-hide-descendants" : "auto"}
      >
        <View className="w-full max-w-3xl self-center gap-6 px-4 pb-6 pt-3">
          <FarmOverview onOpen={setDetail} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {shortcuts.map((shortcut) => {
              const { Icon, label } = shortcut;
              const selected =
                "section" in shortcut && shortcut.section === section;
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityState={
                    "section" in shortcut ? { selected } : undefined
                  }
                  className={cn(
                    "min-h-12 flex-row items-center gap-2 rounded-full px-4",
                    selected
                      ? "bg-primary"
                      : "bg-surface-container active:bg-surface-container-high",
                  )}
                  onPress={() => {
                    if ("section" in shortcut) goToSection(shortcut.section);
                    else setDetail(shortcut.detail);
                  }}
                >
                  <Icon
                    color={selected ? colors.onPrimary : colors.primary}
                    size={19}
                  />
                  <Text
                    className={cn(
                      "font-vietnam text-label-lg",
                      selected ? "text-on-primary" : "text-ink",
                    )}
                  >
                    {t(label)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View
            onLayout={(event) => {
              sectionOffsets.current.journal = event.nativeEvent.layout.y;
            }}
          >
            <FarmJournal onOpen={setStory} />
          </View>
          <View
            onLayout={(event) => {
              sectionOffsets.current.regions = event.nativeEvent.layout.y;
            }}
          >
            <FarmRegions onOpen={setDetail} />
          </View>
          <FarmCommitments onOpen={setDetail} />
          <View className="flex-row items-center gap-3 rounded-lg bg-secondary-container p-4">
            <TreePine color={colors.ink} size={26} />
            <View className="min-w-0 flex-1 gap-2">
              <Text className="font-vietnam text-body-md italic text-on-secondary-container">
                {t("farm.growingCleanProduceIsHowWe")}</Text>
              <Text className="font-vietnam text-label-md text-on-secondary-container">
                {t("farm.representativeOfLienMinhXanhViet")}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      {story ? <FarmStorySheet story={story} onClose={closeStory} /> : null}
      {detail ? (
        <Modal
          visible
          animationType="slide"
          onRequestClose={() => setDetail(null)}
        >
          <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
            <View className="flex-row items-center gap-2 border-b border-border bg-surface px-4 py-2">
              <Text
                accessibilityRole="header"
                className="min-w-0 flex-1 font-vietnam text-title-md text-ink"
              >
                {localize(detail.title)}
              </Text>
              <IconButton
                label={t("common.close")}
                size="lg"
                icon={<X color={colors.ink} size={22} />}
                onPress={() => setDetail(null)}
              />
            </View>
            <ScrollView contentContainerClassName="gap-4 p-4">
              {detail.image ? (
                <View className="overflow-hidden rounded-lg bg-surface-container">
                  <Image
                    source={detail.image}
                    contentFit="contain"
                    style={{
                      width: "100%",
                      aspectRatio: detail === greenhouse ? 1 : 1.6,
                    }}
                  />
                </View>
              ) : null}
              <Text className="font-vietnam text-body-lg text-ink">
                {localize(detail.description)}
              </Text>
              {mapQuery ? (
                <PrimaryBtn
                  fullWidth
                  variant="secondary"
                  title={t("farm.openGrowingRegionMap")}
                  onPress={() => openMap(mapQuery)}
                />
              ) : null}
              {relatedProducts?.map((product) => (
                <PrimaryBtn
                  key={product.id}
                  fullWidth
                  variant="secondary"
                  title={localize(product.name)}
                  onPress={() => openProduct(product.id)}
                />
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      ) : null}
    </View>
  );
}
