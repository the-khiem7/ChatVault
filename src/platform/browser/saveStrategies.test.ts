import { describe, expect, it, vi } from "vitest";

import type { NormalizedExportArtifact } from "../../core/contracts";
import { resolveSaveStrategy, saveArtifact } from "./saveStrategies";

describe("saveStrategies", () => {
  it("resolves direct folder strategy from capabilities", () => {
    const strategy = resolveSaveStrategy({
      browserId: "chrome"
    }, {
      canDirectWriteFolder: true,
      canDownloadArchive: false
    });

    expect(strategy?.id).toBe("chrome-direct-folder");
  });

  it("returns unavailable when no save strategy matches", async () => {
    const artifact = createArtifact();

    await expect(
      saveArtifact({
        browser: { browserId: "unknown" },
        capabilities: {
          canDirectWriteFolder: false,
          canDownloadArchive: false
        },
        artifact
      })
    ).rejects.toThrow("SAVE_STRATEGY_UNAVAILABLE");
  });

  it("writes files through direct folder strategy", async () => {
    const writes: Array<{ path: string; content: unknown }> = [];
    const selectedFolder = createDirectoryHandle("selected", writes);
    const onProgress = vi.fn();
    const artifact = createArtifact();

    const result = await saveArtifact({
      browser: {
        browserId: "chrome",
        selectedFolder
      },
      capabilities: {
        canDirectWriteFolder: true,
        canDownloadArchive: false
      },
      artifact,
      onProgress
    });

    expect(result).toEqual({
      mode: "directory-write",
      outputPath: "demo-chat/conversation.md",
      fileCount: 2
    });
    expect(writes[0]?.path).toBe("selected/demo-chat/conversation.md");
    expect(writes[1]?.path).toBe("selected/demo-chat/assets/001.png");
    expect(onProgress).toHaveBeenCalledWith({
      phase: "writing-assets",
      completed: 1,
      total: 1,
      currentLabel: "assets/001.png"
    });
  });
});

function createArtifact(): NormalizedExportArtifact {
  return {
    title: "Demo Chat",
    rootFolder: "demo-chat",
    markdownPath: "conversation.md",
    files: [
      { relativePath: "conversation.md", mimeType: "text/markdown", content: "# Demo" },
      { relativePath: "assets/001.png", mimeType: "image/png", content: [1, 2, 3] }
    ],
    summary: {
      messageCount: 1,
      assetCandidateCount: 1,
      documentImageCount: 1,
      messageImageCount: 1,
      assetCount: 1
    }
  };
}

function createDirectoryHandle(name: string, writes: Array<{ path: string; content: unknown }>): any {
  return {
    name,
    getDirectoryHandle: vi.fn(async (childName: string) => createDirectoryHandle(`${name}/${childName}`, writes)),
    getFileHandle: vi.fn(async (fileName: string) => ({
      createWritable: vi.fn(async () => ({
        write: vi.fn(async (content: unknown) => {
          writes.push({ path: `${name}/${fileName}`, content });
        }),
        close: vi.fn(async () => undefined)
      }))
    }))
  };
}
