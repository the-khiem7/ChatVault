import { describe, expect, it, vi } from "vitest";
import type { ChromeApi } from "./chromeApi";
import { exportCurrentChat } from "./exportCurrentChat";

describe("exportCurrentChat", () => {
  it("extracts the conversation, writes markdown, and downloads a markdown file", async () => {
    const chromeApi: ChromeApi = {
      getActiveTab: vi.fn().mockResolvedValue({ id: 5, url: "https://chatgpt.com/c/abc" }),
      sendMessageToTab: vi.fn().mockResolvedValue({
        ok: true,
        data: {
          title: "Data Analysis - ChatGPT",
          sourceUrl: "https://chatgpt.com/c/abc",
          extractedAt: "2026-04-30T13:00:00.000Z",
          assetCandidates: [],
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
      }),
      downloadMarkdown: vi.fn().mockResolvedValue(undefined)
    };

    const result = await exportCurrentChat(chromeApi);

    expect(chromeApi.sendMessageToTab).toHaveBeenCalledWith(5, { type: "EXTRACT_CONVERSATION" });
    expect(chromeApi.downloadMarkdown).toHaveBeenCalledWith(
      "chatgpt-export-data-analysis-chatgpt.md",
      expect.stringContaining("# User\n\nHello")
    );
    expect(result).toEqual({
      ok: true,
      data: {
        filename: "chatgpt-export-data-analysis-chatgpt.md",
        title: "Data Analysis - ChatGPT",
        messageCount: 1
      },
      warnings: []
    });
  });
});
