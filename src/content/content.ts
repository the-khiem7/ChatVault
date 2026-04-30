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
  const messageElements = findMessageElements();
  const messages = messageElements
    .map((element, index) => {
      const id = `message-${index + 1}`;
      const role = detectMessageRole(element, index);
      const text = getVisibleText(element);

      return {
        id,
        index,
        role: role.role,
        confidence: role.confidence,
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

function findMessageElements(): Element[] {
  const articleElements = Array.from(
    document.querySelectorAll("article[data-testid^='conversation-turn'], article[data-message-author-role]")
  );

  if (articleElements.length > 0) {
    return articleElements;
  }

  return uniqueRootElements(document.querySelectorAll("[data-message-author-role]"));
}

function uniqueRootElements(elements: NodeListOf<Element>): Element[] {
  const unique: Element[] = [];

  for (const element of Array.from(elements)) {
    if (!unique.some((candidate) => candidate.contains(element))) {
      unique.push(element);
    }
  }

  return unique;
}

function detectMessageRole(element: Element, index: number): { role: MessageRole; confidence: DetectionConfidence } {
  const roleElement = element.matches("[data-message-author-role]")
    ? element
    : element.querySelector("[data-message-author-role]");
  const explicitRole = roleElement?.getAttribute("data-message-author-role")?.toLowerCase();

  if (explicitRole === "user" || explicitRole === "assistant" || explicitRole === "system") {
    return { role: explicitRole, confidence: "high" };
  }

  return { role: index % 2 === 0 ? "user" : "assistant", confidence: "low" };
}

function getVisibleText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  for (const disposable of Array.from(
    clone.querySelectorAll("button, svg, [aria-hidden='true'], [data-testid*='copy']")
  )) {
    disposable.remove();
  }

  const htmlElement = clone as HTMLElement;
  return (htmlElement.innerText ?? clone.textContent ?? "").trim().replace(/\n{3,}/g, "\n\n");
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
