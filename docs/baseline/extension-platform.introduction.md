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
