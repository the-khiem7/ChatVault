export type BrowserBuildTarget = "chrome" | "firefox";

type ExtensionManifest = {
  manifest_version: number;
  name: string;
  description: string;
  version: string;
  icons: Record<string, string>;
  action: {
    default_popup: string;
    default_title: string;
    default_icon: Record<string, string>;
  };
  background: {
    service_worker?: string;
    scripts?: string[];
    type?: "module";
  };
  permissions: string[];
  host_permissions: string[];
  content_scripts: Array<{
    matches: string[];
    js: string[];
    run_at: "document_idle";
  }>;
  browser_specific_settings?: {
    gecko: {
      id: string;
    };
  };
};

export function resolveBrowserBuildTarget(raw?: string): BrowserBuildTarget {
  return raw === "firefox" ? "firefox" : "chrome";
}

export function buildExtensionManifest(target: BrowserBuildTarget, version: string): ExtensionManifest {
  const base: ExtensionManifest = {
    manifest_version: 3,
    name: "ChatCargo",
    description: "Export the current ChatGPT conversation into a local Markdown archive.",
    version,
    icons: {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    action: {
      default_popup: "src/popup/popup.html",
      default_title: "ChatCargo",
      default_icon: {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png"
      }
    },
    background: {
      service_worker: "src/serviceWorker.js",
      type: "module"
    },
    permissions: ["activeTab", "scripting", "downloads"],
    host_permissions: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
    content_scripts: [
      {
        matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
        js: ["src/content.js"],
        run_at: "document_idle"
      }
    ]
  };

  if (target === "firefox") {
    return {
      ...base,
      background: {
        scripts: ["src/serviceWorker.js"],
        type: "module"
      },
      browser_specific_settings: {
        gecko: {
          id: "chatcargo@local"
        }
      }
    };
  }

  return base;
}
