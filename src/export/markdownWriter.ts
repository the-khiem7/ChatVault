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
  const effectiveLanguage = language ?? (isSqlLikeLine(text.trim()) ? "sql" : undefined);
  const formattedText = effectiveLanguage === "sql" ? normalizeSqlLine(text) : text;
  const fence = formattedText.includes("```") ? "````" : "```";
  return `${fence}${effectiveLanguage ?? ""}\n${formattedText}\n${fence}`;
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
    .replace(/;\s*(?=(SELECT|CREATE|DROP|ALTER|WITH|INSERT|UPDATE|DELETE)\b)/gi, ";\n")
    .replace(/CATALOGDATABASE/gi, "CATALOG\nDATABASE")
    .replace(/\s*(FROM DATA CATALOG|GROUP BY|ORDER BY|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|WHERE|HAVING|LIMIT|JOIN|FROM|ON|AND|OR|IAM_ROLE|REGION)\b/gi, "\n$1")
    .replace(/\n(AND|OR)\b/gi, "\n  $1")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\n\s+/g, "\n");
}
