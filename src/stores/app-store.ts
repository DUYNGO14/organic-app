  // # theme, language, onboarding
import { create } from "zustand";
import { storage } from "@/lib/storage";

export type ThemeMode = "system" | "light" | "dark";

type AppState = {
  themeMode: ThemeMode;
  isThemeHydrated: boolean;
  hydrateTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useAppStore = create<AppState>((set) => ({
  themeMode: "system",
  isThemeHydrated: false,
  hydrateTheme: async () => {
    try {
      const storedMode = await storage.getString("appearance.themeMode");
      if (storedMode === "system" || storedMode === "light" || storedMode === "dark") {
        set({ themeMode: storedMode });
      }
    } catch {
      set({ themeMode: "system" });
    } finally {
      set({ isThemeHydrated: true });
    }
  },
  setThemeMode: (themeMode) => {
    set({ themeMode });
    void storage.setString("appearance.themeMode", themeMode).catch(() => {
      // Preserve the in-memory theme choice if device storage is unavailable.
    });
  },
}));
