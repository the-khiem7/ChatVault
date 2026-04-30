import { describe, expect, it, vi } from "vitest";
import { getActiveTabStatus } from "./activeTabStatus";
import type { ChromeApi } from "./chromeApi";

describe("getActiveTabStatus", () => {
  it("returns an unsupported-page error when the active tab is not ChatGPT", async () => {
    const chromeApi: ChromeApi = {
      getActiveTab: vi.fn().mockResolvedValue({ id: 3, url: "https://example.com" }),
      sendMessageToTab: vi.fn()
    };

    const response = await getActiveTabStatus(chromeApi);

    expect(response).toEqual({
      ok: false,
      error: {
        code: "UNSUPPORTED_PAGE",
        message: "Open a supported ChatGPT conversation page before exporting."
      },
      warnings: []
    });
    expect(chromeApi.sendMessageToTab).not.toHaveBeenCalled();
  });

  it("requests a page summary from the content script for supported tabs", async () => {
    const chromeApi: ChromeApi = {
      getActiveTab: vi.fn().mockResolvedValue({ id: 7, url: "https://chatgpt.com/c/abc" }),
      sendMessageToTab: vi.fn().mockResolvedValue({
        ok: true,
        data: { title: "Export me", url: "https://chatgpt.com/c/abc" },
        warnings: []
      })
    };

    const response = await getActiveTabStatus(chromeApi);

    expect(chromeApi.sendMessageToTab).toHaveBeenCalledWith(7, {
      type: "EXTRACT_PAGE_SUMMARY"
    });
    expect(response).toEqual({
      ok: true,
      data: {
        supported: true,
        tabId: 7,
        url: "https://chatgpt.com/c/abc",
        title: "Export me"
      },
      warnings: []
    });
  });
});
