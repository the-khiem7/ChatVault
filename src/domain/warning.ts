export type ExportWarningCode =
  | "UNSUPPORTED_PAGE"
  | "NO_CONVERSATION_FOUND"
  | "LOW_CONFIDENCE_ROLE"
  | "UNKNOWN_BLOCK_FALLBACK"
  | "TABLE_CONVERSION_FALLBACK"
  | "ASSET_FETCH_FAILED"
  | "REMOTE_ASSET_FALLBACK"
  | "ZIP_GENERATION_FAILED"
  | "DOWNLOAD_FAILED"
  | "CONTENT_SCRIPT_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type ExportWarning = {
  id: string;
  code: ExportWarningCode;
  severity: "info" | "warning" | "error";
  message: string;
  messageId?: string;
  blockId?: string;
  assetId?: string;
};

export type ExportError = {
  code: ExportWarningCode;
  message: string;
};
