import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  outDir: "dist",
  format: "esm",
  dts: false,
  clean: true,
  bundle: false,
  silent: true,
});
