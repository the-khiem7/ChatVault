# Extension Platform Implementation Plan

Updated: 2026-05-15

## Purpose

This file is the execution plan for migrating ChatCargo from the current Chrome-first ChatGPT exporter into the accepted matrix-first platform architecture without breaking the existing `Chrome + ChatGPT` flow.

## Preconditions

The following are already decided and should not be re-opened during implementation unless business requirements change:

- one codebase
- browser-specific build outputs
- `Chrome` direct folder export
- `Firefox` packaged download export
- full provider registry now
- layered modular monolith
- target boundaries: `src/app`, `src/core`, `src/platform/browser`, `src/platform/provider`, `src/shared`

## Implementation Strategy

Use incremental migration slices.

Rules:

- keep current behavior working after each slice
- prefer adapters/shims before big moves
- move contracts before moving implementations
- preserve tests where possible
- avoid mixing browser and provider concerns in the same new module

## Slice 0: Inventory And Mapping

Status: Ready

Goal:

Map the current source tree into the target architecture before moving code.

Tasks:

- map `src/background` -> target `src/app` ownership
- map `src/runtime` -> split into `src/app` orchestration and `src/platform/browser` adapters
- map `src/content` -> split into provider runtime + provider extractor ownership
- map `src/export` and `src/assets` -> target `src/core`
- map `src/domain` -> target `src/core` or `src/shared`
- map `src/shared` -> keep in `src/shared`
- identify all imports that would violate target dependency rules

Deliverable:

- source mapping table
- dependency violation list
- proposed move order

Suggested output artifact:

- append mapping notes into `docs/baseline/extension-platform.sourcecode.md`

## Slice 1: Contract First Scaffold

Status: Implemented

Goal:

Introduce exact TypeScript contracts for browser, provider, and normalized export boundaries without changing runtime behavior yet.

Tasks:

- create browser contracts:
  - `BrowserApi`
  - `BrowserCapabilities`
  - `SaveStrategy`
  - `SaveContext`
  - `SaveResult`
- create provider contracts:
  - `ProviderId`
  - `ProviderDefinition`
  - `ProviderRegistry`
  - `ProviderExtractor`
- create normalized contracts:
  - `NormalizedPageSummary`
  - `NormalizedConversationDraft`
  - `NormalizedExportArtifact`
  - `ExportProgress`
  - `ProviderStatus`
- define failure-code unions aligned with accepted failure boundaries
- define progress-state union aligned with accepted progress model

Constraints:

- no browser-specific or provider-specific logic in contract files
- no filesystem or DOM behavior in normalized contracts
- allow temporary translation from current `ConversationDraft` / `ConversationExport` shapes

Deliverable:

- new contract/type files
- zero or minimal runtime behavior change
- implemented files:
  - `src/core/contracts.ts`
  - `src/platform/browser/contracts.ts`
  - `src/platform/provider/contracts.ts`
  - `src/app/contracts/legacyAdapters.ts`
  - `src/app/contracts/legacyAdapters.test.ts`

## Slice 2: Browser Layer Extraction

Status: Implemented

Goal:

Isolate browser-specific behavior from current orchestration and popup save flow.

Tasks:

- wrap current Chrome extension operations behind `BrowserApi`
- expose `BrowserCapabilities` for direct folder write vs packaged download support
- refactor current folder-writing code into a `SaveStrategy`
- keep current Chrome folder export as `ChromeDirectFolderSaveStrategy`
- define a placeholder `FirefoxPackagedDownloadSaveStrategy` contract/stub
- move browser decision logic from browser-name branching to capability checks

Constraints:

- browser save layer must not parse provider DOM
- save strategy must accept normalized artifact input
- popup may choose strategy, but strategy resolution must stay reusable

Deliverable:

- Chrome flow still works through strategy abstraction
- Firefox path may still be stubbed, but contract-complete
- implemented files:
  - `src/platform/browser/saveStrategies.ts`
  - `src/platform/browser/saveStrategies.test.ts`
  - `src/popup/popup.ts`

## Slice 3: Provider Layer Extraction

Status: Implemented

Goal:

Introduce provider registry and provider-specific extraction boundaries while preserving current ChatGPT extraction.

Tasks:

