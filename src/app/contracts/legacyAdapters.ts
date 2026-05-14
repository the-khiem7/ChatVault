import type { ConversationDraft } from "../../domain/conversation";
import type { FolderExportResult } from "../../runtime/messages";
import type { NormalizedConversationDraft, NormalizedExportArtifact, ProviderStatus } from "../../core/contracts";

export const EXPORT_PROGRESS_PHASES = [
  "detecting-provider",
  "extracting-content",
  "resolving-assets",
  "building-artifact",
  "saving-artifact"
] as const;

function inferProviderIdFromUrl(url: string): string {
  if (url.includes("gemini.google.com")) {
    return "gemini";
  }

  return "chatgpt";
}

function buildProviderStatus(providerId: string): ProviderStatus {
  return {
    providerId,
    status: "available"
  };
}

export function toNormalizedConversationDraft(current: ConversationDraft): NormalizedConversationDraft {
  const providerId = inferProviderIdFromUrl(current.sourceUrl);

  return {
    page: {
      title: current.title,
      url: current.sourceUrl,
      providerId
    },
    conversation: current,
    providerStatus: buildProviderStatus(providerId)
  };
}

export function toNormalizedExportArtifact(current: FolderExportResult): NormalizedExportArtifact {
  return {
    title: current.title,
    rootFolder: current.rootFolder,
    markdownPath: current.markdownPath,
    files: current.files,
    summary: {
      messageCount: current.messageCount,
      assetCandidateCount: current.assetCandidateCount,
      documentImageCount: current.documentImageCount,
      messageImageCount: current.messageImageCount,
      assetCount: current.assetCount
    }
  };
}
