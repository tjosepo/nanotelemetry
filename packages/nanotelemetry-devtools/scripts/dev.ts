import pc from "picocolors";
import chokidar from "chokidar";
import { build as viteBuild } from "vite";
import { build as tsupBuild } from "tsup";
import { fileURLToPath } from "node:url";

async function buildDevtoolsPanel() {
  const watcher = (await viteBuild({
    mode: "development",
    define: {
      "process.env.NODE_ENV": '"development"',
    },
    configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
    build: {
      minify: false,
      watch: {
        buildDelay: 100,
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;

  let start = performance.now();
  watcher.on("event", (event) => {
    if (event.code === "START") {
      console.log(pc.green("Building Panel..."));
      start = performance.now();
    }
    if (event.code === "END") {
      const time = performance.now() - start;
      console.log(pc.green(`Panel built in ${time.toFixed(2)}ms`));
    }
  });
}

buildDevtoolsPanel();

async function buildBackend() {
  console.log(pc.magenta("Building Extension..."));
  const start = performance.now();
  await tsupBuild({
    entry: ["./src/**/*", "!./src/devtools/**/*"],
    outDir: "./dist",
    format: ["esm"],
    silent: true,
  });
  const time = performance.now() - start;
  console.log(pc.magenta(`Extension built in ${time.toFixed(2)}ms`));
}

buildBackend();

chokidar
  .watch(["src/**/*", "!src/devtools/**/*"])
  .on("change", () => buildBackend());
