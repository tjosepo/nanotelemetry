import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src", "!src/**/*.test.ts"],
  outDir: "dist",
  format: "esm",
  dts: true,
  clean: true,
  bundle: false,
});
