import { describe, expect, it } from "vitest";
import type { AssetCandidate } from "../domain/conversation";
import { getAssetLocalPath } from "./assetNamer";

describe("getAssetLocalPath", () => {
  it("assigns stable zero-padded image names from candidate order and MIME type", () => {
    const candidate: AssetCandidate = {
      id: "asset-1",
      messageId: "message-1",
      blockId: "message-1-block-2",
      kind: "image",
      sourceUrl: "data:image/png;base64,aGVsbG8=",
      domOrder: 0,
      confidence: "high"
    };

    expect(getAssetLocalPath(candidate, 0, "image/png")).toBe("assets/001.png");
  });
});
