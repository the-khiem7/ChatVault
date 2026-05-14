import type { NormalizedConversationDraft } from "../../core/contracts";

export type ProviderId = "chatgpt" | "gemini";

export type ProviderExtractor = {
  extract(): Promise<NormalizedConversationDraft>;
};

export type ProviderDefinition = {
  id: ProviderId;
  supports(url: string): boolean;
  createExtractor(): ProviderExtractor;
};

export type ProviderRegistry = {
  list(): ProviderDefinition[];
  resolve(url: string): ProviderDefinition | null;
};
