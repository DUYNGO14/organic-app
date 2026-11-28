import { ConfirmModal } from "@/components/common";
import {
  ScreenSkeleton,
  type ScreenLoadingProps,
} from "@/components/common/Skeleton/ScreenSkeleton";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAppTranslation } from "@/localization/content";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { ManagementSection } from "./components/ManagementSection";
import { ImpactSection, ProfileHero } from "./components/ProfileOverview";
import { RewardsSection } from "./components/RewardsSection";
import { SettingsSection } from "./components/SettingsSection";
import { PointHistorySheet } from "./PointHistorySheet";
import { GreenReward } from "./profile.data";
import { formatPoints } from "./profile.utils";

const profileSections = [
  "hero",
  "impact",
  "rewards",
  "management",
  "settings",
] as const;
type ProfileSection = (typeof profileSections)[number];

export default function ProfileScreen({
  isLoading = false,
}: ScreenLoadingProps = {}) {
  const { t, localize } = useAppTranslation();
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const [points, setPoints] = useState(1_450);
  const [redeemedIds, setRedeemedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [historyVisible, setHistoryVisible] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const overlayVisible = historyVisible || signOutVisible;

  function redeemReward(reward: GreenReward) {
    if (redeemedIds.has(reward.id)) return;
    if (points < reward.points) {
      Toast.show({
        type: "error",
        text1: t("account.notEnoughGreenPoints"),
        text2: t("account.youNeedMorePoints", {
          value: formatPoints(reward.points - points),
        }),
      });
      return;
    }
    setPoints((current) => current - reward.points);
    setRedeemedIds((current) => new Set(current).add(reward.id));
    Toast.show({
      type: "success",
      text1: t("account.redeemed2", { title: localize(reward.title) }),
      text2: t("account.theOfferWasSavedToYour"),
    });
  }

  async function confirmSignOut() {
    await signOut();
    router.replace("/(tabs)/home");
  }

  function renderSection(item: ProfileSection) {
    if (item === "hero") {
      return (
        <ProfileHero
          name={session?.userData?.name}
          email={session?.userData?.email}
          phone={session?.phone}
          points={points}
          onHistory={() => setHistoryVisible(true)}
        />
      );
    }
    if (item === "impact") return <ImpactSection />;
    if (item === "rewards")
      return (
        <RewardsSection
          points={points}
          redeemedIds={redeemedIds}
          onRedeem={redeemReward}
        />
      );
    if (item === "management") return <ManagementSection />;
    return <SettingsSection onSignOut={() => setSignOutVisible(true)} />;
  }

  if (isLoading) return <ScreenSkeleton variant="profile" />;

  return (
    <View className="flex-1 bg-canvas">
      <FlashList
        data={profileSections}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderSection(item)}
        ItemSeparatorComponent={() => <View className="h-6" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        accessibilityElementsHidden={overlayVisible}
        importantForAccessibility={
          overlayVisible ? "no-hide-descendants" : "auto"
        }
      />
      {historyVisible ? (
        <PointHistorySheet onClose={() => setHistoryVisible(false)} />
      ) : null}
      <ConfirmModal
        visible={signOutVisible}
        title={t("account.signOutOfYourAccount")}
        message={t("account.youCanSignInAgainWith")}
        cancelLabel={t("account.staySignedIn")}
        confirmLabel={t("account.signOut2")}
        variant="danger"
        icon={LogOut}
        errorMessage={t("account.couldNotSignOutPleaseTry")}
        onClose={() => setSignOutVisible(false)}
        onConfirm={confirmSignOut}
      />
    </View>
  );
}
