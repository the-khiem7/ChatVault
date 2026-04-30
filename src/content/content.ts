import type { PageSummary, RuntimeRequest, RuntimeResponse } from "../runtime/messages";

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
    (request: RuntimeRequest, _sender, sendResponse: (response: RuntimeResponse<PageSummary>) => void) => {
      if (request.type !== "EXTRACT_PAGE_SUMMARY") {
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
