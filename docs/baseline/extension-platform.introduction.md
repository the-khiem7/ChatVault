# Extension Platform Baseline

Updated: 2026-05-15

## Topic

Evolve ChatCargo from a Chrome-only ChatGPT exporter into a matrix-first extension platform that remains one codebase while becoming poly-browser and multi-provider ready.

## Business Target

- Keep one shared codebase.
- Support browser-specific outputs instead of browser-specific repos.
- Preserve the current ChatGPT export path while preparing the next provider integration for Gemini.
- Keep local-first export behavior and lossless content handling.

## Observed Current Codebase

- Runtime folders still reflect the earlier Chrome-first implementation: `src/background`, `src/content`, `src/popup`, `src/runtime`, `src/export`, `src/assets`, `src/domain`, `src/shared`.
- Current implementation is still centered on ChatGPT extraction and popup-driven folder export.
- Current docs pack in `docs/` still contains several Chrome-only statements that are now narrower than the accepted platform direction.

## Current Snapshot

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

## Accepted Direction

- Strategy: matrix-first architecture.
- Browser rollout phase: `Chrome`, `Firefox`.
- Provider rollout phase: `ChatGPT` now, `Gemini` next.
- Organization model: layered modular monolith.
- Top-level target boundaries:
  - `src/app`
  - `src/core`
  - `src/platform/browser`
  - `src/platform/provider`
  - `src/shared`

## Key Implementation Rules

- Shared source, browser-specific manifests/builds.
- Browser save behavior must be capability-aware, not browser-name hard-coded.
- Full provider registry is required now; do not defer it.
- `platform/browser` and `platform/provider` remain isolated from each other.
- `core` owns normalized export orchestration only.

## Documentation Scope

This baseline pack records the accepted target state, the current implementation gap, and the next resumable actions for migration from the existing Chrome-first codebase.

## Cold Start Resume

Use this baseline pack as the primary source of truth when resuming without chat history.

Resume order:

1. `docs/baseline/extension-platform.introduction.md`
2. `docs/baseline/extension-platform.roadmap.md`
3. `docs/baseline/extension-platform.sourcecode.md`
4. `docs/baseline/extension-platform.hallucination.md`
5. `docs/baseline/extension-platform.useguide.md`

Then inspect these implementation files first:

- `src/platform/provider/providerRegistry.ts`
- `src/content/extractors/extractGeminiConversation.ts`
- `src/content/extractors/providerExtractors.ts`
- `src/app/exportCurrentChatApp.ts`
- `src/core/buildExportArtifact.ts`
- `src/platform/browser/manifest.ts`

Assume no prior memory beyond what is written in this pack.
