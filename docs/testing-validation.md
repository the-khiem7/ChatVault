# Testing and Validation

Updated: 2026-04-30

## Test Strategy

Use focused tests for pure modules and manual browser validation for extension runtime integration.

Pure modules to unit test:

- slug generation
- Markdown writer
- table conversion
- code block conversion
- archive manifest generation
- validation logic
- asset naming
- warning aggregation
- runtime message guards

DOM extractor tests:

- fixture-based DOM extraction
- role detection strategies
- fallback selector behavior
- image candidate extraction
- unknown block preservation

Runtime/manual validation:

- content script injection
- popup-to-service-worker messaging
- service-worker-to-content-script messaging
- active tab validation
- Chrome downloads behavior
- optional offscreen document wiring
- ZIP file content

## Architecture Boundary Tests

Add tests or static checks where practical:

- pure modules do not import `chrome`
- content extractors do not import popup/background modules
- domain types do not import runtime modules
- runtime messages are discriminated unions
- asset fetch requests require a candidate id and message/block ownership

These checks protect the project architecture from drifting back into a mixed runtime design.

## Milestone Acceptance Checks

### Milestone 1

- Extension loads in Chrome.
- Popup opens.
- Export button sends a request through the service worker.
- Service worker validates the active tab.
- Content script returns page title and URL.
- Popup shows the response.

### Milestone 2

- A simple text conversation exports to Markdown.
- Markdown includes title frontmatter.
- User and assistant sections are in source order.
- Output is not empty.
- Extraction output uses `ConversationDraft`.

### Milestone 3

- Code blocks remain fenced.
- Lists remain lists.
- Tables are converted to Markdown tables where possible.
- Quotes remain visibly quoted.
- Unknown blocks preserve visible text with warnings.

### Milestone 4

- Visible images are detected as asset candidates.
- Downloadable images are stored under `assets/`.
- Markdown uses local asset paths.
- Failed image downloads produce warnings.
- Extension does not fetch arbitrary URLs supplied outside asset candidates.

### Milestone 5

- ZIP contains `<slug>/conversation.md`.
- ZIP contains `<slug>/assets/` when images exist.
- ZIP filename is `chatgpt-export-<slug>.zip`.
- ZIP asset paths match Markdown references.
- Download is initiated through the extension runtime.

### Milestone 6

- Unsupported pages show a clear error.
- DOM extraction fallback paths are exercised.
- Service worker restart or popup close does not produce silent bad output.
- Partial failures do not silently produce incomplete exports.

## Manual QA Conversations

Maintain test conversations covering:

- plain text only
- long multi-turn conversation
- TypeScript code blocks
- nested bullet and numbered lists
- Markdown table
- uploaded image
- generated image
- math text or LaTeX
- attachment-like link
- failed or blocked image URL

## Output Validation Checklist

Before considering MVP complete:

- conversation has title
- conversation has at least one message
- messages are ordered
- role headings exist
- Markdown is not empty
- code blocks are preserved
- image references match ZIP assets or have warnings
- ZIP opens locally
- no external service receives content
- warnings are shown to the user
- implementation follows [architecture.md](architecture.md)

