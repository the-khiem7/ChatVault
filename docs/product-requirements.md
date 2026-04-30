# Product Requirements

Updated: 2026-05-01

## Product Goal

Build a Chrome Manifest V3 extension that exports the currently opened ChatGPT conversation into a portable local Markdown folder with assets.

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

## Architectural Product Constraints

The product must be implemented as a local Chrome MV3 extension with these constraints:

- Use the user's existing authenticated Chrome session.
- Read the rendered ChatGPT page through a content script.
- Keep DOM extraction separate from export writing orchestration.
- Keep final download controlled by extension runtime code, not page code.
- Keep export transformation logic testable outside Chrome APIs.
- Do not use Playwright, a backend server, or the OpenAI API for MVP.
- Do not request broad host access only to improve asset download success.

These constraints are part of the product, not optional implementation preferences.

## MVP Scope

In scope:

- export current ChatGPT conversation
- detect conversation title
- extract user and assistant messages in order
- preserve normal text
- preserve code blocks
- preserve bullet and numbered lists
- preserve tables where possible
- detect visible images and asset candidates
- save Markdown file
- save local assets where browser policy allows
- write result to a user-selected local folder
- show warnings for partial export issues

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
- persistent background export queue
- arbitrary remote asset proxying

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
4. User chooses an export folder if one is not already selected.
5. User clicks `Export Current Chat`.
6. Extension validates the active tab.
7. Content script scans the current page.
8. Extension creates Markdown from structured extraction data.
9. Extension downloads or converts assets where policy allows.
10. Extension validates output.
11. Extension writes `<slug>/conversation.md` and `<slug>/assets/` into the selected folder.
12. Popup shows success, warnings, or failure.

## Output

Folder content:

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
- Checking page
- Extracting
- Building Markdown
- Resolving assets
- Writing files
- Done
- Failed

Warnings should be explicit, for example:

- `Not a supported ChatGPT conversation page.`
- `Could not detect messages.`
- `Export completed with 2 asset warnings.`
- `Some images could not be saved locally and remain remote links.`

## Acceptance Criteria

The MVP is acceptable when:

- a current ChatGPT conversation can be exported from the real browser session
- exported Markdown is not empty
- messages are ordered correctly
- user and assistant roles are represented
- code blocks remain fenced code blocks
- images are local when browser policy allows
- remote image fallback warnings are reported
- written asset paths match Markdown references
- no external server receives conversation content
- implementation follows the runtime boundaries in [architecture.md](architecture.md)
