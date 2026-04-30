# Privacy and Security

Updated: 2026-05-01

## Privacy Principle

This extension handles private user conversations. All processing must stay local in the browser.

Rules:

- no external server
- no telemetry
- no analytics
- no remote upload
- no third-party API calls
- no OpenAI API usage
- no cloud sync in MVP

## Runtime Trust Boundary

Treat the ChatGPT page as readable but not trusted input.

The extension may read visible DOM content from supported ChatGPT hosts, but it must not allow the page to control privileged extension behavior.

Rules:

- Content script extracts structured data.
- Service worker validates requests and active tab origin.
- Extension runtime fetches only policy-approved asset candidates.
- Runtime messages use explicit discriminated types.
- No page-provided URL may be fetched until it passes asset policy checks.

## Permission Boundary

Baseline permissions:

```json
{
  "permissions": ["activeTab", "scripting", "downloads"],
  "host_permissions": [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*"
  ]
}
```

Avoid:

```txt
<all_urls>
```

unless a future requirement explicitly requires it and the decision is recorded in [decisions.md](decisions.md).

Add:

```txt
offscreen
```

only if the project implements an offscreen document for a concrete runtime need.

## Data Handling

Conversation content should exist only in:

- the active ChatGPT page DOM
- extension runtime memory during export
- the generated local export folder selected by the user

Do not persist conversation content in Chrome extension storage unless a future feature requires it and a decision is recorded.

If temporary state is needed for MV3 lifecycle resilience, store only operational metadata where possible:

- job id
- status
- warning codes
- non-sensitive filenames

Avoid storing full message content or asset URLs with sensitive tokens.

## Asset Handling

Asset fetches should only retrieve resources already referenced by visible conversation DOM.

Asset fetch policy:

- accept data/blob URLs derived from message content
- accept HTTPS URLs from extracted image/attachment candidates
- reject unsupported schemes by default
- reject URLs not tied to a message/block id
- report remote fallback instead of broadening permissions silently

If an asset cannot be downloaded because of browser policy or network restrictions, keep the original remote reference only as a fallback and report a warning.

## Logging

Development logs must avoid printing full conversation content by default.

Allowed logs:

- counts
- status labels
- warning codes
- runtime context names
- truncated diagnostic snippets when needed

Avoid logs containing:

- complete messages
- image URLs with sensitive tokens
- attachment URLs
- user-identifying content

## External References

- Chrome content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- Chrome cross-origin network requests: https://developer.chrome.com/docs/extensions/develop/concepts/network-requests
- Chrome MV3 service worker migration: https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
