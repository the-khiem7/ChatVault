# Architecture

Updated: 2026-04-30

## Architecture Direction

The project is a Chrome Manifest V3 extension. It runs inside the user's real browser context instead of launching an automated browser.

This avoids:

- login automation
- cookie transfer
- 2FA handling
- Playwright automation fingerprint issues

## Recommended Project Structure

```txt
chatgpt-markdown-exporter/
|-- manifest.json
|-- package.json
|-- src/
|   |-- popup/
|   |   |-- popup.html
|   |   |-- popup.ts
|   |   `-- popup.css
|   |-- content/
|   |   |-- content.ts
|   |   |-- extractConversation.ts
|   |   |-- extractMessage.ts
|   |   |-- extractBlocks.ts
|   |   `-- domUtils.ts
|   |-- background/
|   |   `-- serviceWorker.ts
|   |-- export/
|   |   |-- markdownWriter.ts
|   |   |-- assetDownloader.ts
|   |   |-- zipWriter.ts
|   |   `-- slugify.ts
|   |-- types/
|   |   |-- conversation.ts
|   |   |-- message.ts
|   |   `-- asset.ts
|   `-- shared/
|       |-- constants.ts
|       `-- logger.ts
|-- public/
|   `-- icons/
`-- README.md
```

## Chrome Extension Components

### Manifest

Responsibilities:

- declare Manifest V3 metadata
- define action popup
- register content scripts
- register service worker
- declare permissions and host permissions

Required permissions:

- `activeTab`
- `scripting`
- `downloads`

Required host permissions:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

Avoid broad permissions such as `<all_urls>` unless a future requirement proves they are necessary.

### Popup

Responsibilities:

- show export button
- show current status
- trigger export
- show warnings and failure messages

The popup should stay minimal in MVP. It should not become a dashboard.

### Content Script

Responsibilities:

- run on ChatGPT pages
- inspect rendered DOM
- detect conversation title
- detect message containers
- extract role and content blocks
- collect asset references
- return structured conversation data

The content script owns DOM extraction because it has direct page access.

### Service Worker

Responsibilities:

- coordinate extension messages
- run ZIP/download workflow if needed
- use Chrome downloads API for final file download

Manifest V3 service workers are not persistent. Any state that must survive service worker shutdown should be serializable and recreated as needed.

### Export Modules

Responsibilities:

- convert structured conversation data to Markdown
- download or transform assets
- generate ZIP layout
- validate output before download

## Data Flow

```txt
Popup click
-> query active tab
-> send export request to content script
-> content script extracts ConversationExport
-> export modules create Markdown and asset list
-> ZIP writer builds archive
-> downloads API saves ZIP locally
-> popup reports success/warnings/failure
```

## Dependency Direction

Suggested dependency flow:

```txt
popup/background
-> content/export modules
-> shared/types
```

DOM-specific code should stay in `src/content/`. Markdown and ZIP generation should stay in `src/export/`.

## Implementation Notes

- Use TypeScript.
- Use Vite for build/dev ergonomics.
- Use JSZip for ZIP generation.
- Consider Turndown only as a fallback for HTML-to-Markdown conversion.
- Keep custom logic for role detection, asset replacement, code language preservation, and ChatGPT-specific DOM parsing.

