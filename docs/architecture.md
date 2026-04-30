# Architecture

Updated: 2026-05-01

This document is the project architecture source of truth. The original planning brief has been incorporated into the docs; this file records the evaluated architecture that implementation should follow.

## Architecture Summary

Build a Chrome Manifest V3 extension with a runtime-first design:

- Popup owns UI state and user interaction only.
- Content script owns ChatGPT DOM inspection only.
- Service worker owns extension orchestration, tab validation, Chrome API calls, and download handoff.
- Pure project modules own Markdown writing, folder export modeling, validation, slugging, and asset naming.
- Offscreen document is optional and introduced only if folder writing needs a document context that must outlive the popup.

The architecture avoids Playwright, login automation, backend services, cloud sync, telemetry, and broad host permissions.

## Evaluation of Initial Structure

The initial structure was directionally useful, but it mixed runtime contexts and implementation modules. The adjusted architecture keeps the same product shape while making Chrome MV3 boundaries explicit.

Accepted from the initial brief:

- Chrome Manifest V3 extension
- popup trigger
- content script on ChatGPT pages
- service worker
- TypeScript
- Vite
- modular DOM extraction
- local folder output

Changed from the initial brief:

- `export/` is not a runtime owner. It contains pure logic and wrappers that can be called by popup, service worker, or offscreen code.
- asset download is separated from DOM extraction because content scripts are subject to page-origin request constraints.
- Chrome APIs are accessed through a thin adapter to keep most code testable.
- offscreen document is documented as a conditional component, not part of the initial skeleton.
- validation and warning models are first-class architecture concerns.

Rejected for MVP:

- persistent background state
- broad `<all_urls>` host permission
- content script performing final download
- popup containing export business logic
- page-context script injection unless a future issue proves isolated-world DOM access is insufficient

## Runtime Contexts

### Popup

Role:

- render the extension popup UI
- show status and warnings
- trigger export
- display final success/failure state

Rules:

- Do not parse ChatGPT DOM.
- Do not own long-running export state.
- Do not directly depend on ChatGPT selectors.
- Keep business logic thin enough that closing the popup does not corrupt source data.

### Content Script

Role:

- run on supported ChatGPT pages
- read rendered DOM
- detect title, messages, roles, blocks, and visible asset references
- return a structured extraction result

Rules:

- Do not call `chrome.downloads`.
- Do not write final export files.
- Do not fetch arbitrary remote assets.
- Do not depend on one selector.
- Preserve unknown visible content instead of silently dropping it.

Content scripts run in an isolated world. They can read the page DOM, but they do not share JavaScript variables with the ChatGPT page. If future extraction requires page runtime objects, add an explicit page-bridge design and decision record before implementing it.

### Service Worker

Role:

- register top-level extension event listeners
- validate active tab and supported URL
- coordinate popup, content script, and optional offscreen document
- call privileged Chrome APIs such as downloads
- coordinate final folder export from an explicit export artifact

Rules:

- Do not rely on global variables for durable state.
- Do not use DOM or `window`.
- Do not register event listeners asynchronously.
- Keep long-running workflows resilient to MV3 service worker termination.
- Persist only non-sensitive operational state if absolutely needed.

### Offscreen Document

Role:

- provide a document context for operations service workers cannot perform
- handle folder writing if popup lifecycle proves insufficient

Rules:

- Not required for Milestone 1.
- Not the place for primary business logic.
- Communicates through runtime messages.
- Added only with the `offscreen` permission and a recorded decision update.

Use it when there is concrete evidence that popup-based folder writing is too fragile under MV3 lifecycle constraints.

## Project Structure

Target structure:

```txt
.
|-- manifest.json
|-- package.json
|-- vite.config.ts
|-- src/
|   |-- background/
|   |   `-- serviceWorker.ts
|   |-- popup/
|   |   |-- popup.html
|   |   |-- popup.ts
|   |   `-- popup.css
|   |-- content/
|   |   |-- content.ts
|   |   |-- extractors/
|   |   |   |-- extractConversation.ts
|   |   |   |-- extractMessage.ts
|   |   |   `-- extractBlocks.ts
|   |   |-- selectors/
|   |   |   `-- messageStrategies.ts
|   |   `-- domUtils.ts
|   |-- offscreen/
|   |   |-- offscreen.html
|   |   `-- offscreen.ts
|   |-- export/
|   |   |-- markdownWriter.ts
|   |   |-- folderExportBuilder.ts
|   |   `-- slugify.ts
|   |-- assets/
|   |   |-- assetResolver.ts
|   |   |-- assetFetcher.ts
|   |   `-- assetNamer.ts
|   |-- validation/
|   |   `-- exportValidator.ts
|   |-- domain/
|   |   |-- conversation.ts
|   |   |-- message.ts
|   |   |-- asset.ts
|   |   `-- warning.ts
|   |-- runtime/
|   |   |-- chromeApi.ts
|   |   `-- messages.ts
|   `-- shared/
|       |-- constants.ts
|       `-- logger.ts
|-- public/
|   `-- icons/
|-- docs/
`-- README.md
```

Milestone 1 may omit `offscreen/`, `assets/assetFetcher.ts`, and folder writer modules until the related feature is implemented. The boundaries should still be respected from the first scaffold.

## Dependency Direction

Allowed dependency flow:

```txt
runtime entrypoints
-> application orchestration
-> pure domain/export/validation modules
-> domain types
```

Runtime entrypoints:

- `src/popup/popup.ts`
- `src/content/content.ts`
- `src/background/serviceWorker.ts`
- `src/offscreen/offscreen.ts` if added

Pure modules:

- `src/export/*`
- `src/assets/assetNamer.ts`
- `src/validation/*`
- `src/domain/*`

Rules:

- Pure modules must not import `chrome`.
- Content extractors may use DOM APIs but must not import popup or background code.
- `runtime/chromeApi.ts` is the only planned wrapper around Chrome extension APIs.
- Domain types must not import runtime modules.

## Export Pipeline

MVP pipeline:

```txt
Popup: user clicks export
-> Service worker: validate active tab
-> Service worker: request extraction from content script
-> Content script: extract DOM into ConversationDraft
-> Service worker or document-capable runtime: build Markdown and folder export artifact
-> Validation: validate conversation, markdown, assets, warnings
-> Popup or offscreen document: write files to the user-selected folder
-> Popup: display result and warnings
```

For Milestone 2 through Milestone 4, a Markdown-only download may be used as a stepping stone, but the architecture should still model the final folder export pipeline.

## Asset Pipeline

Asset processing is split into two phases:

1. Content script records asset candidates from the DOM.
2. Extension context resolves and fetches allowed asset candidates.

The content script should return:

- source URL or data/blob URL
- DOM position
- alt text if available
- owning message/block id
- confidence/warning metadata

The asset pipeline then:

- assigns local names
- attempts blob/data conversion or controlled fetch
- records MIME type and extension
- replaces Markdown references with local paths when available
- keeps remote fallback URLs with warnings when local fetch fails

Do not allow the content script or page DOM to request arbitrary URLs through the extension. Asset fetch requests must be derived from extracted asset candidates and constrained by policy.

## Error Handling

Use structured results instead of throwing raw strings across runtime boundaries.

Expected categories:

- unsupported page
- missing content script
- no conversation detected
- low-confidence role detection
- unsupported block fallback
- asset fetch failed
- folder export generation failed
- download failed
- internal error

Errors that make the folder export unusable should block export. Partial asset failures may allow export with warnings.

## Manifest Boundary

Baseline permissions:

```json
{
  "permissions": ["activeTab", "scripting", "downloads"],
  "host_permissions": [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*"
  ]
}
```

Do not add `<all_urls>` for MVP.

Add `offscreen` only if the offscreen document is implemented.

## External References

- Chrome content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- Chrome cross-origin network requests: https://developer.chrome.com/docs/extensions/develop/concepts/network-requests
- Chrome MV3 service worker migration: https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
- Chrome offscreen documents: https://developer.chrome.com/blog/Offscreen-Documents-in-Manifest-v3
- Chrome downloads API: https://developer.chrome.com/docs/extensions/reference/api/downloads
