const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

/** @type {import("jest").Config} */
const jestBaseConfig = {
  watchPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/coverage/"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/coverage/"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/__test__/setup-tests.ts"],
  testMatch: ["**/*.{spec,test,snap}.{js,jsx,ts,tsx}"],
  collectCoverageFrom: ["*/**/*.{js,jsx,ts,tsx}", "!coverage/**", "!**/node_modules/**", "!**/.next/**"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(jestBaseConfig);
