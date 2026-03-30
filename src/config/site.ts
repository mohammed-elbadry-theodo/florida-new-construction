import type { SiteConfiguration } from "./types";

export const SITE_CONFIG: SiteConfiguration = {
  description: `Nimbleways' Opinionated Next.js boilerplate`,
  title: "NimbleNext",
  titleSeparator: " · ",

  domain: `nimbleways.com`,
  siteUrl: `https://www.nimbleways.com`,
} as const;
