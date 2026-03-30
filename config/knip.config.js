/** @type {import('knip').KnipConfig} */
module.exports = {
  // https://knip.dev/reference/plugins/next#default-configuration
  entry: [
    "next.config.{js,ts,cjs,mjs}",
    "{instrumentation,middleware}.{js,ts}",
    "app/global-error.{js,jsx,ts,tsx}",
    "app/**/{error,layout,loading,not-found,page,template,default}.{js,jsx,ts,tsx}",
    "app/**/route.{js,jsx,ts,tsx}",
    "app/{manifest,sitemap,robots}.{js,ts}",
    "app/**/{icon,apple-icon}.{js,jsx,ts,tsx}",
    "app/**/{opengraph,twitter}-image.{js,jsx,ts,tsx}",
    "pages/**/*.{js,jsx,ts,tsx}",
    "src/{instrumentation,middleware}.{js,ts}",
    "src/app/global-error.{js,jsx,ts,tsx}",
    "src/app/**/{error,layout,loading,not-found,page,template,default}.{js,jsx,ts,tsx}",
    "src/app/**/route.{js,jsx,ts,tsx}",
    "src/app/{manifest,sitemap,robots}.{js,ts}",
    "src/app/**/{icon,apple-icon}.{js,jsx,ts,tsx}",
    "src/app/**/{opengraph,twitter}-image.{js,jsx,ts,tsx}",
    "src/pages/**/*.{js,jsx,ts,tsx}",
    "config/**/*.{js,ts}",
  ],
  project: ["src/**/*.{js,ts,jsx,tsx}"],
  ignoreDependencies: [
    "sharp",
    "@release-it/conventional-changelog",
    "@types/react-redux",
    "tailwindcss",
    "tw-animate-css",
  ],
};

// More documentation on configuration: https://knip.dev/reference/configuration
