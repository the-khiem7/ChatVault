import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

import { extractGeminiConversation } from "./extractGeminiConversation";

describe("extractGeminiConversation", () => {
  it("extracts Gemini user and model turns from provider-specific containers", () => {
    const dom = new JSDOM(`
      <html>
        <head><title>Gemini Thread</title></head>
        <body>
          <main>
            <div class="user-query-container">
              <div class="query-text">How do I build this?</div>
            </div>
            <div class="model-response-container">
              <div class="response-text">Use this snippet:</div>
              <pre><code class="language-ts">console.log('hi')</code></pre>
            </div>
          </main>
        </body>
      </html>
    `);

    const draft = extractGeminiConversation(dom.window.document, new URL("https://gemini.google.com/app/abc"));

    expect(draft.title).toBe("Gemini Thread");
    expect(draft.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(draft.messages[0]?.blocks).toEqual([
      {
        id: "message-1-block-1",
        kind: "paragraph",
        text: "How do I build this?"
      }
    ]);
    expect(draft.messages[1]?.blocks).toEqual([
      {
        id: "message-2-block-1",
        kind: "paragraph",
        text: "Use this snippet:"
      },
      {
        id: "message-2-block-2",
        kind: "code",
        text: "console.log('hi')",
        language: "ts"
      }
    ]);
  });

  it("emits Gemini-specific warning when no Gemini turns are found", () => {
    const dom = new JSDOM(`<html><body><main>No Gemini chat here</main></body></html>`);

    const draft = extractGeminiConversation(dom.window.document, new URL("https://gemini.google.com/app/empty"));

    expect(draft.messages).toEqual([]);
    expect(draft.warnings).toEqual([
      {
        id: "warning-no-conversation-found",
        code: "NO_CONVERSATION_FOUND",
        severity: "error",
        message: "Could not detect any Gemini conversation messages on this page."
      }
    ]);
  });
});
