import type { ChromeApi } from "./chromeApi";
import type { ActiveTabStatus, PageSummary, RuntimeResponse } from "./messages";
import { isSupportedChatGptUrl } from "./urlSupport";

export async function getActiveTabStatus(
  chromeApi: ChromeApi
): Promise<RuntimeResponse<ActiveTabStatus>> {
  const tab = await chromeApi.getActiveTab();

  if (!tab?.id || !isSupportedChatGptUrl(tab.url)) {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_PAGE",
        message: "Open a supported ChatGPT conversation page before exporting."
      },
      warnings: []
    };
  }

  try {
    const summaryResponse = await chromeApi.sendMessageToTab<PageSummary>(tab.id, {
      type: "EXTRACT_PAGE_SUMMARY"
    });

    if (!summaryResponse.ok) {
      return summaryResponse;
    }

    return {
      ok: true,
      data: {
        supported: true,
        tabId: tab.id,
        url: tab.url ?? summaryResponse.data.url,
        title: summaryResponse.data.title
      },
      warnings: summaryResponse.warnings ?? []
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "CONTENT_SCRIPT_UNAVAILABLE",
        message: "The ChatGPT content script is not available on this page. Reload the tab and try again."
      },
      warnings: []
    };
  }
}
