import { extractPageSummary } from "./pageSummary";
import type { PageSummary, RuntimeRequest, RuntimeResponse } from "../runtime/messages";

chrome.runtime.onMessage.addListener(
  (request: RuntimeRequest, _sender, sendResponse: (response: RuntimeResponse<PageSummary>) => void) => {
    if (request.type !== "EXTRACT_PAGE_SUMMARY") {
      return false;
    }

    sendResponse({
      ok: true,
      data: extractPageSummary(document, window.location),
      warnings: []
    });
    return false;
  }
);
