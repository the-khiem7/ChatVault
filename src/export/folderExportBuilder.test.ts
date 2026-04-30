import { describe, expect, it } from "vitest";
import type { ConversationDraft } from "../domain/conversation";
import type { ResolvedAssetFile } from "../assets/assetResolver";
import { buildFolderExportArtifact } from "./folderExportBuilder";

describe("buildFolderExportArtifact", () => {
  it("builds a folder artifact with conversation markdown and resolved asset files", () => {
    const draft: ConversationDraft = {
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
    };
    const bytes = new Uint8Array([1, 2, 3]).buffer;
    const assetFiles: ResolvedAssetFile[] = [
      {
        assetId: "asset-1",
        relativePath: "assets/001.png",
        mimeType: "image/png",
        bytes
      }
    ];

    const artifact = buildFolderExportArtifact(draft, {
      assetReferences: new Map([["asset-1", { markdownPath: "assets/001.png" }]]),
      assetFiles,
      warnings: []
    });

    expect(artifact.rootFolder).toBe("image-export-chatgpt");
    expect(artifact.files).toEqual([
      {
        relativePath: "conversation.md",
        mimeType: "text/markdown",
        content: expect.stringContaining("![Diagram](assets/001.png)")
      },
      {
        relativePath: "assets/001.png",
        mimeType: "image/png",
        content: bytes
      }
    ]);
    expect(artifact.manifest).toEqual({
      rootFolder: "image-export-chatgpt",
      markdownPath: "conversation.md",
      assetPaths: ["assets/001.png"]
    });
  });
});
