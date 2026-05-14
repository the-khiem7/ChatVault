import type { NormalizedExportArtifact } from "../../core/contracts";

export type BrowserApi = {
  browserId: string;
};

export type BrowserCapabilities = {
  canDirectWriteFolder: boolean;
  canDownloadArchive: boolean;
};

export type SaveContext = {
  browser: BrowserApi;
  capabilities: BrowserCapabilities;
  artifact: NormalizedExportArtifact;
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
