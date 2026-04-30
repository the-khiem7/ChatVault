# Extraction Strategy

Updated: 2026-04-30

## Principle

Extract what is already rendered in the user's real ChatGPT page. Do not call external APIs and do not automate login.

The DOM may change over time, so extraction must be layered and modular.

## Message Container Detection

Do not depend on a single fragile selector such as `div:nth-child(4)`.

Use a strategy list:

```ts
const messageContainerStrategies = [
  findByDataTestId,
  findByArticleNodes,
  findByConversationTurnPattern,
  findByRoleLabels,
  findByFallbackVisibleTextBlocks
];
```

Recommended priority:

1. semantic attributes or `data-testid`
2. article/message-like nodes
3. role labels
4. repeated conversation turn patterns
5. fallback visible text extraction

Each strategy should return structured candidates and confidence, not just raw nodes.

## Role Detection

Role detection should use layered signals:

- explicit labels such as user/assistant
- known ChatGPT DOM structure
- position and repeated turn layout
- fallback heuristics

If role cannot be detected reliably, use `unknown` and emit a warning.

## Block Extraction Rules

### Text

Preserve paragraphs and meaningful line breaks.

### Code

Preserve fenced code blocks:

```md
```ts
const hello = "world";
```
```

If language cannot be detected, use a plain fence.

### Lists

Preserve unordered and ordered lists:

```md
- item
- item
```

```md
1. item
2. item
```

### Tables

If the source is a DOM table, convert it to Markdown table syntax.

If conversion fails, preserve the visible table text and emit a warning.

### Quotes

Preserve blockquote structure where visible.

### Math

If math is visible as text or LaTeX, preserve it as text. Perfect math reconstruction is not required for MVP.

### Images

Insert image references where they appear in the message:

```md
![](assets/001.png)
```

### Unknown Blocks

Unknown block types should preserve visible text. They should not silently disappear.

## Asset Handling

Goal:

```md
![](assets/001.png)
```

Avoid remote-only output when possible:

```md
![](https://remote-cdn-url/image.png)
```

Asset strategy:

1. read image `src` from DOM
2. fetch image binary if browser policy allows
3. convert blob/data URL into a file
4. if remote fetch fails, keep remote URL as fallback and mark warning

Asset naming:

```txt
001.png
002.jpg
003.webp
```

## Warnings

Extraction should report warnings for:

- no conversation title detected
- no messages detected
- unknown role
- unsupported block type
- table conversion fallback
- image download failure
- remote asset fallback

Warnings should be visible in the popup after export.

