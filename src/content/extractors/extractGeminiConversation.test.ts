import { describe, expect, it } from "vitest";
import { extractGeminiConversation } from "./extractGeminiConversation";

describe("extractGeminiConversation", () => {
  it("returns a ConversationDraft with Gemini platform source", () => {
    const doc = createFakeGeminiDocument();
    const result = extractGeminiConversation(doc.document, new URL("https://gemini.google.com/chat/abc123"));

    expect(result.source).toBe("gemini");
    expect(result.title).toBe("Gemini Test Conversation");
    expect(result.sourceUrl).toBe("https://gemini.google.com/chat/abc123");
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("detects user and assistant messages", () => {
    const doc = createFakeGeminiDocument();
    const result = extractGeminiConversation(doc.document, new URL("https://gemini.google.com/chat/abc123"));

    const roles = result.messages.map((m) => m.role);
    expect(roles).toContain("user");
    expect(roles).toContain("assistant");
  });

  it("includes warnings when no messages are found", () => {
    const doc = createEmptyGeminiDocument();
    const result = extractGeminiConversation(doc.document, new URL("https://gemini.google.com/chat/empty"));

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].code).toBe("NO_CONVERSATION_FOUND");
  });
});

function createFakeGeminiDocument(): { document: Document; window: Window } {
  const html = `
    <html>
      <head><title>Gemini Test Conversation</title></head>
      <body>
        <div data-message-id="msg-1" data-role="user">
          <div>What is TypeScript?</div>
        </div>
        <div data-message-id="msg-2" data-role="assistant">
          <div>TypeScript is a programming language...</div>
        </div>
      </body>
    </html>
  `;
  return createDOM(html);
}

function createEmptyGeminiDocument(): { document: Document; window: Window } {
  const html = `
    <html>
      <head><title></title></head>
      <body>
        <div>No messages here</div>
      </body>
    </html>
  `;
  return createDOM(html);
}

function createDOM(html: string): { document: Document; window: Window } {
  const dom = new (require("jsdom").JSDOM)(html);
  return {
    document: dom.window.document,
    window: dom.window as unknown as Window
  };
}
