import { useCallback, useSyncExternalStore } from "react";
import { AppState } from "react-native";

const millisecondsPerSecond = 1_000;

/** Counts down to a Unix timestamp in milliseconds. Null means no deadline. */
export function useCountdown(expiresAt: number | null) {
  const deadline = Number.isFinite(expiresAt) ? expiresAt : null;

  const getSnapshot = useCallback(() => {
    if (deadline === null) return null;
    return Math.max(0, Math.ceil((deadline - Date.now()) / millisecondsPerSecond));
  }, [deadline]);

  const subscribe = useCallback((onChange: () => void) => {
    if (deadline === null) return () => {};

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      clearTimeout(timeout);
      const remainingMs = deadline - Date.now();
      if (remainingMs > 0) {
        const delay = remainingMs % millisecondsPerSecond || millisecondsPerSecond;
        timeout = setTimeout(update, delay);
      }
      onChange();
    };

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") update();
      else clearTimeout(timeout);
    });
    if (AppState.currentState === null || AppState.currentState === "active") update();

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [deadline]);

  const remainingSeconds = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return { remainingSeconds, isExpired: remainingSeconds === 0 };
}
