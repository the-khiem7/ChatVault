# Project Documentation

Updated: 2026-04-30

This folder is the durable working memory for the project. It should contain enough context for a developer or agent to resume work without relying on previous chat history.

## Project

ChatGPT Markdown Exporter is a privacy-first Chrome Manifest V3 extension that exports the currently opened ChatGPT conversation into a local ZIP archive.

The archive contains:

```txt
<conversation-slug>/
|-- conversation.md
`-- assets/
    |-- 001.png
    |-- 002.jpg
    `-- ...
```

The core product principle is lossless export:

- Preserve original content and ordering.
- Preserve user and assistant roles.
- Preserve code blocks, tables, lists, markdown-like formatting, and images as much as possible.
- Do not summarize, rewrite, or omit conversation content.
- Do all processing locally in the browser.

## Architecture Status

The original planning brief has been incorporated into this documentation set. The accepted project architecture is [architecture.md](architecture.md).

Key architectural decision:

- runtime-first Chrome MV3 architecture
- popup is UI only
- content script is DOM extraction only
- service worker orchestrates Chrome APIs and download handoff
- export, asset naming, validation, and domain logic stay testable as pure modules
- offscreen document is conditional, not part of the initial skeleton

## Documentation Map

- [roadmap.md](roadmap.md): source of truth for progress, milestones, current state, and resume instructions.
- [product-requirements.md](product-requirements.md): goals, MVP scope, non-goals, user flow, acceptance criteria, and architecture constraints.
- [architecture.md](architecture.md): evaluated project architecture, runtime boundaries, module ownership, data flow, and Chrome MV3 constraints.
- [data-contracts.md](data-contracts.md): TypeScript domain types, runtime messages, archive artifact, markdown format, ZIP layout, and validation contract.
- [extraction-strategy.md](extraction-strategy.md): DOM extraction strategy, block parsing rules, asset candidate detection, and fallback order.
- [privacy-security.md](privacy-security.md): privacy rules, permission boundaries, runtime trust boundary, and local-first constraints.
- [testing-validation.md](testing-validation.md): architecture boundary checks, test scenarios, manual QA, and MVP definition of done.
- [risks.md](risks.md): known risks, mitigations, and open questions.
- [decisions.md](decisions.md): architectural decision log.

## Resume Protocol

When resuming this project:

1. Read [roadmap.md](roadmap.md) first.
2. Check the "Current State" and "Next Action" sections.
3. Read [architecture.md](architecture.md) before scaffolding or moving code between runtime contexts.
4. Read only the relevant detail docs listed under the active milestone.
5. Update [roadmap.md](roadmap.md) after every meaningful implementation step.
6. Record irreversible or important technical choices in [decisions.md](decisions.md).
