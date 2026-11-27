import { useTranslation } from "react-i18next";

import { i18n } from "./index";
import en from "./locales/content.en.json";

const englishContent: Readonly<Record<string, string>> = en;

// Keep catalog and fixture values stable for storage, filtering, and acknowledgments.
function translateContent(value: string) {
  return Object.hasOwn(englishContent, value) ? englishContent[value] : value;
}

const originalContent = (value: string) => value;

export function localizeContent(value: string) {
  return i18n.resolvedLanguage === "en" ? translateContent(value) : value;
}

export function useAppTranslation() {
  const { i18n, t } = useTranslation();
  const localize = i18n.resolvedLanguage === "en" ? translateContent : originalContent;
  return { t, localize };
}
