import type FrJson from "./locales/fr.json";

export enum Language {
  FR = "fr",
  EN = "en",
}

export type TranslationJsonType = typeof FrJson;

export interface TranslationOption {
  nameSpace?: string;
  useSuspense?: boolean;
  keyPrefix?: string;
}

interface InterpolationOptions {
  formatSeparator?: string;
  escape?: (str: string) => string;
  alwaysFormat?: boolean;
  escapeValue?: boolean;
  prefix?: string;
  suffix?: string;
  defaultVariables?: Record<string, never>;
  maxReplaces?: number;
  skipOnVariables?: boolean;
}

export type TFunction = (key: string, options?: InterpolationOptions) => string;
