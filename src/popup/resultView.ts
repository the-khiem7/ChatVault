import type { FolderExportResult } from "../runtime/messages";

export type ResultMetric = {
  label: string;
  value: string;
};

export type SuccessViewModel = {
  title: string;
  metrics: ResultMetric[];
  detail: string;
};

export function buildSuccessViewModel(result: FolderExportResult, warningCount: number): SuccessViewModel {
  return {
    title: `Exported to ${result.rootFolder}/`,
    metrics: [
      { label: "messages", value: String(result.messageCount) },
      { label: "images", value: String(result.assetCount) },
      { label: "warnings", value: String(warningCount) }
    ],
    detail: `Page images: ${result.documentImageCount} | Message images: ${result.messageImageCount} | Image candidates: ${result.assetCandidateCount}`
  };
}
