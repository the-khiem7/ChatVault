import { describe, expect, it } from "vitest";

import { extractConversationByProvider } from "./providerExtractors";
import type { ConversationDraft } from "../../domain/conversation";

function buildDraft(title: string): ConversationDraft {
  return {
    title,
    sourceUrl: "https://example.com",
    extractedAt: "2026-05-15T00:00:00.000Z",
    messages: [],
    assetCandidates: [],
    warnings: []
  };
}

describe("extractConversationByProvider", () => {
  it("uses chatgpt extractor for chatgpt urls", () => {
    const result = extractConversationByProvider(
      document,
      new URL("https://chatgpt.com/c/abc"),
      {
        chatgpt: () => buildDraft("ChatGPT Draft"),
        gemini: () => buildDraft("Gemini Draft")
      }
    );

    expect(result.title).toBe("ChatGPT Draft");
  });

  it("uses gemini extractor for gemini urls", () => {
    const result = extractConversationByProvider(
      document,
      new URL("https://gemini.google.com/app/abc"),
      {
        chatgpt: () => buildDraft("ChatGPT Draft"),
        gemini: () => buildDraft("Gemini Draft")
      }
    );

    expect(result.title).toBe("Gemini Draft");
  });
});
