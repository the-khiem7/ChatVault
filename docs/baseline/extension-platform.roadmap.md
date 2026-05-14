# Extension Platform Roadmap

Updated: 2026-05-15

## Topic

Extension platform migration: Chrome-first ChatGPT exporter -> matrix-first poly-browser + multi-provider-ready architecture.

## Business Target

Ship one codebase that can output browser-specific extension builds, keep `Chrome` direct folder export, add `Firefox` packaged download export, and prepare immediate follow-up provider work for `Gemini` without re-architecting again.

## Docs Pack

- `docs/baseline/extension-platform.introduction.md`
- `docs/baseline/extension-platform.roadmap.md`
- `docs/baseline/extension-platform.hallucination.md`
- `docs/baseline/extension-platform.sourcecode.md`
- `docs/baseline/extension-platform.useguide.md`

## Resume Contract

This file must be sufficient for a new agent to continue work without prior conversation memory.

When resuming:

- trust this file over old chat context
- use the baseline pack before scanning broad repo history
- treat stale docs as bugs and update them in the same change set as code
- preserve current `Chrome` and `Firefox` build outputs while changing provider behavior

Current high-priority implementation files:

- `src/platform/provider/providerRegistry.ts`
- `src/runtime/exportCurrentChat.ts`
- `src/content/extractors/extractGeminiConversation.ts`
- `src/content/extractors/providerExtractors.ts`
- `src/content/content.ts`
- `src/platform/browser/manifest.ts`

## Current Status

In Progress

## Status Snapshot

### Done

- app/core/platform migration slices are implemented at the ownership/runtime level.
- browser build split is implemented for `Chrome` and `Firefox`.
- provider registry is implemented for `ChatGPT` and `Gemini`.
- core export artifact flow and app orchestration are implemented.

### In Progress

- Gemini extraction hardening.
- provider-specific fixture coverage.
- UX progress alignment against the expanded runtime progress model.

### Risk

- Gemini DOM drift remains the main functional risk.
- source tree ownership has migrated, but the physical folder re-layout is not complete.
- manual real-page validation for Gemini is not yet recorded in the docs pack.

### Next

- add Gemini edge-case tests and DOM rules
- run manual validation on `gemini.google.com`
- then decide whether physical cleanup/re-layout should happen next

## Scope

- Establish platform architecture + boundaries.
- Normalize export contracts around artifact-based saving.
- Introduce browser capability + save strategy abstraction.
- Introduce provider registry + provider extractor contracts.
- Keep one repo and shared sources.

## Out of Scope

- Splitting into multiple repos.
- Internal package architecture migration now.
- External plugin platform.
- Additional providers beyond `ChatGPT` and immediate `Gemini` preparation.

## Task Tracker

### Done

- Consolidated accepted architecture decisions into primary docs: `docs/architecture.md`, `docs/data-contracts.md`, `docs/roadmap.md`, `docs/product-requirements.md`, `docs/decisions.md`.
- Created durable baseline pack under `docs/baseline/extension-platform.*`.
- Closed previously noted Firefox/platform risks in decision history.
- Implemented Slice 1 contract scaffold in code: browser/provider/core contract modules and legacy normalization adapters.
- Implemented Slice 2 browser-layer extraction in code: current Chrome folder export now runs through capability-aware save strategy resolution.
- Implemented Slice 3 provider-layer extraction in code: current ChatGPT export now resolves through a provider registry and provider extractor path.
- Implemented Slice 4 core export normalization in code: export-building now routes through a `src/core` normalized artifact builder.
- Implemented Slice 5 app orchestration migration in code: background/runtime export now routes through `src/app` orchestration.
- Implemented Slice 6 browser build split in code: browser-specific manifest generation and build outputs now exist for `Chrome` and `Firefox`.
- Implemented Slice 7 Gemini provider add in code: provider registry now resolves `ChatGPT` and `Gemini`, and extension host permissions include Gemini.
- Added provider-specific Gemini DOM extraction rules and tests; Gemini no longer depends purely on the shared extractor wrapper path.

Evidence:

- Files changed:
  - `docs/architecture.md`
  - `docs/data-contracts.md`
  - `docs/roadmap.md`
  - `docs/product-requirements.md`
  - `docs/decisions.md`
  - `docs/baseline/extension-platform.introduction.md`
  - `docs/baseline/extension-platform.roadmap.md`
  - `docs/baseline/extension-platform.hallucination.md`
  - `docs/baseline/extension-platform.sourcecode.md`
  - `docs/baseline/extension-platform.useguide.md`
- Verification:
  - doc sync against current `src/` layout
  - code graph architecture snapshot reviewed for current structure
  - `npm test -- src/app/contracts/legacyAdapters.test.ts`
  - `npm run typecheck`
  - `npm test -- src/platform/browser/saveStrategies.test.ts src/popup/folderWriter.test.ts src/app/contracts/legacyAdapters.test.ts`
  - `npm test -- src/platform/provider/chatgptRegistry.test.ts src/runtime/exportCurrentChat.test.ts src/platform/browser/saveStrategies.test.ts`
  - `npm test -- src/core/buildExportArtifact.test.ts src/runtime/exportCurrentChat.test.ts src/platform/provider/chatgptRegistry.test.ts`
  - `npm test -- src/app/exportCurrentChatApp.test.ts src/runtime/exportCurrentChat.test.ts src/core/buildExportArtifact.test.ts`
  - `npm test -- src/platform/browser/manifest.test.ts`
  - `npm run build:chrome`
  - `npm run verify:extension:chrome`
  - `npm run build:firefox`
  - `npm run verify:extension:firefox`
  - `npm test -- src/platform/provider/providerRegistry.test.ts src/runtime/exportCurrentChat.test.ts src/platform/browser/manifest.test.ts`
  - `npm test -- src/content/extractors/providerExtractors.test.ts src/platform/provider/providerRegistry.test.ts src/runtime/exportCurrentChat.test.ts`
  - `npm test -- src/content/extractors/extractGeminiConversation.test.ts src/content/extractors/providerExtractors.test.ts src/runtime/exportCurrentChat.test.ts`

### In Progress

- Post-slice hardening for multi-provider extraction quality.
- Preserve registry-driven provider ownership.
- Keep browser-layer untouched while improving provider-specific behavior.

### Pending

- Define concrete build layout for per-browser manifests and packaging.
- Refactor current `src/runtime` orchestration into `src/app` + `src/platform/*` boundaries.
- Convert current extraction result and folder export contracts into normalized draft/artifact contracts.
- Add `Gemini` provider implementation after browser foundation lands.

## Risks

- Existing source tree still reflects earlier architecture; migration must avoid breaking current Chrome flow.
- Current docs can drift again unless architecture changes keep updating both `docs/` and `docs/baseline/`.

## Next Resume Step

Add Gemini-specific fixtures for images, multi-paragraph model output, and container drift detection.

## Exact Next Task

Implement the next Gemini hardening slice with this order:

1. add failing tests in `src/content/extractors/extractGeminiConversation.test.ts`
2. extend `src/content/extractors/extractGeminiConversation.ts`
3. run targeted tests
4. run `npm run typecheck`
5. run browser build + verify commands
6. sync `docs/roadmap.md` and this baseline roadmap

Suggested verification commands:

- `npm test -- src/content/extractors/extractGeminiConversation.test.ts src/content/extractors/providerExtractors.test.ts src/runtime/exportCurrentChat.test.ts`
- `npm run typecheck`
- `npm run build:chrome`
- `npm run verify:extension:chrome`
- `npm run build:firefox`
- `npm run verify:extension:firefox`
