# Extension Platform Use Guide

Updated: 2026-05-15

This guide describes the extension as a black-box integration surface for future UI/runtime work. No external backend API exists.

## Implemented Runtime Interface

### Popup export flow

- Entry point: extension popup UI
- Auth: browser session already authenticated with provider site
- Input:
  - current active supported tab
  - chosen save destination or save strategy
- Success result:
  - export artifact persisted by the active browser strategy
- Failure classes:
  - `UNSUPPORTED_PAGE`
  - `PROVIDER_NOT_AVAILABLE`
  - `EXTRACTION_FAILED`
  - `CONTENT_SCRIPT_UNAVAILABLE`
  - `SAVE_STRATEGY_UNAVAILABLE`
  - `DIRECTORY_WRITE_FAILED`
  - `ARCHIVE_DOWNLOAD_FAILED`
  - `EXPORT_BUILD_FAILED`
  - `ASSET_FETCH_FAILED`

### Progress model

The UI/runtime progress contract should report these ordered states:

1. `detecting-provider`
2. `extracting-content`
3. `resolving-assets`
4. `building-artifact`
5. `saving-artifact`

## Planned Browser Contracts

- `BrowserApi`: privileged browser operations abstraction
- `BrowserCapabilities`: capability snapshot used for strategy resolution
- `SaveStrategy`: persist normalized artifact using browser-compatible behavior
- `SaveContext`: save request input and capability context
- `SaveResult`: final persisted output details

## Planned Provider Contracts

- `ProviderId`: stable provider key
- `ProviderDefinition`: provider registration metadata
- `ProviderRegistry`: provider lookup + resolution entrypoint
- `ProviderExtractor`: provider-specific content extraction boundary

## Implemented Gemini Extraction Notes

- Gemini extractor now accepts both stable provider containers and drifted `data-testid`/`data-test-id` message containers for user/model turns.
- Gemini model output preserves DOM order across paragraph, code, and image blocks for the covered fixture shapes.
- Real-page Gemini validation is still required before treating the extractor as production-stable.

## Planned Output Contract

The save layer should receive `NormalizedExportArtifact` rather than assuming direct folder write as the only persistence mode.

Temporary note:

- `FolderExportResult` may continue to exist during migration as an implementation detail.
