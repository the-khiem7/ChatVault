import { FALLBACK_CONVERSATION_TITLE } from "../shared/constants";
import type { PageSummary } from "../runtime/messages";

export function extractPageSummary(documentRef: Document, locationRef: Location | URL): PageSummary {
  const title = documentRef.title.trim() || FALLBACK_CONVERSATION_TITLE;

  return {
    title,
    url: locationRef.href
  };
}
