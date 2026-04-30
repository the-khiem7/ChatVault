# Data Contracts

Updated: 2026-04-30

## ConversationExport

```ts
export type ConversationExport = {
  title: string;
  slug: string;
  sourceUrl: string;
  exportedAt: string;
  messages: ChatMessage[];
  assets: ExportAsset[];
};
```

Rules:

- `title` must be non-empty.
- `slug` must be filesystem-safe.
- `sourceUrl` should be the current tab URL.
- `exportedAt` must be an ISO datetime string.
- `messages` must preserve visible conversation order.
- `assets` must include every local asset referenced by Markdown.

## ChatMessage

```ts
export type ChatMessage = {
  index: number;
  role: "user" | "assistant" | "system" | "unknown";
  blocks: ContentBlock[];
};
```

Rules:

- `index` is zero-based or one-based, but must be consistent.
- `role` should be `user` or `assistant` whenever detection is reliable.
- `unknown` is allowed only as a fallback and should produce a warning.
- `blocks` must preserve message-local content order.

## ContentBlock

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

## ExportAsset

```ts
export type ExportAsset = {
  id: string;
  type: "image" | "file";
  sourceUrl: string;
  localPath: string;
  mimeType?: string;
  extension?: string;
};
```

Rules:

- `id` must be stable within one export run.
- `localPath` must be relative to `conversation.md`, for example `assets/001.png`.
- If binary download fails, the Markdown may keep the remote URL, but this must be reported as a warning.

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
- Use role headings exactly enough for downstream parsing.
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
- image references match assets

Validation failures should block export when output would be unusable. Partial asset failures may allow export with warnings.

