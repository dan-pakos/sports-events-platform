import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";

export const baseConfig = ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "error", // Security-first: No 'any'
      "@typescript-eslint/no-floating-promises": "error", // Prevent unhandled async
      "@typescript-eslint/await-thenable": "error",
    },
  },
  prettier, // Must be last to override stylistic rules
);
