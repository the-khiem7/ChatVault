import type { ConversationDraft } from "../domain/conversation";
import type { FolderExportFile } from "../export/folderExportBuilder";

export type ExportProgress =
  | "detecting-provider"
  | "extracting-content"
  | "resolving-assets"
  | "building-artifact"
  | "saving-artifact";

export type ProviderAvailabilityStatus = "available" | "unsupported-page" | "not-available";

export type ProviderStatus = {
  providerId: string;
  status: ProviderAvailabilityStatus;
  reason?: string;
};

export type NormalizedPageSummary = {
  title: string;
  url: string;
  providerId: string;
};

export type NormalizedConversationDraft = {
  page: NormalizedPageSummary;
  conversation: ConversationDraft;
  providerStatus: ProviderStatus;
};

export type NormalizedExportArtifact = {
  title: string;
  rootFolder: string;
  markdownPath: string;
  files: FolderExportFile[];
  summary: {
    messageCount: number;
    assetCandidateCount: number;
    documentImageCount: number;
    messageImageCount: number;
    assetCount: number;
  };
};

export type ProviderErrorCode = "UNSUPPORTED_PAGE" | "PROVIDER_NOT_AVAILABLE" | "EXTRACTION_FAILED";

export type RuntimeBrowserErrorCode =
  | "CONTENT_SCRIPT_UNAVAILABLE"
  | "SAVE_STRATEGY_UNAVAILABLE"
  | "DIRECTORY_WRITE_FAILED"
  | "ARCHIVE_DOWNLOAD_FAILED";

export type CoreExportErrorCode = "EXPORT_BUILD_FAILED" | "ASSET_FETCH_FAILED";

export type ExportFailureCode = ProviderErrorCode | RuntimeBrowserErrorCode | CoreExportErrorCode;
