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
  "[data-gemini-role='model']"
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
  return Array.from(documentRef.querySelectorAll(GEMINI_MESSAGE_SELECTOR)).map((element, index) => ({
    element,
    role: detectGeminiRole(element, index),
    confidence: "high"
  }));
}

function detectGeminiRole(element: Element, index: number): MessageRole {
  if (element.matches(".user-query-container, [data-gemini-role='user']")) {
    return "user";
  }

  if (element.matches(".model-response-container, [data-gemini-role='model']")) {
    return "assistant";
  }

  return index % 2 === 0 ? "user" : "assistant";
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
  const paragraphSelectors = [".query-text", ".response-text", "p"];

  for (const paragraph of Array.from(element.querySelectorAll(paragraphSelectors.join(",")))) {
    const text = (paragraph.textContent ?? "").trim();
    if (!text) {
      continue;
    }

    blocks.push({
      id: `${messageId}-block-${blocks.length + 1}`,
      kind: "paragraph",
      text
    });
  }

  for (const pre of Array.from(element.querySelectorAll("pre"))) {
    const codeElement = pre.querySelector("code");
    const text = (codeElement?.textContent ?? pre.textContent ?? "").trim();
    if (!text) {
      continue;
    }

    const className = `${codeElement?.className ?? ""} ${pre.className}`;
    const language = className.match(/language-([a-z0-9_-]+)/i)?.[1]?.toLowerCase();
    blocks.push({
      id: `${messageId}-block-${blocks.length + 1}`,
      kind: "code",
      text,
      ...(language ? { language } : {})
    });
  }

  for (const image of Array.from(element.querySelectorAll("img[src]"))) {
    const sourceUrl = image.getAttribute("src") ?? "";
    if (!sourceUrl) {
      continue;
    }

    const assetId = `asset-${assetCandidates.length + 1}`;
    const blockId = `${messageId}-block-${blocks.length + 1}`;
    const altText = image.getAttribute("alt")?.trim() || undefined;
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
  }

  return blocks;
}
