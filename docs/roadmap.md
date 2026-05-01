# Roadmap

Updated: 2026-05-01

This is the primary resume file for the project. Keep it current enough that work can continue without reading prior chat history.

## Current State

- The original planning brief has been incorporated into `docs/`.
- Documentation foundation exists in `docs/`.
- Architecture has been re-evaluated from the initial file tree into a runtime-first project architecture.
- Root `README.md` introduces the project.
- Milestone 1 extension skeleton has been scaffolded.
- Active version is `0.6.1` using `0.<milestone>.<patch>` from [versioning.md](versioning.md).
- MVP target is a Chrome Manifest V3 extension for exporting the current ChatGPT conversation only.
- Milestone 6 CI/CD and GitHub Release automation is implemented.

## Next Action

Implement Milestone 7 Robustness after Milestone 6 CI/CD completion:

- lock down layered selectors and validation warnings for DOM extraction drift
- add retry and progress affordances for popup/service-worker lifecycle issues
- validate popup close and service worker restart scenarios under export load
- keep user-visible warning and retry states explicit for partial failures

Milestone 1 acceptance check is implemented and ready for manual Chrome validation:

```txt
Click popup button
-> service worker validates active tab
-> content script responds with current page title and URL
-> popup displays the response
```

## Active Scope

Build a Chrome Extension that exports the currently opened ChatGPT conversation into a user-selected local folder containing:

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
- Let the user choose the export folder before writing files.
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

Status: Implemented and manually validated at basic formatting scope

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

Status: Implemented and manually validated

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

- Uploaded/generated images are resolved as local export assets where possible.
- `conversation.md` references local asset paths where possible.
- Remote fallback links include warnings.
- The extension does not expose arbitrary URL fetching.

Manual validation:

- Chrome popup reported `Messages: 104`, `Page images: 80`, `Message images: 69`, `Image candidates: 69`, and `Assets saved: 69`.
- Exported Markdown contained 69 image references and 69 `assets/...` local paths.
- Physical asset file writing is intentionally deferred to Milestone 5 Folder Export.

Relevant docs:

- [extraction-strategy.md](extraction-strategy.md)
- [data-contracts.md](data-contracts.md)
- [privacy-security.md](privacy-security.md)

### Milestone 5: Folder Export

Status: Implemented and manually validated

Deliverables:

- user-selected export folder through File System Access API
- dedicated `Choose Folder` popup control
- automatic folder picker prompt when exporting without a selected folder
- session-only selected folder handle in MVP
- folder export artifact contract
- export manifest generation
- direct writing of `conversation.md`
- direct writing of resolved assets under `assets/`
- fallback or clear unsupported-browser error when File System Access API is unavailable
- partial asset failure handling that still writes Markdown with remote fallback links
- offscreen document only if popup lifecycle proves insufficient

Acceptance:

- User chooses an export folder before exporting.
- If the user clicks export before choosing a folder, the popup asks for one.
- Extension creates `<slug>/conversation.md` in the selected folder.
- Extension creates `<slug>/assets/` when images exist.
- Written asset paths match Markdown references.
- User can open `conversation.md` locally and see resolved local images without unzipping.
- If folder permission expires, the popup asks the user to choose the folder again.

Manual validation:

- User selected `D:\SourceCode\PROJECTS\LocalGPT\output`.
- Popup reported `Messages: 104`, `Page images: 80`, `Message images: 69`, `Image candidates: 69`, and `Assets saved: 69`.
- Export created `output/manhattan-dataways-redshift-spectrum-query-setup/conversation.md`.
- Export created `output/manhattan-dataways-redshift-spectrum-query-setup/assets/` with 69 files.
- `conversation.md` contains 69 local `assets/...` image references.

Relevant docs:

- [architecture.md](architecture.md)
- [data-contracts.md](data-contracts.md)

### Milestone 6: CI/CD and GitHub Release

Status: Implemented

Deliverables:

- GitHub Actions workflow for pull requests and main branch checks
- required gates for `npm test -- --run`, `npm run typecheck`, `npm run build`, and `npm run verify:extension`
- release packaging step that produces the extension bundle artifact
- versioned release tagging based on [versioning.md](versioning.md)
- GitHub Release publication with attached extension archive and checksum file
- release notes generation from the tagged version and milestone scope
- failure reporting that blocks release publication when validation or bundle checks fail

Acceptance:

- Pull requests run the extension checks automatically.
- Main branch changes are validated by the same build/test gates.
- A tag such as `v0.6.0` or `0.6.0` produces a GitHub Release.
- The release includes the built extension artifact ready for manual install or distribution.
- Release version matches `package.json`, `manifest.json`, and `package-lock.json`.

