import type {
  AssetCandidate,
  ChatMessageDraft,
  ContentBlockDraft,
  ConversationDraft,
  DetectionConfidence,
  MessageRole
} from "../../domain/conversation";
import type { ExportWarning } from "../../domain/warning";

type GeminiCandidate = {
  element: Element;
  role: MessageRole;
  confidence: DetectionConfidence;
};

const FALLBACK_CONVERSATION_TITLE = "Untitled Gemini Conversation";

const GEMINI_MESSAGE_SELECTOR = [
  ".user-query-container",
  ".model-response-container",
  "[data-gemini-role='user']",
  "[data-gemini-role='model']",
  "[data-testid*='user-query']",
  "[data-testid*='model-response']",
  "[data-test-id*='user-query']",
  "[data-test-id*='model-response']"
].join(",");

export function extractGeminiConversation(documentRef: Document, locationRef: Location | URL): ConversationDraft {
  const assetCandidates: AssetCandidate[] = [];
  const candidates = findGeminiCandidates(documentRef);
  const messages = candidates
    .map((candidate, index) => toMessageDraft(candidate, index, assetCandidates))
    .filter((message) => message.blocks.length > 0);
  const warnings: ExportWarning[] = [];

  if (messages.length === 0) {
    warnings.push({
      id: "warning-no-conversation-found",
      code: "NO_CONVERSATION_FOUND",
      severity: "error",
      message: "Could not detect any Gemini conversation messages on this page."
    });
  }

  return {
    title: documentRef.title.trim() || FALLBACK_CONVERSATION_TITLE,
    sourceUrl: locationRef.href,
    extractedAt: new Date().toISOString(),
    messages,
    assetCandidates,
    diagnostics: {
      documentImageCount: documentRef.querySelectorAll("img[src]").length,
      messageImageCount: candidates.reduce((count, candidate) => count + candidate.element.querySelectorAll("img[src]").length, 0)
    },
    warnings
  };
}

function findGeminiCandidates(documentRef: Document): GeminiCandidate[] {
  return uniqueRootElements(documentRef.querySelectorAll(GEMINI_MESSAGE_SELECTOR)).map((element, index) => {
    const role = detectGeminiRole(element, index);
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

function detectGeminiRole(
  element: Element,
  index: number
): { role: MessageRole; confidence: DetectionConfidence } {
  if (element.matches(".user-query-container, [data-gemini-role='user']")) {
    return { role: "user", confidence: "high" };
  }

  if (element.matches(".model-response-container, [data-gemini-role='model']")) {
    return { role: "assistant", confidence: "high" };
  }

  const testId = [element.getAttribute("data-testid"), element.getAttribute("data-test-id")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (testId.includes("user-query")) {
    return { role: "user", confidence: "medium" };
  }

  if (testId.includes("model-response")) {
    return { role: "assistant", confidence: "medium" };
  }

  return { role: index % 2 === 0 ? "user" : "assistant", confidence: "low" };
}

function toMessageDraft(
  candidate: GeminiCandidate,
  index: number,
  assetCandidates: AssetCandidate[]
): ChatMessageDraft {
  const id = `message-${index + 1}`;

  return {
    id,
    index,
    role: candidate.role,
    confidence: candidate.confidence,
    warnings: [],
    blocks: extractGeminiBlocks(candidate.element, id, assetCandidates)
  };
}

function extractGeminiBlocks(element: Element, messageId: string, assetCandidates: AssetCandidate[]): ContentBlockDraft[] {
  const blocks: ContentBlockDraft[] = [];

  for (const node of Array.from(element.querySelectorAll(".query-text, .response-text, p, pre, img[src]"))) {
    if (node.matches(".query-text, .response-text, p") && hasNestedGeminiTextAncestor(node, element)) {
      continue;
    }

    if (node.matches("pre")) {
      const codeElement = node.querySelector("code");
      const text = (codeElement?.textContent ?? node.textContent ?? "").trim();
      if (!text) {
        continue;
      }

      const className = `${codeElement?.className ?? ""} ${node.className}`;
      const language = className.match(/language-([a-z0-9_-]+)/i)?.[1]?.toLowerCase();
      blocks.push({
        id: `${messageId}-block-${blocks.length + 1}`,
        kind: "code",
        text,
        ...(language ? { language } : {})
      });
      continue;
    }

    if (node.matches("img[src]")) {
      const sourceUrl = node.getAttribute("src") ?? "";
      if (!sourceUrl) {
        continue;
      }

      const assetId = `asset-${assetCandidates.length + 1}`;
      const blockId = `${messageId}-block-${blocks.length + 1}`;
      const altText = node.getAttribute("alt")?.trim() || undefined;
      assetCandidates.push({
        id: assetId,
        messageId,
        blockId,
        kind: "image",
        sourceUrl,
        ...(altText ? { altText } : {}),
        domOrder: assetCandidates.length,
        confidence: "high"
      });
      blocks.push({
        id: blockId,
        kind: "image",
        assetCandidateId: assetId,
        sourceUrl,
        ...(altText ? { altText } : {})
      });
      continue;
    }

    pushTextBlock(blocks, messageId, node.textContent ?? "");
  }

  if (blocks.length === 0) {
    pushTextBlock(blocks, messageId, element.textContent ?? "");
  }

  return blocks;
}

function hasNestedGeminiTextAncestor(node: Element, boundary: Element): boolean {
  let current = node.parentElement;

  while (current && current !== boundary) {
    if (current.matches(".query-text, .response-text, p")) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
}

function pushTextBlock(blocks: ContentBlockDraft[], messageId: string, text: string): void {
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