- define `ChatGPT` as first `ProviderDefinition`
- move current content extraction behind `ProviderExtractor`
- introduce `ProviderRegistry` with at least one registered provider
- move provider detection/resolution into background/app orchestration
- ensure popup no longer owns provider detection logic
- return `NormalizedConversationDraft` from provider extraction path

Constraints:

- provider layer must not perform final save/persistence
- browser layer must not import provider layer directly
- ChatGPT selectors remain inside provider-owned modules only

Deliverable:

- current ChatGPT extraction runs through registry/resolver path
- Gemini can be added later without orchestration redesign
- implemented files:
  - `src/platform/provider/chatgptRegistry.ts`
  - `src/platform/provider/chatgptRegistry.test.ts`
  - `src/runtime/exportCurrentChat.ts`
  - `src/runtime/exportCurrentChat.test.ts`

## Slice 4: Core Export Normalization

Status: Ready

Goal:

Make `src/core` the pure export orchestrator that transforms normalized draft input into normalized export artifact output.

Tasks:

- adapt current markdown writer, asset naming, asset resolution, slugging, validation into `src/core`
- convert current `ConversationDraft`/`ConversationExport` pipeline into normalized pipeline
- define translation layer from current shapes where immediate full replacement is risky
- make core return `NormalizedExportArtifact`
- keep temporary `FolderExportResult` only as migration detail if still needed

Constraints:

- `core` imports only `shared`
- `core` stays free of browser APIs and provider DOM details
- asset resolution failures map to accepted core/runtime failure codes clearly

Deliverable:

- pure normalized export pipeline
- stable handoff object for all save strategies

## Slice 5: App Orchestration Migration

Status: Ready

Goal:

Make background/service-worker orchestration align with the accepted runtime flow.

Tasks:

- move orchestration entrypoints toward `src/app`
- background resolves provider
- provider extractor returns normalized draft
- core builds artifact
- popup receives progress updates and final artifact/save result
- align progress reporting with:
  - `detecting-provider`
  - `extracting-content`
  - `resolving-assets`
  - `building-artifact`
  - `saving-artifact`
- align error mapping with accepted failure boundary model

Constraints:

- popup remains UX orchestrator, not provider detector
- background remains application orchestrator
- content/provider runtime remains execution host only

Deliverable:

- runtime flow matches architecture docs
- progress/error UI grounded on stable contracts

## Slice 6: Browser Build Split

Status: Pending

Goal:

Split build outputs by browser while keeping shared source unified.

Tasks:

- define shared manifest base vs browser overrides
- define build/package commands for `Chrome` and `Firefox`
- define packaged artifact output for Firefox
- verify release pipeline can emit browser-specific artifacts
- update version/release docs if packaging changes require it

Constraints:

- no source fork by browser
- no repo split

Deliverable:

- browser-specific build outputs from one codebase

## Slice 7: Gemini Provider Add

Status: Pending

Goal:

Add `Gemini` through the provider registry after platform foundation lands.

Tasks:

- add `Gemini` provider definition
- implement page detection
- implement provider extractor
- map output into normalized draft contracts
- verify no browser-layer changes are needed for provider addition

Deliverable:

- second provider proves registry architecture is real, not theoretical

## Recommended Execution Order

1. Slice 0
2. Slice 1
3. Slice 2
4. Slice 3
5. Slice 4
6. Slice 5
7. Slice 6
8. Slice 7

## Recommended First Coding Task

Start with Slice 1.

Why:

- lowest risk
- unlocks all later refactors
- lets current code keep running
- gives reviewable boundaries before file moves

## Definition Of Ready Per Slice

A slice is ready to implement when:

- inputs and outputs are named
- ownership by `app/core/platform/shared` is explicit
- forbidden imports are known
- backward-compatibility path is clear
- verification target is named

## Verification Expectations

After each slice:

- run targeted tests near touched modules first
- keep existing Chrome + ChatGPT happy path passing
- verify progress/error mapping did not regress
- update `docs/roadmap.md` and relevant baseline docs in same change set

## Immediate Next Step

Implement Slice 4 by moving current export-building flow toward `src/core`, with normalized draft/artifact handoff and minimal legacy translation kept only at migration edges.
