import { EmailVerificationProvider } from "@/features/auth/email-verification";
import { useAuthStore } from "@/features/auth/auth.store";
import { clearPendingMemberAction } from "@/features/auth/member-access";
import { Stack } from "expo-router";
import { useEffect } from "react";

export const unstable_settings = { anchor: "login" };

export default function AuthLayout() {
  useEffect(() => () => {
    if (!useAuthStore.getState().session) clearPendingMemberAction();
  }, []);

  return (
    <EmailVerificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </EmailVerificationProvider>
  );
}
