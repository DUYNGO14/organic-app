import { useCartStore } from "@/features/cart/cart.store";
import { storage } from "@/lib/storage";
import type { AuthSession, User } from "@/types/user";
import { create } from "zustand";

const SESSION_KEY = "organic-auth-session";
const ONBOARDING_KEY = "organic-onboarding-complete";

type AuthState = {
  session: AuthSession | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  saveAccessToken: (token: string) => Promise<void>;
  saveRefreshToken: (token: string) => Promise<void>;
  saveUserData: (userData: User) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => {
  let pendingWrite = Promise.resolve();

  function withSessionLock(operation: () => Promise<void>) {
    const result = pendingWrite.then(operation);
    pendingWrite = result.catch(() => {});
    return result;
  }

  async function persistSession(session: AuthSession) {
    if (!session.accessToken.trim()) {
      throw new Error("Thiếu access token từ kết quả xác thực.");
    }
    const nextSession = {
      ...session,
      phone: session.userData?.phone ?? session.phone,
    };
    await storage.setJSON(SESSION_KEY, nextSession);
    set({ session: nextSession });
  }

  function updateSession(update: (session: AuthSession) => AuthSession) {
    return withSessionLock(async () => {
      const session = get().session;
      if (!session) throw new Error("Chưa có phiên đăng nhập.");
      await persistSession(update(session));
    });
  }

  return {
    session: null,
    isLoading: true,
    hasCompletedOnboarding: false,

    hydrate: () =>
      withSessionLock(async () => {
        if (!get().isLoading) return;
        try {
          const [storedSession, hasCompletedOnboarding] = await Promise.all([
            storage.getJSON<AuthSession>(SESSION_KEY),
            storage.getBoolean(ONBOARDING_KEY),
          ]);
          const session =
            typeof storedSession?.accessToken === "string" &&
            storedSession.accessToken.trim()
              ? storedSession
              : null;
          set({ session, hasCompletedOnboarding });
        } catch {
          set({ session: null, hasCompletedOnboarding: false });
        } finally {
          set({ isLoading: false });
        }
      }),

    completeOnboarding: async () => {
      await storage.setBoolean(ONBOARDING_KEY, true);
      set({ hasCompletedOnboarding: true });
    },

    signIn: (session) => withSessionLock(() => persistSession(session)),

    signOut: () =>
      withSessionLock(async () => {
        await storage.remove(SESSION_KEY);
        useCartStore.getState().reset();
        set({ session: null });
      }),

    getAccessToken: () => get().session?.accessToken ?? null,
    getRefreshToken: () => get().session?.refreshToken ?? null,

    saveAccessToken: (accessToken) =>
      withSessionLock(() => persistSession({ ...get().session, accessToken })),

    saveRefreshToken: async (refreshToken) => {
      if (!refreshToken.trim()) throw new Error("Thiếu refresh token.");
      await updateSession((session) => ({ ...session, refreshToken }));
    },

    saveUserData: (userData) => updateSession((session) => ({ ...session, userData })),
  };
});

export const {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  saveUserData,
} = useAuthStore.getState();
