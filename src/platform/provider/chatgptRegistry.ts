import type { ConversationDraft } from "../../domain/conversation";
import type { RuntimeResponse } from "../../runtime/messages";
import { isSupportedChatGptUrl } from "../../runtime/urlSupport";
import type { ChromeApi } from "../../runtime/chromeApi";
import type { ProviderDefinition, ProviderExtractor, ProviderRegistry } from "./contracts";

type ExtractConversation = (tabId: number) => Promise<RuntimeResponse<ConversationDraft>>;

class ChatGptProviderExtractor implements ProviderExtractor {
  constructor(private readonly extractConversation: ExtractConversation, private readonly tabId: number) {}

  async extract() {
    const response = await this.extractConversation(this.tabId);
    if (!response.ok) {
      throw new Error(response.error.message);
    }

    return {
      page: {
        title: response.data.title,
        url: response.data.sourceUrl,
        providerId: "chatgpt"
      },
      conversation: response.data,
      providerStatus: {
        providerId: "chatgpt",
        status: "available" as const
      }
    };
  }
}

export function createChatGptProviderRegistry(extractConversation: ExtractConversation, tabId = 0): ProviderRegistry {
  const provider: ProviderDefinition = {
    id: "chatgpt",
    supports(url: string) {
      return isSupportedChatGptUrl(url);
    },
    createExtractor(): ProviderExtractor {
      return new ChatGptProviderExtractor(extractConversation, tabId);
    }
  };

  return {
    list() {
      return [provider];
    },
    resolve(url: string) {
      return provider.supports(url) ? provider : null;
    }
  };
}

export function createChatGptExtractConversation(chromeApi: ChromeApi): ExtractConversation {
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
