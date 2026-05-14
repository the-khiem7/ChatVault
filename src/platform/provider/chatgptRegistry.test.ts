import { describe, expect, it, vi } from "vitest";

import { createChatGptProviderRegistry } from "./chatgptRegistry";

describe("createChatGptProviderRegistry", () => {
  it("resolves chatgpt urls to the chatgpt provider", () => {
    const registry = createChatGptProviderRegistry(vi.fn());

    const provider = registry.resolve("https://chatgpt.com/c/abc");

    expect(provider?.id).toBe("chatgpt");
  });

  it("returns null for unsupported urls", () => {
    const registry = createChatGptProviderRegistry(vi.fn());

    expect(registry.resolve("https://example.com/chat")).toBeNull();
  });
});
