import tildeImports from "rollup-plugin-tilde-imports";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tildeImports()],
});
