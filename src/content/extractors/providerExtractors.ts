import type { ConversationDraft } from "../../domain/conversation";
import { extractConversation as extractChatGptConversation } from "./extractConversation";
import { extractGeminiConversation } from "./extractGeminiConversation";

const SUPPORTED_GEMINI_HOSTS = new Set(["gemini.google.com"]);

type ProviderExtractorMap = {
  chatgpt?: (documentRef: Document, locationRef: Location | URL) => ConversationDraft;
  gemini?: (documentRef: Document, locationRef: Location | URL) => ConversationDraft;
};

export function extractConversationByProvider(
  documentRef: Document,
  locationRef: Location | URL,
  extractors: ProviderExtractorMap = {}
): ConversationDraft {
  const chatgptExtractor = extractors.chatgpt ?? extractChatGptConversation;
  const geminiExtractor = extractors.gemini ?? extractGeminiConversation;

  if (isSupportedGeminiUrl(locationRef.href)) {
    return geminiExtractor(documentRef, locationRef);
  }

  return chatgptExtractor(documentRef, locationRef);
}

function isSupportedGeminiUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && SUPPORTED_GEMINI_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}
