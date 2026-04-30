# Roadmap

Updated: 2026-04-30

This is the primary resume file for the project. Keep it current enough that work can continue without reading prior chat history.

## Current State

- Repository contains the initial product proposal in `PROPOSAL`.
- Documentation foundation exists in `docs/`.
- Architecture has been re-evaluated from a proposal file tree into a runtime-first project architecture.
- No extension source code has been scaffolded yet.
- MVP target is a Chrome Manifest V3 extension for exporting the current ChatGPT conversation only.

## Next Action

Scaffold Milestone 1 using the runtime-first architecture:

- `manifest.json`
- `package.json`
- Vite + TypeScript configuration
- `src/popup/` for UI only
- `src/background/serviceWorker.ts` for orchestration
- `src/content/content.ts` for ChatGPT DOM extraction endpoint
- `src/domain/` for shared domain types
- `src/runtime/` for Chrome API/message adapters
- basic popup -> service worker -> content script message flow

The first acceptance check is:

```txt
Click popup button
-> service worker validates active tab
-> content script responds with current page title and URL
-> popup displays the response
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
- Keep DOM extraction separate from export/download orchestration.
- Preserve message order and roles.
- Preserve content as originally written as much as possible.
- Download images/assets locally when browser policy allows.
- Avoid external servers, telemetry, analytics, and cloud sync.
- Follow the architecture in [architecture.md](architecture.md).

## Milestones

### Milestone 1: Extension Skeleton

Status: Not started

Deliverables:

- Chrome MV3 `manifest.json`
- popup HTML/CSS/TypeScript
- service worker with top-level event/message handlers
- content script loaded on ChatGPT pages
- runtime message contracts
- Chrome API adapter skeleton
- popup-to-service-worker-to-content-script message passing

Acceptance:

- User opens ChatGPT.
- User clicks extension icon.
- Popup can request current page title and URL through the service worker.
- Content script returns the page title and URL.
- Popup displays the response or a clear unsupported-page error.

Relevant docs:

- [architecture.md](architecture.md)
- [privacy-security.md](privacy-security.md)
- [testing-validation.md](testing-validation.md)
- [data-contracts.md](data-contracts.md)

### Milestone 2: Basic Text Export

Status: Not started

Deliverables:

- conversation title detection
- message container detection
- user/assistant role detection
- visible text extraction
- `ConversationDraft` output
- Markdown writer
- simple Markdown download as an interim step

Acceptance:

- Current ChatGPT conversation exports as Markdown.
- Message order is preserved.
- No image support required yet.
- Extraction and Markdown writing are separate modules.

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
- unknown block fallback
- basic fallback HTML-to-Markdown conversion if needed

Acceptance:

- Technical conversations remain readable in Markdown.
- Code block content is not flattened into plain paragraphs.
- Unsupported content is preserved as visible text with warnings.

Relevant docs:

- [extraction-strategy.md](extraction-strategy.md)
- [testing-validation.md](testing-validation.md)

### Milestone 4: Image Asset Export

Status: Not started

Deliverables:

- detect image nodes as asset candidates
- asset naming
- asset policy checks
- data/blob URL conversion where possible
- controlled fetch for allowed image blobs
- store assets under `assets/`
- replace Markdown links with local asset paths
- warn when remote fallback is required

Acceptance:

- Uploaded/generated images are included in ZIP where possible.
- `conversation.md` references local asset paths where possible.
- Remote fallback links include warnings.
- The extension does not expose arbitrary URL fetching.

Relevant docs:

- [extraction-strategy.md](extraction-strategy.md)
- [data-contracts.md](data-contracts.md)
- [privacy-security.md](privacy-security.md)

### Milestone 5: ZIP Export

Status: Not started

Deliverables:

- JSZip integration
- archive artifact contract
- archive manifest generation
- single ZIP download through Chrome downloads API
- offscreen document only if proven necessary

Acceptance:

- User receives `chatgpt-export-<slug>.zip`.
- ZIP contains `conversation.md`.
- ZIP contains `assets/` when images exist.
- ZIP paths match Markdown references.

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
- popup close/service worker lifecycle checks

Acceptance:

- Extension handles common ChatGPT UI variations gracefully.
- Failures are visible to the user and not silent.
- MV3 lifecycle behavior does not corrupt export output.

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
- Asset fallback warnings are visible.
- No external server is used.
- Architecture boundaries in [architecture.md](architecture.md) are respected.

## Progress Log

### 2026-04-30

- Accepted `PROPOSAL` as the initial product source.
- Created project documentation foundation in `docs/`.
- Reworked project architecture docs from proposal recommendation into runtime-first extension architecture.
- Updated related requirements, contracts, extraction, privacy, testing, risks, and decisions docs.

