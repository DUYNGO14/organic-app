import { useEffect, useEffectEvent } from "react";
import { BackHandler } from "react-native";

/** Keeps later-mounted sheets ahead of their parents in Android Back dispatch. */
export function useBottomSheetBackHandler(onBack: () => void, enabled: boolean) {
  const handleBack = useEffectEvent(() => {
    if (!enabled) return false;
    onBack();
    return true;
  });

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => handleBack());
    return () => backSubscription.remove();
  }, []);
}
