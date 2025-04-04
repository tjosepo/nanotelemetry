import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  logLevel: "silent",
  root: resolve(__dirname, "./src/devtools"),
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: [
        resolve(__dirname, "./src/devtools/panel.html"),
        resolve(__dirname, "./src/devtools/devtools.html"),
      ],
    },
    outDir: resolve(__dirname, "./dist/devtools"),
  },
  base: "/dist/devtools/",
});
