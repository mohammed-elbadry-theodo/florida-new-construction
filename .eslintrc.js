// @ts-check

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals", "@nimbleways/eslint-config"],
  plugins: ["better-tailwindcss"],
  parserOptions: {
    ecmaVersion: "latest",
  },

  settings: {
    "better-tailwindcss": {
      entryPoint: "src/styles/globals.css",
    },
  },

  rules: {
    "better-tailwindcss/no-duplicate-classes": "error",
    "better-tailwindcss/enforce-shorthand-classes": "error",
    "better-tailwindcss/no-conflicting-classes": "error",
    "better-tailwindcss/no-restricted-classes": "error",
    "better-tailwindcss/no-deprecated-classes": "error",
    "better-tailwindcss/enforce-consistent-variable-syntax": "error",
    "better-tailwindcss/enforce-consistent-class-order": "error",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "i18next",
            message: "Importing the i18next library is not allowed.use local module ~i18n",
          },
          {
            name: "react-i18next",
            message: "Importing the react-i18next library is not allowed",
          },
          {
            name: "@testing-library/react",
            message: "Please import from test-utils",
          },
          {
            name: "@testing-library/user-event",
            message: "Please import from test-utils",
          },
        ],
      },
    ],
  },

  overrides: [
    {
      files: ["*.{spec,test}.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "CallExpression[callee.property.name='toMatchSnapshot']",
            message: "Unexpected toMatchSnapshot",
          },
        ],
      },
    },
  ],
};
