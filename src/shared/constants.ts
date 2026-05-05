export const SUPPORTED_CHATGPT_HOSTS = new Set(["chatgpt.com", "chat.openai.com"]);
export const SUPPORTED_GEMINI_HOSTS = new Set(["gemini.google.com"]);

export const FALLBACK_CONVERSATION_TITLE = "Untitled AI Chat Conversation";

export function getPlatformFromHostname(hostname: string): "chatgpt" | "gemini" | "unknown" {
  if (SUPPORTED_CHATGPT_HOSTS.has(hostname)) return "chatgpt";
  if (SUPPORTED_GEMINI_HOSTS.has(hostname)) return "gemini";
  return "unknown";
}
