# Privacy and Security

Updated: 2026-04-30

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

## Permission Boundary

Use the minimum permissions needed for MVP:

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

## Data Handling

Conversation content should exist only in:

- the active ChatGPT page DOM
- extension runtime memory during export
- the generated local ZIP file

Do not persist conversation content in Chrome extension storage unless a future feature requires it.

## Asset Handling

Asset fetches should only retrieve resources already referenced by the current ChatGPT page. Do not crawl unrelated URLs.

If an asset cannot be downloaded because of browser policy or network restrictions, keep the original remote reference only as a fallback and report a warning.

## Logging

Development logs must avoid printing full conversation content by default.

Allowed logs:

- counts
- status labels
- warning codes
- truncated diagnostic snippets when needed

Avoid logs containing:

- complete messages
- image URLs with sensitive tokens
- attachment URLs
- user-identifying content

