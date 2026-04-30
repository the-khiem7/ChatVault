import type { RuntimeRequest, RuntimeResponse } from "./messages";

export type ActiveTab = {
  id?: number;
  url?: string;
};

export type ChromeApi = {
  getActiveTab(): Promise<ActiveTab | undefined>;
  injectContentScript?(tabId: number): Promise<void>;
  sendMessageToTab<T>(tabId: number, request: RuntimeRequest): Promise<RuntimeResponse<T>>;
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
    }
  };
}
