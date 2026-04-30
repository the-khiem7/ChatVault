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
        lines.push(normalizeContentHeadings(block.text), "");
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
