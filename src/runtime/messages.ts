import type { ExportError, ExportWarning } from "../domain/warning";

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
  | { type: "EXTRACT_PAGE_SUMMARY" };

export type RuntimeResponse<T> =
  | { ok: true; data: T; warnings?: ExportWarning[] }
  | { ok: false; error: ExportError; warnings?: ExportWarning[] };
