import { describe, expect, it } from "vitest";
import { extractPageSummary } from "./pageSummary";

describe("extractPageSummary", () => {
  it("returns the current document title and location URL", () => {
    document.title = "Project notes";

    const summary = extractPageSummary(document, new URL("https://chatgpt.com/c/abc"));

    expect(summary).toEqual({
      title: "Project notes",
      url: "https://chatgpt.com/c/abc"
    });
  });

  it("uses a stable fallback title when the document title is empty", () => {
    document.title = "   ";

    const summary = extractPageSummary(document, new URL("https://chat.openai.com/c/abc"));

    expect(summary.title).toBe("Untitled ChatGPT Conversation");
  });
});
