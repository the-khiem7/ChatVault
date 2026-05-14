import { describe, expect, it } from "vitest";

import type { ConversationDraft } from "../../domain/conversation";
import type { FolderExportResult } from "../../runtime/messages";
import {
  toNormalizedConversationDraft,
  toNormalizedExportArtifact,
  EXPORT_PROGRESS_PHASES
} from "./legacyAdapters";

describe("legacyAdapters", () => {
  it("maps current conversation draft to normalized conversation draft", () => {
    const current: ConversationDraft = {
      title: "Demo Chat",
      sourceUrl: "https://chatgpt.com/c/123",
      extractedAt: "2026-05-15T10:00:00.000Z",
      assetCandidates: [],
      diagnostics: {
        documentImageCount: 2,
        messageImageCount: 1
      },
      warnings: [],
      messages: [
        {
          id: "message-1",
          index: 0,
          role: "user",
          confidence: "high",
          warnings: [],
          blocks: [{ id: "block-1", kind: "paragraph", text: "Hello" }]
        }
      ]
    };

    expect(toNormalizedConversationDraft(current)).toEqual({
      page: {
        title: "Demo Chat",
        url: "https://chatgpt.com/c/123",
        providerId: "chatgpt"
      },
      conversation: current,
      providerStatus: {
        providerId: "chatgpt",
        status: "available"
      }
    });
  });

  it("maps current folder export result to normalized export artifact", () => {
    const current: FolderExportResult = {
      rootFolder: "demo-chat",
      markdownPath: "conversation.md",
      title: "Demo Chat",
      messageCount: 1,
      assetCandidateCount: 2,
      documentImageCount: 2,
      messageImageCount: 1,
      assetCount: 1,
      files: [{ relativePath: "conversation.md", mimeType: "text/markdown", content: "# hi" }]
    };

    expect(toNormalizedExportArtifact(current)).toEqual({
      title: "Demo Chat",
      rootFolder: "demo-chat",
      markdownPath: "conversation.md",
      files: [{ relativePath: "conversation.md", mimeType: "text/markdown", content: "# hi" }],
      summary: {
        messageCount: 1,
        assetCandidateCount: 2,
        documentImageCount: 2,
        messageImageCount: 1,
        assetCount: 1
      }
    });
  });

  it("exposes accepted export progress phases", () => {
    expect(EXPORT_PROGRESS_PHASES).toEqual([
      "detecting-provider",
      "extracting-content",
      "resolving-assets",
      "building-artifact",
      "saving-artifact"
    ]);
  });
});
