import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform } from "react-native";

import { storage } from "@/lib/storage";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

export const supportedLanguages = ["vi", "en"] as const;
export type AppLanguage = (typeof supportedLanguages)[number];

const fallbackLanguage: AppLanguage = "vi";
const storageKey = "preferences.language";

export const i18n = createInstance();
let savedLanguage: AppLanguage | undefined;
let initialization: Promise<void> | undefined;
let pendingSave = Promise.resolve();

export function getFormattingLocale() {
  return i18n.resolvedLanguage === "en" ? "en-US" : "vi-VN";
}

function isAppLanguage(value: string | null): value is AppLanguage {
  return value === "vi" || value === "en";
}

export function getDeviceLanguage(locales = getLocales()): AppLanguage {
  for (const { languageCode } of locales) {
    if (isAppLanguage(languageCode)) return languageCode;
  }
  return fallbackLanguage;
}

async function readLanguage() {
  try {
    const value = Platform.OS === "web"
      ? globalThis.localStorage?.getItem(storageKey) ?? null
      : await storage.getString(storageKey);
    return isAppLanguage(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function initializeLanguage() {
  initialization ??= (async () => {
    savedLanguage = await readLanguage();
    await i18n.use(initReactI18next).init({
      resources: { en: { translation: en }, vi: { translation: vi } },
      lng: savedLanguage ?? getDeviceLanguage(),
      supportedLngs: [...supportedLanguages],
      fallbackLng: fallbackLanguage,
      interpolation: { escapeValue: false },
    });
  })();
  return initialization;
}

export function syncDeviceLanguage(language: AppLanguage) {
  if (!savedLanguage && i18n.resolvedLanguage !== language) {
    void i18n.changeLanguage(language);
  }
}

export async function setAppLanguage(language: AppLanguage) {
  await initializeLanguage();
  savedLanguage = language;
  void i18n.changeLanguage(language);

  // Keep rapid changes in selection in the same order on disk.
  pendingSave = pendingSave.then(async () => {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(storageKey, language);
    } else {
      await storage.setString(storageKey, language);
    }
  }).catch(() => {
    // The active language still works when local storage is unavailable.
  });
  await pendingSave;
}
