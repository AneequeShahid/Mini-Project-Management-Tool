/**
 * Input validation and safety guardrails for the AI Agents.
 */
export const MAX_PROMPT_LENGTH = 2000;
export const MIN_PROMPT_LENGTH = 3;

export function validatePrompt(text: string): { isValid: boolean; error: string } {
  if (!text || !text.trim()) {
    return { isValid: false, error: "Message cannot be empty" };
  }

  if (text.trim().length < MIN_PROMPT_LENGTH) {
    return { isValid: false, error: `Message too short (minimum ${MIN_PROMPT_LENGTH} characters)` };
  }

  if (text.length > MAX_PROMPT_LENGTH) {
    return { isValid: false, error: `Message too long (maximum ${MAX_PROMPT_LENGTH} characters)` };
  }

  return { isValid: true, error: "" };
}

export function sanitizePrompt(text: string): string {
  // Remove null bytes
  let sanitized = text.replace(/\x00/g, '');
  return sanitized.trim();
}
