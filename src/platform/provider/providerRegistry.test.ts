import { describe, expect, it, vi } from "vitest";

import { createProviderRegistry } from "./providerRegistry";

describe("createProviderRegistry", () => {
  it("resolves chatgpt urls", () => {
    const registry = createProviderRegistry(vi.fn(), 1);
    expect(registry.resolve("https://chatgpt.com/c/abc")?.id).toBe("chatgpt");
  });

  it("resolves gemini urls", () => {
    const registry = createProviderRegistry(vi.fn(), 1);
    expect(registry.resolve("https://gemini.google.com/app/abc")?.id).toBe("gemini");
  });

  it("returns null for unsupported urls", () => {
    const registry = createProviderRegistry(vi.fn(), 1);
    expect(registry.resolve("https://example.com/chat")).toBeNull();
  });
});
