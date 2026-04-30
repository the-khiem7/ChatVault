import type { ExportWarning } from "./warning";

export type DetectionConfidence = "high" | "medium" | "low";

export type MessageRole = "user" | "assistant" | "system" | "unknown";

export type ParagraphBlock = {
  id: string;
  kind: "paragraph";
  text: string;
};

export type CodeBlock = {
  id: string;
  kind: "code";
  text: string;
  language?: string;
};

export type ImageBlock = {
  id: string;
  kind: "image";
  assetCandidateId: string;
  sourceUrl: string;
  altText?: string;
};

export type ContentBlockDraft = ParagraphBlock | CodeBlock | ImageBlock;

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

export type ExportAsset = {
  id: string;
  type: "image" | "file";
  sourceUrl: string;
  localPath: string;
  mimeType?: string;
  extension?: string;
  byteLength?: number;
  status: "saved" | "remote-fallback" | "skipped";
  warningIds: string[];
};

export type ConversationDraft = {
  title: string;
  sourceUrl: string;
  extractedAt: string;
  messages: ChatMessageDraft[];
  assetCandidates: AssetCandidate[];
  warnings: ExportWarning[];
};
