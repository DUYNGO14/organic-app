import { ScreenSkeleton, type ScreenLoadingProps } from "@/components/common/Skeleton/ScreenSkeleton";
import { PrimaryBtn } from "@/components/common";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/features/auth/auth.store";
import { useAppColors } from "@/hooks/use-app-colors";
import { FlashList } from "@shopify/flash-list";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Crown,
  Gift,
  Headphones,
  History,
  Leaf,
  LogOut,
  ShoppingBag,
  TreePine,
} from "lucide-react-native";
import { useMemo, useState, type ReactNode } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { PointHistorySheet } from "./PointHistorySheet";
import {
  PROFILE_AVATAR,
  followedFarms,
  greenRewards,
  profileImpacts,
  profileSettings,
  profileShortcuts,
  type GreenReward,
  type ProfileShortcut,
} from "./profile.data";

const profileSections = ["hero", "impact", "rewards", "management", "settings"] as const;
type ProfileSection = (typeof profileSections)[number];

function formatPoints(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function maskPhone(phone?: string) {
  if (!phone) return "0912 ••• 678";
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("84") ? `0${digits.slice(2)}` : digits.startsWith("0") ? digits : `0${digits}`;
  if (local.length < 7) return local;
  return `${local.slice(0, 4)} ••• ${local.slice(-3)}`;
}

function SectionHeading({ icon, title, action }: { icon: ReactNode; title: string; action?: ReactNode }) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      {icon}
      <Text className="min-w-0 flex-1 font-vietnam text-title-md text-ink">{title}</Text>
      {action}
    </View>
  );
}

function ProfileHero({ phone, points, onHistory }: { phone?: string; points: number; onHistory: () => void }) {
  const colors = useAppColors();

  return (
    <View className="overflow-hidden rounded-xl border border-card-border bg-surface p-4">
      <View className="flex-row items-center gap-4">
        <View className="relative">
          <View className="h-20 w-20 overflow-hidden rounded-full bg-surface-container">
            <Image accessibilityLabel="Ảnh đại diện Minh An" source={{ uri: PROFILE_AVATAR }} contentFit="cover" style={StyleSheet.absoluteFill} />
          </View>
          <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-secondary">
            <Leaf color={colors.onSecondary} fill={colors.onSecondary} size={14} />
          </View>
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-vietnam text-headline-sm text-ink">Minh An</Text>
            <View className="flex-row items-center gap-1 rounded-full bg-secondary-container px-2 py-1">
              <Crown color={colors.secondary} size={14} />
              <Text className="font-vietnam text-label-sm text-on-secondary-container">Mầm Xanh Vàng</Text>
            </View>
          </View>
          <Text className="font-vietnam text-body-md text-muted">{maskPhone(phone)}</Text>
          <View className="flex-row items-center gap-1">
            <BadgeCheck color={colors.primary} size={16} />
            <Text className="font-vietnam text-label-sm text-primary">Thành viên tử tế từ 2023</Text>
          </View>
        </View>
      </View>

      <View className="mt-4 overflow-hidden rounded-lg bg-primary p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1">
              <Leaf color={colors.onPrimary} size={16} />
              <Text className="font-vietnam text-label-md text-on-primary/80">Số dư Điểm Xanh tích lũy</Text>
            </View>
            <View className="mt-1 flex-row flex-wrap items-baseline gap-2">
              <Text style={{ fontVariant: ["tabular-nums"] }} className="font-vietnam text-display-lg text-on-primary">{formatPoints(points)}</Text>
              <Text className="font-vietnam text-label-lg text-secondary-container">Điểm Xanh</Text>
            </View>
            <Text className="font-vietnam text-body-sm text-on-primary/75">≈ {formatPoints(points * 100)}đ trừ trực tiếp vào giỏ rau</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            className="min-h-12 flex-row items-center gap-1 rounded-full bg-on-primary/15 px-3 active:bg-on-primary/25"
            onPress={onHistory}
          >
            <History color={colors.onPrimary} size={17} />
            <Text className="font-vietnam text-label-md text-on-primary">Lịch sử</Text>
          </Pressable>
        </View>

        <View className="mt-4 border-t border-on-primary/15 pt-3">
          <View className="mb-2 flex-row flex-wrap justify-between gap-2">
            <Text className="font-vietnam text-label-sm text-on-primary">Hạng hiện tại: Mầm Xanh Vàng</Text>
            <Text className="font-vietnam text-label-sm text-secondary-container">550 điểm tới Cây Cổ Thụ</Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-photo-scrim/25">
            <View className="h-full w-[72%] rounded-full bg-secondary-container" />
          </View>
        </View>
      </View>
    </View>
  );
}

