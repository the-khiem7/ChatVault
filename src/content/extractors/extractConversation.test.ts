import { describe, expect, it } from "vitest";
import { extractConversation } from "./extractConversation";

function buildDocument(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("extractConversation", () => {
  it("extracts ordered user and assistant text messages from ChatGPT article nodes", () => {
    const documentRef = buildDocument(`
      <html>
        <head><title>Data Analysis - ChatGPT</title></head>
        <body>
          <main>
            <article data-testid="conversation-turn-1" data-message-author-role="user">
              <div>Hello assistant</div>
            </article>
            <article data-testid="conversation-turn-2" data-message-author-role="assistant">
              <div>Hi user</div>
            </article>
          </main>
        </body>
      </html>
    `);

    const draft = extractConversation(documentRef, new URL("https://chatgpt.com/c/abc"));

    expect(draft.title).toBe("Data Analysis - ChatGPT");
    expect(draft.sourceUrl).toBe("https://chatgpt.com/c/abc");
    expect(draft.assetCandidates).toEqual([]);
    expect(draft.messages).toEqual([
      {
        id: "message-1",
        index: 0,
        role: "user",
        confidence: "high",
        warnings: [],
        blocks: [{ id: "message-1-block-1", kind: "paragraph", text: "Hello assistant" }]
      },
      {
        id: "message-2",
        index: 1,
        role: "assistant",
        confidence: "high",
        warnings: [],
        blocks: [{ id: "message-2-block-1", kind: "paragraph", text: "Hi user" }]
      }
    ]);
  });

  it("emits a warning when no message containers are found", () => {
    const draft = extractConversation(buildDocument("<main>No chat here</main>"), new URL("https://chatgpt.com/"));

    expect(draft.messages).toEqual([]);
    expect(draft.warnings).toEqual([
      {
        id: "warning-no-conversation-found",
        code: "NO_CONVERSATION_FOUND",
        severity: "error",
        message: "Could not detect any ChatGPT conversation messages on this page."
      }
    ]);
  });
});
