import { PrimaryBtn } from "@/components/common";
import { useAuthStore } from "@/features/auth/auth.store";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, Award, BadgeCheck, Leaf } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const { colorScheme } = useColorScheme();
  const [isStarting, setIsStarting] = useState(false);
  const isDark = colorScheme === "dark";

  async function handleStart() {
    if (isStarting) return;
    setIsStarting(true);
    try {
      await completeOnboarding();
      router.replace("/(auth)/login");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <View className="flex-1 overflow-hidden bg-surface">
      <View pointerEvents="none" className="absolute inset-0">
        <LinearGradient
          colors={
            isDark
              ? ["#101412", "#17231B", "#101412"]
              : ["#F9FAF8", "#EFF9E9", "#E6F8EE"]
          }
          locations={[0, 0.52, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          pointerEvents="none"
          className="absolute -left-8 top-16 h-36 w-28 rounded-full"
          style={{
            backgroundColor: isDark
              ? "rgba(56,193,114,0.08)"
              : "rgba(164,249,93,0.16)",
            transform: [{ rotate: "-28deg" }],
          }}
        />
        <View
          pointerEvents="none"
          className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full"
          style={{
            backgroundColor: isDark
              ? "rgba(0,230,118,0.06)"
              : "rgba(129,217,151,0.12)",
          }}
        />
      </View>

      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-between px-4 pb-3 pt-4">
          <View className="items-center pt-2">
            <View className="flex-row items-center gap-2 rounded-full bg-surface-container px-4 py-2 shadow-sm">
              <Leaf
                color={isDark ? "#38C172" : "#005026"}
                fill={isDark ? "#38C172" : "#005026"}
                size={16}
              />
              <Text className="font-vietnam text-label-md uppercase tracking-wider text-primary">
                Tiêu chuẩn canh tác hữu cơ
              </Text>
            </View>
          </View>

          <View className="w-full items-center py-6">
            <View className="mb-5 h-40 w-40 items-center justify-center rounded-full bg-secondary-container/25">
              <View className="h-28 w-28 items-center justify-center rounded-full bg-surface-container-lowest p-3 shadow-lg">
                <Image
                  accessibilityLabel="Logo Organic Việt Nam"
                  contentFit="contain"
                  source={require("@/assets/images/logo.png")}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </View>

            <Text className="text-center font-vietnam text-headline-lg-mobile text-primary">
              ORGANIC VIỆT NAM
            </Text>
            <Text className="mt-2 max-w-[310px] text-center font-vietnam text-body-lg text-ink">
              Từ nông trại hữu cơ thuần khiết đến bàn ăn lành mạnh của gia đình
              Việt
            </Text>

            {/* <View className="mt-8 w-full px-8">
              <View className="h-2 overflow-hidden rounded-full bg-surface-container">
                <View className="h-full w-[93%] rounded-full bg-secondary" />
              </View>
              <View className="mt-2 flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-secondary" />
                  <Text className="flex-1 font-vietnam text-label-md text-muted" numberOfLines={1}>
                    Đang khởi tạo nguồn nông sản...
                  </Text>
                </View>
                <Text className="font-vietnam text-label-lg text-secondary">93%</Text>
              </View>
            </View> */}
          </View>

          <View className="gap-4 pb-2">
            <PrimaryBtn
              title="Bắt đầu khám phá"
              loading={isStarting}
              fullWidth
              className="min-h-[52px] rounded-xl"
              trailingIcon={
                <ArrowRight color={isDark ? "#121614" : "#FFFFFF"} size={21} />
              }
              onPress={() => void handleStart()}
            />

            <View className="items-center gap-1.5">
              <View className="flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <View className="flex-row items-center gap-1.5">
                  <BadgeCheck
                    color={isDark ? "#81D997" : "#376B00"}
                    size={17}
                  />
                  <Text className="font-vietnam text-body-md text-tertiary">
                    TCVN 11041
                  </Text>
                </View>
                <View className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
                <View className="flex-row items-center gap-1.5">
                  <Award color={isDark ? "#81D997" : "#376B00"} size={17} />
                  <Text className="font-vietnam text-body-md text-muted">
                    USDA & EU Organic
                  </Text>
                </View>
              </View>
              <Text className="font-vietnam text-label-md text-muted">
                Phiên bản 1.0.0 · 100% Nông Nghiệp Xanh
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
