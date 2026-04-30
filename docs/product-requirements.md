# Product Requirements

Updated: 2026-04-30

## Product Goal

Build a Chrome Manifest V3 extension that exports the currently opened ChatGPT conversation into a portable local Markdown archive with assets.

This is a lossless exporter, not a summarizer or note generator.

## Target Users

Users who want to preserve ChatGPT conversations for:

- Obsidian
- Git repositories
- local knowledge bases
- RAG ingestion
- long-term personal archives

## Core Requirement

Preserve the original conversation as much as possible:

- user questions
- assistant answers
- uploaded images
- generated images
- code blocks
- tables
- markdown formatting
- math blocks where possible
- attachments where possible

The extension must preserve original content and ordering. It must not rewrite, summarize, or intentionally omit content.

## MVP Scope

In scope:

- export current ChatGPT conversation
- detect conversation title
- extract user and assistant messages in order
- preserve normal text
- preserve code blocks
- preserve bullet and numbered lists
- preserve tables where possible
- extract visible images
- save Markdown file
- save local assets
- package result as ZIP

Out of scope for MVP:

- bulk export all conversations
- auto tagging
- RAG embedding
- Git auto commit
- cloud sync
- Obsidian plugin
- cross-browser support
- multi-platform AI chat support
- Playwright crawler
- server backend
- OpenAI API integration

## Target Platform

Initial target:

- Desktop Chrome
- Chrome Manifest V3
- ChatGPT web app
- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

Possible future targets:

- Firefox WebExtension
- Claude
- Perplexity
- Gemini
- Poe

## User Flow

1. User opens a ChatGPT conversation.
2. User clicks the extension icon.
3. Popup opens.
4. User clicks `Export Current Chat`.
5. Extension scans the current page.
6. Extension creates Markdown.
7. Extension downloads assets where possible.
8. Extension creates ZIP.
9. Extension downloads `chatgpt-export-<slug>.zip`.

## Output

ZIP file:

```txt
chatgpt-export-<slug>.zip
```

ZIP content:

```txt
<slug>/
|-- conversation.md
`-- assets/
    |-- 001.png
    |-- 002.jpg
    `-- ...
```

## User-Facing States

Minimum popup states:

- Ready
- Extracting
- Downloading assets
- Creating ZIP
- Done
- Failed

Warnings should be explicit, for example:

- `Not a supported ChatGPT conversation page.`
- `Could not detect messages.`
- `Export completed with 2 asset warnings.`

## Acceptance Criteria

The MVP is acceptable when:

- a current ChatGPT conversation can be exported from the real browser session
- exported Markdown is not empty
- messages are ordered correctly
- user and assistant roles are represented
- code blocks remain fenced code blocks
- images are local when browser policy allows
- asset fallback warnings are reported
- no external server receives conversation content

