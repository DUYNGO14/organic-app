import { EmailVerificationProvider } from "@/features/auth/email-verification";
import { Stack } from "expo-router";

export const unstable_settings = { anchor: "login" };

export default function AuthLayout() {
  return (
    <EmailVerificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </EmailVerificationProvider>
  );
}
