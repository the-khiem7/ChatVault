import "./popup.css";
import type { FolderExportResult, RuntimeRequest, RuntimeResponse } from "../runtime/messages";
import { writeFolderExportArtifact } from "./folderWriter";
import { formatExportError } from "./exportError";

const chooseFolderButton = document.querySelector<HTMLButtonElement>("#chooseFolderButton");
const exportButton = document.querySelector<HTMLButtonElement>("#exportButton");
const statusText = document.querySelector<HTMLElement>("#statusText");
const folderText = document.querySelector<HTMLElement>("#folderText");
const resultPanel = document.querySelector<HTMLElement>("#resultPanel");
let selectedFolder: FileSystemDirectoryHandle | undefined;

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
    resultPanel.textContent = message;
    resultPanel.dataset.state = state;
  }
}

function setFolderLabel(message: string): void {
  if (folderText) {
    folderText.textContent = message;
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
  const request: RuntimeRequest = { type: "EXPORT_CURRENT_CHAT" };
  return chrome.runtime.sendMessage(request);
}

async function chooseFolder(): Promise<FileSystemDirectoryHandle> {
  if (!window.showDirectoryPicker) {
    throw new Error("Folder export is not supported in this browser. Use desktop Chrome.");
  }

  const folder = await window.showDirectoryPicker({ mode: "readwrite" });
  selectedFolder = folder;
  setFolderLabel(`Folder selected: ${folder.name}`);
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

  try {
    const folder = selectedFolder ?? (await chooseFolder());
    setStatus("Checking page");
    setResult("Checking the active tab...");

    const response = await requestExportCurrentChat();

    if (!response.ok) {
      setStatus("Failed");
      setResult(response.error.message, "error");
      return;
    }

    setStatus("Writing files");
    setResult(`Writing ${response.data.rootFolder}/...`);
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
    });

    const warningText =
      response.warnings && response.warnings.length > 0
        ? `\nWarnings: ${response.warnings.length}`
        : "";
    setStatus("Done");
    setResult(
      `Exported to ${response.data.rootFolder}/\nMessages: ${response.data.messageCount}\nPage images: ${response.data.documentImageCount}\nMessage images: ${response.data.messageImageCount}\nImage candidates: ${response.data.assetCandidateCount}\nAssets saved: ${response.data.assetCount}${warningText}`,
      "success"
    );
  } catch (error) {
    setStatus("Failed");
    setResult(formatExportError(error), "error");
  } finally {
    setBusy(false);
  }
});
