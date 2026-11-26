import { useAuthStore } from "@/features/auth/auth.store";
import { Redirect } from "expo-router";

export default function IndexRoute() {
  const isAuthed = useAuthStore((state) => state.status === "authenticated");
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding,
  );

  if (isAuthed) return <Redirect href="/(tabs)/home" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(auth)/login" />;
}
