import type { NormalizedExportArtifact } from "../../core/contracts";

type WritableFileHandle = {
  createWritable(): Promise<{
    write(content: string | Blob): Promise<void>;
    close(): Promise<void>;
  }>;
};

export type WritableDirectoryHandle = {
  name?: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<WritableDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<WritableFileHandle>;
};

export type BrowserApi = {
  browserId: string;
  selectedFolder?: WritableDirectoryHandle;
};

export type BrowserCapabilities = {
  canDirectWriteFolder: boolean;
  canDownloadArchive: boolean;
};

export type SaveContext = {
  browser: BrowserApi;
  capabilities: BrowserCapabilities;
  artifact: NormalizedExportArtifact;
  onProgress?: (progress: {
    phase: "writing-assets";
    completed: number;
    total: number;
    currentLabel: string;
  }) => void;
};

export type SaveResult = {
  mode: "directory-write" | "archive-download";
  outputPath?: string;
  fileCount: number;
};

export type SaveStrategy = {
  id: string;
  supports(capabilities: BrowserCapabilities): boolean;
  save(context: SaveContext): Promise<SaveResult>;
};
