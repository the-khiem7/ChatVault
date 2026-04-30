import { describe, expect, it, vi } from "vitest";
import type { AssetCandidate } from "../domain/conversation";
import { resolveAssetCandidates } from "./assetResolver";

function imageCandidate(overrides: Partial<AssetCandidate> = {}): AssetCandidate {
  return {
    id: "asset-1",
    messageId: "message-1",
    blockId: "message-1-block-2",
    kind: "image",
    sourceUrl: "data:image/png;base64,aGVsbG8=",
    domOrder: 0,
    confidence: "high",
    ...overrides
  };
}

describe("resolveAssetCandidates", () => {
  it("converts data URL image candidates into saved local assets", async () => {
    const result = await resolveAssetCandidates([imageCandidate()]);

    expect(result.assets).toEqual([
      {
        id: "asset-1",
        type: "image",
        sourceUrl: "data:image/png;base64,aGVsbG8=",
        localPath: "assets/001.png",
        mimeType: "image/png",
        extension: "png",
        byteLength: 5,
        status: "saved",
        warningIds: []
      }
    ]);
    expect(result.assetReferences.get("asset-1")).toEqual({ markdownPath: "assets/001.png" });
    expect(result.warnings).toEqual([]);
  });

  it("rejects candidates without message and block ownership", async () => {
    const result = await resolveAssetCandidates([
      imageCandidate({ messageId: "", sourceUrl: "https://chatgpt.com/image.png" })
    ]);

    expect(result.assets[0]?.status).toBe("remote-fallback");
    expect(result.warnings[0]).toMatchObject({
      code: "REMOTE_ASSET_FALLBACK",
      severity: "warning",
      assetId: "asset-1"
    });
  });

  it("uses controlled fetch for HTTPS candidates and falls back on fetch failure", async () => {
    const fetchAsset = vi.fn().mockRejectedValue(new Error("blocked"));
    const result = await resolveAssetCandidates(
      [imageCandidate({ sourceUrl: "https://chatgpt.com/backend-api/files/image-1.png" })],
      { fetchAsset }
    );

    expect(fetchAsset).toHaveBeenCalledWith("https://chatgpt.com/backend-api/files/image-1.png");
    expect(result.assetReferences.has("asset-1")).toBe(false);
    expect(result.assets[0]?.status).toBe("remote-fallback");
    expect(result.warnings[0]?.code).toBe("REMOTE_ASSET_FALLBACK");
  });
});
