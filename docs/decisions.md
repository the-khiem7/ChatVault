# Decisions

Updated: 2026-05-15

Record important decisions here so future work can continue without relying on chat history.

## ADR-001: Build a Chrome Extension Instead of a Playwright Crawler

Status: Accepted

Context:

The previous Playwright-based direction had a session-access blocker. ChatGPT login, 2FA, cookie transfer, and automation detection make an external crawler fragile.

Decision:

Build a Chrome Manifest V3 extension that runs inside the user's real browser session and extracts the rendered ChatGPT DOM.

Consequences:

- avoids login automation
- avoids cookie transfer
- uses the authenticated browser session already available to the user
- requires robust DOM extraction because ChatGPT markup can change

## ADR-002: MVP Exports Only the Current ChatGPT Conversation

Status: Accepted

Context:

Bulk export and multi-platform support are valuable but would increase permissions, complexity, and surface area.

Decision:

MVP supports only the currently opened ChatGPT conversation.

Consequences:

- smaller permission set
- simpler user flow
- faster path to a working product
- future bulk export must be designed separately

## ADR-003: Local-First and No External Server

Status: Accepted

Context:

The extension reads private conversation content. Sending data to a server would create privacy and trust concerns.

Decision:

All processing happens locally in the browser. MVP must not use an external server, telemetry, analytics, cloud sync, or API upload.

Consequences:

- user data stays local
- implementation must handle folder export and asset processing client-side
- debugging logs must avoid leaking full conversation content

## ADR-004: ZIP Is the Primary Export Format

Status: Superseded by ADR-010

Context:

Conversations may include images and attachments. Downloading multiple files independently creates poor UX and can break relative paths.

Decision:

MVP exports a single ZIP containing `conversation.md` and `assets/`.

Consequences:

- JSZip or equivalent is needed
- validation must ensure Markdown asset references match ZIP contents
- final download can use Chrome downloads API

## ADR-005: Use Runtime-First Extension Architecture

Status: Accepted

Context:

The initial file structure was a recommendation, not an evaluated project architecture. Chrome MV3 has distinct runtime contexts with different capabilities and lifecycle rules.

Decision:

Define architecture by runtime ownership first:

- popup owns UI only
- content script owns DOM extraction only
- service worker owns orchestration and privileged Chrome APIs
- pure modules own export, archive, validation, and domain transformations
- offscreen document is conditional

Consequences:

- fewer hidden MV3 lifecycle bugs
- better unit-test coverage for pure logic
- clearer permission and security boundaries
- slightly more upfront structure than the initial simple tree

## ADR-006: Defer Offscreen Document Until Needed

Status: Accepted

Context:

Offscreen documents can provide DOM/window APIs that service workers lack, but adding them increases permissions and runtime complexity.

Decision:

Do not scaffold offscreen document in Milestone 1. Add it only when export writing demonstrates a concrete need.

Consequences:

- MVP skeleton stays lean
- `offscreen` permission is not requested prematurely
- architecture already reserves a place for offscreen if needed later

## ADR-007: Split Asset Discovery From Asset Fetching

Status: Accepted

Context:

The content script can inspect visible DOM, but cross-origin asset fetching and privileged downloads should not be controlled directly by page data.

Decision:

Content script produces asset candidates. Extension runtime resolves and fetches candidates under explicit policy.

Consequences:

- asset pipeline is safer
- content script is easier to test
- remote fallback warnings become part of the export contract
- broad host permissions are not required for MVP

## ADR-008: Wrap Chrome APIs Behind Runtime Adapters

Status: Accepted

Context:

Direct `chrome` imports throughout the codebase would make unit testing difficult and blur runtime boundaries.

Decision:

Use a thin runtime adapter such as `src/runtime/chromeApi.ts` for Chrome extension APIs.

Consequences:

- pure modules remain testable
- runtime API usage is easier to audit
- integration tests can mock extension APIs more easily

## ADR-009: Use Milestone-Based Pre-1.0 Versioning

Status: Accepted

Context:

The project is progressing through explicit implementation milestones. Version numbers should make the active milestone and patch count visible in both the extension manifest and package metadata.

Decision:

Use `0.<milestone>.<patch>` versions until the project reaches a stable 1.0 release. Every code change increments the version. When moving to a new milestone, reset patch to `0` for that milestone. Keep `package.json`, `package-lock.json`, and `manifest.json` synchronized.

