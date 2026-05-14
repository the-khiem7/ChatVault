import { describe, expect, it } from "vitest";

import { buildExtensionManifest, resolveBrowserBuildTarget } from "./manifest";

describe("browser manifest build target", () => {
  it("resolves chrome as default target", () => {
    expect(resolveBrowserBuildTarget()).toBe("chrome");
  });

  it("builds chrome manifest with service worker background", () => {
    const manifest = buildExtensionManifest("chrome", "0.6.8");

    expect(manifest.background).toEqual({
      service_worker: "src/serviceWorker.js",
      type: "module"
    });
    expect(manifest.browser_specific_settings).toBeUndefined();
  });

  it("builds firefox manifest with browser specific settings", () => {
    const manifest = buildExtensionManifest("firefox", "0.6.8");

    expect(manifest.background).toEqual({
      scripts: ["src/serviceWorker.js"],
      type: "module"
    });
    expect(manifest.browser_specific_settings).toEqual({
      gecko: {
        id: "chatcargo@local"
      }
    });
  });
});
