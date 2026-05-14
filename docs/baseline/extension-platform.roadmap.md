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

## Current Status

In Progress

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

### In Progress

- Slice 3 provider-layer extraction.
- Insert provider registry layer ahead of multi-provider extraction.
- Preserve current ChatGPT extraction while shifting ownership into platform/provider.

### Pending

- Define concrete build layout for per-browser manifests and packaging.
- Refactor current `src/runtime` orchestration into `src/app` + `src/platform/*` boundaries.
- Convert current extraction result and folder export contracts into normalized draft/artifact contracts.
- Add `Gemini` provider implementation after browser foundation lands.

## Risks

- Existing source tree still reflects earlier architecture; migration must avoid breaking current Chrome flow.
- Current docs can drift again unless architecture changes keep updating both `docs/` and `docs/baseline/`.

## Next Resume Step

Move current ChatGPT extraction behind `ProviderExtractor` and a concrete `ProviderRegistry`, while keeping the runtime export happy path stable.
