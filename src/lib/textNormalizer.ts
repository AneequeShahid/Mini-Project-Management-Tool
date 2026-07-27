/**
 * Text normalization utility tailored for cleaning up AI-generated task descriptions
 * and formatting user inputs.
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  
  // Lowercase and strip whitespace
  let normalized = text.trim();
  
  // Normalize line endings
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Collapse multiple empty lines into a single one
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  return normalized;
}
