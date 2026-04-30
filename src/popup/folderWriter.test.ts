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
        { relativePath: "assets/001.png", mimeType: "image/png", content: new Uint8Array([1, 2]).buffer }
      ],
      manifest: {
        rootFolder: "my-chat",
        markdownPath: "conversation.md",
        assetPaths: ["assets/001.png"]
      },
      warnings: []
    };

    await writeFolderExportArtifact(selectedFolder, artifact);

    expect(writes).toEqual([
      { path: "selected/my-chat/conversation.md", content: "# User\n\nHello" },
      { path: "selected/my-chat/assets/001.png", content: artifact.files[1]?.content }
    ]);
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
