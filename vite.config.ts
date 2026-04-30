import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

function copyManifest(): Plugin {
  return {
    name: "copy-extension-manifest",
    closeBundle() {
      copyFileSync(resolve(__dirname, "manifest.json"), resolve(__dirname, "dist/manifest.json"));
    }
  };
}

export default defineConfig({
  plugins: [copyManifest()],
  build: {
    outDir: "dist",
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
