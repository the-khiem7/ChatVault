import type { AssetCandidate } from "../domain/conversation";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg"
};

export function getAssetLocalPath(candidate: AssetCandidate, index: number, mimeType?: string): string {
  const extension = getAssetExtension(candidate, mimeType);
  return `assets/${String(index + 1).padStart(3, "0")}.${extension}`;
}

export function getAssetExtension(candidate: AssetCandidate, mimeType?: string): string {
  if (mimeType && MIME_EXTENSIONS[mimeType]) {
    return MIME_EXTENSIONS[mimeType];
  }

  try {
    const pathname = new URL(candidate.sourceUrl).pathname;
    const match = pathname.match(/\.([a-z0-9]{2,5})$/i);
    if (match?.[1]) {
      return match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    }
  } catch {
    // data URLs and malformed URLs fall through to kind-based defaults.
  }

  return candidate.kind === "image" ? "png" : "bin";
}
