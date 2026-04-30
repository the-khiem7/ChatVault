import { describe, expect, it } from "vitest";
import { formatExportError } from "./exportError";

describe("formatExportError", () => {
  it("includes the original error message when folder export fails", () => {
    expect(formatExportError(new Error("The request is not allowed by the user agent."))).toBe(
      "Folder export failed: The request is not allowed by the user agent."
    );
  });

  it("falls back to a retry message for unknown errors", () => {
    expect(formatExportError("failed")).toBe("Folder export failed. Choose the folder again and retry.");
  });
});