function ImpactSection() {
  const colors = useAppColors();

  return (
    <View>
      <SectionHeading
        icon={<TreePine color={colors.secondary} size={21} />}
        title="Dấu chân Xanh của Minh An"
        action={<Text className="font-vietnam text-label-sm text-muted">6 tháng</Text>}
      />
      <View className="flex-row gap-2">
        {profileImpacts.map(({ id, value, unit, label, Icon }) => (
          <View key={id} className="min-w-0 flex-1 rounded-lg border border-card-border bg-surface p-3">
            <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-secondary-container/45">
              <Icon color={colors.secondary} size={18} />
            </View>
            <View className="flex-row items-baseline">
              <Text style={{ fontVariant: ["tabular-nums"] }} className="font-vietnam text-headline-sm text-primary">{value}</Text>
              <Text className="font-vietnam text-label-sm text-primary">{unit}</Text>
            </View>
            <Text className="mt-1 font-vietnam text-label-sm text-muted">{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RewardCard({ reward, points, redeemed, onRedeem }: { reward: GreenReward; points: number; redeemed: boolean; onRedeem: () => void }) {
  const colors = useAppColors();
  const disabled = redeemed || points < reward.points;

  return (
    <View className="w-64 overflow-hidden rounded-xl border border-card-border bg-surface p-3">
      <View className="h-28 overflow-hidden rounded-lg bg-surface-container">
        <Image source={{ uri: reward.image }} contentFit="cover" style={StyleSheet.absoluteFill} />
        <View className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1">
          <Text className="font-vietnam text-label-sm text-on-primary">{reward.badge}</Text>
        </View>
      </View>
      <Text numberOfLines={1} className="mt-3 font-vietnam text-body-emphasis text-ink">{reward.title}</Text>
      <Text numberOfLines={2} className="mt-1 min-h-9 font-vietnam text-body-sm text-muted">{reward.description}</Text>
      <View className="mt-3 flex-row items-center justify-between gap-2 border-t border-border pt-2">
        <View className="flex-row items-center gap-1">
          <Leaf color={colors.primary} size={16} />
          <Text className="font-vietnam text-label-md text-primary">{formatPoints(reward.points)} điểm</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          className={`min-h-12 items-center justify-center rounded px-3 ${disabled ? "bg-surface-container" : "bg-primary active:bg-primary/85"}`}
          onPress={onRedeem}
        >
          <Text className={`font-vietnam text-label-md ${disabled ? "text-muted" : "text-on-primary"}`}>
            {redeemed ? "Đã đổi" : "Đổi ngay"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function RewardsSection({ points, redeemedIds, onRedeem }: { points: number; redeemedIds: ReadonlySet<string>; onRedeem: (reward: GreenReward) => void }) {
  const colors = useAppColors();

  return (
    <View>
      <SectionHeading
        icon={<Gift color={colors.primary} size={21} />}
        title="Đổi quà & Ưu đãi Điểm Xanh"
        action={<Text className="font-vietnam text-label-md text-primary">{greenRewards.length} ưu đãi</Text>}
      />
      <FlashList
        horizontal
        data={greenRewards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RewardCard reward={item} points={points} redeemed={redeemedIds.has(item.id)} onRedeem={() => onRedeem(item)} />
        )}
        ItemSeparatorComponent={() => <View className="w-3" />}
        showsHorizontalScrollIndicator={false}
        style={{ height: 286 }}
      />
    </View>
  );
}

function ShortcutCard({ shortcut, onPress }: { shortcut: ProfileShortcut; onPress: () => void }) {
  const colors = useAppColors();
  const { Icon } = shortcut;

  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-36 min-w-0 flex-1 justify-between rounded-lg border border-card-border bg-surface p-4 active:bg-surface-soft"
      onPress={onPress}
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-surface-container">
        <Icon color={colors.primary} size={21} />
      </View>
      <View className="mt-3">
        <Text className="font-vietnam text-body-emphasis text-ink">{shortcut.title}</Text>
        <Text className="mt-1 font-vietnam text-body-sm text-muted">{shortcut.subtitle}</Text>
      </View>
    </Pressable>
  );
}

function ManagementSection({ onShortcut }: { onShortcut: (shortcut: ProfileShortcut) => void }) {
  const colors = useAppColors();

  return (
    <View>
      <SectionHeading icon={<ShoppingBag color={colors.secondary} size={21} />} title="Quản lý tiêu dùng tử tế" />

      <Pressable
        accessibilityRole="button"
        className="mb-3 flex-row items-center gap-3 rounded-xl border border-card-border bg-surface p-4 active:bg-surface-soft"
        onPress={() => router.navigate("/(tabs)/orders")}
      >
        <View className="h-12 w-12 items-center justify-center rounded-md bg-secondary-container/50">
          <CalendarDays color={colors.secondary} size={22} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-vietnam text-body-emphasis text-ink">Giao định kỳ: Thứ 3 & Thứ 7</Text>
          <Text className="font-vietnam text-body-sm text-muted">Lần tới: Ngày mai lúc 07:30</Text>
        </View>
        <View className="rounded-full bg-secondary-container px-3 py-1.5">
          <Text className="font-vietnam text-label-sm text-on-secondary-container">Đang giao</Text>
        </View>
      </Pressable>

      <View className="gap-3">
        <View className="flex-row gap-3">
          {profileShortcuts.slice(0, 2).map((shortcut) => <ShortcutCard key={shortcut.id} shortcut={shortcut} onPress={() => onShortcut(shortcut)} />)}
        </View>
        <View className="flex-row gap-3">
          {profileShortcuts.slice(2).map((shortcut) => <ShortcutCard key={shortcut.id} shortcut={shortcut} onPress={() => onShortcut(shortcut)} />)}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        className="mt-3 rounded-xl border border-card-border bg-surface p-4 active:bg-surface-soft"
        onPress={() => router.navigate("/(tabs)/farm")}
      >
        <View className="mb-3 flex-row items-center justify-between gap-2">
          <Text className="min-w-0 flex-1 font-vietnam text-label-md text-ink">Vườn sạch bạn đang theo dõi thu hoạch</Text>
          <ChevronRight color={colors.muted} size={18} />
        </View>
        <View className="flex-row gap-3">
          {followedFarms.map((farm, index) => (
            <View key={farm.id} className={`min-w-0 flex-1 flex-row items-center gap-2 ${index ? "border-l border-border pl-3" : ""}`}>
              <View className="h-12 w-12 overflow-hidden rounded-full bg-surface-container">
                <Image source={farm.image} contentFit="cover" style={StyleSheet.absoluteFill} />
              </View>
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-vietnam text-label-md text-ink">{farm.name}</Text>
                <Text numberOfLines={2} className="font-vietnam text-label-sm text-primary">{farm.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
}

function SettingsSection({ onSignOut }: { onSignOut: () => void }) {
  const colors = useAppColors();
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  function settingAction(id: string) {
    const messages: Record<string, string> = {
      traceability: "Lịch sử truy xuất sẽ được đồng bộ khi backend hồ sơ sẵn sàng.",
      notifications: "Bạn đang nhận thông báo mùa vụ mới.",
      policy: "",
    };
    if (id === "policy") {
      router.push("/legal");
      return;
    }
    Toast.show({ type: "info", text1: "Thông tin tài khoản", text2: messages[id] });
  }

  return (
    <View className="gap-4">
      <ThemeToggle />

      <View className="overflow-hidden rounded-xl border border-card-border bg-surface px-2">
        {profileSettings.map(({ id, title, subtitle, Icon }, index) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            className={`min-h-20 flex-row items-center gap-3 px-2 py-3 active:bg-surface-soft ${index ? "border-t border-border" : ""}`}
            onPress={() => settingAction(id)}
          >
            <View className="h-11 w-11 items-center justify-center rounded-md bg-surface-container">
              <Icon color={colors.primary} size={20} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-vietnam text-body-emphasis text-ink">{title}</Text>
              <Text className="font-vietnam text-body-sm text-muted">{subtitle}</Text>
            </View>
            <ChevronRight color={colors.muted} size={18} />
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          className="min-h-20 flex-row items-center gap-3 border-t border-border px-2 py-3 active:bg-surface-soft"
          onPress={() => Linking.openURL("tel:18006886")}
        >
          <View className="h-11 w-11 items-center justify-center rounded-md bg-secondary-container">
            <Headphones color={colors.secondary} size={21} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-vietnam text-body-emphasis text-ink">Tổng đài Nông sản tử tế 1800 6886</Text>
            <Text className="font-vietnam text-body-sm text-secondary">Miễn cước cuộc gọi 24/7</Text>
          </View>
          <Text className="font-vietnam text-label-md text-secondary">Gọi ngay</Text>
        </Pressable>
      </View>

      <PrimaryBtn
        fullWidth
        title="Đăng xuất tài khoản"
        variant="ghost"
        leadingIcon={<LogOut color={colors.muted} size={18} />}
        className="bg-surface-container"
        labelClassName="text-muted"
        onPress={onSignOut}
      />

      <Text className="pb-2 text-center font-vietnam text-label-sm text-muted">
        ADIGO v{appVersion} · Vì nông nghiệp tử tế
      </Text>
    </View>
  );
}

export default function ProfileScreen({ isLoading = false }: ScreenLoadingProps = {}) {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const [points, setPoints] = useState(1_450);
  const [redeemedIds, setRedeemedIds] = useState<ReadonlySet<string>>(new Set());
  const [historyVisible, setHistoryVisible] = useState(false);
  const sections = useMemo(() => profileSections, []);

  function redeemReward(reward: GreenReward) {
    if (redeemedIds.has(reward.id)) return;
    if (points < reward.points) {
      Toast.show({ type: "error", text1: "Chưa đủ Điểm Xanh", text2: `Bạn cần ${formatPoints(reward.points - points)} điểm nữa.` });
      return;
    }
    setPoints((current) => current - reward.points);
    setRedeemedIds((current) => new Set(current).add(reward.id));
    Toast.show({ type: "success", text1: `Đã đổi ${reward.title}`, text2: "Ưu đãi đã được lưu vào ví của bạn." });
  }

  function openShortcut(shortcut: ProfileShortcut) {
    if (shortcut.id === "orders") router.navigate("/(tabs)/orders");
    else if (shortcut.id === "addresses") router.push({ pathname: "/cart", params: { address: "edit" } });
    else if (shortcut.id === "farms") router.navigate("/(tabs)/farm");
    else Toast.show({ type: "info", text1: "Ví & Thanh toán", text2: "Phương thức thanh toán sẽ được kết nối khi backend sẵn sàng." });
  }

  function confirmSignOut() {
    Alert.alert("Đăng xuất tài khoản?", "Bạn sẽ cần xác thực lại số điện thoại để đăng nhập.", [
      { text: "Ở lại", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => void signOut().then(() => router.replace("/(auth)/login")),
      },
    ]);
  }

  function renderSection(item: ProfileSection) {
    if (item === "hero") return <ProfileHero phone={session?.phone} points={points} onHistory={() => setHistoryVisible(true)} />;
    if (item === "impact") return <ImpactSection />;
    if (item === "rewards") return <RewardsSection points={points} redeemedIds={redeemedIds} onRedeem={redeemReward} />;
    if (item === "management") return <ManagementSection onShortcut={openShortcut} />;
    return <SettingsSection onSignOut={confirmSignOut} />;
  }

  if (isLoading) return <ScreenSkeleton variant="profile" />;

  return (
    <View className="flex-1 bg-surface-soft">
      <FlashList
        data={sections}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderSection(item)}
        ItemSeparatorComponent={() => <View className="h-6" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        accessibilityElementsHidden={historyVisible}
        importantForAccessibility={historyVisible ? "no-hide-descendants" : "auto"}
      />
      {historyVisible ? <PointHistorySheet onClose={() => setHistoryVisible(false)} /> : null}
    </View>
  );
}
