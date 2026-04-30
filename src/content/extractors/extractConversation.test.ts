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

  it("uses article turns as message boundaries and reads roles from nested ChatGPT role nodes", () => {
    const documentRef = buildDocument(`
      <html>
        <head><title>Nested Roles - ChatGPT</title></head>
        <body>
          <main>
            <article data-testid="conversation-turn-1">
              <div data-message-author-role="user">
                <p>User asks first</p>
                <button>Copy</button>
              </div>
            </article>
            <article data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">
                <p>Assistant answers first</p>
              </div>
            </article>
            <article data-testid="conversation-turn-3">
              <div data-message-author-role="user">
                <p>User asks second</p>
              </div>
            </article>
            <article data-testid="conversation-turn-4">
              <div data-message-author-role="assistant">
                <p>Assistant answers second</p>
              </div>
            </article>
          </main>
        </body>
      </html>
    `);

    const draft = extractConversation(documentRef, new URL("https://chatgpt.com/c/nested"));

    expect(draft.messages.map((message) => message.role)).toEqual([
      "user",
      "assistant",
      "user",
      "assistant"
    ]);
    expect(draft.messages.map((message) => message.blocks[0]?.text)).toEqual([
      "User asks first",
      "Assistant answers first",
      "User asks second",
      "Assistant answers second"
    ]);
  });

  it("merges adjacent same-role chunks into one conversation message", () => {
    const documentRef = buildDocument(`
      <html>
        <head><title>Split Assistant - ChatGPT</title></head>
        <body>
          <main>
            <article data-testid="conversation-turn-1">
              <div data-message-author-role="user">Question</div>
            </article>
            <article data-testid="conversation-turn-2">
              <div data-message-author-role="assistant">First assistant chunk</div>
            </article>
            <article data-testid="conversation-turn-3">
              <div data-message-author-role="assistant">Second assistant chunk</div>
            </article>
            <article data-testid="conversation-turn-4">
              <div data-message-author-role="user">Follow-up</div>
            </article>
          </main>
        </body>
      </html>
    `);

    const draft = extractConversation(documentRef, new URL("https://chatgpt.com/c/split"));

    expect(draft.messages.map((message) => message.role)).toEqual(["user", "assistant", "user"]);
    expect(draft.messages[1]?.blocks[0]?.text).toBe("First assistant chunk\n\nSecond assistant chunk");
    expect(draft.messages.map((message) => message.index)).toEqual([0, 1, 2]);
  });

  it("extracts preformatted code blocks separately from paragraph text", () => {
    const documentRef = buildDocument(`
      <html>
        <head><title>Code Blocks - ChatGPT</title></head>
        <body>
          <main>
            <article data-testid="conversation-turn-1">
              <div data-message-author-role="assistant">
                <p>Run this query:</p>
                <pre><code class="language-sql">SELECT *
FROM taxi_raw.table_2025
LIMIT 10;</code></pre>
                <p>Then inspect the rows.</p>
              </div>
            </article>
          </main>
        </body>
      </html>
    `);

    const draft = extractConversation(documentRef, new URL("https://chatgpt.com/c/code"));

    expect(draft.messages[0]?.blocks).toEqual([
      { id: "message-1-block-1", kind: "paragraph", text: "Run this query:" },
      {
        id: "message-1-block-2",
        kind: "code",
        language: "sql",
        text: "SELECT *\nFROM taxi_raw.table_2025\nLIMIT 10;"
      },
      { id: "message-1-block-3", kind: "paragraph", text: "Then inspect the rows." }
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
