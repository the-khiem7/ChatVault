import { describe, expect, it } from "vitest";
import type { ConversationDraft } from "../domain/conversation";
import { writeMarkdown } from "./markdownWriter";

describe("writeMarkdown", () => {
  it("writes frontmatter and ordered H1 role sections", () => {
    const draft: ConversationDraft = {
      title: "Data Analysis - ChatGPT",
      sourceUrl: "https://chatgpt.com/c/abc",
      extractedAt: "2026-04-30T13:00:00.000Z",
      assetCandidates: [],
      warnings: [],
      messages: [
        {
            id: "message-1",
            index: 0,
            role: "user",
            confidence: "high",
            warnings: [],
            blocks: [{ id: "message-1-block-1", kind: "paragraph", text: "# User supplied heading" }]
        },
        {
          id: "message-2",
          index: 1,
          role: "assistant",
          confidence: "high",
          warnings: [],
          blocks: [{ id: "message-2-block-1", kind: "paragraph", text: "Hi user" }]
        }
      ]
    };

    expect(writeMarkdown(draft)).toBe(`---
title: "Data Analysis - ChatGPT"
source: "chatgpt"
sourceUrl: "https://chatgpt.com/c/abc"
exportedAt: "2026-04-30T13:00:00.000Z"
---

## Data Analysis - ChatGPT

# User

## User supplied heading

# Assistant

Hi user
`);
  });
});
