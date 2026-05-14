# Extension Platform Sourcecode Notes

Updated: 2026-05-15

## Observed Current Code

Current high-level source layout:

```mermaid
flowchart TD
  popup[`src/popup/*`]
  background[`src/background/serviceWorker.ts`]
  content[`src/content/*`]
  runtime[`src/runtime/*`]
  export[`src/export/*`]
  assets[`src/assets/*`]
  domain[`src/domain/*`]
  shared[`src/shared/*`]

  popup --> runtime
  runtime --> background
  runtime --> content
  runtime --> export
  export --> assets
  export --> domain
  runtime --> shared
```

Observed characteristics:

- Current code already separates popup, content, background, export, and shared logic.
- Current separation is useful but not yet expressed as platform/browser vs platform/provider boundaries.
- Export persistence is still modeled around folder export in the current Chrome path.

## Desired / Planned Code

Target boundary model:

```mermaid
flowchart TD
  app[`src/app`]
  core[`src/core`]
  browser[`src/platform/browser`]
  provider[`src/platform/provider`]
  shared[`src/shared`]

  app --> core
  app --> browser
  app --> provider
  app --> shared
  browser --> core
  browser --> shared
  provider --> core
  provider --> shared
  core --> shared
```

Forbidden dependencies:

- `platform/browser/*` -> `platform/provider/*`
- `platform/provider/*` -> `platform/browser/*`
- `core/*` -> browser/provider adapters

## Target Runtime Flow

```mermaid
sequenceDiagram
  participant Popup as popup
  participant Background as background
  participant Provider as provider runtime
  participant Core as core
  participant Save as browser save strategy

  Popup->>Popup: choose SaveStrategy
  Popup->>Background: request export
  Background->>Background: resolve provider
  Background->>Provider: extract conversation
  Provider-->>Background: NormalizedConversationDraft
  Background->>Core: build export artifact
  Core-->>Background: NormalizedExportArtifact
  Background-->>Popup: artifact + progress
  Popup->>Save: persist artifact
  Save-->>Popup: SaveResult
```

## Key Contracts To Land In Code

- Browser: `BrowserApi`, `BrowserCapabilities`, `SaveStrategy`, `SaveContext`, `SaveResult`
- Provider: `ProviderId`, `ProviderDefinition`, `ProviderRegistry`, `ProviderExtractor`
- Normalized: `NormalizedPageSummary`, `NormalizedConversationDraft`, `NormalizedExportArtifact`, `ExportProgress`, `ProviderStatus`

## Current Key Files

- `src/platform/provider/providerRegistry.ts`: active multi-provider registry for `chatgpt` and `gemini`
- `src/runtime/exportCurrentChat.ts`: current runtime export entry used by app orchestration
- `src/app/exportCurrentChatApp.ts`: application orchestration wrapper used by background
- `src/core/buildExportArtifact.ts`: current core-owned normalized artifact builder
- `src/content/extractors/extractConversation.ts`: shared ChatGPT-oriented extractor baseline
- `src/content/extractors/extractGeminiConversation.ts`: Gemini-specific extractor under active hardening
- `src/content/extractors/providerExtractors.ts`: provider dispatch for content extraction
- `src/platform/browser/manifest.ts`: browser-specific manifest generation for `Chrome` and `Firefox`
