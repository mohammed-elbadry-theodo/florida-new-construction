import type { Language, TranslationOption } from "~i18n/types";

/* eslint-disable-next-line no-restricted-imports */
import { useTranslation as _useTranslation } from "react-i18next";

export function useLanguage(options?: TranslationOption): [Language, (language: Language) => Promise<void>] {
  const { i18n } = _useTranslation(options?.nameSpace ?? "translation");
  const changeLanguage = async (language: Language) => {
    await i18n.changeLanguage(language);
  };
  return [i18n.language as Language, changeLanguage];
}
