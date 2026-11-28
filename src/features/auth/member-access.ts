import { router } from "expo-router";
import { useAuthStore } from "./auth.store";

let pendingAction: (() => void) | null = null;

export function requestSignIn(action?: () => void) {
  if (useAuthStore.getState().session) {
    action?.();
    return;
  }

  pendingAction = action ?? null;
  router.navigate("/(auth)/login");
}

export function clearPendingMemberAction() {
  pendingAction = null;
}

export function cancelSignIn() {
  clearPendingMemberAction();
  if (router.canGoBack()) router.back();
  else router.replace("/(tabs)/home");
}

export function resumePendingMemberAction() {
  if (!useAuthStore.getState().session) return;

  const action = pendingAction;
  clearPendingMemberAction();
  action?.();
}
