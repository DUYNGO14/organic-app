import { useAppColors } from "@/hooks/use-app-colors";
import { useAppTranslation } from "@/localization/content";
import { Image } from "expo-image";
import {
    BadgeCheck,
    Crown,
    History,
    Leaf,
    TreePine,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PROFILE_AVATAR, profileImpacts } from "../profile.data";
import { formatPoints } from "../profile.utils";
import { SectionHeading } from "./SectionHeading";

function maskPhone(phone?: string) {
  if (!phone) return "0912 ••• 678";
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("84")
    ? `0${digits.slice(2)}`
    : digits.startsWith("0")
      ? digits
      : `0${digits}`;
  if (local.length < 7) return local;
  return `${local.slice(0, 4)} ••• ${local.slice(-3)}`;
}

export function ProfileHero({
  name,
  email,
  phone,
  points,
  onHistory,
}: {
  name?: string;
  email?: string;
  phone?: string;
  points: number;
  onHistory: () => void;
}) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const displayName =
    name?.trim() || (email ? t("account.adigoMember") : "Minh An");

  return (
    <View className="overflow-hidden rounded-xl border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-4">
        <View className="relative">
          <View className="h-20 w-20 overflow-hidden rounded-full bg-surface-container">
            <Image
              accessibilityLabel={t("account.profilePhotoFor", { displayName })}
              source={{ uri: PROFILE_AVATAR }}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-secondary">
            <Leaf
              color={colors.onSecondary}
              fill={colors.onSecondary}
              size={14}
            />
          </View>
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-vietnam text-headline-sm text-ink">
              {displayName}
            </Text>
            <View className="flex-row items-center gap-1 rounded-full bg-secondary-container px-2 py-1">
              <Crown color={colors.secondary} size={14} />
              <Text className="font-vietnam text-label-sm text-on-secondary-container">
                {t("account.goldenSprout")}
              </Text>
            </View>
          </View>
          <Text className="font-vietnam text-body-md text-muted">
            {email ?? maskPhone(phone)}
          </Text>
          <View className="flex-row items-center gap-1">
            <BadgeCheck color={colors.primary} size={16} />
            <Text className="font-vietnam text-label-sm text-primary">
              {t("account.memberSince2023")}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 overflow-hidden rounded-lg bg-primary p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1">
              <Leaf color={colors.onPrimary} size={16} />
              <Text className="font-vietnam text-label-md text-on-primary/80">
                {t("account.greenPointsBalance")}
              </Text>
            </View>
            <View className="mt-1 flex-row flex-wrap items-baseline gap-2">
              <Text
                style={{ fontVariant: ["tabular-nums"] }}
                className="font-vietnam text-display-lg text-on-primary"
              >
                {formatPoints(points)}
              </Text>
              <Text className="font-vietnam text-label-lg text-secondary-container">
                {t("account.greenPoints")}
              </Text>
            </View>
            <Text className="font-vietnam text-body-sm text-on-primary/75">
              {t("account.offYourProduceOrder", {
                value: formatPoints(points * 100),
              })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            className="min-h-12 flex-row items-center gap-1 rounded-full bg-on-primary/15 px-3 active:bg-on-primary/25"
            onPress={onHistory}
          >
            <History color={colors.onPrimary} size={17} />
            <Text className="font-vietnam text-label-md text-on-primary">
              {t("account.history")}
            </Text>
          </Pressable>
        </View>

        <View className="mt-4 border-t border-on-primary/15 pt-3">
          <View className="mb-2 flex-row flex-wrap justify-between gap-2">
            <Text className="font-vietnam text-label-sm text-on-primary">
              {t("account.currentTierGoldenSprout")}
            </Text>
            <Text className="font-vietnam text-label-sm text-secondary-container">
              {t("account.550PointsToHeritageTree")}
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-photo-scrim/25">
            <View className="h-full w-[72%] rounded-full bg-secondary-container" />
          </View>
        </View>
      </View>
    </View>
  );
}

export function ImpactSection() {
  const { t, localize } = useAppTranslation();
  const colors = useAppColors();

  return (
    <View>
      <SectionHeading
        icon={<TreePine color={colors.secondary} size={21} />}
        title={t("account.minhAnSGreenFootprint")}
        action={
          <Text className="font-vietnam text-label-sm text-muted">
            {t("account.6Months")}
          </Text>
        }
      />
      <View className="flex-row gap-2">
        {profileImpacts.map(({ id, value, unit, label, Icon }) => (
          <View
            key={id}
            className="min-w-0 flex-1 rounded-lg border border-card-border bg-surface p-3"
          >
            <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-secondary-container/45">
              <Icon color={colors.secondary} size={18} />
            </View>
            <View className="flex-row items-baseline">
              <Text
                style={{ fontVariant: ["tabular-nums"] }}
                className="font-vietnam text-headline-sm text-primary"
              >
                {value}
              </Text>
              <Text className="font-vietnam text-label-sm text-primary">
                {localize(unit)}
              </Text>
            </View>
            <Text className="mt-1 font-vietnam text-label-sm text-muted">
              {localize(label)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