Relevant docs:

- [versioning.md](versioning.md)
- [testing-validation.md](testing-validation.md)
- [architecture.md](architecture.md)

### Milestone 7: Robustness

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
- Extension exports a local folder tree.
- Folder contains `conversation.md`.
- Folder contains `assets/` if images exist.
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
- Implemented Milestone 3 Patch 4 to de-scope SQL rewriting: keep SQL detection/fencing, but do not rewrite SQL text.
- Closed Milestone 3 after manual validation of role balance and basic code fencing.
- Updated active Milestone 3 patch version to `0.3.4`.
- Started Milestone 4 at version `0.4.0`.
- Implemented image block extraction and `AssetCandidate` discovery from visible `img[src]` nodes.
- Added asset naming and asset resolver policy for data URLs, blob/HTTPS candidates, controlled fetch, local `assets/` paths, and remote fallback warnings.
- Updated Markdown writing to emit local image paths when resolved and remote links when fallback is required.
- Wired service-worker export orchestration to resolve assets before Markdown generation and report saved asset counts/warnings in the popup.
- Implemented Milestone 4 Patch 1 to report image candidate count separately from saved asset count in the popup, so manual validation can distinguish DOM detection gaps from asset fetch failures.
- Updated active Milestone 4 patch version to `0.4.1`.
- Implemented Milestone 4 Patch 2 to report page-level and message-level `img[src]` diagnostics in the popup, so manual validation can identify whether ChatGPT images are outside detected message containers or rendered without `img[src]`.
- Updated active Milestone 4 patch version to `0.4.2`.
- Implemented Milestone 4 Patch 3 from real ChatGPT DOM evidence.
- Fixed image extraction for uploaded images rendered inside standalone `data-message-author-role` nodes outside article turns.
- Preserved buttons that wrap `img[src]` so the extractor does not remove uploaded images before asset candidate detection.
- Updated active Milestone 4 patch version to `0.4.3`.
- Manually validated Milestone 4 Patch 3 in Chrome: popup reported 69 message images, 69 image candidates, and 69 saved assets; exported Markdown contained 69 local `assets/...` image references.
- Started Milestone 5 at version `0.5.0`.
- Implemented folder export artifact generation with `conversation.md` and resolved asset bytes.
- Replaced Markdown-only download handoff with popup-based File System Access API folder writing.
- Added `Choose Folder` popup control, automatic folder picker on export when needed, session-only folder handle, and folder export status messages.
- Added unit coverage for folder export artifact building, nested folder writing, and runtime folder export result.
- Implemented Milestone 5 Patch 1 to serialize asset bytes as JSON-safe byte arrays across Chrome runtime messaging, then normalize them back to `Uint8Array` before File System Access writes.
- Updated popup error reporting to include the original folder export error message when available.
- Updated active Milestone 5 patch version to `0.5.1`.
- Manually validated Milestone 5 Patch 1 in Chrome: folder export wrote `conversation.md` and 69 asset files to the selected `output/` directory, with Markdown references matching the written assets.
- Implemented Milestone 5 Patch 2 guided workflow popup UI: step-based folder/export layout, status pill, two-action control row, concise success metrics, and secondary diagnostics.
- Updated active Milestone 5 patch version to `0.5.2`.
- Implemented Milestone 5 Patch 3 asset progress UI with a single progress bar that shows `Resolving images`, then resets and switches to `Writing images`.
- Added progress callbacks for asset resolution and folder asset writing, plus runtime progress events from the service worker to the popup.
- Updated active Milestone 5 patch version to `0.5.3`.
- Implemented Milestone 5 Patch 4 to hide the result/info panel during active export; progress is the single active-state status surface, while result/error panels appear only for terminal states.
- Updated active Milestone 5 patch version to `0.5.4`.
- Implemented Milestone 5 Patch 5 to add bottom spacing only when the progress panel is visible, avoiding global popup padding changes.
- Updated active Milestone 5 patch version to `0.5.5`.
- Implemented Milestone 5 Patch 6 to rename product branding to ChatCargo across extension metadata, popup title, and project documentation.
- Updated active Milestone 5 patch version to `0.5.6`.
- Swapped milestone order so CI/CD and GitHub Release is Milestone 6 and Robustness is Milestone 7.
- Started Milestone 6 at version `0.6.0`.
- Implemented Milestone 6 CI/CD and release automation with GitHub Actions validation and tagged release publication.
- Implemented Milestone 6 Patch 1 to integrate ownership branding assets: `Chat.png` in popup header and `Cargo.png` as extension icons.
- Updated active Milestone 6 patch version to `0.6.1`.
