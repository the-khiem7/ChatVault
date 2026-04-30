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

