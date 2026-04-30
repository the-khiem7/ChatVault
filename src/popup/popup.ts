import "./popup.css";
import type { MarkdownExportResult, RuntimeRequest, RuntimeResponse } from "../runtime/messages";

const exportButton = document.querySelector<HTMLButtonElement>("#exportButton");
const statusText = document.querySelector<HTMLElement>("#statusText");
const resultPanel = document.querySelector<HTMLElement>("#resultPanel");

function setStatus(status: string): void {
  if (statusText) {
    statusText.textContent = status;
  }
}

function setResult(message: string, state: "ready" | "success" | "error" = "ready"): void {
  if (resultPanel) {
    resultPanel.textContent = message;
    resultPanel.dataset.state = state;
  }
}

async function requestExportCurrentChat(): Promise<RuntimeResponse<MarkdownExportResult>> {
  const request: RuntimeRequest = { type: "EXPORT_CURRENT_CHAT" };
  return chrome.runtime.sendMessage(request);
}

exportButton?.addEventListener("click", async () => {
  exportButton.disabled = true;
  setStatus("Checking page");
  setResult("Checking the active tab...");

  try {
    const response = await requestExportCurrentChat();

    if (!response.ok) {
      setStatus("Failed");
      setResult(response.error.message, "error");
      return;
    }

    const warningText =
      response.warnings && response.warnings.length > 0
        ? `\nWarnings: ${response.warnings.length}`
        : "";
    setStatus("Done");
    setResult(
      `Downloaded ${response.data.filename}\nMessages: ${response.data.messageCount}\nAssets: ${response.data.assetCount}${warningText}`,
      "success"
    );
  } catch {
    setStatus("Failed");
    setResult("The extension runtime did not respond. Reload the extension and try again.", "error");
  } finally {
    exportButton.disabled = false;
  }
});
