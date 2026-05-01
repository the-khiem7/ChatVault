import { describe, expect, it, vi } from "vitest";
import type { FolderExportArtifact } from "../export/folderExportBuilder";
import { writeFolderExportArtifact } from "./folderWriter";

describe("writeFolderExportArtifact", () => {
  it("writes nested export files under the artifact root folder", async () => {
    const writes: Array<{ path: string; content: unknown }> = [];
    const selectedFolder = createDirectoryHandle("selected", writes);
    const artifact: FolderExportArtifact = {
      rootFolder: "my-chat",
      files: [
        { relativePath: "conversation.md", mimeType: "text/markdown", content: "# User\n\nHello" },
        { relativePath: "assets/001.png", mimeType: "image/png", content: [1, 2] }
      ],
      manifest: {
        rootFolder: "my-chat",
        markdownPath: "conversation.md",
        assetPaths: ["assets/001.png"]
      },
      warnings: []
    };

    await writeFolderExportArtifact(selectedFolder, artifact);

    expect(writes[0]).toEqual({ path: "selected/my-chat/conversation.md", content: "# User\n\nHello" });
    expect(writes[1]?.path).toBe("selected/my-chat/assets/001.png");
    expect(writes[1]?.content).toBeInstanceOf(Blob);
    expect((writes[1]?.content as Blob).size).toBe(2);
  });

  it("reports writing progress for asset files only", async () => {
    const writes: Array<{ path: string; content: unknown }> = [];
    const onProgress = vi.fn();
    const selectedFolder = createDirectoryHandle("selected", writes);
    const artifact: FolderExportArtifact = {
      rootFolder: "my-chat",
      files: [
        { relativePath: "conversation.md", mimeType: "text/markdown", content: "# User\n\nHello" },
        { relativePath: "assets/001.png", mimeType: "image/png", content: [1] },
        { relativePath: "assets/002.png", mimeType: "image/png", content: [2] }
      ],
      manifest: {
        rootFolder: "my-chat",
        markdownPath: "conversation.md",
        assetPaths: ["assets/001.png", "assets/002.png"]
      },
      warnings: []
    };

    await writeFolderExportArtifact(selectedFolder, artifact, { onProgress });

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      phase: "writing-assets",
      completed: 1,
      total: 2,
      currentLabel: "assets/001.png"
    });
    expect(onProgress).toHaveBeenNthCalledWith(2, {
      phase: "writing-assets",
      completed: 2,
      total: 2,
      currentLabel: "assets/002.png"
    });
  });
});

function createDirectoryHandle(name: string, writes: Array<{ path: string; content: unknown }>): any {
  const directory = {
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

  return directory;
}
