# ChatGPT Markdown Exporter

ChatGPT Markdown Exporter is a privacy-first Chrome Manifest V3 extension for exporting the currently opened ChatGPT conversation into a local Markdown archive.

The project exists because external browser automation is fragile for ChatGPT export: authenticated sessions, 2FA, bot detection, and cookie transfer make Playwright-style crawling unreliable. This extension runs inside the user's real Chrome session and extracts the already-rendered conversation DOM.

## Goal

Export the current ChatGPT conversation as a portable local archive:

```txt
<conversation-slug>/
|-- conversation.md
`-- assets/
    |-- 001.png
    |-- 002.jpg
    `-- ...
```

The exported archive is intended for:

- Obsidian
- Git repositories
- local knowledge bases
- RAG ingestion
- long-term personal archives

## Product Principles

- Preserve original message content and ordering.
- Preserve user and assistant roles.
- Preserve code blocks, lists, tables, quotes, and images as much as possible.
- Do not summarize, rewrite, or clean up the conversation.
- Do all processing locally in the browser.
- Do not use an external server, telemetry, analytics, or cloud sync.

## MVP Scope

The MVP targets only the currently opened ChatGPT conversation on desktop Chrome.

In scope:

- Chrome Manifest V3 extension
- popup-triggered export
- ChatGPT DOM extraction through a content script
- Markdown generation
- local asset handling where browser policy allows
- ZIP archive output
- warnings for partial export issues

Out of scope for MVP:

- bulk export
- RAG embedding
- Git auto commit
- cloud sync
- Obsidian plugin
- cross-browser support
- multi-platform AI chat support
- Playwright crawler
- backend server
- OpenAI API integration

## Architecture

The project uses a runtime-first Chrome extension architecture:

- `popup`: UI state and user interaction only
- `content`: ChatGPT DOM extraction only
- `background/serviceWorker`: orchestration, active tab validation, Chrome API calls, and download handoff
- `export`, `assets`, `validation`, `domain`: testable project logic
- `offscreen`: conditional future runtime component, added only if ZIP/blob/download behavior requires it

See [docs/architecture.md](docs/architecture.md) for the authoritative project architecture.

## Current Status

The project is in the documentation and architecture phase. Extension source code has not been scaffolded yet.

Next implementation step:

```txt
Scaffold Milestone 1:
popup -> service worker -> content script message flow
```

See [docs/roadmap.md](docs/roadmap.md) for the current resume point.

## Documentation

The `docs/` folder is the durable project memory:

- [docs/roadmap.md](docs/roadmap.md): progress, milestones, and next action
- [docs/product-requirements.md](docs/product-requirements.md): scope and acceptance criteria
- [docs/architecture.md](docs/architecture.md): runtime architecture and module boundaries
- [docs/data-contracts.md](docs/data-contracts.md): domain types, runtime messages, and archive contract
- [docs/extraction-strategy.md](docs/extraction-strategy.md): ChatGPT DOM extraction strategy
- [docs/privacy-security.md](docs/privacy-security.md): privacy and permission boundaries
- [docs/testing-validation.md](docs/testing-validation.md): test strategy and validation checklist
- [docs/risks.md](docs/risks.md): risks and mitigations
- [docs/decisions.md](docs/decisions.md): architecture decision log

## Development

Planned stack:

- TypeScript
- Vite
- Chrome Extension Manifest V3
- JSZip
- custom DOM extraction and Markdown writer

Implementation should follow the runtime boundaries in [docs/architecture.md](docs/architecture.md) and update [docs/roadmap.md](docs/roadmap.md) after each meaningful step.

