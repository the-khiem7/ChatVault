import type { AssetCandidate, ExportAsset } from "../domain/conversation";
import type { ExportWarning } from "../domain/warning";
import { getAssetExtension, getAssetLocalPath } from "./assetNamer";

export type AssetReference = {
  markdownPath: string;
};

export type ResolvedAssetPayload = {
  bytes: ArrayBuffer;
  mimeType?: string;
};

export type AssetResolverOptions = {
  fetchAsset?: (sourceUrl: string) => Promise<ResolvedAssetPayload>;
  onProgress?: (progress: AssetProgress) => void;
};

export type AssetProgress = {
  phase: "resolving-assets";
  completed: number;
  total: number;
  currentLabel: string;
};

export type AssetResolutionResult = {
  assets: ExportAsset[];
  assetReferences: Map<string, AssetReference>;
  assetFiles: ResolvedAssetFile[];
  warnings: ExportWarning[];
};

export type ResolvedAssetFile = {
  assetId: string;
  relativePath: string;
  mimeType: string;
  bytes: ArrayBuffer;
};

export async function resolveAssetCandidates(
  candidates: AssetCandidate[],
  options: AssetResolverOptions = {}
): Promise<AssetResolutionResult> {
  const sortedCandidates = [...candidates].sort((left, right) => left.domOrder - right.domOrder);
  const assets: ExportAsset[] = [];
  const assetFiles: ResolvedAssetFile[] = [];
  const assetReferences = new Map<string, AssetReference>();
  const warnings: ExportWarning[] = [];

  for (const [index, candidate] of sortedCandidates.entries()) {
    const resolved = await resolveCandidate(candidate, assets.length, options);
    assets.push(resolved.asset);

    if (resolved.reference) {
      assetReferences.set(candidate.id, resolved.reference);
    }
    if (resolved.file) {
      assetFiles.push(resolved.file);
    }
    if (resolved.warning) {
      warnings.push(resolved.warning);
    }
    options.onProgress?.({
      phase: "resolving-assets",
      completed: index + 1,
      total: sortedCandidates.length,
      currentLabel: candidate.id
    });
  }

  return { assets, assetReferences, assetFiles, warnings };
}

async function resolveCandidate(
  candidate: AssetCandidate,
  index: number,
  options: AssetResolverOptions
): Promise<{ asset: ExportAsset; reference?: AssetReference; file?: ResolvedAssetFile; warning?: ExportWarning }> {
  if (!candidate.messageId || !candidate.blockId || !isAllowedAssetSource(candidate.sourceUrl)) {
    return fallbackAsset(candidate, index, "Asset candidate did not pass export policy checks.");
  }

  try {
    const payload = candidate.sourceUrl.startsWith("data:")
      ? parseDataUrl(candidate.sourceUrl)
      : await options.fetchAsset?.(candidate.sourceUrl);

    if (!payload) {
      return fallbackAsset(candidate, index, "Asset could not be fetched by this browser context.");
    }

    const localPath = getAssetLocalPath(candidate, index, payload.mimeType);
    const extension = getAssetExtension(candidate, payload.mimeType);
    return {
      asset: {
        id: candidate.id,
        type: candidate.kind,
        sourceUrl: candidate.sourceUrl,
        localPath,
        mimeType: payload.mimeType,
        extension,
        byteLength: payload.bytes.byteLength,
        status: "saved",
        warningIds: []
      },
      reference: { markdownPath: localPath },
      file: {
        assetId: candidate.id,
        relativePath: localPath,
        mimeType: payload.mimeType ?? "application/octet-stream",
        bytes: payload.bytes
      }
    };
  } catch {
    return fallbackAsset(candidate, index, "Asset could not be saved locally and remains a remote link.");
  }
}

function fallbackAsset(
  candidate: AssetCandidate,
  index: number,
  message: string
): { asset: ExportAsset; warning: ExportWarning } {
  const warningId = `warning-${candidate.id}-remote-fallback`;
  return {
    asset: {
      id: candidate.id,
      type: candidate.kind,
      sourceUrl: candidate.sourceUrl,
      localPath: getAssetLocalPath(candidate, index),
      extension: getAssetExtension(candidate),
      status: "remote-fallback",
      warningIds: [warningId]
    },
    warning: {
      id: warningId,
      code: "REMOTE_ASSET_FALLBACK",
      severity: "warning",
      message,
      messageId: candidate.messageId || undefined,
      blockId: candidate.blockId || undefined,
      assetId: candidate.id
    }
  };
}

function isAllowedAssetSource(sourceUrl: string): boolean {
  if (sourceUrl.startsWith("data:image/")) {
    return true;
  }

  try {
    const url = new URL(sourceUrl);
    return url.protocol === "https:" || url.protocol === "blob:";
  } catch {
    return false;
  }
}

function parseDataUrl(sourceUrl: string): ResolvedAssetPayload {
  const match = sourceUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) {
    throw new Error("Unsupported data URL.");
  }

  const mimeType = match[1] || "application/octet-stream";
  const isBase64 = Boolean(match[2]);
  const payload = match[3] ?? "";
  const bytes = isBase64 ? base64ToBytes(payload) : textToBytes(decodeURIComponent(payload));
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  return { bytes: arrayBuffer, mimeType };
}

function base64ToBytes(value: string): Uint8Array {
  if (typeof atob === "function") {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  return Uint8Array.from(Buffer.from(value, "base64"));
}

function textToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
