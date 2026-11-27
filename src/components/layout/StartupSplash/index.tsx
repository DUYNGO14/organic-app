import { useAppColors } from "@/hooks/use-app-colors";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  FadeOut,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { StartupTitle, startupTitle } from "./StartupTitle";

const exitAnimation = FadeOut.duration(240).reduceMotion(ReduceMotion.System);
const previewHoldMs = 2_000;
const logo = require("@/assets/images/logo-adiogo/adigo-logo.png");

export function StartupSplash({
  fontsReady,
  onReady,
  onComplete,
}: {
  fontsReady: boolean;
  onReady: () => void;
  onComplete: () => void;
}) {
  const colors = useAppColors();
  const [logoReady, setLogoReady] = useState(false);
  const [logoComplete, setLogoComplete] = useState(false);
  const [titleComplete, setTitleComplete] = useState(false);
  const logoProgress = useSharedValue(0);
  const showTitle = logoReady && fontsReady;
  const logoStyle = useAnimatedStyle(() => {
    const progress = logoProgress.get();
    return {
      opacity: interpolate(progress, [0, 0.55, 1], [0.2, 1, 1]),
      transform: [
        { scale: interpolate(progress, [0, 0.72, 1], [0.88, 1.04, 1]) },
      ],
    };
  });
  const completeTitle = useCallback(() => setTitleComplete(true), []);

  useEffect(() => {
    if (!logoReady) return;
    logoProgress.set(
      withTiming(
        1,
        {
          duration: 640,
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          if (finished) scheduleOnRN(setLogoComplete, true);
        },
      ),
    );
    return () => cancelAnimation(logoProgress);
  }, [logoProgress, logoReady]);

  useEffect(() => {
    if (!logoComplete || !titleComplete) return;
    if (__DEV__) {
      const timeout = setTimeout(onComplete, previewHoldMs);
      return () => clearTimeout(timeout);
    }
    onComplete();
  }, [logoComplete, onComplete, titleComplete]);

  function handleLogoReady() {
    onReady();
    setLogoReady(true);
  }

  return (
    <Animated.View exiting={exitAnimation} style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.canvas, colors.surfaceContainer]}
        style={StyleSheet.absoluteFill}
      />
      <View
        className="flex-1 items-center justify-center"
        accessible
        accessibilityLabel={startupTitle}
      >
        <View className="w-full items-center">
          <Animated.View style={logoStyle}>
            <Image
              source={logo}
              contentFit="contain"
              style={{ width: 160, height: 160 }}
              onDisplay={handleLogoReady}
              onError={handleLogoReady}
            />
          </Animated.View>
          {showTitle ? (
            <View className="absolute inset-x-0 top-full px-2">
              <StartupTitle
                colors={[colors.logoStart, colors.logoEnd]}
                onComplete={completeTitle}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
