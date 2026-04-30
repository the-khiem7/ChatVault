import { getActiveTabStatus } from "../runtime/activeTabStatus";
import { createChromeApi } from "../runtime/chromeApi";
import { exportCurrentChat } from "../runtime/exportCurrentChat";
import type { RuntimeRequest, RuntimeResponse } from "../runtime/messages";

const chromeApi = createChromeApi();

chrome.runtime.onMessage.addListener(
  (request: RuntimeRequest, _sender, sendResponse: (response: RuntimeResponse<unknown>) => void) => {
    if (request.type === "GET_ACTIVE_TAB_STATUS") {
      getActiveTabStatus(chromeApi).then(sendResponse);
      return true;
    }

    if (request.type === "EXPORT_CURRENT_CHAT") {
      exportCurrentChat(chromeApi).then(sendResponse);
      return true;
    }

    sendResponse({
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: `Unsupported runtime request: ${request.type}`
      },
      warnings: []
    });
    return false;
  }
);
