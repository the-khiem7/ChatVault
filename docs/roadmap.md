# Roadmap

Updated: 2026-04-30

This is the primary resume file for the project. Keep it current enough that work can continue without reading prior chat history.

## Current State

- Repository contains the initial product proposal in `PROPOSAL`.
- Documentation foundation has been initialized in `docs/`.
- No extension source code has been scaffolded yet.
- MVP target is a Chrome Manifest V3 extension for exporting the current ChatGPT conversation only.

## Next Action

Scaffold the extension skeleton:

- `manifest.json`
- `package.json`
- Vite + TypeScript configuration
- popup UI
- content script
- MV3 service worker
- basic message passing from popup to content script

The first acceptance check is:

```txt
Click popup button
-> content script responds with current page title and URL
```

## Active Scope

Build a Chrome Extension that exports the currently opened ChatGPT conversation into a local ZIP archive containing:

```txt
<slug>/conversation.md
<slug>/assets/
```

The extension must:

- Use the user's real authenticated browser session.
- Extract rendered DOM from the current ChatGPT page.
- Preserve message order and roles.
- Preserve content as originally written as much as possible.
- Download images/assets locally when possible.
- Avoid external servers, telemetry, analytics, and cloud sync.

## Milestones

### Milestone 1: Extension Skeleton

Status: Not started

Deliverables:

- Chrome MV3 `manifest.json`
- popup HTML/CSS/TypeScript
- content script loaded on ChatGPT pages
- service worker
- popup-to-content-script message passing

Acceptance:

- User opens ChatGPT.
- User clicks extension icon.
- Popup can request and display current page title and URL from the content script.

Relevant docs:

- [architecture.md](architecture.md)
- [privacy-security.md](privacy-security.md)
- [testing-validation.md](testing-validation.md)

### Milestone 2: Basic Text Export

Status: Not started

Deliverables:

- conversation title detection
- message container detection
- user/assistant role detection
- visible text extraction
- `conversation.md` generation
- simple Markdown download

Acceptance:

- Current ChatGPT conversation exports as Markdown.
- Message order is preserved.
- No image support required yet.

Relevant docs:

- [product-requirements.md](product-requirements.md)
- [extraction-strategy.md](extraction-strategy.md)
- [data-contracts.md](data-contracts.md)

### Milestone 3: Code and Formatting Preservation

Status: Not started

Deliverables:

- code block extraction with fenced Markdown
- list extraction
- table extraction
- quote extraction
- basic fallback HTML-to-Markdown conversion

Acceptance:

- Technical conversations remain readable in Markdown.
- Code block content is not flattened into plain paragraphs.

Relevant docs:

- [extraction-strategy.md](extraction-strategy.md)
- [testing-validation.md](testing-validation.md)

### Milestone 4: Image Asset Export

Status: Not started

Deliverables:

- detect image nodes in message content
- fetch image blobs when browser policy allows
- convert data/blob URLs to files
- store assets under `assets/`
- replace Markdown image URLs with local asset paths
- warn when remote fallback is required

Acceptance:

- Uploaded/generated images are included in ZIP where possible.
- `conversation.md` references local asset paths where possible.

Relevant docs:

- [extraction-strategy.md](extraction-strategy.md)
- [data-contracts.md](data-contracts.md)

### Milestone 5: ZIP Export

Status: Not started

Deliverables:

- JSZip integration
- archive layout generation
- single ZIP download through Chrome downloads API

Acceptance:

- User receives `chatgpt-export-<slug>.zip`.
- ZIP contains `conversation.md`.
- ZIP contains `assets/` when images exist.

Relevant docs:

- [architecture.md](architecture.md)
- [data-contracts.md](data-contracts.md)

### Milestone 6: Robustness

Status: Not started

Deliverables:

- layered DOM selector strategies
- validation report
- warning states
- progress UI
- retry affordance

Acceptance:

- Extension handles common ChatGPT DOM variations gracefully.
- Failures are visible to the user and not silent.

Relevant docs:

- [risks.md](risks.md)
- [testing-validation.md](testing-validation.md)

## Completion Definition

MVP is complete when:

- User opens a ChatGPT conversation.
- User clicks the extension button.
- Extension exports a ZIP.
- ZIP contains `conversation.md`.
- ZIP contains `assets/` if images exist.
- Markdown contains all detected user and assistant messages in order.
- Code blocks are preserved.
- Images are referenced locally where possible.
- No external server is used.

## Progress Log

### 2026-04-30

- Accepted `PROPOSAL` as the initial product source.
- Created project documentation foundation in `docs/`.

