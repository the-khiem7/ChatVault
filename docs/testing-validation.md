# Testing and Validation

Updated: 2026-05-01

## Test Strategy

Use focused tests for pure modules and manual browser validation for extension runtime integration.

Pure modules to unit test:

- slug generation
- Markdown writer
- table conversion
- code block conversion
- folder export manifest generation
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
- File System Access API folder writing
- exported folder content

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

- User can choose an export folder before exporting.
- Export starts folder picker if no folder is selected.
- Export creates `<slug>/conversation.md`.
- Export creates `<slug>/assets/` when images exist.
- Written asset paths match Markdown references.
- `conversation.md` opens locally with resolved local images.
- Expired or missing folder permission asks the user to choose a folder again.
- Unsupported File System Access API states are visible and clear.
- Partial asset failures still write Markdown with remote fallback links and warnings.

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

## Media Extraction Diagnostic Script

Use this browser DevTools console script when image/media extraction stops working after a ChatGPT DOM change. It helps distinguish between:

- no `img` nodes in the rendered page
- images rendered outside detected message containers
- images wrapped in new parent structures
- image sources or attributes changing shape

Run it on the active ChatGPT conversation page:

```js
(() => {
  const imgs = [...document.querySelectorAll("img")];
  return {
    imgCount: imgs.length,
    samples: imgs.slice(0, 10).map((img) => {
      const chain = [];
      let node = img;
      for (let i = 0; node && i < 8; i++, node = node.parentElement) {
        chain.push({
          tag: node.tagName,
          testid: node.getAttribute?.("data-testid"),
          role: node.getAttribute?.("data-message-author-role"),
          aria: node.getAttribute?.("aria-label"),
          cls: node.className?.toString().slice(0, 120)
        });
      }
      return {
        src: img.getAttribute("src")?.slice(0, 160),
        alt: img.getAttribute("alt"),
        width: img.naturalWidth,
        height: img.naturalHeight,
        chain
      };
    })
  };
})();
```

Privacy note:

- Do not paste full image URLs into public logs or issues. ChatGPT image URLs may include signed tokens.
- The script truncates `src` values to reduce leakage, but review output before sharing.
- Prefer using the parent `chain` shape to write extractor fixtures and regression tests.

## Output Validation Checklist

Before considering MVP complete:

- conversation has title
- conversation has at least one message
- messages are ordered
- role headings exist
- Markdown is not empty
- code blocks are preserved
- image references match written assets or have warnings
- exported folder opens locally
- no external service receives content
- warnings are shown to the user
- implementation follows [architecture.md](architecture.md)
