import "./popup.css";
import type { FolderExportResult, RuntimeRequest, RuntimeResponse } from "../runtime/messages";
import type { ExportProgressMessage } from "../runtime/messages";
import { writeFolderExportArtifact } from "./folderWriter";
import { formatExportError } from "./exportError";
import { buildSuccessViewModel } from "./resultView";

const chooseFolderButton = document.querySelector<HTMLButtonElement>("#chooseFolderButton");
const exportButton = document.querySelector<HTMLButtonElement>("#exportButton");
const statusText = document.querySelector<HTMLElement>("#statusText");
const folderText = document.querySelector<HTMLElement>("#folderText");
const resultPanel = document.querySelector<HTMLElement>("#resultPanel");
const folderStep = document.querySelector<HTMLElement>("#folderStep");
const exportStep = document.querySelector<HTMLElement>("#exportStep");
const progressPanel = document.querySelector<HTMLElement>("#progressPanel");
const progressTitle = document.querySelector<HTMLElement>("#progressTitle");
const progressCount = document.querySelector<HTMLElement>("#progressCount");
const progressDetail = document.querySelector<HTMLElement>("#progressDetail");
const assetProgress = document.querySelector<HTMLProgressElement>("#assetProgress");
let selectedFolder: FileSystemDirectoryHandle | undefined;
let activeRequestId: string | undefined;

declare global {
  interface Window {
    showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  }
}

function setStatus(status: string): void {
  if (statusText) {
    statusText.textContent = status;
  }
}

function setResult(message: string, state: "ready" | "success" | "error" = "ready"): void {
  if (resultPanel) {
    resultPanel.hidden = false;
    resultPanel.textContent = message;
    resultPanel.dataset.state = state;
  }
}

function setSuccessResult(result: FolderExportResult, warningCount: number): void {
  if (!resultPanel) {
    return;
  }

  const viewModel = buildSuccessViewModel(result, warningCount);
  resultPanel.hidden = false;
  resultPanel.dataset.state = "success";
  resultPanel.replaceChildren();

  const title = document.createElement("div");
  title.className = "result-title";
  title.textContent = viewModel.title;
  resultPanel.append(title);

  const metrics = document.createElement("div");
  metrics.className = "metrics";
  for (const metric of viewModel.metrics) {
    const metricElement = document.createElement("div");
    metricElement.className = "metric";
    const value = document.createElement("b");
    value.textContent = metric.value;
    const label = document.createElement("span");
    label.textContent = metric.label;
    metricElement.append(value, label);
    metrics.append(metricElement);
  }
  resultPanel.append(metrics);

  const detail = document.createElement("div");
  detail.className = "result-detail";
  detail.textContent = viewModel.detail;
  resultPanel.append(detail);
}

function hideResult(): void {
  if (resultPanel) {
    resultPanel.hidden = true;
    resultPanel.replaceChildren();
  }
}

function setFolderLabel(message: string): void {
  if (folderText) {
    folderText.textContent = message;
  }
}

function setStepState(step: HTMLElement | null, state: "pending" | "done"): void {
  if (step) {
    step.dataset.state = state;
  }
}

function setBusy(isBusy: boolean): void {
  if (chooseFolderButton) {
    chooseFolderButton.disabled = isBusy;
  }
  if (exportButton) {
    exportButton.disabled = isBusy;
  }
}

async function requestExportCurrentChat(): Promise<RuntimeResponse<FolderExportResult>> {
  activeRequestId = crypto.randomUUID();
  const request: RuntimeRequest = { type: "EXPORT_CURRENT_CHAT", requestId: activeRequestId };
  return chrome.runtime.sendMessage(request);
}

function updateProgress(title: string, completed: number, total: number, currentLabel: string): void {
  if (progressPanel) {
    progressPanel.hidden = false;
  }
  if (progressTitle) {
    progressTitle.textContent = title;
  }
  if (progressCount) {
    progressCount.textContent = `${completed} / ${total}`;
  }
  if (assetProgress) {
    assetProgress.max = Math.max(total, 1);
    assetProgress.value = Math.min(completed, total);
  }
  if (progressDetail) {
    progressDetail.textContent = currentLabel;
  }
}

function hideProgress(): void {
  if (progressPanel) {
    progressPanel.hidden = true;
  }
}

chrome.runtime.onMessage.addListener((message: ExportProgressMessage) => {
  if (message.type !== "EXPORT_PROGRESS" || message.requestId !== activeRequestId) {
    return false;
  }

  if (message.phase === "resolving-assets") {
    updateProgress("Resolving images", message.completed, message.total, message.currentLabel);
  }
  return false;
});

async function chooseFolder(): Promise<FileSystemDirectoryHandle> {
  if (!window.showDirectoryPicker) {
    throw new Error("Folder export is not supported in this browser. Use desktop Chrome.");
  }

  const folder = await window.showDirectoryPicker({ mode: "readwrite" });
  selectedFolder = folder;
  setFolderLabel(`Selected: ${folder.name}`);
  setStepState(folderStep, "done");
  return folder;
}

chooseFolderButton?.addEventListener("click", async () => {
  setBusy(true);
  setStatus("Choosing folder");
  setResult("Choose an export folder.");

  try {
    await chooseFolder();
    setStatus("Ready");
    setResult("Folder selected. Ready to export.");
  } catch (error) {
    setStatus("Failed");
    setResult(error instanceof Error ? error.message : "Could not choose an export folder.", "error");
  } finally {
    setBusy(false);
  }
});

exportButton?.addEventListener("click", async () => {
  setBusy(true);
  hideResult();

  try {
    const folder = selectedFolder ?? (await chooseFolder());
    setStatus("Checking page");

    const response = await requestExportCurrentChat();

    if (!response.ok) {
      setStatus("Failed");
      setResult(response.error.message, "error");
      return;
    }

    setStatus("Writing files");
    setStepState(exportStep, "pending");
    const totalAssets = response.data.files.filter((file) => file.relativePath.startsWith("assets/")).length;
    updateProgress("Writing images", 0, totalAssets, totalAssets > 0 ? "Starting asset writes" : "No images to write");
    await writeFolderExportArtifact(folder, {
      rootFolder: response.data.rootFolder,
      files: response.data.files,
      manifest: {
        rootFolder: response.data.rootFolder,
        markdownPath: response.data.markdownPath,
        assetPaths: response.data.files
          .map((file) => file.relativePath)
          .filter((path) => path.startsWith("assets/"))
      },
      warnings: response.warnings ?? []
    }, {
      onProgress(progress) {
        updateProgress("Writing images", progress.completed, progress.total, progress.currentLabel);
      }
    });

    const warningCount = response.warnings?.length ?? 0;
    setStatus("Done");
    setStepState(exportStep, "done");
    hideProgress();
    setSuccessResult(response.data, warningCount);
  } catch (error) {
    setStatus("Failed");
    setResult(formatExportError(error), "error");
  } finally {
    setBusy(false);
  }
});
