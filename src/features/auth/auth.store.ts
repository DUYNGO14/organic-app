import { useCartStore } from "@/features/cart/cart.store";
import { queryClient } from "@/lib/query-client";
import { storage } from "@/lib/storage";
import type { AuthSession, User } from "@/types/user";
import { create } from "zustand";
import { authSession } from "./authRuntime";
import { hasToken } from "./tokenStorage";

const ONBOARDING_KEY = "organic-onboarding-complete";

type AuthState = {
  status: "booting" | "authenticated" | "unauthenticated";
  user: User | null;
  isDemo: boolean;
  hasCompletedOnboarding: boolean;
  returnTo: string | null;
  bootstrap: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

let bootstrapTask: Promise<void> | undefined;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "booting",
  user: null,
  isDemo: false,
  hasCompletedOnboarding: false,
  returnTo: null,

  bootstrap: () => {
    if (get().status !== "booting") return Promise.resolve();
    bootstrapTask ??= Promise.allSettled([
      authSession.bootstrap(),
      storage.getBoolean(ONBOARDING_KEY),
    ]).then(([, onboarding]) => {
      const session = authSession.getSnapshot();
      set({
        status: session ? "authenticated" : "unauthenticated",
        hasCompletedOnboarding: onboarding.status === "fulfilled" && onboarding.value,
      });
    });
    return bootstrapTask;
  },

  completeOnboarding: async () => {
    await storage.setBoolean(ONBOARDING_KEY, true);
    set({ hasCompletedOnboarding: true });
  },

  signIn: authSession.signIn,
  signOut: async () => {
    set({ returnTo: null });
    await authSession.signOut();
  },
}));

authSession.setChangeHandler((session, reason) => {
  if (reason === "signin" || reason === "signout" || reason === "expired") {
    queryClient.clear();
    useCartStore.getState().reset();
  }
  useAuthStore.setState({
    user: session?.user ?? null,
    isDemo: session?.accessToken.startsWith("demo-") ?? false,
    ...(reason !== "bootstrap"
      ? { status: session ? "authenticated" : "unauthenticated" }
      : {}),
  });
});

export function getAccessToken() {
  return authSession.getSnapshot()?.accessToken ?? null;
}

export function getRefreshToken() {
  return authSession.getSnapshot()?.refreshToken ?? null;
}

export function saveAccessToken(accessToken: string) {
  const session = authSession.getSnapshot();
  return session
    ? authSession.saveTokens(session.sid, { accessToken })
    : authSession.signIn({ accessToken });
}

export async function saveRefreshToken(refreshToken: string) {
  const session = authSession.getSnapshot();
  if (!session) throw new Error("Chưa có phiên đăng nhập.");
  if (!hasToken(refreshToken)) throw new Error("Thiếu refresh token.");
  await authSession.saveTokens(session.sid, { refreshToken });
}

export const saveUserData = authSession.saveUserData;
export const clearTokens = () => useAuthStore.getState().signOut();
