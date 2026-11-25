import { cn } from "@/lib/cn";
import { useEffect, useState, type PropsWithChildren } from "react";
import { AccessibilityInfo, View } from "react-native";
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function SkeletonBlock({ className }: { className: string }) {
  return <View className={cn("rounded bg-surface-container-high", className)} />;
}

export function SkeletonGroup({
  active = true,
  children,
  className,
  label,
}: PropsWithChildren<{ active?: boolean; className?: string; label: string }>) {
  const initialReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(initialReducedMotion);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    opacity.set(1);
    if (active && !reduceMotion) {
      opacity.set(withRepeat(
        withTiming(0.55, { duration: 850 }),
        -1,
        true,
        undefined,
        ReduceMotion.System,
      ));
    }
    return () => cancelAnimation(opacity);
  }, [active, opacity, reduceMotion]);

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      className={className}
      pointerEvents="none"
    >
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={animatedStyle}
      >
        {children}
      </Animated.View>
    </View>
  );
}
