import { describe, expect, it } from "vitest";

import type { NormalizedConversationDraft } from "./contracts";
import { buildNormalizedExportArtifact } from "./buildExportArtifact";

describe("buildNormalizedExportArtifact", () => {
  it("builds normalized export artifact from normalized conversation draft", () => {
    const draft: NormalizedConversationDraft = {
      page: {
        title: "Image Export - ChatGPT",
        url: "https://chatgpt.com/c/images",
        providerId: "chatgpt"
      },
      providerStatus: {
        providerId: "chatgpt",
        status: "available"
      },
      conversation: {
        title: "Image Export - ChatGPT",
        sourceUrl: "https://chatgpt.com/c/images",
        extractedAt: "2026-05-01T01:00:00.000Z",
        assetCandidates: [],
        diagnostics: {
          documentImageCount: 1,
          messageImageCount: 1
        },
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
      }
    };

    const artifact = buildNormalizedExportArtifact(draft, {
      assetReferences: new Map([["asset-1", { markdownPath: "assets/001.png" }]]),
      assetFiles: [
        {
          assetId: "asset-1",
          relativePath: "assets/001.png",
          mimeType: "image/png",
          bytes: new Uint8Array([1, 2, 3]).buffer
        }
      ],
      warnings: []
    });

    expect(artifact).toEqual({
      title: "Image Export - ChatGPT",
      rootFolder: "image-export-chatgpt",
      markdownPath: "conversation.md",
      files: [
        {
          relativePath: "conversation.md",
          mimeType: "text/markdown",
          content: expect.stringContaining("![Diagram](assets/001.png)")
        },
        {
          relativePath: "assets/001.png",
          mimeType: "image/png",
          content: [1, 2, 3]
        }
      ],
      summary: {
        messageCount: 1,
        assetCandidateCount: 0,
        documentImageCount: 1,
        messageImageCount: 1,
        assetCount: 1
      }
    });
  });
});
