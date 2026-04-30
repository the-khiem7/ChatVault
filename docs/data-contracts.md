# Data Contracts

Updated: 2026-04-30

These contracts define the data exchanged between extraction, export, validation, and runtime orchestration. Keep runtime messages explicit so the project can be tested without Chrome where possible.

## ConversationDraft

`ConversationDraft` is produced by the content script. It represents what was detected in the page, before asset fetching and final validation.

```ts
export type ConversationDraft = {
  title: string;
  sourceUrl: string;
  extractedAt: string;
  messages: ChatMessageDraft[];
  assetCandidates: AssetCandidate[];
  warnings: ExportWarning[];
};
```

Rules:

- `sourceUrl` must be the current tab URL.
- `messages` must preserve visible order.
- `assetCandidates` are references discovered in the DOM, not proof that local files exist.
- Low-confidence extraction must add warnings instead of silently normalizing data.

## ConversationExport

`ConversationExport` is the validated final domain object used to write Markdown and ZIP output.

```ts
export type ConversationExport = {
  title: string;
  slug: string;
  sourceUrl: string;
  exportedAt: string;
  messages: ChatMessage[];
  assets: ExportAsset[];
  warnings: ExportWarning[];
};
```

Rules:

- `title` must be non-empty.
- `slug` must be filesystem-safe.
- `exportedAt` must be an ISO datetime string.
- `messages` must preserve visible conversation order.
- `assets` must include every local asset referenced by Markdown.
- `warnings` must be shown to the user after export.

## Messages

```ts
export type ChatMessageDraft = {
  id: string;
  index: number;
  role: MessageRole;
  blocks: ContentBlockDraft[];
  confidence: DetectionConfidence;
  warnings: ExportWarning[];
};

export type ChatMessage = {
  id: string;
  index: number;
  role: MessageRole;
  blocks: ContentBlock[];
};

export type MessageRole = "user" | "assistant" | "system" | "unknown";
export type DetectionConfidence = "high" | "medium" | "low";
```

Rules:

- `index` is zero-based.
- `role` should be `user` or `assistant` whenever reliable.
- `unknown` is allowed only as a fallback and must produce a warning.
- `blocks` must preserve message-local order.

## Content Blocks

```ts
export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | CodeBlock
  | TableBlock
  | QuoteBlock
  | MathBlock
  | ImageBlock
  | AttachmentBlock
  | UnknownBlock;
```

Minimum MVP block support:

- paragraph
- list
- code
- table
- quote
- image
- unknown fallback

Unknown blocks must preserve visible text where possible.

## Assets

```ts
export type AssetCandidate = {
  id: string;
  messageId: string;
  blockId: string;
  kind: "image" | "file";
  sourceUrl: string;
  altText?: string;
  domOrder: number;
  confidence: DetectionConfidence;
};

export type ExportAsset = {
  id: string;
  type: "image" | "file";
  sourceUrl: string;
  localPath: string;
  mimeType?: string;
  extension?: string;
  byteLength?: number;
  status: "saved" | "remote-fallback" | "skipped";
  warningIds: string[];
};
```

Rules:

- `AssetCandidate` comes from DOM extraction.
- `ExportAsset` comes from asset resolution.
- `localPath` must be relative to `conversation.md`, for example `assets/001.png`.
- If binary download fails, Markdown may keep the remote URL, but this must be reported as a warning.
- The extension must not fetch URLs that were not derived from extracted asset candidates.

## Warnings

```ts
export type ExportWarning = {
  id: string;
  code: ExportWarningCode;
  severity: "info" | "warning" | "error";
  message: string;
  messageId?: string;
  blockId?: string;
  assetId?: string;
};
```

Expected warning codes:

- `UNSUPPORTED_PAGE`
- `NO_CONVERSATION_FOUND`
- `LOW_CONFIDENCE_ROLE`
- `UNKNOWN_BLOCK_FALLBACK`
- `TABLE_CONVERSION_FALLBACK`
- `ASSET_FETCH_FAILED`
- `REMOTE_ASSET_FALLBACK`
- `ZIP_GENERATION_FAILED`
- `DOWNLOAD_FAILED`

## Runtime Messages

Messages between popup, service worker, content script, and offscreen document should be discriminated unions.

```ts
export type RuntimeRequest =
  | { type: "GET_ACTIVE_TAB_STATUS" }
  | { type: "EXPORT_CURRENT_CHAT" }
  | { type: "EXTRACT_CONVERSATION" }
  | { type: "BUILD_ARCHIVE"; draft: ConversationDraft }
  | { type: "DOWNLOAD_ARCHIVE"; archive: ArchiveArtifact };

export type RuntimeResponse<T> =
  | { ok: true; data: T; warnings?: ExportWarning[] }
  | { ok: false; error: ExportError; warnings?: ExportWarning[] };
```

Rules:

- Do not pass raw DOM nodes across runtime boundaries.
- Do not pass functions across runtime boundaries.
- Do not throw unstructured errors across runtime boundaries.
- Large binary payloads should be introduced carefully and tested against MV3 lifecycle behavior.

## Archive Artifact

```ts
export type ArchiveArtifact = {
  filename: string;
  mimeType: "application/zip" | "text/markdown";
  bytes: Blob | ArrayBuffer;
  manifest: ArchiveManifest;
  warnings: ExportWarning[];
};

export type ArchiveManifest = {
  rootFolder: string;
  markdownPath: string;
  assetPaths: string[];
};
```

## Markdown Output Contract

`conversation.md` must use this shape:

```md
---
title: "{conversation title}"
source: "chatgpt"
sourceUrl: "{current url}"
exportedAt: "{ISO datetime}"
---

# {conversation title}

## User

...

## Assistant

...

![image](assets/001.png)
```

Rules:

- Do not add commentary.
- Do not summarize.
- Do not clean up the user's original wording.
- Use stable role headings.
- Preserve code fences.
- Prefer local image paths.

## ZIP Layout Contract

```txt
<slug>/conversation.md
<slug>/assets/001.png
<slug>/assets/002.jpg
```

ZIP filename:

```txt
chatgpt-export-<slug>.zip
```

## Validation Contract

Before download, validate:

- conversation has a title
- conversation has at least one message
- messages are ordered
- Markdown is not empty
- every local Markdown asset reference exists in ZIP
- code blocks are not empty unless source was empty
- image references match assets or remote fallback warnings
- warnings are included in the final response

Validation failures should block export when output would be unusable. Partial asset failures may allow export with warnings.

