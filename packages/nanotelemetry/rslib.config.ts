import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [{
      format: "esm",
      dts: { bundle: true },
  }],
  source: {
    tsconfigPath: "tsconfig.lib.json",
    entry: {
      index: "./src/index.ts",
    }
  },
  output: {
    target: 'web',
    minify: true,
    sourceMap: true,
  },
});