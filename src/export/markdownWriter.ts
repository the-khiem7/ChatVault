import type { ConversationDraft, MessageRole } from "../domain/conversation";

export function writeMarkdown(draft: ConversationDraft): string {
  const lines = [
    "---",
    `title: "${escapeYamlString(draft.title)}"`,
    'source: "chatgpt"',
    `sourceUrl: "${escapeYamlString(draft.sourceUrl)}"`,
    `exportedAt: "${escapeYamlString(draft.extractedAt)}"`,
    "---",
    "",
    `## ${draft.title}`,
    ""
  ];

  for (const message of draft.messages) {
    lines.push(`# ${formatRole(message.role)}`, "");

    for (const block of message.blocks) {
      if (block.kind === "code") {
        lines.push(formatCodeBlock(block.text, block.language), "");
      } else {
        lines.push(formatParagraphBlock(block.text), "");
      }
    }
  }

  return lines.join("\n");
}

function formatRole(role: MessageRole): string {
  if (role === "user") {
    return "User";
  }
  if (role === "assistant") {
    return "Assistant";
  }
  if (role === "system") {
    return "System";
  }
  return "Unknown";
}

function escapeYamlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeContentHeadings(value: string): string {
  return value.replace(/^#{1,6}\s+(.+)$/gm, "## $1");
}

function formatCodeBlock(text: string, language: string | undefined): string {
  const fence = text.includes("```") ? "````" : "```";
  return `${fence}${language ?? ""}\n${text}\n${fence}`;
}

function formatParagraphBlock(text: string): string {
  const normalized = normalizeContentHeadings(text);
  const parts = normalized.split(/\n{2,}/);

  return parts
    .map((part) => {
      const trimmed = part.trim();
      if (isSqlLikeLine(trimmed)) {
        return formatCodeBlock(normalizeSqlLine(trimmed), "sql");
      }
      return part;
    })
    .join("\n\n");
}

function isSqlLikeLine(value: string): boolean {
  return /^(SELECT|CREATE|DROP|ALTER|WITH|INSERT|UPDATE|DELETE)\b/i.test(value);
}

function normalizeSqlLine(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*(FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|ON|AND|OR|IAM_ROLE|REGION|DATABASE)\b/gi, "\n$1")
    .replace(/\n(AND|OR)\b/gi, "\n  $1")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\n\s+/g, "\n");
}
