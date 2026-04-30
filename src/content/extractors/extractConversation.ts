import type {
  ChatMessageDraft,
  ConversationDraft,
  DetectionConfidence,
  MessageRole
} from "../../domain/conversation";
import type { ExportWarning } from "../../domain/warning";
import { FALLBACK_CONVERSATION_TITLE } from "../../shared/constants";

type MessageCandidate = {
  element: Element;
  role: MessageRole;
  confidence: DetectionConfidence;
};

const MESSAGE_SELECTOR = [
  "article[data-testid^='conversation-turn']",
  "article[data-message-author-role]",
  "[data-message-author-role]"
].join(",");

export function extractConversation(documentRef: Document, locationRef: Location | URL): ConversationDraft {
  const messages = mergeAdjacentSameRoleMessages(
    findMessageCandidates(documentRef)
    .map((candidate, index) => toMessageDraft(candidate, index))
      .filter((message) => message.blocks.length > 0)
  );
  const warnings: ExportWarning[] = [];

  if (messages.length === 0) {
    warnings.push({
      id: "warning-no-conversation-found",
      code: "NO_CONVERSATION_FOUND",
      severity: "error",
      message: "Could not detect any ChatGPT conversation messages on this page."
    });
  }

  return {
    title: documentRef.title.trim() || FALLBACK_CONVERSATION_TITLE,
    sourceUrl: locationRef.href,
    extractedAt: new Date().toISOString(),
    messages,
    assetCandidates: [],
    warnings
  };
}

function mergeAdjacentSameRoleMessages(messages: ChatMessageDraft[]): ChatMessageDraft[] {
  const merged: ChatMessageDraft[] = [];

  for (const message of messages) {
    const previous = merged[merged.length - 1];

    if (previous?.role === message.role) {
      previous.blocks = [
        {
          id: `${previous.id}-block-1`,
          kind: "paragraph",
          text: [previous.blocks.map((block) => block.text).join("\n\n"), message.blocks.map((block) => block.text).join("\n\n")]
            .filter(Boolean)
            .join("\n\n")
        }
      ];
      previous.confidence = previous.confidence === "high" && message.confidence === "high" ? "high" : "low";
      previous.warnings = [...previous.warnings, ...message.warnings];
      continue;
    }

    merged.push({ ...message, index: merged.length });
  }

  return merged;
}

function findMessageCandidates(documentRef: Document): MessageCandidate[] {
  const articleElements = Array.from(
    documentRef.querySelectorAll("article[data-testid^='conversation-turn'], article[data-message-author-role]")
  );
  const elements =
    articleElements.length > 0 ? articleElements : uniqueRootElements(documentRef.querySelectorAll(MESSAGE_SELECTOR));

  return elements.map((element, index) => {
    const role = detectRole(element, index);
    return {
      element,
      role: role.role,
      confidence: role.confidence
    };
  });
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

function detectRole(element: Element, index: number): { role: MessageRole; confidence: DetectionConfidence } {
  const roleElement = element.matches("[data-message-author-role]")
    ? element
    : element.querySelector("[data-message-author-role]");
  const explicitRole = roleElement?.getAttribute("data-message-author-role")?.toLowerCase();

  if (explicitRole === "user" || explicitRole === "assistant" || explicitRole === "system") {
    return { role: explicitRole, confidence: "high" };
  }

  const testId = element.getAttribute("data-testid")?.toLowerCase() ?? "";
  if (testId.includes("user")) {
    return { role: "user", confidence: "medium" };
  }
  if (testId.includes("assistant")) {
    return { role: "assistant", confidence: "medium" };
  }

  return {
    role: index % 2 === 0 ? "user" : "assistant",
    confidence: "low"
  };
}

function toMessageDraft(candidate: MessageCandidate, index: number): ChatMessageDraft {
  const id = `message-${index + 1}`;
  const text = getVisibleText(candidate.element);

  return {
    id,
    index,
    role: candidate.role,
    confidence: candidate.confidence,
    warnings: [],
    blocks: text ? [{ id: `${id}-block-1`, kind: "paragraph", text }] : []
  };
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
