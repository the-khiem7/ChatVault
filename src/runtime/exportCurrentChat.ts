import type { ConversationDraft } from "../domain/conversation";
import { resolveAssetCandidates } from "../assets/assetResolver";
import { buildFolderExportArtifact } from "../export/folderExportBuilder";
import type { ChromeApi } from "./chromeApi";
import type { ExportProgressMessage, FolderExportResult, RuntimeResponse } from "./messages";
import { isSupportedChatGptUrl } from "./urlSupport";

export type ExportProgress = Omit<ExportProgressMessage, "type" | "requestId">;

export async function exportCurrentChat(
  chromeApi: ChromeApi,
  onProgress?: (progress: ExportProgress) => void
): Promise<RuntimeResponse<FolderExportResult>> {
  const tab = await chromeApi.getActiveTab();

  if (!tab?.id || !isSupportedChatGptUrl(tab.url)) {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_PAGE",
        message: "Open a supported ChatGPT conversation page before exporting."
      },
      warnings: []
    };
  }

  try {
    const draftResponse = await sendExtractionRequest(chromeApi, tab.id);

    if (!draftResponse.ok) {
      return draftResponse;
    }

    const draft = draftResponse.data;
    if (draft.messages.length === 0) {
      return {
        ok: false,
        error: {
          code: "NO_CONVERSATION_FOUND",
          message: "Could not detect any ChatGPT conversation messages on this page."
        },
        warnings: draft.warnings
      };
    }

    const assetResolution = await resolveAssetCandidates(draft.assetCandidates, {
      fetchAsset: chromeApi.fetchAsset,
      onProgress
    });
    const artifact = buildFolderExportArtifact(draft, {
      assetReferences: assetResolution.assetReferences,
      assetFiles: assetResolution.assetFiles,
      warnings: [...(draftResponse.warnings ?? []), ...draft.warnings, ...assetResolution.warnings]
    });

    return {
      ok: true,
      data: {
        rootFolder: artifact.rootFolder,
        markdownPath: artifact.manifest.markdownPath,
        title: draft.title,
        messageCount: draft.messages.length,
        assetCandidateCount: draft.assetCandidates.length,
        documentImageCount: draft.diagnostics?.documentImageCount ?? 0,
        messageImageCount: draft.diagnostics?.messageImageCount ?? 0,
        assetCount: assetResolution.assets.filter((asset) => asset.status === "saved").length,
        files: artifact.files
      },
      warnings: artifact.warnings
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Could not export the current ChatGPT conversation."
      },
      warnings: []
    };
  }
}

async function sendExtractionRequest(
  chromeApi: ChromeApi,
  tabId: number
): Promise<RuntimeResponse<ConversationDraft>> {
  const request = { type: "EXTRACT_CONVERSATION" } as const;

  try {
    return await chromeApi.sendMessageToTab<ConversationDraft>(tabId, request);
  } catch (error) {
    if (!chromeApi.injectContentScript) {
      throw error;
    }

    await chromeApi.injectContentScript(tabId);
    return chromeApi.sendMessageToTab<ConversationDraft>(tabId, request);
  }
}
