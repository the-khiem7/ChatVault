import type {
  ChatMessageDraft,
  ConversationDraft,
  ContentBlockDraft,
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
          text: [blocksToText(previous.blocks), blocksToText(message.blocks)]
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
  const blocks = extractBlocks(candidate.element, id);

  return {
    id,
    index,
    role: candidate.role,
    confidence: candidate.confidence,
    warnings: [],
    blocks
  };
}

function extractBlocks(element: Element, messageId: string): ContentBlockDraft[] {
  const clone = element.cloneNode(true) as Element;
  for (const disposable of Array.from(
    clone.querySelectorAll("button, svg, [aria-hidden='true'], [data-testid*='copy']")
  )) {
    disposable.remove();
  }

  const codeBlocks = Array.from(clone.querySelectorAll("pre")).map((pre, index) => {
    const marker = `\n\n__CHATGPT_EXPORT_CODE_BLOCK_${index}__\n\n`;
    const codeElement = pre.querySelector("code");
    const text = (codeElement?.textContent ?? pre.textContent ?? "").trim();
    const language = detectCodeLanguage(pre, codeElement);
    pre.textContent = marker;
    return { marker: marker.trim(), text, language };
  });

  const htmlElement = clone as HTMLElement;
  const visibleText = (htmlElement.innerText ?? clone.textContent ?? "").trim().replace(/\n{3,}/g, "\n\n");
  const markerPattern = /__CHATGPT_EXPORT_CODE_BLOCK_(\d+)__/g;
  const blocks: ContentBlockDraft[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = markerPattern.exec(visibleText)) !== null) {
    pushParagraphBlock(blocks, messageId, visibleText.slice(cursor, match.index));
    const codeBlock = codeBlocks[Number(match[1])];
    if (codeBlock?.text) {
      blocks.push({
        id: `${messageId}-block-${blocks.length + 1}`,
        kind: "code",
        text: codeBlock.text,
        ...(codeBlock.language ? { language: codeBlock.language } : {})
      });
    }
    cursor = match.index + match[0].length;
  }

  pushParagraphBlock(blocks, messageId, visibleText.slice(cursor));
  return blocks;
}

function pushParagraphBlock(blocks: ContentBlockDraft[], messageId: string, text: string): void {
  const normalized = text.trim().replace(/\n{3,}/g, "\n\n");
  if (!normalized) {
    return;
  }

  blocks.push({
    id: `${messageId}-block-${blocks.length + 1}`,
    kind: "paragraph",
    text: normalized
  });
}

function detectCodeLanguage(pre: Element, codeElement: Element | null): string | undefined {
  const languageSource = [
    codeElement?.getAttribute("data-language"),
    pre.getAttribute("data-language"),
    codeElement?.className,
    pre.className
  ]
    .filter(Boolean)
    .join(" ");
  const match = languageSource.match(/language-([a-z0-9_-]+)/i);
  return match?.[1]?.toLowerCase();
}

function blocksToText(blocks: ContentBlockDraft[]): string {
  return blocks
    .map((block) => {
      if (block.kind === "code") {
        return block.text;
      }
      return block.text;
    })
    .join("\n\n");
}
