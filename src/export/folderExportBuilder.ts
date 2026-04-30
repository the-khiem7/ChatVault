import type { AssetReference, ResolvedAssetFile } from "../assets/assetResolver";
import type { ExportWarning } from "../domain/warning";
import type { ConversationDraft } from "../domain/conversation";
import { writeMarkdown } from "./markdownWriter";
import { slugify } from "./slugify";

export type FolderExportFile = {
  relativePath: string;
  mimeType: string;
  content: string | ArrayBuffer;
};

export type FolderExportManifest = {
  rootFolder: string;
  markdownPath: string;
  assetPaths: string[];
};

export type FolderExportArtifact = {
  rootFolder: string;
  files: FolderExportFile[];
  manifest: FolderExportManifest;
  warnings: ExportWarning[];
};

export type FolderExportBuildInput = {
  assetReferences: Map<string, AssetReference>;
  assetFiles: ResolvedAssetFile[];
  warnings: ExportWarning[];
};

export function buildFolderExportArtifact(
  draft: ConversationDraft,
  input: FolderExportBuildInput
): FolderExportArtifact {
  const rootFolder = slugify(draft.title);
  const markdown = writeMarkdown(draft, { assetReferences: input.assetReferences });
  const markdownPath = "conversation.md";
  const assetFiles = input.assetFiles.map((file) => ({
    relativePath: file.relativePath,
    mimeType: file.mimeType,
    content: file.bytes
  }));

  return {
    rootFolder,
    files: [
      {
        relativePath: markdownPath,
        mimeType: "text/markdown",
        content: markdown
      },
      ...assetFiles
    ],
    manifest: {
      rootFolder,
      markdownPath,
      assetPaths: assetFiles.map((file) => file.relativePath)
    },
    warnings: input.warnings
  };
}
