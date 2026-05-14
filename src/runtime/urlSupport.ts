import { SUPPORTED_CHATGPT_HOSTS, SUPPORTED_GEMINI_HOSTS } from "../shared/constants";

export function isSupportedChatGptUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && SUPPORTED_CHATGPT_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function isSupportedGeminiUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && SUPPORTED_GEMINI_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}
