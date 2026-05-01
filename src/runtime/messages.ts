import type { ExportError, ExportWarning } from "../domain/warning";
import type { ConversationDraft } from "../domain/conversation";
import type { FolderExportFile } from "../export/folderExportBuilder";

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
  | { type: "EXPORT_CURRENT_CHAT"; requestId?: string }
  | { type: "EXTRACT_PAGE_SUMMARY" }
  | { type: "EXTRACT_CONVERSATION" };

export type ExportProgressPhase = "resolving-assets" | "writing-assets";

export type ExportProgressMessage = {
  type: "EXPORT_PROGRESS";
  requestId: string;
  phase: ExportProgressPhase;
  completed: number;
  total: number;
  currentLabel: string;
};

export type FolderExportResult = {
  rootFolder: string;
  markdownPath: string;
  title: string;
  messageCount: number;
  assetCandidateCount: number;
  documentImageCount: number;
  messageImageCount: number;
  assetCount: number;
  files: FolderExportFile[];
};

export type ConversationExtractionResult = ConversationDraft;

export type RuntimeResponse<T> =
  | { ok: true; data: T; warnings?: ExportWarning[] }
  | { ok: false; error: ExportError; warnings?: ExportWarning[] };
