import type { PageSummary, RuntimeRequest, RuntimeResponse } from "../runtime/messages";
import type { ConversationDraft, DetectionConfidence, MessageRole } from "../domain/conversation";
import type { ExportWarning } from "../domain/warning";

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

function extractCurrentConversation(): ConversationDraft {
  const messageElements = Array.from(
    document.querySelectorAll(
      "article[data-testid^='conversation-turn'], article[data-message-author-role], [data-message-author-role]"
    )
  );
  const messages = messageElements
    .map((element, index) => {
      const id = `message-${index + 1}`;
      const text = ((element as HTMLElement).innerText ?? element.textContent ?? "")
        .trim()
        .replace(/\n{3,}/g, "\n\n");

      return {
        id,
        index,
        role: detectMessageRole(element, index),
        confidence: (element.getAttribute("data-message-author-role") ? "high" : "low") as DetectionConfidence,
        warnings: [],
        blocks: text ? [{ id: `${id}-block-1`, kind: "paragraph" as const, text }] : []
      };
    })
    .filter((message) => message.blocks.length > 0);
  const warnings: ExportWarning[] =
    messages.length === 0
      ? [
          {
            id: "warning-no-conversation-found",
            code: "NO_CONVERSATION_FOUND",
            severity: "error",
            message: "Could not detect any ChatGPT conversation messages on this page."
          }
        ]
      : [];

  return {
    title: document.title.trim() || FALLBACK_CONVERSATION_TITLE,
    sourceUrl: window.location.href,
    extractedAt: new Date().toISOString(),
    messages,
    assetCandidates: [],
    warnings
  };
}

function detectMessageRole(element: Element, index: number): MessageRole {
  const explicitRole = element.getAttribute("data-message-author-role")?.toLowerCase();
  if (explicitRole === "user" || explicitRole === "assistant" || explicitRole === "system") {
    return explicitRole;
  }
  return index % 2 === 0 ? "user" : "assistant";
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
