import enMessages from "./locales/en.json";
import frMessages from "./locales/fr.json";
import { createTestTranslationProvider, createTranslationProvider } from "./TranslationProvider";
import type { TFunction } from "./types";
import { Language } from "./types";

/* eslint-disable-next-line no-restricted-imports */
import type { i18n as i18nApi, Resource } from "i18next";
/* eslint-disable-next-line no-restricted-imports */
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
/* eslint-disable-next-line no-restricted-imports */
import { initReactI18next } from "react-i18next";

const defaultNS = "translation";
const defaultLanguage = Language.FR;

const resources: Resource = {
  fr: { [defaultNS]: frMessages },
  en: { [defaultNS]: enMessages },
};

const isDevelopment = process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";

export const i18nInitializer = async (): Promise<i18nApi> => {
  return i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      lng: defaultLanguage,
      defaultNS,
      resources,
      debug: isDevelopment,
      load: "languageOnly",
      saveMissing: true,
      returnEmptyString: false,
      missingKeyNoValueFallbackToKey: false,
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false,
      },
    })
    .then(() => {
      return i18next;
    });
};

export const translate: TFunction = (key, iOptions) => i18next.t(key, iOptions ?? {});
export const TranslationProvider = createTranslationProvider(i18next);
export const TestTranslationProvider = createTestTranslationProvider(i18next);
