import type { ConversationDraft } from "../../domain/conversation";
import type { RuntimeResponse } from "../../runtime/messages";
import { isSupportedChatGptUrl, isSupportedGeminiUrl } from "../../runtime/urlSupport";
import type { ChromeApi } from "../../runtime/chromeApi";
import type { ProviderDefinition, ProviderExtractor, ProviderId, ProviderRegistry } from "./contracts";

type ExtractConversation = (tabId: number) => Promise<RuntimeResponse<ConversationDraft>>;

class GenericProviderExtractor implements ProviderExtractor {
  constructor(
    private readonly providerId: ProviderId,
    private readonly extractConversation: ExtractConversation,
    private readonly tabId: number
  ) {}

  async extract() {
    const response = await this.extractConversation(this.tabId);
    if (!response.ok) {
      throw new Error(response.error.message);
    }

    return {
      page: {
        title: response.data.title,
        url: response.data.sourceUrl,
        providerId: this.providerId
      },
      conversation: response.data,
      providerStatus: {
        providerId: this.providerId,
        status: "available" as const
      }
    };
  }
}

function createProviderDefinition(
  id: ProviderId,
  supportsUrl: (url: string) => boolean,
  extractConversation: ExtractConversation,
  tabId: number
): ProviderDefinition {
  return {
    id,
    supports(url: string) {
      return supportsUrl(url);
    },
    createExtractor(): ProviderExtractor {
      return new GenericProviderExtractor(id, extractConversation, tabId);
    }
  };
}

export function createProviderRegistry(extractConversation: ExtractConversation, tabId = 0): ProviderRegistry {
  const providers: ProviderDefinition[] = [
    createProviderDefinition("chatgpt", isSupportedChatGptUrl, extractConversation, tabId),
    createProviderDefinition("gemini", isSupportedGeminiUrl, extractConversation, tabId)
  ];

  return {
    list() {
      return providers;
    },
    resolve(url: string) {
      return providers.find((provider) => provider.supports(url)) ?? null;
    }
  };
}

export function createProviderExtractConversation(chromeApi: ChromeApi): ExtractConversation {
  return async (tabId: number) => {
    const request = { type: "EXTRACT_CONVERSATION" } as const;

    try {
      return await chromeApi.sendMessageToTab<ConversationDraft>(tabId, request);
    } catch (error) {
      if (!chromeApi.injectContentScript) {
        throw error;
      }

      await chromeApi.injectContentScript(tabId);
      return chromeApi.sendMessageToTab<ConversationDraft>(tabId, request);
    }
  };
}
