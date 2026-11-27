import { useAppColors } from "@/hooks/use-app-colors";
import { useAppTranslation } from "@/localization/content";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Gift, Leaf } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { greenRewards, type GreenReward } from "../profile.data";
import { formatPoints } from "../profile.utils";
import { SectionHeading } from "./SectionHeading";

function RewardCard({
  reward,
  points,
  redeemed,
  onRedeem,
}: {
  reward: GreenReward;
  points: number;
  redeemed: boolean;
  onRedeem: () => void;
}) {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();
  const disabled = redeemed || points < reward.points;

  return (
    <View className="w-64 overflow-hidden rounded-xl border border-card-border bg-surface p-3">
      <View className="h-28 overflow-hidden rounded-lg bg-surface-container">
        <Image
          source={{ uri: reward.image }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1">
          <Text className="font-vietnam text-label-sm text-on-primary">
            {localize(reward.badge)}
          </Text>
        </View>
      </View>
      <Text
        numberOfLines={1}
        className="mt-3 font-vietnam text-body-emphasis text-ink"
      >
        {localize(reward.title)}
      </Text>
      <Text
        numberOfLines={2}
        className="mt-1 min-h-9 font-vietnam text-body-sm text-muted"
      >
        {localize(reward.description)}
      </Text>
      <View className="mt-3 flex-row items-center justify-between gap-2 border-t border-border pt-2">
        <View className="flex-row items-center gap-1">
          <Leaf color={colors.primary} size={16} />
          <Text className="font-vietnam text-label-md text-primary">
            {t("account.points", { value: formatPoints(reward.points) })}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          className={`min-h-12 items-center justify-center rounded px-3 ${disabled ? "bg-surface-container" : "bg-primary active:bg-primary/85"}`}
          onPress={onRedeem}
        >
          <Text
            className={`font-vietnam text-label-md ${disabled ? "text-muted" : "text-on-primary"}`}
          >
            {redeemed ? t("account.redeemed") : t("account.redeem")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function RewardsSection({
  points,
  redeemedIds,
  onRedeem,
}: {
  points: number;
  redeemedIds: ReadonlySet<string>;
  onRedeem: (reward: GreenReward) => void;
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View>
      <SectionHeading
        icon={<Gift color={colors.primary} size={21} />}
        title={t("account.greenPointsRewardsAndOffers")}
        action={
          <Text className="font-vietnam text-label-md text-primary">
            {t("account.offers", { count: greenRewards.length })}
          </Text>
        }
      />
      <FlashList
        horizontal
        data={greenRewards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RewardCard
            reward={item}
            points={points}
            redeemed={redeemedIds.has(item.id)}
            onRedeem={() => onRedeem(item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="w-3" />}
        showsHorizontalScrollIndicator={false}
        style={{ height: 286 }}
      />
    </View>
  );
}
