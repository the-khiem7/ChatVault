# Roadmap

Updated: 2026-04-30

This is the primary resume file for the project. Keep it current enough that work can continue without reading prior chat history.

## Current State

- The original planning brief has been incorporated into `docs/`.
- Documentation foundation exists in `docs/`.
- Architecture has been re-evaluated from the initial file tree into a runtime-first project architecture.
- Root `README.md` introduces the project.
- Milestone 1 extension skeleton has been scaffolded.
- Active version is `0.3.3` using `0.<milestone>.<patch>` from [versioning.md](versioning.md).
- MVP target is a Chrome Manifest V3 extension for exporting the current ChatGPT conversation only.

## Next Action

Continue Milestone 3 using the runtime-first architecture:

- code block extraction with fenced Markdown
- list extraction
- table extraction
- quote extraction
- unknown block fallback
- basic fallback HTML-to-Markdown conversion if needed

Milestone 1 acceptance check is implemented and ready for manual Chrome validation:

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

Status: Implemented and manually validated

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

Status: Implemented and manually validated

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

Status: In progress

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

- Incorporated the initial planning brief into durable docs.
- Created project documentation foundation in `docs/`.
- Reworked project architecture docs from initial recommendation into runtime-first extension architecture.
- Updated related requirements, contracts, extraction, privacy, testing, risks, and decisions docs.
- Removed the obsolete planning brief file and added root `README.md`.
- Scaffolded Milestone 1 Chrome MV3 extension skeleton.
- Added Vite, TypeScript, Vitest, unit tests, manifest, popup, service worker, content script, Chrome API adapter, URL support, and page summary extraction.
- Verified with `npm test -- --run`, `npm run typecheck`, and `npm run build`.
- Fixed content script bundle validation after manual Chrome test showed `CONTENT_SCRIPT_UNAVAILABLE`.
- Added `npm run verify:extension` to ensure manifest-declared content script output has no top-level `import` or `export`.
- Added service worker fallback injection for already-open supported tabs where the content script listener is not present yet.
- Manually validated Milestone 1 popup -> service worker -> content script page title and URL flow in Chrome.
- Implemented Milestone 2 basic text export with `ConversationDraft` extraction, Markdown writer, slugged `.md` filename, service-worker download orchestration, and popup success/warning display.
- Added unit coverage for DOM extraction, Markdown writing, and export orchestration.
- Verified Milestone 2 with `npm test -- --run`, `npm run typecheck`, `npm run build`, and `npm run verify:extension`.
- Added milestone-based versioning rule: every code change updates version as `0.<milestone>.<patch>`.
- Updated active Milestone 2 patch version to `0.2.2`.
- Implemented Milestone 2 Patch 3 after manual export review.
- Fixed ChatGPT message extraction to use article turns as message boundaries and read user/assistant roles from nested role nodes.
- Updated Markdown contract so User/Assistant role headings are H1 and conversation/content headings are H2 or lower.
- Updated active Milestone 2 patch version to `0.2.3`.
- Implemented Milestone 2 Patch 4 to merge adjacent same-role chunks that ChatGPT exposes as separate article nodes.
- Updated active Milestone 2 patch version to `0.2.4`.
- Closed Milestone 2 after manual validation showed balanced User/Assistant turns and no consecutive same-role split.
- Started Milestone 3 Patch 1 with code block extraction and fenced Markdown writing.
- Updated active Milestone 3 patch version to `0.3.1`.
- Implemented Milestone 3 Patch 2 with SQL-like paragraph fencing and keyword line break normalization.
- Updated active Milestone 3 patch version to `0.3.2`.
- Implemented Milestone 3 Patch 3 with SQL detection and normalization inside unlabeled code blocks.
- Updated active Milestone 3 patch version to `0.3.3`.
