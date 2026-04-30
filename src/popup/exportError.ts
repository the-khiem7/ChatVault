export function formatExportError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return `Folder export failed: ${error.message}`;
  }

  return "Folder export failed. Choose the folder again and retry.";
}
