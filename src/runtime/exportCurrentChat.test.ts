import { describe, expect, it, vi } from "vitest";
import type { ChromeApi } from "./chromeApi";
import { exportCurrentChat } from "./exportCurrentChat";

describe("exportCurrentChat", () => {
  it("extracts the conversation and returns a folder export artifact", async () => {
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

    const result = await exportCurrentChat(chromeApi);

    expect(chromeApi.sendMessageToTab).toHaveBeenCalledWith(5, { type: "EXTRACT_CONVERSATION" });
    expect(result).toEqual({
      ok: true,
      data: {
        rootFolder: "data-analysis-chatgpt",
        markdownPath: "conversation.md",
        title: "Data Analysis - ChatGPT",
        messageCount: 1,
        assetCandidateCount: 0,
        documentImageCount: 0,
        messageImageCount: 0,
        assetCount: 0,
        files: [
          {
            relativePath: "conversation.md",
            mimeType: "text/markdown",
            content: expect.stringContaining("# User\n\nHello")
          }
        ]
      },
      warnings: []
    });
  });

  it("resolves image assets before writing markdown and returns asset warnings", async () => {
    const chromeApi: ChromeApi = {
      getActiveTab: vi.fn().mockResolvedValue({ id: 5, url: "https://chatgpt.com/c/images" }),
      sendMessageToTab: vi.fn().mockResolvedValue({
        ok: true,
        data: {
          title: "Images - ChatGPT",
          sourceUrl: "https://chatgpt.com/c/images",
          extractedAt: "2026-04-30T13:00:00.000Z",
          diagnostics: {
            documentImageCount: 1,
            messageImageCount: 1
          },
          assetCandidates: [
            {
              id: "asset-1",
              messageId: "message-1",
              blockId: "message-1-block-1",
              kind: "image",
              sourceUrl: "data:image/png;base64,aGVsbG8=",
              altText: "Diagram",
              domOrder: 0,
              confidence: "high"
            }
          ],
          warnings: [],
          messages: [
            {
              id: "message-1",
              index: 0,
              role: "assistant",
              confidence: "high",
              warnings: [],
              blocks: [
                {
                  id: "message-1-block-1",
                  kind: "image",
                  assetCandidateId: "asset-1",
                  sourceUrl: "data:image/png;base64,aGVsbG8=",
                  altText: "Diagram"
                }
              ]
            }
          ]
        },
        warnings: []
      })
    };

    const result = await exportCurrentChat(chromeApi);

    expect(result).toMatchObject({
      ok: true,
      data: {
        rootFolder: "images-chatgpt",
        markdownPath: "conversation.md",
        assetCandidateCount: 1,
        documentImageCount: 1,
        messageImageCount: 1,
        assetCount: 1,
        files: [
          {
            relativePath: "conversation.md",
            mimeType: "text/markdown",
            content: expect.stringContaining("![Diagram](assets/001.png)")
          },
          {
            relativePath: "assets/001.png",
            mimeType: "image/png",
            content: expect.any(ArrayBuffer)
          }
        ]
      },
      warnings: []
    });
  });
});
