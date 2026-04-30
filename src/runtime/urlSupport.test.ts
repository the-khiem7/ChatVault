import { describe, expect, it } from "vitest";
import { isSupportedChatGptUrl } from "./urlSupport";

describe("isSupportedChatGptUrl", () => {
  it("accepts supported ChatGPT hosts", () => {
    expect(isSupportedChatGptUrl("https://chatgpt.com/c/123")).toBe(true);
    expect(isSupportedChatGptUrl("https://chat.openai.com/c/123")).toBe(true);
  });

  it("rejects unsupported or invalid URLs", () => {
    expect(isSupportedChatGptUrl("https://example.com/c/123")).toBe(false);
    expect(isSupportedChatGptUrl("chrome://extensions")).toBe(false);
    expect(isSupportedChatGptUrl(undefined)).toBe(false);
  });
});
