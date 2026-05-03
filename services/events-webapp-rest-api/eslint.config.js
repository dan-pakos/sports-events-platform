import { baseConfig } from "@sep/eslint-config";

export default [
  ...baseConfig,
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
];
