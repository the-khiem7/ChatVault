# Testing and Validation

Updated: 2026-04-30

## Test Strategy

Use focused tests for pure modules and manual browser validation for extension integration.

Pure modules to unit test:

- slug generation
- Markdown writer
- table conversion
- code block conversion
- validation logic
- asset naming

Browser/manual validation:

- content script injection
- popup-to-content message passing
- ChatGPT DOM extraction
- Chrome downloads behavior
- ZIP file content

## Milestone Acceptance Checks

### Milestone 1

- Extension loads in Chrome.
- Popup opens.
- Export button sends a message to content script.
- Content script returns page title and URL.

### Milestone 2

- A simple text conversation exports to Markdown.
- Markdown includes title frontmatter.
- User and assistant sections are in source order.
- Output is not empty.

### Milestone 3

- Code blocks remain fenced.
- Lists remain lists.
- Tables are converted to Markdown tables where possible.
- Quotes remain visibly quoted.

### Milestone 4

- Visible images are detected.
- Downloadable images are stored under `assets/`.
- Markdown uses local asset paths.
- Failed image downloads produce warnings.

### Milestone 5

- ZIP contains `<slug>/conversation.md`.
- ZIP contains `<slug>/assets/` when images exist.
- ZIP filename is `chatgpt-export-<slug>.zip`.

### Milestone 6

- Unsupported pages show a clear error.
- DOM extraction fallback paths are exercised.
- Partial failures do not silently produce bad exports.

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
- failed or blocked image URL

## Output Validation Checklist

Before considering MVP complete:

- conversation has title
- conversation has at least one message
- messages are ordered
- role headings exist
- Markdown is not empty
- code blocks are preserved
- image references match ZIP assets
- ZIP opens locally
- no external service receives content

