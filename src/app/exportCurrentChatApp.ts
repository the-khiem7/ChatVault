import type { ChromeApi } from "../runtime/chromeApi";
import { exportCurrentChat } from "../runtime/exportCurrentChat";
import type { ExportProgressMessage, FolderExportResult, RuntimeResponse } from "../runtime/messages";

export type AppExportProgress = Omit<ExportProgressMessage, "type" | "requestId">;

export async function exportCurrentChatApp(
  chromeApi: ChromeApi,
  onProgress?: (progress: AppExportProgress) => void
): Promise<RuntimeResponse<FolderExportResult>> {
  onProgress?.({
    phase: "detecting-provider",
    completed: 0,
    total: 1,
    currentLabel: "active-tab"
  });

  const activeTab = await chromeApi.getActiveTab();
  const providerLabel = activeTab?.url?.includes("chatgpt") ? "chatgpt" : "provider";

  onProgress?.({
    phase: "extracting-content",
    completed: 0,
    total: 1,
    currentLabel: providerLabel
  });

  const result = await exportCurrentChat(chromeApi, onProgress);

  if (result.ok) {
    onProgress?.({
      phase: "building-artifact",
      completed: 1,
      total: 1,
      currentLabel: result.data.markdownPath
    });
  }

  return result;
}
