import type { ExportWarning } from "./warning";

export type DetectionConfidence = "high" | "medium" | "low";

export type MessageRole = "user" | "assistant" | "system" | "unknown";

export type ParagraphBlock = {
  id: string;
  kind: "paragraph";
  text: string;
};

export type ContentBlockDraft = ParagraphBlock;

export type ChatMessageDraft = {
  id: string;
  index: number;
  role: MessageRole;
  blocks: ContentBlockDraft[];
  confidence: DetectionConfidence;
  warnings: ExportWarning[];
};

export type AssetCandidate = {
  id: string;
  messageId: string;
  blockId: string;
  kind: "image" | "file";
  sourceUrl: string;
  altText?: string;
  domOrder: number;
  confidence: DetectionConfidence;
};

export type ConversationDraft = {
  title: string;
  sourceUrl: string;
  extractedAt: string;
  messages: ChatMessageDraft[];
  assetCandidates: AssetCandidate[];
  warnings: ExportWarning[];
};
