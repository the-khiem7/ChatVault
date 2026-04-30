import type { FolderExportArtifact, FolderExportFile } from "../export/folderExportBuilder";

type WritableFileHandle = {
  createWritable(): Promise<{
    write(content: string | ArrayBuffer): Promise<void>;
    close(): Promise<void>;
  }>;
};

type WritableDirectoryHandle = {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<WritableDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<WritableFileHandle>;
};

export async function writeFolderExportArtifact(
  selectedFolder: WritableDirectoryHandle,
  artifact: FolderExportArtifact
): Promise<void> {
  const rootFolder = await selectedFolder.getDirectoryHandle(artifact.rootFolder, { create: true });

  for (const file of artifact.files) {
    await writeExportFile(rootFolder, file);
  }
}

async function writeExportFile(rootFolder: WritableDirectoryHandle, file: FolderExportFile): Promise<void> {
  const pathParts = file.relativePath.split("/").filter(Boolean);
  const fileName = pathParts.pop();
  if (!fileName) {
    throw new Error("Export file path is empty.");
  }

  let directory = rootFolder;
  for (const directoryName of pathParts) {
    directory = await directory.getDirectoryHandle(directoryName, { create: true });
  }

  const fileHandle = await directory.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file.content);
  await writable.close();
}
