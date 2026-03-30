// @ts-check

/** @type {import("./.ci/scripts/check-filesize.js").FileSizeCheckerConfig} */
const config = {
  directoriesRelativePaths: ["assets", "public", "out", ".next/static/media"],
  maxFileSizeInBytes: 500000,
  includeGlobPatterns: ["*"],
  excludeGlobPatterns: [],
};

module.exports = config;
