import { useAuthStore } from "@/features/auth/auth.store";
import { Redirect } from "expo-router";

export default function IndexRoute() {
  const session = useAuthStore((state) => state.session);
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding,
  );

  if (session) return <Redirect href="/(tabs)/home" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(auth)/login" />;
}
