import type { ExportError, ExportWarning } from "../domain/warning";
import type { ConversationDraft } from "../domain/conversation";

export type PageSummary = {
  title: string;
  url: string;
};

export type ActiveTabStatus = {
  supported: true;
  tabId: number;
  url: string;
  title: string;
};

export type RuntimeRequest =
  | { type: "GET_ACTIVE_TAB_STATUS" }
  | { type: "EXPORT_CURRENT_CHAT" }
  | { type: "EXTRACT_PAGE_SUMMARY" }
  | { type: "EXTRACT_CONVERSATION" };

export type MarkdownExportResult = {
  filename: string;
  title: string;
  messageCount: number;
  assetCandidateCount: number;
  documentImageCount: number;
  messageImageCount: number;
  assetCount: number;
};

export type ConversationExtractionResult = ConversationDraft;

export type RuntimeResponse<T> =
  | { ok: true; data: T; warnings?: ExportWarning[] }
  | { ok: false; error: ExportError; warnings?: ExportWarning[] };
