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

## Documentation Map

- [roadmap.md](roadmap.md): source of truth for progress, milestones, current state, and resume instructions.
- [product-requirements.md](product-requirements.md): goals, MVP scope, non-goals, user flow, and acceptance criteria.
- [architecture.md](architecture.md): extension structure, module responsibilities, data flow, and Chrome MV3 boundaries.
- [data-contracts.md](data-contracts.md): TypeScript domain types, markdown output format, ZIP layout, and validation contract.
- [extraction-strategy.md](extraction-strategy.md): DOM extraction strategy, block parsing rules, asset handling, and fallback order.
- [privacy-security.md](privacy-security.md): privacy rules, permission boundaries, and local-first constraints.
- [testing-validation.md](testing-validation.md): verification checklist, test scenarios, manual QA, and MVP definition of done.
- [risks.md](risks.md): known risks, mitigations, and open questions.
- [decisions.md](decisions.md): architectural decision log.

## Resume Protocol

When resuming this project:

1. Read [roadmap.md](roadmap.md) first.
2. Check the "Current State" and "Next Action" sections.
3. Read only the relevant detail docs listed under the active milestone.
4. Update [roadmap.md](roadmap.md) after every meaningful implementation step.
5. Record irreversible or important technical choices in [decisions.md](decisions.md).

