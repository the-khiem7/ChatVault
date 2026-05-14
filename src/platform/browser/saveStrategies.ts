import { writeFolderExportArtifact } from "../../popup/folderWriter";
import type { BrowserApi, BrowserCapabilities, SaveContext, SaveResult, SaveStrategy } from "./contracts";

const chromeDirectFolderSaveStrategy: SaveStrategy = {
  id: "chrome-direct-folder",
  supports(capabilities) {
    return capabilities.canDirectWriteFolder;
  },
  async save(context) {
    const selectedFolder = context.browser.selectedFolder;
    if (!selectedFolder) {
      throw new Error("DIRECTORY_WRITE_FAILED: missing selected folder.");
    }

    await writeFolderExportArtifact(
      selectedFolder,
      {
        rootFolder: context.artifact.rootFolder,
        files: context.artifact.files,
        manifest: {
          rootFolder: context.artifact.rootFolder,
          markdownPath: context.artifact.markdownPath,
          assetPaths: context.artifact.files
            .filter((file) => file.relativePath.startsWith("assets/"))
            .map((file) => file.relativePath)
        },
        warnings: []
      },
      {
        onProgress: context.onProgress
      }
    );

    return {
      mode: "directory-write",
      outputPath: `${context.artifact.rootFolder}/${context.artifact.markdownPath}`,
      fileCount: context.artifact.files.length
    };
  }
};

const firefoxPackagedDownloadSaveStrategy: SaveStrategy = {
  id: "firefox-packaged-download",
  supports(capabilities) {
    return capabilities.canDownloadArchive;
  },
  async save() {
    throw new Error("ARCHIVE_DOWNLOAD_FAILED: packaged download not implemented yet.");
  }
};

const saveStrategies: SaveStrategy[] = [chromeDirectFolderSaveStrategy, firefoxPackagedDownloadSaveStrategy];

export function resolveSaveStrategy(browser: BrowserApi, capabilities: BrowserCapabilities): SaveStrategy | null {
  return saveStrategies.find((strategy) => strategy.supports(capabilities) && matchesBrowser(strategy.id, browser.browserId)) ?? null;
}

export async function saveArtifact(context: SaveContext): Promise<SaveResult> {
  const strategy = resolveSaveStrategy(context.browser, context.capabilities);
  if (!strategy) {
    throw new Error("SAVE_STRATEGY_UNAVAILABLE: no save strategy matched current browser capabilities.");
  }

  return strategy.save(context);
}

function matchesBrowser(strategyId: string, browserId: string): boolean {
  if (strategyId.startsWith("chrome-") && browserId === "chrome") {
    return true;
  }

  if (strategyId.startsWith("firefox-") && browserId === "firefox") {
    return true;
  }

  return false;
}
