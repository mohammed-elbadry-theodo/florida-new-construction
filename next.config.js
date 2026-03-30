const { createSecureHeaders } = require("next-secure-headers");

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "";

const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE || "";

const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA || "";
const contentSecurityPolicy = {
  directives: {
    defaultSrc: "'self'",
    scriptSrc: "'self' 'unsafe-eval' 'unsafe-inline'",
    childSrc: "'self' https://*",
    styleSrc: "'self' https://*",
    fontSrc: "'self'",
    styleSrcElem: "'self' 'unsafe-inline'",
  },
};

const metaDataHeaders = [
  {
    key: "X-BUILD-ID",
    value: BUILD_ID,
  },
  {
    key: "X-BUILD-DATE",
    value: BUILD_DATE,
  },
  {
    key: "X-BUILD-SHA",
    value: BUILD_SHA,
  },
];

// Use http headers instead of http-equiv metadata
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#unsupported-metadata
const httpEquivHeaders = [
  {
    key: "X-UA-Compatible",
    value: "ie=edge",
  },
];

// Customize config based on build type
// static build doesn't support custom http headers
// https://nextjs.org/docs/app/building-your-application/deploying/static-exports#unsupported-features
const isStaticBuild = Boolean(process.env.NEXT_EXPORT_BUILD);

// https://nextjs.org/docs/pages/api-reference/next-config-js/output
const isStandaloneBuild = Boolean(process.env.NEXT_STANDALONE_BUILD);

/** @type {import('next').NextConfig} */
const basicConfig = {
  reactStrictMode: true,
  trailingSlash: true,
};

/** @type {import('next').NextConfig} */
const staticExportConfig = {
  ...basicConfig,
  output: "export",
};

/** @type {import('next').NextConfig} */
const dynamicExportConfig = {
  ...basicConfig,
  ...(isStandaloneBuild ? { output: "standalone" } : {}),
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: [
          ...metaDataHeaders,
          ...httpEquivHeaders,
          ...createSecureHeaders({
            contentSecurityPolicy,
          }),
        ],
      },
    ];
  },
};

module.exports = isStaticBuild ? staticExportConfig : dynamicExportConfig;
