import { describe, expect, it, vi } from "vitest";

import type { ChromeApi } from "../runtime/chromeApi";
import { exportCurrentChatApp } from "./exportCurrentChatApp";

describe("exportCurrentChatApp", () => {
  it("publishes app orchestration progress around runtime export", async () => {
    const progress = vi.fn();
    const chromeApi: ChromeApi = {
      getActiveTab: vi.fn().mockResolvedValue({ id: 5, url: "https://chatgpt.com/c/abc" }),
      sendMessageToTab: vi.fn().mockResolvedValue({
        ok: true,
        data: {
          title: "Data Analysis - ChatGPT",
          sourceUrl: "https://chatgpt.com/c/abc",
          extractedAt: "2026-04-30T13:00:00.000Z",
          assetCandidates: [],
          diagnostics: {
            documentImageCount: 0,
            messageImageCount: 0
          },
          warnings: [],
          messages: [
            {
              id: "message-1",
              index: 0,
              role: "user",
              confidence: "high",
              warnings: [],
              blocks: [{ id: "message-1-block-1", kind: "paragraph", text: "Hello" }]
            }
          ]
        },
        warnings: []
      })
    };

    const result = await exportCurrentChatApp(chromeApi, progress);

    expect(result.ok).toBe(true);
    expect(progress).toHaveBeenNthCalledWith(1, {
      phase: "detecting-provider",
      completed: 0,
      total: 1,
      currentLabel: "active-tab"
    });
    expect(progress).toHaveBeenNthCalledWith(2, {
      phase: "extracting-content",
      completed: 0,
      total: 1,
      currentLabel: "chatgpt"
    });
    expect(progress).toHaveBeenLastCalledWith({
      phase: "building-artifact",
      completed: 1,
      total: 1,
      currentLabel: "conversation.md"
    });
  });
});
