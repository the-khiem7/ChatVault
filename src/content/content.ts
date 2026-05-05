import type { PageSummary, RuntimeRequest, RuntimeResponse } from "../runtime/messages";
import type { ConversationDraft } from "../domain/conversation";
import { extractConversation } from "./extractors/extractConversation";
import { extractGeminiConversation } from "./extractors/extractGeminiConversation";
import { getPlatformFromHostname } from "../shared/constants";

const LISTENER_FLAG = "__chatCargoContentListener";

declare global {
  interface Window {
    [LISTENER_FLAG]?: boolean;
  }
}

function extractCurrentPageSummary(): PageSummary {
  const platform = getPlatformFromHostname(window.location.hostname);
  const defaultTitle = platform === "gemini" ? "Untitled Gemini Conversation" : "Untitled ChatGPT Conversation";
  return {
    title: document.title.trim() || defaultTitle,
    url: window.location.href
  };
}

function extractCurrentConversation(): ConversationDraft {
  const platform = getPlatformFromHostname(window.location.hostname);
  if (platform === "gemini") {
    return extractGeminiConversation(document, window.location);
  }
  return extractConversation(document, window.location);
}

if (!window[LISTENER_FLAG]) {
  window[LISTENER_FLAG] = true;

  chrome.runtime.onMessage.addListener(
    (
      request: RuntimeRequest,
      _sender,
      sendResponse: (response: RuntimeResponse<PageSummary | ConversationDraft>) => void
    ) => {
      if (request.type !== "EXTRACT_PAGE_SUMMARY") {
        if (request.type !== "EXTRACT_CONVERSATION") {
          return false;
        }

        sendResponse({
          ok: true,
          data: extractCurrentConversation(),
          warnings: []
        });
        return false;
      }

      sendResponse({
        ok: true,
        data: extractCurrentPageSummary(),
        warnings: []
      });
      return false;
    }
  );
}
