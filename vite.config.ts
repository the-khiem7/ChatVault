import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { buildExtensionManifest, resolveBrowserBuildTarget } from "./src/platform/browser/manifest";

function copyManifest(target: "chrome" | "firefox", version: string): Plugin {
  return {
    name: "copy-extension-manifest",
    closeBundle() {
      const distDir = resolve(__dirname, `dist/${target}`);
      mkdirSync(distDir, { recursive: true });
      const manifest = buildExtensionManifest(target, version);
      writeFileSync(resolve(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));
      copyFileSync(resolve(__dirname, "README.md"), resolve(distDir, "README.md"));
    }
  };
}

const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8")) as { version: string };
const target = resolveBrowserBuildTarget(process.env.BROWSER_TARGET);

export default defineConfig({
  plugins: [copyManifest(target, pkg.version)],
  build: {
    outDir: `dist/${target}`,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/popup.html"),
        serviceWorker: resolve(__dirname, "src/background/serviceWorker.ts"),
        content: resolve(__dirname, "src/content/content.ts")
      },
      output: {
        entryFileNames: "src/[name].js",
        chunkFileNames: "src/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
