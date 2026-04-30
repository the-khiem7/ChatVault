import type { RuntimeRequest, RuntimeResponse } from "./messages";
import type { ResolvedAssetPayload } from "../assets/assetResolver";

export type ActiveTab = {
  id?: number;
  url?: string;
};

export type ChromeApi = {
  getActiveTab(): Promise<ActiveTab | undefined>;
  injectContentScript?(tabId: number): Promise<void>;
  sendMessageToTab<T>(tabId: number, request: RuntimeRequest): Promise<RuntimeResponse<T>>;
  fetchAsset?(sourceUrl: string): Promise<ResolvedAssetPayload>;
};

export function createChromeApi(): ChromeApi {
  return {
    async getActiveTab() {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0];
    },
    async injectContentScript(tabId: number) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["src/content.js"]
      });
    },
    async sendMessageToTab<T>(tabId: number, request: RuntimeRequest) {
      return chrome.tabs.sendMessage(tabId, request) as Promise<RuntimeResponse<T>>;
    },
    async fetchAsset(sourceUrl: string) {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Asset fetch failed with status ${response.status}.`);
      }

      return {
        bytes: await response.arrayBuffer(),
        mimeType: response.headers.get("content-type")?.split(";")[0]?.trim() || undefined
      };
    }
  };
}