Consequences:

- reviewers can infer active milestone from the version
- Chrome extension builds expose the same version as package metadata
- documentation and release tracking stay aligned with milestone progress
- every future code patch must include a version bump

## ADR-010: Folder Export Replaces ZIP as Primary Format

Status: Accepted

Context:

The ZIP-first design preserved relative Markdown asset paths, but it adds friction for the target workflows. Users exporting to Obsidian, Git repositories, local knowledge bases, or RAG staging folders want `conversation.md` and `assets/` available immediately without unzipping after every export. The Milestone 4 asset pipeline already models local asset paths and bytes, so the remaining output problem is writing a file tree rather than packaging it.

Decision:

MVP primary output is a user-selected local folder tree written through the File System Access API:

```txt
<conversation-slug>/
|-- conversation.md
`-- assets/
    |-- 001.png
    `-- ...
```

ZIP export is removed from the MVP default path. It may return later as an optional fallback or alternate export format, but Milestone 5 implements direct folder export.

Consequences:

- users do not need to unzip exports
- Markdown local image paths work immediately after export
- Chrome remains the primary MVP browser target because File System Access API is Chromium-oriented
- `showDirectoryPicker()` must run in a document-capable context, not in the service worker
- service worker remains the orchestrator, while popup or an offscreen/document context owns folder selection and file writing
- validation must ensure written files match Markdown references
- unsupported browsers must show a clear fallback or unsupported-browser state

## ADR-011: Adopt Matrix-First Platform Direction

Status: Accepted

Context:

The project outgrew the earlier single-browser and single-provider framing. Firefox is the immediate browser expansion and Gemini is the immediate provider expansion.

Decision:

Adopt a matrix-first architecture that is poly-browser and multi-provider ready from the current phase onward.

Consequences:

- roadmap and docs must stop presenting the product as Chrome-only
- architecture must separate browser concerns from provider concerns
- upcoming features should land against reusable contracts, not one-off integrations

## ADR-012: Keep One Codebase With Browser-Specific Outputs

Status: Accepted

Context:

Poly-browser support introduced a choice between separate repos and shared-source multi-build delivery.

Decision:

Keep one codebase with shared source and browser-specific manifests/build/package/release outputs.

Consequences:

- avoids repo duplication
- keeps product logic unified
- build and release tooling become browser-aware

## ADR-013: Firefox Uses Packaged Download Export

Status: Accepted

Context:

Chrome direct folder export does not need to define Firefox persistence behavior.

Decision:

Keep `Chrome` direct folder export, but use packaged download export for `Firefox`.

Consequences:

- save behavior must be capability-aware
- browser persistence cannot be hard-coded purely by browser name
- normalized export artifact becomes the correct handoff object

## ADR-014: Introduce Full Provider Registry Now

Status: Accepted

Context:

`Gemini` is the immediate next provider after the poly-browser phase. Manual temporary wiring would create avoidable rework.

Decision:

Introduce the full provider registry now instead of deferred registry or manual wiring.

Consequences:

- provider resolution moves into a formal registry/resolver layer
- extractors can scale without reworking orchestration shape
- current ChatGPT path must fit the same contract as future providers

## ADR-015: Use Layered Modular Monolith Boundaries

Status: Accepted

Context:

The project needs stronger boundaries, but not the operational overhead of separate repos, internal packages, or a plugin platform.

Decision:

Use a layered modular monolith with target boundaries `src/app`, `src/core`, `src/platform/browser`, `src/platform/provider`, and `src/shared`.

Consequences:

- import rules become explicit
- migration can proceed incrementally inside one repo
- browser/provider isolation is enforced without packaging overhead

## ADR-016: Standardize On Ports, Registries, Strategies, Resolvers, And Normalized DTOs

Status: Accepted

Context:

The platform direction needs stable patterns for future providers and browsers.

Decision:

Use Hexagonal / Ports & Adapters, Registry, Strategy, Factory / Resolver, and normalized DTO boundaries as the default platform patterns.

Consequences:

- provider extraction, core export building, and browser persistence stay decoupled
- runtime orchestration becomes easier to test and migrate
- implementation reviews can judge changes against explicit pattern expectations
