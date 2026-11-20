import { useCartStore } from "@/features/cart/cart.store";
import { secureStorage, storage } from "@/lib/storage";
import { create } from "zustand";

const SESSION_KEY = "organic-auth-session";
const ONBOARDING_KEY = "organic-onboarding-complete";

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  phone?: string;
};

type AuthState = {
  session: AuthSession | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: true,
  hasCompletedOnboarding: false,

  hydrate: async () => {
    if (!get().isLoading) return;
    try {
      const [storedSession, hasCompletedOnboarding] = await Promise.all([
        secureStorage.getItem(SESSION_KEY),
        storage.getBoolean(ONBOARDING_KEY),
      ]);
      const parsedSession = storedSession
        ? (JSON.parse(storedSession) as AuthSession)
        : null;
      set({
        session: parsedSession?.accessToken ? parsedSession : null,
        hasCompletedOnboarding,
      });
    } catch {
      set({ session: null, hasCompletedOnboarding: false });
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    await storage.setBoolean(ONBOARDING_KEY, true);
    set({ hasCompletedOnboarding: true });
  },

  signIn: async (session) => {
    if (!session.accessToken) {
      throw new Error("Thiếu access token từ kết quả xác thực.");
    }
    await secureStorage.setItem(SESSION_KEY, JSON.stringify(session));
    set({ session });
  },

  signOut: async () => {
    await secureStorage.removeItem(SESSION_KEY);
    useCartStore.getState().reset();
    set({ session: null });
  },
}));
