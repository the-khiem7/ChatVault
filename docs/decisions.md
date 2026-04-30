# Decisions

Updated: 2026-04-30

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
- implementation must handle ZIP and asset processing client-side
- debugging logs must avoid leaking full conversation content

## ADR-004: ZIP Is the Primary Export Format

Status: Accepted

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

Do not scaffold offscreen document in Milestone 1. Add it only when ZIP/blob/download implementation demonstrates a concrete need.

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
