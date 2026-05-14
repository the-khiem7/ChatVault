import type { AssetReference, ResolvedAssetFile } from "../assets/assetResolver";
import type { ExportWarning } from "../domain/warning";
import type { FolderExportBuildInput } from "../export/folderExportBuilder";
import { buildFolderExportArtifact } from "../export/folderExportBuilder";
import type { NormalizedConversationDraft, NormalizedExportArtifact } from "./contracts";

export type BuildNormalizedExportArtifactInput = {
  assetReferences: Map<string, AssetReference>;
  assetFiles: ResolvedAssetFile[];
  warnings: ExportWarning[];
};

export function buildNormalizedExportArtifact(
  draft: NormalizedConversationDraft,
  input: BuildNormalizedExportArtifactInput
): NormalizedExportArtifact {
  const artifact = buildFolderExportArtifact(draft.conversation, toLegacyBuildInput(input));

  return {
    title: draft.conversation.title,
    rootFolder: artifact.rootFolder,
    markdownPath: artifact.manifest.markdownPath,
    files: artifact.files,
    summary: {
      messageCount: draft.conversation.messages.length,
      assetCandidateCount: draft.conversation.assetCandidates.length,
      documentImageCount: draft.conversation.diagnostics?.documentImageCount ?? 0,
      messageImageCount: draft.conversation.diagnostics?.messageImageCount ?? 0,
      assetCount: input.assetFiles.length
    }
  };
}

function toLegacyBuildInput(input: BuildNormalizedExportArtifactInput): FolderExportBuildInput {
  return {
    assetReferences: input.assetReferences,
    assetFiles: input.assetFiles,
    warnings: input.warnings
  };
}
