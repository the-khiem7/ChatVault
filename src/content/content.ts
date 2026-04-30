import type { PageSummary, RuntimeRequest, RuntimeResponse } from "../runtime/messages";
import type { ConversationDraft } from "../domain/conversation";
import { extractConversation } from "./extractors/extractConversation";

const FALLBACK_CONVERSATION_TITLE = "Untitled ChatGPT Conversation";
const LISTENER_FLAG = "__chatGptMarkdownExporterContentListener";

declare global {
  interface Window {
    [LISTENER_FLAG]?: boolean;
  }
}

function extractCurrentPageSummary(): PageSummary {
  return {
    title: document.title.trim() || FALLBACK_CONVERSATION_TITLE,
    url: window.location.href
  };
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
          data: extractConversation(document, window.location),
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
