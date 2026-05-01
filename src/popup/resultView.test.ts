import { describe, expect, it } from "vitest";
import type { FolderExportResult } from "../runtime/messages";
import { buildSuccessViewModel } from "./resultView";

describe("buildSuccessViewModel", () => {
  it("keeps primary result metrics concise and moves diagnostics to secondary text", () => {
    const result: FolderExportResult = {
      rootFolder: "my-export",
      markdownPath: "conversation.md",
      title: "My Export",
      messageCount: 104,
      assetCandidateCount: 69,
      documentImageCount: 80,
      messageImageCount: 69,
      assetCount: 69,
      files: []
    };

    expect(buildSuccessViewModel(result, 2)).toEqual({
      title: "Exported to my-export/",
      metrics: [
        { label: "messages", value: "104" },
        { label: "images", value: "69" },
        { label: "warnings", value: "2" }
      ],
      detail: "Page images: 80 | Message images: 69 | Image candidates: 69"
    });
  });
});
