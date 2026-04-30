import "./popup.css";
import type { ActiveTabStatus, RuntimeRequest, RuntimeResponse } from "../runtime/messages";

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

async function requestActiveTabStatus(): Promise<RuntimeResponse<ActiveTabStatus>> {
  const request: RuntimeRequest = { type: "GET_ACTIVE_TAB_STATUS" };
  return chrome.runtime.sendMessage(request);
}

exportButton?.addEventListener("click", async () => {
  exportButton.disabled = true;
  setStatus("Checking page");
  setResult("Checking the active tab...");

  try {
    const response = await requestActiveTabStatus();

    if (!response.ok) {
      setStatus("Failed");
      setResult(response.error.message, "error");
      return;
    }

    setStatus("Ready");
    setResult(`${response.data.title}\n${response.data.url}`, "success");
  } catch {
    setStatus("Failed");
    setResult("The extension runtime did not respond. Reload the extension and try again.", "error");
  } finally {
    exportButton.disabled = false;
  }
});
